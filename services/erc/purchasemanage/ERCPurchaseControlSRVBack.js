const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCPurchaseControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');

const tb_domain = model.common_domain;
const tb_user = model.common_user;
const tb_alldemand = model.erc_alldemand; //总需求表
const tb_netdemand = model.erc_netdemand; //净需求表
const tb_order = model.erc_order; //销售单
const tb_ordermateriel = model.erc_ordermateriel; //销售单物料明细
const tb_purchaseorder = model.erc_purchaseorder; //采购单(包含申请单)
const tb_purchasedetail = model.erc_purchasedetail; //采购单物料明细
const tb_warehouse = model.erc_warehouse //仓库
const tb_stockmap = model.erc_stockmap; //库存表
const tb_purchaseapply = model.erc_purchaseapply; //采购单申请表
const tb_orderworkflow = model.erc_orderworkflow;
const tb_thirdsignuser = model.erc_thirdsignuser;

const tb_productivetask = model.erc_productivetask; // 生产任务单
const tb_productivetaskdetail = model.erc_productivetaskdetail; // 生产任务单明细（投料）
const tb_productivetaskrelated = model.erc_productivetaskrelated; // 生产任务单明细（联产品）
const tb_productplandetail = model.erc_productplandetail; // 产品规划明细
const tb_productplan = model.erc_productplan; // 产品规划
const tb_productplanrelated = model.erc_productplanrelated; // 产品规划（联产品）
const tb_productplanprocedure = model.erc_productplanprocedure; // 产品规划 工序
const tb_ppmaster = model.erc_ppmaster //主计划
const tb_company = model.erc_company
const tb_ppmasterptdetail = model.erc_ppmasterptdetail
const tb_department = model.erc_department
const tb_departmentprocedure = model.erc_departmentprocedure
const tb_productionprocedure = model.erc_productionprocedure

const ERCBusinessCustomerControlSRV = require('../baseconfig/ERCBusinessCustomerControlSRV');
const {
    CODE_NAME,
    genBizCode
} = require('../../../util/BizCodeUtil');

