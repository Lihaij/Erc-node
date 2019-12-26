const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const model = require('../../../model');
const { CODE_NAME, genBizCode } = require('../../../util/BizCodeUtil');

const sequelize = model.sequelize;
const tb_materiel = model.erc_materiel;
const tb_order = model.erc_order;
const tb_inventory_replace_info = model.erc_inventory_replace_info;
const tb_suppliermateriel_ot = model.erc_suppliermateriel_ot;
const tb_productivetask = model.erc_productivetask;
const tb_productivetaskdetail = model.erc_productivetaskdetail;
const tb_productivetaskprocess = model.erc_productivetaskprocess;
const tb_stockmap = model.erc_stockmap;
const tb_inventoryorder = model.erc_inventoryorder;
const tb_inventoryaccount = model.erc_inventoryaccount;
const tb_financerecorditem = model.erc_financerecorditem;
const tb_inventory_production_account = model.erc_inventory_production_account;
const tb_inventory_procedure_account = model.erc_inventory_procedure_account;
const tb_productivetask_transfer = model.erc_productivetask_transfer;
const tb_productivetask_procedure = model.erc_productivetask_procedure;
const tb_productivetask_machining = model.erc_productivetask_machining;
const tb_verification_feeding_report = model.erc_verification_feeding_report;
const tb_productplandetail = model.erc_productplandetail;
const tb_warehouse = model.erc_warehouse;
const tb_supplier = model.erc_supplier;
const tb_inventorytotal = model.erc_inventorytotal;
const tb_corporateclients = model.erc_corporateclients;
const tb_department = model.erc_department;

const {
    createRecordingVoucherSC,
    getSalary
} = require('../../../util/RecordingVouchersc');

exports.getCorrespondingUnit = async(domain_id) => {
    let supplierArray = await tb_supplier.findAll({
        where: {
            domain_id
        },
        attributes: [['supplier_id', 'id'], ['supplier_name', 'text']]
    });

    supplierArray = supplierArray.map(item => ({ id: item.dataValues.id, text: `供应商-${item.dataValues.text}` }));

    let clientsArray = await tb_corporateclients.findAll({
        where: {
            domain_id
        },
        attributes: [['corporateclients_id', 'id'], ['corporateclients_name', 'text']]
    });

    clientsArray = clientsArray.map(item => ({ id: item.dataValues.id, text: `客户-${item.dataValues.text}` }));

    let departmentArray = await tb_department.findAll({
        where: {
            domain_id,
            department_type: 0
        },
        attributes: [['department_id', 'id'], ['department_name', 'text']]
    });

    departmentArray = departmentArray.map(item => ({ id: item.dataValues.id, text: `车间-${item.dataValues.text}` }));

    return [...supplierArray, ...clientsArray, ...departmentArray];
};

exports.getProductiveTaskDepartment = async(productivetask_id) => {
    const queryString =
        `select
            gpt.department_id, gpt.department_id as id, dpt.department_name, dpt.department_name as text
            from (
            select
            ptp.department_id
            from tbl_erc_productivetask pt
            left join tbl_erc_productivetaskprocess ptp
            on ptp.productivetask_id = pt.productivetask_id
            where pt.productivetask_id = ?
            group by ptp.department_id) gpt
            left join tbl_erc_department dpt
            on dpt.department_id = gpt.department_id`;

    const replacements = [ productivetask_id ];
    return await common.simpleSelect(sequelize, queryString, replacements);
};

exports.recordInventoryTotal = async(options, transaction) => {
    const {
        domain_id,
        relation_id, relation_sub_id,
        warehouse_id, materiel_id,
        total_count, actual_count,
        inventory_type
    } = options;

    let inventoryTotal = await tb_inventorytotal.findOne({
        domain_id,
        relation_id
    });

    if (inventoryTotal) {
        inventoryTotal.actual_count += actual_count;
        inventoryTotal.inventory_state = inventoryTotal.total_count > inventoryTotal.actual_count ? 1 : 2;
        await inventoryTotal.save({ transaction });
    } else {
        inventoryTotal = await tb_inventorytotal.create({
            domain_id,
            relation_id,
            relation_sub_id,
            warehouse_id,
            materiel_id,
            total_count,
            actual_count,
            inventory_type,
            inventory_state: total_count > actual_count ? 1 : 2
        }, { transaction });
    }

    return inventoryTotal;
};

