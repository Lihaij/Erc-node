/**
 * Created by Szane on 17/5/25.
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCGOrderDetailControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const UserBL = require('../../../bl/UserBL');

const sequelize = model.sequelize;
const tb_order = model.erc_order;
const tb_orderroom = model.erc_orderroom;
const tb_orderworkflow = model.erc_orderworkflow;
const tb_staff = model.erc_staff;
const tb_roomtype = model.erc_roomtype;
const tb_uploadfile = model.erc_uploadfile;
const tb_template = model.erc_template;
const tb_measure = model.erc_measure;
const tb_vr = model.erc_vrinfo;
const tb_checkflow = model.erc_checkflow;
const tb_checkmessage = model.erc_checkmessage;
const tb_gantttasks = model.erc_gantttasks;
const tb_consNode = model.erc_constructionnode;
const tb_user = model.common_user;
const tb_history = model.erc_history;
const tb_govrinfo = model.erc_govrinfo;
const tb_orderacceptance = model.erc_orderacceptance;
const tb_thirdsignuser = model.erc_thirdsignuser;

exports.ERCGOrderDetailControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search_order') {
        searchOrderAct(req, res)
    } else if (method === 'saveOrder') {
        saveOrderAct(req, res)
    } else if (method === 'search_design') { //设计文档及vr
        searchDesignAct(req, res)
    } else if (method === 'search_material') { //物料清单
        searchMaterilalAct(req, res)
    } else if (method === 'getCustomer') {
        getCustomer(req, res)
    } else if (method === 'relationOrder') {
        relationOrder(req, res)
    } else if (method === 'search_acceptance') { //验收清单
        searchAcceptanceAct(req, res)
    } else if (method === 'acceptance_detail') {
        acceptanceDetailAct(req, res)
    } else if (method === 'acceptance_check') {
        checkAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};
// 初始化基础数据
let initAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {
            roomTypeInfo: GLBConfig.ROOMTYPE,
            orderTypeInfo: GLBConfig.OTYPEINFO,
            orderStateInfo: GLBConfig.ORDERSTATEINFO,
            roleInfo: GLBConfig.TYPE_STAFF,
            tfInfo: GLBConfig.TFINFO,
            materialTypeInfo: GLBConfig.MATERIELTYPE, //物料分类
            unitInfo: await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'), //单位
            purchaseTypeInfo: GLBConfig.PURCHASESTATE, //采购状态
            materielSourceInfo: GLBConfig.MATERIELSOURCE, //物料来源
            stateTypeInfo: GLBConfig.ACCEPTANCESTATEINFO,
            materielProcedure : GLBConfig.MATERIELPROCEDURE,//工序
            materielAmto : GLBConfig.MATERIELAMTO//是否是定制品
        };

        let queryStrf = 'select u.* from tbl_erc_domainsignworker d left join tbl_common_user u on d.user_id = u.user_id where d.state =1 and d.domain_id = ?';
        let replacementsf = [user.domain_id];
        let resultf = await sequelize.query(queryStrf, {
            replacements: replacementsf,
            type: sequelize.QueryTypes.SELECT
        });
        logger.info(resultf)
        returnData.foremanf = [];
        for (let t of resultf) {
            returnData.foremanf.push({
                id: t.user_id,
                value: t.user_id,
                text: t.name
            })
        }


        let gantttasks = await tb_gantttasks.findAll({
            where: {
                order_id: doc.order_id,
                state: GLBConfig.ENABLE,
            }
        });
        returnData.nodesInfo = [];
        for (let n of gantttasks) {
            returnData.nodesInfo.push({
                id: n.node_id,
                value: n.text,
                text: n.text
            })
        }

        let roomIds = await tb_orderroom.findAll({
            where: {
                state: GLBConfig.ENABLE,
                order_id: doc.order_id
            }
        });
        returnData.roomIdInfo = [];
        for (let r of roomIds) {
            returnData.roomIdInfo.push({
                id: r.room_id,
                value: r.room_name,
                text: r.room_name
            })
        }

        // employees
        let employees = await tb_user.findAll({
            where: {
                domain_id: user.domain_id,
                user_type: {
                    $in: [GLBConfig.TYPE_OPERATOR, GLBConfig.TYPE_SUPERVISION]
                },
                state: GLBConfig.ENABLE
            }
        });
        returnData.employeeInfo = [];
        for (let e of employees) {
            returnData.employeeInfo.push({
                id: e.user_id,
                text: e.name,
                phone: user.phone
            })
        }
        let supervision = await UserBL.getSpecialGroupUser(user.domain_id, GLBConfig.TYPE_SUPERVISION);
        returnData.supervision = [];
        for (let s of supervision) {
            returnData.supervision.push({
                id: s.user_id,
                text: s.name
            });
        }
        let foreman = await UserBL.getTypeUser(user.domain_id, GLBConfig.TYPE_FOREMAN);
        returnData.foreman = [];
        for (let f of foreman) {
            returnData.foreman.push({
                id: f.user_id,
                text: f.name
            });
        }

        let result = await tb_thirdsignuser.findOne({where: {user_id: req.user.user_id}});
        returnData.thirdUser = !!result;
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
// 查询大客户订单
let searchOrderAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;

        let queryRst = await sequelize.query(`
          select *,b.username from tbl_erc_order a
          left join tbl_common_user b on (a.user_id = b.user_id)
          left join tbl_erc_roomtype c on (a.roomtype_id = c.roomtype_id)
          left join tbl_erc_estate d on (a.estate_id = d.estate_id)
          where a.order_id = ?
          `, {
            replacements: [doc.order_id],
            type: sequelize.QueryTypes.SELECT
        });
        if (queryRst.length<=0) {
            common.sendError(res, 'order_02');
            return
        }
        let retData = JSON.parse(JSON.stringify(queryRst[0]));
        delete retData.password;

        let orderworkflow = await tb_orderworkflow.findAll({
            where: {
                order_id: retData.order_id
            }
        });

        retData.statedict = {};
        for (let owf of orderworkflow) {
            retData.statedict[owf.orderworkflow_state] = owf.created_at.Format("yyyy-MM-dd")
        }

        // rooms
        let rooms = await tb_orderroom.findAll({
            where: {
                order_id: retData.order_id
            }
        });
        retData.roomsInfo = [];
        for (let r of rooms) {
            let row = JSON.parse(JSON.stringify(r));
            row.id = r.room_id
            row.text = r.room_name
            retData.roomsInfo.push(row)
        }

        retData.staffInfo = [];
        let staffStr = `select s.*,u.name from tbl_erc_staff s,tbl_common_user u
      where s.order_id = ? and u.user_id = s.user_id `;
        let staffReplacements = [doc.order_id];
        let staffRst = await sequelize.query(staffStr, {
            replacements: staffReplacements,
            type: sequelize.QueryTypes.SELECT
        })

        for (let s of staffRst) {
            retData.staffInfo.push(s)
        }

        let supervision = await UserBL.getEstateSpecialGroupUser(user.domain_id, GLBConfig.TYPE_SUPERVISION, retData.estate_id)
        retData.supervisionInfo = [];
        for (let s of supervision) {
            retData.supervisionInfo.push({
                id: s.user_id,
                value: s.name,
                text: s.name
            })
        }

        let queryStr = 'select u.* from tbl_erc_domainsignworker d left join tbl_common_user u on d.user_id = u.user_id where d.state =1 and d.domain_id = ?';
        let replacement = [user.domain_id];
        let signWorkers = await sequelize.query(queryStr, {
            replacements: replacement,
            type: sequelize.QueryTypes.SELECT
        });
        retData.superforemanInfo = [];
        for (let s of signWorkers) {
            retData.superforemanInfo.push({
                id: s.user_id,
                value: s.user_id,
                text: s.name
            })
        }

        common.sendData(res, retData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
// 保存订单
let saveOrderAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;

        let order = await tb_order.findOne({
            where: {
                order_id: doc.order_id,
                state: GLBConfig.ENABLE
            }
        });

        let suser = await tb_user.findOne({
            where: {
                user_id: doc.order_supervision,
                state: GLBConfig.ENABLE
            }
        });

        let foreman = await tb_user.findOne({
            where: {
                user_id: doc.order_foreman,
                state: GLBConfig.ENABLE
            }
        });
        if (foreman) {
            let staff = await tb_staff.findOne({
                where: {
                    order_id: doc.order_id,
                    staff_type: '2', //TYPE_STAFF
                    state: GLBConfig.ENABLE
                }
            });

            if (staff) {
                staff.user_id = doc.order_foreman;
                await staff.save();
            } else {
                await tb_staff.create({
                    order_id: doc.order_id,
                    staff_type: '2',
                    user_id: doc.order_foreman,
                    staff_phone: foreman.phone
                });
            }
            order.order_foreman = doc.order_foreman;
            await order.save()
            common.sendData(res);
        }

        if (suser) {
            let staff = await tb_staff.findOne({
                where: {
                    order_id: doc.order_id,
                    staff_type: '1', //TYPE_STAFF
                    state: GLBConfig.ENABLE
                }
            });

            if (staff) {
                staff.user_id = doc.order_supervision;
                await staff.save();
            } else {
                await tb_staff.create({
                    order_id: doc.order_id,
                    staff_type: '1',
                    user_id: doc.order_supervision,
                    staff_phone: suser.phone
                });
            }
            order.order_supervision = doc.order_supervision;
            order.order_remark = doc.order_remark;
            await order.save()
            common.sendData(res);
        } else {
            return common.sendError(res, 'staff_01')
        }
    } catch (error) {
        return common.sendFault(res, error)
    }
};
// 查询户型图
let searchDesignAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let api_name = 'ERCROOMTYPEDETAILCONTROL'; //户型详情的设计图

        let files = await tb_uploadfile.findAll({
            where: {
                api_name: api_name,
                srv_id: doc.roomtype_id,
                state: GLBConfig.ENABLE
            }
        });

        let vrs = await tb_govrinfo.findAll({
            where: {
                roomtype_id: doc.roomtype_id,
                state: GLBConfig.ENABLE
            }
        });

        let returnData = {};
        returnData.files = [];
        for (let f of files) {
            let fj = JSON.parse(JSON.stringify(f));
            fj.created_time = f.created_at.Format("yyyy-MM-dd");
            returnData.files.push(fj)
        }

        returnData.vrs = [];
        for (let v of vrs) {
            let vj = JSON.parse(JSON.stringify(v));
            vj.created_time = v.created_at.Format("yyyy-MM-dd");
            returnData.vrs.push(vj)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 查询物料
let searchMaterilalAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let queryStr = `select om.*, m.materiel_id,m.materiel_code,m.materiel_name,m.materiel_format,m.materiel_unit,
         m.materiel_type,m.materiel_cost,m.materiel_source,m.materiel_procedure,om.materiel_amount
         from tbl_erc_ordermateriel om left join tbl_erc_materiel m on om.materiel_id = m.materiel_id
        where om.state = ? and m.state = ? and order_id = ? and room_id=?`;

        let replacements = [GLBConfig.ENABLE, GLBConfig.ENABLE, doc.order_id,doc.room_id];


        if (doc.search_text) {
            queryStr += ' and (m.materiel_code like ? or m.materiel_name like ? or m.materiel_format like ?)';
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
        }

        if (doc.materiel_source > 0) { //1属地采购，2集团采购
            queryStr += ' and m.materiel_source = ?'
            replacements.push(doc.materiel_source)
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 查询验收计划
let searchAcceptanceAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};
        let queryStr = `select o.*, u.name as acceptance_submit_name from tbl_erc_orderacceptance o LEFT JOIN tbl_common_user u on(o.acceptance_submit_id = u.user_id) where o.state = ? and o.order_id = ?`;
        let replacements = [GLBConfig.ENABLE, doc.order_id];
        if (doc.node_id) {
            queryStr += ` and o.node_id = ? `;
            replacements.push(doc.node_id);
        }
        if (doc.room_id) {
            queryStr += ` and o.room_id = ? `;
            replacements.push(doc.room_id);
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];

        for (let r of result.data) {
            let rj = JSON.parse(JSON.stringify(r));
            rj.acceptance_submit_date_format = r.acceptance_submit_date ? r.acceptance_submit_date.Format("yyyy-MM-dd") : null;
            rj.acceptance_check_date_format = r.acceptance_check_date ? r.acceptance_check_date.Format("yyyy-MM-dd") : null;
            returnData.rows.push(rj)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 删除验收计划
let acceptanceDetailAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body)

        let acceptance = await tb_orderacceptance.findOne({
            where: {
                orderacceptance_id: doc.orderacceptance_id
            }
        });

        if (!acceptance) {
            return common.sendError(res, 'acceptance_01')
        }

        let returnData = JSON.parse(JSON.stringify(acceptance));

        returnData.check_pic = [];
        let cfs = await tb_uploadfile.findAll({
            where: {
                // api_name: common.getApiName(req.path),
                api_name: 'NODE',
                order_id: acceptance.order_id,
                srv_id: acceptance.orderacceptance_id,
                state: GLBConfig.ENABLE
            }
        });
        for (let c of cfs) {
            returnData.check_pic.push(c.file_url)
        }

        returnData.rejected_msg = [];
        let checkmessages = await tb_checkmessage.findAll({
            where: {
                order_id: acceptance.order_id,
                srv_id: acceptance.orderacceptance_id,
                check_type: 'ACCEPTANCECHECK',
                check_state: '1', //CHECKSTATEINFO 驳回记录
                check_owner: '0',
                state: GLBConfig.ENABLE
            },
            order: [
                ['created_at', 'DESC']
            ]
        });
        for (let m of checkmessages) {
            returnData.rejected_msg.push(m.check_message)
        }

        let approveMessages = await tb_checkmessage.findOne({
            where: {
                order_id: acceptance.order_id,
                srv_id: acceptance.orderacceptance_id,
                check_type: 'ACCEPTANCECHECK',
                check_state: '2', //CHECKSTATEINFO 通过记录
                check_owner: '0',
                state: GLBConfig.ENABLE
            }
        });

        if (approveMessages) {
            returnData.approve_msg = approveMessages.check_message;
        }
        returnData.acceptance_submit_date_format = acceptance.acceptance_submit_date ? acceptance.acceptance_submit_date.Format("yyyy-MM-dd") : null;
        returnData.acceptance_check_date_format = acceptance.acceptance_check_date ? acceptance.acceptance_check_date.Format("yyyy-MM-dd") : null;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 导出明细
exports.detailAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body)

        let acceptance = await tb_orderacceptance.findOne({
            where: {
                orderacceptance_id: doc.orderacceptance_id
            }
        });

        if (!acceptance) {
            return common.sendError(res, 'acceptance_01')
        }

        let returnData = JSON.parse(JSON.stringify(acceptance));

        returnData.check_pic = [];
        let cfs = await tb_uploadfile.findAll({
            where: {
                // api_name: common.getApiName(req.path),
                api_name: 'NODE',
                order_id: acceptance.order_id,
                srv_id: acceptance.orderacceptance_id,
                state: GLBConfig.ENABLE
            }
        });
        for (let c of cfs) {
            returnData.check_pic.push(c.file_url)
        }

        returnData.rejected_msg = [];
        let checkmessages = await tb_checkmessage.findAll({
            where: {
                order_id: acceptance.order_id,
                srv_id: acceptance.orderacceptance_id,
                check_type: 'ACCEPTANCECHECK',
                check_state: '1', //CHECKSTATEINFO 驳回记录
                check_owner: '0',
                state: GLBConfig.ENABLE
            },
            order: [
                ['created_at', 'DESC']
            ]
        });
        for (let m of checkmessages) {
            returnData.rejected_msg.push(m.check_message)
        }

        let approveMessages = await tb_checkmessage.findOne({
            where: {
                order_id: acceptance.order_id,
                srv_id: acceptance.orderacceptance_id,
                check_type: 'ACCEPTANCECHECK',
                check_state: '2', //CHECKSTATEINFO 通过记录
                check_owner: '0',
                state: GLBConfig.ENABLE
            }
        });

        if (approveMessages) {
            returnData.approve_msg = approveMessages.check_message;
        }
        returnData.acceptance_submit_date_format = acceptance.acceptance_submit_date ? acceptance.acceptance_submit_date.Format("yyyy-MM-dd") : null;
        returnData.acceptance_check_date_format = acceptance.acceptance_check_date ? acceptance.acceptance_check_date.Format("yyyy-MM-dd") : null;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

/**
 * 验收审核
 * @param orderacceptance_id
 * @param act 1 驳回 2 通过
 * @param check_message 驳回信息
 */
let checkAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;

        let acceptance = await tb_orderacceptance.findOne({
            where: {
                orderacceptance_id: doc.orderacceptance_id,
                state: GLBConfig.ENABLE
            }
        });

        if (acceptance.acceptance_state != 'CHECKING') {
            return common.sendError(res, 'acceptance_02')
        }

        let staff = await UserBL.getOrderRelaUser(acceptance.order_id, '1'); //监理

        if (user.user_id != staff[0].user_id) {
            return common.sendError(res, 'acceptance_03')
        }

        let cf = await tb_checkflow.findOne({
            where: {
                order_id: acceptance.order_id,
                srv_id: acceptance.orderacceptance_id,
                check_type: 'ACCEPTANCECHECK',
                check_state: '0',
                check_owner: '0',
                state: GLBConfig.ENABLE
            }
        });

        if (!cf) {
            return common.sendError(res, 'acceptance_05');
        }

        if (doc.act === '1') { //驳回
            acceptance.acceptance_state = 'REJECTED'; // ACCEPTANCESTATEINFO
            acceptance.acceptance_check_date = new Date();
            acceptance.acceptance_check_id = user.user_id;
            await acceptance.save();

            cf.check_state = doc.act;
            cf.operater_id = user.user_id;
            cf.operater_name = user.name;
            await cf.save()

            let addCm = await tb_checkmessage.create({
                check_id: cf.check_id,
                order_id: cf.order_id,
                srv_id: cf.srv_id,
                check_message: doc.check_message,
                check_state: cf.check_state,
                check_owner: cf.check_owner,
                check_type: cf.check_type,
                operater_id: cf.operater_id,
                operater_name: cf.operater_name
            });
        } else if (doc.act === '2') { // 通过
            acceptance.acceptance_state = 'APPROVED';
            acceptance.acceptance_check_date = new Date();
            acceptance.acceptance_check_id = user.user_id;
            await acceptance.save();

            cf.check_state = doc.act;
            cf.operater_id = user.user_id;
            cf.operater_name = user.name;
            await cf.save();

            let addCm = await tb_checkmessage.create({
                check_id: cf.check_id,
                order_id: cf.order_id,
                srv_id: cf.srv_id,
                check_message: doc.check_message,
                check_state: cf.check_state,
                check_owner: cf.check_owner,
                check_type: cf.check_type,
                operater_id: cf.operater_id,
                operater_name: cf.operater_name
            });

            let napCount = await tb_orderacceptance.count({
                where: {
                    gantttasks_id: acceptance.gantttasks_id,
                    acceptance_state: {
                        $ne: 'APPROVED',
                    },
                    state: GLBConfig.ENABLE
                }
            });
            if (napCount === 0) { //全部验收通过节点完成
                let task = await tb_gantttasks.findOne({
                    where: {
                        gantttasks_id: acceptance.gantttasks_id,
                        state: GLBConfig.ENABLE
                    }
                });
                task.task_state = '3'; //TASKSTATE
                task.progress = 1;
                await task.save()
            }
        } else {
            return common.sendError(res, 'acceptance_04')
        }

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 查询客户
let getCustomer = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {},
            replacements = [];
        let queryStr = `select * from tbl_common_user where state=1 and (username like ? or phone like ?) `;
        replacements.push(doc.search_text);
        replacements.push(doc.search_text);

        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        if (result && result.length > 0) {
            common.sendData(res, result);
        } else {
            common.sendError(res, 'usersetting_02');
        }

    } catch (error) {
        common.sendFault(res, error);
    }
}
let relationOrder = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let order = await tb_order.findOne({
            where: {
                order_id: doc.order_id,
                state: GLBConfig.ENABLE
            }
        });

        if (order) {
            order.user_id = doc.user_id;
            await order.save();
        }
        common.sendData(res, order);

    } catch (error) {
        common.sendFault(res, error);
    }
}
