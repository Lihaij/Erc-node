const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCSaleOutControlSRV');
const model = require('../../../model');
const { CODE_NAME, genBizCode } = require('../../../util/BizCodeUtil');
const task = require('../baseconfig/ERCTaskListControlSRV');
const inventoryControl = require('./ERCInventoryControlSRV');
const {
    recordInventoryTotal,
    recordSaleOutReplacePrice,
    qualifiedFeedingMaterielNumber,
    qualifiedProcedureMaterielNumber,
    getProductiveTaskDepartment
} = require('../service/ERCInventoryService');

const sequelize = model.sequelize;
const tb_warehouse = model.erc_warehouse;
const tb_warehousezone = model.erc_warehousezone;
const tb_inventoryorder = model.erc_inventoryorder;
const tb_inventoryaccount = model.erc_inventoryaccount;
const tb_stockmap = model.erc_stockmap;
const tb_user = model.common_user;
const tb_order = model.erc_order;
const tb_orderworkflow = model.erc_orderworkflow;
const tb_materiel = model.erc_materiel;
const tb_productivetask = model.erc_productivetask;
const tb_productivetaskrelated = model.erc_productivetaskrelated;
const tb_productivetaskdetail = model.erc_productivetaskdetail;
const tb_financerecorditem = model.erc_financerecorditem;
const tb_sopricerecord = model.erc_sopricerecord;
const tb_supplier = model.erc_supplier;
const tb_department = model.erc_department;
const tb_corporateclients = model.erc_corporateclients;