//生产任务单关联的投料自动领料
exports.productFeedingInventory = async(params, stock_in_number, transaction) => {
    const {
        user, production_type, domain_id, productivetask_id, order_id, warehouse_id
    } = params;

    let bill_code = '';
    if (production_type === 5) {
        bill_code = await genBizCode(CODE_NAME.LLCK, domain_id, 6);
    } else if (production_type === 7) {
        bill_code = await genBizCode(CODE_NAME.WWCK, domain_id, 6);
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

    const detailArray = await tb_productivetaskdetail.findAll({
        where: {
            productivetask_id
        }
    });

    for (const detailItem of detailArray) {
        /*const { taskdetaildesign_number, design_number, stock_out_number, materiel_id } = detailItem;
        //总数量减去已出库数量等于未出库数量
        const remain_out_number = taskdetaildesign_number - stock_out_number;
        //根据产品入库数量计算自动领料的投料出库数量
        let int_out_number = parseInt(design_number) * parseInt(stock_in_number);

        //如果自动出库数量大于需要出库的数量则取剩余出库数量出库
        if (int_out_number > remain_out_number) {
            int_out_number = remain_out_number;
        }*/

        const { design_number, materiel_id, stock_out_number, taskdetaildesign_number } = detailItem;
        if (stock_out_number >= taskdetaildesign_number) {
            //如果生产领料已完成
            continue;
        }

        //自动领料数量
        const int_out_number = parseInt(design_number) * stock_in_number;

        const materiel = await tb_materiel.findOne({
            where: {
                materiel_id,
                state: GLBConfig.ENABLE
            }
        });

        if (!materiel) {
            throw new Error('缺少投料信息');
        }

        const queryParams = {
            domain_id,
            materiel_id,
            state: GLBConfig.ENABLE,
            current_amount: {
                $gte: int_out_number
            }
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
            }
        });

        if (!stockMap) {
            throw new Error(`${materiel.materiel_code}没有库存记录或者库存数量不够`);
        }

        stockMap.price_amount -= (stockMap.price_amount / stockMap.current_amount) * int_out_number;
        stockMap.current_amount -= int_out_number;
        await stockMap.save({ transaction });

        const inventoryAccount = await tb_inventoryaccount.create({
            domain_id,
            bill_code,
            order_id,
            p_order_id: productivetask_id,
            warehouse_id: stockMap.warehouse_id,
            warehouse_zone_id: stockMap.warehouse_zone_id,
            materiel_id,
            inventory_price: stockMap.store_price,
            account_operate_amount: int_out_number,
            account_operate_type: {5: 6, 7: 8}[production_type]
        }, { transaction });

        const relationOptions = {
            domain_id: user.domain_id,
            relation_id: productivetask_id,
            total_count: dtlDesignNumber,
            actual_count: int_out_number,
            inventory_type: production_type
        };
        await module.exports.recordInventoryTotal(relationOptions, transaction);

        if (inventoryAccount) {
            const { inventoryaccount_id } = inventoryAccount;
            await tb_inventory_production_account.create({
                domain_id,
                productivetask_id,
                inventoryaccount_id
            }, { transaction });
        }

        await tb_financerecorditem.create({
            domain_id,
            materiel_id,
            wms_type: 2,
            manage_type: {5: 2, 7: 4}[production_type],
            store_amount: int_out_number,
            store_price: stockMap.store_price
        }, { transaction });

        detailItem.stock_out_number += int_out_number;
        await detailItem.save({ transaction });

        //如果实际领料数量大于规划领料数量--生产自动领料差额单
        const balanceAmount = detailItem.stock_out_number - taskdetaildesign_number;
        if (balanceAmount > 0) {
            await tb_inventory_replace_info.create({
                domain_id: user.domain_id,
                third_id: productivetask_id,
                bill_code,
                materiel_id,
                replace_price: stockMap.store_price,
                confirm_price: stockMap.store_price,
                inventory_amount: balanceAmount,
                inventory_type: {5: 4, 7: 8}[production_type]
            }, { transaction });

            const options = {
                materiel_id,
                productivetask_id,
                amount: balanceAmount * stockMap.store_price
            };

            if (production_type === 5) {
                await createRecordingVoucherSC('CPRKD_3', user, options);
            } else if (production_type === 7) {
                await createRecordingVoucherSC('WWRKD_1', user, options);
            }
        }
    }

    const dtlStockNumber = await tb_productivetaskdetail.sum('stock_out_number', {
        where: {
            productivetask_id
        },
        transaction
    }) || 0;

    const productiveTask = await tb_productivetask.findOne({
        where: {
            productivetask_id,
            domain_id
        },
        transaction
    });

    if (!productiveTask) {
        throw new Error('无法取得生产任务单');
    }

    productiveTask.stock_out_state = dtlDesignNumber > dtlStockNumber ? 2 : 3;
    await productiveTask.save({ transaction });

    await tb_inventoryorder.create({
        domain_id,
        bill_code,
        bs_order_id: productivetask_id,
        warehouse_id,
        account_operate_type: {5: 6, 7: 8}[production_type]
    }, { transaction });
};

//取得供应商的物料价格
async function getSupplierMaterielPrice(domain_id, materiel_id, supplier_id) {
    let queryStr =
        `select
            sm.suppliermateriel_purchasepricetax
            from tbl_erc_suppliermateriel sm
            left join tbl_erc_supplier spl
            on spl.supplier_id = sm.supplier_id
            where true
            and sm.state = 1
            and spl.domain_id = ?`;

    const replacements = [ domain_id ];

    if (materiel_id) {
        queryStr += ' and sm.materiel_id = ?';
        replacements.push(materiel_id);
    }

    if (supplier_id) {
        queryStr += ' and sm.supplier_id = ?';
        replacements.push(supplier_id);
    }

    const [ result ] = await common.simpleSelect(sequelize, queryStr, replacements);
    return result ? result.suppliermateriel_purchasepricetax || 0 : 0;
}

//取得物料的预算成本
async function getMaterielBudgetCostPrice(domain_id, materiel_id) {
    const materiel = await tb_materiel.findOne({
        where: {
            domain_id,
            materiel_id,
            state: GLBConfig.ENABLE
        },
        attributes: ['materiel_cost']
    });

    return materiel ? materiel.materiel_cost || 0 : 0;
}

//记录采购入库的替代价格
exports.recordPurchaseInReplacePrice = async(user, materiel_id, supplier_id, bill_code, inventory_amount, inventory_type, transaction) => {
    let materiel_price = await getSupplierMaterielPrice(user.domain_id, materiel_id, supplier_id);
    if (!materiel_price) {
        materiel_price = await getMaterielBudgetCostPrice(user.domain_id, materiel_id);

        await tb_inventory_replace_info.create({
            domain_id: user.domain_id,
            third_id: supplier_id,
            bill_code,
            materiel_id,
            replace_price: materiel_price,
            inventory_amount,
            inventory_type
        }, { transaction });

        //采购入库记账凭证
        const options = {
            materiel_id,
            supplier_id,
            amount: inventory_amount * materiel_price
        };
        await createRecordingVoucherSC('CGRK', user, options, transaction);
    }

    return materiel_price;
};

