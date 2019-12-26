/**
 * 订单审核
 */
const moment = require('moment')
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCOrderReviewControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const qr = require('qr-image');
const FDomain = require('../../../bl/common/FunctionDomainBL');


const sequelize = model.sequelize;
const tb_order = model.erc_order;
const tb_ordermateriel = model.erc_ordermateriel;
const tb_purchaseorder = model.erc_purchaseorder; //采购单(包含申请单)
const tb_purchasedetail = model.erc_purchasedetail; //采购单物料明细

const tb_userGroup = model.common_usergroup;
const tb_user = model.common_user;
const tb_customer = model.erc_customer;
const tb_orderworkflow = model.erc_orderworkflow;
const tb_domain = model.common_domain;
const tb_appointment = model.erc_appointment;
const tb_estate = model.erc_estate;
const tb_estateroom = model.erc_estateroom;
const tb_orderdesign = model.erc_orderdesign;
const tb_orderrequire = model.erc_orderrequire;
const tb_landagent = model.erc_landagent;
const tb_usergroup = model.common_usergroup;
const tb_thirdsignuser = model.erc_thirdsignuser;
const tb_corporateclients = model.erc_corporateclients;
const tb_delivery = model.erc_delivery;
const tb_deliveryitem = model.erc_deliveryitem;
const tb_productplan = model.erc_productplan;
const tb_erc_orderreview = model.erc_orderreview;
const TaskListControlSRV = require('../baseconfig/ERCTaskListControlSRV');

