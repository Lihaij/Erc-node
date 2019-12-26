const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCBuyInControlSRV');
const model = require('../../../model');
// const Sequence = require('../../../util/Sequence');
const sms = require('../../../util/SMSUtil.js');
const { CODE_NAME, genBizCode } = require('../../../util/BizCodeUtil');
const task = require('../baseconfig/ERCTaskListControlSRV');
const inventoryControl = require('./ERCInventoryControlSRV');
const {
    recordInventoryTotal,
    productFeedingInventory,
    recordPurchaseInReplacePrice,
    recordProductInPrice,
    recordOutSourcingPrice,
    recordProductInCostPrice,
    productProcedureAutoDone,
    productOutSourcingAutoDone,
    reportProductVerificationAmount,
    getProductiveTaskDepartment,
    getCorrespondingUnit
} = require('../service/ERCInventoryService');

const sequelize = model.sequelize;
const tb_warehouse = model.erc_warehouse;
const tb_inventoryorder = model.erc_inventoryorder;
const tb_inventoryaccount = model.erc_inventoryaccount;
const tb_warehousezone = model.erc_warehousezone;
const tb_stockapplyitem = model.erc_stockapplyitem;
const tb_materiel = model.erc_materiel;
const tb_stockmap = model.erc_stockmap;
const tb_stockapply = model.erc_stockapply;
const tb_qualitycheckdetail = model.erc_qualitycheckdetail;
const tb_qualitycheck = model.erc_qualitycheck;
const tb_productivetask = model.erc_productivetask;
const tb_productivetaskrelated = model.erc_productivetaskrelated;
const tb_purchasedetail = model.erc_purchasedetail;
const tb_financerecorditem = model.erc_financerecorditem;
const tb_custorgstructure = model.erc_custorgstructure;
const tb_department = model.erc_department;
const tb_supplier = model.erc_supplier;

exports.ERCBuyInControlResource = async(req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'initActDetail') {
        initActDetail(req, res);
    } else if (method === 'initDetail') {
        initDetailAct(req, res);
    } else if (method === 'getZoneByWearHouse') {
        getZoneByWearHouse(req, res);
    } else if (method === 'getBuyInOrder') {
        getBuyInOrder(req, res);
    } else if (method === 'getOtherInOrder') {
        getOtherInOrderAct(req, res);
    } else if (method === 'getBuyInOrderMateriel') {
        getBuyInOrderMateriel(req, res);
    } else if (method === 'getOrderListForMateriel') {
        getOrderListForMateriel(req, res);
    } else if (method === 'createBuyInOrder') {
        createBuyInOrder(req, res);
    } else if (method === 'getBuyInOrderHistory') {
        getBuyInOrderHistory(req, res);
    } else if (method === 'getBuyInOrderHistoryDetail') {
        getBuyInOrderHistoryDetail(req, res);
    } else if (method === 'buyInOrderHistoryPrint') {
        buyInOrderHistoryPrint(req, res);
    } else if (method === 'inventoryAOGSms') {
        inventoryAOGSms(req, res);
    } else if (method === 'getWarehouseZone') {
        getWarehouseZoneAct(req, res);
    } else if (method === 'getOtherInOrderMateriel') {
        getOtherInOrderMaterielAct(req, res);
    } else if (method === 'addOtherStock') {
        addOtherStock(req, res);
    } else if (method === 'getOtherListForMateriel') {
        getOtherListForMaterielAct(req, res);
    } else if (method === 'modify') {
        modifyAct(req, res);
    } else if (method === 'getProductInOrderHistory') {
        getProductInOrderHistory(req, res);
    } else if (method === 'getOtherInOrderHistory') {
        getOtherInOrderHistoryAct(req, res);
    } else if (method === 'getOtherInOrderHistoryDetail') {
        getOtherInOrderHistoryDetailAct(req, res);
    } else if (method === 'getProductInOrderHistoryDetail') {
        getProductInOrderHistoryDetailAct(req, res);
    } else if (method === 'OtherInOrderHistoryPrint') {
        OtherInOrderHistoryPrintAct(req, res);
    } else if (method === 'getQualityCheckOrder') {
        getQualityCheckOrderAct(req, res);
    } else if (method === 'getQualityCheckOrderDetail') {
        getQualityCheckOrderDetailAct(req, res);
    } else if (method === 'getQualityCheckListForMateriel') {
        getQualityCheckListForMaterielAct(req, res);
    } else if (method === 'modifyQualityDetail') {
        modifyQualityDetailAct(req, res);
    } else if (method === 'addStockMapDetailFromQuality') {
        addStockMapDetailFromQualityAct(req, res);
    } else if (method === 'getProductInOrder') {//获取产品入库列表
        getProductInOrderAct(req, res);
    } else if (method === 'getProductInItems') {//获取产品入库明细
        getProductInItemsAct(req, res);
    } else if (method === 'submitProductInItems') {//提交产品入库
        submitProductInItemsAct(req, res);
    } else if (method === 'getOutSourcingBuyInOrder') {//委外入库管理
        getOutSourcingBuyInOrder(req, res);
    } else if (method === 'assignUserForInvoice') {
        assignUserForInvoice(req, res);
    } else {
        common.sendError(res, 'common_01');
    }
};