//计算已记录的替代价格的差额之和
exports.calcTotalReplacePrice = async(domain_id, supplier_id, materiel_id, inventory_type, replace_state) => {
    const queryStr =
        `select
            sum(inventory_amount * (confirm_price - replace_price)) as total_price
            from tbl_erc_inventory_replace_info
            where true
            and domain_id = ?
            and third_id = ?
            and materiel_id = ?
            and inventory_type = ?
            and replace_state = ?`;

    const replacements = [ domain_id, supplier_id, materiel_id, inventory_type, replace_state ];
    const [ result ] = await common.simpleSelect(sequelize, queryStr, replacements);
    return result ? result.total_price || 0 : 0;
};

//取得客户订单的物料销售价格
async function getCustomerMaterielPrice(domain_id, order_id, materiel_id) {
    let queryStr =
        `select
            om.sale_price
            from tbl_erc_order ord
            left join tbl_erc_ordermateriel om
            on om.order_id = ord.order_id
            where true
            and ord.domain_id = ?`;

    const replacements = [ domain_id ];

    if (order_id) {
        queryStr += ' and ord.order_id = ?';
        replacements.push(order_id);
    }

    if (materiel_id) {
        queryStr += ' and om.materiel_id = ?';
        replacements.push(materiel_id);
    }

    const [ result ] = await common.simpleSelect(sequelize, queryStr, replacements);
    return result ? result.sale_price || 0 : 0;
}

//取得物料的预算销售价格
async function getMaterielBudgetSalePrice(domain_id, materiel_id) {
    const materiel = await tb_materiel.findOne({
        where: {
            domain_id,
            materiel_id,
            state: GLBConfig.ENABLE
        },
        attributes: ['materiel_sale']
    });

    return materiel ? materiel.materiel_sale || 0 : 0;
}

//记录销售出库的替代价格
exports.recordSaleOutReplacePrice = async(user, materiel_id, order_id, bill_code, inventory_amount, inventory_type, transaction) => {
    let materiel_price = await getCustomerMaterielPrice(user.domain_id, order_id, materiel_id);
    if (!materiel_price) {
        materiel_price = await getMaterielBudgetSalePrice(user.domain_id, materiel_id);

        await tb_inventory_replace_info.create({
            domain_id: user.domain_id,
            third_id: order_id,
            bill_code,
            materiel_id,
            replace_price: materiel_price,
            inventory_amount,
            inventory_type
        }, { transaction });

        const orderResult = await tb_order.findOne({
            where: {
                order_id
            },
            attributes: ['purchaser_corporateclients_id']
        });

        //销售出库记账凭证
        const options = {
            materiel_id,
            corporateclients_id: orderResult ? orderResult.purchaser_corporateclients_id : null,
            amount: inventory_amount * materiel_price
        };
        await createRecordingVoucherSC('XSCK', user, options, transaction);
    }

    return materiel_price;
};

//取得委外供应商的委外物料生产成本
async function getOutSourcingMaterielCost(supplier_id, materiel_id) {
    const result = await tb_suppliermateriel_ot.findOne({
        where: {
            supplier_id,
            materiel_id
        },
        attributes: ['suppliermateriel_cost']
    });

    return result ? result.suppliermateriel_cost || 0 : 0;
}

//委外入库记账凭证2
exports.recordOutSourcingPrice = async(user, productivetask_id, supplier_id, materiel_id, inventory_amount, transaction) => {
    const materiel_cost = await getOutSourcingMaterielCost(supplier_id, materiel_id);
    const options = {
        supplier_id,
        productivetask_id,
        amount: inventory_amount * materiel_cost
    };
    await createRecordingVoucherSC('WWRKD_2', user, options, transaction);
};

//生产入库记账凭证
exports.recordProductInPrice = async(user, productivetask_id, input_amount, transaction) => {
    const { money_n_coefficient } = await getSalary(productivetask_id, input_amount);
    const options = {
        productivetask_id,
        amount: money_n_coefficient
    };
    await createRecordingVoucherSC('CPRKD_2', user, options, transaction);
};

//计算入库产品的投料价格*设计数量
async function calcProductionFeedingPrice(domain_id, productivetask_id) {
    const queryString =
        `select
            mat.materiel_id, mat.materiel_manage, pt.order_id
            from tbl_erc_productivetaskdetail ptd
            left join tbl_erc_productivetask pt
            on ptd.productivetask_id = pt.productivetask_id
            left join tbl_erc_materiel mat
            on ptd.materiel_id = mat.materiel_id
            where true
            and ptd.domain_id = ?
            and ptd.productivetask_id = ?`;

    const replacements = [domain_id, productivetask_id];
    const materielArray = await common.simpleSelect(sequelize, queryString, replacements);

    let feedingTotalPrice = 0;
    for (const materielItem of materielArray) {
        const { materiel_id, materiel_manage, order_id } = materielItem;
        const queryParams = {
            materiel_id,
            state: GLBConfig.ENABLE,
        };
        if (parseInt(materiel_manage) === 2) {
            queryParams.order_id = order_id;
            queryParams.storage_type = 2;
        } else {
            queryParams.storage_type = 1;
        }

        const stockMap = await tb_stockmap.findOne({
            where: {
                ...queryParams
            },
            attributes: ['price_amount', 'current_amount', 'store_price']
        });

        if (stockMap) {
            if (stockMap.price_amount) {
                feedingTotalPrice += stockMap.price_amount / stockMap.current_amount;
            } else {
                feedingTotalPrice += stockMap.store_price;
            }
        }
    }

    return feedingTotalPrice;
}