const fs = require('fs');
const path = require('path');
const iconvLite = require('iconv-lite');
const config = require('../../../config');
exports.ERCOrderReviewControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search_fit_reviews') {
        searchFitReviewsAct(req, res)
    } else if (method === 'search_sale_reviews') {
        searchSaleReviewsAct(req, res)
    } else if (method === 'search_order_require') { //获取评审内容
        searchOrderRequireAct(req, res)
    } else if (method === 'set_order_review_duty') {
        setOrderReviewDutyAct(req, res);
    } else if (method === 'add_delivery') { //添加交货批次
        addDeliveryAct(req, res)
    } else if (method === 'search_delivery') { //交货批次列表
        searchDeliveryAct(req, res)
    } else if (method === 'get_product_plan_state') { //获取产品规划状态
        getProductPlanStateAct(req, res)
    } else if (method === 'modify_delivery') { //修改交货批次
        modifyDeliveryAct(req, res)
    } else if (method === 'add_delivery_item') { //添加交货物料
        addDeliveryItemAct(req, res)
    } else if (method === 'search_delivery_item') { //交货物料明细
        searchDeliveryItemAct(req, res)
    } else if (method === 'search_order_material') { //订单物料列表
        searchOrderMaterialAct(req, res)
    } else if (method === 'delete_delivery_item') { //删除交货物料
        deleteDeliveryItemAct(req, res)
    } else if (method === 'modify_delivery_item') { //修改交货物料数量
        modifyDeliveryItemAct(req, res)
    } else if (method === 'modifyReviewState') {
        modifyReviewState(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};
// 初始化基础数据
let initAct = async (req, res) => {
    try {
        let returnData = {},
            user = req.user;
        returnData.clientTypeInfo = GLBConfig.CLIENTTYPE;
        returnData.orderReviewStatusInfo = GLBConfig.ORDERCHECKSTATE;
        returnData.deliveryStateInfo = GLBConfig.DELIVERYSTATE;
        returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'); //单位

        // employees
        let employees = await tb_user.findAll({
            where: {
                domain_id: user.domain_id,
                user_type: {
                    $in: [GLBConfig.TYPE_OPERATOR]
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
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 查询订单
let searchFitReviewsAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {},
            replacements = [];
        let queryStr = `select o.*,u.*, o.domain_id domain_id,ds.name designer_name,
            o.created_at order_created_at from
            tbl_erc_order o
            left join tbl_common_user u on o.user_id = u.user_id
            left join tbl_common_user ds on o.designer_id = ds.user_id
            left join tbl_common_domain d on d.domain_id = o.domain_id
            left join tbl_erc_roomtype r on o.roomtype_id = r.roomtype_id
            where o.state = 1 and order_type = 1 and o.order_state = 'REVIEWING' and o.domain_id = ? `;
        replacements = [user.domain_id];
        if (doc.search_text) {
            queryStr += ' and o.order_id like ? ';
            replacements.push('%' + doc.search_text + '%');
        }
        if (doc.createdBTime) {
            queryStr += ' and o.created_at>=?';
            replacements.push(doc.createdBTime)
        }
        if (doc.createdETime) {
            queryStr += ' and o.created_at<=?';
            replacements.push(doc.createdETime)
        }
        queryStr += ' order by o.created_at desc';
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.order_created_at ? moment(r.order_created_at).format("YYYY-MM-DD") : null;
            result.break_date_f = r.break_date ? moment(r.break_date).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 查询销售订单评审
let searchSaleReviewsAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};
        let queryStr = `select o.*,c.corporateclients_name   
         from tbl_erc_order o
         left join tbl_erc_corporateclients c on (o.purchaser_corporateclients_id=c.corporateclients_id and c.state=1)
         where o.state = 1 and o.domain_id = ?  `;
        let replacements = [user.domain_id];
        if (doc.search_text) {
            queryStr += ' and o.order_id like ? ';
            replacements.push('%' + doc.search_text + '%');
        }
        if (doc.createdBTime) {
            queryStr += ' and o.created_at>=?';
            replacements.push(doc.createdBTime)
        }
        if (doc.createdETime) {
            queryStr += ' and o.created_at<=?';
            replacements.push(doc.createdETime)
        }
        queryStr += ' order by o.created_at desc';
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            result.break_date_f = r.break_date ? moment(r.break_date).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

let searchOrderRequireAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let queryStr = `select r.*, i.*, u.username as duty_username 
                        from tbl_erc_orderrequire r
                        left join tbl_erc_orderreview i on (r.require_id = i.require_id)
                        left join tbl_common_user u on (i.duty_user_id = u.user_id)
                        where i.order_id = ?`;
        let replacements = [doc.orderId];
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        let returnData = [];
        for (let r of result) {
            let rj = JSON.parse(JSON.stringify(r));
            rj.review_date = r.review_date ? moment(r.review_date).format("YYYY-MM-DD") : null;
            returnData.push(rj);
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 设置订单评审
async function setOrderReviewDutyAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        let result = await tb_erc_orderreview.findOne({
            where: {
                review_id: doc.reviewId
            }
        });

        if (result) {
            result.duty_user_id = doc.dutyUserId;
            // result.review_status = '2';
            await result.save();

            let queryStr = `select r.*, i.* from tbl_erc_orderrequire r
            left join tbl_erc_orderreview i on (r.require_id = i.require_id)
            where i.order_id = ? and i.review_id = ?`;
            let replacements = [doc.order_id, doc.reviewId];
            let result2 = await sequelize.query(queryStr, {
                replacements: replacements,
                type: sequelize.QueryTypes.SELECT
            });

            let taskName = result2[0].require_name;
            let taskType = '5';
            let taskPerformer = result.duty_user_id;
            let taskReviewCode = doc.order_id;
            let taskDescription = result2[0].require_description;
            let taskReviewId = doc.reviewId;
            await TaskListControlSRV.createTask(user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, taskReviewId);
        }

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 增加交货批次
let addDeliveryAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let add = await tb_delivery.create({
            order_id: doc.orderId,
            delivery_state: 1,
            delivery_remark: doc.deliveryRemark,
            delivery_date: doc.deliveryDate
        });
        common.sendData(res, add);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 查询交货批次
let searchDeliveryAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            returnData = {};
        let queryStr = `select * from tbl_erc_delivery 
                        where order_id = ? 
                        order by created_at desc`;
        let replacements = [doc.orderId];

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let rj = JSON.parse(JSON.stringify(r));
            rj.delivery_date = rj.delivery_date ? moment(r.delivery_date).format("YYYY-MM-DD") : null;
            returnData.rows.push(rj)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 获取生产计划
let getProductPlanStateAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let queryStr = `select om.*, m.materiel_id,m.materiel_code,m.materiel_name,m.materiel_format,m.materiel_unit
            from tbl_erc_ordermateriel om left join tbl_erc_materiel m on om.materiel_id = m.materiel_id
            where om.change_flag = 0 and om.state = 1 and om.order_id = ? and m.materiel_source = 1 `;
        let replacements = [doc.orderId];
        let result = await common.simpleSelect(sequelize, queryStr, replacements);

        if (result.length > 0) { //订单物料管理中有自制品类型的物料时, 判断产品规划是否已完成审核
            let reviewState = 0;
            let count = 0;
            for (let m of result) {
                let qStr = `select pp.* from tbl_erc_productplan pp 
                                left join tbl_erc_materiel m on pp.materiel_id = m.materiel_id 
                                where pp.state = 1 and pp.domain_id = ? and m.materiel_id = ? `;
                let rm = [user.domain_id, m.materiel_id];
                let pResult = await common.simpleSelect(sequelize, qStr, rm);
                if (pResult.length > 0) {
                    let p = pResult[0];
                    if (p.valid_state == 2) {
                        count++;
                    }
                }
            }
            if (count > 0) {
                if (count == result.length) {
                    reviewState = 2; //完成评审
                } else {
                    reviewState = 1; //部分评审
                }
            } else {
                reviewState = 0; //未评审
            }
            common.sendData(res, {
                valid_state: reviewState
            });
        } else {
            common.sendData(res, {
                valid_state: 2
            }); //订单中没有自制品物料时，产品规划评审默认是完成的
        }
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 修改交货批次
let modifyDeliveryAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let update = await tb_delivery.update({
            delivery_state: doc.delivery_state,
            delivery_remark: doc.delivery_remark,
            delivery_date: doc.delivery_date
        }, {
            where: {
                delivery_id: doc.delivery_id
            }
        });
        common.sendData(res, update);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 增加批次明细
let addDeliveryItemAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let materials = doc.materials;
        for (let m of materials) {
            let find = await tb_deliveryitem.findOne({
                where: {
                    delivery_id: doc.delivery_id,
                    materiel_id: m.materiel_id,
                    state: GLBConfig.ENABLE
                }
            });
            if (!find) {
                await tb_deliveryitem.create({
                    delivery_id: doc.delivery_id,
                    materiel_id: m.materiel_id,
                    delivery_item_number: m.delivery_item_number
                });
            }
        }
        let result = await tb_deliveryitem.findAll({
            where: {
                delivery_id: doc.delivery_id
            }
        });
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 查询批次明细
let searchDeliveryItemAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            returnData = {};
        let queryStr = `select di.*, d.delivery_state, m.materiel_code, m.materiel_name, m.materiel_format, m.materiel_unit 
                        from tbl_erc_deliveryitem di 
                        left join tbl_erc_materiel m on (di.materiel_id = m.materiel_id and m.state = 1) 
                        left join tbl_erc_delivery d on (di.delivery_id = d.delivery_id and d.state = 1)
                        where di.state = 1 and di.delivery_id = ? `;
        let replacements = [doc.delivery_id];

        if (doc.search_text) {
            queryStr += ' and (m.materiel_code like ? or m.materiel_name like ? or m.materiel_format like ?)';
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
        }

        queryStr += ` order by di.created_at desc`;

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 插叙订单物料
let searchOrderMaterialAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};
        let queryStr = `select om.*, m.materiel_id,m.materiel_code,m.materiel_name,m.materiel_format,m.materiel_unit
            from tbl_erc_ordermateriel om left join tbl_erc_materiel m on om.materiel_id = m.materiel_id
            where om.change_flag = 0 and om.state = 1 and om.order_id = ?`;
        let replacements = [doc.order_id];
        if (doc.search_material) {
            queryStr += ' and (m.materiel_code like ? or m.materiel_name like ? or m.materiel_format like ?)';
            let search_material = '%' + doc.search_material + '%';
            replacements.push(search_material);
            replacements.push(search_material);
            replacements.push(search_material);
        }
        queryStr += ' order by field(m.materiel_amto,2,1,3),m.materiel_id';
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 删除批次明细
let deleteDeliveryItemAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};
        let find = await tb_deliveryitem.findOne({
            where: {
                deliveryitem_id: doc.deliveryitem_id,
                state: GLBConfig.ENABLE
            }
        });
        if (find) {
            find.state = GLBConfig.DISABLE;
            await find.save();
            common.sendData(res, find);
        }
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 修改批次明细
let modifyDeliveryItemAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};
        let update = await tb_deliveryitem.update({
            delivery_item_number: doc.delivery_item_number
        }, {
            where: {
                deliveryitem_id: doc.deliveryitem_id
            }
        });
        common.sendData(res, update);
    } catch (error) {
        common.sendFault(res, error);
    }
};

let modifyReviewState = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};
        let update = await tb_order.update({
            order_review_state: doc.order_review_state,
            order_review_date:moment().format('YYYY-MM-DD')
        }, {
            where: {
                order_id: doc.order_id
            }
        });
        common.sendData(res, update);
    } catch (error) {
        common.sendFault(res, error);
    }
}
