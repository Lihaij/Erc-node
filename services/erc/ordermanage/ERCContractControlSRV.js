const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCContractControlSRV');
const model = require('../../../model');

const sequelize = model.sequelize;
const tb_user = model.common_user;
const tb_uploadfile = model.erc_uploadfile;
const tb_order = model.erc_order;
const tb_orderworkflow = model.erc_orderworkflow;
const tb_orderrequire = model.erc_orderrequire;
const tb_erc_orderreview = model.erc_orderreview;
const tb_receivables = model.erc_receivables;
const tb_history = model.erc_history;

// 初始化基础数据
exports.initAct = async (req, res) => {
    let doc = common.docTrim(req.body),
        user = req.user
    let returnData = {
        payTypeInfo: GLBConfig.PAYTYPE,
        receivablesTypeInfo: GLBConfig.RECEIVABLESTYPE
    };

    let queryStr = 'select t.*,ut.`name` as contract_operator_name from tbl_erc_order t ' +
        'left join tbl_common_user ut on t.contract_operator = ut.user_id where t.order_id=?';

    let replacements = [doc.order_id];
    let queryRst = await sequelize.query(queryStr, {
        replacements: replacements,
        type: sequelize.QueryTypes.SELECT
    })
    returnData.orderInfo = [];
    for (let r of queryRst) {
        let result = JSON.parse(JSON.stringify(r));
        if (r.break_date) {
            result.break_date = r.break_date.Format("yyyy-MM-dd");
        }
        if (r.contract_date) {
            result.contract_date = r.contract_date.Format("yyyy-MM-dd");
        }
        for (let m of GLBConfig.PAYTYPE) {
            if (r.pay_kind == m.id) {
                result.pay_kind = m.text;
            }

        }
        returnData.orderInfo.push(result)
    }

    let opers = await tb_user.findAll({
        where: {
            domain_id: user.domain_id,
            user_type: GLBConfig.TYPE_OPERATOR,
            state: GLBConfig.ENABLE
        }
    })

    returnData.opersInfo = [];
    for (let o of opers) {
        returnData.opersInfo.push({
            'id': o.user_id,
            'text': o.name
        })
    }

    common.sendData(res, returnData)
}
// 查询上传文件信息
exports.searchAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let returnData = [];

        let queryStr = 'select * from tbl_erc_uploadfile t where t.api_name="ERCORDERDETAILCONTROL" and t.srv_type = ? and t.state=1 and t.order_id=?';

        let replacements = ['2',doc.order_id];
        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        })
        for (let r of queryRst) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_time = r.created_at.Format("yyyy-MM-dd");
            if (r.file_visible == 1) {
                result.file_visible = '可见'
            } else {
                result.file_visible = '不可见'
            }

            returnData.push(result)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 修改订单合同
exports.modifyAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let order = await tb_order.findOne({
            where: {
                order_id: doc.order_id
            }
        });

        if (!order) {
            common.sendError(res, 'orderdetail_01');
            return
        }
        order.pay_kind = doc.pay_kind;
        order.contract_remark = doc.contract_remark;
        order.contract_no = doc.contract_no;
        order.break_date = doc.break_date;
        order.order_deposit = doc.order_deposit;
        order.progress_payment = doc.progress_payment;
        order.final_payment = doc.final_payment;
        order.contract_operator = user.user_id;//经办人
        order.contract_date = new Date()//创建日期


        await tb_orderworkflow.create({
            order_id: order.order_id,
            orderworkflow_state: 'REVIEWING',
            orderworkflow_desc: '订单审核'
        })

        await tb_history.create({
            order_id: order.order_id,
            order_state: 'REVIEWING',
            history_event: '订单详情',
            history_content: '订单审核',
            operator_name: user.name
        })

        let requires = await tb_orderrequire.findAll({
            where: {
                type_id: '4',
                domain_id: user.domain_id,
                state: GLBConfig.ENABLE
            }
        });

        if (requires.length > 0) {
            order.order_state = 'REVIEWING';
            for (let r of requires) {
                let result = await tb_erc_orderreview.create({
                    order_id: order.order_id,
                    require_id: r.require_id,
                    review_status: '1'
                });
            }

            // await tb_orderworkflow.create({
            //     order_id: order.order_id,
            //     orderworkflow_state: 'WORKING',
            //     orderworkflow_desc: '施工中'
            // });
            //
            // await tb_history.create({
            //     order_id: order.order_id,
            //     order_state: 'WORKING',
            //     history_event: '订单详情',
            //     history_content: '施工中',
            //     operator_name: user.name
            // })
        } else {
            // order.order_state = 'WORKING';
        }

        await order.save()

        common.sendData(res)

    } catch (error) {
        return common.sendFault(res, error)
    }
}