//处理产品入库数量和更新即时库存价格
async function processProductInventory(process, transaction) {
    const {
        user, bill_code, productivetask_id, production_type, domain_id, materiel_id,
        warehouse_id, warehouse_zone_id, order_id, company_name, materiel_manage, stock_operate_amount,
        // task_biz_code, taskdesign_number, stock_in_number
    } = process;

    //产品对应的所有投料即时库存单价*投料数量
    const feedingCost = await calcProductionFeedingPrice(domain_id, productivetask_id);
    //入库产品投料的即时库存金额
    const feeding_amount_money = stock_operate_amount * feedingCost;
    const { money_n_coefficient = 0, money_y_coefficient = 0 } = await getSalary(productivetask_id, stock_operate_amount);
    const total_amount_money = feeding_amount_money + money_n_coefficient + money_y_coefficient;
    const inventory_store_price = total_amount_money / stock_operate_amount;

    const queryParams = {
        materiel_id,
        state: GLBConfig.ENABLE,
        warehouse_id,
        warehouse_zone_id,
    };
    if (materiel_manage === 2) { //销售订单管理
        queryParams.storage_type = 2;
        queryParams.order_id = order_id;
    } else {
        queryParams.storage_type = 1;
    }

    const stockMap = await tb_stockmap.findOne({
        where: {
            ...queryParams
        },
        transaction
    });

    const storePrice = await getPrecisionPrice(domain_id, inventory_store_price);

    if (stockMap) {
        stockMap.current_amount += stock_operate_amount;
        stockMap.price_amount += total_amount_money;
        stockMap.store_price = await getPrecisionPrice(domain_id, stockMap.price_amount / stockMap.current_amount);
        await stockMap.save({ transaction });
    } else {
        await tb_stockmap.create({
            domain_id,
            materiel_id,
            current_amount: stock_operate_amount,
            available_amount: stock_operate_amount,
            price_amount: total_amount_money,
            store_price: storePrice,
            order_id: queryParams.order_id,
            warehouse_id,
            warehouse_zone_id,
            storage_type: queryParams.storage_type,
            state: GLBConfig.ENABLE,
        }, { transaction });
    }

    await tb_financerecorditem.create({
        domain_id,
        materiel_id,
        wms_type: 1,
        manage_type: {5: 2, 7: 4}[production_type],
        organization: company_name,
        store_amount: stock_operate_amount,
        store_price: storePrice
    }, { transaction });

    //收发存明细
    await tb_inventoryaccount.create({
        domain_id,
        bill_code,
        order_id,
        p_order_id: productivetask_id,
        warehouse_id,
        warehouse_zone_id,
        materiel_id,
        inventory_price: storePrice,
        account_operate_amount: stock_operate_amount,
        account_operate_type: production_type,
        company_name
    }, { transaction });

    const options = {
        materiel_id,
        productivetask_id
    };
    options.amount = feeding_amount_money;
    await createRecordingVoucherSC('CPRKD_5', user, options);

    options.amount = money_n_coefficient;
    await createRecordingVoucherSC('CPRKD_6', user, options);

    options.amount = money_y_coefficient;
    await createRecordingVoucherSC('CPRKD_7', user, options);
}

//处理产品入库数量和更新即时库存价格
async function processOutSourcingInventory(process, transaction) {
    const {
        user, bill_code, productivetask_id, production_type, domain_id,
        materiel_id, warehouse_id, warehouse_zone_id, order_id,
        materiel_manage, supplier_id, stock_operate_amount
    } = process;

    //产品对应的所有投料即时库存单价*投料数量
    const feedingCost = await calcProductionFeedingPrice(domain_id, productivetask_id);
    const materielCost = await getOutSourcingMaterielCost(supplier_id, materiel_id);
    //入库产品投料的即时库存金额
    const feeding_amount_money = stock_operate_amount * feedingCost;
    const out_sourcing_amount_money = stock_operate_amount * materielCost;
    const total_amount_money = feeding_amount_money + out_sourcing_amount_money;
    const inventory_store_price = total_amount_money / stock_operate_amount;

    const queryParams = {
        materiel_id,
        state: GLBConfig.ENABLE,
        warehouse_id,
        warehouse_zone_id
    };
    if (materiel_manage === 2) { //销售订单管理
        queryParams.storage_type = 2;
        queryParams.order_id = order_id;
    } else {
        queryParams.storage_type = 1;
    }

    const stockMap = await tb_stockmap.findOne({
        where: {
            ...queryParams
        },
        transaction
    });

    const storePrice = await getPrecisionPrice(domain_id, inventory_store_price);

    if (stockMap) {
        stockMap.current_amount += stock_operate_amount;
        stockMap.price_amount += total_amount_money;
        stockMap.store_price = await getPrecisionPrice(domain_id, stockMap.price_amount / stockMap.current_amount);
        await stockMap.save({ transaction });
    } else {
        //入库后库存总数量
        // inventory_store_price = total_amount_money / stock_operate_amount;

        await tb_stockmap.create({
            domain_id,
            materiel_id,
            current_amount: stock_operate_amount,
            available_amount: stock_operate_amount,
            price_amount: total_amount_money,
            store_price: storePrice,
            storage_type: queryParams.storage_type,
            order_id: queryParams.order_id,
            warehouse_id,
            warehouse_zone_id,
            state: GLBConfig.ENABLE,
        }, { transaction });
    }

    const supplier = await tb_supplier.findOne({
        where: {
            supplier_id
        }
    });

    await tb_financerecorditem.create({
        domain_id,
        materiel_id,
        wms_type: 1,
        manage_type: {5: 2, 7: 4}[production_type],
        organization: supplier.supplier_name,
        store_amount: stock_operate_amount,
        store_price: storePrice
    }, { transaction });

    //收发存明细
    await tb_inventoryaccount.create({
        domain_id,
        bill_code,
        order_id,
        p_order_id: productivetask_id,
        warehouse_id,
        warehouse_zone_id,
        materiel_id,
        inventory_price: storePrice,
        account_operate_amount: stock_operate_amount,
        account_operate_type: production_type,
        company_name: supplier.supplier_name
    }, { transaction });

    const options1 = {
        materiel_id,
        productivetask_id,
        amount: feeding_amount_money
    };
    await createRecordingVoucherSC('WWRKD_5', user, options1);

    const options2 = {
        materiel_id,
        supplier_id,
        amount: out_sourcing_amount_money
    };
    await createRecordingVoucherSC('WWRKD_6', user, options2);

    return inventory_store_price;
}

