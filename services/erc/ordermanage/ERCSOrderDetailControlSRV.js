/**
 * 销售订单详情接口
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCSOrderDetailControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const UserBL = require('../../../bl/UserBL');
const TaskListControlSRV = require('../baseconfig/ERCTaskListControlSRV');


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
const tb_domain = model.common_domain;
const tb_erc_orderreview = model.erc_orderreview;
const tb_orderrequire = model.erc_orderrequire;
const tb_salereceiveable = model.erc_salereceivables;
const tb_ordermateriel = model.erc_ordermateriel;
const tb_corporateclients = model.erc_corporateclients;
const tb_creditlinedetail = model.erc_creditlinedetail; //信用额度明细
const tb_message_user = model.erc_message_user;
const tb_productplan = model.erc_productplan;

exports.ERCSOrderDetailControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search_order') {
        searchOrderAct(req, res)
    } else if (method === 'search_basicInfo') {
        searchBasicInfoAct(req, res)
    } else if (method === 'saveOrder') {
        saveOrderAct(req, res)
    } else if (method === 'search_material') { //物料清单
        searchMaterilalAct(req, res)
    } else if (method === 'start_order_review') {
        startOrderReviewAct(req, res);
    } else if (method === 'shipped_goods') {
        shippedGoodsAct(req, res);
    } else if (method === 'search_order_review') {
        searchOrderReviewAct(req, res);
    } else if (method === 'set_order_review_duty') {
        setOrderReviewDutyAct(req, res);
    } else if (method === 'add_sale_receiveable') { //创建收款
        addSaleReceiveableAct(req, res);
    } else if (method === 'search_sale_receiveable') { //列表
        searchSaleReceiveableAct(req, res);
    } else if (method === 'modify_sale_receiveable') { //更新
        modifySaleReceiveableAct(req, res);
    } else if (method === 'delete_sale_receiveable') {
        deleteSaleReceiveableAct(req, res);
    } else if (method === 'confirm_receiveable') { //收款确认
        confirmReceiveableAct(req, res);
    } else if (method === 'modify_material') {
        modifySaleOrderMateriel(req, res)
    } else if (method === 'submitCreditLine') {
        submitCreditLine(req, res)
    } else if (method === 'deleteOrdeRmateriel') {
        deleteOrdeRmateriel(req, res)
    } else if (method === 'add_order_user') {
        addOrderUserAct(req, res)
    } else if (method === 'sendOrder') {
        sendOrderAct(req, res)
    } else if (method === 'completeOrder') {
        completeOrderAct(req, res)
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
            // roomTypeInfo: GLBConfig.ROOMTYPE,
            // orderTypeInfo: GLBConfig.OTYPEINFO,
            // orderStateInfo: GLBConfig.ORDERSTATEINFO,
            // roleInfo: GLBConfig.TYPE_STAFF,
            // tfInfo: GLBConfig.TFINFO,
            // materialTypeInfo: GLBConfig.MATERIELTYPE, //物料分类
            // unitInfo: GLBConfig.UNITINFO, //单位
            // purchaseTypeInfo: GLBConfig.PURCHASESTATE, //采购状态
            // materielSourceInfo: GLBConfig.MATERIELSOURCE, //物料来源
            // stateTypeInfo: GLBConfig.ACCEPTANCESTATEINFO,
            // materielProcedure : GLBConfig.MATERIELPROCEDURE,//工序
            // materielAmto : GLBConfig.MATERIELAMTO,//是否是定制品
            orderReviewStatusInfo: GLBConfig.ORDERCHECKSTATE,
            // payTypeInfo: GLBConfig.PAYTYPE,//收款支付方式
            // sapState:GLBConfig.SAPSTATE//sap状态
        };
        returnData.companyName = await getCompanyName(doc.order_id)
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
                state: GLBConfig.ENABLE
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

        // 机构列表
        let domains = await tb_domain.findAll({});
        returnData.domainInfo = [];
        for (let d of domains) {
            returnData.domainInfo.push({
                id: d.domain_id,
                value: d.domain_id,
                text: d.domain_name
            })
        }

        returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'); //单位

        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};

async function getCompanyName(order_id) {
    try {
        let queryStr = `select c.corporateclients_name from tbl_erc_order o,tbl_erc_corporateclients c 
            where o.state=1 and c.state=1 and o.purchaser_corporateclients_id = c.corporateclients_id
            and o.order_id=?`
        let result = await sequelize.query(queryStr, {
            replacements: [order_id],
            type: sequelize.QueryTypes.SELECT
        });
        return result[0].corporateclients_name
    } catch (error) {
        return common.sendFault(res, error)
    }
}
// 查询基础信息
let searchBasicInfoAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        let domain = await tb_domain.findOne({
            where: {
                domain_id: doc.domain_id
            }
        });

        if (domain) {
            returnData.purchase_contact = domain.domain_contact;
            returnData.purchase_phone = domain.domain_phone;
            returnData.domain_name = domain.domain_name;
        }
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error)
    }
};
// 查询订单信息
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
        if (queryRst.length <= 0) {
            return common.sendError(res, 'order_02');
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

        common.sendData(res, retData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
// 保存订单信息
let saveOrderAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let order = await tb_order.findOne({
            where: {
                order_id: doc.order_id,
                state: GLBConfig.ENABLE
            }
        });
        if (order) {
            order.order_remark = doc.order_remark;
            await order.save();
        }
        common.sendData(res, order);
    } catch (error) {
        return common.sendFault(res, error)
    }
};

//完成订单
let completeOrderAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let order = await tb_order.findOne({
            where: {
                order_id: doc.order_id,
                state: GLBConfig.ENABLE
            }
        });
        if (order) {
            order.order_state = 'FINISHI';
            await order.save();
        }
        common.sendData(res, order);
    } catch (error) {
        return common.sendFault(res, error)
    }
};

// 提交评审
let sendOrderAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        let queryStr = '',
            result, replacements = []
        let order = await tb_order.findOne({
            where: {
                order_id: doc.order_id,
                state: GLBConfig.ENABLE
            }
        });
        if (!order) {
            common.sendError(res, '没找到对应订单')
            return
        }

        let corporateclientsId = order.purchaser_corporateclients_id
        //客户信息
        let corporateclients = await tb_corporateclients.findOne({
            where: {
                state: 1,
                corporateclients_id: corporateclientsId
            }
        })
        let advance_ratio = Number(corporateclients.corporateclients_advance_ratio) / 100 //预付比例
        let creditline = Number(corporateclients.corporateclients_creditline) //信用额度

        // 订单总金额
        queryStr = `select sum(materiel_amount*sale_price) as sumOrderMoney from tbl_erc_ordermateriel where state=1 and order_id='${doc.order_id}'`
        let orderMaterielRes = await sequelize.query(queryStr, {
            replacements: [],
            type: sequelize.QueryTypes.SELECT
        })
        let sumOrderMoney = Number(orderMaterielRes[0].sumOrderMoney)

        //客户的可用余额
        let creditlinedetail = await tb_creditlinedetail.findAll({
            where: {
                corporateclients_id: corporateclientsId,
                state: GLBConfig.ENABLE
            }
        });

        let currentSumCreditline = 0, //当前信用额度余额
            currentSumAdvance = 0 //当前预付款余额
        for (let c of creditlinedetail) {
            if (c.creditlinedetail_detail_type == 0) {
                if (c.creditlinedetail_type == 1) {
                    currentSumCreditline += Number(c.creditlinedetail_money)
                } else {
                    currentSumCreditline -= Number(c.creditlinedetail_money)
                }
            } else {
                if (c.creditlinedetail_type == 1) {
                    currentSumAdvance += Number(c.creditlinedetail_money)
                } else {
                    currentSumAdvance -= Number(c.creditlinedetail_money)
                }
            }
        }


        /*
        优先级
        信用额度无限>有预付比例>有信用额度
         */
        if (corporateclients.corporateclients_scope == 1) {
            logger.info('信用额度无限，提交评审')
        } else if (advance_ratio > 0) {
            //有预付比例,订单金额*比例<可用余额,可评审
            let sumOrderAdvanceMoney = sumOrderMoney * advance_ratio
            if (sumOrderAdvanceMoney <= currentSumCreditline + currentSumAdvance) {
                if (sumOrderAdvanceMoney <= currentSumAdvance) {
                    //扣减预付款
                    creditlinedetail = await tb_creditlinedetail.create({
                        corporateclients_id: corporateclientsId, //企业客户id
                        creditlinedetail_type: '2', //类型  1增加2减少
                        creditlinedetail_businessid: doc.order_id, //业务单号
                        creditlinedetail_money: sumOrderAdvanceMoney, //金额  本次收款或支出的金额
                        creditlinedetail_surplus_creditline: currentSumCreditline, //结余信用额度
                        creditlinedetail_surplus_advance: currentSumAdvance - sumOrderAdvanceMoney, //结余预付款金额
                        creditlinedetail_detail_type: 1 //0信用，1预付款
                    });
                } else {
                    //扣减预付款及信用额度
                    creditlinedetail = await tb_creditlinedetail.create({
                        corporateclients_id: corporateclientsId, //企业客户id
                        creditlinedetail_type: '2', //类型  1增加2减少
                        creditlinedetail_businessid: doc.order_id, //业务单号
                        creditlinedetail_money: currentSumAdvance, //金额  本次收款或支出的金额
                        creditlinedetail_surplus_creditline: currentSumCreditline, //结余信用额度
                        creditlinedetail_surplus_advance: 0, //结余预付款金额
                        creditlinedetail_detail_type: 1 //0信用，1预付款
                    });
                    creditlinedetail = await tb_creditlinedetail.create({
                        corporateclients_id: corporateclientsId, //企业客户id
                        creditlinedetail_type: '2', //类型  1增加2减少
                        creditlinedetail_businessid: doc.order_id, //业务单号
                        creditlinedetail_money: sumOrderAdvanceMoney - currentSumAdvance, //金额  本次收款或支出的金额
                        creditlinedetail_surplus_creditline: currentSumCreditline - sumOrderAdvanceMoney - currentSumAdvance, //结余信用额度
                        creditlinedetail_surplus_advance: 0, //结余预付款金额
                        creditlinedetail_detail_type: 0 //0信用，1预付款
                    });
                }
            } else {
                common.sendErrorDefined(res, `该客户的可用余额不足，尚差${Number(sumOrderMoney) * advance_ratio - (currentSumCreditline + currentSumAdvance)}元`)
                return
            }
        } else if (creditline > 0) {
            if (sumOrderMoney <= currentSumCreditline + currentSumAdvance) {
                //扣减预付款及信用额度
                let creditlinedetail = await tb_creditlinedetail.create({
                    corporateclients_id: corporateclientsId, //企业客户id
                    creditlinedetail_type: '2', //类型  1增加2减少
                    creditlinedetail_businessid: doc.order_id, //业务单号
                    creditlinedetail_money: sumOrderMoney, //金额  本次收款或支出的金额
                    creditlinedetail_surplus_creditline: currentSumCreditline - sumOrderMoney, //结余信用额度
                    creditlinedetail_surplus_advance: currentSumAdvance, //结余预付款金额
                    creditlinedetail_detail_type: 0 //0信用，1预付款
                });
            } else {
                common.sendErrorDefined(res, `该客户的可用余额不足，尚差${Number(Number(sumOrderMoney) - Number(currentSumCreditline) - Number(currentSumAdvance)).toFixed(2)}元`)
                return
            }
        } else {
            common.sendErrorDefined(res, '该客户的可用余额不足，不能提交评审')
            return
        }

        order.order_review_state = 1;
        await order.save();

        let requires = await tb_orderrequire.findAll({
            where: {
                type_id: '4',
                domain_id: user.domain_id,
                state: GLBConfig.ENABLE
            }
        });

        for (let r of requires) {
            let result = await tb_erc_orderreview.create({
                order_id: doc.order_id,
                require_id: r.require_id,
                duty_user_id: r.require_user_id,
                review_status: '1'
            });

            let taskName = r.require_name;
            let taskType = '5';
            let taskPerformer = r.require_user_id;
            let taskReviewCode = doc.order_id;
            let taskDescription = r.require_description;
            let taskReviewId = result.review_id;
            await TaskListControlSRV.createTask(user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, taskReviewId);
        }
        common.sendData(res, order);
    } catch (error) {
        return common.sendFault(res, error)
    }
};
// 查询物料信息
let searchMaterilalAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let queryStr = `select om.*, m.materiel_id,m.materiel_code,m.materiel_name,m.materiel_format,m.materiel_unit,
         m.materiel_type,m.materiel_cost,m.materiel_source,m.materiel_procedure,om.materiel_amount,om.sale_price,(om.materiel_amount*om.sale_price) as sale_money 
         from tbl_erc_ordermateriel om left join tbl_erc_materiel m on om.materiel_id = m.materiel_id
        where om.state = ? and m.state = ? and order_id = ?`;

        let replacements = [GLBConfig.ENABLE, GLBConfig.ENABLE, doc.order_id];

        if (doc.search_text) {
            queryStr += ' and (m.materiel_code like ? or m.materiel_name like ? or m.materiel_format like ?)';
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        let sumMoney = 0;
        for (let r of result) {
            sumMoney += r.sale_money
        }
        returnData.sumMoney = sumMoney;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 查询订单审批信息
async function startOrderReviewAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;

        let requires = await tb_orderrequire.findAll({
            where: {
                type_id: '4',
                domain_id: doc.domainId,
                state: GLBConfig.ENABLE
            }
        });

        for (let r of requires) {
            let result = await tb_erc_orderreview.create({
                order_id: doc.orderId,
                require_id: r.require_id,
                review_status: '1'
            });
        }

        let order = await tb_order.findOne({
            where: {
                order_id: doc.orderId
            }
        });
        if (order.order_state === 'PAYED') {
            order.order_state = 'REVIEWING';
            await order.save();

            let orderworkflow = await tb_orderworkflow.findOne({
                where: {
                    order_id: doc.orderId,
                    orderworkflow_state: 'REVIEWING'
                }
            });

            if (!orderworkflow) {
                await tb_orderworkflow.create({
                    order_id: doc.orderId,
                    orderworkflow_state: 'REVIEWING',
                    orderworkflow_desc: '审核中'
                });
            }
        }

        common.sendData(res);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//订单评审
async function shippedGoodsAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        //先判断订单评审是否全部完成，如果全部完成，则可以发货
        let orderReview = await tb_erc_orderreview.findAll({
            where: {
                order_id: doc.orderId,
                review_status: {
                    $ne: '3'
                },
            }
        });

        if (orderReview.length > 0) {
            return common.sendError(res, 'orderdetail_07');
        }

        let validState = 0;
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
            validState = reviewState;
        } else {
            validState = 2; //订单中没有自制品物料时，产品规划评审默认是完成的
        }
        if (validState != 2) {
            return common.sendError(res, 'produce_10');
        }

        let order = await tb_order.findOne({
            where: {
                order_id: doc.orderId
            }
        });
        if (order.order_state === 'REVIEWING') {
            order.order_state = 'SHIPPED';
            await order.save();

            let orderworkflow = await tb_orderworkflow.findOne({
                where: {
                    order_id: doc.orderId,
                    orderworkflow_state: 'SHIPPED'
                }
            });

            if (!orderworkflow) {
                await tb_orderworkflow.create({
                    order_id: doc.orderId,
                    orderworkflow_state: 'SHIPPED',
                    orderworkflow_desc: '发货中'
                });
            }
        }

        common.sendData(res);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
