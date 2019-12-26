
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCInventoryControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const moment = require('moment');
const TaskListControlSRV = require('../baseconfig/ERCTaskListControlSRV');


const sequelize = model.sequelize;
const tb_warehouse = model.erc_warehouse;
const tb_stockmap = model.erc_stockmap;
const tb_warehousezone = model.erc_warehousezone;
const tb_materiel = model.erc_materiel;
const tb_netdemand = model.erc_netdemand;//净需求表
const tb_idleapply = model.erc_idleapply;
const tb_idleapplyitem = model.erc_idleapplyitem;
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;


exports.ERCInventoryControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        await initAct(req, res);
    } else if (method === 'getJitInventory') {
        await getJitInventory(req, res);
    } else if (method === 'modify') {
        await modifyAct(req, res);
    } else if (method === 'getWarehouseZone') {
        await getWarehouseZoneAct(req, res);
    } else if (method === 'sync_safe_material') {
        await syncSafeMaterialAct(req, res);
    } else if (method === 'scan_safe_purchase') {
        await scanSafePurchaseAct(req, res);
    } else if (method === 'search_stockItem') {
        await searchStcokItemAct(req, res);
    } else if (method === 'search_materiel') {
        await searchMaterielAct(req, res);
    } else if (method === 'modify_moving') {
        await modifyMovingAct(req, res);
    } else if (method === 'scan_idle') {
        await scanIdleAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};