exports.recordProductInCostPrice = async(productiveTask, params, stock_operate_amount, transaction) => {
    const { materiel_id, department_id, taskdesign_number, stock_in_number, biz_code } = productiveTask;
    const { production_type } = params;

    const process = {
        ...params,
        materiel_id,
        supplier_id: department_id,
        task_biz_code: biz_code,
        taskdesign_number,
        stock_in_number,
        stock_operate_amount
    };

    if (production_type === 5) {
        await processProductInventory(process, transaction);
    } else if (production_type === 7) {
        await processOutSourcingInventory(process, transaction);
    }
};

//系统自动生成工序计划
exports.productProcedureAutoDone = async(user, productivetask_id, input_amount, transaction) => {
    const taskProcessArray = await tb_productivetaskprocess.findAll({
        where: {
            productivetask_id
        },
        attributes: ['procedure_id']
    });

    for (const taskItem of taskProcessArray) {
        const { procedure_id } = taskItem;

        let taskTransfer = await tb_productivetask_transfer.findOne({
            where: {
                productivetask_id,
                procedure_id
            }
        });

        if (taskTransfer) {
            taskTransfer.transfer_number = 0;
            taskTransfer.qualified_number = input_amount;
            await taskTransfer.save({ transaction });
        } else {
            taskTransfer = await tb_productivetask_transfer.create({
                productivetask_id,
                transfer_number: 0,
                qualified_number: input_amount,
                procedure_id,
                domain_id: user.domain_id
            }, { transaction });
        }

        await tb_productivetask_procedure.create({
            domain_id: user.domain_id,
            productivetask_id,
            procedure_id,
            transfer_number: input_amount,
            qualified_number: input_amount,
            unqualified_number: 0,
            biz_code: await genBizCode(CODE_NAME.GXYZDH, user.domain_id, 6, transaction)
        }, { transaction });

        await tb_inventory_procedure_account.create({
            domain_id: user.domain_id,
            prd_task_procedure_id: taskTransfer.prd_task_procedure_id,
            inventory_number: input_amount
        }, { transaction });
    }

    const { money_n_coefficient, money_y_coefficient } = await getSalary(productivetask_id, input_amount);
    const options1 = {
        productivetask_id,
        amount: money_n_coefficient - money_n_coefficient
    };
    await createRecordingVoucherSC('CPRKD_4', user, options1, transaction);

    const options2 = {
        productivetask_id,
        amount: money_y_coefficient - money_y_coefficient
    };
    await createRecordingVoucherSC('CPRKD_4_1', user, options2, transaction);
};

//系统自动生成加工费
exports.productOutSourcingAutoDone = async(user, productivetask_id, input_amount, supplier_id, materiel_id, transaction) => {
    const machiningCost = await getOutSourcingMaterielCost(supplier_id, materiel_id);
    const feedingCoast = await calcProductionFeedingPrice(user.domain_id, productivetask_id);

    await tb_productivetask_machining.create({
        productivetask_id,
        product_cost: machiningCost,
        feeding_cost: feedingCoast,
        inventory_amount: input_amount,
        domain_id: user.domain_id
    }, { transaction });

    const options = {
        supplier_id,
        productivetask_id,
        amount: machiningCost - machiningCost
    };
    await createRecordingVoucherSC('CPRKD_4', user, options, transaction);
};

async function reportVerificationFeedingAmount(productivetask_id, verification_amount, verification_number, feedingProductiveTaskId) {
    const feedingReport = await tb_verification_feeding_report.findOne({
        where: {
            productivetask_id,
            feeding_productivetask_id: feedingProductiveTaskId,
            verification_state: 0
        }
    });

    if (feedingReport) {
        await tb_verification_feeding_report.create({
            productivetask_id,
            feeding_productivetask_id: feedingProductiveTaskId,
            verification_amount,
            verification_number
        });
    } else {
        feedingReport.verification_amount += verification_amount;
        await feedingReport.save();
    }
}

async function getOrderAlreadySaleMaterielCount(order_id) {
    const queryDone =
        `select
            IFNULL(gia.done_count,0) as done_count
            from (
            select ia.order_id, sum(ia.account_operate_amount) as done_count
            from tbl_erc_inventoryaccount as ia
            where ia.account_operate_type = 2
            group by ia.order_id) gia
            where true
            and gia.order_id = ?`;

    const [ doneResult ] = await common.simpleSelect(sequelize, queryDone, [ order_id ]);
    return doneResult ? doneResult.done_count || 0 : 0;
}

async function getOrderTotalSaleMaterielCount(order_id) {
    const queryTotal =
        `select
            sum(pt.taskdesign_number) as total_count
            from tbl_erc_productivetask pt
            where true
            and pt.product_level = 1
            and pt.order_id = ?
            group by pt.order_id`;

    const [ totalResult ] = await common.simpleSelect(sequelize, queryTotal, [ order_id ]);
    return totalResult ? totalResult.total_count || 0 : 0;
}