//初始化数据
let initAct = async(req, res) => {
    try {
        const { body, user } = req;

        const resultData = {
            storeTypeInfo: GLBConfig.STORETYPE[0],
            storeTypeInfo2: GLBConfig.STORETYPE2[0],
            materielInfo: GLBConfig.MATERIELTYPE,
            unitInfo: await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'),
            materielStateManagement: GLBConfig.MATERIELSTATEMANAGEMENT,
            inventoryInfo: GLBConfig.INVENTORYOPERATETYPE[0].value,
        };

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

//初始化详情数据
async function initActDetail(req, res) {
    try {
        const { user } = req;

        const resultData = {
            storeTypeInfo: GLBConfig.STORETYPE[0],
            materielInfo: GLBConfig.MATERIELTYPE,
            unitInfo: await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'),
            materielStateManagement: GLBConfig.MATERIELSTATEMANAGEMENT,
            inventoryInfo: GLBConfig.INVENTORYOPERATETYPE[0].value,
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

//初始化详情数据
async function initDetailAct(req, res) {
    try {
        const { body, user } = req;
        const returnData = {};

        returnData.materielInfo = GLBConfig.MATERIELTYPE;
        returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW');
        returnData.materielStateManagement = GLBConfig.MATERIELSTATEMANAGEMENT;
        returnData.departmentInfo = await getProductiveTaskDepartment(body.productivetask_id);
        returnData.correspondingInfo = await getCorrespondingUnit(user.domain_id);

        const result = await tb_warehouse.findOne({
            where: {
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id,
                warehouse_id: body.warehouse_id
            }
        });

        if (result) {
            returnData.wareHouseZoneInfo = await tb_warehousezone.findAll({
                where: {
                    state: GLBConfig.ENABLE,
                    warehouse_id: result.warehouse_id
                },
                attributes: [['warehouse_zone_id', 'id'], ['zone_name', 'text']]
            });
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//获取某仓库下的仓区
async function getZoneByWearHouse(req, res) {
    try {
        const { body } = req;

        const result = await tb_warehousezone.findAll({
            where: {
                state: GLBConfig.ENABLE,
                warehouse_id: body.warehouse_id
            },
            attributes: [['warehouse_zone_id', 'id'], ['zone_name', 'text']]
        });

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//获取待入库订单
async function getBuyInOrder(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        let queryStr =
            `select
             a.purchaseorder_id, a.purchaseorder_domain_id, a.order_id, a.order_domain_id, a.supplier_id
             , b.total_count
             , ifnull(d.supplier, c.domain) as supplier
             , ifnull(d.supplier_name, c.domain_name) as supplier_name
             , ifnull(e.done_count, 0) as done_count
             , if(e.done_count is null, 1, if(e.done_count < b.total_count, 2, 3)) as order_status
             from tbl_erc_purchaseorder a
             left join (
             select pd.purchase_id, sum(pd.purchase_number) as total_count
             from tbl_erc_purchasedetail as pd
             group by pd.purchase_id) b
             on a.purchaseorder_id = b.purchase_id
             left join tbl_common_domain c
             on a.order_domain_id = c.domain_id
             left join tbl_erc_supplier d
             on a.supplier_id = d.supplier_id
             left join (
             select ia.p_order_id, sum(ia.account_operate_amount) as done_count
             from tbl_erc_inventoryaccount ia
             where true
             and ia.account_operate_type = 1
             group by ia.p_order_id) e
             on a.purchaseorder_id = e.p_order_id
             where true`;
        let replacements = [];

        if (user.domain_id) {
            queryStr += ' and a.purchaseorder_domain_id = ?';
            replacements.push(user.domain_id);
        }

        if (doc.search_keyword) {
            queryStr += ' and a.purchaseorder_id like ?';
            let search_keyword = '%' + doc.search_keyword + '%';
            replacements.push(search_keyword);
        }

        if (doc.search_type == 1) {
            queryStr += ' and e.done_count is null';
        } else if (doc.search_type == 2) {
            queryStr += ' and e.done_count < b.total_count';
        } else if (doc.search_type == 3) {
            queryStr += ' and e.done_count = b.total_count';
        }

        queryStr += ' order by a.purchaseorder_id asc';

        let result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//获取其他入库订单
async function getOtherInOrderAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};

        let queryStr =
            `select distinct o.otherstock_id,o.stockapply_id,av.name as otherstock_approver,
            ifnull(e.done_count, 0) as done_count,
            if(e.done_count is null, 1, if(e.done_count < e.apply_amount, 2, 3)) as otherstock_state
            from tbl_erc_otherstockorder o
            left join tbl_common_user av
            on o.otherstock_approver=av.user_id and av.state=1
            left join (select s.stockapply_id,sum(s.apply_amount) as apply_amount,sum(s.remain_number) as done_count
            from tbl_erc_stockapplyitem s where true group by stockapply_id) e
            on o.stockapply_id = e.stockapply_id where true`;
        if (user.domain_id) {
            queryStr += ' and o.domain_id=?';
            replacements.push(user.domain_id);
        }
        if (doc.search_order) {
            queryStr += ' and otherstock_id like ?';
            let search_keyword = '%' + doc.search_order + '%';
            replacements.push(search_keyword);
        }
        if (doc.search_Otype == 1) {
            queryStr += ' and e.done_count is null';
        } else if (doc.search_Otype == 2) {
            queryStr += ' and e.done_count < e.apply_amount';
        } else if (doc.search_Otype == 3) {
            queryStr += ' and e.done_count = e.apply_amount';
        }
        queryStr += ' order by otherstock_id asc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//获取入库物料列表
async function getBuyInOrderMateriel(req, res) {
    logger.debug('getBuyInOrderMateriel');
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        let queryStr =
            `select
             a.purchase_id, a.materiel_id, a.purchase_number
             , b.materiel_code, b.materiel_name, b.materiel_format, b.materiel_unit, b.materiel_manage, b.materiel_state_management
             , b.materiel_cost, concat(b.materiel_tax * 100, '%') as materiel_tax
             , format((b.materiel_cost * a.purchase_number), 2) as pure_cost
             , format(((b.materiel_cost + (b.materiel_cost * b.materiel_tax)) * a.purchase_number), 2) as tax_cost
             , ifnull(c.done_count, 0) as done_count
             from tbl_erc_purchasedetail a
             left join tbl_erc_materiel b
             on a.materiel_id = b.materiel_id
             left join
             (select ia.account_operate_type, ia.materiel_id, sum(ia.account_operate_amount) as done_count
             from tbl_erc_inventoryaccount as ia
             where true
             and ia.account_operate_type = 1
             and p_order_id = ?
             group by ia.materiel_id) c
             on a.materiel_id = c.materiel_id
             where true`;
        let replacements = [];
        replacements.push(doc.purchase_id);

        if (doc.purchase_id) {
            queryStr += ' and a.purchase_id = ?';
            replacements.push(doc.purchase_id);
        }

        if (doc.materiel_manage) {
            queryStr += ' and b.materiel_manage = ?';
            replacements.push(doc.materiel_manage);
        }

        queryStr += ' order by a.purchase_id asc';
        logger.debug('queryStr:', queryStr);

        let result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//获取订单下的物料
async function getOrderListForMateriel(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        let queryStr = '';
        let replacements = [];

        if (doc.safetyStock) {
            queryStr =
                `select
                    a.purchase_id, a.materiel_id, a.purchase_number as total_count
                    , b.domain_id, ifnull(b.current_amount, 0) as current_count
                    from tbl_erc_purchasedetail a
                    left join tbl_erc_stockmap b
                    on a.materiel_id = b.materiel_id
                    where true
                    and (b.current_amount is null or b.current_amount < a.purchase_number)
                    and b.domain_id = ${user.domain_id}`;

            if (doc.materiel_id) {
                queryStr += ' and a.materiel_id = ?';
                replacements.push(doc.materiel_id);
            }

            queryStr += ' order by a.purchase_id asc';
            logger.debug('queryStr:', queryStr);
        } else {
            queryStr =
                `select
                     a.order_id, a.materiel_id, a.total_count
                     , ifnull(b.current_amount, 0) as current_count
                     from (
                     select nd.order_id, nd.materiel_id, sum(nd.netdemand_amount) as total_count
                     from tbl_erc_netdemand as nd
                     where nd.mrp_domain_id = ${user.domain_id}
                     group by nd.order_id, nd.materiel_id) a
                     left join (
                     select sm.order_id, sum(sm.current_amount) as current_amount
                     from tbl_erc_stockmap as sm
                     where sm.materiel_id = ${doc.materiel_id}
                     group by sm.order_id) b
                     on a.order_id = b.order_id
                     where true
                     and (b.current_amount is null or b.current_amount < a.total_count)`;

            if (doc.materiel_id) {
                queryStr += ' and a.materiel_id = ?';
                replacements.push(doc.materiel_id);
            }

            queryStr += ' order by a.order_id asc';
            logger.debug('queryStr:', queryStr);
        }

        let result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//创建入库单
async function createBuyInOrder(req, res) {
    logger.debug('createBuyInOrder:', req.body);
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let buyOrder = await tb_inventoryorder.create({
            domain_id: doc.buyOrderData.domain_id,
            bill_code: doc.buyOrderData.bill_code,
            bs_order_id: doc.buyOrderData.bs_order_id,
            warehouse_id: doc.buyOrderData.warehouse_id,
            account_operate_type: doc.buyOrderData.account_operate_type,
            ior_contact: doc.buyOrderData.ior_contact,
            ior_phone: doc.buyOrderData.ior_phone,
            supplier_code: doc.buyOrderData.supplier_code,
            supplier_name: doc.buyOrderData.supplier_name
        });

        if (buyOrder) {
            let buyOrderItems = await tb_inventoryaccount.bulkCreate(doc.buyOrderItems);
            if (buyOrderItems) {
                let pushArray = [];
                for (let i = 0; i < buyOrderItems.length; i++) {
                    let item = buyOrderItems[i];
                    if (doc.safetyStock) {
                        let pushData = await inventoryControl.dealWithSafeInventoryIn(item.warehouse_id, item.materiel_id,
                            item.account_operate_amount, item.domain_id, item.warehouse_zone_id);
                        pushArray.push(pushData);
                    } else {
                        let pushData = await inventoryControl.dealWithInventoryIn(item.warehouse_id, item.materiel_id,
                            item.account_operate_amount, item.order_id, item.domain_id, item.warehouse_zone_id);
                        pushArray.push(pushData);
                    }
                }

                await inventoryAOGSms({
                    bs_order_id: doc.buyOrderData.bs_order_id
                });

                common.sendData(res, pushArray);
            } else {
                return common.sendError(res, 'buyinorder_01', '入库订单明细生成失败');
            }
        } else {
            return common.sendError(res, 'buyinorder_02', '入库订单生成失败');
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}
//获取入库历史
async function getBuyInOrderHistory(req, res) {
    try {
        const { body, user } = req;
        const { domain_id } = user;
        const { start_date, end_date, bill_code, bs_order_id, supplier } = body;
        const returnData = {};

        let queryStr =
            `select
                io.ior_id, io.domain_id, io.bill_code, io.bs_order_id, io.warehouse_id
                , io.ior_phone
                , DATE_FORMAT(io.created_at,'%Y-%m-%d %H:%i') as created_at
                , gia.done_count, wh.warehouse_name
                , qc.biz_code as quality_biz_code, qc.supplier_id
                , spl.supplier_name
                from (
                select ia.bill_code, sum(ia.account_operate_amount) as done_count
                from tbl_erc_inventoryaccount as ia
                where ia.account_operate_type = 1
                group by ia.bill_code) gia 
                left join tbl_erc_inventoryorder io
                on gia.bill_code = io.bill_code
                left join tbl_erc_qualitycheck qc
                on qc.qualitycheck_id = io.bs_order_id
                left join tbl_erc_supplier spl
                on spl.supplier_id = qc.supplier_id
                left join tbl_erc_warehouse wh
                on wh.warehouse_id = io.warehouse_id
                where true
                and io.account_operate_type = 1
                and io.domain_id = ?`;

        const replacements = [domain_id];

        if (start_date) {
            queryStr += ' and to_days(io.created_at) >= to_days(?)';
            replacements.push(start_date);
        }
        if (end_date) {
            queryStr += ' and to_days(io.created_at) <= to_days(?)';
            replacements.push(end_date);
        }
        if (bill_code) {
            queryStr += ' and io.bill_code = ?';
            replacements.push(bill_code);
        }
        if (bs_order_id) {
            queryStr += ' and io.bs_order_id = ?';
            replacements.push(bs_order_id);
        }
        if (supplier) {
            queryStr += ' and (io.supplier_code like ? or io.supplier_name like ?)';
            replacements.push(`%${supplier}%`);
            replacements.push(`%${supplier}%`);
        }

        const result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//获取入库历史详情
async function buyInOrderHistoryDetail(req, body, user) {
    const returnData = {};
    let queryStr =
        `select
            ia.bill_code, ia.domain_id, ia.order_id, ia.p_order_id, ia.account_operate_amount, ia.inventory_price
            , ia.warehouse_zone_id, ia.company_name, ia.account_note, ia.created_at
            , mat.materiel_id, mat.materiel_code, mat.materiel_name, mat.materiel_format, mat.materiel_unit, mat.materiel_state_management
            , pd.purchase_price, po.biz_code as purchase_biz_code
            , ord.biz_code as order_biz_code
            from tbl_erc_inventoryaccount ia
            left join tbl_erc_materiel mat
            on ia.materiel_id = mat.materiel_id
            left join tbl_erc_purchaseorder po
            on ia.p_order_id = po.purchaseorder_id
            left join tbl_erc_purchasedetail pd
            on (ia.order_id = pd.order_ids and mat.materiel_id = pd.materiel_id)
            left join tbl_erc_order ord
            on ord.order_id = ia.order_id
            where true
            and ia.domain_id = ?`;

    const replacements = [ user.domain_id ];

    if (body.bill_code) {
        queryStr += ' and ia.bill_code = ?';
        replacements.push(body.bill_code);
    }
    if (body.materiel) {
        queryStr += ' and (mat.materiel_code like ? or mat.materiel_name like ?)';
        replacements.push(body.materiel);
        replacements.push(body.materiel);
    }
    const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    returnData.total = result.count;
    returnData.rows = result.data;

    return returnData;
}
//获取入库历史详情
async function getBuyInOrderHistoryDetail(req, res) {
    try {
        const { body, user } = req;
        const returnData = await buyInOrderHistoryDetail(req, body, user);
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//入库的短信通知
async function inventoryAOGSms(params) {
    let queryStr =
        `select
             if(e.done_count is null, 1, if(e.done_count < b.total_count, 2, 3)) as order_status
             from tbl_erc_purchaseorder a
             left join (
             select pd.purchase_id, sum(pd.purchase_number) as total_count
             from tbl_erc_purchasedetail as pd
             group by pd.purchase_id) b
             on a.purchaseorder_id = b.purchase_id
             left join tbl_common_domain c
             on a.order_domain_id = c.domain_id
             left join tbl_erc_supplier d
             on a.supplier_id = d.supplier_id
             left join (
             select ia.p_order_id, sum(ia.account_operate_amount) as done_count
             from tbl_erc_inventoryaccount ia
             where true
             and ia.account_operate_type = 1
             group by ia.p_order_id) e
             on a.purchaseorder_id = e.p_order_id
             where true`;
    let replacements = [];
    if (params.bs_order_id) {
        queryStr += ' and a.purchaseorder_id=?';
        replacements.push(params.bs_order_id);
    }
    let result = await sequelize.query(queryStr, {
        replacements: replacements,
        type: sequelize.QueryTypes.SELECT
    });
    if (result && result.length > 0) {
        if (result[0].order_status == 3) {
            replacements = [];
            // let smsText = '到货，请注意查收';
            queryStr = `select u.phone,group_concat(distinct i.order_id separator ';') as order_id
            from tbl_erc_inventoryaccount i,tbl_erc_order o,tbl_common_user u
            where i.state=1 and o.state=1 and u.state=1
            and i.order_id=o.order_id
            and o.order_foreman=u.user_id
            and i.p_order_id=?
            group by u.phone`;
            replacements.push(params.bs_order_id);

            let resultPhone = await sequelize.query(queryStr, {
                replacements: replacements,
                type: sequelize.QueryTypes.SELECT
            });
            for (let rp of resultPhone) {
                let order = rp.order_id.slice(0, 38);
                if (rp.phone) {
                    sms.sedDataMsg(rp.phone, 'wms', order); //给工长发送短信
                }
            }

        }
    }
}
//获取某仓库下的仓区
let getWarehouseZoneAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body),
            returnData = {};
        let zones = await tb_warehousezone.findAll({
            where: {
                warehouse_id: doc.warehouse_id,
                state: GLBConfig.ENABLE
            }
        });
        let zoneInfo = [];
        for (let z of zones) {
            zoneInfo.push({
                id: (z.warehouse_zone_id).toString(),
                value: (z.warehouse_zone_id).toString(),
                text: z.zone_name
            });
        }
        common.sendData(res, zoneInfo);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//获取其他入库时，可选物料的列表
async function getOtherInOrderMaterielAct(req, res) {
    try {
        const { body } = req;
        const { stockapply_id, searchText } = body;
        const replacements = [];
        let returnData = {};

        let queryStr =
            `select
                s.materiel_id, s.stockapplyitem_id, s.apply_amount, s.stock_remarks
                , s.apply_price, ifnull(s.remain_number, 0) as remain_number, s.store_price
                , b.materiel_code, b.materiel_name, b.materiel_manage, b.materiel_format, b.materiel_unit, b.materiel_state_management
                from tbl_erc_stockapplyitem s
                left join tbl_erc_materiel b
                on s.materiel_id = b.materiel_id
                where true`;

        if (stockapply_id) {
            queryStr += ' and s.stockapply_id = ?';
            replacements.push(stockapply_id);
        }

        if (searchText) {
            queryStr += ' and (b.materiel_code like ? or b.materiel_name like ?)';
            replacements.push(`%${searchText}%`);
            replacements.push(`%${searchText}%`);
        }

        queryStr += ' order by s.stockapply_id asc';

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//其他入库
async function addOtherStock(req, res) {
    try {
        const { body, user } = req;
        const { stockapply_id, warehouse_id, warehouse_zone_id, materiels, materielIds, company_name } = body;

        const returnData = await sequelize.transaction(async transaction => {
            if (materiels.length > 0) {
                for (const materielItem of materiels) {
                    const { stock_operate_amount, apply_amount, remain_number } = materielItem;
                    if (parseInt(stock_operate_amount) + remain_number > apply_amount) {
                        throw new Error('该物料已超过申请数量');
                    } else if (parseInt(stock_operate_amount) === 0) {
                        throw new Error('请填写数量');
                    }
                }

                const bill_code = await genBizCode(CODE_NAME.QTRK, user.domain_id, 6, transaction);

                for (const materielItem of materiels) {
                    const { materiel_id, stock_operate_amount, apply_price, stock_remarks } = materielItem;
                    const int_stock_operate_amount = parseInt(stock_operate_amount);
                    const materiel = await tb_materiel.findOne({
                        where: {
                            materiel_id: materielItem.materiel_id,
                            state: GLBConfig.ENABLE
                        }
                    });

                    const queryParams = {
                        materiel_id,
                        state: GLBConfig.ENABLE,
                        warehouse_id,
                        warehouse_zone_id
                    };
                    if (parseInt(materiel.materiel_manage) === 2) { //销售订单管理
                        queryParams.storage_type = 2;
                        if (!stock_remarks) {
                            throw new Error('销售订单号管理的物料的备注缺少订单号');
                        }
                        queryParams.order_id = stock_remarks;
                    } else { //安全库存管理
                        queryParams.storage_type = 1;
                    }

                    const stockMap = await tb_stockmap.findOne({
                        where: {
                            ...queryParams
                        },
                        transaction
                    });

                    if (stockMap) {
                        stockMap.current_amount += int_stock_operate_amount;
                        stockMap.price_amount += int_stock_operate_amount * apply_price;
                        stockMap.store_price = await getPrecisionPrice(user.domain_id, stockMap.price_amount / stockMap.current_amount);
                        await stockMap.save({ transaction });
                    } else {
                        await tb_stockmap.create({
                            domain_id: user.domain_id,
                            materiel_id,
                            current_amount: int_stock_operate_amount,
                            available_amount: int_stock_operate_amount,
                            price_amount: int_stock_operate_amount * apply_price,
                            order_id: queryParams.order_id,
                            warehouse_id,
                            warehouse_zone_id,
                            state: 1,
                            store_price: await getPrecisionPrice(user.domain_id, apply_price),
                            storage_type: queryParams.storage_type
                        }, { transaction });
                    }

                    const stockApply = await tb_stockapply.findOne({
                        where: {
                            stockapply_id,
                            state: GLBConfig.ENABLE
                        }
                    });

                    if (!stockApply) {
                        throw new Error('缺少其他入库申请单号信息');
                    }

                    /*const custorgStructure = await tb_custorgstructure.findOne({
                        where: {
                            user_id: stockApply.apply_submit
                        }
                    });

                    if (!custorgStructure) {
                        throw new Error('缺少组织架构信息');
                    }

                    const department = await tb_department.findOne({
                        where: {
                            department_id: custorgStructure.department_id
                        }
                    });*/

                    const storePrice = await getPrecisionPrice(user.domain_id, apply_price);
                    await tb_financerecorditem.create({
                        domain_id: user.domain_id,
                        materiel_id,
                        wms_type: 1,
                        manage_type: 3,
                        organization: company_name,
                        // org_type: department.department_type,
                        store_amount: int_stock_operate_amount,
                        store_price: storePrice
                    }, { transaction });

                    const stockApplyItem = await tb_stockapplyitem.findOne({
                        where: {
                            stockapplyitem_id: materielItem.stockapplyitem_id,
                            state: GLBConfig.ENABLE
                        }
                    });

                    if (!stockApplyItem) {
                        throw new Error('缺少其他入库申请明细');
                    }

                    stockApplyItem.store_price = storePrice;
                    stockApplyItem.remain_number += int_stock_operate_amount;
                    stockApplyItem.stock_operate_amount = 0;
                    await stockApplyItem.save({ transaction });

                    await tb_inventoryaccount.create({
                        domain_id: user.domain_id,
                        bill_code,
                        order_id: queryParams.order_id || stockapply_id,
                        p_order_id: stockapply_id,
                        warehouse_id,
                        warehouse_zone_id,
                        materiel_id,
                        inventory_price: storePrice,
                        account_operate_amount: int_stock_operate_amount,
                        account_operate_type: 3,
                        company_name
                    }, { transaction });

                    const relationOptions = {
                        domain_id: user.domain_id,
                        relation_id: stockapply_id,
                        total_count: stockApplyItem.apply_amount,
                        actual_count: int_stock_operate_amount,
                        inventory_type: 3
                    };
                    await recordInventoryTotal(relationOptions, transaction);
                }

                return await tb_inventoryorder.create({
                    domain_id: user.domain_id,
                    bill_code,
                    bs_order_id: stockapply_id,
                    warehouse_id,
                    account_operate_type: 3
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

//入库历史打印
async function buyInOrderHistoryPrint(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = await buyInOrderHistoryDetail(req, doc, user);
        if (doc.filetype != 'pdf' && doc.filetype != 'image') {
            return common.sendError(res, 'common_api_03');
        }

        let fileUrl = await common.ejs2File('erc/inventorymanage/ERCBuyInInvoice.ejs', {
            ejsData: {
                supplier_name: doc.supplier_name,
                bill_code: doc.bill_code,
                buyOrderItemList: JSON.parse(JSON.stringify(returnData.rows))
            }
        }, {
            htmlFlag: false
        }, doc.filetype);
        common.sendData(res, {
            url: fileUrl
        });
    } catch (error) {
        common.sendFault(res, error);
    }
}
//获取其他入库历史
async function getOtherListForMaterielAct(req, res) {
    try {
        const { body, user } = req;
        const { stockapply_id, searchText, materielIds } = body;
        let returnData = {};

        let queryStr =
            `select
                s.materiel_id, s.warehouse_zone_id, s.stockapplyitem_id
                , s.apply_amount,s.apply_price, ifnull(s.remain_number, 0) as remain_number, s.store_price
                , b.materiel_code, b.materiel_name, b.materiel_manage, b.materiel_format, b.materiel_unit
                , 0 as stock_operate_amount
                from tbl_erc_stockapplyitem s
                left join tbl_erc_materiel b
                on s.materiel_id = b.materiel_id
                where true
                and ifnull(s.remain_number, 0) < s.apply_amount
                and s.stockapply_id = ?
                and s.materiel_id in (${materielIds})`;

        const replacements = [ stockapply_id ];

        if (searchText) {
            queryStr += ' and (b.materiel_code like ? or b.materiel_name like ?)';
            replacements.push(`%${searchText}%`);
            replacements.push(`%${searchText}%`);
        }

        queryStr += ' order by s.stockapply_id asc';
        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//修改入库信息
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let stockapplyitem = await tb_stockapplyitem.findOne({
            where: {
                stockapplyitem_id: doc.new.stockapplyitem_id,
                state: GLBConfig.ENABLE
            }
        });
        if (doc.new.stock_operate_amount > stockapplyitem.apply_amount || Number(doc.new.stock_operate_amount) + Number(stockapplyitem.remain_number) > Number(stockapplyitem.apply_amount)) {
            common.sendError(res, 'stock_01');
            return;
        } else {
            if (stockapplyitem) {
                stockapplyitem.stock_operate_amount = doc.new.stock_operate_amount; //本次操作数量
                stockapplyitem.warehouse_zone_id = doc.new.warehouse_zone_id;
                await stockapplyitem.save();
            }
        }

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//获取产品入库历史
async function getProductInOrderHistory(req, res) {
    try {
        const { body, user } = req;
        const { domain_id } = user;
        const { production_type, start_date, end_date, productivetask_code, ps_bill_code } = body;
        const returnData = {};

        let queryStr =
            `select
                gia.done_count
                , io.ior_id, io.bill_code, io.bs_order_id, io.warehouse_id, io.account_operate_type
                , DATE_FORMAT(io.created_at,'%Y-%m-%d %H:%i') as created_at
                , pt.productivetask_code, pt.order_id, pt.biz_code, pt.department_id
                , ord.biz_code as order_biz_code, wh.warehouse_name
                from (
                select ia.bill_code, sum(ia.account_operate_amount) as done_count
                from tbl_erc_inventoryaccount as ia
                where ia.account_operate_type = ?
                group by ia.bill_code) as gia
                left join tbl_erc_inventoryorder io
                on gia.bill_code = io.bill_code
                left join tbl_erc_productivetask pt
                on io.bs_order_id = pt.productivetask_id
                left join tbl_erc_order ord
                on ord.order_id = pt.order_id
                left join tbl_erc_warehouse wh
                on wh.warehouse_id = io.warehouse_id
                where true
                and io.account_operate_type = ?
                and io.domain_id = ?`;

        const replacements = [production_type, production_type, domain_id];

        if (start_date) {
            queryStr += ' and to_days(io.created_at) >= to_days(?)';
            replacements.push(start_date);
        }
        if (end_date) {
            queryStr += ' and to_days(io.created_at) <= to_days(?)';
            replacements.push(end_date);
        }
        if (productivetask_code) {
            queryStr += ' and pt.productivetask_code = ?';
            replacements.push(productivetask_code);
        }
        if (ps_bill_code) {
            queryStr += ' and io.bill_code = ?';
            replacements.push(ps_bill_code);
        }

        const result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        if (parseInt(production_type) === 5) {
            for (const returnItem of returnData.rows) {
                const { bs_order_id } = returnItem;
                const [ departmentResult ] = await getProductiveTaskDepartment(bs_order_id);
                if (departmentResult) {
                    returnItem.department_name = departmentResult.department_name;
                }
            }
        } else if (parseInt(production_type) === 7) {
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
//获取其他入库历史
async function getOtherInOrderHistoryAct(req, res) {
    try {
        const { body, user } = req;
        const { domain_id } = user;
        const { start_date, end_date, bill_code, bs_order_id } = body;
        const returnData = {};

        let queryStr =
            `select
                io.ior_id, io.bill_code, io.bs_order_id, io.warehouse_id
                , DATE_FORMAT(io.created_at,'%Y-%m-%d %H:%i') as created_at
                , gia.done_count, wh.warehouse_name
                from (
                select ia.bill_code, sum(ia.account_operate_amount) as done_count
                from tbl_erc_inventoryaccount as ia
                where ia.account_operate_type = 3
                group by ia.bill_code) gia 
                left join tbl_erc_inventoryorder io
                on gia.bill_code = io.bill_code
                left join tbl_erc_warehouse wh
                on wh.warehouse_id = io.warehouse_id
                where true
                and io.account_operate_type = 3
                and io.domain_id = ?`;

        const replacements = [domain_id];

        if (start_date) {
            queryStr += ' and to_days(io.created_at) >= to_days(?)';
            replacements.push(start_date);
        }
        if (end_date) {
            queryStr += ' and to_days(io.created_at) <= to_days(?)';
            replacements.push(end_date);
        }
        if (bill_code) {
            queryStr += ' and io.bill_code = ?';
            replacements.push(bill_code);
        }
        if (bs_order_id) {
            queryStr += ' and io.bs_order_id = ?';
            replacements.push(bs_order_id);
        }

        const result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//获取其他入库历史明细
async function otherInOrderHistoryDetail(doc, user) {
    let queryStr = `select a.bill_code,a.domain_id,a.order_id,a.p_order_id,a.account_operate_amount,
        a.warehouse_zone_id, a.company_name, a.account_note, a.created_at,
        b.materiel_id, b.materiel_code, b.materiel_name, b.materiel_format, b.materiel_unit, b.materiel_state_management,
        b.materiel_cost, concat(b.materiel_tax * 100, '%') as materiel_tax,
        format((b.materiel_cost * a.account_operate_amount), 2) as pure_cost,
        format(((b.materiel_cost + (b.materiel_cost * b.materiel_tax)) * a.account_operate_amount), 2) as tax_cost
        , sai.apply_price, ord.biz_code as order_biz_code
        from tbl_erc_inventoryaccount a
        left join tbl_erc_order ord
        on ord.order_id = a.order_id
        left join tbl_erc_materiel b on a.materiel_id = b.materiel_id
        left join tbl_erc_stockapply c on a.p_order_id = c.stockapply_id
        left join tbl_erc_stockapplyitem sai
        on (c.stockapply_id = sai.stockapply_id and a.materiel_id = sai.materiel_id)
        where true and a.account_operate_type = 3 and a.bill_code = ?`;
    let replacements = [];
    replacements.push(doc.bill_code);
    if (user.domain_id) {
        queryStr += ' and a.domain_id = ?';
        replacements.push(user.domain_id);
    }

    if (doc.other_bill_code) {
        queryStr += ' and a.bill_code = ?';
        replacements.push(doc.other_bill_code);
    }
    if (doc.materiel) {
        queryStr += ' and (b.materiel_code like ?';
        replacements.push(doc.materiel);
        queryStr += ' or b.materiel_name like ?)';
        replacements.push(doc.materiel);
    }

    return await common.simpleSelect(sequelize, queryStr, replacements);
}
//获取产品入库历史明细
async function productInOrderHistoryDetail(req, doc, user) {

    let returnData = {};
    let queryStr =
        `select
            ia.bill_code,ia.domain_id,ia.order_id,ia.p_order_id,ia.account_operate_amount, ia.inventory_price
            , ia.warehouse_zone_id, ia.company_name, ia.account_note, ia.created_at
            , mat.materiel_id, mat.materiel_code, mat.materiel_name, mat.materiel_format, mat.materiel_unit, mat.materiel_state_management
            , pt.taskdesign_price, ord.biz_code as order_biz_code
            from tbl_erc_inventoryaccount ia
            left join tbl_erc_inventoryorder io
            on ia.bill_code = io.bill_code
            left join tbl_erc_productivetask pt
            on io.bs_order_id = pt.productivetask_id
            left join tbl_erc_materiel mat
            on ia.materiel_id = mat.materiel_id
            left join tbl_erc_order ord
            on ord.order_id = ia.order_id
            where ia.bill_code = ?`;

    const replacements = [ doc.bill_code ];

    if (user.domain_id) {
        queryStr += ' and ia.domain_id = ?';
        replacements.push(user.domain_id);
    }

    if (doc.search_text) {
        queryStr += ' and (mat.materiel_code like ? or mat.materiel_name like ?)';
        replacements.push(doc.search_text);
        replacements.push(doc.search_text);
    }
    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    returnData.total = result.count;
    returnData.rows = result.data;

    return returnData;
}
//获取其他订单明细
async function getOtherInOrderHistoryDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        const returnData = await otherInOrderHistoryDetail(doc, user);
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

//获取产品入库明细
async function getProductInOrderHistoryDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        const returnData = await productInOrderHistoryDetail(req, doc, user);
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//其他订单历史打印
async function OtherInOrderHistoryPrintAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        const returnData = await otherInOrderHistoryDetail(doc, user);
        /*if (doc.filetype != 'pdf' && doc.filetype != 'image') {
            return common.sendError(res, 'common_api_03');
        }

        let fileUrl = await common.ejs2File('erc/inventorymanage/ERCOtherInInvoice.ejs', {
            ejsData: {
                bill_code: doc.bill_code,
                otherOrderItemList: JSON.parse(JSON.stringify(returnData.rows))
            }
        }, {
            htmlFlag: false
        }, doc.filetype);
        common.sendData(res, {
            url: fileUrl
        });*/
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//获取质检单
async function getQualityCheckOrderAct(req, res) {
    let doc = common.docTrim(req.body),
        user = req.user,
        replacements = [],
        returnData = {};

    let queryStr =
        `select
             q.qualitycheck_id, q.purchaseorder_id, q.biz_code, spl.supplier_name
             , cu.name
             , qd.qualified_number, qd.unqualified_number, qd.finishStock_number
             , if(qd.finishStock_number = 0, 1, if(qd.finishStock_number < qd.qualified_number, 2, 3)) as order_status
             from tbl_erc_qualitycheck q
             left join tbl_common_user cu
             on (q.user_id=cu.user_id and cu.state=1)
             left join tbl_erc_supplier spl
             on spl.supplier_id = q.supplier_id
             left join (
             select qcd.qualitycheck_id
             , IFNULL(sum(qcd.qualified_number), 0) as qualified_number
             , IFNULL(sum(qcd.unqualified_number), 0) as unqualified_number
             , IFNULL(sum(qcd.finishStock_number), 0) as finishStock_number
             from tbl_erc_qualitycheckdetail qcd
             where qcd.state = 1
             group by qcd.qualitycheck_id) qd
             on (q.qualitycheck_id = qd.qualitycheck_id ) 
             where q.state = 1
             and qd.qualified_number > 0`;
    if (user.domain_id) {
        queryStr += ' and q.domain_id=?';
        replacements.push(user.domain_id);
    }
    if (doc.search_keyword) {
        queryStr += ' and q.biz_code like ?';
        replacements.push('%' + doc.search_keyword + '%');
    }
    if (doc.search_type == 1) {
        queryStr += ' and qd.finishStock_number = 0';
    } else if (doc.search_type == 2) {
        queryStr += ' and qd.finishStock_number < qd.qualified_number and qd.finishStock_number<>0';
    } else if (doc.search_type == 3) {
        queryStr += ' and qd.finishStock_number = qd.qualified_number';
    }

    queryStr += ' order by q.qualitycheck_id desc';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    returnData.total = result.count;
    returnData.rows = result.data;
    common.sendData(res, returnData);
}
//获取质检单详情
async function getQualityCheckOrderDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};

        let queryStr =
            `select
                qd.qualitycheckdetail_id, qd.order_id
                ,m.materiel_id,m.materiel_code,m.materiel_name
                ,m.materiel_format,m.materiel_unit, m.materiel_unit_bk, m.materiel_state_management
                ,qd.qualified_number,qd.finishStock_number,qd.finishStock_price,q.supplier_id,s.supplier_name,s.supplier
                ,pd.purchase_number, pd.purchase_price
                , ord.biz_code as order_biz_code
                from tbl_erc_qualitycheckdetail qd 
                left join tbl_erc_qualitycheck q
                on (qd.qualitycheck_id = q.qualitycheck_id and q.state=1)
                left join tbl_erc_order ord
                on ord.order_id = qd.order_id
                left join tbl_erc_purchasedetail pd
                on qd.purchasedetail_id = pd.purchasedetail_id
                left join tbl_erc_materiel m
                on (qd.materiel_id = m.materiel_id and m.state=1) 
                left join tbl_erc_supplier s
                on (q.supplier_id = s.supplier_id and q.state=1) 
                where true
                and qd.qualified_number > 0 `;

        if (doc.qualitycheck_id) {
            queryStr += ' and qd.qualitycheck_id=?';
            replacements.push(doc.qualitycheck_id);
        }
        if (doc.search_text) {
            queryStr += ' and (m.materiel_name like ? or m.materiel_code like ?)';
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
        }

        queryStr += ' order by qd.materiel_id';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//获取质检单物料详情
async function getQualityCheckListForMaterielAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {},
            queryStr = '',
            replacements = [];
        // let materiels = doc.materiels;
        //
        // let idArray = [];
        // for (let i = 0; i < materiels.length; i++) {
        //     idArray.push(materiels[i].qualitycheckdetail_id)
        // }
        let warehouse_zone_id = null;
        if (doc.warehouse_zone_id != null) {
            warehouse_zone_id = doc.warehouse_zone_id;
        }

        await tb_qualitycheckdetail.update({
            warehouse_id: doc.warehouse_id,
            warehouse_zone_id: warehouse_zone_id,
        }, {
            where: {
                qualitycheck_id: doc.qualitycheck_id,
                qualitycheckdetail_id: {
                    $in: doc.materielIds.split(',')
                }
            }
        });

        queryStr =
            `select
                qd.qualitycheckdetail_id,qd.order_id
                , m.materiel_id,m.materiel_code,m.materiel_name
                , m.materiel_format,m.materiel_unit,m.materiel_manage, m.materiel_state_management
                , q.supplier_id
                , qd.qualified_number,qd.finishStock_number,qd.finishStock_price,qd.warehouse_id,qd.warehouse_zone_id,0 as stock_operate_amount 
                , pd.purchase_number, pd.purchase_price
                , ord.biz_code as order_biz_code
                from tbl_erc_qualitycheckdetail qd 
                left join tbl_erc_qualitycheck q
                on (qd.qualitycheck_id = q.qualitycheck_id and q.state=1)
                left join tbl_erc_order ord
                on ord.order_id = qd.order_id
                left join tbl_erc_purchasedetail pd
                on qd.purchasedetail_id = pd.purchasedetail_id
                left join tbl_erc_materiel m
                on (qd.materiel_id = m.materiel_id and m.state=1) 
                where true
                and qd.qualitycheck_id=?
                and qd.qualitycheckdetail_id in (${doc.materielIds})`;
        replacements.push(doc.qualitycheck_id);
        if (doc.search_keyword) {
            queryStr += ' and (m.materiel_code like ? or m.materiel_name like ?)';
            let search_text = '%' + doc.search_keyword + '%';
            replacements.push(search_text);
            replacements.push(search_text);
        }
        queryStr += ' order by m.materiel_id asc';
        let result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//修改质检详情
async function modifyQualityDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let qualitycheckdetail = await tb_qualitycheckdetail.findOne({
            where: {
                qualitycheckdetail_id: doc.new.qualitycheckdetail_id,
                state: GLBConfig.ENABLE
            }
        });
        /*if (doc.new.stock_operate_amount > qualitycheckdetail.qualified_number || Number(doc.new.stock_operate_amount) + Number(qualitycheckdetail.finishStock_number) > Number(qualitycheckdetail.qualified_number)) {
            common.sendError(res, 'stock_06');
            return
        } else {
            if (qualitycheckdetail) {
                qualitycheckdetail.stock_operate_amount = doc.new.stock_operate_amount; //本次操作数量
                qualitycheckdetail.warehouse_zone_id = doc.new.warehouse_zone_id;
                await qualitycheckdetail.save()
            }
        }*/

        if (qualitycheckdetail) {
            qualitycheckdetail.stock_operate_amount = doc.new.stock_operate_amount; //本次操作数量
            await qualitycheckdetail.save();
        }

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//采购入库
async function addStockMapDetailFromQualityAct(req, res) {
    try {
        const { body, user } = req;
        const { qualitycheck_id, qualified_number, warehouse_id, warehouse_zone_id, materiels } = body;

        const returnData = await sequelize.transaction(async transaction => {
            /*const overNumber = materiels.some(({ stock_operate_amount, finishStock_number, qualified_number }) => {
                return parseInt(stock_operate_amount) + parseInt(finishStock_number) > parseInt(qualified_number);
            });
            if (overNumber) {
                throw new Error('入库数量不能大于需求数量');
            }*/

            const invalidNumber = materiels.some(({ stock_operate_amount }) => parseInt(stock_operate_amount) <= 0);
            if (invalidNumber) {
                throw new Error('入库数量必须大于0');
            }

            const qualityCheck = await tb_qualitycheck.findOne({
                where: {
                    qualitycheck_id,
                    state: GLBConfig.ENABLE
                }
            });
            if (!qualityCheck) {
                throw new Error('缺少品质检验单信息');
            }

            const warehouse = await tb_warehouse.findOne({
                where: {
                    warehouse_id
                }
            });
            if (!warehouse) {
                throw new Error('缺少仓库信息');
            }

            const warehouseZone = await tb_warehousezone.findOne({
                where: {
                    warehouse_id,
                    warehouse_zone_id
                }
            });
            if (!warehouseZone) {
                throw new Error('缺少仓区信息');
            }

            const bill_code = await genBizCode(CODE_NAME.CGRU, user.domain_id, 6, transaction);

            if (materiels.length > 0) {
                for (const inputItem of materiels) {
                    const { materiel_id, supplier_id } = inputItem;
                    const materiel = await tb_materiel.findOne({
                        where: {
                            materiel_id: inputItem.materiel_id,
                            state: GLBConfig.ENABLE
                        }
                    });
                    if (!materiel) {
                        throw new Error('未找到要入库物料');
                    }

                    const qualitycheckdetail = await tb_qualitycheckdetail.findOne({
                        where: {
                            qualitycheckdetail_id: inputItem.qualitycheckdetail_id,
                            state: GLBConfig.ENABLE
                        }
                    });

                    if (!qualitycheckdetail) {
                        throw new Error('没有取得品质检验信息');
                    }

                    const { purchasedetail_id, stock_operate_amount, order_id } = qualitycheckdetail;

                    if (stock_operate_amount > 0) {
                        const purchaseDetail = await tb_purchasedetail.findOne({
                            where: {
                                purchasedetail_id,
                                materiel_id,
                                state: GLBConfig.ENABLE,
                                purchaseorder_state: 2
                            },
                            attributes: ['purchase_price']
                        });

                        if (!purchaseDetail) {
                            throw new Error('没有取得采购信息');
                        }

                        let purchase_price = purchaseDetail.purchase_price || 0;

                        // todo something
                        //如果物料不是受托加工 && 没有供应商价格
                        if (parseInt(materiel.materiel_source) !== 4 && !purchase_price) {
                            purchase_price = await recordPurchaseInReplacePrice(user, materiel_id, supplier_id, bill_code, stock_operate_amount, 1, transaction);
                        }

                        const queryParams = {
                            materiel_id,
                            state: GLBConfig.ENABLE,
                            warehouse_id,
                            warehouse_zone_id,
                        };
                        if (parseInt(materiel.materiel_manage) === 2) { //销售订单管理
                            queryParams.storage_type = 2;
                            queryParams.order_id = order_id;
                        } else { //安全库存管理
                            queryParams.storage_type = 1;
                        }

                        const storePrice = await getPrecisionPrice(user.domain_id, purchase_price);

                        let stockMap = await tb_stockmap.findOne({
                            where: {
                                ...queryParams
                            },
                            transaction
                        });

                        if (stockMap) {
                            stockMap.current_amount += stock_operate_amount;
                            stockMap.price_amount += stock_operate_amount * purchase_price;
                            stockMap.store_price = await getPrecisionPrice(user.domain_id, stockMap.price_amount / stockMap.current_amount);
                            await stockMap.save({ transaction });
                        } else {
                            stockMap = await tb_stockmap.create({
                                domain_id: user.domain_id,
                                materiel_id,
                                current_amount: stock_operate_amount,
                                available_amount: stock_operate_amount,
                                price_amount: stock_operate_amount * purchase_price,
                                order_id: queryParams.order_id,
                                warehouse_id,
                                warehouse_zone_id,
                                state: 1,
                                store_price: storePrice,
                                storage_type: queryParams.storage_type
                            }, { transaction });
                        }

                        qualitycheckdetail.finishStock_price = stockMap.store_price;
                        qualitycheckdetail.finishStock_number += stock_operate_amount;

                        const supplier = await tb_supplier.findOne({
                            where: {
                                supplier_id
                            }
                        });
                        const supplierName = supplier ? supplier.supplier_name : '';

                        await tb_inventoryaccount.create({
                            domain_id: user.domain_id,
                            bill_code,
                            order_id: queryParams.order_id,
                            p_order_id: qualityCheck.purchaseorder_id,
                            warehouse_id,
                            warehouse_zone_id,
                            materiel_id,
                            inventory_price: storePrice,
                            account_operate_amount: stock_operate_amount,
                            account_operate_type: 1,
                            company_name: supplierName
                        }, { transaction });

                        const relationOptions = {
                            domain_id: user.domain_id,
                            relation_id: qualitycheck_id,
                            total_count: qualified_number,
                            actual_count: stock_operate_amount,
                            inventory_type: 1
                        };
                        await recordInventoryTotal(relationOptions, transaction);

                        await tb_financerecorditem.create({
                            domain_id: user.domain_id,
                            materiel_id,
                            wms_type: 1,
                            manage_type: 1,
                            organization: supplier.supplier_name,
                            store_amount: stock_operate_amount,
                            store_price: storePrice
                        }, { transaction });

                        qualitycheckdetail.stock_operate_amount = 0;
                        // if (qualitycheckdetail.qualified_number === finishStock_number) {
                        //     qualitycheckdetail.state = 0;
                        // }
                        await qualitycheckdetail.save({ transaction });
                    } else {
                        throw new Error('请填写入库数量');
                    }
                }

                return await tb_inventoryorder.create({
                    domain_id: user.domain_id,
                    bill_code,
                    bs_order_id: qualitycheck_id,
                    warehouse_id,
                    account_operate_type: 1,
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

//产品入库里列表
async function getProductInOrderAct(req, res) {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};
        let queryStr =
            `select
                pt.productivetask_id, pt.biz_code, pt.department_id, pt.stock_in_state
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
                select pt.biz_code, pt.order_id, pt.materiel_id, pt.stock_in_state
                from tbl_erc_productivetask pt
                where true
                and pt.domain_id = ?
                and pt.outsource_sign = 1
                group by pt.biz_code, pt.order_id, pt.materiel_id, pt.stock_in_state) gpt
                left join tbl_erc_order ord
                on ord.order_id = gpt.order_id
                left join tbl_erc_materiel mat
                on mat.materiel_id = gpt.materiel_id`;*/

        let replacements = [user.domain_id];
        if (doc.productivetask_code) {
            queryStr += ' and pt.biz_code = ?';
            replacements.push(doc.productivetask_code);
        }
        if (doc.stock_in_state > 0) {
            queryStr += ' and pt.stock_in_state = ?';
            replacements.push(doc.stock_in_state);
        }
        queryStr += ' order by pt.biz_code desc';

        const result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//产品入库明细
async function getProductInItemsAct(req, res) {
    try {
        const { body, user } = req;

        //联产品边余料
        let queryStr =
            `select ptr.*
                , m.materiel_code, m.materiel_name, m.materiel_format, m.materiel_unit, m.materiel_unit_bk, m.materiel_state_management
                , pt.order_id,0 as inPrice
                , 0 as stock_operate_amount
                from tbl_erc_productivetaskrelated ptr 
                left join tbl_erc_materiel m on (ptr.materiel_id = m.materiel_id and m.state = 1) 
                left join tbl_erc_productivetask pt on ptr.productivetask_id = pt.productivetask_id 
                where true
                and pt.domain_id = ?
                and ptr.productivetask_id = ?`;
        let replacements = [body.productivetask_id, user.domain_id];

        if (body.search_text) {
            queryStr += ' and (m.materiel_code like ? or m.materiel_name like ?) ';
            let search_text = '%' + body.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text);
        }
        let result1 = await common.queryWithCount(sequelize, req, queryStr, replacements);

        //成品
        let queryStr2 =
            `select pt.*
                , m.materiel_code, m.materiel_name, m.materiel_format, m.materiel_unit, m.materiel_unit_bk, m.materiel_state_management
                , taskdesign_price as inPrice
                , 0 as stock_operate_amount
                from tbl_erc_productivetask pt
                left join tbl_erc_materiel m on (pt.materiel_id = m.materiel_id and m.state = 1)
                where true
                and pt.domain_id = ?
                and pt.productivetask_id = ?`;

        let replacements2 = [ user.domain_id, body.productivetask_id ];

        if (body.materielIds) {
            queryStr2 += ` and m.materiel_id in (${body.materielIds})`;
        }

        if (body.search_text) {
            queryStr2 += ' and (mat.materiel_code like ? or mat.materiel_name like ?) ';
            let search_text = '%' + body.search_text + '%';
            replacements2.push(search_text);
            replacements2.push(search_text);
        }
        const result2 = await common.queryWithCount(sequelize, req, queryStr2, replacements2);

        const resultData = {total: result1.count + result2.count, rows: [...result1.data, ...result2.data]};
        common.sendData(res, resultData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//产品入库/委外入库
async function submitProductInItemsAct(req, res) {
    try {
        const { body, user } = req;
        const { productivetask_id, materiels, production_type, warehouse_id, warehouse_zone_id, company_name } = body;

        const returnData = await sequelize.transaction(async transaction => {
            const overNumber = materiels.some(item => {
                const {
                    taskrelated_type, stock_operate_amount,
                    stock_in_number, taskdesign_number,
                    related_stock_in_number, taskrelateddesign_number
                } = item;
                if (taskrelated_type) {
                    return parseInt(stock_operate_amount) + parseInt(related_stock_in_number) > parseInt(taskrelateddesign_number);
                } else {
                    return parseInt(stock_operate_amount) + parseInt(stock_in_number) > parseInt(taskdesign_number);
                }
            });
            if (overNumber) {
                throw new Error('入库数量不能大于需求数量');
            }

            const warehouse = await tb_warehouse.findOne({
                where: {
                    warehouse_id
                }
            });
            if (!warehouse) {
                throw new Error('缺少仓库信息');
            }

            const warehouseZone = await tb_warehousezone.findOne({
                where: {
                    warehouse_id,
                    warehouse_zone_id
                }
            });
            if (!warehouseZone) {
                throw new Error('缺少仓区信息');
            }

            let bill_code = 0;
            if (parseInt(production_type) === 5) {
                bill_code = await genBizCode(CODE_NAME.CPRK, user.domain_id, 6, transaction);
            } else if (parseInt(production_type) === 7) {
                bill_code = await genBizCode(CODE_NAME.WWRK, user.domain_id, 6, transaction);
            }

            if (materiels.length > 0) {
                const productiveTask = await tb_productivetask.findOne({
                    where: {
                        productivetask_id,
                        domain_id: user.domain_id
                    },
                    transaction
                });
                if (!productiveTask) {
                    throw new Error('没有生产任务单信息');
                }

                for (const inputItem of materiels) {
                    const { materiel_id, order_id, stock_operate_amount } = inputItem;
                    const int_stock_operate_amount = parseInt(stock_operate_amount);
                    const materiel = await tb_materiel.findOne({
                        where: {
                            materiel_id,
                            state: GLBConfig.ENABLE
                        }
                    });

                    if (productiveTask.stock_in_number < productiveTask.taskdesign_number) {
                        const params = {
                            user,
                            bill_code,
                            production_type: parseInt(production_type),
                            domain_id: user.domain_id,
                            productivetask_id,
                            warehouse_id,
                            warehouse_zone_id,
                            order_id,
                            company_name,
                            materiel_manage: parseInt(materiel.materiel_manage)
                        };

                        //投料自动出库
                        await productFeedingInventory(params, int_stock_operate_amount, transaction);

                        //即时库存入库及计算价格
                        await recordProductInCostPrice(productiveTask, params, int_stock_operate_amount, transaction);

                        /*//收发存明细
                        const inventoryAccount = await tb_inventoryaccount.create({
                            domain_id: user.domain_id,
                            bill_code,
                            order_id,
                            p_order_id: productivetask_id,
                            warehouse_id,
                            warehouse_zone_id,
                            materiel_id,
                            inventory_price: inventoryStorePrice,
                            account_operate_amount: int_stock_operate_amount,
                            account_operate_type: production_type,
                        }, { transaction });*/

                        const relationOptions = {
                            domain_id: user.domain_id,
                            relation_id: productivetask_id,
                            total_count: productiveTask.taskdesign_number,
                            actual_count: int_stock_operate_amount,
                            inventory_type: production_type
                        };
                        await recordInventoryTotal(relationOptions, transaction);

                        //给仓库管理员通知
                        await assignWarehouseManager(res, user, warehouse.warehouse_contact, inventoryAccount.inventoryaccount_id);
                    }

                    //更新联产品、边余料、成品的已收货数量
                    if (inputItem.taskrelated_type) {
                        const productiveTaskRelated = await tb_productivetaskrelated.findOne({
                            where: {
                                productivetaskrelated_id: inputItem.productivetaskrelated_id
                            },
                            transaction
                        });

                        productiveTaskRelated.related_stock_in_number += int_stock_operate_amount;
                        await productiveTaskRelated.save({ transaction });
                    } else {
                        productiveTask.stock_in_number += int_stock_operate_amount;
                    }
                }

                //更改生产任务单入库状态
                const related = await tb_productivetaskrelated.findOne({
                    where: {
                        productivetask_id
                    }
                });
                if (related) {
                    const queryStr = `select pt.* from tbl_erc_productivetask pt
                            left join tbl_erc_productivetaskrelated ptr on pt.productivetask_id = ptr.productivetask_id
                            where pt.taskdesign_number = pt.stock_in_number 
                            and ptr.taskrelateddesign_number = ptr.related_stock_in_number 
                            and pt.domain_id = ? and pt.productivetask_id = ?`;

                    const replacements = [user.domain_id, productivetask_id];
                    const result = await common.simpleSelect(sequelize, queryStr, replacements);

                    if (result.length > 0) {
                        await tb_productivetask.update({
                            stock_in_state: 3
                        }, {
                            where: {
                                productivetask_id,
                                domain_id: user.domain_id
                            },
                            transaction
                        });
                    } else {
                        await tb_productivetask.update({
                            stock_in_state: 2
                        }, {
                            where: {
                                productivetask_id,
                                domain_id: user.domain_id
                            },
                            transaction
                        });
                    }
                } else {
                    const { stock_in_number, taskdesign_number } = productiveTask;
                    productiveTask.stock_in_state = taskdesign_number > stock_in_number ? 2 : 3;
                    await productiveTask.save({ transaction });
                }

                //如果生产任务单完成
                const { materiel_id, stock_in_state, stock_in_number, taskdesign_number, department_id } = productiveTask;
                if (parseInt(stock_in_state) === 3) {
                    if (parseInt(production_type) === 5) {
                        //工序计价金额记账凭证
                        await recordProductInPrice(user, productivetask_id, taskdesign_number, transaction);
                        await productProcedureAutoDone(user, productivetask_id, taskdesign_number, transaction);
                    } else if (parseInt(production_type) === 7) {
                        //委外加工费金额记账凭证
                        await recordOutSourcingPrice(user, productivetask_id, department_id, materiel_id, stock_in_number, transaction);
                        await productOutSourcingAutoDone(user, productivetask_id, taskdesign_number, department_id, materiel_id, transaction);
                    }

                    //第一二种情况的财务自动化
                    await reportProductVerificationAmount(user, productivetask_id, transaction);
                }

                //入库流水
                return await tb_inventoryorder.create({
                    domain_id: user.domain_id,
                    bill_code,
                    warehouse_id,
                    bs_order_id: productivetask_id,
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

async function getOutSourcingBuyInOrder(req, res) {
    const { body, user } = req;
    const returnData = {};

    try {
        const { domain_id } = user;
        const { productivetask_code, stock_in_state } = body;

        let queryStr =
            `select
                pt.*
                , ord.biz_code as order_biz_code
                , mat.materiel_code, mat.materiel_name, mat.materiel_format, mat.materiel_unit, mat.materiel_state_management
                from tbl_erc_productivetask pt
                left join tbl_erc_order ord
                on ord.order_id = pt.order_id
                left join tbl_erc_materiel mat
                on pt.materiel_id = mat.materiel_id
                where pt.domain_id = ?
                and pt.outsource_sign = 3`;

        const replacements = [domain_id];

        if (productivetask_code) {
            queryStr += ' and pt.productivetask_code = ?';
            replacements.push(productivetask_code);
        }
        if (stock_in_state > 0) {
            queryStr += ' and pt.stock_in_state = ?';
            replacements.push(stock_in_state);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function assignWarehouseManager(res, user, assign_user_id, inventoryaccount_id) {
    const taskName = '产品入库投料自动出库';
    const taskDescription = '产品入库投料自动出库';
    const groupId = common.getUUIDByTime(30);
    return await task.createTask(user, taskName, 98, assign_user_id, inventoryaccount_id, taskDescription, '', groupId);
}