// 查询订单评审
async function searchOrderReviewAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

        let queryStr = `select r.*, i.*, u.username as duty_username  from tbl_erc_orderrequire r
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
            rj.review_date = r.review_date ? r.review_date.Format("yyyy-MM-dd") : null;
            returnData.push(rj);
        }
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
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
            result.review_status = '2';
            await result.save();

            let taskName = '订单评审';
            let taskType = '5';
            let taskPerformer = result.duty_user_id;
            let taskReviewCode = doc.order_id;
            let taskDescription = '订单评审申请';
            let taskReviewId = doc.reviewId;
            await TaskListControlSRV.createTask(user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, taskReviewId);
        }

        common.sendData(res, result);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
// 增加销售订单评审
let addSaleReceiveableAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        let add = await tb_salereceiveable.create({
            order_id: doc.order_id,
            sale_receivables_amount: doc.sale_receivables_amount,
            sale_receivables_operator_id: doc.sale_receivables_operator_id,
            sale_receivables_pay_type: doc.sale_receivables_pay_type
        });
        common.sendData(res, add);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 查询销售订单评审
let searchSaleReceiveableAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let queryStr = `select * from tbl_erc_salereceivables where order_id = ?`;
        let replacements = [doc.order_id];
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let rj = JSON.parse(JSON.stringify(r));
            rj.created_at = r.created_at.Format("yyyy-MM-dd");
            returnData.rows.push(rj);
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 修改销售订单评审
let modifySaleReceiveableAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let find = await tb_salereceiveable.findOne({
            where: {
                order_id: doc.old.order_id
            }
        });
        if (find) {
            find.sale_receivables_amount = doc.new.sale_receivables_amount;
            find.sale_receivables_operator_id = doc.new.sale_receivables_operator_id;
            find.sale_receivables_pay_type = doc.new.sale_receivables_pay_type;
            await find.save();
        } else {
            return common.sendError(res, 'order_02');
        }
        common.sendData(res, find);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 删除销售订单评审
let deleteSaleReceiveableAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let del = await tb_salereceiveable.findOne({
            where: {
                sale_receivables_id: doc.sale_receivables_id,
                state: GLBConfig.ENABLE
            }
        });
        if (del) {
            del.state = GLBConfig.DISABLE;
            await del.save();
        } else {
            return common.sendError(res, 'receivables_01');
        }
        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error)
    }
};
// 提交评审
let confirmReceiveableAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let results = await tb_salereceiveable.findAll({
            where: {
                order_id: doc.orderId
            }
        });
        if (results.length <= 0) {
            return common.sendError(res, 'receivables_02');
        }

        //更改状态为'已付款'
        let order = await tb_order.findOne({
            where: {
                order_id: doc.orderId
            }
        });
        if (order.order_state === 'NEW') {
            order.order_state = 'PAYED';
            await order.save();

            let orderworkflow = await tb_orderworkflow.findOne({
                where: {
                    order_id: doc.orderId,
                    orderworkflow_state: 'PAYED'
                }
            });

            if (!orderworkflow) {
                await tb_orderworkflow.create({
                    order_id: doc.orderId,
                    orderworkflow_state: 'PAYED',
                    orderworkflow_desc: '已付款'
                });
            }
        }
        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error)
    }
};
// 修改销售订单物料
let modifySaleOrderMateriel = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let find = await tb_ordermateriel.findOne({
            where: {
                ordermateriel_id: doc.old.ordermateriel_id
            }
        });
        if (find) {
            find.sap_order_state = doc.new.sap_order_state;
            find.sale_price = doc.new.sale_price;
            await find.save();

            let findAll = await tb_ordermateriel.findAll({
                where: {
                    order_id: doc.old.order_id,
                    sap_order_state: 1,
                    state: 1
                }
            });
            if (findAll && findAll.length == 0) {
                await tb_order.update({
                    sap_order_state: 2
                }, {
                    where: {
                        order_id: doc.old.order_id
                    }
                });
            }

        } else {
            return common.sendError(res, 'order_02');
        }
        common.sendData(res, find);
    } catch (error) {
        common.sendFault(res, error);
    }
};

// 提交心痛额度
async function submitCreditLine(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let materielMoney = 0;
        let queryStr = `select sum(materiel_amount*sale_price) as total_sale_money from tbl_erc_ordermateriel where state = ? and order_id = ?`;
        let replacements = [GLBConfig.ENABLE, doc.order_id];
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        if (result && result.length > 0) {
            materielMoney = result[0].total_sale_money ? result[0].total_sale_money : 0
        }

        let corporateclients = await tb_corporateclients.findOne({
            where: {
                state: GLBConfig.ENABLE,
                corporateclients_id: doc.purchaser_corporateclients_id
            }
        });

        if (corporateclients) {
            if ((corporateclients.creditline_advance + corporateclients.creditline_money - corporateclients.creditline_use) < materielMoney) {
                return common.sendError(res, 'order_03');
            }

            if (materielMoney >= corporateclients.creditline_advance) {
                corporateclients.creditline_use += materielMoney - corporateclients.creditline_advance;
                corporateclients.creditline_advance = 0
            } else {
                corporateclients.creditline_use += 0;
                corporateclients.creditline_advance -= materielMoney;
            }
            await corporateclients.save();
        }

        corporateclients = await tb_corporateclients.findOne({
            where: {
                corporateclients_id: doc.purchaser_corporateclients_id
            }
        });
        if (corporateclients) {
            //保存信用额度操作明细
            let creditlinedetail = await tb_creditlinedetail.create({
                corporateclients_id: corporateclients.corporateclients_id,
                creditlinedetail_type: '2',
                creditlinedetail_businessid: doc.order_id,
                creditlinedetail_money: materielMoney,
                creditlinedetail_surplus_creditline: corporateclients.creditline_money - corporateclients.creditline_use,
                creditlinedetail_surplus_advance: corporateclients.creditline_advance
            });
        }
        await tb_order.update({
            send_creditline_state: 1,
        }, {
            where: {
                order_id: doc.order_id
            }
        });
        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 删除订单物料
async function deleteOrdeRmateriel(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let find = await tb_ordermateriel.findOne({
            where: {
                ordermateriel_id: doc.ordermateriel_id
            }
        });
        if (find) {
            find.state = 0;
            await find.save();
        } else {
            return common.sendError(res, 'order_02');
        }
        common.sendData(res, find);
    } catch (error) {
        common.sendFault(res, error);
    }
}

// 增加订单操作员
let addOrderUserAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        await common.transaction(async function (t) {
            let order = await tb_order.findOne({
                where: {
                    order_id: doc.order_id,
                    state: GLBConfig.ENABLE
                },
                transaction: t
            });
            if (order) {
                if (doc.type == 1) {
                    let user = await tb_message_user.findAll({
                        where: {
                            message_id: order.order_id,
                            state: GLBConfig.ENABLE,
                            message_user_state: order.order_state,
                            message_user_type: order.order_type,
                            message_user_title: order.order_id
                        }
                    });
                    if (user.length == 0) {
                        let salesId = await tb_message_user.create({
                            message_id: order.order_id,
                            domain_id: order.domain_id,
                            user_id: order.order_sales_id,
                            message_user_state: order.order_state,
                            message_start_date: order.created_at,
                            message_user_type: order.order_type,
                            message_user_title: order.order_id
                        });
                    }
                } else if (doc.type == 2) {
                    let user = await tb_message_user.findAll({
                        where: {
                            message_id: order.order_id,
                            state: GLBConfig.ENABLE,
                            message_user_state: order.order_state,
                            message_user_type: order.order_type,
                            message_user_title: order.order_id
                        }
                    });
                    if (user.length == 0) {
                        let salesId = await tb_message_user.create({
                            message_id: order.order_id,
                            domain_id: order.domain_id,
                            user_id: order.order_sales_id,
                            message_user_state: order.order_state,
                            message_start_date: order.created_at,
                            message_user_type: order.order_type,
                            message_user_title: order.order_id
                        });
                    }
                } else if (doc.type == 3) {
                    let user = await tb_message_user.findAll({
                        where: {
                            message_id: order.order_id,
                            state: GLBConfig.ENABLE,
                            message_user_state: order.order_state,
                            message_user_type: order.order_type,
                            message_user_title: order.order_id
                        }
                    });
                    if (user.length == 0) {
                        let salesId = await tb_message_user.create({
                            message_id: order.order_id,
                            domain_id: order.domain_id,
                            user_id: order.order_sales_id,
                            message_user_state: order.order_state,
                            message_start_date: order.created_at,
                            message_user_type: order.order_type,
                            message_user_title: order.order_id
                        });
                    }
                } else if (doc.type == 4) {
                    let user = await tb_message_user.findAll({
                        where: {
                            message_id: order.order_id,
                            state: GLBConfig.ENABLE,
                            message_user_state: order.order_state,
                            message_user_type: order.order_type,
                            message_user_title: order.order_id
                        }
                    });
                    if (user.length == 0) {
                        let salesId = await tb_message_user.create({
                            message_id: order.order_id,
                            domain_id: order.domain_id,
                            user_id: order.order_sales_id,
                            message_user_state: order.order_state,
                            message_start_date: order.created_at,
                            message_user_type: order.order_type,
                            message_user_title: order.order_id
                        });
                    }
                }
                common.sendData(res);
            } else {
                common.sendError(res, 'orderdetail_01');
                return
            }
        })
    } catch (error) {
        return common.sendFault(res, error);
    }
};