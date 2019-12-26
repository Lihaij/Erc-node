const common = require('../../../util/CommonUtil');
const logger = require('../../../util/Logger').createLogger('ERCTaxStatementControlSRV');
const model = require('../../../model');
const GLBConfig = require('../../../util/GLBConfig');

const sequelize = model.sequelize;

const tb_productivetaskdetail = model.erc_productivetaskdetail;
const tb_stockmap = model.erc_stockmap;
const tb_materiel = model.erc_materiel;

exports.ERCCostAnalysisControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'initCostAnalysis') {
        await initCostAnalysis(req, res);
    } else if (method === 'getOrderMaterielCostAnalysis') {
        await getOrderMaterielCostAnalysis(req, res);
    } else if (method === 'getOrderLabourCostAnalysis') {
        await getOrderLabourCostAnalysis(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

async function initCostAnalysis(req, res) {
    const { body, user } = req;
    const returnData = {};

    try {
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

function checkCurrentDate() {
    const curDate = new Date();
    const month = curDate.getMonth() + 1;
    return `${curDate.getFullYear()}-${month < 10 ? '0' + month : month}`;
}

async function getOrderMaterielCostAnalysis(req, res) {
    const { body, user } = req;
    const returnData = {};

    try {
        const { analysis_date } = body;
        const { domain_id } = user;

        let queryStr =
            `select
                productivetask_id, productivetask_code, product_id
                from tbl_erc_productivetask
                where true
                and domain_id = ?`;

        const replacements = [domain_id];

        queryStr += ` and stock_in_state = ?`;
        replacements.push(3);

        if (analysis_date) {
            if (analysis_date > checkCurrentDate()) {
                return common.sendError(res, 'analysis_01');
            } else {
                queryStr += ` and DATE_FORMAT(updated_at,'%Y-%m') = ?`;
                replacements.push(analysis_date);
            }
        } else {
            queryStr += ` and DATE_FORMAT(updated_at,'%Y-%m') = DATE_FORMAT(CURRENT_TIMESTAMP,'%Y-%m')`;
        }

        const productiveTaskList = await common.simpleSelect(sequelize, queryStr, replacements);

        let planNumber = 0;
        let actualNumber = 0;
        let offerPlanPrice = 0;
        let offerActualPrice = 0;
        let budgetPlanPrice = 0;
        let budgetActualPrice = 0;
        for (const productiveTask of productiveTaskList) {
            const { productivetask_id } = productiveTask;
            const productiveDetailList = await tb_productivetaskdetail.findAll({
                where: {
                    productivetask_id
                }
            });

            let itemPlanNumber = 0;
            let itemActualNumber = 0;
            let itemOfferPlanPrice = 0;
            let itemOfferActualPrice = 0;
            let itemBudgetPlanPrice = 0;
            let itemBudgetActualPrice = 0;

            // 取得生产任务单的物料
            for (const productiveDetail of productiveDetailList) {
                const { materiel_id, taskdetaildesign_number, taskdetailprd_batch } = productiveDetail;
                if (taskdetailprd_batch > 1) {
                    actualNumber += taskdetaildesign_number;
                    itemActualNumber += taskdetaildesign_number;
                } else {
                    planNumber += taskdetaildesign_number;
                    itemPlanNumber += taskdetaildesign_number;
                }

                const stockMap = await tb_stockmap.findOne({
                    where: {
                        materiel_id,
                        domain_id
                    }
                });
                if (stockMap && stockMap.store_price) {
                    if (taskdetailprd_batch > 1) {
                        offerActualPrice += (stockMap.store_price * taskdetaildesign_number);
                        itemOfferActualPrice += (stockMap.store_price * taskdetaildesign_number);
                    } else {
                        offerPlanPrice += (stockMap.store_price * taskdetaildesign_number);
                        itemOfferPlanPrice += (stockMap.store_price * taskdetaildesign_number);
                    }
                }

                const materielData = await tb_materiel.findOne({
                    where: {
                        materiel_id,
                        domain_id
                    }
                });
                if (materielData && materielData.materiel_cost) {
                    if (taskdetailprd_batch > 1) {
                        budgetActualPrice += (materielData.materiel_cost * taskdetaildesign_number);
                        itemBudgetActualPrice += (materielData.materiel_cost * taskdetaildesign_number);
                    } else {
                        budgetPlanPrice += (materielData.materiel_cost * taskdetaildesign_number);
                        itemBudgetPlanPrice += (materielData.materiel_cost * taskdetaildesign_number);
                    }
                }
            }

            productiveTask.itemPlanNumber = itemPlanNumber;
            productiveTask.itemActualNumber = itemActualNumber + itemPlanNumber;

            productiveTask.itemOfferPlanPrice = itemOfferPlanPrice;
            productiveTask.itemOfferActualPrice = itemOfferActualPrice + itemOfferPlanPrice;

            productiveTask.itemBudgetPlanPrice = itemBudgetPlanPrice;
            productiveTask.itemBudgetActualPrice = itemBudgetActualPrice + itemBudgetPlanPrice;
        }

        returnData.productiveTaskList = productiveTaskList;

        actualNumber += planNumber;
        offerActualPrice += offerPlanPrice;
        budgetActualPrice += budgetPlanPrice;

        returnData.costAnalysis = [
            {
                title: '已完工生产任务单物料数量对比',
                plan: planNumber,
                actual: actualNumber,
                diff: actualNumber - planNumber
            },
            {
                title: '按供应商报价计算的已完工生产任务单物料金额对比（元）',
                plan: offerPlanPrice,
                actual: offerActualPrice,
                diff: offerActualPrice - offerPlanPrice
            },
            {
                title: '按预算价计算的已完工生产任务单物料金额对比（元）',
                plan: budgetPlanPrice,
                actual: budgetActualPrice,
                diff: budgetActualPrice - budgetPlanPrice
            },
        ];

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getOrderLabourCostAnalysis(req, res) {
    const { body, user } = req;
    const returnData = {};

    try {
        const { analysis_date } = body;
        const { domain_id } = user;

        let queryStr =
            `select
                productivetask_id, productivetask_code, product_id, materiel_id
                from tbl_erc_productivetask
                where true
                and domain_id = ?`;

        const replacements = [domain_id];

        queryStr += ` and stock_in_state = ?`;
        replacements.push(3);

        if (analysis_date) {
            if (analysis_date > checkCurrentDate()) {
                return common.sendError(res, 'analysis_01');
            } else {
                queryStr += ` and DATE_FORMAT(updated_at,'%Y-%m') = ?`;
                replacements.push(analysis_date);
            }
        } else {
            queryStr += ` and DATE_FORMAT(updated_at,'%Y-%m') = DATE_FORMAT(CURRENT_TIMESTAMP,'%Y-%m')`;
        }

        const productiveTaskList = await common.simpleSelect(sequelize, queryStr, replacements);

        let procedurePlanNumber = 0;
        let procedurePlanPrice = 0;

        for (const productiveTask of productiveTaskList) {
            const { product_id, materiel_id } = productiveTask;

            const procedureQueryStr =
                `select
                    count(*) as count, sum(ppc.procedure_cost) as price
                    from tbl_erc_productplanprocedure ppp
                    left join tbl_erc_productionprocedure ppc
                    on ppp.procedure_id = ppc.procedure_id
                    where true
                    and ppp.product_plan_id = ?
                    and ppp.rlt_materiel_code = ?`;

            const procedureList = await common.simpleSelect(sequelize, procedureQueryStr, [product_id, materiel_id]);

            let itemProcedurePlanNumber = 0;
            let itemProcedurePlanPrice = 0;

            for (const procedure of procedureList) {
                const { count, price } = procedure;
                if (count > 0) {
                    procedurePlanNumber += count;
                    procedurePlanPrice += price;

                    itemProcedurePlanNumber += count;
                    itemProcedurePlanPrice += price;
                }
            }

            productiveTask.itemProcedurePlanNumber = itemProcedurePlanNumber;
            productiveTask.itemProcedurePlanPrice = itemProcedurePlanPrice;
        }

        returnData.productiveTaskList = productiveTaskList;

        //取得人工派单
        let secondQueryStr =
            `select
                pdn.productdesignate_code, pdn.productdesignate_number, ppc.procedure_cost
                from tbl_erc_productdesignate pdn
                left join tbl_erc_productionprocedure ppc
                on pdn.productdesignate_procedure_id = ppc.procedure_id
                where true
                and pdn.domain_id = ?
                and pdn.productdesignate_date = ?`;

        const secondReplacements = [domain_id, 1];

        if (analysis_date) {
            if (analysis_date > checkCurrentDate()) {
                return common.sendError(res, 'analysis_01');
            } else {
                secondQueryStr += ` and DATE_FORMAT(pdn.productdesignate_date,'%Y-%m') = ?`;
                secondReplacements.push(analysis_date);
            }
        } else {
            secondQueryStr += ` and DATE_FORMAT(pdn.productdesignate_date,'%Y-%m') = DATE_FORMAT(CURRENT_TIMESTAMP,'%Y-%m')`;
        }

        const productDesignNateList = await common.simpleSelect(sequelize, secondQueryStr, secondReplacements);

        let procedureActualNumber = 0;
        let procedureActualPrice = 0;

        for (const productDesignNate of productDesignNateList) {
            const { productdesignate_number, procedure_cost } = productDesignNate;
            procedureActualNumber += productdesignate_number;
            procedureActualPrice += procedure_cost;
        }

        returnData.productDesignNateList = productDesignNateList;

        returnData.costAnalysis = [
            {
                title: '已完工生产任务单人工工序数量对比',
                plan: procedurePlanNumber,
                actual: procedurePlanNumber + procedureActualNumber,
                diff: procedureActualNumber
            },
            {
                title: '已完工生产任务单人工金额对比（元）',
                plan: procedurePlanPrice,
                actual: procedurePlanPrice + procedureActualPrice,
                diff: procedureActualPrice
            },
        ];

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