async function findSuperiorProductPlanMateriel(product_id, order_id, materiel_id, verification_amount, verification_number, feedingProductiveTaskId, intInventoryType) {
    //根据上级投料ID和生产计划ID查询上级生产任务
    const productiveTask = await tb_productivetask.findOne({
        where: {
            product_id,
            order_id,
            materiel_id
        }
    });

    const user = { domain_id: productiveTask.domain_id };

    if (productiveTask) {
        //如果根据产品规划订单号和物料ID找到生产任务单
        const { productivetask_id, stock_in_state } = productiveTask;
        if (parseInt(stock_in_state) === 3) {
            //第二种情况--如果该生产任务已完成
            //查找该生产任务的产品规划投料信息
            const productPlanDetail = await tb_productplandetail.findOne({
                where: {
                    product_plan_id: product_id,
                    src_materiel_id: materiel_id
                }
            });

            if (productPlanDetail) {
                //取得上级投料ID
                const { prd_level, level_materiel_id } = productPlanDetail;
                if (prd_level > 2) {
                    //如果产品层级不是最上级投料则查找上级投料
                    await findSuperiorProductPlanMateriel(product_id, order_id, level_materiel_id, verification_amount, verification_number, feedingProductiveTaskId);
                } else {
                    const feedingTastResult = await tb_productivetask.findOne({
                        where: {
                            productivetask_id: feedingProductiveTaskId
                        },
                        attributes: ['outsource_sign']
                    });

                    //所有投料都已经领料完成
                    const doneCount = await getOrderAlreadySaleMaterielCount(order_id);
                    const totalCount = await getOrderTotalSaleMaterielCount(order_id);
                    if (doneCount < totalCount) {
                        //第三种情况--销售订单没有销售完毕
                        const stockMapResult = await tb_stockmap.findOne({
                            where: {
                                materiel_id,
                                order_id
                            }
                        });

                        if (stockMapResult) {
                            // const { store_price, current_amount } = stockMapResult;
                            // const total_amount = store_price * current_amount;
                            const update_price = (verification_amount + stockMapResult.price_amount) / stockMapResult.current_amount;

                            await tb_stockmap.update({
                                price_amount: verification_amount + stockMapResult.price_amount,
                                store_price: await getPrecisionPrice(stockMapResult.domain_id, update_price)
                            }, {
                                where: {
                                    materiel_id
                                }
                            });

                            if (intInventoryType === 1) {
                                const options = {
                                    materiel_id,
                                    productivetask_id
                                };
                                options.amount = verification_amount;
                                await createRecordingVoucherSC('CPRKD_5', user, options);

                                const { money_n_coefficient = 0, money_y_coefficient = 0 } = getSalary(feedingProductiveTaskId, verification_number);
                                options.amount = money_n_coefficient;
                                await createRecordingVoucherSC('CPRKD_6', user, options);

                                options.amount = money_y_coefficient;
                                await createRecordingVoucherSC('CPRKD_7', user, options);
                            } else if (intInventoryType === 3) {
                                const options1 = {
                                    materiel_id,
                                    productivetask_id,
                                    amount: verification_amount
                                };
                                await createRecordingVoucherSC('WWRKD_5', user, options1);

                                const feedingProductiveTask = await tb_productivetask.findOne({
                                    where: {
                                        productivetask_id: feedingProductiveTaskId
                                    },
                                    attributes: ['department_id', 'materiel_id']
                                });
                                const materiel_cost = await getOutSourcingMaterielCost(feedingProductiveTask.department_id, feedingProductiveTask.materiel_id);
                                const options2 = {
                                    materiel_id: feedingProductiveTask.materiel_id,
                                    supplier_id: feedingProductiveTask.department_id,
                                    amount: verification_number * materiel_cost
                                };
                                await createRecordingVoucherSC('WWRKD_6', user, options2);
                            }
                        } else {
                            throw new Error(`未找到库存产品${order_id}-${materiel_id}`);
                        }
                    } else {
                        //第四种情况--销售订单已经完成
                        if (intInventoryType === 1) {
                            const options = {
                                materiel_id,
                                amount: verification_amount
                            };
                            await createRecordingVoucherSC('CPRKD_3_1', user, options);

                            const { money_n_coefficient = 0, money_y_coefficient = 0 } = getSalary(feedingProductiveTaskId, verification_number);
                            await createRecordingVoucherSC('CPRKD_3_2', user, {amount: money_n_coefficient});
                            await createRecordingVoucherSC('CPRKD_3_3', user, {amount: money_y_coefficient});
                        } else if (intInventoryType === 3) {
                            const options1 = {
                                materiel_id,
                                amount: verification_amount
                            };
                            await createRecordingVoucherSC('WWRKD_3_1', user, options1);

                            const feedingProductiveTask = await tb_productivetask.findOne({
                                where: {
                                    productivetask_id: feedingProductiveTaskId
                                },
                                attributes: ['department_id', 'materiel_id']
                            });
                            const materiel_cost = await getOutSourcingMaterielCost(feedingProductiveTask.department_id, feedingProductiveTask.materiel_id);
                            const options2 = {
                                supplier_id: feedingProductiveTask.department_id,
                                amount: verification_number * materiel_cost
                            };
                            await createRecordingVoucherSC('WWRKD_3_2', user, options2);
                        }
                    }
                }
            }
        } else {
            //第一种情况--如果生产任务单未完成就把差额记录到该生产任务单下
            await reportVerificationFeedingAmount(productivetask_id, verification_amount, verification_number, feedingProductiveTaskId, intInventoryType);
        }
    } else {
        throw new Error(`未找到生产任务单${product_id}-${order_id}-${materiel_id}`);
    }
}