exports.ERCPurchaseControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'dataExtract') {
        dataExtract(req, res);
    } else if (method === 'initAct') {
        initAct(req, res)
    } else if (method === 'getAllDemand') {
        getAllDemand(req, res)
    } else if (method === 'getNetDemand') {
        getNetDemand(req, res)
    } else if (method === 'getSupplerUser') {
        getSupplerUser(req, res)
    } else if (method === 'getPurchaseOrder') {
        getPurchaseOrder(req, res)
    } else if (method === 'addPuchaseApply') {
        addPuchaseApply(req, res)
    } else if (method === 'getPuchaseApply') {
        getPuchaseApply(req, res)
    } else if (method === 'initPuchase') {
        initPuchase(req, res)
    } else if (method === 'initApplicent') {
        initApplicent(req, res)
    } else if (method === 'setAllDemand') {
        setAllDemand(req, res)
    } else if (method === 'setNetDemand') {
        setNetDemand(req, res)
    } else if (method === 'setPurchase') {
        setPurchase(req, res)
    } else if (method === 'setProduction') {
        setProduction(req, res)
    } else if (method === 'deletePurchaseApply') {
        deletePurchaseApply(req, res)
    } else if (method === 'setPPMaster') {
        ppMasterNew(req, res)
    } else if (method === 'deleteData') {
        deleteData(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};
//----------------------------------------mrp流程：总需求，净需求，生产，采购 begin-----------------------------------------
//----------------------------------------总需求----------------------------------------
async function allDemand(params) {
    try {
        let queryStr, replacements = [],
            insertDate = [];
        queryStr = `
            select om.materiel_id,om.order_id,sum(om.materiel_amount) as materiel_amount,o.order_type
            from tbl_erc_ordermateriel om,tbl_erc_order o
            where om.state=1 and o.state=1 and om.order_id=o.order_id
            and o.domain_id=${params.nowDoaminId} 
            and om.created_at>='${params.beginTime}' and om.created_at<='${params.endTime}'
            and o.order_review_state = 2 
            group by om.materiel_id,om.order_id `;
        let result = await sequelize.query(queryStr, {
            replacements: [],
            type: sequelize.QueryTypes.SELECT
        });

        if (result && result.length > 0) {
            for (let r of result) {
                insertDate.push({
                    materiel_id: r.materiel_id,
                    order_id: r.order_id,
                    demand_amount: r.materiel_amount,
                    mrp_date: params.yesterday,
                    mrp_domain_id: params.nowDoaminId,
                    mrp_state: 0 //新记录，未执行mrp运算
                });
            }
            let addNcaAlldemand = await tb_alldemand.bulkCreate(insertDate);
        }
    } catch (error) {
        throw error;
    }
}
//----------------------------------------净需求----------------------------------------
async function netDemand(params) {
    try {
        // //materiel_manage 1安全库存，2订单管理,
        // //materiel_source 1自制，2外购，3委外加工 4受托加工
        // //materiel_state_management  0库存商品   1基本商品   2客户商品
        // 如果是基本或客户，则按订单号来区分产品规划
        let queryStr, replacements = [],
            netDemandAmount = 0;
        queryStr = `select a.*,m.domain_id,m.materiel_manage,m.materiel_source,materiel_state_management 
            from tbl_erc_alldemand a,tbl_erc_materiel m
            where a.state=1 and m.state=1 and a.materiel_id=m.materiel_id 
            and a.mrp_domain_id=${params.nowDoaminId} and a.mrp_state=0`;
        let result = await sequelize.query(queryStr, {
            replacements: [],
            type: sequelize.QueryTypes.SELECT
        });
        if (result && result.length > 0) {
            for (let r of result) {
                //netDemandAmount代表缺少的数量
                r.nowDoaminId = params.nowDoaminId
                netDemandAmount = await checkInventory(r);
                //保存净需求
                if (netDemandAmount > 0) {
                    let addNetdemand = await tb_netdemand.create({
                        materiel_id: r.materiel_id,
                        order_id: r.order_id ? r.order_id : '',
                        netdemand_amount: netDemandAmount,
                        mrp_date: r.mrp_date,
                        mrp_domain_id: r.mrp_domain_id,
                        mrp_state: 0
                    });
                }
            }
            queryStr = `update tbl_erc_alldemand set mrp_state = 1  
                where state=1 and mrp_domain_id=${params.nowDoaminId} and mrp_state = 0`
            let updateMRPState = await sequelize.query(queryStr, {
                replacements: [],
                type: sequelize.QueryTypes.UPDATE
            });
        }
    } catch (error) {
        throw error
    }
}
//----------------------------------------生产任务--------------------------------------
async function production(params) {
    try {
        let queryStr, replacements = [],
            netDemand, netDemandAmount = 0,
            checkParams, productDetailPrice = 0;
        let productPlan, productPlanDetail;
        let department_id = "",
            outsource_sign = ""
        queryStr = `select n.*,m.materiel_state_management,m.materiel_source,m.materiel_code 
            from tbl_erc_netdemand n,tbl_erc_materiel m
            where n.state=1 and m.state=1 and n.materiel_id=m.materiel_id 
            and n.mrp_state=0 and n.mrp_domain_id=${params.nowDoaminId} and m.domain_id=${params.nowDoaminId}  
            and m.materiel_source in (1,3,4)`; //m.materiel_source=1自制,3委外,4受托加工
        netDemand = await sequelize.query(queryStr, {
            replacements: [],
            type: sequelize.QueryTypes.SELECT
        });

        for (let nd of netDemand) {
            // 确定产品规划
            // materiel_state_management  0库存商品   1基本商品   2客户商品
            // 如果是1基本或2客户，则按订单号来区分产品规划
            productPlan = await tb_productplan.findOne({
                where: {
                    state: 1,
                    materiel_id: nd.materiel_id,
                    domain_id: params.nowDoaminId,
                    order_id: nd.materiel_state_management == "1" || nd.materiel_state_management == "2" ? nd.order_id : null
                }
            });
            if (!productPlan) {
                continue
            }
            productDetailPrice = await getStockAVGPrice(productPlan.product_id, 2);

            // ****************************最终产品生产任务****************************
            productPlanDetail = await tb_productplandetail.findAll({
                where: {
                    state: 1,
                    product_plan_id: productPlan.product_id,
                    prd_level: 2, //最外层的产品投料，只需查level==2
                    level_materiel_id: nd.materiel_id,
                }
            });

            // 按车间工序建立成产任务单
            // 完整的成产任务单包含如下要素：物料，车间，工序，数量，订单号
            let pppLasts = await tb_productplanprocedure.findAll({
                where: {
                    state: 1,
                    product_plan_id: productPlan.product_id,
                    rlt_materiel_code: nd.materiel_id
                }
            })

            if (nd.materiel_source == 1 || nd.materiel_source == 4) {
                // department_id = productPlan.workshop_id
                outsource_sign = nd.materiel_source
            } else {
                // department_id = ''
                outsource_sign = 3
            }
            let biz_code = await genBizCode(CODE_NAME.SCRW, params.nowDoaminId, 6);
            let addProductTask = {}
            for (pppLast of pppLasts) {
                let POID = await Sequence.genProductiveOrderID(params.nowDoaminId);
                let ppResult = await tb_productionprocedure.findOne({
                    where: {
                        state: 1,
                        procedure_id: pppLast ? pppLast.procedure_id : ''
                    }
                })
                addProductTask = await tb_productivetask.create({
                    productivetask_code: POID,
                    product_id: productPlan.product_id,
                    materiel_id: nd.materiel_id,
                    domain_id: params.nowDoaminId,
                    taskdesign_number: nd.netdemand_amount,
                    order_id: nd.order_id ? nd.order_id : '',
                    product_level: 1,
                    taskdesign_price: productDetailPrice,
                    department_id: nd.materiel_source != 3 ? ppResult.department_id : '', //委外的生产任务单没有车间
                    procedure_id: pppLast ? pppLast.procedure_id : '',
                    productivetask_state: 1,
                    change_state: 0,
                    outsource_sign: outsource_sign, //委外标志  1自制   2委外
                    procedure_level: pppLast ? pppLast.priority : '', //工序的级别
                    biz_code: biz_code,
                    materiel_code: nd.materiel_code,
                });
            }
            let keysArr = Object.keys(addProductTask)
            if (keysArr.length > 0) {
                for (let ppd of productPlanDetail) {
                    let addProductTaskDetail = await tb_productivetaskdetail.create({
                        productivetask_id: addProductTask.productivetask_id,
                        materiel_id: ppd.src_materiel_id,
                        domain_id: params.nowDoaminId,
                        taskdetaildesign_number: ppd.design_number * nd.netdemand_amount,
                        design_number: ppd.design_number,
                        taskdetailprd_level: ppd.prd_level,
                        taskdetailprd_batch: 1, //1初始记录 2投料变更
                        change_state: 2, //已通过
                        productivetask_biz_code: biz_code
                    });
                }
                //联产品
                let productplanrelated1 = await tb_productplanrelated.findAll({
                    where: {
                        state: 1,
                        product_plan_id: productPlan.product_id,
                        rlt_materiel_code: nd.materiel_id,
                        prd_type: 1
                    }
                });
                for (let ppe1 of productplanrelated1) {
                    let addProductpTaskRelated1 = await tb_productivetaskrelated.create({
                        productivetask_id: addProductTask.productivetask_id,
                        materiel_id: ppe1.src_materiel_id,
                        domain_id: params.nowDoaminId,
                        taskrelateddesign_number: ppe1.prd_number * netDemandAmount,
                        taskrelated_type: 1,
                        productivetask_biz_code: biz_code
                    });
                }
                // 边余料
                let productplanrelated2 = await tb_productplanrelated.findAll({
                    where: {
                        state: 1,
                        product_plan_id: productPlan.product_id,
                        rlt_materiel_code: nd.materiel_id,
                        prd_type: 2
                    }
                });
                for (let ppe2 of productplanrelated2) {
                    let addProductpTaskRelated2 = await tb_productivetaskrelated.create({
                        productivetask_id: addProductTask.productivetask_id,
                        materiel_id: ppe2.src_materiel_id,
                        domain_id: params.nowDoaminId,
                        taskrelateddesign_number: ppe2.prd_number * netDemandAmount,
                        taskrelated_type: 2,
                        productivetask_biz_code: biz_code
                    });
                }
            }


            // ****************************投料生产任务****************************
            //分解产品
            replacements = [];
            queryStr = `select pd.*,m.materiel_source,m.materiel_code from tbl_erc_productplandetail pd 
            left join tbl_erc_materiel m on (pd.src_materiel_id = m.materiel_id and m.state = 1) 
             where pd.state=1 and pd.product_plan_id=${productPlan.product_id} order by prd_level`;
            productPlanDetail = await sequelize.query(queryStr, {
                replacements: [],
                type: sequelize.QueryTypes.SELECT
            });
            for (let pd of productPlanDetail) {
                //判断库存，缺少的数量生产或采购
                if (pd.prd_level == 2) {
                    checkParams = {
                        materiel_id: pd.src_materiel_id,
                        demand_amount: nd.netdemand_amount * pd.design_number,
                        order_id: nd.order_id,
                        nowDoaminId: params.nowDoaminId
                    };
                } else {
                    for (let pdTemp of productPlanDetail) {
                        if (pdTemp.prd_level == pd.prd_level - 1 && pd.level_materiel_id == pdTemp.src_materiel_id) {
                            checkParams = {
                                materiel_id: pd.src_materiel_id,
                                demand_amount: nd.netdemand_amount * pdTemp.design_number * pd.design_number,
                                order_id: nd.order_id,
                                nowDoaminId: params.nowDoaminId
                            };
                            break
                        }
                    }
                }

                netDemandAmount = await checkInventory(checkParams);
                if (netDemandAmount > 0) {
                    // materiel_source 1自制，2外购，3委外加工
                    // 采购的物料加入净需求
                    if (pd.materiel_source == 2) { //自制 放入净需求
                        let addNcaNetdemand = await tb_netdemand.create({
                            materiel_id: pd.src_materiel_id,
                            order_id: nd.order_id ? nd.order_id : '',
                            netdemand_amount: netDemandAmount,
                            mrp_date: nd.mrp_date,
                            mrp_domain_id: params.nowDoaminId
                        });
                    } else {
                        if (pd.materiel_source == 1 || pd.materiel_source == 4) {
                            outsource_sign = pd.materiel_source
                        } else {
                            outsource_sign = 3
                        }
                        // 完整的成产任务单包含如下要素：物料，车间，工序，数量，订单号
                        let pppResolves = await tb_productplanprocedure.findAll({
                            where: {
                                state: 1,
                                product_plan_id: productPlan.product_id,
                                rlt_materiel_code: pd.src_materiel_id
                            }
                        })

                        let biz_code = await genBizCode(CODE_NAME.SCRW, params.nowDoaminId, 6);
                        let addProductTask = {};
                        if (outsource_sign == 3) {
                            let POID = await Sequence.genProductiveOrderID(params.nowDoaminId);
                            productDetailPrice = await getStockAVGPrice(productPlan.product_id, pd.prd_level + 1);
                            addProductTask = await tb_productivetask.create({
                                productivetask_code: POID,
                                product_id: productPlan.product_id,
                                materiel_id: pd.src_materiel_id,
                                domain_id: params.nowDoaminId,
                                taskdesign_number: netDemandAmount,
                                order_id: nd.order_id ? nd.order_id : '',
                                product_level: pd.prd_level,
                                taskdesign_price: productDetailPrice,
                                department_id: '', //委外的生产任务单没有车间
                                procedure_id: '',
                                productivetask_state: 1,
                                change_state: 0,
                                outsource_sign: outsource_sign,
                                procedure_level: '', //工序的级别
                                biz_code: biz_code,
                                materiel_code: pd.materiel_code,
                            });
                        } else {
                            for (let pppResolve of pppResolves) {
                                let ppResult = await tb_productionprocedure.findOne({
                                    where: {
                                        state: 1,
                                        procedure_id: pppResolve ? pppResolve.procedure_id : ''
                                    }
                                })
                                let POID = await Sequence.genProductiveOrderID(params.nowDoaminId);
                                productDetailPrice = await getStockAVGPrice(productPlan.product_id, pd.prd_level + 1);

                                addProductTask = await tb_productivetask.create({
                                    productivetask_code: POID,
                                    product_id: productPlan.product_id,
                                    materiel_id: pd.src_materiel_id,
                                    domain_id: params.nowDoaminId,
                                    taskdesign_number: netDemandAmount,
                                    order_id: nd.order_id ? nd.order_id : '',
                                    product_level: pd.prd_level,
                                    taskdesign_price: productDetailPrice,
                                    department_id: pd.materiel_source != 3 ? ppResult.department_id : '', //委外的生产任务单没有车间
                                    procedure_id: pppResolve ? pppResolve.procedure_id : '',
                                    productivetask_state: 1,
                                    change_state: 0,
                                    outsource_sign: outsource_sign,
                                    procedure_level: pppResolve ? pppResolve.priority : '', //工序的级别
                                    biz_code: biz_code,
                                    materiel_code: pd.materiel_code,
                                });
                            }
                        }

                        let keysArr = Object.keys(addProductTask)
                        if (keysArr.length > 0) {
                            for (let pdTemp of productPlanDetail) {
                                if (pdTemp.prd_level == pd.prd_level + 1 && pdTemp.level_materiel_id == pd.src_materiel_id) {
                                    let addProductTaskDetail = await tb_productivetaskdetail.create({
                                        productivetask_id: addProductTask.productivetask_id,
                                        materiel_id: pdTemp.src_materiel_id,
                                        domain_id: params.nowDoaminId,
                                        taskdetaildesign_number: pdTemp.design_number * netDemandAmount,
                                        design_number: pdTemp.design_number,
                                        taskdetailprd_level: pdTemp.prd_level,
                                        taskdetailprd_batch: 1, //1初始记录 2投料变更
                                        change_state: 2, //已通过
                                        productivetask_biz_code: biz_code
                                    });
                                }
                            }

                            // 联产品
                            let productplanrelated1 = await tb_productplanrelated.findAll({
                                where: {
                                    state: 1,
                                    product_plan_id: productPlan.product_id,
                                    rlt_materiel_code: pd.src_materiel_id,
                                    prd_type: 1
                                }
                            });
                            for (let ppe1 of productplanrelated1) {
                                let addProductpTaskRelated1 = await tb_productivetaskrelated.create({
                                    productivetask_id: addProductTask.productivetask_id,
                                    materiel_id: ppe1.src_materiel_id,
                                    domain_id: params.nowDoaminId,
                                    taskrelateddesign_number: ppe1.prd_number * netDemandAmount,
                                    taskrelated_type: 1,
                                    productivetask_biz_code: biz_code
                                });
                            }
                            // 边余料
                            let productplanrelated2 = await tb_productplanrelated.findAll({
                                where: {
                                    state: 1,
                                    product_plan_id: productPlan.product_id,
                                    rlt_materiel_code: pd.src_materiel_id,
                                    prd_type: 2
                                }
                            });
                            for (let ppe2 of productplanrelated2) {
                                let addProductpTaskRelated2 = await tb_productivetaskrelated.create({
                                    productivetask_id: addProductTask.productivetask_id,
                                    materiel_id: ppe2.src_materiel_id,
                                    domain_id: params.nowDoaminId,
                                    taskrelateddesign_number: ppe2.prd_number * netDemandAmount,
                                    taskrelated_type: 2,
                                    productivetask_biz_code: biz_code
                                });
                            }
                        }
                    }
                }
            }
        }
        queryStr = `update tbl_erc_netdemand n,tbl_erc_materiel m
            set n.mrp_state = 1  
            where n.state=1 and m.state=1 and n.materiel_id=m.materiel_id 
            and n.mrp_state=0 and n.mrp_domain_id=${params.nowDoaminId} and m.domain_id=${params.nowDoaminId} 
            and m.materiel_source in (1,3,4) `
        let updateMRPState = await sequelize.query(queryStr, {
            replacements: [],
            type: sequelize.QueryTypes.UPDATE
        });
    } catch (error) {
        logger.error(error);
        throw error;
    }
}
//----------------------------------------采购-----------------------------------------
async function purchase(params) {
    try {
        let queryStr, replacements = [],
            supplerPurchase = [],
            thisNum = 0,
            thisAllNum = 0;

        queryStr = `select m.domain_id 
            from tbl_erc_netdemand n,tbl_erc_materiel m
            where n.state=1 and m.state=1 and n.materiel_id=m.materiel_id 
            and n.mrp_state=0 and n.mrp_domain_id=${params.nowDoaminId} and m.materiel_source=2
            group by m.domain_id `;
        let result = await sequelize.query(queryStr, {
            replacements: [],
            type: sequelize.QueryTypes.SELECT
        });
        if (result && result.length > 0) {
            for (let r of result) {
                //非本机构物料，向对应domainId的机构采购
                if (r.domain_id != params.nowDoaminId) {

                    let POID = await Sequence.genPurchaseOrderID(params.nowDoaminId);
                    let SOID = await Sequence.genSalesOrderID(params.nowDoaminId);
                    let biz_code_wlcg = await genBizCode(CODE_NAME.WLCG, params.nowDoaminId, 6);
                    let biz_code_cpxs = await genBizCode(CODE_NAME.CPXS, params.nowDoaminId, 6);
                    // 采购单
                    let addNcaPurchaseOrder = await tb_purchaseorder.create({
                        purchaseorder_id: POID, //采购单号，PO开头
                        purchaseorder_domain_id: params.nowDoaminId, //采购方
                        order_id: SOID, //销售单号
                        order_domain_id: r.domain_id, //销售方
                        purchaseorder_state: 2, //采购单状态，0未审核，1审核拒绝，2审核通过
                        biz_code: biz_code_wlcg
                    });

                    //销售单
                    let addNcaOrder = await tb_order.create({
                        order_id: SOID, //销售单号
                        domain_id: r.domain_id, //销售方
                        purchase_order_id: POID, //采购单号
                        purchase_domain_id: params.nowDoaminId, //采购方
                        order_type: 8, //订单类型，8采购订单，OTYPEINFO
                        order_state: 'NEW',
                        purchaser_type: 1, //采购方类型 1机构，2个人
                        sales_data_source: 1, //标识该采购单来源 1mrp运算，2手动添加
                        sap_order_state: 1, //标识该销售单sap状态
                        biz_code: biz_code_cpxs
                    });

                    ///采购单明细
                    replacements = [];
                    queryStr = `select n.materiel_id,n.netdemand_amount,m.materiel_sale as materiel_sale,n.order_id as order_ids
                            from tbl_erc_netdemand n,tbl_erc_materiel m
                            where n.state=1 and m.state=1 and n.materiel_id=m.materiel_id 
                            and n.mrp_state=0 and n.mrp_domain_id=${params.nowDoaminId} and m.domain_id=${r.domain_id} and m.materiel_source=2`;
                    let resultDetail = await sequelize.query(queryStr, {
                        replacements: [],
                        type: sequelize.QueryTypes.SELECT
                    });

                    //将resultDetail按matriel_id汇总
                    let map = {},
                        dest = [],
                        existState = 0;
                    for (let sp of resultDetail) {
                        // if(!map[sp.materiel_id]){
                        let materiel_sale_offer = await ERCBusinessCustomerControlSRV.searchPrice({}, r.domain_id, params.nowDoaminId, {
                            materiel_id: sp.materiel_id
                        });
                        logger.info(materiel_sale_offer);
                        dest.push({
                            materiel_id: sp.materiel_id,
                            purchase_num: sp.netdemand_amount,
                            // purchase_price:sp.materiel_sale,
                            purchase_price: materiel_sale_offer[0].PRICE ? materiel_sale_offer[0].PRICE : 0,
                            order_ids: sp.order_ids
                        });
                        map[sp.materiel_id] = sp;
                        // }else{
                        //     existState=0;
                        //     for(let ds of dest){
                        //         if(ds.materiel_id == sp.materiel_id){
                        //             ds.purchase_num +=sp.netdemand_amount;
                        //             ds.order_ids = ds.order_ids+","+sp.order_ids;
                        //             existState=1;
                        //             break;
                        //         }
                        //     }
                        //     if(existState==0){
                        //         ds.push({
                        //             materiel_id:sp.materiel_id,
                        //             purchase_num:sp.netdemand_amount,
                        //             purchase_price:sp.materiel_sale,
                        //             order_ids:sp.order_ids
                        //         });
                        //     }
                        // }
                    }
                    // logger.info(dest);

                    for (let rd of dest) {
                        //采购单明细
                        let addNcaPurchaseDetail = await tb_purchasedetail.create({
                            purchase_id: POID,
                            materiel_id: rd.materiel_id,
                            purchase_number: rd.purchase_num,
                            purchase_price: rd.purchase_price,
                            order_ids: rd.order_ids
                        });
                        //销售单明细
                        let addNcaOrderMateriel = await tb_ordermateriel.create({
                            order_id: SOID,
                            materiel_id: rd.materiel_id,
                            materiel_amount: rd.purchase_num,
                            sale_price: rd.purchase_price,
                            sap_order_state: 1, //标识该销售单sap状态
                        });
                    }

                    let orderworkflow = await tb_orderworkflow.findOne({
                        where: {
                            order_id: SOID,
                            orderworkflow_state: 'NEW'
                        }
                    });

                    if (!orderworkflow) {
                        await tb_orderworkflow.create({
                            order_id: SOID,
                            orderworkflow_state: 'NEW',
                            orderworkflow_desc: '新建'
                        });
                    }
                } else {
                    //本机构物料，向本机构供应商采购，按比例分配
                    replacements = [];
                    queryStr = `select n.materiel_id,n.netdemand_amount,n.order_id as order_ids 
                        from tbl_erc_netdemand n,tbl_erc_materiel m
                        where n.state=1 and m.state=1 and n.materiel_id=m.materiel_id 
                        and n.mrp_state=0 and n.mrp_domain_id=${params.nowDoaminId} 
                        and m.domain_id=${params.nowDoaminId} and m.materiel_source=2`; //m.materiel_source=2 需采购的物料
                    let resultDetail = await sequelize.query(queryStr, {
                        replacements: [],
                        type: sequelize.QueryTypes.SELECT
                    });

                    for (let rd of resultDetail) {
                        //查询机构对应供应商的采购比例
                        replacements = [];
                        queryStr = `select s.supplier_proportion,s.supplier_id,sm.suppliermateriel_purchaseprice,sm.suppliermateriel_purchasepricetax  
                            from tbl_erc_supplier s,tbl_erc_suppliermateriel sm 
                            where s.state=1 and sm.state=1 and s.supplier_id=sm.supplier_id and s.domain_id=${params.nowDoaminId} and sm.materiel_id=${rd.materiel_id}  
                            order by s.supplier_proportion desc`;
                        let resultSupplier = await sequelize.query(queryStr, {
                            replacements: [],
                            type: sequelize.QueryTypes.SELECT
                        });
                        let total_proportion = 0;
                        for (let i = 0; i < resultSupplier.length; i++) {
                            total_proportion += resultSupplier[i].supplier_proportion;
                        }
                        thisNum = 0;
                        thisAllNum = 0;
                        for (let i = 0; i < resultSupplier.length; i++) {
                            //最后一个供应商不安比例分配，该物料的总采购量-之前每个供应商分配量
                            if (i == resultSupplier.length - 1) {
                                if (rd.netdemand_amount - thisAllNum != 0) {
                                    supplerPurchase.push({
                                        purchase_domain_id: params.nowDoaminId,
                                        supplier_id: resultSupplier[i].supplier_id,
                                        materiel_id: rd.materiel_id,
                                        purchase_num: rd.netdemand_amount - thisAllNum,
                                        purchase_price: resultSupplier[i].suppliermateriel_purchasepricetax,
                                        order_ids: rd.order_ids
                                    })
                                }
                            } else {
                                thisNum = Math.round(rd.netdemand_amount * (resultSupplier[i].supplier_proportion / total_proportion));
                                thisAllNum += thisNum;
                                if (thisNum != 0) {
                                    supplerPurchase.push({
                                        purchase_domain_id: params.nowDoaminId,
                                        supplier_id: resultSupplier[i].supplier_id,
                                        materiel_id: rd.materiel_id,
                                        purchase_num: thisNum,
                                        purchase_price: resultSupplier[i].suppliermateriel_purchasepricetax,
                                        order_ids: rd.order_ids
                                    })
                                }
                            }
                        }
                    }
                    //将supplerPurchase按供应商以及物料汇总
                    let mapSuppler = {},
                        destSuppler = [],
                        existState = 0;
                    for (let sp of supplerPurchase) {
                        if (!mapSuppler[sp.supplier_id]) {
                            destSuppler.push({
                                purchase_domain_id: sp.purchase_domain_id,
                                supplier_id: sp.supplier_id,
                                data: [{
                                    materiel_id: sp.materiel_id,
                                    purchase_num: sp.purchase_num,
                                    purchase_price: sp.purchase_price,
                                    order_ids: sp.order_ids
                                }]
                            });
                            mapSuppler[sp.supplier_id] = sp;
                        } else {
                            for (let ds of destSuppler) {
                                if (ds.supplier_id == sp.supplier_id) {
                                    // existState=0;
                                    // for(let dds of ds.data){
                                    //     if(dds.materiel_id==sp.materiel_id){
                                    //         dds.purchase_num +=sp.purchase_num;
                                    //         dds.order_ids = dds.order_ids+","+sp.order_ids;
                                    //         existState=1;
                                    //     }
                                    // }
                                    // if(existState==0){
                                    ds.data.push({
                                        materiel_id: sp.materiel_id,
                                        purchase_num: sp.purchase_num,
                                        purchase_price: sp.purchase_price,
                                        order_ids: sp.order_ids
                                    });
                                    // }
                                    break;
                                }
                            }
                        }
                    }
                    // logger.info(destSuppler);
                    for (let d of destSuppler) {
                        let POID = await Sequence.genPurchaseOrderID(params.nowDoaminId);
                        let SOID = await Sequence.genSalesOrderID(params.nowDoaminId);
                        let biz_code_wlcg = await genBizCode(CODE_NAME.WLCG, params.nowDoaminId, 6);
                        let biz_code_cpxs = await genBizCode(CODE_NAME.CPXS, params.nowDoaminId, 6);
                        // 采购单
                        let addNcaPurchaseOrder = await tb_purchaseorder.create({
                            purchaseorder_id: POID, //采购单号，PO开头
                            purchaseorder_domain_id: params.nowDoaminId, //采购方
                            order_id: '', //销售单号
                            order_domain_id: params.nowDoaminId, //销售方
                            purchaseorder_state: 2, //采购单状态，0未审核，1审核拒绝，2审核通过
                            supplier_id: d.supplier_id, //供应商id
                            created_at: params.yesterday, //如果记录当前时间，第二天的mrp会重复计算
                            biz_code: biz_code_wlcg
                        });
                        // //销售单
                        // let addNcaOrder = await tb_order.create({
                        //     order_id: SOID,                             //销售单号
                        //     domain_id: params.nowDoaminId,              //销售方
                        //     purchase_order_id: POID,                    //采购单号
                        //     purchase_domain_id: params.nowDoaminId,     //采购方
                        //     order_type: 8,                              //订单类型
                        //     created_at:params.yesterday,
                        //     order_state:'NEW',
                        //
                        // });

                        for (let ddata of d.data) {
                            //采购单明细
                            let addNcaPurchaseDetail = await tb_purchasedetail.create({
                                purchase_id: POID,
                                materiel_id: ddata.materiel_id,
                                purchase_number: ddata.purchase_num,
                                purchase_price: ddata.purchase_price,
                                created_at: params.yesterday,
                                order_ids: ddata.order_ids
                            });
                            //
                            // //销售单明细
                            // let addNcaOrderMateriel = await tb_ordermateriel.create({
                            //     order_id: SOID,
                            //     materiel_id: ddata.materiel_id,
                            //     materiel_amount: ddata.purchase_num,
                            //     created_at:params.yesterday
                            // });
                        }

                        // let orderworkflow = await tb_orderworkflow.findOne({
                        //     where: {
                        //         order_id: SOID,
                        //         orderworkflow_state: 'NEW'
                        //     }
                        // });
                        //
                        // if (!orderworkflow) {
                        //     await tb_orderworkflow.create({
                        //         order_id: SOID,
                        //         orderworkflow_state: 'NEW',
                        //         orderworkflow_desc: '新建'
                        //     });
                        // }

                    }
                }
            }
        }

        queryStr = `update tbl_erc_netdemand n,tbl_erc_materiel m
            set n.mrp_state = 1  
            where n.state=1 and m.state=1 and n.materiel_id=m.materiel_id 
            and n.mrp_state=0 and n.mrp_domain_id=${params.nowDoaminId} and m.domain_id=${params.nowDoaminId} 
            and m.materiel_source = 2 `
        let updateMRPState = await sequelize.query(queryStr, {
            replacements: [],
            type: sequelize.QueryTypes.UPDATE
        });
    } catch (error) {
        throw error;
    }
}
//----------------------------------------排产-----------------------------------------
async function ppMasterNew(params) {
    //生产计划  produce plan
    /*  ************关联关系************
        tbl_erc_productdevice           生产设备总表
            productdevice_id    ID

        tbl_erc_productionprocedure     工序总表
            procedure_id        ID

        tbl_erc_department              车间总表
            department_id       ID

        tbl_erc_productplan             生产规划
            product_id          ID

        tbl_erc_departmentprocedure     车间<->工序
            department_id = tbl_erc_department.department_id            车间
            procedure_id = tbl_erc_productionprocedure.procedure_id     工序

        tbl_erc_productplanprocedure    生产规划<->工序
            product_plann_id = tbl_erc_productplan.product_id           产品规划
            procedure_id =  tbl_erc_productionprocedure.procedure_id    工序

        tbl_erc_productproceduredevice  工序<->生产设备
            productprocedure_id = tbl_erc_productionprocedure.procedure_id  工序
            productdevice_id = tbl_erc_productdevice.fixedassetsdetail_id   生产设备

        tbl_erc_productivetask          生产任务表
            department_id = tbl_erc_department.department_id              车间
            procedure_id = tbl_erc_productionprocedure.procedure_id     工序

        ************数据库初始化************
        delete from tbl_erc_productdevice;	                            设备
        delete from tbl_erc_productionprocedure;                        工序
        delete from tbl_erc_department;                                 车间
        delete from tbl_erc_productplan;                                产品规划
        delete from tbl_erc_departmentprocedure;                        车间<->工序
        delete from tbl_erc_productplanprocedure;                       产品规划<->工序
        delete from tbl_erc_productproceduredevice;                     工序<->设备
        delete from tbl_erc_order;                                      订单
        delete from tbl_erc_ordermateriel;                              订单明细
        delete from tbl_erc_suppliermateriel;                           供应商物料明细
        delete from tbl_erc_supplier;                                   供应商
        delete from tbl_common_domain where domain_id not in (55,1)

        主计划,日计划,生产任务,生产任务的投料,采购单,采购单明细,采购申请单,采购申请单明细,库存,出入库流水,排产主计划,排产计划（每日）的投料

        delete from tbl_erc_alldemand;
        delete from tbl_erc_netdemand;
        delete from tbl_erc_productivetask;
        delete from tbl_erc_productivetaskdetail;
        delete from tbl_erc_purchaseorder;
        delete from tbl_erc_purchasedetail;
        delete from tbl_erc_purchaseapply;
        delete from tbl_erc_purchaseapplydetail;
        delete from tbl_erc_stockmap;
        delete from tbl_erc_inventoryaccount;
        delete from tbl_erc_ppmaster;
        delete from tbl_erc_ppmasterptdetail;
    */

    /* 
        问题：
            1 车间维护，工作时长改变，生产设备的日产能没变
    */
    try {
        let queryStr = '',
            search_date_begin = '' //排产查询的起始日期
        /**
         *-------------------------排产前的准备-------------------------
         * */
        //  0   获取每个车间休假类型
        let departmentAll = await tb_department.findAll({
            where: {
                state: 1,
                department_type: 0,
                domain_id: params.nowDoaminId
            }
        })

        //注释
        let dTemp = []
        for (d of departmentAll) {
            dTemp.push({
                department_id: d.department_id,
                department_name: d.department_name
            })
        }
        logger.info(dTemp)
        //注释end

        // //  1   获取每个车间/工序/产品的理论产能
        // let DPtheoryNumAll = []
        // for (let d of departmentAll) {
        //     queryStr = `select pp.procedure_id,pp.procedure_name from tbl_erc_productionprocedure pp
        //         left join tbl_erc_departmentprocedure dp on (pp.procedure_id = dp.procedure_id and dp.state=1)
        //         where pp.state=1 and dp.department_id='${d.department_id}'`
        //     let procedure = await sequelize.query(queryStr, {
        //         replacements: [],
        //         type: sequelize.QueryTypes.SELECT
        //     });
        //     for (let p of procedure) {
        //         queryStr = `
        //             select pc.materiel_id,m.materiel_name,
        //                 sum(if(ppd.device_level=1,pc.day_capacity,0)) as sumDayCapacityZ,
        //                 sum(if(ppd.device_level=2,pc.day_capacity,0)) as sumDayCapacityF
        //             from tbl_erc_productproceduredevice ppd
        //             left join tbl_erc_productdevice_capacity pc on (ppd.productdevice_id = pc.productdevice_id and pc.state=1)
        //             left join tbl_erc_materiel m on (pc.materiel_id = m.materiel_id and m.state=1)
        //             where ppd.state=1 and ppd.productprocedure_id = ${p.procedure_id}
        //             group by pc.materiel_id,m.materiel_name`
        //         let device = await sequelize.query(queryStr, {
        //             replacements: [],
        //             type: sequelize.QueryTypes.SELECT
        //         });
        //         for (let v of device) {
        //             DPtheoryNumAll.push({
        //                 department_id: d.department_id,
        //                 department_name: d.department_name,
        //                 procedure_id: p.procedure_id,
        //                 procedure_name: p.procedure_name,
        //                 materiel_id: v.materiel_id,
        //                 materiel_name: v.materiel_name,
        //                 sumDayCapacityZ: v.sumDayCapacityZ,
        //                 sumDayCapacityF: v.sumDayCapacityF
        //             })
        //         }
        //     }
        // }
        // logger.info(DPtheoryNumAll)



        queryStr = `
            SELECT
                pp.department_id, d.department_name,pp.procedure_id ,pp.procedure_name,
                sum(if(ppd.device_level=1,ppd.day_capacity,0)) as sumDayCapacityZ,
                sum(if(ppd.device_level=2,ppd.day_capacity,0)) as sumDayCapacityF
            FROM
                tbl_erc_productproceduredevice ppd 
                LEFT JOIN tbl_erc_productionprocedure pp ON (ppd.productprocedure_id = pp.procedure_id AND pp.state = 1)
                LEFT JOIN tbl_erc_department d ON (pp.department_id = d.department_id AND d.state = 1)
            WHERE
                ppd.state = 1 AND ppd.domain_id =${params.nowDoaminId}
            GROUP BY
                pp.department_id, d.department_name,pp.procedure_id ,pp.procedure_name`

        let DPtheoryNumAll = await sequelize.query(queryStr, {
            replacements: [],
            type: sequelize.QueryTypes.SELECT
        });

        for (let d of DPtheoryNumAll) {
            if (d.sumDayCapacityZ == 0 && d.sumDayCapacityF == 0) {
                d.sumDayCapacityTheory = 0
            } else {
                if (d.sumDayCapacityZ == 0) {
                    d.sumDayCapacityTheory = d.sumDayCapacityF
                } else if (d.sumDayCapacityF == 0) {
                    d.sumDayCapacityTheory = d.sumDayCapacityZ
                } else {
                    d.sumDayCapacityTheory = d.sumDayCapacityZ <= d.sumDayCapacityF ? d.sumDayCapacityZ : d.sumDayCapacityF
                }
            }
        }
        logger.info('DPtheoryNumAll', DPtheoryNumAll)
        // 2    将每个订单按级别汇总，并倒叙排列
        let PTGroupOrder = []
        let PTGroupOrderRes = await tb_productivetask.findAll({
            attributes: ['order_id'],
            group: 'order_id',
            where: {
                state: 1,
                domain_id: params.nowDoaminId,
                productivetask_state: 1,
                outsource_sign: 1
            }
        })

        for (let ptgo of PTGroupOrderRes) {
            replacements = []
            let PTByOrder = await tb_productivetask.findAll({
                where: {
                    state: 1,
                    domain_id: params.nowDoaminId,
                    productivetask_state: 1,
                    outsource_sign: 1,
                    order_id: ptgo.order_id
                },
                order: [
                    ['product_level']
                ]
            })
            let list = '',
                data = [{
                    level: '',
                    levelItem: []
                }]
            for (let ptbo of PTByOrder) {
                if (data[data.length - 1].level == ptbo.product_level) {
                    data[data.length - 1].levelItem.push(ptbo);
                } else {
                    data.push({
                        level: ptbo.product_level,
                        levelItem: []
                    })
                    data[data.length - 1].levelItem.push(ptbo);

                }
            }
            data = data.sort(compareDesc('level'))
            PTGroupOrder.push({
                order_id: ptgo.order_id,
                max_level: data[0].level,
                pt_item: data
            })
            //注释
            for (let d of data) {
                console.log(d.level)
                for (let dd of d.levelItem) {
                    console.log(`department_id:  ${dd.department_id}  ,materiel_code:  ${dd.materiel_code}  ,procedure_id:  ${dd.procedure_id}  ,productivetask_code:  ${dd.productivetask_code} \n `)
                }
            }
            //注释end
        }

        logger.info('PTGroupOrder', PTGroupOrder);
        /**
         *-------------------------排产-------------------------
         * */
        //按订单排产，先排完一个订单，再拍下一个订单
        for (let ptgo of PTGroupOrder) {
            //生产任务单按级别倒叙生产
            for (let pi of ptgo.pt_item) {
                if (pi.level == '') {
                    return
                }
                //将生产任务单排产
                for (let pt of pi.levelItem) {
                    //1 确定该生产任务单所在的车间/工序的产能信息
                    let DPtheoryNumOne
                    DPtheoryNumOne = DPtheoryNumAll.find(function (e) {
                        if (e.department_id == pt.department_id && e.procedure_id == pt.procedure_id) {
                            return e
                        }
                    });

                    let departmentOne = departmentAll.find(function (e) {
                        if (e.department_id == pt.department_id) {
                            return e
                        }
                    });

                    if (!departmentOne) {
                        continue
                    }

                    if (departmentOne.mrp_begin_time) {
                        if (moment().isBefore(departmentOne.mrp_begin_time)) {
                            return
                        }
                    }

                    //如果没有该工序的理论产能信息或者理论产能==0，则寻找距离该工序最近的产能,先向上找，再向下找
                    if (!DPtheoryNumOne || Number(DPtheoryNumOne.sumDayCapacityTheory) == 0) {
                        if (pt.procedure_id == 272) {
                            logger.info(pt.department_id, pt.productivetask_code, pt.procedure_id)
                        }
                        let element = []
                        queryStr = `select * from tbl_erc_productplanprocedure 
                            where state=1 and domain_id = ${params.nowDoaminId} and product_plan_id = ${pt.product_id}
                            and rlt_materiel_code = ${pt.materiel_id} and priority<${Number(pt.procedure_level)} 
                            order by priority desc `
                        let lastProcedure = await sequelize.query(queryStr, {
                            replacements: [],
                            type: sequelize.QueryTypes.SELECT
                        });
                        for (let lp of lastProcedure) {
                            element.push({
                                department_id: pt.department_id,
                                procedure_id: lp.procedure_id
                            })
                        }

                        queryStr = `select ppd.workshop_id,ppdu.procedure_id from tbl_erc_productplanprocedure ppdu 
                            left join tbl_erc_productplandetail ppd on (ppdu.product_plan_id=ppd.product_plan_id and ppd.state=1) 
                            where ppdu.state=1 and ppdu.product_plan_id = ${pt.product_id} and ppd.prd_level<${Number(pt.product_level)}
                            order by ppd.prd_level desc,ppdu.priority desc`

                        let lastProduct = await sequelize.query(queryStr, {
                            replacements: [],
                            type: sequelize.QueryTypes.SELECT
                        });
                        for (let lp of lastProduct) {
                            element.push({
                                department_id: lp.workshop_id,
                                procedure_id: lp.procedure_id
                            })
                        }

                        for (let ele of element) {
                            DPtheoryNumOne = DPtheoryNumAll.find(function (e) {
                                if (e.department_id == ele.department_id && e.procedure_id == ele.procedure_id) {
                                    return e
                                }
                            });

                            if (DPtheoryNumOne) {
                                break
                            }
                        }
                    }
                    if (!DPtheoryNumOne || Number(DPtheoryNumOne.sumDayCapacityTheory) == 0) {
                        let element = []
                        queryStr = `select * from tbl_erc_productplanprocedure 
                            where state=1 and domain_id = ${params.nowDoaminId} and product_plan_id = ${pt.product_id}
                            and rlt_materiel_code = ${pt.materiel_id} and priority>${Number(pt.procedure_level)} 
                            order by priority desc `
                        let lastProcedure = await sequelize.query(queryStr, {
                            replacements: [],
                            type: sequelize.QueryTypes.SELECT
                        });
                        for (let lp of lastProcedure) {
                            element.push({
                                department_id: pt.department_id,
                                procedure_id: lp.procedure_id
                            })
                        }
                        queryStr = `select ppd.workshop_id,ppdu.procedure_id from tbl_erc_productplanprocedure ppdu 
                            left join tbl_erc_productplandetail ppd on (ppdu.product_plan_id=ppd.product_plan_id and ppd.state=1) 
                            where ppdu.state=1 and ppdu.product_plan_id = ${pt.product_id} and ppd.prd_level>${Number(pt.product_level)}
                            order by ppd.prd_level desc,ppdu.priority desc`

                        let lastProduct = await sequelize.query(queryStr, {
                            replacements: [],
                            type: sequelize.QueryTypes.SELECT
                        });
                        for (let lp of lastProduct) {
                            element.push({
                                department_id: lp.workshop_id,
                                procedure_id: lp.procedure_id
                            })
                        }

                        for (let ele of element) {
                            DPtheoryNumOne = DPtheoryNumAll.find(function (e) {
                                if (e.department_id == ele.department_id && e.procedure_id == ele.procedure_id) {
                                    return e
                                }
                            });

                            if (DPtheoryNumOne) {
                                break
                            }
                        }
                    }
                    if (!DPtheoryNumOne || Number(DPtheoryNumOne.sumDayCapacityTheory) == 0) {
                        return
                    }

                    /**
                     * materiel_manage    1安全库存管理    2销售订单管理
                     * materiel_source     1自制 2外购 3委外加工 4受托加工
                     * 2 查询该生产任务单下级投料
                     * 生产任务单排产的思路是：
                     *      a   判断投料  安全库存管理 or 销售订单管理 ，如果所有的投料全部是安全库存管理，则代表库存永远满足，那么该生产单从当日即可生产
                     *      b   如果投料中存在销售订单管理的物料，那么判断销售订单管理的物料属于     0全外购/委外   1全自制/受托   2自制/受托+外购/委外 每种方式对应不同的排产策略
                     * */

                    queryStr = `select d.*,m.materiel_manage,m.materiel_source from tbl_erc_productivetaskdetail d
                        left join tbl_erc_materiel m on (d.materiel_id=m.materiel_id and m.state=1)
                        where d.state=1 and productivetask_id=${pt.productivetask_id} and m.materiel_manage=2`
                    let ptDetail = await sequelize.query(queryStr, {
                        replacements: [],
                        type: sequelize.QueryTypes.SELECT
                    });

                    if (ptDetail.length == 0) { //该分支代表全部为安全库存
                        search_date_begin = moment().format("YYYY-MM-DD")
                        await ppMasteAction({
                            search_date_begin: search_date_begin, //排产的起始日期
                            taskdesignNumber: pt.taskdesign_number, //排产数量，通过排产数量来控制本次排产的天数
                            productivetask_code: pt.productivetask_code, //生产任务单号
                            nowDoaminId: params.nowDoaminId, //domain_id
                            department_id: pt.department_id, //车间
                            procedure_id: pt.procedure_id, //工序
                            procedure_level: pt.procedure_level, //工序级别
                            order_id: pt.order_id, //订单号
                            // company: company, //公司
                            vacation_type: departmentOne.vacation_type,
                            DPtheoryNumOne: DPtheoryNumOne, //该工序/车间产能
                            // ptDetail: ptDetail, //该生产单的投料信息
                            order_id: pt.order_id, //销售订单号
                            materiel_id: pt.materiel_id //生产任务单物料
                        })
                    } else { //该分支代表投料中含有销售订单管理的物料
                        let materiel_source_kind1 = false,
                            materiel_source_kind2 = false,
                            materiel_source_kind = '' //0全外购/委外/受托   1全自制   2自制+外购/委外/受托 每种方式对应不同的排产策略
                        // * materiel_source     1自制 2外购 3委外加工 4受托加工
                        queryStr = `select m.materiel_id 
                            from tbl_erc_productivetaskdetail d
                            left join tbl_erc_materiel m on (d.materiel_id=m.materiel_id and m.state=1)
                            where d.state=1 and productivetask_id=${pt.productivetask_id} 
                            and m.materiel_manage=1 and m.materiel_source in (2,3,4)`
                        let ptDetailKind1 = await sequelize.query(queryStr, {
                            replacements: [],
                            type: sequelize.QueryTypes.SELECT
                        });
                        if (ptDetailKind1.length > 0) {
                            materiel_source_kind1 = true //外购 委托 受托
                        }

                        queryStr = `select m.materiel_id 
                            from tbl_erc_productivetaskdetail d
                            left join tbl_erc_materiel m on (d.materiel_id=m.materiel_id and m.state=1)
                            where d.state=1 and productivetask_id=${pt.productivetask_id} 
                            and m.materiel_manage=1 and m.materiel_source in (1)`
                        let ptDetailKind2 = await sequelize.query(queryStr, {
                            replacements: [],
                            type: sequelize.QueryTypes.SELECT
                        });
                        if (ptDetailKind2.length > 0) {
                            materiel_source_kind2 = true //自制
                        }

                        if (materiel_source_kind1 && !materiel_source_kind2) {
                            materiel_source_kind = 0
                        } else if (!materiel_source_kind1 && materiel_source_kind2) {
                            materiel_source_kind = 1
                        } else if (materiel_source_kind1 && materiel_source_kind2) {
                            materiel_source_kind = 2
                        }
                        // ---------------------------------------------------------全外购/委外/受托---------------------------------------------------------
                        if (materiel_source_kind == 0) {
                            /**
                             * 全外购/委外
                             *      a 计算库存的投料可以生产多少本生产单物料，将库存排完后，
                             *      b 再将剩余生产单物料，取最大的‘最短供货日期’ 从最大日期开始排产
                             * */
                            let surplusNumber = await ppMasterStockmap({ //这个方法将库存量排产，并返回剩余需要排产的数量
                                nowDoaminId: params.nowDoaminId,
                                pt: pt, //生产任务单
                                ptDetail: ptDetail, //投料
                                // company: company,
                                vacation_type: departmentOne.vacation_type,
                                DPtheoryNumOne: DPtheoryNumOne
                            });
                            if (surplusNumber) {
                                let shortestDaysArr = [] //最短送货日期
                                //查询投料的最短送货日期(最大)
                                for (let pd of ptDetail) {
                                    let queryStr = `select max(suppliermateriel_shortest_days) as maxShortestDays
                                        from tbl_erc_suppliermateriel sm,tbl_erc_supplier s
                                        where sm.state=1 and s.state=1 and sm.supplier_id=s.supplier_id 
                                        and s.domain_id=${params.nowDoaminId} and sm.materiel_id=${pd.materiel_id}`
                                    let supplierRes = await sequelize.query(queryStr, {
                                        replacements: [],
                                        type: sequelize.QueryTypes.SELECT
                                    });
                                    if (supplierRes.length > 0) {
                                        shortestDaysArr.push({
                                            materiel_id: pd.matreiel_id,
                                            shortest_days: supplierRes[0].maxShortestDays,
                                        })
                                    }
                                }

                                shortestDaysArr.sort(compareDesc('shortest_days'))
                                let maxItem = shortestDaysArr.length > 0 ? shortestDaysArr[0] : {};
                                search_date_begin = moment().add(Number(maxItem.shortest_days), "days").format("YYYY-MM-DD") //最大的‘最短供货日期’
                                await ppMasteAction({
                                    search_date_begin: search_date_begin, //排产的起始日期
                                    taskdesignNumber: surplusNumber, //排产数量，通过排产数量来控制本次排产的天数
                                    productivetask_code: pt.productivetask_code, //生产任务单号
                                    nowDoaminId: params.nowDoaminId, //domain_id
                                    department_id: pt.department_id, //车间
                                    procedure_id: pt.procedure_id, //工序
                                    procedure_level: pt.procedure_level, //工序级别
                                    // company: company, //公司
                                    vacation_type: departmentOne.vacation_type,
                                    DPtheoryNumOne: DPtheoryNumOne, //该工序/车间产能
                                    // ptDetail: ptDetail, //该生产单的投料信息
                                    order_id: pt.order_id,
                                    materiel_id: pt.materiel_id
                                })
                            }

                        }
                        // ---------------------------------------------------------全自制 ---------------------------------------------------------
                        if (materiel_source_kind == 1) {
                            /**
                             * 全自制/受托
                             *      a 计算库存的投料可以生产多少本生产单物料，将库存排完后，
                             *      b 再将剩余生产单物料,
                             *          获取所有投料的排产主计划，排产量满足生产任务单一天产能的日期(一天的产能及该车间/工序的理论日产能)，作为该生产任务单一天排产的起始日期，排产量也是一天的量
                             * */
                            let surplusNumber = await ppMasterStockmap({ //这个方法将库存量排产，并返回剩余需要排产的数量
                                nowDoaminId: params.nowDoaminId,
                                pt: pt, //生产任务单
                                ptDetail: ptDetail, //投料
                                // company: company,
                                vacation_type: departmentOne.vacation_type,
                                DPtheoryNumOne: DPtheoryNumOne
                            });

                            if (surplusNumber) {
                                let pcNumberDone = 0
                                while (surplusNumber > 0) {
                                    let ppmasterDateArr = []

                                    let pcNumber = 0
                                    if (Number(surplusNumber) <= Number(DPtheoryNumOne.sumDayCapacityTheory)) {
                                        pcNumber = surplusNumber
                                    } else {
                                        pcNumber = DPtheoryNumOne.sumDayCapacityTheory
                                    }
                                    pcNumberDone += Number(pcNumber)

                                    for (let pd of ptDetail) {
                                        queryStr = `select * from tbl_erc_ppmaster where state=1 
                                            and ppmaster_order_id='${pt.order_id}' and ppmaster_date>'${moment().format("YYYY-MM-DD")}' and ppmaster_materiel_id=${pd.materiel_id}
                                            and ppmaster_procedure_level = (select max(ppmaster_procedure_level) from tbl_erc_ppmaster where state=1 and ppmaster_order_id='${pt.order_id}' and ppmaster_date>'${moment().format("YYYY-MM-DD")}' and ppmaster_materiel_id=${pd.materiel_id})
                                            order by ppmaster_date `
                                        let ppmasterRes = await sequelize.query(queryStr, {
                                            replacements: [],
                                            type: sequelize.QueryTypes.SELECT
                                        });
                                        if (ppmasterRes.length > 0) {
                                            let sumPPmasterNumber = 0
                                            for (let spn of ppmasterRes) {
                                                sumPPmasterNumber += Number(spn.ppmaster_produce_number)
                                                if (Number(sumPPmasterNumber) >= Number(pcNumberDone) * Number(pd.design_number)) {
                                                    ppmasterDateArr.push(moment(spn.ppmaster_date).add(1, "days").format("YYYY-MM-DD"))
                                                    break
                                                }
                                            }
                                        }
                                    }
                                    ppmasterDateArr.sort((a, b) => { //取最大的日期作为本次排产的起始日期
                                        return b > a
                                    })
                                    if (ppmasterDateArr.length > 0) {
                                        search_date_begin = moment(ppmasterDateArr[0]).format("YYYY-MM-DD")
                                        await ppMasteAction({
                                            search_date_begin: search_date_begin, //排产的起始日期
                                            taskdesignNumber: pcNumber, //排产数量，通过排产数量来控制本次排产的天数
                                            productivetask_code: pt.productivetask_code, //生产任务单号
                                            nowDoaminId: params.nowDoaminId, //domain_id
                                            department_id: pt.department_id, //车间
                                            procedure_id: pt.procedure_id, //工序
                                            procedure_level: pt.procedure_level, //工序级别
                                            // company: company, //公司
                                            vacation_type: departmentOne.vacation_type,
                                            DPtheoryNumOne: DPtheoryNumOne, //该工序/车间产能
                                            // ptDetail: ptDetail, //该生产单的投料信息
                                            order_id: pt.order_id,
                                            materiel_id: pt.materiel_id
                                        })
                                    }

                                    surplusNumber -= Number(pcNumber)
                                }
                            }
                        }

                        // ---------------------------------------------------------自制+外购/委外/受托---------------------------------------------------------
                        if (materiel_source_kind == 2) {
                            /**
                             * 自制/受托+外购/委外
                             *      a 计算库存的投料可以生产多少本生产单物料，将库存排完后，
                             *      b 这一步相当于把前两种情况结合起来
                             *          b-1 先判断采购物料的最大'最短供货日期'
                             * */
                            let surplusNumber = await ppMasterStockmap({ //这个方法将库存量排产，并返回剩余需要排产的数量
                                nowDoaminId: params.nowDoaminId,
                                pt: pt, //生产任务单
                                ptDetail: ptDetail, //投料
                                // company: company,
                                vacation_type: departmentOne.vacation_type,
                                DPtheoryNumOne: DPtheoryNumOne
                            });
                            if (surplusNumber) {
                                let shortestDaysArr = [] //最短送货日期
                                //查询投料的最短送货日期(最大)
                                for (let pd of ptDetail) {
                                    if (pd.materiel_source == 2 || pd.materiel_source == 3 || pd.materiel_source == 4) {
                                        let queryStr = `select max(suppliermateriel_shortest_days) as maxShortestDays
                                        from tbl_erc_suppliermateriel sm,tbl_erc_supplier s
                                        where sm.state=1 and s.state=1 and sm.supplier_id=s.supplier_id 
                                        and s.domain_id=${params.nowDoaminId} and sm.materiel_id=${pd.materiel_id}`
                                        let supplierRes = await sequelize.query(queryStr, {
                                            replacements: [],
                                            type: sequelize.QueryTypes.SELECT
                                        });
                                        if (supplierRes.length > 0) {
                                            shortestDaysArr.push({
                                                materiel_id: pd.materiel_id,
                                                shortest_days: supplierRes[0].maxShortestDays,
                                            })
                                        }
                                    }
                                }
                                // * materiel_source     1自制 2外购 3委外加工 4受托加工
                                shortestDaysArr.sort(compareDesc('shortest_days'))
                                let maxItem = shortestDaysArr.length > 0 ? shortestDaysArr[0] : {};
                                let search_date_begin_temp = moment().add(Number(maxItem.shortest_days), "days").format("YYYY-MM-DD") //最大的‘最短供货日期’

                                let pcNumberDone = 0
                                while (surplusNumber > 0) {
                                    let ppmasterDateArr = []

                                    let pcNumber = 0
                                    if (Number(surplusNumber) <= Number(DPtheoryNumOne.sumDayCapacityTheory)) {
                                        pcNumber = surplusNumber
                                    } else {
                                        pcNumber = DPtheoryNumOne.sumDayCapacityTheory //这里是一天的产量
                                    }
                                    pcNumberDone += Number(pcNumber)

                                    for (let pd of ptDetail) {
                                        if (pd.materiel_source == 1) {
                                            queryStr = `select * from tbl_erc_ppmaster where state=1 
                                            and ppmaster_order_id='${pt.order_id}' and ppmaster_date>'${moment().format("YYYY-MM-DD")}' and ppmaster_materiel_id=${pd.materiel_id}
                                            and ppmaster_procedure_level = 
                                                (select max(ppmaster_procedure_level) from tbl_erc_ppmaster 
                                                    where state=1 and ppmaster_order_id='${pt.order_id}' 
                                                    and ppmaster_date>'${moment().format("YYYY-MM-DD")}' 
                                                    and ppmaster_materiel_id=${pd.materiel_id})
                                            order by ppmaster_date `
                                            let ppmasterRes = await sequelize.query(queryStr, {
                                                replacements: [],
                                                type: sequelize.QueryTypes.SELECT
                                            });
                                            if (ppmasterRes.length > 0) {
                                                let sumPPmasterNumber = 0
                                                for (let spn of ppmasterRes) {
                                                    sumPPmasterNumber += Number(spn.ppmaster_produce_number)
                                                    if (Number(sumPPmasterNumber) >= Number(pcNumberDone) * Number(pd.design_number)) {
                                                        ppmasterDateArr.push(moment(spn.ppmaster_date).add(1, "days").format("YYYY-MM-DD"))
                                                        break
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    ppmasterDateArr.sort((a, b) => { //取最大的日期作为本次排产的起始日期
                                        return b > a
                                    })
                                    if (ppmasterDateArr.length > 0) {
                                        if (moment(search_date_begin_temp).isBefore(moment(ppmasterDateArr[0]))) {
                                            search_date_begin = moment(ppmasterDateArr[0]).format("YYYY-MM-DD")
                                        } else {
                                            search_date_begin = moment(search_date_begin_temp).format("YYYY-MM-DD")
                                        }

                                        await ppMasteAction({
                                            search_date_begin: search_date_begin, //排产的起始日期
                                            taskdesignNumber: pcNumber, //排产数量，通过排产数量来控制本次排产的天数
                                            productivetask_code: pt.productivetask_code, //生产任务单号
                                            nowDoaminId: params.nowDoaminId, //domain_id
                                            department_id: pt.department_id, //车间
                                            procedure_id: pt.procedure_id, //工序
                                            procedure_level: pt.procedure_level, //工序级别
                                            // company: company, //公司
                                            vacation_type: departmentOne.vacation_type,
                                            DPtheoryNumOne: DPtheoryNumOne, //该工序/车间产能
                                            // ptDetail: ptDetail, //该生产单的投料信息
                                            order_id: pt.order_id,
                                            materiel_id: pt.materiel_id
                                        })
                                    }
                                    surplusNumber -= Number(pcNumber)
                                }
                            }
                        }
                    }
                    //将生产单改为已排产
                    let update = await tb_productivetask.update({
                        productivetask_state: 2
                    }, {
                        where: {
                            productivetask_id: pt.productivetask_id
                        }
                    });
                }
            }
        }
        //*************************生产任务单 end */
    } catch (error) {
        throw error;
    }
}

//根据投料库存排产
async function ppMasterStockmap(params) {
    try {
        let {
            nowDoaminId,
            pt, //生产任务单
            ptDetail, //投料
            vacation_type,
            DPtheoryNumOne
        } = params

        let inventoryArr = [], //库存量
            retrurnSurplus = '',
            search_date_begin = ''
        for (let pd of ptDetail) {
            //判断该投料的库存量能生产多少成品
            let queryStr = `select sum(s.current_amount) as sumCurrentAmount 
                from tbl_erc_stockmap s,tbl_erc_warehouse w,tbl_erc_basetypedetail bd  
                where s.state=1 and w.state=1 and bd.state=1 
                and s.warehouse_id=w.warehouse_id and w.warehouse_type = bd.basetypedetail_id 
                and w.domain_id=${nowDoaminId} and (order_id is null or order_id='') and s.materiel_id=${pd.materiel_id} 
                and bd.typedetail_name not in ('不良品仓','废品仓') `;
            let stockmapRes = await sequelize.query(queryStr, {
                replacements: [],
                type: sequelize.QueryTypes.SELECT
            });
            if (stockmapRes.length > 0) {
                if (stockmapRes[0].sumCurrentAmount) {
                    inventoryArr.push({
                        inventory_number: Math.floor(Number(stockmapRes[0].sumCurrentAmount) / Number(pd.design_number)),
                        design_number: pd.design_number
                    })
                }
            }
        }

        if (inventoryArr.length > 0) { //有库存,将库存量先排产
            inventoryArr.sort(compare('inventory_number'))
            let minItem = inventoryArr.length == 0 ? {} : inventoryArr[0]; // 最小的库存，这里的最小库存，指的是能最少生产X个生产任务单的物料，不是该投料的库存

            if (Number(minItem.inventory_number) >= Number(pt.taskdesign_number)) { //如果库存最小的已经能满足生产任务单，则今日开始生产，不考虑供应商
                search_date_begin = moment().format("YYYY-MM-DD")
                await ppMasteAction({
                    search_date_begin: search_date_begin, //排产的起始日期
                    taskdesignNumber: pt.taskdesign_number, //排产数量，通过排产数量来控制本次排产的天数
                    productivetask_code: pt.productivetask_code, //生产任务单号
                    nowDoaminId: nowDoaminId, //domain_id
                    department_id: pt.department_id, //车间
                    procedure_id: pt.procedure_id, //工序
                    procedure_level: pt.procedure_level, //工序级别
                    // company: company, //公司
                    vacation_type: vacation_type,
                    DPtheoryNumOne: DPtheoryNumOne, //该工序/车间产能
                    ptDetail: ptDetail, //该生产单的投料信息
                    order_id: pt.order_id,
                    materiel_id: pt.materiel_id
                })

                //针对有库存的情况，把已占用的库存，订单号更新
                for (let pd of ptDetail) {
                    let checkParams = {
                        materiel_id: pd.materiel_id,
                        demand_amount: Number(pt.taskdesign_number) * Number(pd.design_number),
                        order_id: pt.order_id,
                        nowDoaminId: nowDoaminId
                    };

                    let lackAmount = await checkInventory(checkParams); //这里只需要用checkInventory方法中分配订单号的逻辑
                }

                retrurnSurplus = 0
            } else {
                //将库存量排产完成后，取最大的‘最短供货日期’后开始排产剩下的量
                search_date_begin = moment().format("YYYY-MM-DD")
                await ppMasteAction({
                    search_date_begin: search_date_begin, //排产的起始日期
                    taskdesignNumber: minItem.inventory_number, //排产数量，通过排产数量来控制本次排产的天数
                    productivetask_code: pt.productivetask_code, //生产任务单号
                    nowDoaminId: params.nowDoaminId, //domain_id
                    department_id: pt.department_id, //车间
                    procedure_id: pt.procedure_id, //工序
                    procedure_level: pt.procedure_level, //工序级别
                    // company: company, //公司
                    vacation_type: vacation_type,
                    DPtheoryNumOne: DPtheoryNumOne, //该工序/车间产能
                    ptDetail: ptDetail, //该生产单的投料信息
                    order_id: pt.order_id,
                    materiel_id: pt.materiel_id
                })

                //针对有库存的情况，把已占用的库存，订单号更新
                for (let pd of ptDetail) {
                    let checkParams = {
                        materiel_id: pd.materiel_id,
                        demand_amount: Number(minItem.inventory_number) * Number(pd.design_number),
                        order_id: pt.order_id,
                        nowDoaminId: nowDoaminId
                    };
                    let lackAmount = await checkInventory(checkParams); //这里只需要用checkInventory方法中分配订单号的逻辑
                }
                retrurnSurplus = Number(pt.taskdesign_number) - Number(minItem.inventory_number)
            }
        } else { //无库存
            retrurnSurplus = Number(pt.taskdesign_number)
            return retrurnSurplus
        }
    } catch (error) {
        throw error
    }
}

// 排产方法，必须确定排产日期，以及排产量
async function ppMasteAction(params) {
    try {
        let {
            search_date_begin,
            taskdesignNumber,
            productivetask_code,
            nowDoaminId,
            department_id,
            procedure_id,
            procedure_level,
            order_id,
            materiel_id,
            vacation_type,
            DPtheoryNumOne,
            // ptDetail
        } = params


        let dataI = 0
        while (Number(taskdesignNumber) > 0) {
            let ppmaster_holiday_capacity = 0 //节日影响日产能
            let ppmaster_repairs_capacity = 0 //保修影响日产能
            let ppmaster_produce_number = 0 //本次排产数量
            let ppmaster_reality_capacity = 0 //本次排产的实际产能
            let ppMasterDate = moment(search_date_begin).add(Number(dataI), "days").format("YYYY-MM-DD") //本次排产日期

            if (vacation_type == 1) { //单休
                let getWeekDay = await checkDay(ppMasterDate)
                if (getWeekDay == 0) {
                    ppmaster_holiday_capacity = -DPtheoryNumOne.sumDayCapacityTheory
                }
            } else if (vacation_type == 2) { //双休
                let getWeekDay = await checkDay(ppMasterDate)
                if (getWeekDay == 6 || getWeekDay == 0) {
                    ppmaster_holiday_capacity = -DPtheoryNumOne.sumDayCapacityTheory
                }
            }

            ppmaster_reality_capacity = Number(DPtheoryNumOne.sumDayCapacityTheory) + Number(ppmaster_holiday_capacity) + Number(ppmaster_repairs_capacity)
            //非节假日，但日产能==0的。退出循环，
            if (ppmaster_reality_capacity <= 0 && ppmaster_holiday_capacity == 0) {
                break
            }

            if (Number(ppmaster_holiday_capacity) < 0) {
                ppmaster_produce_number = 0
            } else {
                // 查询当日的排产中，已占用多少
                PPMasterOne = await getPPMasterOne({
                    department_id: department_id,
                    procedure_id: procedure_id,
                    ppmaster_date: ppMasterDate,
                    domain_id: nowDoaminId
                })
                if (PPMasterOne.length == 0) {
                    if (Number(taskdesignNumber) >= Number(ppmaster_reality_capacity)) {
                        ppmaster_produce_number = Number(ppmaster_reality_capacity)
                        taskdesignNumber -= Number(ppmaster_produce_number)
                    } else {
                        ppmaster_produce_number = Number(taskdesignNumber)
                        taskdesignNumber = 0
                    }
                } else {

                    if (taskdesignNumber >= (Number(ppmaster_reality_capacity) - Number(PPMasterOne[0].sumProduceNumber))) {
                        ppmaster_produce_number = Number(ppmaster_reality_capacity) - Number(PPMasterOne[0].sumProduceNumber)
                        taskdesignNumber -= Number(ppmaster_produce_number)
                    } else {
                        ppmaster_produce_number = Number(taskdesignNumber)
                        taskdesignNumber = 0
                    }
                }
            }

            //排产计划（天）
            if (ppmaster_produce_number != 0) {
                let addPPMasterOne = await tb_ppmaster.create({
                    productivetask_code: productivetask_code, //生产任务单号
                    domain_id: nowDoaminId,
                    ppmaster_date: ppMasterDate, //日期
                    ppmaster_department_id: department_id, //车间
                    ppmaster_procedure_id: procedure_id, //工序
                    ppmaster_procedure_level: procedure_level, //工序级别
                    ppmaster_m_equipment_capacity: DPtheoryNumOne.sumDayCapacityZ, //主设备每小时产能
                    ppmaster_a_equipment_capacity: DPtheoryNumOne.sumDayCapacityF, //辅设备每小时产能
                    ppmaster_work_duration: 1, //作业小时数
                    ppmaster_theory_capacity_day: DPtheoryNumOne.sumDayCapacityTheory, //理论日产能
                    ppmaster_holiday_capacity: ppmaster_holiday_capacity, //节假日影响的产能 负数
                    ppmaster_repairs_capacity: ppmaster_repairs_capacity, //报修影响的产能 负数
                    ppmaster_reality_capacity: ppmaster_reality_capacity, //实际产能
                    ppmaster_produce_number: ppmaster_produce_number, //排产数量
                    ppmaster_residue_number: taskdesignNumber, //剩余排产数量，最后应为0
                    ppmaster_check_materiel_state: 0, //日计划检查物料状态   0待清查、1物料不齐全、2物料齐全
                    ppmaster_check_device_state: 0, //日计划检查设备状态
                    ppmaster_check_person_state: 0, //日计划检查人员状态
                    ppmaster_order_id: order_id,
                    ppmaster_materiel_id: materiel_id
                })

                let queryStr = `select d.* from tbl_erc_productivetaskdetail d
                    left join tbl_erc_productivetask t on (d.productivetask_id=t.productivetask_id and t.state=1)
                    where d.state=1 and t.productivetask_code=?`
                let ptDetail = await sequelize.query(queryStr, {
                    replacements: [productivetask_code],
                    type: sequelize.QueryTypes.SELECT
                });
                //生产计划的投料信息（天）
                for (let p of ptDetail) {
                    let addPPmasterPTDetail = await tb_ppmasterptdetail.create({
                        productivetask_id: p.productivetask_id,
                        materiel_id: p.materiel_id,
                        domain_id: p.domain_id,
                        ppmaster_id: addPPMasterOne.ppmaster_id,
                        productivetaskdetail_id: p.productivetaskdetail_id,
                        taskdetaildesign_number: ppmaster_produce_number * p.design_number,
                        reality_number: ppmaster_produce_number * p.design_number,
                        taskdetailprd_level: p.taskdetailprd_level
                    })
                }
            }

            dataI++
        }
    } catch (error) {
        throw error
    }
}
// 查询指定日期/车间/工序的排产情况
async function getPPMasterOne(e) {
    try {
        let replacements = []
        let queryStr = `select ppmaster_date,ppmaster_reality_capacity,sum(ppmaster_produce_number) as sumProduceNumber
            from tbl_erc_ppmaster where state = 1 and domain_id = ? and ppmaster_department_id = ? and ppmaster_procedure_id = ? and ppmaster_date = ?
            group by ppmaster_date,ppmaster_reality_capacity`
        replacements.push(e.domain_id)
        replacements.push(e.department_id)
        replacements.push(e.procedure_id)
        replacements.push(e.ppmaster_date)
        let PPMasterOne = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        return PPMasterOne
    } catch (error) {
        throw error
    }
}
// 返回星期
async function checkDay(day) {
    let weekDay = moment(day).format('d')
    return weekDay
}
// get实施库存 将占用的库存绑定销售订单
async function checkInventory(allDemand) {
    let queryStr, replacements = [],
        netDemandAmount = 0; //netDemandAmount代表缺少的数量
    //判断库存
    queryStr = `select s.* from tbl_erc_stockmap s,tbl_erc_warehouse w,tbl_erc_basetypedetail bd 
        where s.state=1 and w.state=1 and bd.state=1 
        and s.warehouse_id=w.warehouse_id and w.warehouse_type = bd.basetypedetail_id 
        and w.domain_id=${allDemand.nowDoaminId} and (order_id is null or order_id='') and s.materiel_id='${allDemand.materiel_id}' 
        and bd.typedetail_name not in ('不良品仓','废品仓')`;
    let resultStockmap = await sequelize.query(queryStr, {
        replacements: [],
        type: sequelize.QueryTypes.SELECT
    });
    if (resultStockmap && resultStockmap.length > 0) {
        let alreadyNum = 0;
        for (let sm of resultStockmap) {
            if (allDemand.demand_amount - alreadyNum < sm.current_amount) {
                await tb_stockmap.update({
                    order_id: allDemand.order_id,
                    current_amount: allDemand.demand_amount - alreadyNum,
                    is_idle_stock: 0
                }, {
                    where: {
                        stockmap_id: sm.stockmap_id
                    }
                });
                await tb_stockmap.create({
                    domain_id: sm.domain_id,
                    warehouse_id: sm.warehouse_id,
                    materiel_id: sm.materiel_id,
                    warehouse_zone_id: sm.warehouse_zone_id,
                    current_amount: sm.current_amount - (allDemand.demand_amount - alreadyNum),
                    materiel_bar_code: '',
                    is_idle_stock: 1
                });
                alreadyNum += allDemand.demand_amount;
                break
            } else {
                await tb_stockmap.update({
                    order_id: allDemand.order_id,
                    is_idle_stock: 0
                }, {
                    where: {
                        stockmap_id: sm.stockmap_id
                    }
                });
                alreadyNum += sm.current_amount;
            }
        }
        netDemandAmount = allDemand.demand_amount - alreadyNum
    } else {
        netDemandAmount = allDemand.demand_amount
    }

    return netDemandAmount
}

async function ppMaster(params) {
    //生产计划  produce plan
    /*  ************关联关系************
        tbl_erc_productdevice           生产设备总表
            productdevice_id    ID

        tbl_erc_productionprocedure     工序总表
            procedure_id        ID

        tbl_erc_department              车间总表
            department_id       ID

        tbl_erc_productplan             生产规划
            product_id          ID

        tbl_erc_departmentprocedure     车间<->工序
            department_id = tbl_erc_department.department_id            车间
            procedure_id = tbl_erc_productionprocedure.procedure_id     工序

        tbl_erc_productplanprocedure    生产规划<->工序
            product_plann_id = tbl_erc_productplan.product_id           产品规划
            procedure_id =  tbl_erc_productionprocedure.procedure_id    工序

        tbl_erc_productproceduredevice  工序<->生产设备
            productprocedure_id = tbl_erc_productionprocedure.procedure_id  工序
            productdevice_id = tbl_erc_productdevice.fixedassetsdetail_id   生产设备

        tbl_erc_productivetask          生产任务表
            department_id = tbl_erc_department.department_id              车间
            procedure_id = tbl_erc_productionprocedure.procedure_id     工序

        ************数据库初始化************
        delete from tbl_erc_productdevice;	                            设备
        delete from tbl_erc_productionprocedure;                        工序
        delete from tbl_erc_department;                                 车间
        delete from tbl_erc_productplan;                                产品规划
        delete from tbl_erc_departmentprocedure;                        车间<->工序
        delete from tbl_erc_productplanprocedure;                       产品规划<->工序
        delete from tbl_erc_productproceduredevice;                     工序<->设备
        delete from tbl_erc_order;                                      订单
        delete from tbl_erc_ordermateriel;                              订单明细
        delete from tbl_erc_suppliermateriel;                           供应商物料明细
        delete from tbl_erc_supplier;                                   供应商
        delete from tbl_common_domain where domain_id not in (55,1)

        delete from tbl_erc_alldemand;                  主计划
        delete from tbl_erc_netdemand;                  日计划
        delete from tbl_erc_productivetask;             生产任务
        delete from tbl_erc_productivetaskdetail;       生产任务的投料
        delete from tbl_erc_purchaseorder;              采购单
        delete from tbl_erc_purchasedetail;             采购单明细
        delete from tbl_erc_purchaseapply;              采购申请单
        delete from tbl_erc_purchaseapplydetail;        采购申请单明细
        delete from tbl_erc_stockmap;                   库存
        delete from tbl_erc_inventoryaccount;           出入库流水
        delete from tbl_erc_ppmaster;                   排产主计划
        delete from tbl_erc_ppmasterptdetail;           排产计划（每日）的投料
    */
    try {
        let queryStr = '',
            replacements = [],
            search_date_begin = "", //排产查询的起始日期
            PPMasterOne = {}, //指定日期的排产情况
            maxDateByNowLevel = "" //当前级别的最大排产日期

        //*************************排产前的准备**************************/

        //每个车间/工序的理论产能
        //主辅设备不为0，取最小产能，都为0
        replacements = []
        queryStr = `
            SELECT
                dp.department_id, d.department_name,dp.procedure_id ,pp.procedure_name,
                sum(if(p.device_level=1,p.day_capacity,0)) as sumDayCapacityZ,
                sum(if(p.device_level=2,p.day_capacity,0)) as sumDayCapacityF
            FROM
                tbl_erc_productdevice p
                LEFT JOIN tbl_erc_productproceduredevice ppd ON (p.fixedassetsdetail_id = ppd.productdevice_id AND ppd.state = 1)
                LEFT JOIN tbl_erc_departmentprocedure dp ON (ppd.productprocedure_id = dp.procedure_id AND dp.state = 1)
                LEFT JOIN tbl_erc_department d ON (d.department_id = dp.department_id AND d.state = 1)
                LEFT JOIN tbl_erc_productionprocedure pp ON (pp.procedure_id = dp.procedure_id AND pp.state = 1)
            WHERE
                p.state = 1 AND p.domain_id =?
            GROUP BY
                dp.department_id, d.department_name,dp.procedure_id ,pp.procedure_name`
        replacements = [params.nowDoaminId]
        let DPtheoryNumAll = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        for (let d of DPtheoryNumAll) {
            if (d.sumDayCapacityZ == 0 && d.sumDayCapacityF == 0) {
                d.sumDayCapacityTheory = 0
            } else {
                if (d.sumDayCapacityZ == 0) {
                    d.sumDayCapacityTheory = d.sumDayCapacityF
                } else if (d.sumDayCapacityF == 0) {
                    d.sumDayCapacityTheory = d.sumDayCapacityZ
                } else {
                    d.sumDayCapacityTheory = d.sumDayCapacityZ <= d.sumDayCapacityF ? d.sumDayCapacityZ : d.sumDayCapacityF
                }
            }
        }


        //生产任务单 按销售单号汇总，每个销售单号中按级别倒序
        // todo 这里缺少订单的交货时间，早交货的订单应排在前边
        let PTGroupOrder = []
        let PTGroupOrderRes = await tb_productivetask.findAll({
            attributes: ['order_id'],
            group: 'order_id',
            where: {
                state: 1,
                domain_id: params.nowDoaminId,
                productivetask_state: 1,
                outsource_sign: 1
            }
        })


        for (let ptgo of PTGroupOrderRes) {
            replacements = []
            let PTByOrder = await tb_productivetask.findAll({
                where: {
                    state: 1,
                    domain_id: params.nowDoaminId,
                    productivetask_state: 1,
                    outsource_sign: 1,
                    order_id: ptgo.order_id
                },
                order: [
                    ['product_level']
                ]
            })
            let list = '',
                data = [{
                    level: '',
                    levelItem: []
                }]
            for (let ptbo of PTByOrder) {
                if (data[data.length - 1].level == ptbo.product_level) {
                    data[data.length - 1].levelItem.push(ptbo);
                } else {
                    data.push({
                        level: ptbo.product_level,
                        levelItem: []
                    })
                    data[data.length - 1].levelItem.push(ptbo);
                }
            }
            data = data.sort(compareDesc('level'))
            PTGroupOrder.push({
                order_id: ptgo.order_id,
                pt_item: data
            })
        }

        console.log(PTGroupOrder);

        //查询公司信息，获得双休，单休
        let company = await tb_company.findOne({
            where: {
                state: 1,
                domain_id: params.nowDoaminId
            }
        })
        //*************************排产**************************/
        // 生产任务单按订单分组，先排产一个订单，再排产下一个订单
        for (let ptgo of PTGroupOrder) { //  订单
            //级别的结束日期，如果该变量为'',则代表该订单的最大级别的生产任务单尚未排产，每个级别的任务单结束后，将该级别排产的最大日期赋给该变量
            //最大级别的任务单按对用车间/工序确定排产起始日期
            let endPPDateByLevel = ''
            for (let pi of ptgo.pt_item) { //  级别
                maxDateByNowLevel = '1970-01-01'
                for (let pt of pi.levelItem) { //  生产任务单  某个级别下有多个任务单
                    let taskdesignNumber = pt.taskdesign_number //本次排产总数量
                    //1 确定车间/工序理论产能
                    let DPtheoryNumOne = DPtheoryNumAll.find(function (e) {
                        if (e.department_id == pt.department_id && e.procedure_id == pt.procedure_id) {
                            return e
                        }
                    });

                    if (!endPPDateByLevel) {
                        //2 查询产能占用，确定将该生产任务单的排产起始日期
                        replacements = []
                        queryStr = `select max(ppmaster_date) as maxPPMasterData 
                            from tbl_erc_ppmaster 
                            where state = 1 and domain_id = ? and ppmaster_department_id = ? and ppmaster_procedure_id = ? and ppmaster_date >= ?`
                        replacements.push(params.nowDoaminId)
                        replacements.push(pt.department_id)
                        replacements.push(pt.procedure_id)
                        replacements.push(moment().format("YYYY-MM-DD"))
                        let maxData = await sequelize.query(queryStr, {
                            replacements: replacements,
                            type: sequelize.QueryTypes.SELECT
                        });
                        if (!maxData[0].maxPPMasterData) { //该工序在今天之后尚未有排产
                            search_date_begin = moment().format("YYYY-MM-DD")
                        } else {
                            PPMasterOne = await getPPMasterOne({
                                department_id: pt.department_id,
                                procedure_id: pt.procedure_id,
                                ppmaster_date: maxData[0].maxPPMasterData,
                                domain_id: params.nowDoaminId
                            })
                            if (Number(PPMasterOne[0].sumProduceNumber) >= Number(PPMasterOne[0].ppmaster_reality_capacity)) { //如果最后一天已排满，则安排在最大排产日的第二天 （手动修改主计划，会造成实际排产数量大于实际产能）
                                search_date_begin = moment(PPMasterOne[0].ppmaster_date).add(1, "days").format("YYYY-MM-DD")
                            } else {
                                search_date_begin = moment(PPMasterOne[0].ppmaster_date).format("YYYY-MM-DD")
                            }
                        }
                    } else {
                        search_date_begin = moment(endPPDateByLevel).format('YYYY-MM-DD')
                    }

                    //3 查询该生产任务的投料    用于保存每天的生产计划的投料
                    let ptDetail = await tb_productivetaskdetail.findAll({
                        where: {
                            state: 1,
                            productivetask_id: pt.productivetask_id
                        }
                    })

                    //4 排产
                    let dataI = 0
                    while (Number(taskdesignNumber) > 0) {
                        let ppmaster_holiday_capacity = 0 //节日影响日产能
                        let ppmaster_repairs_capacity = 0 //保修影响日产能
                        let ppmaster_produce_number = 0 //本次排产数量
                        let ppmaster_reality_capacity = 0 //本次排产的实际产能
                        let ppMasterDate = moment(search_date_begin).add(Number(dataI), "days").format("YYYY-MM-DD") //本次排产日期

                        if (company.company_dayoff_type == 0) { //单休
                            let getWeekDay = await checkDay(ppMasterDate)
                            if (getWeekDay == 0) {
                                ppmaster_holiday_capacity = -DPtheoryNumOne.sumDayCapacityTheory
                            }
                        } else if (company.company_dayoff_type == 1) { //双休
                            let getWeekDay = await checkDay(ppMasterDate)
                            if (getWeekDay == 6 || getWeekDay == 0) {
                                ppmaster_holiday_capacity = -DPtheoryNumOne.sumDayCapacityTheory
                            }
                        }

                        ppmaster_reality_capacity = Number(DPtheoryNumOne.sumDayCapacityTheory) + Number(ppmaster_holiday_capacity) + Number(ppmaster_repairs_capacity)
                        //非节假日，但日产能==0的。退出循环，
                        if (ppmaster_reality_capacity <= 0 && ppmaster_holiday_capacity == 0) {
                            break
                        }

                        if (Number(ppmaster_holiday_capacity) < 0) {
                            ppmaster_produce_number = 0
                        } else {
                            // 查询当日的排产中，已占用多少
                            PPMasterOne = await getPPMasterOne({
                                department_id: pt.department_id,
                                procedure_id: pt.procedure_id,
                                ppmaster_date: ppMasterDate,
                                domain_id: params.nowDoaminId
                            })
                            if (PPMasterOne.length == 0) {
                                if (taskdesignNumber >= ppmaster_reality_capacity) {
                                    ppmaster_produce_number = ppmaster_reality_capacity
                                    taskdesignNumber -= ppmaster_produce_number
                                } else {
                                    ppmaster_produce_number = taskdesignNumber
                                    taskdesignNumber = 0
                                }
                            } else {

                                if (taskdesignNumber >= (ppmaster_reality_capacity - PPMasterOne[0].sumProduceNumber)) {
                                    ppmaster_produce_number = ppmaster_reality_capacity - PPMasterOne[0].sumProduceNumber
                                    taskdesignNumber -= ppmaster_produce_number
                                } else {
                                    ppmaster_produce_number = taskdesignNumber
                                    taskdesignNumber = 0
                                }
                            }
                        }

                        //排产计划（天）
                        let addPPMasterOne = await tb_ppmaster.create({
                            productivetask_code: pt.productivetask_code, //生产任务单号
                            domain_id: params.nowDoaminId,
                            ppmaster_date: ppMasterDate, //日期
                            ppmaster_department_id: pt.department_id, //车间
                            ppmaster_procedure_id: pt.procedure_id, //工序
                            ppmaster_m_equipment_capacity: DPtheoryNumOne.sumDayCapacityZ, //主设备每小时产能
                            ppmaster_a_equipment_capacity: DPtheoryNumOne.sumDayCapacityF, //辅设备每小时产能
                            ppmaster_work_duration: 1, //作业小时数
                            ppmaster_theory_capacity_day: DPtheoryNumOne.sumDayCapacityTheory, //理论日产能
                            ppmaster_holiday_capacity: ppmaster_holiday_capacity, //节假日影响的产能 负数
                            ppmaster_repairs_capacity: ppmaster_repairs_capacity, //报修影响的产能 负数
                            ppmaster_reality_capacity: ppmaster_reality_capacity, //实际产能
                            ppmaster_produce_number: ppmaster_produce_number, //排产数量
                            ppmaster_residue_number: taskdesignNumber, //剩余排产数量，最后应为0
                            ppmaster_check_materiel_state: 0, //日计划检查物料状态   0待清查、1物料不齐全、2物料齐全
                            ppmaster_check_device_state: 0, //日计划检查设备状态
                            ppmaster_check_person_state: 0 //日计划检查人员状态
                        })


                        //生产计划的投料信息（天）
                        for (let p of ptDetail) {
                            let addPPmasterPTDetail = await tb_ppmasterptdetail.create({
                                productivetask_id: p.productivetask_id,
                                materiel_id: p.materiel_id,
                                domain_id: p.domain_id,
                                ppmaster_id: addPPMasterOne.ppmaster_id,
                                productivetaskdetail_id: p.productivetaskdetail_id,
                                taskdetaildesign_number: ppmaster_produce_number * p.design_number,
                                reality_number: ppmaster_produce_number * p.design_number,
                                taskdetailprd_level: p.taskdetailprd_level
                            })
                        }
                        if (moment(ppMasterDate).isAfter(moment(maxDateByNowLevel))) {
                            maxDateByNowLevel = ppMasterDate
                        }

                        dataI++
                    }
                    //该生产任务单改为生产中
                    let update = await tb_productivetask.update({
                        productivetask_state: 2
                    }, {
                        where: {
                            productivetask_id: pt.productivetask_id
                        }
                    });
                }
                //保存该级别下的最大排产日期
                endPPDateByLevel = maxDateByNowLevel
            }
        }
        //*************************生产任务单 end */
    } catch (error) {
        throw error;
    }
}
//----------------------------------------mrp流程：总需求，净需求，生产，采购 end-----------------------------------------

// 生成mrp生产计划  对应页面按钮
async function setPPMaster(req, res) {
    try {
        // let yesterday = moment().add('days',-1).format('YYYY-MM-DD');

        let doc = common.docTrim(req.body)
        let yesterday = doc.mrp_date;
        let beginTime = yesterday + ' 00:00:00';
        let endTime = yesterday + ' 23:59:59';
        if (doc.mrp_date == '') return;
        let params = {
            yesterday: yesterday,
            beginTime: beginTime,
            endTime: endTime
        };

        let domain = await tb_domain.findAll({
            where: {
                state: GLBConfig.ENABLE
            }
        });
        for (let d of domain) {
            params.nowDoaminId = d.domain_id;
            //mrp生产计划
            await ppMaster(params);
        }
        common.sendData(res, {});
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 生成mrp总需求  对应页面按钮
async function setAllDemand(req, res) {
    try {
        // let yesterday = moment().add('days',-1).format('YYYY-MM-DD');

        let doc = common.docTrim(req.body)
        let yesterday = doc.mrp_date;
        let beginTime = yesterday + ' 00:00:00';
        let endTime = yesterday + ' 23:59:59';
        if (doc.mrp_date == '') return;
        let params = {
            yesterday: yesterday,
            beginTime: beginTime,
            endTime: endTime
        };

        let domain = await tb_domain.findAll({
            where: {
                state: GLBConfig.ENABLE
            }
        });
        for (let d of domain) {
            params.nowDoaminId = d.domain_id;
            //mrp总需求
            await allDemand(params);
        }
        common.sendData(res, {});
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 生成 mrp总需求  对应页面按钮
async function setNetDemand(req, res) {
    try {
        // let yesterday = moment().add('days',-1).format('YYYY-MM-DD');

        let doc = common.docTrim(req.body)
        let yesterday = doc.mrp_date;
        let beginTime = yesterday + ' 00:00:00';
        let endTime = yesterday + ' 23:59:59';
        if (doc.mrp_date == '') return;
        let params = {
            yesterday: yesterday,
            beginTime: beginTime,
            endTime: endTime
        };

        let domain = await tb_domain.findAll({
            where: {
                state: GLBConfig.ENABLE
            }
        });
        for (let d of domain) {
            params.nowDoaminId = d.domain_id;
            //净需求
            await netDemand(params);
        }
        common.sendData(res, {});
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 生成 mrp总需求  对应页面按钮
async function setProduction(req, res) {
    try {
        // let yesterday = moment().add('days',-1).format('YYYY-MM-DD');

        let doc = common.docTrim(req.body)
        let yesterday = doc.mrp_date;
        let beginTime = yesterday + ' 00:00:00';
        let endTime = yesterday + ' 23:59:59';
        if (doc.mrp_date == '') return;
        let params = {
            yesterday: yesterday,
            beginTime: beginTime,
            endTime: endTime
        };

        let domain = await tb_domain.findAll({
            where: {
                state: GLBConfig.ENABLE
            }
        });
        for (let d of domain) {
            params.nowDoaminId = d.domain_id;
            //采购单
            await production(params);
        }
        common.sendData(res, {});
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 生成 mrp总需求  对应页面按钮
async function setPurchase(req, res) {
    try {
        // let yesterday = moment().add('days',-1).format('YYYY-MM-DD');
        let doc = common.docTrim(req.body)
        let yesterday = doc.mrp_date;
        let beginTime = yesterday + ' 00:00:00';
        let endTime = yesterday + ' 23:59:59';
        if (doc.mrp_date == '') return;
        let params = {
            yesterday: yesterday,
            beginTime: beginTime,
            endTime: endTime
        };

        let domain = await tb_domain.findAll({
            where: {
                state: GLBConfig.ENABLE
            }
        });
        for (let d of domain) {
            params.nowDoaminId = d.domain_id;
            //采购单
            await purchase(params);
        }
        common.sendData(res, {});
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 查询总需求列表
async function getAllDemand(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};
        let queryStr = 'select m.*,d.order_id,d.mrp_date,demand_amount ' +
            'from tbl_erc_alldemand d ' +
            'left join tbl_erc_materiel m on (d.materiel_id=m.materiel_id and m.state=1) ' +
            'where d.state=1 and d.mrp_domain_id=? ';
        replacements.push(user.domain_id);
        if (doc.search_text) {
            queryStr += ' and (materiel_code like ? or materiel_name like ? or order_id like ?)';
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
        }
        if (doc.materiel_source) {
            queryStr += ' and materiel_source=?';
            replacements.push(doc.materiel_source);
        }
        if (doc.materiel_manage) {
            queryStr += ' and materiel_manage=?';
            replacements.push(doc.materiel_manage);
        }
        if (doc.beginTime) {
            queryStr += ' and d.mrp_date>=?';
            replacements.push(doc.beginTime)
        }
        if (doc.endTime) {
            queryStr += ' and d.mrp_date<=?';
            replacements.push(doc.endTime)
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 查询净需求列表
async function getNetDemand(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};
        let queryStr = 'select m.*,d.mrp_date,d.netdemand_amount,d.order_id ' +
            'from tbl_erc_netdemand d ' +
            'left join tbl_erc_materiel m on (d.materiel_id=m.materiel_id and m.state=1) ' +
            'where d.state=1 and d.mrp_domain_id=? ';
        replacements.push(user.domain_id);
        if (doc.search_text) {
            queryStr += ' and (materiel_code like ? or materiel_name like ? or order_id like ?)';
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
        }
        if (doc.materiel_source) {
            queryStr += ' and materiel_source=?';
            replacements.push(doc.materiel_source);
        }
        if (doc.management_model) {
            queryStr += ' and management_model=?';
            replacements.push(doc.management_model);
        }
        if (doc.beginTime) {
            queryStr += ' and d.mrp_date>=?';
            replacements.push(doc.beginTime)
        }
        if (doc.endTime) {
            queryStr += ' and d.mrp_date<=?';
            replacements.push(doc.endTime)
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            // result.mrp_date = r.mrp_date.Format("yyyy-MM-dd");
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 查询采购列表
async function getPurchaseOrder(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};
        let queryStr = `select p.biz_code,p.purchaseorder_id,s.supplier_name,s.supplier,p.created_at,d.domain_name as order_domain,dd.domain_name as purchase_domain
            from tbl_erc_purchaseorder p
            left join tbl_erc_supplier s on (p.supplier_id=s.supplier_id and s.state=1)
            left join tbl_common_domain d on (p.order_domain_id=d.domain_id and d.state=1)
            left join tbl_common_domain dd on (p.purchaseorder_domain_id=dd.domain_id and dd.state=1)
            where p.state=1 and p.purchaseorder_domain_id=? `;
        replacements.push(user.domain_id);
        if (doc.supplier_id) {
            queryStr += ' and p.supplier_id = ?';
            replacements.push(doc.supplier_id);
        }
        if (doc.purchaseorder_id) {
            queryStr += ' and purchaseorder_id like ?';
            replacements.push('%' + doc.purchaseorder_id + '%');
        }
        if (doc.search_text) {
            queryStr += ' and purchaseorder_id like ?';
            replacements.push('%' + doc.search_text + '%');
        }

        if (doc.beginTime) {
            queryStr += ' and created_at>=?';
            replacements.push(doc.beginTime + ' 00:00:00')
        }
        if (doc.endTime) {
            queryStr += ' and created_at<=?';
            replacements.push(doc.endTime + ' 23:59:59')
        }
        queryStr += ' order by purchaseorder_id';
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at.Format("yyyy-MM-dd");
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 增加采购单
async function addPuchaseApply(req, res) {
    let doc = common.docTrim(req.body),
        user = req.user;

    try {
        let applyID = await Sequence.genPurchaseApplyID(user.domain_id);
        let create = await tb_purchaseapply.create({
            purchaseapply_id: applyID,
            app_domain_id: user.domain_id,
            apply_state: 0,
            apply_approver: doc.apply_approver,
            apply_applicant: user.user_id
        });
        common.sendData(res, create);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 查询采购单列表
async function getPuchaseApply(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};
        let queryStr = `select a.purchaseapply_id,a.apply_state,a.approval_date,a.created_at,
             ap.username as apply_applicant,av.username as apply_approver,a.description,a.order_type 
             from tbl_erc_purchaseapply a
             left join tbl_common_user ap on (a.apply_applicant=ap.user_id and ap.state=1)
             left join tbl_common_user av on (a.apply_approver=av.user_id and av.state=1)
             where a.state=1 and app_domain_id=? `;
        replacements.push(user.domain_id);
        if (doc.purchaseapply_id) {
            queryStr += ' and a.purchaseapply_id=?';
            replacements.push(doc.purchaseapply_id)
        }
        if (doc.apply_state) {
            queryStr += ' and a.apply_state=?';
            replacements.push(doc.apply_state)
        }
        if (doc.beginDate) {
            queryStr += ' and a.created_at>=?';
            replacements.push(doc.beginDate)
        }
        if (doc.endDate) {
            queryStr += ' and a.created_at<=?';
            replacements.push(doc.endDate)
        }
        if (doc.search_text) {
            queryStr += ' and purchaseapply_id like ?';
            replacements.push('%' + doc.search_text + '%');
        }
        queryStr += ' order by purchaseapply_id desc'
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at.Format("yyyy-MM-dd");
            result.approval_date = (r.approval_date) ? r.approval_date.Format("yyyy-MM-dd") : '';
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 删除采购单
async function deletePurchaseApply(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        let deletePurchaseApply = await tb_purchaseapply.findOne({
            where: {
                purchaseapply_id: doc.purchaseapply_id
            }
        });
        if (deletePurchaseApply) {
            deletePurchaseApply.state = GLBConfig.DISABLE;
            await deletePurchaseApply.save()
        } else {
            common.sendError(res, 'puchase_apply_03');
            return
        }
        common.sendData(res, deletePurchaseApply);

    } catch (error) {
        return common.sendFault(res, error);
    }
}
// 初始化基础数据
async function initAct(req, res) {
    try {
        let returnData = {};
        await FDomain.getDomainListInit(req, returnData);
        returnData.batchInfo = GLBConfig.BATCHINFO; //批次
        returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'); //单位
        returnData.mateUseState = GLBConfig.MATEUSESTATE; //单位
        returnData.materielSource = GLBConfig.MATERIELSOURCE; //物料来源
        returnData.materielManage = GLBConfig.MATERIELMANAGE; //管理模式
        returnData.materielSourceKind = GLBConfig.MATERIELSOURCEKIND; //来源分类
        returnData.purchaseApplyType = GLBConfig.PURCHASEAPPLYSTATE; //申请单状态
        returnData.user = [];
        let user1 = req.user;
        let userDate = await tb_user.findAll({
            where: {
                state: GLBConfig.ENABLE,
                domain_id: user1.domain_id
            }
        });
        for (let u of userDate) {
            returnData.user.push({
                id: u.user_id,
                text: u.name,
                value: u.user_id
            })
        }
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 查询供应商名称
async function getSupplerUser(req, res) {
    try {
        let returnData = {};
        returnData.thirdUser = await tb_thirdsignuser.findOne({
            where: {
                user_id: req.user.user_id
            }
        });
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
    }
}
async function getStockAVGPrice(product_id, level) {
    let queryStr, replacements = [],
        productDetailPrice = 0;
    // 产品单价 = 下级投料的库存平均单价总和+工序金额*工价系数

    // 下级投料的库存平均单价总和
    queryStr = `select min(store_price) as min_store_price,s.materiel_id 
            from tbl_erc_stockmap s,tbl_erc_productplandetail p 
            where s.state=1 and p.state=1 and s.materiel_id=p.src_materiel_id 
            and p.product_plan_id=?  and prd_level=?
            group by s.materiel_id `;
    replacements.push(product_id);
    replacements.push(level);
    let result = await sequelize.query(queryStr, {
        replacements: replacements,
        type: sequelize.QueryTypes.SELECT
    });
    if (result && result.length > 0) {
        for (let r of result) {
            productDetailPrice += r.min_store_price

            replacements = [];
            queryStr = `select p.procedure_cost,p.procedure_coefficient 
                from tbl_erc_productionprocedure p,tbl_erc_productplanprocedure pd 
                where p.state=1 and pd.state=1 and p.procedure_id=pd.procedure_id 
                and pd.product_plan_id=? and rlt_materiel_code=? `
            replacements.push(product_id)
            replacements.push(r.materiel_id)
            let resultP = await sequelize.query(queryStr, {
                replacements: replacements,
                type: sequelize.QueryTypes.SELECT
            });
            for (let rp of resultP) {
                productDetailPrice += rp.procedure_cost * rp.procedure_coefficient
            }
        }
    }
    return productDetailPrice
}

function compareUnDescTime() {
    return function (a, b) {
        moment(a).isBefore(moment(b))
        // return moment(b) - moment(a);
    }
}

function compareUnDesc() {
    return function (a, b) {
        return b - a;
    }
}

function compareUn() {
    return function (a, b) {
        return a - b;
    }
}

function compareDesc(property) {
    return function (a, b) {
        var value1 = a[property];
        var value2 = b[property];
        return value2 - value1;
    }
}

function compare(property) {
    return function (a, b) {
        var value1 = a[property];
        var value2 = b[property];
        return value1 - value2;
    }
}
// mrp流程：总需求，净需求，生产，采购
async function dataExtract(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user

        // let yesterday = moment().add('days',-1).format('YYYY-MM-DD');
        let yesterday = doc.mrp_date;
        let beginTime = yesterday + ' 00:00:00';
        let endTime = yesterday + ' 23:59:59';

        let params = {
            yesterday: yesterday,
            beginTime: beginTime,
            endTime: endTime
        };

        let domain = await tb_domain.findAll({
            where: {
                state: GLBConfig.ENABLE
            }
        });

        for (let d of domain) {
            if (d.domain_id == 68) {
                params.nowDoaminId = d.domain_id;
                params.userDomainId = user.domain_id;
                //总需求
                await allDemand(params);
                //净需求
                await netDemand(params);
                //生产    必须在采购之前
                await production(params);
                // //生产计划
                await ppMasterNew(params)
                //采购
                await purchase(params);
            }
        }
        common.sendData(res, {});
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function deleteData(req, res) {
    let result
    queryStr = "delete from tbl_erc_alldemand "
    result = await sequelize.query(queryStr, {
        replacements: [],
        type: sequelize.QueryTypes.DELETE
    });
    queryStr = "delete from tbl_erc_netdemand "
    result = await sequelize.query(queryStr, {
        replacements: [],
        type: sequelize.QueryTypes.DELETE
    });
    queryStr = "delete from tbl_erc_productivetask"
    result = await sequelize.query(queryStr, {
        replacements: [],
        type: sequelize.QueryTypes.DELETE
    });
    queryStr = "delete from tbl_erc_productivetaskdetail"
    result = await sequelize.query(queryStr, {
        replacements: [],
        type: sequelize.QueryTypes.DELETE
    });
    queryStr = "delete from tbl_erc_purchaseorder"
    result = await sequelize.query(queryStr, {
        replacements: [],
        type: sequelize.QueryTypes.DELETE
    });
    queryStr = "delete from tbl_erc_purchasedetail"
    result = await sequelize.query(queryStr, {
        replacements: [],
        type: sequelize.QueryTypes.DELETE
    });
    queryStr = "delete from tbl_erc_purchaseapply"
    result = await sequelize.query(queryStr, {
        replacements: [],
        type: sequelize.QueryTypes.DELETE
    });
    queryStr = "delete from tbl_erc_purchaseapplydetail"
    result = await sequelize.query(queryStr, {
        replacements: [],
        type: sequelize.QueryTypes.DELETE
    });
    // queryStr = "delete from tbl_erc_stockmap "
    // result = await sequelize.query(queryStr, {
    //     replacements: [],
    //     type: sequelize.QueryTypes.DELETE
    // });
    // queryStr = "delete from tbl_erc_inventoryaccount"
    // result = await sequelize.query(queryStr, {
    //     replacements: [],
    //     type: sequelize.QueryTypes.DELETE
    // });
    queryStr = "delete from tbl_erc_ppmaster"
    result = await sequelize.query(queryStr, {
        replacements: [],
        type: sequelize.QueryTypes.DELETE
    });
    queryStr = "delete from tbl_erc_ppmasterptdetail"
    result = await sequelize.query(queryStr, {
        replacements: [],
        type: sequelize.QueryTypes.DELETE
    });
    common.sendData(res, {});

}