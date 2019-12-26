/**
 * Created by Szane on 17/6/29.
 */
const common = require('../../util/CommonUtil');
const GLBConfig = require('../../util/GLBConfig');
const logger = require('../../util/Logger').createLogger('MBDesignSRV');
const model = require('../../model');
const Sequence = require('../../util/Sequence');

const sequelize = model.sequelize;
const tb_upload_file = model.erc_uploadfile;
const tb_order = model.erc_order;
const tb_checkflow = model.erc_checkflow;
const tb_checkmessage = model.erc_checkmessage;
const tb_orderworkflow = model.erc_orderworkflow;
const tb_vr = model.erc_vrinfo;
const tb_history = model.erc_history;
const tb_orderdesign = model.erc_orderdesign;
const tb_orderrequire = model.erc_orderrequire;
const tb_govrinfo = model.erc_govrinfo;
const tb_uploadfile = model.erc_uploadfile;



exports.MBDesignResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {} else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'check') {
        checkAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};
let searchAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let resData = {};

        let order = await tb_order.findOne({
            where: {
                order_id:doc.order_id
            }
        })
        //团单获取设计图片
        if (order.order_type === '7') {
            let api_name = 'ERCROOMTYPEDETAILCONTROL'; //户型详情的设计图

            let files = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
                    srv_id: order.roomtype_id,
                    state: GLBConfig.ENABLE
                }
            });

            let vrs = await tb_govrinfo.findAll({
                where: {
                    roomtype_id: order.roomtype_id,
                    state: GLBConfig.ENABLE
                }
            });
            resData.designImgs = files;
            resData.vrs = vrs ? vrs : [];
            common.sendData(res, resData);
        } else {
        //个单获取设计文件
            let queryStr = `select uf.* from tbl_erc_orderdesign od 
            left join tbl_erc_uploadfile uf 
            on od.order_id = uf.order_id and od.require_type = uf.srv_type and od.design_id = uf.srv_id
            left join tbl_erc_orderrequire ore
            on od.require_id = ore.require_id
            where od.order_id = ? and uf.state = 1 and uf.api_name = 'ERCORDERDETAILCONTROL' and uf.srv_type = 1 and ore.require_hidden = '1' `

            let replacements = [doc.order_id];
            let designFiles = await sequelize.query(queryStr, {
                replacements: replacements,
                type: sequelize.QueryTypes.SELECT
            });

            resData.designImgs = [];
            resData.designFiles = [];
            for (let design of designFiles) {
                if (design.file_name) {
                    let type = design.file_name.substr(design.file_name.lastIndexOf(".") + 1).toLowerCase();
                    if (type === 'jpg' || type === 'png' || type === 'jpeg') {
                        resData.designImgs.push(design);
                    } else {
                        resData.designFiles.push(design);
                    }
                }
            }

            resData.vrs = await tb_orderdesign.findAll({
                where: {
                    order_id: doc.order_id,
                    require_type: '2',
                    state: GLBConfig.ENABLE
                }
            });
            common.sendData(res, resData);
        }
    } catch (error) {
        common.sendFault(res, error);
    }
};

let checkAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body), user = req.user,resData = {};
        let order = await tb_order.findOne({
            where: {
                order_id: doc.order_id
            }
        });

        if (!order) {
            return common.sendError(res, 'orderdetail_01')
        }

        let cf = await tb_checkflow.findOne({
            where: {
                order_id: order.order_id,
                check_type: 'DEGSIGN',
                check_state: '0',
                check_owner: '1',
                state: GLBConfig.ENABLE
            }
        });
        if (!cf) {
            return common.sendError(res, 'check_01');
        }

        if (doc.check_state === '1') // CHECKSTATEINFO
        {
            await tb_orderworkflow.destroy({
                where: {
                    order_id: order.order_id,
                    orderworkflow_state: 'DESIGNCHECKING'
                }
            })
            await tb_orderworkflow.destroy({
                where: {
                    order_id: order.order_id,
                    orderworkflow_state: 'DESIGNCUSTOMERCHECKING'
                }
            })

            await tb_history.create({
                order_id: order.order_id,
                order_state: 'DESIGNCUSTOMERCHECKING',
                history_event: '客户设计审核',
                history_content: '驳回',
                operator_name: user.name
            })
            order.order_state = 'DESIGNING'
            await order.save()
        } else if (doc.check_state === '2') {
            order.order_state = 'DESIGNCHECKDONE'
            await order.save()
            await tb_orderworkflow.create({
                order_id: order.order_id,
                orderworkflow_state: 'DESIGNCHECKDONE',
                orderworkflow_desc: '设计审核完成'
            })

            await tb_history.create({
                order_id: order.order_id,
                order_state: 'DESIGNCUSTOMERCHECKING',
                history_event: '客户设计审核',
                history_content: '通过',
                operator_name: user.name
            })
        } else {
            return common.sendError(res, 'orderdetail_04')
        }

        cf.check_state = doc.check_state
        cf.operater_id = user.user_id
        cf.operater_name = user.name
        await cf.save()

        let addCm = await tb_checkmessage.create({
            check_id: cf.check_id,
            order_id: cf.order_id,
            check_message: doc.check_message,
            check_state: cf.check_state,
            checker_id: cf.checker_id,
            checker_name: cf.checker_name,
            check_owner: cf.check_owner,
            check_type: cf.check_type,
            operater_id: cf.operater_id,
            operater_name: cf.operater_name
        });

        let retData = JSON.parse(JSON.stringify(addCm));
        retData.created_time = addCm.created_at.Format("yyyy-MM-dd hh:mm")

        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