exports.ERCSaleOutControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'initActDetail'){
        initActDetail(req, res)
    } else if (method === 'initData'){
        initData(req, res)
    } else if (method === 'assignUserForInvoice') {
        assignUserForInvoice(req, res);
    } else if (method === 'getSaleOutOrderByType'){
        getSaleOutOrderByType(req, res)
    } else if (method === 'getSaleOutOrder'){
        getSaleOutOrder(req, res)
    } else if (method === 'getSaleOutOrderMateriel'){
        getSaleOutOrderMateriel(req, res)
    } else if (method === 'createSaleOutOrder') {
        createSaleOutOrder(req, res)
    } else if (method === 'getSaleOutOrderHistory') {
        getSaleOutOrderHistory(req, res)
    } else if (method === 'getSaleOutOrderHistoryDetail') {
        getSaleOutOrderHistoryDetail(req, res)
    } else if (method === 'getOtherOutOrderHistory') {
        getOtherOutOrderHistory(req, res)
    } else if (method === 'getOtherOutHistoryDetail') {
        getOtherOutHistoryDetail(req, res)
    } else if (method === 'getProductOutOrderHistory') {
        getProductOutOrderHistory(req, res)
    } else if (method === 'getProductOutHistoryDetail') {
        getProductOutHistoryDetail(req, res)
    } else if (method === 'otherOutHistoryPrint'){
        otherOutHistoryPrintAct(req, res)
    } else if (method === 'getOtherOutOrder') {
        getOtherOutOrder(req, res)
    } else if (method==='initSaleOut'){
        initSaleOut(req,res)
    } else if (method==='getWarehouseZone'){
        getWarehouseZone(req,res)
    } else if (method==='getSaleOutOrderMaterielOperate'){
        getSaleOutOrderMaterielOperate(req,res)
    } else if (method==='StockSaleOut'){
        StockSaleOut(req,res)
    } else if (method==='checkOutNumber'){
        checkOutNumber(req,res)
    } else if (method === 'getProductOutOrder') {//获取生产领料列表
        getProductOutOrderAct(req, res)
    } else if (method === 'getProductOutItems') {//获取生产领料明细
        getProductOutItemsAct(req, res);
    } else if (method === 'submitProductOutItems') {//提交生产领料出库
        submitProductOutItemsAct(req, res);
    } else if (method === 'getOrderMaterielTotalPrice') {//提交生产领料出库
        getOrderMaterielTotalPrice(req, res);
    } else if (method === 'getOutSourcingSaleOutOrder') {//委外出库管理
        getOutSourcingSaleOutOrder(req, res);
    } else if (method === 'getAutoDrawProductMateriel') {//自动生产领料列表
        getAutoDrawProductMateriel(req, res);
    } else if (method === 'getAutoDrawProductMaterielDetail') {//自动生产领料列表
        getAutoDrawProductMaterielDetail(req, res);
    } else if (method === 'getAutoDrawProductProcedure') {//自动生产工序移交列表
        getAutoDrawProductProcedure(req, res);
    } else if (method === 'getAutoDrawProductProcedureDetail') {//自动生产工序移交详情
        getAutoDrawProductProcedureDetail(req, res);
    } else if (method === 'submitFeedingMaterielNumber') {
        submitFeedingMaterielNumber(req, res);
    } else if (method === 'submitProcedureMaterielNumber') {
        submitProcedureMaterielNumber(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};
//初始化数据
let initAct = async(req, res)=> {
    try {
        const { body, user } = req;

        const resultData = {
            storeTypeInfo: GLBConfig.STORETYPE[1],
            orderTypeInfo: [
                {
                    id: 0,
                    text: '全部订单'
                },
                ...GLBConfig.OTYPEINFO
            ],
            materielInfo: GLBConfig.MATERIELTYPE,
            unitInfo: await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'),
            inventoryInfo: GLBConfig.INVENTORYOPERATETYPE[1].value,
            materielStateManagement: GLBConfig.MATERIELSTATEMANAGEMENT,
        };

        resultData.staffInfo = await tb_user.findAll({
            where: {
                user_type: '01',
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id
            },
            attributes: [['user_id', 'id'], ['name', 'text']]
        });

        resultData.departmentInfo = await tb_department.findAll({
            where: {
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id
            },
            attributes: [['department_id', 'id'], ['department_name', 'text']]
        });

        resultData.supplierInfo = await tb_supplier.findAll({
            where: {
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id
            },
            attributes: [['supplier_id', 'id'], ['supplier_name', 'text']]
        });

        resultData.wareHouseInfo = await tb_warehouse.findAll({
            where: {
                state: GLBConfig.ENABLE,
                warehouse_state: GLBConfig.ENABLE,
                domain_id: user.domain_id
            },
            attributes: [['warehouse_id', 'id'], ['warehouse_name', 'text']]
        });

        if (body.warehouse_id) {
            resultData.wareHouseZoneInfo = await tb_warehousezone.findAll({
                where: {
                    warehouse_id: body.warehouse_id
                },
                attributes: [['warehouse_zone_id', 'id'], ['zone_name', 'text']]
            });
        }

        common.sendData(res, resultData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//初始化明细数据
async function initActDetail(req, res) {
    try {
        let user = req.user;

        const resultData = {
            storeTypeInfo: GLBConfig.STORETYPE[1],
            materielInfo: GLBConfig.MATERIELTYPE,
            inventoryInfo: GLBConfig.INVENTORYOPERATETYPE[1].value,
            materielStateManagement: GLBConfig.MATERIELSTATEMANAGEMENT,
        };

        resultData.wareHouseInfo = await tb_warehouse.findAll({
            where: {
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id
            }
        });

        const [ warehouse ] = resultData.wareHouseInfo;
        if (warehouse) {
            resultData.wareHouseZoneInfo = await tb_warehousezone.findAll({
                where: {
                    state: GLBConfig.ENABLE,
                    warehouse_id: warehouse.warehouse_id
                },
                attributes: [['warehouse_zone_id', 'id'], ['zone_name', 'text']]
            });
        }

        common.sendData(res, resultData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function initData(req, res) {
    try {
        const { body, user } = req;

        const resultData = {
            unitInfo: await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'),
            materielStateManagement: GLBConfig.MATERIELSTATEMANAGEMENT,
        };

        resultData.wareHouseInfo = await tb_warehouse.findAll({
            where: {
                state: GLBConfig.ENABLE,
                warehouse_state: GLBConfig.ENABLE,
                domain_id: user.domain_id
            },
            attributes: [['warehouse_id', 'id'], ['warehouse_name', 'text']]
        });

        resultData.wareHouseZoneInfo = await tb_warehousezone.findAll({
            where: {
                state: GLBConfig.ENABLE,
            },
            attributes: [['warehouse_zone_id', 'id'], ['zone_name', 'text']]
        });

        common.sendData(res, resultData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function assignUserForInvoice(req, res) {
    const { body, user } = req;
    const { task_type, user_id, bill_code } = body;

    try {
        const groupId = common.getUUIDByTime(30);
        const taskName = GLBConfig.PRINT_INVOICE[task_type];
        const result = await task.createTask(user, taskName, task_type, user_id, bill_code, taskName, '', groupId);
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//出库列表
async function getSaleOutOrder(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        let queryStr =
            `select
                a.order_id, a.mrp_domain_id, a.total_count, ord.biz_code as order_biz_code
                , cc.corporateclients_name
                , ifnull(d.done_count, 0) as done_count
                , if(d.done_count is null, 1, if(d.done_count < a.total_count, 2, 3)) as order_status
                from (
                select ad.order_id, ad.mrp_domain_id, sum(ad.demand_amount) as total_count
                from tbl_erc_alldemand as ad
                group by ad.order_id, ad.mrp_domain_id) a
                left join tbl_erc_order ord
                on a.order_id = ord.order_id
                left join tbl_erc_corporateclients cc
                on ord.purchaser_corporateclients_id = cc.corporateclients_id
                left join (
                select ia.order_id, sum(ia.account_operate_amount) as done_count
                from tbl_erc_inventoryaccount as ia
                where ia.account_operate_type = 2
                group by ia.order_id) d
                on a.order_id = d.order_id
                where true`;
        let replacements = [];

        if (user.domain_id) {
            queryStr += ` and a.mrp_domain_id = ?`;
            replacements.push(user.domain_id);
        }

        if (doc.orderType) {
            queryStr += ' and b.order_type = ?';
            replacements.push(doc.orderType);
        }

        if (doc.search_keyword) {
            queryStr += ' and ord.biz_code like ?';
            let search_keyword = '%' + doc.search_keyword + '%';
            replacements.push(search_keyword);
        }

        if (doc.search_type == 1) {
            queryStr += ' and d.done_count is null';
        } else if (doc.search_type == 2) {
            queryStr += ' and d.done_count < a.total_count';
        } else if (doc.search_type == 3) {
            queryStr += ' and d.done_count = a.total_count';
        }

        queryStr += ` order by a.order_id asc`;

        let result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//按类型搜索出库列表
async function getSaleOutOrderByType(req, res) {
    logger.debug('getSaleOutOrderByType');
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        let queryStr = [
            `select
                a.order_id, a.mrp_domain_id, a.total_count, b.order_type, b.user_id as custom_code
                , c.username, c.email, c.phone, c.name as custom_name
                , ifnull(d.done_count, 0) as done_count
                , if(d.done_count is null, 1, if(d.done_count < a.total_count, 2, 3)) as order_status
                from (
                select ad.order_id, ad.mrp_domain_id, sum(ad.demand_amount) as total_count
                from tbl_erc_alldemand as ad
                group by ad.order_id, ad.mrp_domain_id) a
                left join tbl_erc_order b
                on a.order_id = b.order_id
                left join tbl_common_user c
                on b.user_id = c.user_id
                left join (
                select ia.order_id, sum(ia.account_operate_amount) as done_count
                from tbl_erc_inventoryaccount as ia
                where ia.account_operate_type = 2
                group by ia.order_id) d
                on a.order_id = d.order_id
                where true`,
            `select
                a.order_id, a.mrp_domain_id, a.total_count, b.user_id, b.order_type
                , c.estate_no as custom_code, c.estate_name as custom_name
                , ifnull(d.done_count, 0) as done_count
                , if(d.done_count is null, 1, if(d.done_count < a.total_count, 2, 3)) as order_status
                from (
                select ad.order_id, ad.mrp_domain_id, sum(ad.demand_amount) as total_count
                from tbl_erc_alldemand as ad
                group by ad.order_id, ad.mrp_domain_id) a
                left join tbl_erc_order b
                on a.order_id = b.order_id
                left join tbl_erc_estate c
                on b.estate_id = c.estate_id
                left join (
                select ia.order_id, sum(ia.account_operate_amount) as done_count
                from tbl_erc_inventoryaccount as ia
                where ia.account_operate_type = 2
                group by ia.order_id) d
                on a.order_id = d.order_id
                where true`,
            `select
                a.order_id, a.mrp_domain_id, a.total_count, b.user_id, b.order_type
                , c.domain as custom_code, c.domain_name as custom_name
                , ifnull(d.done_count, 0) as done_count
                , if(d.done_count is null, 1, if(d.done_count < a.total_count, 2, 3)) as order_status
                from (
                select ad.order_id, ad.mrp_domain_id, sum(ad.demand_amount) as total_count
                from tbl_erc_alldemand as ad
                group by ad.order_id, ad.mrp_domain_id) a
                left join tbl_erc_order b
                on a.order_id = b.order_id
                left join tbl_common_domain c
                on b.purchase_domain_id = c.domain_id
                left join (
                select ia.order_id, sum(ia.account_operate_amount) as done_count
                from tbl_erc_inventoryaccount as ia
                where ia.account_operate_type = 2
                group by ia.order_id) d
                on a.order_id = d.order_id
                where true`
        ];
        let replacements = [];
        queryStr[doc.orderType] += ` and b.order_type = ?`;
        replacements.push(GLBConfig.OTYPEINFO[doc.orderType].value);

        if (user.domain_id) {
            queryStr[doc.orderType] += ` and a.mrp_domain_id = ?`;
            replacements.push(user.domain_id);
        }

        if (doc.search_keyword) {
            queryStr[doc.orderType] += ' and a.order_id like ?';
            let search_keyword = '%' + doc.search_keyword + '%';
            replacements.push(search_keyword);
        }

        if (doc.search_type == 1) {
            queryStr[doc.orderType] += ' and d.done_count is null';
        } else if (doc.search_type == 2) {
            queryStr[doc.orderType] += ' and d.done_count < a.total_count';
        } else if (doc.search_type == 3) {
            queryStr[doc.orderType] += ' and d.done_count = a.total_count';
        }

        queryStr[doc.orderType] += ` order by a.order_id asc`;

        let result = await common.queryWithGroupByCount(sequelize, req, queryStr[doc.orderType], replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//创建出库订单
async function createSaleOutOrder(req, res) {
    logger.debug('createSaleOutOrder');
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let saleOut = await tb_inventoryorder.create({
            domain_id: doc.saleOrderData.domain_id,
            bill_code: doc.saleOrderData.bill_code,
            bs_order_id: doc.saleOrderData.bs_order_id,
            warehouse_id: doc.saleOrderData.warehouse_id,
            account_operate_type: doc.saleOrderData.account_operate_type,
            ior_contact: doc.saleOrderData.ior_contact,
            ior_phone: doc.saleOrderData.ior_phone
        });

        if (saleOut) {
            let saleOrderItems = await tb_inventoryaccount.bulkCreate(doc.saleOrderItems);
            if (saleOrderItems) {
                let pushArray = [];
                for (let i = 0; i < saleOrderItems.length; i++) {
                    let item = saleOrderItems[i];
                    if (doc.safetyStock) {
                        let pushData = await inventoryControl.dealWithSafeInventoryOut(item.warehouse_id, item.materiel_id,
                            item.account_operate_amount, item.domain_id, item.warehouse_zone_id);
                        pushArray.push(pushData);
                    } else {
                        let pushData = await inventoryControl.dealWithInventoryOut(item.warehouse_id, item.materiel_id,
                            item.account_operate_amount, item.order_id, item.domain_id, item.warehouse_zone_id);
                        pushArray.push(pushData);
                    }
                }
                common.sendData(res, pushArray);
            } else {
                common.sendError(res, 'saleoutorder_01', '出库订单明细生成失败');
            }
        } else {
            common.sendError(res, 'saleoutorder_02', '出库订单生成失败');
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}
//获取出库历史
async function getSaleOutOrderHistory(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        let queryStr =
            `select
             a.ior_id, a.domain_id, a.bill_code, a.bs_order_id, a.warehouse_id
             , DATE_FORMAT(a.created_at,'%Y-%m-%d %H:%i') as created_at
             , d.corporateclients_contact_phone
             , b.done_count, wh.warehouse_name
             , c.biz_code as order_biz_code, c.purchaser_corporateclients_id, d.corporateclients_name
             from tbl_erc_inventoryorder a
             left join (
             select ia.bill_code, ia.account_operate_type, sum(ia.account_operate_amount) as done_count
             from tbl_erc_inventoryaccount as ia
             where ia.account_operate_type = 2
             group by ia.bill_code, account_operate_type) b
             on a.bill_code = b.bill_code
             left join tbl_erc_order c
             on a.bs_order_id = c.order_id
             left join tbl_erc_corporateclients d
             on c.purchaser_corporateclients_id = d.corporateclients_id
             left join tbl_erc_warehouse wh
             on wh.warehouse_id = a.warehouse_id
             where true
             and b.account_operate_type = 2`;
        let replacements = [];
        if (user.domain_id) {
            queryStr += ` and a.domain_id = ?`;
            replacements.push(user.domain_id);
        }

        if (doc.start_date) {
            queryStr += ` and to_days(a.created_at) >= to_days(?)`;
            replacements.push(doc.start_date);
        }
        if (doc.end_date) {
            queryStr += ` and to_days(a.created_at) <= to_days(?)`;
            replacements.push(doc.end_date);
        }
        if (doc.bill_code) {
            queryStr += ` and a.bill_code = ?`;
            replacements.push(doc.bill_code);
        }
        if (doc.bs_order_id) {
            queryStr += ` and a.bs_order_id = ?`;
            replacements.push(doc.bs_order_id);
        }
        if (doc.user_name) {
            queryStr += ` and (d.name like ?`;
            replacements.push('%' + doc.user_name + '%');
            queryStr += ` or d.name like ?)`;
            replacements.push('%' + doc.user_name + '%');
        }

        queryStr += ` order by a.ior_id asc`;
        logger.debug('queryStr:', queryStr);

        let result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//获取出库明细
async function saleOutOrderHistoryDetail(req, doc, user) {
    let returnData = {};
    let queryStr =
        `select
         a.bill_code, a.domain_id, a.order_id, a.p_order_id, a.account_operate_amount
         , a.warehouse_id, a.warehouse_zone_id, a.company_name, a.account_note, a.created_at
         , b.materiel_id, b.materiel_code, b.materiel_name, b.materiel_format, b.materiel_unit, b.materiel_state_management
         , c.order_domain_id, c.supplier_id
         , sm.store_price, ord.biz_code as order_biz_code
         from tbl_erc_inventoryaccount a
         left join tbl_erc_order ord
         on ord.order_id = a.order_id
         left join tbl_erc_materiel b
         on a.materiel_id = b.materiel_id
         left join tbl_erc_purchaseorder c
         on a.order_id = c.order_id
         left join tbl_erc_stockmap sm
         on (a.materiel_id = sm.materiel_id and a.warehouse_id = sm.warehouse_id and a.warehouse_zone_id = sm.warehouse_zone_id and a.domain_id = sm.domain_id)
         where true
         and a.account_operate_type = 2`;
    let replacements = [];
    if (user.domain_id) {
        queryStr += ` and a.domain_id = ?`;
        replacements.push(user.domain_id);
    }

    if (doc.bill_code) {
        queryStr += ` and a.bill_code = ?`;
        replacements.push(doc.bill_code);
    }
    if (doc.materiel) {
        queryStr += ` and (b.materiel_code like ?`;
        replacements.push(doc.materiel);
        queryStr += ` or b.materiel_name like ?)`;
        replacements.push(doc.materiel);
    }
    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    returnData.total = result.count;
    returnData.rows = result.data;

    return returnData;
}
//获取出库历史明细
async function getSaleOutOrderHistoryDetail(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = await saleOutOrderHistoryDetail(req, doc, user);
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//其他出库历史
async function getOtherOutOrderHistory(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        let queryStr =
            `select
                sum(ia.account_operate_amount) as amount, ia.bill_code, ia.order_id, ia.warehouse_id
                , DATE_FORMAT(ia.created_at,'%Y-%m-%d %H:%i') as created_at
                , ord.biz_code as order_biz_code, wh.warehouse_name
                from tbl_erc_inventoryaccount ia
                left join tbl_erc_order ord
                on ord.order_id = ia.order_id
                left join tbl_erc_warehouse wh
                on wh.warehouse_id = ia.warehouse_id
                where true
                and ia.account_operate_type = 4
                and ia.domain_id = ?`;
        let replacements = [user.domain_id];
        if (doc.start_date) {
            queryStr += ` and to_days(created_at) >= to_days(?)`;
            replacements.push(doc.start_date);
        }
        if (doc.end_date) {
            queryStr += ` and to_days(created_at) <= to_days(?)`;
            replacements.push(doc.end_date);
        }
        if (doc.bill_code) {
            queryStr += ` and bill_code = ?`;
            replacements.push(doc.bill_code);
        }
        if (doc.order_id) {
            queryStr += ` and order_id = ?`;
            replacements.push(doc.order_id);
        }

        queryStr += ` group by ia.bill_code, ia.order_id, ia.warehouse_id, ia.created_at`;
        queryStr += ` order by bill_code desc`;
        let result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

/*async function getProductiveTaskDepartment(productivetask_id) {
    const queryStr =
        `select
            dpt.department_id, dpt.department_name
            from (
            select
            pt.productivetask_id, ptp.department_id
            from tbl_erc_productivetask pt
            left join tbl_erc_productivetaskprocess ptp
            on pt.productivetask_id = ptp.productivetask_id
            where true
            and pt.productivetask_id = ?
            group by pt.productivetask_id, ptp.department_id) gpt
            left join tbl_erc_department dpt
            on dpt.department_id = gpt.department_id`;

    const replacements = [ productivetask_id ];
    return await common.simpleSelect(sequelize, queryStr, replacements);
}*/

//生产领料历史
async function getProductOutOrderHistory(req, res) {
    try {
        const { body, user } = req;
        const { domain_id } = user;
        const { production_type, start_date, end_date, productivetask_code, ps_bill_code } = body;
        const returnData = {};

        let queryStr =
            `select
             a.ior_id, a.bill_code, a.bs_order_id, a.warehouse_id, a.ior_phone, a.account_operate_type
             , DATE_FORMAT(a.created_at,'%Y-%m-%d %H:%i') as created_at
             , b.done_count, pt.productivetask_code, pt.order_id, pt.biz_code
             , ord.biz_code as order_biz_code, wh.warehouse_name
             from tbl_erc_inventoryorder a
             left join (select ia.bill_code, sum(ia.account_operate_amount) as done_count
             from tbl_erc_inventoryaccount as ia
             where ia.account_operate_type = ?
             group by ia.bill_code, ia.account_operate_type) b
             on a.bill_code = b.bill_code
             left join tbl_erc_productivetask pt
             on a.bs_order_id = pt.productivetask_id
             left join tbl_erc_order ord
             on ord.order_id = pt.order_id
             left join tbl_erc_warehouse wh
             on wh.warehouse_id = a.warehouse_id
             where true
             and a.account_operate_type = ?
             and a.domain_id = ?`;

        const replacements = [production_type, production_type, domain_id];

        if (start_date) {
            queryStr += ` and to_days(a.created_at) >= to_days(?)`;
            replacements.push(start_date);
        }
        if (end_date) {
            queryStr += ` and to_days(a.created_at) <= to_days(?)`;
            replacements.push(end_date);
        }
        if (ps_bill_code) {
            queryStr += ` and a.bill_code = ?`;
            replacements.push(ps_bill_code);
        }
        if (productivetask_code) {
            queryStr += ` and pt.biz_code = ?`;
            replacements.push(productivetask_code);
        }

        queryStr += ` order by a.bill_code desc`;
        const result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        if (parseInt(production_type) === 6) {
            for (const returnItem of returnData.rows) {
                const { bs_order_id } = returnItem;
                const [ departmentResult ] = await getProductiveTaskDepartment(bs_order_id);
                if (departmentResult) {
                    returnItem.department_name = departmentResult.department_name;
                }
            }
        } else if (parseInt(production_type) === 8) {
            for (const returnItem of returnData.rows) {
                const { department_id } = returnItem;
                const supplierResult = await tb_supplier.findOne({
                    where: {
                        supplier_id: department_id
                    }
                });
                if (supplierResult) {
                    returnItem.supplier_name = supplierResult.supplier_name;
                }
            }
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//其他出库历史
async function otherOutHistoryDetail(req, doc) {
    let returnData = {};
    let user = req.user;
    let queryStr = `select a.bill_code,a.domain_id,a.order_id,a.p_order_id,a.account_operate_amount,
        a.warehouse_zone_id, a.company_name, a.account_note, a.created_at,
        b.materiel_id, b.materiel_code, b.materiel_name, b.materiel_format, b.materiel_unit,
        b.materiel_cost, concat(b.materiel_tax * 100, '%') as materiel_tax,
        format((b.materiel_cost * a.account_operate_amount), 2) as pure_cost,
        format(((b.materiel_cost + (b.materiel_cost * b.materiel_tax)) * a.account_operate_amount), 2) as tax_cost
        , sm.store_price, ord.biz_code as order_biz_code
        from tbl_erc_inventoryaccount a
        left join tbl_erc_order ord
        on ord.order_id = a.order_id
        left join tbl_erc_materiel b on a.materiel_id = b.materiel_id
        left join tbl_erc_stockapply c on a.order_id = c.stockapply_id
        left join tbl_erc_stockmap sm
         on (a.materiel_id = sm.materiel_id and a.warehouse_id = sm.warehouse_id and a.warehouse_zone_id = sm.warehouse_zone_id and a.domain_id = sm.domain_id)
         where true and a.account_operate_type = 4 and a.bill_code = ? and a.domain_id = ?`;
    let replacements = [doc.bill_code,user.domain_id];
    if (doc.materiel) {
        queryStr += ` and (b.materiel_code like ?`;
        replacements.push(doc.materiel);
        queryStr += ` or b.materiel_name like ?)`;
        replacements.push(doc.materiel);
    }
    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    returnData.total = result.count;
    returnData.rows = result.data;
    return returnData;
}
//其他出库历史明细
async function getOtherOutHistoryDetail(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = await otherOutHistoryDetail(req, doc);
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//其他出库打印
async function otherOutHistoryPrintAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = await otherOutHistoryDetail(req, doc);
        if (doc.filetype != 'pdf' && doc.filetype != 'image') {
            return common.sendError(res, 'common_api_03')
        }

        let fileUrl = await common.ejs2File('erc/inventorymanage/ERCOtherOutInvoice.ejs', {
            ejsData: {
                bill_code: doc.bill_code,
                otherOrderItemList: JSON.parse(JSON.stringify(returnData.rows))
            }
        }, {
            htmlFlag: false
        }, doc.filetype)
        common.sendData(res, {
            url: fileUrl
        });
    } catch (error) {
        common.sendFault(res, error);
    }
}
//其他出库订单
async function getOtherOutOrder(req, res) {
    try {
        const { body, user } = req;
        const { domain_id } = user;
        const returnData = {};

        let queryStr = 'select * from tbl_erc_otherstockout where state = ? and domain_id = ?';

        const replacements = [ GLBConfig.ENABLE, domain_id ];

        if (body.search_order) {
            queryStr += ' and stockoutapply_id like ?';
            replacements.push('%' + body.search_order + '%');
        }
        queryStr += ' order by created_at desc';
        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//其他出库物料
async function getSaleOutOrderMateriel(req,res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let queryStr =
            `select a.alldemand_id, a.materiel_id, a.order_id, a.demand_amount, b.materiel_code, b.materiel_name
             , b.materiel_format, b.materiel_unit, b.materiel_manage, b.materiel_cost, b.materiel_state_management
             , c.domain_id, c.user_id, ifnull(d.done_count, 0) as done_count 
             from tbl_erc_alldemand a
             left join tbl_erc_materiel b on a.materiel_id = b.materiel_id
             left join tbl_erc_order c on a.order_id = c.order_id
             left join (select ia.order_id, ia.materiel_id, sum(ia.account_operate_amount) as done_count 
                from tbl_erc_inventoryaccount as ia
                where true  and ia.order_id = ? and ia.account_operate_type = 2 group by ia.materiel_id, ia.order_id) d 
                on a.materiel_id = d.materiel_id
             where true
             and c.domain_id = ?`;
             // and (d.done_count is null or d.done_count < a.demand_amount)`;
        const replacements = [ doc.order_id, user.domain_id ];

        if (doc.order_id) {
            queryStr += ` and a.order_id = ?`;
            replacements.push(doc.order_id);
        }

        if (doc.search_text) {
            queryStr += ` and (b.materiel_code like ? or b.materiel_name like ?)`;
            replacements.push(doc.search_text);
            replacements.push(doc.search_text);
        }

        queryStr += ` order by a.alldemand_id asc`;

        let result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//其他出库操作
async function getSaleOutOrderMaterielOperate(req,res){
    try {
        const { body, user } = req;
        const { order_id, materielIds, warehouse_id, warehouse_zone_id, search_text } = body;
        let returnData = {};

        let queryStr =
            `select
                a.alldemand_id, a.materiel_id, a.order_id, a.demand_amount
                , b.materiel_code, b.materiel_name, b.materiel_format, b.materiel_unit, b.materiel_state_management, b.materiel_manage, b.materiel_cost
                , c.domain_id, c.user_id, ifnull(d.done_count, 0) as done_count
                , stm.store_price
                , 0 as stock_operate_amount
                from tbl_erc_alldemand a
                left join tbl_erc_materiel b on a.materiel_id = b.materiel_id
                left join tbl_erc_order c on a.order_id = c.order_id
                left join (
                select ia.order_id, ia.materiel_id, sum(ia.account_operate_amount) as done_count
                from tbl_erc_inventoryaccount as ia
                where true
                and ia.order_id = ?
                and ia.account_operate_type = 2
                group by ia.materiel_id, ia.order_id) d 
                on a.materiel_id = d.materiel_id
                left join tbl_erc_stockmap stm
                on if (b.materiel_manage = 1,
                stm.materiel_id = b.materiel_id and stm.warehouse_id = ? and stm.warehouse_zone_id = ?,
                stm.materiel_id = b.materiel_id and stm.order_id = a.order_id and stm.warehouse_id = ? and stm.warehouse_zone_id = ?)
                where true
                and (d.done_count is null or d.done_count < a.demand_amount)` ;
        const replacements = [ order_id, warehouse_id, warehouse_zone_id, warehouse_id, warehouse_zone_id ];

        if (user.domain_id) {
            queryStr += ` and c.domain_id = ?`;
            replacements.push(user.domain_id);
        }

        if (order_id) {
            queryStr += ` and a.order_id = ?`;
            replacements.push(order_id);
        }

        if (materielIds) {
            queryStr += ` and a.materiel_id in (${materielIds})`;
        }

        if (search_text) {
            queryStr += ` and (b.materiel_code like ? or b.materiel_name like ?)`;
            replacements.push(search_text);
            replacements.push(search_text);
        }

        queryStr += ` order by a.alldemand_id asc`;

        const result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//生产领料历史
async function productOutHistoryDetail(req, doc) {
    let returnData = {};
    let user = req.user;
    let queryStr =
        `select
            a.bill_code,a.domain_id,a.order_id,a.p_order_id,a.account_operate_amount
            , a.warehouse_zone_id, a.company_name, a.account_note, a.created_at
            , b.materiel_id, b.materiel_code, b.materiel_name, b.materiel_format, b.materiel_unit, b.materiel_state_management
            , sm.store_price, ord.biz_code as order_biz_code
            from tbl_erc_inventoryaccount a
            left join tbl_erc_order ord
            on ord.order_id = a.order_id
            left join tbl_erc_materiel b on a.materiel_id = b.materiel_id
            left join tbl_erc_stockapply c on a.order_id = c.stockapply_id
            left join tbl_erc_stockmap sm
            on (a.materiel_id = sm.materiel_id and a.warehouse_id = sm.warehouse_id and a.warehouse_zone_id = sm.warehouse_zone_id and a.domain_id = sm.domain_id)
            where true
            and a.bill_code = ?
            and a.domain_id = ?`;
    const replacements = [doc.bill_code, user.domain_id];
    if (doc.materiel) {
        queryStr += ` and (b.materiel_code like ?`;
        replacements.push(doc.materiel);
        queryStr += ` or b.materiel_name like ?)`;
        replacements.push(doc.materiel);
    }
    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    returnData.total = result.count;
    returnData.rows = result.data;
    return returnData;
}

//生产领料明细
async function getProductOutHistoryDetail(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = await productOutHistoryDetail(req, doc);
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//初始化出库数据
async function initSaleOut(req, res) {
    try {
        const { body, user } = req;

        let returnData = {
            stockModelInfo: GLBConfig.MATERIELMANAGE, //库存管理模式
            stockoutapplyState: GLBConfig.STOCKOUTAPPLYSTATE,//申请单状态
            unitInfo: await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'),//单位
            materielStateManagement: GLBConfig.MATERIELSTATEMANAGEMENT,
            departmentInfo: await getProductiveTaskDepartment(body.productivetask_id)
        };

        returnData.warehouseId = await tb_warehouse.findAll({
            where: {
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id
            },
            attributes: [['warehouse_id', 'id'], ['warehouse_name', 'text']]
        });

        returnData.warehouseZoneId = await tb_warehousezone.findAll({
            where: {
                state: GLBConfig.ENABLE,
                warehouse_id: body.warehouse_id
            },
            attributes: [['warehouse_zone_id', 'id'], ['zone_name', 'text']]
        });

        returnData.staffInfo = await tb_user.findAll({
            where: {
                user_type: '01',
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id
            },
            attributes: [['user_id', 'id'], ['name', 'text']]
        });

        common.sendData(res, returnData);
    } catch (error) {
        common.sendError(res, error)
    }
};
//获取仓区
async function getWarehouseZone(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let replacements = [];
        let queryStr = 'select * from tbl_erc_warehousezone where state=1 and warehouse_id=?';
        replacements.push(doc.warehouse_id);
        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        let returnData = [];
        for (let i = 0; i < queryRst.length; i++) {
            let elem = {};
            elem.id = queryRst[i].warehouse_zone_id;
            elem.value = queryRst[i].warehouse_zone_id;
            elem.text = queryRst[i].zone_name;
            returnData.push(elem)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }

};
//获取出库数量
async function checkOutNumber(req,res){
    let doc = common.docTrim(req.body),
        user = req.user,queryStr='',replacements=[];
    if(doc.materiel_manage==1){
        queryStr = 'select sum(sm.current_amount) as sumItemAmount from tbl_erc_stockmap sm where sm.state = 1 and sm.materiel_id = ?';
        replacements.push(doc.materiel_id);
        if(doc.warehouse_id){
            queryStr +=' and sm.warehouse_id = ?';
            replacements.push(doc.warehouse_id);
        }
        if(doc.warehouse_zone_id){
            queryStr +=' and sm.warehouse_zone_id = ?';
            replacements.push(doc.warehouse_zone_id);
        }
        let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        if(parseInt(doc.stock_operate_amount)>parseInt(result[0].sumItemAmount)){
            common.sendError(res, 'stockoutapplydetail_02');
        }else {
            common.sendData(res, {});
        }
    }else{
        queryStr='select * from tbl_erc_stockmap where state=1 and materiel_id=?';
        replacements.push(doc.materiel_id);
        if(doc.order_id){
            queryStr +=' and order_id=?';
            replacements.push(doc.order_id);
        }
        if(doc.warehouse_zone_id){
            queryStr +=' and warehouse_zone_id=?';
            replacements.push(doc.warehouse_zone_id);
        }
        if(doc.warehouse_id){
            queryStr +=' and warehouse_id=?';
            replacements.push(doc.warehouse_id);
        }

        let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        if(result && result.length==0){
            return common.sendError(res, 'stock_04');
        }else if (result[0].current_amount<doc.stock_operate_amount){
            return common.sendError(res, 'stock_05');
        }else{
            common.sendData(res, {});
        }

    }
}

//销售出库
async function StockSaleOut(req, res) {
    const { body, user } = req;
    const { order_id, warehouse_id, warehouse_zone_id, total_price, total_count, materiel } = body;

    try {
        const returnData = await sequelize.transaction(async transaction => {
            const bill_code = await genBizCode(CODE_NAME.XSCK, user.domain_id, 6, transaction);

            for (const outputItem of materiel) {
                const { materiel_id, materiel_manage, stock_operate_amount } = outputItem;
                const int_stock_operate_amount = parseInt(stock_operate_amount);
                if (int_stock_operate_amount > 0) {
                    const queryParams = {
                        materiel_id,
                        warehouse_id,
                        warehouse_zone_id,
                        state: GLBConfig.ENABLE
                    };
                    if (parseInt(materiel_manage) === 1) {//安全库存管理
                        queryParams.storage_type = 1;
                    } else {
                        queryParams.order_id = order_id;
                        queryParams.storage_type = 2;
                    }

                    const stockMap = await tb_stockmap.findOne({
                        where: {
                            ...queryParams
                        },
                        transaction
                    });

                    if (!stockMap) {
                        throw new Error('没有库存信息');
                    }

                    stockMap.price_amount -= (stockMap.price_amount / stockMap.current_amount) * int_stock_operate_amount;
                    stockMap.current_amount -= int_stock_operate_amount;
                    if (stockMap.current_amount < 0) {
                        throw new Error('出库数量不能大于库存数量');
                    }
                    await stockMap.save({ transaction });

                    const orderResult = await tb_order.findOne({
                        where: {
                            order_id
                        }
                    });

                    if (!orderResult) {
                        throw new Error('没有销售订单信息');
                    }

                    const corporateClient = await tb_corporateclients.findOne({
                        where: {
                            corporateclients_id: orderResult.purchaser_corporateclients_id
                        }
                    });

                    if (!corporateClient) {
                        throw new Error('没有客户信息');
                    }

                    await tb_financerecorditem.create({
                        domain_id: user.domain_id,
                        materiel_id,
                        wms_type: 2,
                        manage_type: 1,
                        organization: corporateClient.corporateclients_name,
                        store_amount: int_stock_operate_amount,
                        store_price: stockMap.store_price
                    }, { transaction });

                    await tb_inventoryaccount.create({
                        domain_id: user.domain_id,
                        bill_code,
                        order_id,
                        warehouse_id,
                        warehouse_zone_id,
                        materiel_id,
                        inventory_price: stockMap.store_price,
                        account_operate_amount: int_stock_operate_amount,
                        account_operate_type: 2,
                        company_name: corporateClient.corporateclients_name
                    }, { transaction });

                    const relationOptions = {
                        domain_id: user.domain_id,
                        relation_id: order_id,
                        total_count,
                        actual_count: int_stock_operate_amount,
                        inventory_type: 2
                    };
                    const inventoryTotal = await recordInventoryTotal(relationOptions, transaction);

                    if (inventoryTotal.inventory_state === 2) {
                        if (orderResult.order_state === 'SHIPPED') {
                            orderResult.order_state = 'FINISHI';
                            await orderResult.save({ transaction });

                            const orderWorkFlow = await tb_orderworkflow.findOne({
                                where: {
                                    order_id: orderResult.order_id,
                                    orderworkflow_state: 'FINISHI'
                                }
                            });

                            if (!orderWorkFlow) {
                                await tb_orderworkflow.create({
                                    order_id: orderWorkFlow.order_id,
                                    orderworkflow_state: 'FINISHI',
                                    orderworkflow_desc: '已完成'
                                }, { transaction });
                            }
                        }
                    }

                    await recordSaleOutReplacePrice(user, materiel_id, order_id, bill_code, int_stock_operate_amount, 2, transaction);
                }
            }

            await genOrderMaterielOutSaleRecord(order_id, total_price, materiel, transaction);

            return await tb_inventoryorder.create({
                domain_id: user.domain_id,
                bill_code,
                bs_order_id: order_id,
                warehouse_id,
                account_operate_type: 2,
                ior_contact: '',
                ior_phone: ''
            }, { transaction });
        });

        common.sendData(res, returnData);
    } catch (error) {
        common.sendErcError(res, error);
    }
}
//副产品列表
async function getProductOutOrderAct(req, res) {
    try {
        const { body, user } = req;
        const returnData = {};

        let queryStr =
            `select
                pt.productivetask_id, pt.biz_code, pt.department_id, pt.stock_out_state
                , ord.biz_code as order_biz_code
                , mat.materiel_code, mat.materiel_name, mat.materiel_format, mat.materiel_unit, mat.materiel_state_management
                from tbl_erc_productivetask pt
                left join tbl_erc_order ord
                on ord.order_id = pt.order_id
                left join tbl_erc_materiel mat
                on pt.materiel_id = mat.materiel_id
                where true
                and pt.state = 1
                and pt.domain_id = ?
                and pt.outsource_sign = 1`;

        /*let queryStr =
            `select
                gpt.*
                , ord.biz_code as order_biz_code
                , mat.materiel_code, mat.materiel_name, mat.materiel_format, mat.materiel_unit, mat.materiel_state_management
                from (
                select pt.biz_code, pt.order_id, pt.materiel_id, pt.stock_out_state
                from tbl_erc_productivetask pt
                where true
                and pt.domain_id = ?
                and pt.outsource_sign = 1
                group by pt.biz_code, pt.order_id, pt.materiel_id, pt.stock_out_state) gpt
                left join tbl_erc_order ord
                on ord.order_id = gpt.order_id
                left join tbl_erc_materiel mat
                on mat.materiel_id = gpt.materiel_id`;*/

        const replacements = [user.domain_id];

        if (body.productivetask_code) {
            queryStr += ` and pt.biz_code = ?`;
            replacements.push(body.productivetask_code);
        }
        if (body.stock_out_state > 0) {
            queryStr += ` and pt.stock_out_state = ?`;
            replacements.push(body.stock_out_state);
        }
        queryStr += ` order by pt.biz_code desc`;

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//副产品明细
async function getProductOutItemsAct(req, res) {
    try {
        const { body, user } = req;
        const returnData = {};

        let queryStr = '';
        const replacements = [];

        if (body.output_storage) {
            queryStr =
                `select
                    ptd.*, pt.order_id
                    , mat.materiel_code, mat.materiel_name, mat.materiel_format, mat.materiel_unit
                    , mat.materiel_state_management, mat.materiel_manage
                    , stm.current_amount, stm.store_price
                    , 0 as stock_operate_amount
                    from tbl_erc_productivetask pt
                    right join tbl_erc_productivetaskdetail ptd
                    on pt.productivetask_id = ptd.productivetask_id
                    left join tbl_erc_materiel mat
                    on ptd.materiel_id = mat.materiel_id
                    left join tbl_erc_stockmap stm
                    on if (mat.materiel_manage = 1,
                    stm.materiel_id = ptd.materiel_id and stm.warehouse_id = ? and stm.warehouse_zone_id = ?,
                    stm.materiel_id = ptd.materiel_id and stm.order_id = pt.order_id and stm.warehouse_id = ? and stm.warehouse_zone_id = ?)
                    where true
                    and pt.domain_id = ?
                    and pt.productivetask_id = ?
                    and ptd.stock_out_number < ptd.taskdetaildesign_number`;

            replacements.push(body.warehouse_id);
            replacements.push(body.warehouse_zone_id);
            replacements.push(body.warehouse_id);
            replacements.push(body.warehouse_zone_id);
            replacements.push(user.domain_id);
            replacements.push(body.productivetask_id);
        } else {
            //成品
            queryStr =
                `select
                ptd.*, pt.order_id
                , mat.materiel_code, mat.materiel_name, mat.materiel_format, mat.materiel_unit, mat.materiel_state_management
                , 0 as stock_operate_amount
                from tbl_erc_productivetask pt
                right join tbl_erc_productivetaskdetail ptd
                on pt.productivetask_id = ptd.productivetask_id
                left join tbl_erc_materiel mat
                on ptd.materiel_id = mat.materiel_id
                where true
                and pt.domain_id = ?
                and pt.productivetask_id = ?`;

            replacements.push(user.domain_id);
            replacements.push(body.productivetask_id);
        }

        if (body.productiveDetailIds) {
            queryStr += ` and ptd.productivetaskdetail_id in (${body.productiveDetailIds})`;
        }

        if (body.search_text) {
            queryStr += ' and (mat.materiel_code like ? or mat.materiel_name like ?)';
            replacements.push(`%${body.search_text}%`);
            replacements.push(`%${body.search_text}%`);
        }
        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//领料出库/委外出库
async function submitProductOutItemsAct(req, res) {
    try {
        const { body, user } = req;
        const { materiels, production_type, productivetask_id, warehouse_id, warehouse_zone_id, company_name } = body;

        const returnData = await sequelize.transaction(async transaction => {
            let bill_code = '';
            if (parseInt(production_type) === 6) {
                bill_code = await genBizCode(CODE_NAME.LLCK, user.domain_id, 6, transaction);
            } else if (parseInt(production_type) === 8) {
                bill_code = await genBizCode(CODE_NAME.WWCK, user.domain_id, 6, transaction);
            }

            const productiveTask = await tb_productivetask.findOne({
                where: {
                    productivetask_id,
                    domain_id: user.domain_id
                },
                transaction
            });

            if (!productiveTask) {
                throw new Error('无法取得生产任务单');
            }

            const dtlDesignNumber = await tb_productivetaskdetail.sum('taskdetaildesign_number', {
                where: {
                    productivetask_id
                },
                transaction
            }) || 0;

            if (dtlDesignNumber === 0) {
                throw new Error('取得投料总数量错误');
            }

            if (materiels.length > 0) {
                for (const outputItem of materiels) {
                    const { materiel_id, order_id, stock_operate_amount } = outputItem;
                    const int_stock_operate_amount = parseInt(stock_operate_amount);
                    const materiel = await tb_materiel.findOne({
                        where: {
                            materiel_id,
                            state: GLBConfig.ENABLE
                        },
                        transaction
                    });
                    if (!materiel) {
                        throw new Error('未找到要入库物料');
                    }

                    const queryParams = {
                        materiel_id,
                        state: GLBConfig.ENABLE,
                        warehouse_id,
                        warehouse_zone_id,
                    };
                    if (parseInt(materiel.materiel_manage) === 2) { //销售订单管理
                        queryParams.order_id = order_id;
                        queryParams.storage_type = 2;
                    } else {
                        queryParams.storage_type = 1;
                    }

                    const stockMap = await tb_stockmap.findOne({
                        where: {
                            ...queryParams
                        },
                        transaction
                    });

                    if (!stockMap) {
                        throw new Error(`${materiel.materiel_code}缺少库存信息`);
                    }

                    stockMap.price_amount -= (stockMap.price_amount / stockMap.current_amount) * int_stock_operate_amount;
                    stockMap.current_amount -= int_stock_operate_amount;
                    if (stockMap.current_amount < 0) {
                        throw new Error('出库数量不能大于库存数量');
                    }
                    await stockMap.save({ transaction });

                    let companyName = '';
                    if (parseInt(production_type) === 6) {
                        companyName = company_name;
                    } else if (parseInt(production_type) === 8) {
                        const supplier = await tb_supplier.findOne({
                            where: {
                                supplier_id: productiveTask.department_id
                            }
                        });

                        if (supplier) {
                            companyName = supplier.supplier_name;
                        }
                    }

                    await tb_financerecorditem.create({
                        domain_id: user.domain_id,
                        materiel_id,
                        wms_type: 2,
                        manage_type: {6: 2, 8: 4}[production_type],
                        organization: companyName,
                        store_amount: int_stock_operate_amount,
                        store_price: stockMap.store_price
                    }, { transaction });

                    //收发存明细
                    await tb_inventoryaccount.create({
                        domain_id: user.domain_id,
                        bill_code,
                        order_id,
                        p_order_id: productivetask_id,
                        warehouse_id,
                        warehouse_zone_id,
                        materiel_id,
                        inventory_price: stockMap.store_price,
                        account_operate_amount: int_stock_operate_amount,
                        account_operate_type: production_type,
                        company_name: companyName
                    }, { transaction });

                    const relationOptions = {
                        domain_id: user.domain_id,
                        relation_id: productivetask_id,
                        total_count: dtlDesignNumber,
                        actual_count: int_stock_operate_amount,
                        inventory_type: production_type
                    };
                    await recordInventoryTotal(relationOptions, transaction);

                    //更新联产品、边余料、成品的已收货数量
                    if (outputItem.taskrelated_type) {
                        const productiveTaskRelated = await tb_productivetaskrelated.findOne({
                            where: {
                                productivetaskrelated_id: outputItem.productivetaskrelated_id
                            },
                            transaction
                        });

                        productiveTaskRelated.related_stock_out_number += int_stock_operate_amount;
                        await productiveTaskRelated.save({ transaction });
                    } else {
                        const productiveTaskDetail = await tb_productivetaskdetail.findOne({
                            where: {
                                productivetaskdetail_id: outputItem.productivetaskdetail_id,
                                domain_id: user.domain_id
                            },
                            transaction
                        });

                        productiveTaskDetail.stock_out_number += int_stock_operate_amount;
                        await productiveTaskDetail.save({ transaction });
                    }
                }

                const dtlStockNumber = await tb_productivetaskdetail.sum('stock_out_number', {
                    where: {
                        productivetask_id
                    },
                    transaction
                }) || 0;

                productiveTask.stock_out_state = dtlDesignNumber > dtlStockNumber ? 2 : 3;
                await productiveTask.save({ transaction });

                //出库流水
                return await tb_inventoryorder.create({
                    domain_id: user.domain_id,
                    bill_code,
                    bs_order_id: productivetask_id,
                    warehouse_id,
                    account_operate_type: production_type,
                }, { transaction });
            } else {
                throw new Error('请填写数量');
            }
        });

        common.sendData(res, returnData);
    } catch (error) {
        common.sendErcError(res, error);
    }
}

async function getOrderMaterielPriceArray(order_id, materiel) {
    const queryStr =
        `select
            materiel_id, avg(sale_price) as price
            from tbl_erc_ordermateriel
            where true
            and materiel_id in (?)
            and order_id = ?
            group by order_id, materiel_id`;

    const materielArray = materiel.map(item => item.materiel_id);
    const replacements = [materielArray.join(','), order_id];

    return await common.simpleSelect(sequelize, queryStr, replacements);
}

async function getOrderMaterielTotalPrice(req, res) {
    const body = req.body;

    try {
        const { order_id, materiel } = body;
        const result = await getOrderMaterielPriceArray(order_id, materiel);
        let totalPrice = 0;
        result.forEach(({materiel_id, price}) => {
            const data = materiel.find(item => parseInt(item.materiel_id) === materiel_id);
            if (data && data.demand_amount) {
                totalPrice += (data.demand_amount * price);
            }
        });
        common.sendData(res, {totalPrice});
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function genOrderMaterielOutSaleRecord(order_id, total_price, materiel, transaction) {
    const priceArray = await getOrderMaterielPriceArray(order_id, materiel);

    let outSalePrice = 0;
    priceArray.forEach(({materiel_id, price}) => {
        const data = materiel.find(item => parseInt(item.materiel_id) === materiel_id);
        if (data && data.stock_operate_amount) {
            outSalePrice += (data.stock_operate_amount * price);
        }
    });

    const priceRecord = await tb_sopricerecord.findOne({
        where: {
            order_id
        }
    });

    if (priceRecord) {
        priceRecord.sale_price = outSalePrice;
        priceRecord.remain_price = priceRecord.remain_price - outSalePrice;
        await priceRecord.save({ transaction });
    } else {
        await tb_sopricerecord.create({
            order_id,
            total_price,
            sale_price: outSalePrice,
            remain_price: total_price - outSalePrice
        }, { transaction });
    }
}

async function getOutSourcingSaleOutOrder(req, res) {
    const { body, user } = req;
    const returnData = {};

    try {
        const { domain_id } = user;
        const { productivetask_code, stock_out_state } = body;

        let queryStr =
            `select
                pt.*
                , ord.biz_code as order_biz_code
                , mat.materiel_name, mat.materiel_format, mat.materiel_format, mat.materiel_unit, mat.materiel_state_management
                from tbl_erc_productivetask pt
                left join tbl_erc_order ord
                on ord.order_id = pt.order_id
                left join tbl_erc_materiel mat
                on pt.materiel_id = mat.materiel_id
                where true
                and pt.domain_id = ?
                and pt.outsource_sign = 3`;

        const replacements = [domain_id];

        if (productivetask_code) {
            queryStr += ` and pt.productivetask_code = ?`;
            replacements.push(productivetask_code);
        }
        if (stock_out_state > 0) {
            queryStr += ` and pt.stock_out_state = ?`;
            replacements.push(stock_out_state);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getAutoDrawProductMateriel(req, res) {
    try {
        const { body, user } = req;
        const { domain_id } = user;
        const { search_text } = body;

        let queryStr =
            `select
                gip.bill_code, gip.out_date, gip.total_amount, gip.p_order_id as productivetask_id
                , pt.biz_code
                from (
                select
                ia.bill_code, ia.p_order_id, date(ipa.created_at) as out_date, sum(ia.account_operate_amount) as total_amount
                from tbl_erc_inventory_production_account ipa
                left join tbl_erc_inventoryaccount ia
                on ia.inventoryaccount_id = ipa.inventoryaccount_id
                where ipa.domain_id = ?
                group by ia.bill_code, ia.p_order_id, date(ipa.created_at)) gip
                left join tbl_erc_productivetask pt
                on gip.p_order_id = pt.productivetask_id
                where true`;

        const replacements = [ domain_id ];

        if (search_text) {
            queryStr += ` and (gip.bill_code like ? or pt.biz_code like ?)`;
            replacements.push(search_text);
            replacements.push(search_text);
        }

        const result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        const returnData = {
            total: result.count,
            rows: result.data
        };
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getAutoDrawProductMaterielDetail(req, res) {
    try {
        const { body, user } = req;
        const { domain_id } = user;
        const { bill_code, search_text } = body;

        let queryStr =
            `select
                ipa.inventory_production_account_id, ipa.qualified_number, ipa.qualified_state, ord.biz_code as order_biz_code
                , ia.inventoryaccount_id, ia.warehouse_id, ia.warehouse_zone_id, ia.account_operate_amount
                , ptd.design_number, sm.store_price
                , mat.materiel_code, mat.materiel_name, mat.materiel_format, mat.materiel_unit, mat.materiel_state_management
                from tbl_erc_inventoryaccount ia
                left join tbl_erc_inventory_production_account ipa
                on ipa.inventoryaccount_id = ia.inventoryaccount_id
                left join tbl_erc_order ord
                on ord.order_id = ia.order_id
                left join tbl_erc_productivetaskdetail ptd
                on (ptd.productivetask_id = ia.p_order_id and ptd.materiel_id = ia.materiel_id)
                left join tbl_erc_materiel mat
                on ia.materiel_id = mat.materiel_id
                left join tbl_erc_stockmap sm
                on (ia.materiel_id = sm.materiel_id and ia.warehouse_id = sm.warehouse_id and ia.warehouse_zone_id = sm.warehouse_zone_id and ia.order_id = sm.order_id and ia.domain_id = sm.domain_id)
                where true
                and ia.domain_id = ?`;

        const replacements = [ domain_id ];

        if (bill_code) {
            queryStr += ` and ia.bill_code = ?`;
            replacements.push(bill_code);
        }

        if (search_text) {
            queryStr += ` and (mat.materiel_code like ? or mat.materiel_name like ?)`;
            replacements.push(search_text);
            replacements.push(search_text);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        const returnData = {
            total: result.count,
            rows: result.data
        };
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getAutoDrawProductProcedure(req, res) {
    try {
        const { body, user } = req;
        const { domain_id } = user;
        const { search_text } = body;

        let queryStr =
            `select
                gpt.productivetask_id, gpt.qualified_number, gpt.created_at
                , pt.biz_code
                from (
                select
                ptt.productivetask_id, sum(ptt.qualified_number) as qualified_number, date(ipa.created_at) as created_at
                from tbl_erc_inventory_procedure_account ipa
                left join tbl_erc_productivetask_transfer ptt
                on ipa.prd_task_procedure_id = ptt.prd_task_procedure_id
                where true
                and ipa.domain_id = ?
                group by ptt.productivetask_id, date(ipa.created_at)) gpt
                left join tbl_erc_productivetask pt
                on gpt.productivetask_id = pt.productivetask_id
                where true`;

        const replacements = [ domain_id ];

        if (search_text) {
            queryStr += ` and pt.biz_code like ?`;
            replacements.push(search_text);
        }

        const result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        const returnData = {
            total: result.count,
            rows: result.data
        };
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getAutoDrawProductProcedureDetail(req, res) {
    try {
        const { body, user } = req;
        const { domain_id } = user;
        const { search_text } = body;

        let queryStr =
            `select
                ipa.inventory_procedure_account_id, ipa.qualified_number, ipa.qualified_state
                , ptt.productivetask_id, ptt.procedure_id, ptt.qualified_number as transfer_done_number
                , pt.biz_code, pp.procedure_name
                from tbl_erc_inventory_procedure_account ipa
                left join tbl_erc_productivetask_transfer ptt
                on ipa.prd_task_procedure_id = ptt.prd_task_procedure_id
                left join tbl_erc_productivetask pt
                on ptt.productivetask_id = pt.productivetask_id
                left join tbl_erc_productionprocedure pp
                on ptt.procedure_id = pp.procedure_id
                where ipa.domain_id = ?`;

        const replacements = [ domain_id ];

        if (search_text) {
            queryStr += ` and pp.procedure_name like ?`;
            replacements.push(search_text);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        const returnData = {
            total: result.count,
            rows: result.data
        };
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function submitFeedingMaterielNumber(req, res) {
    try {
        const { body } = req;
        const { inventory_production_account_id, qualified_number } = body;

        const result = await qualifiedFeedingMaterielNumber(inventory_production_account_id, qualified_number);
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function submitProcedureMaterielNumber(req, res) {
    try {
        const { body } = req;
        const { inventory_procedure_account_id, qualified_number } = body;

        const result = await qualifiedProcedureMaterielNumber(inventory_procedure_account_id, qualified_number);
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}