//初始化数据
let initAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), user = req.user;
        let returnData = {
            warehousesInfo: [], //仓库列表
            stockModelInfo: GLBConfig.MATERIELMANAGE, //库存管理模式
            tfInfo: GLBConfig.TFINFO,//是否
            unitInfo: await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'),//单位
            materielStateManagement: GLBConfig.MATERIELSTATEMANAGEMENT,
            materialTypeInfo: GLBConfig.MATERIELTYPE, //物料分类
            safeModelStateInfo: GLBConfig.SAFEPURCHASE, //安全采购状态
        };

        await FDomain.getDomainListInit(req, returnData);

        returnData.warehousesInfo = await tb_warehouse.findAll({
            where: {
                state: GLBConfig.ENABLE,
                warehouse_state: GLBConfig.ENABLE,
                domain_id: user.domain_id,
                warehouse_type: {
                    $notIn: [5, 6]
                }
            },
            attributes: [['warehouse_id', 'id'], ['warehouse_name', 'text']]
        });

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//获取库存列表
const getJitInventory = async (req, res)=> {
    try {
        const { body, user } = req;
        const returnData = {};

        let queryStr =
            `select
                sm.stockmap_id, sm.warehouse_id, sm.order_id, sm.safe_amount, sm.min_purchase_amount, sm.current_amount
                , sm.store_price, sm.is_idle_stock, sm.storage_type, date(sm.created_at) as create_date, sm.trigger_safe_model, sm.trigger_idle_scan
                , ord.biz_code as order_biz_code, w.warehouse_name, wz.zone_name, m.materiel_id
                , m.materiel_code, m.materiel_name, m.materiel_format, m.materiel_unit, m.materiel_manage, m.materiel_state_management
                from tbl_erc_stockmap sm
                left join tbl_erc_order ord
                on ord.order_id = sm.order_id
                left join tbl_erc_warehouse w
                on (sm.warehouse_id = w.warehouse_id and w.state = 1)
                left join tbl_erc_materiel m
                on (sm.materiel_id = m.materiel_id and m.state = 1)
                left join tbl_erc_warehousezone wz
                on (sm.warehouse_zone_id = wz.warehouse_zone_id and wz.state = 1)
                where true
                and sm.state = 1
                and sm.current_amount > 0
                and sm.domain_id = ?`;

        const replacements = [ user.domain_id ];
        if (body.search_text) {
            queryStr += ' and (m.materiel_code like ? or m.materiel_name like ? or m.materiel_format like ?)';
            let search_text = `%${body.search_text}%`;
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
        }
        if (body.warehouse_id) {
            queryStr += ` and sm.warehouse_id = ?`;
            replacements.push(body.warehouse_id);
        }
        if (body.materiel_manage) {
            queryStr += ` and m.materiel_manage = ?`;
            replacements.push(body.materiel_manage);
        }
        if (body.is_idle_stock) {
            queryStr += ` and sm.is_idle_stock = ?`;
            replacements.push(body.is_idle_stock);
        }
        if (body.storage_type) {
            queryStr += ` and sm.storage_type = ?`;
            replacements.push(body.storage_type);
        }
        if (body.order_id) {
            queryStr += ` and sm.order_id = ?`;
            replacements.push(body.order_id);
        }
        if (body.materiel_unit) {
            queryStr += ` and m.materiel_unit = ?`;
            replacements.push(body.materiel_unit);
        }
        if (body.warehouse_zone_id) {
            queryStr += ' and wz.warehouse_zone_id = ?';
            replacements.push(body.warehouse_zone_id);
        }
        if (body.materiel_state_management) {
            queryStr += ' and m.materiel_state_management = ?';
            replacements.push(body.materiel_state_management);
        }

        queryStr += ' order by sm.created_at desc';

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//获取仓库仓区
let getWarehouseZoneAct = async(req, res)=> {
  try {
      let doc = common.docTrim(req.body), returnData = {};
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

//修改库存
let modifyAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body), user = req.user;

        //查看是否分配任务审核人员
        let taskallot = await tb_taskallot.findOne({
            where: {
                state: GLBConfig.ENABLE,
                taskallot_name: '安全库存审核'
            }
        });

        let taskallotuser = await tb_taskallotuser.findOne({
            where: {
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id,
                taskallot_id: taskallot.taskallot_id
            }
        });

        if (!taskallotuser) {
            return common.sendError(res, 'task_02');
        }

        let modify = await tb_stockmap.findOne({
            where: {
                domain_id: user.domain_id,
                stockmap_id: doc.new.stockmap_id
            }
        });

        if (modify) {
            modify.safe_amount_temp = doc.new.safe_amount;
            modify.min_purchase_amount_temp = doc.new.min_purchase_amount;
            modify.submit_state = 1;//状态改为已提交
            await modify.save();
        }

        const taskName = '安全库存审核';
        const groupId = common.getUUIDByTime(30);
        // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
        await TaskListControlSRV.createTask(user, taskName, 87, taskallotuser.user_id, modify.stockmap_id, `物料${modify.materiel_id}修改了安全库存或最低采购数量`, '', groupId);

        common.sendData(res, modify);
    } catch (error) {
        return common.sendFault(res, error);

    }
};

//修改安全库存
exports.modifyInventory = async (state, stockmap_id, task_description, user) => {
    let modify = await tb_stockmap.findOne({
        where: {
            domain_id: user.domain_id,
            stockmap_id: stockmap_id
        }
    });
    if (modify) {
        //如果通过，则将临时数据赋值给safe_amount，min_purchase_amount
        if (state === '2') {
            modify.safe_amount = modify.safe_amount_temp;
            modify.min_purchase_amount = modify.min_purchase_amount_temp;
        }
        modify.submit_state = state;
        modify.task_description = task_description;
        await modify.save();
    }
}

//同步安全库存
let syncSafeMaterialAct = async(req, res) => {
    try {
        const { user } = req;
        const { domain_id } = user;

        const materials = await tb_materiel.findAll({
            where: {
                domain_id,
                materiel_manage: 1,
                state: GLBConfig.ENABLE
            }
        });

        for (const materiel of materials) {
            const { materiel_id, materiel_min_purchase_num } = materiel;
            const stock = await tb_stockmap.findOne({
                where: {
                    domain_id,
                    materiel_id,
                    storage_type: 1
                }
            });
            if (!stock) {
                await tb_stockmap.create({
                    domain_id,
                    warehouse_id: 0,
                    materiel_id,
                    safe_amount: 1,
                    min_purchase_amount: materiel_min_purchase_num,
                    current_amount: 0,
                    storage_type: 1
                });
            }
        }

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//安全库存扫描
const scanSafePurchaseAct = async(req, res) => {
    try {
        const { user } = req;

        const queryStr =
            `select * from tbl_erc_stockmap sm
                left join tbl_erc_materiel mat on (sm.materiel_id = mat.materiel_id and mat.state = 1)
                where sm.domain_id = ? and matmateriel_manage = ?`;

        const replacements = [user.domain_id, 1];
        const stockArray = await common.simpleSelect(sequelize, queryStr, replacements);

        for (const stockItem of stockArray) {
            if (stockItem.current_amount <= stockItem.safe_amount && stockItem.trigger_safe_model < 1) {
                await tb_netdemand.create({
                    materiel_id: stockItem.materiel_id,
                    netdemand_amount: stockItem.min_purchase_amount,
                    mrp_date: moment(new Date()).format('YYYY-MM-DD'),
                    mrp_domain_id: user.domain_id
                });

                const stockMap = await tb_stockmap.findOne({
                    where: {
                        stockmap_id: stockItem.stockmap_id
                    }
                });
                stockMap.trigger_safe_model = 1;
                await stockMap.save();
            }
        }

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
        return null
    }
};
//安全库存明细
let searchStcokItemAct = async(req, res) => {
  try {
      let doc = common.docTrim(req.body), user = req.user, returnData = {};
      let queryStr = `select sm.stockmap_id,sm.current_amount,sm.warehouse_id,sm.warehouse_zone_id,
                      w.warehouse_name,wz.zone_name,m.materiel_id,m.materiel_code,m.materiel_name,m.materiel_format,
                      m.materiel_unit,m.materiel_state_management,w.warehouse_name,wz.zone_name
                      from tbl_erc_stockmap sm 
                      left join tbl_erc_warehouse w on (sm.warehouse_id = w.warehouse_id and w.state=1)
                      left join tbl_erc_materiel m on (s.materiel_id = m.materiel_id and m.state = 1)
                      left join tbl_erc_warehousezone wz on (sm.warehouse_zone_id = wz.warehouse_zone_id and wz.state = 1)
                      where sm.state=1 and sm.stockmap_id = ?`;
      let replacements = [doc.stockmap_id];
      if (doc.warehouse_id) {
          queryStr += ` and sm.warehouse_id = ? `;
          replacements.push(doc.warehouse_id);
      }
      if (doc.warehouse_zone_id) {
          queryStr += ' and sm.warehouse_zone_id = ?';
          replacements.push(doc.warehouse_zone_id);
      }

      let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
      returnData.total = result.count;
      returnData.rows = result.data;
      common.sendData(res, returnData);
  } catch (error) {
      common.sendFault(res, error);
  }
};

//出库数量校验
exports.dealWithInventoryOut = async(warehouseId, materialId, amountOut, orderId, domainId, warehouseZoneId) => {
    let amount = parseFloat(amountOut);
    let returnData = {
        success: false, //出库是否成功
        current_amount: 0 //当前库存数量
    };

    let queryData = {
        warehouse_id: warehouseId,
        materiel_id: materialId,
        order_id: orderId,
        domain_id: domainId
    };
    if (warehouseZoneId) {
        queryData.warehouse_zone_id = warehouseZoneId;
    } else {
        queryData.warehouse_zone_id = null;
    }

    let materiel = await tb_materiel.findOne({
        where: {
            materiel_id: materialId
        }
    });
    let isSafe = materiel.materiel_manage === '1';

    if (!isSafe) {
        let queryStr = `select sum(current_amount) as total from tbl_erc_stockmap 
                where domain_id = ? and order_id = ? and warehouse_id = ? and materiel_id = ?`;

        let replacements = [domainId,orderId,warehouseId,materialId];
        let total = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        let totalCount = total[0];

        if (totalCount < amount) {
            returnData.success = false;
            returnData.current_amount = totalCount;
        } else {
            let stocks = await tb_stockmap.findAll({
                where: {
                    warehouse_id: warehouseId,
                    materiel_id: materialId,
                    order_id: orderId,
                    domain_id: domainId
                }
            });

            let count = amount;
            for (let s of stocks) {
                if (s.current_amount >= 0) {
                    if (s.current_amount >= count) {
                        s.current_amount = s.current_amount - count;
                        await s.save();
                        returnData.success = true;
                        returnData.current_amount = totalCount - amount;
                        break;
                    } else {
                        count = count - s.current_amount;
                        s.current_amount = 0;
                        await s.save();
                    }
                }
            }
        }
    } else {
        let stock = await tb_stockmap.findOne({
            where: queryData
        });

        if (stock) {
            if (stock.current_amount >= 0) {
                if (stock.current_amount >= amount) {
                    stock.current_amount = stock.current_amount - amount;
                    await stock.save();
                    returnData.success = true;
                    returnData.current_amount = stock.current_amount;
                } else {
                    returnData.success = false;
                    returnData.current_amount = stock.current_amount;
                }
            }

            if (stock.current_amount <= stock.safe_amount && stock.trigger_safe_model < 1) {
                //触发安全库存模式，提交净需求进行采购
                await tb_netdemand.create({
                    materiel_id: materialId,
                    order_id: '',
                    netdemand_amount: amount,
                    mrp_date: new Date(),
                    mrp_domain_id: domainId
                });
                stock.trigger_safe_model = 1;
                await stock.save()
            }

        } else {
            returnData.success = false;
            returnData.current_amount = 0;
        }
    }
    return returnData
};

//安全库存出库数量校验
exports.dealWithSafeInventoryOut = async(warehouseId, materialId, amountOut, domainId, warehouseZoneId) => {
    // let amount = parseFloat(amountOut);
    let returnData = {
        success: false, //出库是否成功
        current_amount: 0 //当前库存数量
    };

    const queryParams = {
        domain_id: domainId,
        materiel_id: materialId,
        storage_type: 1
    };

    if (warehouseId) {
        queryParams.warehouse_id = warehouseId;
    }

    if (warehouseZoneId) {
        queryParams.warehouse_zone_id = warehouseZoneId;
    }

    const stockMap = await tb_stockmap.findOne({
        where: {
            ...queryParams
        }
    });

    const int_amount_out = parseInt(amountOut);
    if (stockMap) {
        if (stockMap.current_amount >= int_amount_out) {
            stockMap.current_amount -= int_amount_out;
            await stockMap.save();
            returnData.success = true;
            returnData.current_amount = stockMap.current_amount - int_amount_out;
        } else {
            returnData.success = false;
            returnData.current_amount = stockMap.current_amount;
        }

        if (stockMap.current_amount <= stockMap.safe_amount && stockMap.trigger_safe_model < 1) {
            //触发安全库存模式，提交净需求进行采购
            await tb_netdemand.create({
                materiel_id: stockMap.materiel_id,
                order_id: '',
                netdemand_amount: stockMap.min_purchase_amount,
                mrp_date: moment(new Date()).format('YYYY-MM-DD'),
                mrp_domain_id: domainId
            });
            stockMap.trigger_safe_model = 1;
            await stockMap.save();
        }
    }

    /*let queryStr = `select si.* from tbl_erc_stockitem si
                    left join tbl_erc_stockmap s on (s.stockmap_id = si.stockmap_id)
                    left join tbl_erc_materiel m on (s.materiel_id = m.materiel_id and m.state = 1)
                    where s.domain_id = ? and s.materiel_id = ? `;

    let replacements = [domainId,materialId];

    if (warehouseId) {
        queryStr += ` and si.warehouse_id = ?`;
        replacements.push(warehouseId);
    }

    if (warehouseZoneId) {
        queryStr += ` and si.warehouse_zone_id = ?`;
        replacements.push(warehouseZoneId);
    }

    let items = await sequelize.query(queryStr, {
        replacements: replacements,
        type: sequelize.QueryTypes.SELECT
    });

    if (items.length > 0) {
        let item = items[0];
        let stock = await tb_stockmap.findOne({
            where: {
                stockmap_id: item.stockmap_id
            }
        });
        if (stock) {
            if (stock.current_amount >= amount) {
                let items = await tb_stockitem.findAll({
                    where: {
                        stockmap_id: item.stockmap_id
                    }
                });
                let count = amount;
                for (let i of items) {
                    if (i.item_amount >= 0) {
                        if (i.item_amount >= count) {
                            i.item_amount = i.item_amount - count;
                            await i.save();
                            stock.current_amount -= amount;
                            await stock.save();
                            returnData.success = true;
                            returnData.current_amount = stock.current_amount - amount;
                            break;
                        } else {
                            count -= i.item_amount;
                            i.item_amount = 0;
                            await i.save();
                        }
                    }
                }
            } else {
                returnData.success = false;
                returnData.current_amount = stock.current_amount;
            }

            if (stock.current_amount <= stock.safe_amount
                && stock.trigger_safe_model !== '1') {
                //触发安全库存模式，提交净需求进行采购
                await tb_netdemand.create({
                    materiel_id: stock.materiel_id,
                    order_id: '',
                    netdemand_amount: stock.min_purchase_amount,
                    mrp_date: moment(new Date()).format('YYYY-MM-DD'),
                    mrp_domain_id: domainId
                });
                stock.trigger_safe_model = '1';
                await stock.save();
            }

        }
    } else {
        returnData.success = false;
        returnData.current_amount = 0;
    }*/

    return returnData;
};

//入库数量校验
exports.dealWithInventoryIn = async(warehouseId, materialId, amountIn, orderId, domainId, warehouseZoneId) => {
    let amount = parseFloat(amountIn);
    let returnData = {
        success: false, //入库是否成功
        current_amount: 0 //当前库存数量
    };

    let queryData = {
        warehouse_id: warehouseId,
        materiel_id: materialId,
        order_id: orderId,
        domain_id: domainId
    };

    if (warehouseZoneId) {
        queryData.warehouse_zone_id = warehouseZoneId;
    } else {
        queryData.warehouse_zone_id = null;
    }

    let materiel = await tb_materiel.findOne({
        where: {
            materiel_id: materialId
        }
    });
    let isSafe = materiel.materiel_manage === '1';

    let stock = await tb_stockmap.findOne({
        where: queryData
    });

    if (amount >= 0) {
        if (stock) {
            stock.current_amount = stock.current_amount + amount;
            await stock.save();
            returnData.success = true;
            returnData.current_amount = stock.current_amount;
            if (isSafe && stock.trigger_safe_model === 1) {
                stock.trigger_safe_model = 0;
                await stock.save();
            }
        } else {
            queryData.current_amount = amount;
            await tb_stockmap.create(queryData);
            returnData.success = true;
            returnData.current_amount = amount;
        }
    }

    return returnData
};

//安全库存入库数量校验
exports.dealWithSafeInventoryIn = async(warehouseId, materialId, amountIn, domainId, warehouseZoneId) => {
    let returnData = {
        success: false, //入库是否成功
        current_amount: 0 //当前库存数量
    };

    const queryParams = {
        domain_id: domainId,
        materiel_id: materialId,
        storage_type: 1
    };

    if (warehouseId) {
        queryParams.warehouse_id = warehouseId;
    }

    if (warehouseZoneId) {
        queryParams.warehouse_zone_id = warehouseZoneId;
    }

    const stockMap = await tb_stockmap.findOne({
        where: {
            ...queryParams
        }
    });

    if (stockMap) {
        stockMap.current_amount += parseInt(amountIn);
        if (stockMap.current_amount > stockMap.safe_amount && stockMap.trigger_safe_model === 1) {
            stockMap.trigger_safe_model = 0;
        }
        await stockMap.save();
    }

    returnData.success = true;
    returnData.current_amount = stockMap.current_amount;

    /*let queryStr = `select si.* from tbl_erc_stockitem si
                    left join tbl_erc_stockmap s on (s.stockmap_id = si.stockmap_id)
                    left join tbl_erc_materiel m on (s.materiel_id = m.materiel_id and m.state = 1)
                    where s.domain_id = ? and s.materiel_id = ? `;

    let replacements = [domainId,materialId];

    if (warehouseId) {
        queryStr += ` and si.warehouse_id = ?`;
        replacements.push(warehouseId);
    }

    if (warehouseZoneId) {
        queryStr += ` and si.warehouse_zone_id = ?`;
        replacements.push(warehouseZoneId);
    } else {
        queryStr += ` and si.warehouse_zone_id is null`;
    }

    let items = await sequelize.query(queryStr, {
        replacements: replacements,
        type: sequelize.QueryTypes.SELECT
    });

    if (items.length <= 0) {
        let stock = await tb_stockmap.findOne({
            where: {
                domain_id: domainId,
                materiel_id: materialId,
            }
        });

        if (stock) {
            stock.current_amount += amount;
            if (stock.current_amount > stock.safe_amount &&
                stock.trigger_safe_model === '1') {
                stock.trigger_safe_model = '0';
            }
            await stock.save();

            await tb_stockitem.create({
                stockmap_id: stock.stockmap_id,
                item_amount: amount,
                warehouse_id: warehouseId,
                warehouse_zone_id: warehouseZoneId
            });
        }

        returnData.success = true;
        returnData.current_amount = stock.current_amount;
    } else {
        let item = items[0];
        let queryData = {
            stockmap_id: item.stockmap_id,
            warehouse_id: warehouseId,
        };
        if (warehouseZoneId) {
            queryData.warehouse_zone_id = warehouseZoneId;
        } else {
            queryData.warehouse_zone_id = null;
        }

        let stockitem = await tb_stockitem.findOne({
            where: queryData
        });

        if (stockitem) {
            stockitem.item_amount += amount;
            await stockitem.save();
        }

        let stock = await tb_stockmap.findOne({
            where: {
                stockmap_id: item.stockmap_id
            }
        });

        if (stock) {
            stock.current_amount += amount;
            if (stock.current_amount > stock.safe_amount &&
                stock.trigger_safe_model === '1') {
                stock.trigger_safe_model = '0';
            }
            await stock.save();
        }

        returnData.success = true;
        returnData.current_amount = stock.current_amount;
    }*/

    return returnData;
};
//物料列表
let searchMaterielAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},queryStr ='',replacements = [];

        if(doc.materiel_manage == '2'){//销售订单管理

            if(typeof(doc.warehouse_id) == 'undefined' && typeof(doc.warehouse_zone_id) == 'undefined'){

                queryStr =`select m.materiel_code,m.materiel_name,materiel_unit,m.materiel_format,m.materiel_state_management,
            s.current_amount from tbl_erc_stockmap s,tbl_erc_materiel m 
            where s.materiel_id = m.materiel_id and m.state = 1 and s.domain_id = ? and s.warehouse_id = ? and s.warehouse_zone_id = ?`

                replacements = [];
                replacements = [doc.domain_id,doc.warehouse_id,doc.warehouse_zone_id];
            } else if(typeof(doc.warehouse_id) != 'undefined' && typeof(doc.warehouse_zone_id) == 'undefined'){

                queryStr =`select m.materiel_code,m.materiel_name,materiel_unit,m.materiel_format,m.materiel_state_management,
            s.current_amount from tbl_erc_stockmap s,tbl_erc_materiel m 
            where s.materiel_id = m.materiel_id and m.state = 1 and s.state=1 
            and s.domain_id = ? and s.warehouse_id = ?`

                replacements = [];
                replacements = [doc.domain_id,doc.warehouse_id];
            } else {

                queryStr =`select m.materiel_code,m.materiel_name,materiel_unit,m.materiel_format,m.materiel_state_management,
            s.current_amount from tbl_erc_stockmap s,tbl_erc_materiel m 
            where s.materiel_id = m.materiel_id and m.state = 1 and s.state=1 
            and s.domain_id = ? and s.warehouse_id = ? and s.warehouse_zone_id = ?`

                replacements = [];
                replacements = [doc.domain_id,doc.warehouse_id,doc.warehouse_zone_id];
            }
        }else{//安全库存管理
            if(typeof(doc.warehouse_id) == 'undefined' && typeof(doc.warehouse_zone_id) == 'undefined'){

                queryStr =`select m.materiel_code,m.materiel_name,materiel_unit,m.materiel_format,m.materiel_state_management,
            s.current_amount from tbl_erc_stockmap s,tbl_erc_materiel m 
            where s.materiel_id = m.materiel_id and m.state = 1 and s.domain_id = ? and s.warehouse_id = ? and s.warehouse_zone_id = ?`

                replacements = [];
                replacements = [doc.domain_id,doc.warehouse_id,doc.warehouse_zone_id];
            }else if(typeof(doc.warehouse_id) != 'undefined' && typeof(doc.warehouse_zone_id) == 'undefined') {

                queryStr =`select m.materiel_code,m.materiel_name,materiel_unit,m.materiel_format,m.materiel_state_management,
            sm.current_amount from tbl_erc_stockmap sm
            where sm.materiel_id = m.materiel_id and m.state = 1 
            and sm.domain_id = ? and sm.warehouse_id = ?`

                replacements = [];
                replacements = [doc.domain_id,doc.warehouse_id];
            } else {

                queryStr =`select m.materiel_code,m.materiel_name,materiel_unit,m.materiel_format,m.materiel_state_management,
            sm.current_amount from tbl_erc_stockmap sm,tbl_erc_materiel m
            where sm.materiel_id = m.materiel_id and m.state = 1
            and sm.domain_id = ? and sm.warehouse_id = ? and sm.warehouse_zone_id = ?`

                replacements = [];
                replacements = [doc.domain_id,doc.warehouse_id,doc.warehouse_zone_id];
            }
        }
        queryStr += ' order by sm.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];

        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//修改移库数据
let modifyMovingAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body), user = req.user;

        if(doc.stockmap_id){//销售订单管理
            let modify = await tb_stockmap.findOne({
                where: {
                    domain_id: user.domain_id,
                    stockmap_id: doc.stockmap_id,
                    storage_type: 2
                }
            });
            if(!doc.warehouse_zone_id){
                if (doc.current_amount > modify.current_amount ) {
                   return common.sendError(res, 'moving_01')
                } else if (doc.current_amount <= 0) {
                    return common.sendError(res, 'moving_02')
                } else {
                    let stockmap = await tb_stockmap.findOne({
                        where: {
                            domain_id: user.domain_id,
                            warehouse_id: doc.warehouse_id,
                            warehouse_zone_id: null,
                            materiel_id: doc.materiel_id,
                            storage_type: 2
                        }
                    });
                    if (stockmap) {
                        stockmap.current_amount = stockmap.current_amount + parseInt(doc.current_amount)
                        stockmap.state = 1
                        modify.current_amount -= doc.current_amount
                        if (modify.current_amount === 0) {
                            modify.state = 0
                        }
                        await modify.save()
                        await stockmap.save();
                    } else {
                        let stockmap = await tb_stockmap.create({
                            domain_id: user.domain_id,
                            warehouse_id: doc.warehouse_id,
                            materiel_id: doc.materiel_id,
                            current_amount: doc.current_amount,
                            available_amount: modify.available_amount,
                            // frozen_amount: modify.frozen_amount,
                            // safe_amount: modify.safe_amount,
                            order_id: modify.order_id,
                            // is_idle_stock: modify.is_idle_stock,
                            warehouse_zone_id: null,
                            state: '1',
                            // min_purchase_amount: modify.min_purchase_amount,
                            // trigger_safe_model: modify.trigger_safe_model,
                            storage_type: 2
                        });
                        modify.current_amount -= doc.current_amount;
                        if (modify.current_amount === 0) {
                            modify.state = 0
                        }
                        await modify.save();
                        await stockmap.save();
                    }
                }
            } else {
                if (doc.current_amount > modify.current_amount ) {
                   return common.sendError(res, 'moving_01')
                } else if (doc.current_amount <= 0) {
                   return common.sendError(res, 'moving_02')
                } else {
                    let stockmap = await tb_stockmap.findOne({
                        where: {
                            domain_id: user.domain_id,
                            warehouse_id: doc.warehouse_id,
                            warehouse_zone_id: doc.warehouse_zone_id,
                            materiel_id: doc.materiel_id,
                            storage_type: 2
                        }
                    });
                    if (stockmap) {
                        stockmap.current_amount = stockmap.current_amount + parseInt(doc.current_amount)
                        modify.current_amount -= doc.current_amount;
                        if (modify.current_amount === 0) {
                            modify.state = 0
                        }
                        if (stockmap.current_amount === 0) {
                            stockmap.state = 0
                        } else {
                            stockmap.state = 1
                        }
                        await modify.save();
                        await stockmap.save();
                    } else {
                        let stockmap = await tb_stockmap.create({
                            domain_id: user.domain_id,
                            warehouse_id: doc.warehouse_id,
                            materiel_id: doc.materiel_id,
                            current_amount: doc.current_amount,
                            available_amount: modify.available_amount,
                            // frozen_amount: modify.frozen_amount,
                            // safe_amount: modify.safe_amount,
                            order_id: modify.order_id,
                            // is_idle_stock: modify.is_idle_stock,
                            warehouse_zone_id: doc.warehouse_zone_id,
                            state: '1',
                            storage_type: 2
                            // min_purchase_amount: modify.min_purchase_amount,
                            // trigger_safe_model: modify.trigger_safe_model
                        });
                        modify.current_amount -= doc.current_amount;
                        if (modify.current_amount === 0) {
                            modify.state = 0;
                        }
                        await modify.save();
                        await stockmap.save();
                    }
                }
            }
        } else {//安全库存订单管理
            /*let stockitem = await tb_stockitem.findOne({
                where: {
                    stockitem_id: doc.stockitem_id
                }
            });*/
            let stockmap = await tb_stockmap.findOne({
                where: {
                    domain_id: user.domain_id,
                    stockmap_id: doc.stockmap_id,
                    materiel_id: doc.materiel_id,
                    storage_type: 1
                }
            });
            if(!doc.warehouse_zone_id){
                /*if (doc.current_amount > stockmap.item_amount ) {
                    return common.sendError(res, 'moving_01')
                } else if (doc.current_amount <= 0) {
                    return common.sendError(res, 'moving_02')
                } else {
                    let yy = await tb_stockitem.findOne({
                        where: {
                            stockmap_id: stockmap.stockmap_id,
                            warehouse_id: doc.warehouse_id
                        }
                    });
                    if (yy) {
                        yy.item_amount = yy.item_amount + parseInt(doc.item_amount);
                        yy.warehouse_id = doc.warehouse_id;
                        stockitem.item_amount = stockitem.item_amount - doc.item_amount;
                        if (yy.state == 0) {
                            yy.state = 1
                        }
                        if (stockitem.item_amount == 0) {
                            stockitem.state = 0
                        }
                        await stockitem.save();
                        await yy.save();
                    } else {
                        let stockitem2 = await tb_stockitem.create({
                            stockmap_id: stockmap.stockmap_id,
                            item_amount: doc.item_amount,
                            warehouse_id: doc.warehouse_id,
                            warehouse_zone_id: null,
                            state: '1'
                        });
                        stockitem.item_amount = stockitem.item_amount - doc.item_amount;
                        if (stockitem.item_amount == 0) {
                            stockitem.state = 0
                        }
                        await stockitem2.save();
                        await stockitem.save();
                    }
                }
                await stockitem.save();*/

            } else {
                /*if (doc.item_amount > stockitem.item_amount ) {
                    return common.sendError(res, 'moving_01')
                } else if (doc.item_amount <= 0) {
                    return common.sendError(res, 'moving_02')
                } else {
                    let yy = await tb_stockitem.findOne({
                        where: {
                            stockmap_id: stockmap.stockmap_id,
                            warehouse_id: doc.warehouse_id,
                            warehouse_zone_id: doc.warehouse_zone_id
                        }
                    });
                    if (yy) {
                        yy.item_amount = yy.item_amount + parseInt(doc.item_amount);
                        stockitem.item_amount = stockitem.item_amount - doc.item_amount;
                        if (yy.state == 0) {
                            yy.state = 1
                        }
                        if (stockitem.item_amount == 0) {
                            stockitem.state = 0
                        }
                        await stockitem.save();
                        await yy.save();
                    } else {
                        let stockitem2 = await tb_stockitem.create({
                            stockmap_id: stockmap.stockmap_id,
                            item_amount: doc.item_amount,
                            warehouse_id: doc.warehouse_id,
                            warehouse_zone_id: doc.warehouse_zone_id,
                            state: '1'
                        });
                        stockitem.item_amount = stockitem.item_amount - doc.item_amount;
                        if (stockitem.item_amount == 0) {
                            stockitem.state = 0
                        }
                        await stockitem2.save();
                        await stockitem.save();
                    }
                }
                await stockitem.save();*/
            }
        }
        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//闲置库存扫描
const scanIdleAct = async(req, res) => {
    try {
        const { user } = req;

        let queryStr =
            `select sm.* from tbl_erc_stockmap sm
                left join tbl_erc_order o on (o.order_id = sm.order_id)
                where o.order_state = 'FINISHI'
                and sm.current_amount > 0 and sm.order_id is not null and sm.storage_type = 2 and sm.domain_id = ? `;
        const replacements = [user.domain_id];
        let result = await common.simpleSelect(sequelize, queryStr, replacements);
        for (let sm of result) {
            let idleApply = await tb_idleapply.findOne({
                where: {
                    order_id: sm.order_id,
                    domain_id: user.domain_id,
                    idle_apply_state: 1
                }
            });
            if (!idleApply) {
                let applyID = await Sequence.genIdleApplyId(user.domain_id);
                idleApply = await tb_idleapply.create({
                    idleapply_id: applyID,
                    domain_id: user.domain_id,
                    idle_apply_state: 1,
                    idle_apply_submit: user.user_id,
                    order_id: sm.order_id
                });

                //创建审核任务, 同一订单号的物料只创建一次任务
                let taskName = '闲置库存申请';
                let taskReviewCode = idleApply.idleapply_id;
                let taskDescription = '订单号为' + sm.order_id + '的闲置物料申请';
                let reviewId = idleApply.order_id;
                let groupId = common.getUUIDByTime(30);
                await TaskListControlSRV.createTask(user, taskName, 17, '', taskReviewCode, taskDescription, reviewId, groupId);
            }

            await tb_idleapplyitem.create({
                idleapply_id: idleApply.idleapply_id,
                materiel_id: sm.materiel_id,
                idle_item_amount: sm.current_amount,
                warehouse_id: sm.warehouse_id,
                warehouse_zone_id: sm.warehouse_zone_id
            });

            const orderStock = await tb_stockmap.find({
                where: {
                    stockmap_id: sm.stockmap_id
                }
            });

            orderStock.storage_type = 3;
            await orderStock.save();
        }
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
};

/**
 * @param resultType：0 驳回 1 通过
 * @param orderId：销售订单号
 * @param idleApplyId：闲置库存申请单号
 * @param reviewUserId: 审核人user_id
 * @param domainId：机构Id
 * @param remark：驳回说明
 */
exports.updateIdleApply = async(resultType, orderId, idleApplyId, reviewUserId, domainId, remark) => {
    if (resultType == 1) {
        let stocks = await tb_stockmap.findAll({
            where: {
                order_id: orderId,
                domain_id: domainId,
                is_idle_stock: 0,
                current_amount: {
                    $gt: 0
                }
            }
        });
        for(let s of stocks) {
            //寻找同一个materiel_id的没有order_id的闲置物料
            let findM = await tb_stockmap.findOne({
                where: {
                    materiel_id: s.materiel_id,
                    warehouse_id: s.warehouse_id,
                    warehouse_zone_id: s.warehouse_zone_id,
                    is_idle_stock: 1,
                    order_id: {
                        $eq: null
                    }
                }
            });
            //累加闲置库存的数量
            if (findM) {
                findM.current_amount += s.current_amount;
                await findM.save();
            } else {
                await tb_stockmap.create({
                    warehouse_id: s.warehouse_id,
                    warehouse_zone_id: s.warehouse_zone_id,
                    materiel_id: s.materiel_id,
                    domain_id: domainId,
                    current_amount: s.current_amount,
                    is_idle_stock: 1
                });

                //删除此物料有订单号的库存记录
                await tb_stockmap.destroy({
                    where: {
                        stockmap_id: s.stockmap_id
                    }
                })
            }

            // //改变is_idle_stock状态
            // let findS = await tb_stockmap.findOne({
            //     where: {
            //         stockmap_id: s.stockmap_id
            //     }
            // });
            // findS.is_idle_stock = 1;
            // findS.current_amount = 0;
            // await findS.save();
        }
        //更改申请单的状态
        let idleApply = await tb_idleapply.findOne({
            where: {
                idleapply_id: idleApplyId
            }
        });
        if (idleApply) {
            idleApply.idle_apply_state = 2;
            idleApply.idle_apply_review_date = new Date();
            idleApply.idle_apply_review = reviewUserId;
            await idleApply.save();
        }
    } else {
        let stocks = await tb_stockmap.findAll({
            where: {
                order_id: orderId,
                domain_id: domainId,
                is_idle_stock: 0,
                current_amount: {
                    $gt: 0
                }
            }
        });
        for(let s of stocks) {
            //恢复trigger_idle_scan状态
            let findS = await tb_stockmap.findOne({
                where: {
                    stockmap_id: s.stockmap_id
                }
            });
            findS.trigger_idle_scan = 0;
            await findS.save();
        }
        //更改申请单的状态
        let idleApply = await tb_idleapply.findOne({
            where: {
                idleapply_id: idleApplyId
            }
        });
        if (idleApply) {
            idleApply.idle_apply_state = 3;
            idleApply.idle_apply_review_date = new Date();
            idleApply.idle_apply_review = reviewUserId;
            idleApply.idle_apply_remark = remark;
            await idleApply.save();
        }
    }
};