//生产领料的核销四种情况的差额核销处理
async function calcProductInFeedingOverAmount(inventoryaccount_id, qualified_number) {
    //取得投料的领料数据
    const inventoryAccount = await tb_inventoryaccount.findOne({
        where: {
            inventoryaccount_id
        }
    });

    if (inventoryAccount) {
        const {
            domain_id, order_id, warehouse_id, warehouse_zone_id,
            materiel_id, //自动领料的投料ID
            p_order_id, //生产成品的生产任务ID
            account_operate_amount//领料出库数量
        } = inventoryAccount;

        //根据核销数量减去领料出库数量取得核销差额
        const verification_number = qualified_number - account_operate_amount;
        if (verification_number > 0) {
            //取得产品的生产任务单
            const productiveTask = await tb_productivetask.findOne({
                where: {
                    productivetask_id: p_order_id
                }
            });

            //取得产品规划ID
            const { product_id, outsource_sign } = productiveTask;
            //取得产品入库或者委外入库
            const intInventoryType = parseInt(outsource_sign);
            //产品的物料ID
            const product_materiel_id = productiveTask.materiel_id;

            const stockMap = await tb_stockmap.findOne({
                where: {
                    domain_id,
                    order_id,
                    warehouse_id,
                    warehouse_zone_id,
                    materiel_id
                }
            });

            //取得差额和即时库存的总额
            let verification_amount = 0;
            if (stockMap) {
                verification_amount = verification_number * (stockMap.price_amount / stockMap.current_amount);
            }
            // const verification_amount = verification_number * (stockMap ? stockMap.store_price || 0 : 0);

            //取得领料出库的投料生产任务
            const feedingProductiveTask = await tb_productivetask.findOne({
                where: {
                    product_id,
                    order_id,
                    materiel_id
                }
            });
            //取得投料的生产任务ID
            const feedingProductiveTaskId = feedingProductiveTask ? feedingProductiveTask.productivetask_id : null;

            await findSuperiorProductPlanMateriel(product_id, order_id, product_materiel_id, verification_amount, verification_number, feedingProductiveTaskId, intInventoryType);
        }
    }
}

//核销自动领料数量
exports.qualifiedFeedingMaterielNumber = async(inventory_production_account_id, qualified_number) => {
    const inventoryProductionAccount = await tb_inventory_production_account.findOne({
        where: {
            inventory_production_account_id
        }
    });

    if (inventoryProductionAccount) {
        inventoryProductionAccount.qualified_number = qualified_number;
        inventoryProductionAccount.qualified_state = 1;
        await inventoryProductionAccount.save();

        await calcProductInFeedingOverAmount(inventoryProductionAccount.inventoryaccount_id, qualified_number);
    }

    return inventoryProductionAccount;
};

exports.qualifiedProcedureMaterielNumber = async(inventory_procedure_account_id, qualified_number) => {
    const inventoryProcedureAccount = await tb_inventory_procedure_account.findOne({
        where: {
            inventory_procedure_account_id
        }
    });

    if (inventoryProcedureAccount) {
        inventoryProcedureAccount.qualified_number = qualified_number;
        inventoryProcedureAccount.qualified_state = 1;
        await inventoryProcedureAccount.save();
    }

    return inventoryProcedureAccount;
};

//第一二种情况的财务自动化
exports.reportProductVerificationAmount = async(user, productivetask_id, transaction) => {
    const feedingReportArray = await tb_verification_feeding_report.findAll({
        where: {
            verification_state: 0,
            productivetask_id
        },
        transaction
    });

    for (const feedingReportItem of feedingReportArray) {
        const { feeding_productivetask_id, verification_amount, verification_number } = feedingReportItem;
        feedingReportItem.verification_state = 1;
        await feedingReportItem.save({ transaction });

        const productiveTaskResult = await tb_productivetask.findOne({
            where: {
                productivetask_id: feeding_productivetask_id
            },
            transaction
        });

        if (productiveTaskResult) {
            const { materiel_id, outsource_sign, department_id } = productiveTaskResult;
            const int_inventory_type = parseInt(outsource_sign);

            if (int_inventory_type === 1) {
                const options = {
                    materiel_id,
                    productivetask_id,
                    amount: verification_amount
                };
                await createRecordingVoucherSC('CPRKD_3', user, options, transaction);

                const { money_n_coefficient, money_y_coefficient } = await getSalary(feeding_productivetask_id, verification_number);
                const options1 = {
                    productivetask_id,
                    amount: money_n_coefficient
                };
                await createRecordingVoucherSC('CPRKD_4', user, options1, transaction);

                const options2 = {
                    productivetask_id,
                    amount: money_y_coefficient
                };
                await createRecordingVoucherSC('CPRKD_4_1', user, options2, transaction);
            } else if (int_inventory_type === 3) {
                const options1 = {
                    materiel_id,
                    productivetask_id,
                    amount: verification_amount
                };
                await createRecordingVoucherSC('WWRKD_1', user, options1, transaction);

                const feedingProductiveTask = await tb_productivetask.findOne({
                    where: {
                        productivetask_id: feeding_productivetask_id
                    },
                    attributes: ['materiel_id']
                });
                const materiel_cost = await getOutSourcingMaterielCost(department_id, feedingProductiveTask.materiel_id);
                const options2 = {
                    supplier_id: department_id,
                    productivetask_id,
                    amount: verification_number * materiel_cost
                };
                await createRecordingVoucherSC('WWRKD_2', user, options2, transaction);
            }
        } else {
            throw new Error('第一二种情况的财务自动化无法取得投料生产任务单');
        }
    }
};