// 保存合同
exports.saveContractmodifyAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let order = await tb_order.findOne({
            where: {
                order_id: doc.order_id
            }
        });

        if (!order) {
            common.sendError(res, 'orderdetail_01');
            return
        }
        order.contract_remark = doc.contract_remark;
        order.contract_no = doc.contract_no;
        order.break_date = doc.break_date;
        order.order_deposit = doc.order_deposit;
        order.progress_payment = doc.progress_payment;
        order.final_payment = doc.final_payment;
        order.contract_operator = user.user_id;//经办人
        order.contract_date = new Date()//创建日期
        await order.save()

        common.sendData(res)

    } catch (error) {
        return common.sendFault(res, error)
    }
}
// 增加合同文件
exports.addFileAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let fileUrl = await common.fileMove(doc.file_url, 'upload')
        let addFile = await tb_uploadfile.create({
            api_name: common.getApiName(req.path),
            order_id: doc.order_id,
            user_id: doc.user_id,
            file_name: doc.file_name,
            file_url: fileUrl,
            file_type: doc.file_type,
            file_visible: doc.file_visible,
            file_creator: doc.user_name,
            srv_type: '2'
        });
        let retData = JSON.parse(JSON.stringify(addFile));
        retData.created_time = addFile.created_at.Format("yyyy-MM-dd")
        common.sendData(res, retData);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
// 修改合同文件
exports.modifyFileAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let modifyFile = await tb_uploadfile.findOne({
            where: {
                file_id: doc.old.file_id
            }
        });
        if (modifyFile) {
            modifyFile.file_content = doc.new.file_content;
            modifyFile.file_visible = doc.new.file_visible;
            await modifyFile.save()
        } else {
            common.sendError(res, 'file_01');
            return
        }
        let retData = JSON.parse(JSON.stringify(modifyFile));
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error)
    }
};
// 删除文件
exports.deleteAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let delFile = await tb_uploadfile.findOne({
            where: {
                file_id: doc.file_id,
                state: GLBConfig.ENABLE
            }
        });
        if (delFile) {
            delFile.state = GLBConfig.DISABLE;
            await delFile.save();
            return common.sendData(res);
        } else {
            return common.sendError(res, 'contract_01');
        }

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
// 增加票据
exports.receivablesAdd = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let newReceivables = await tb_receivables.create({
            order_id: doc.order_id,
            receivables_amount: doc.receivables_amount,
            receivables_type: doc.receivables_type,
            receivables_operator_id: doc.receivables_operator_id,
            receivables_pay_type: doc.receivables_pay_type
        });
        let retData = JSON.parse(JSON.stringify(newReceivables));
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 查询票据
exports.receivablesSearch = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let results = await tb_receivables.findAll({
            where: {
                order_id: doc.order_id,
                state: GLBConfig.ENABLE
            }
        });
        let retData = [];
        for (let r of results) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.created_at ? r.created_at.Format("yyyy-MM-dd") : null;
            retData.push(result)
        }
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 修改票据
exports.receivablesModify = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let modify = await tb_receivables.findOne({
            where: {
                receivables_id: doc.new.receivables_id
            }
        });
        if (modify) {
            modify.receivables_amount = doc.new.receivables_amount;
            modify.receivables_type = doc.new.receivables_type;
            modify.receivables_operator_id = doc.new.receivables_operator_id;
            modify.receivables_pay_type = doc.new.receivables_pay_type;
            await modify.save();
        } else {
            common.sendError(res, 'receivables_01');
            return
        }
        let retData = JSON.parse(JSON.stringify(modify));
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 删除票据
exports.receivablesDelete = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let del = await tb_receivables.findOne({
            where: {
                receivables_id: doc.receivables_id,
                state: GLBConfig.ENABLE
            }
        });
        if (del) {
            del.state = GLBConfig.DISABLE;
            await del.save();
            return common.sendData(res);
        } else {
            return common.sendError(res, 'receivables_01');
        }
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