exports.productionInputStorage = async(params, operator_account, transaction) => {
    const {
        user, production_type, domain_id, productivetask_id, materiel_id, warehouse_id, warehouse_zone_id, order_id
    } = params;

    let bill_code = 0;
    if (production_type === 5) {
        bill_code = await genBizCode(CODE_NAME.CPRK, domain_id, 6, transaction);
    } else if (production_type === 7) {
        bill_code = await genBizCode(CODE_NAME.WWRK, domain_id, 6, transaction);
    }

    const materiel = await tb_materiel.findOne({
        where: {
            materiel_id,
            state: GLBConfig.ENABLE
        }
    });

    if (!materiel) {
        throw new Error('没有物料信息');
    }

    const productiveTask = await tb_productivetask.findOne({
        where: {
            productivetask_id,
            domain_id
        },
        transaction
    });

    if (!productiveTask) {
        throw new Error('没有生产任务单信息');
    }

    if (parseInt(materiel.materiel_source) !== parseInt(GLBConfig.MATERIELSOURCE[0].id)) {
        throw new Error('该产品不是自制类型');
    }

    //产品入库
    /*if (production_type !== 5) {
        throw new Error('该生产任务不是产品入库单');
    }*/

    if (productiveTask.stock_in_number < productiveTask.taskdesign_number) {
        const params = {
            user,
            production_type,
            domain_id,
            productivetask_id,
            warehouse_id,
            warehouse_zone_id,
            order_id,
            materiel_manage: parseInt(materiel.materiel_manage)
        };

        //投料自动出库
        await module.exports.productFeedingInventory(params, operator_account, transaction);

        //即时库存入库及计算价格
        const inventoryStorePrice = await module.exports.recordProductInCostPrice(productiveTask, params, operator_account, transaction);

        //收发存明细
        await tb_inventoryaccount.create({
            domain_id,
            bill_code,
            order_id,
            p_order_id: productivetask_id,
            warehouse_id,
            warehouse_zone_id,
            materiel_id,
            inventory_price: inventoryStorePrice,
            account_operate_amount: operator_account,
            account_operate_type: production_type,
        }, { transaction });

        const relationOptions = {
            domain_id,
            relation_id: productivetask_id,
            total_count: productiveTask.taskdesign_number,
            actual_count: operator_account,
            inventory_type: production_type
        };
        await module.exports.recordInventoryTotal(relationOptions, transaction);

        const warehouse = await tb_warehouse.findOne({
            where: {
                warehouse_id
            },
            transaction
        });

        if (!warehouse) {
            throw new Error('没有仓库信息');
        }

        await tb_financerecorditem.create({
            domain_id,
            materiel_id,
            wms_type: 1,
            manage_type: {5: 2, 7: 4}[production_type],
            organization: warehouse.warehouse_name,
            store_amount: operator_account,
            store_price: inventoryStorePrice
        }, { transaction });

        productiveTask.stock_in_number += operator_account;
        const { stock_in_number, taskdesign_number } = productiveTask;
        productiveTask.stock_in_state = taskdesign_number > stock_in_number ? 2 : 3;
        await productiveTask.save({ transaction });

        //工序计价金额记账凭证
        await module.exports.recordProductInPrice(user, productivetask_id, taskdesign_number);
        await module.exports.productProcedureAutoDone(user, productivetask_id, taskdesign_number, transaction);

        //第一二种情况的财务自动化
        await module.exports.reportProductVerificationAmount(user, productivetask_id, transaction);

        await tb_inventoryorder.create({
            domain_id,
            bill_code,
            warehouse_id,
            bs_order_id: productivetask_id,
            account_operate_type: production_type,
        }, { transaction });
    } else {
        throw new Error('生产任务入库已满');
    }
};

exports.productionOutputStorage = async(params, operator_account, transaction) => {
    const {
        production_type, domain_id, productivetask_id, materiel_id, warehouse_id, warehouse_zone_id, order_id
    } = params;

    let bill_code = 0;
    if (production_type === 5) {
        bill_code = await genBizCode(CODE_NAME.LLCK, domain_id, 6, transaction);
    } else if (production_type === 7) {
        bill_code = await genBizCode(CODE_NAME.WWCK, domain_id, 6, transaction);
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

    const materiel = await tb_materiel.findOne({
        where: {
            materiel_id,
            state: GLBConfig.ENABLE
        }
    });

    if (!materiel) {
        throw new Error('没有物料信息');
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
        throw new Error('找不到库存信息');
    }

    stockMap.price_amount -= (stockMap.price_amount / stockMap.current_amount) * operator_account;
    stockMap.current_amount -= operator_account;
    if (stockMap.current_amount < 0) {
        throw new Error('出库数量不能大于库存数量');
    }
    await stockMap.save({ transaction });

    ///收发存明细
    await tb_inventoryaccount.create({
        domain_id,
        bill_code,
        order_id,
        p_order_id: productivetask_id,
        warehouse_id,
        warehouse_zone_id,
        materiel_id,
        inventory_price: stockMap.store_price,
        account_operate_amount: operator_account,
        account_operate_type: production_type,
    }, { transaction });

    const relationOptions = {
        domain_id,
        relation_id: productivetask_id,
        total_count: dtlDesignNumber,
        actual_count: operator_account,
        inventory_type: production_type
    };
    await module.exports.recordInventoryTotal(relationOptions, transaction);

    const warehouse = await tb_warehouse.findOne({
        where: {
            warehouse_id
        },
        transaction
    });

    if (!warehouse) {
        throw new Error('没有仓库信息');
    }

    await tb_financerecorditem.create({
        domain_id,
        materiel_id,
        wms_type: 2,
        manage_type: {6: 2, 8: 4}[production_type],
        organization: warehouse.warehouse_name,
        store_amount: operator_account,
        store_price: stockMap.store_price
    }, { transaction });

    //更新出库任务单明细
    const productiveTaskDetail = await tb_productivetaskdetail.findOne({
        where: {
            productivetask_id,
            materiel_id,
            domain_id
        },
        transaction
    });

    productiveTaskDetail.stock_out_number += operator_account;
    await productiveTaskDetail.save({ transaction });

    const dtlStockNumber = await tb_productivetaskdetail.sum('stock_out_number', {
        where: {
            productivetask_id,
            materiel_id
        },
        transaction
    }) || 0;

    const productiveTask = await tb_productivetask.findOne({
        where: {
            productivetask_id,
            domain_id
        },
        transaction
    });

    if (!productiveTask) {
        throw new Error('无法取得生产任务单');
    }

    productiveTask.stock_out_state = dtlDesignNumber > dtlStockNumber ? 2 : 3;
    await productiveTask.save({ transaction });

    //出库流水
    await tb_inventoryorder.create({
        domain_id,
        bill_code,
        bs_order_id: productivetask_id,
        warehouse_id,
        account_operate_type: production_type,
    }, { transaction });
};
