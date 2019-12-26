const common = require('../../../util/CommonUtil');
const logger = require('../../../util/Logger').createLogger('ERCTaxStatementControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const { CODE_NAME, genBizCode } = require('../../../util/BizCodeUtil');

const moment = require('moment');
const sequelize = model.sequelize;

const tb_profit = model.erc_profit;

exports.ERCProfitManagerControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'initData') {
        await initData(req, res);
    } else if (method === 'genProfitData') {
        await genProfitData(req, res);
    } else if (method === 'getProfitDataList') {
        await getProfitDataList(req, res);
    } else if (method === 'getProfitDataInfo') {
        await getProfitDataInfo(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

async function initData(req, res) {
    const body = req.body;
    const user = req.user;
    const returnData = {};

    try {
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getProfitIdByDate(req, domainId, queryDate) {
    const queryStr =
        `select
            profit_id
            from tbl_erc_profit
            where true
            and domain_id = ?
            and DATE_FORMAT(created_at,'%Y-%m') = DATE_FORMAT(?,'%Y-%m')`;

    const result = await common.querySimple(sequelize, req, queryStr, [domainId, queryDate]);
    if (result.data && result.data.length > 0) {
        const [ data ] = result.data;
        const { profit_id } = data;
        return profit_id || 0;
    }
    return 0;
}

async function getBusinessIncome(req, domainId, queryDate) {
    const queryStr =
        `select
            sum(recordingvoucherdetailsc_credit) as cost, DATE_FORMAT(created_at,'%Y-%m') as date
            from tbl_erc_recordingvoucherdetailsc
            where true
            and domain_id = ?
            and recordingvouchersc_id > 0
            and (recordingvoucherdetailsc_accsum_code = ? or recordingvoucherdetailsc_accsum_code = ?)
            and recordingvoucherdetailsc_type = ?
            and DATE_FORMAT(created_at,'%Y-%m') = DATE_FORMAT(?,'%Y-%m')
            group by DATE_FORMAT(created_at,'%Y-%m')`;

    const result = await common.querySimple(sequelize, req, queryStr, [domainId, 6001, 6051, 0, queryDate]);
    if (result.data && result.data.length > 0) {
        const [ data ] = result.data;
        const { cost } = data;
        return cost || 0;
    }
    return 0;
}

async function getBusinessCost(req, domainId, queryDate) {
    const queryStr =
        `select
            sum(recordingvoucherdetailsc_debite) as cost, DATE_FORMAT(created_at,'%Y-%m') as date
            from tbl_erc_recordingvoucherdetailsc
            where true
            and domain_id = ?
            and recordingvouchersc_id > 0
            and (recordingvoucherdetailsc_accsum_code = ? or recordingvoucherdetailsc_accsum_code = ?)
            and recordingvoucherdetailsc_type = ?
            and DATE_FORMAT(created_at,'%Y-%m') = DATE_FORMAT(?,'%Y-%m')
            group by DATE_FORMAT(created_at,'%Y-%m')`;

    const result = await common.querySimple(sequelize, req, queryStr, [domainId, 6401, 6402, 1, queryDate]);
    if (result.data && result.data.length > 0) {
        const [ data ] = result.data;
        const { cost } = data;
        return cost || 0;
    }
    return 0;
}

async function getDebiteCost(req, domainId, costCode, queryDate) {
    const queryStr =
        `select
            sum(recordingvoucherdetailsc_debite) as cost
            , DATE_FORMAT(created_at,'%Y-%m') as date
            from tbl_erc_recordingvoucherdetailsc
            where true
            and domain_id = ?
            and recordingvouchersc_id > 0
            and recordingvoucherdetailsc_accsum_code = ?
            and recordingvoucherdetailsc_type = ?
            and DATE_FORMAT(created_at,'%Y-%m') = DATE_FORMAT(?,'%Y-%m')
            group by DATE_FORMAT(created_at,'%Y-%m')`;

    const result = await common.querySimple(sequelize, req, queryStr, [domainId, costCode, 1, queryDate]);
    if (result.data && result.data.length > 0) {
        const [ data ] = result.data;
        const { cost } = data;
        return cost || 0;
    }
    return 0;
}

async function getCreditCost(req, domainId, costCode, queryDate) {
    const queryStr =
        `select
            sum(recordingvoucherdetailsc_credit) as cost
            , DATE_FORMAT(created_at,'%Y-%m') as date
            from tbl_erc_recordingvoucherdetailsc
            where true
            and domain_id = ?
            and recordingvouchersc_id > 0
            and recordingvoucherdetailsc_accsum_code = ?
            and recordingvoucherdetailsc_type = ?
            and DATE_FORMAT(created_at,'%Y-%m') = DATE_FORMAT(?,'%Y-%m')
            group by DATE_FORMAT(created_at,'%Y-%m')`;

    const result = await common.querySimple(sequelize, req, queryStr, [domainId, costCode, 0, queryDate]);
    if (result.data && result.data.length > 0) {
        const [ data ] = result.data;
        const { cost } = data;
        return cost || 0;
    }
    return 0;
}

async function getPrevMonthProfit(req, domain_id, queryDate) {
    // const curDate = new Date(queryDate);
    // const prevDate = new Date(new Date().setMonth(curDate.getMonth() - 1));
    //
    // const queryStr =
    //     `select
    //         *
    //         from tbl_erc_profit
    //         where true
    //         and domain_id = ?
    //         and DATE_FORMAT(created_at,'%Y-%m') = DATE_FORMAT(?,'%Y-%m')`;

    const queryStr =
        `select
            *
            from tbl_erc_profit
            where true
            and domain_id = ?
            and DATE_FORMAT(created_at,'%Y-%m') < DATE_FORMAT(?,'%Y-%m')
            order by created_at desc limit 1`;

    const result = await common.queryPure(sequelize, req, queryStr, [domain_id, queryDate]);
    if (result.data && result.data.length > 0) {
        const [ data ] = result.data;
        return data;
    }
    return null;
}

async function genProfitData(req, res) {
    const body = req.body;
    const user = req.user;
    const returnData = {};

    try {
        const { domain_id } = user;
        const { bill_date } = body;

        const profit_id = await getProfitIdByDate(req, domain_id, bill_date);
        const business_income = await getBusinessIncome(req, domain_id, bill_date);
        const business_cost = await getBusinessCost(req, domain_id, bill_date);
        const tax_addition = await getDebiteCost(req, domain_id, 6405, bill_date);
        const sale_cost = await getDebiteCost(req, domain_id, 6601, bill_date);
        const manage_cost = await getDebiteCost(req, domain_id, 6602, bill_date);
        const finance_cost = await getDebiteCost(req, domain_id, 6603, bill_date);
        const business_profit = business_income - business_cost - tax_addition - sale_cost - manage_cost - finance_cost;
        const out_business_income = await getCreditCost(req, domain_id, 6301, bill_date);
        const out_business_expend = await getDebiteCost(req, domain_id, 6711, bill_date);
        const total_profit = business_profit + out_business_income - out_business_expend;
        const tax_cost = await getDebiteCost(req, domain_id, 6801, bill_date);
        const pure_profit = total_profit - tax_cost;

        const profitData = {
            business_income,
            business_cost,
            tax_addition,
            sale_cost,
            manage_cost,
            finance_cost,
            business_profit,
            out_business_income,
            out_business_expend,
            total_profit,
            tax_cost,
            pure_profit,
            business_income_sum: business_income,
            business_cost_sum: business_cost,
            tax_addition_sum: tax_addition,
            sale_cost_sum: sale_cost,
            manage_cost_sum: manage_cost,
            finance_cost_sum: finance_cost,
            business_profit_sum: business_profit,
            out_business_income_sum: out_business_income,
            out_business_expend_sum: out_business_expend,
            total_profit_sum: total_profit,
            tax_cost_sum: tax_cost,
            pure_profit_sum: pure_profit
        };
        // console.log('genProfit id:', profit_id, 'data:', profitData);

        const curDate = new Date(bill_date);
        if (curDate.getMonth() > 0) {
            const prevProfit = await getPrevMonthProfit(req, domain_id, bill_date);
            // console.log('prevProfit:', prevProfit);
            if (prevProfit) {
                profitData.business_income_sum += prevProfit.business_income_sum;
                profitData.business_cost_sum += prevProfit.business_cost_sum;
                profitData.tax_addition_sum += prevProfit.tax_addition_sum;
                profitData.sale_cost_sum += prevProfit.sale_cost_sum;
                profitData.manage_cost_sum += prevProfit.manage_cost_sum;
                profitData.finance_cost_sum += prevProfit.finance_cost_sum;
                profitData.business_profit_sum += prevProfit.business_profit_sum;
                profitData.out_business_income_sum += prevProfit.out_business_income_sum;
                profitData.out_business_expend_sum += prevProfit.out_business_expend_sum;
                profitData.total_profit_sum += prevProfit.total_profit_sum;
                profitData.tax_cost_sum += prevProfit.tax_cost_sum;
                profitData.pure_profit_sum += prevProfit.pure_profit_sum;
            }
        }
        // console.log('genProfit id:', profit_id, 'data:', profitData);

        if (profit_id > 0) {
            await tb_profit.update(profitData, {
                where: {
                    profit_id
                }
            });
        } else {
            profitData.profit_code = await Sequence.genProfitCID();
            profitData.biz_code = await genBizCode(CODE_NAME.LRBB, domain_id, 6);
            profitData.domain_id = domain_id;
            profitData.created_at = bill_date;
            profitData.updated_at = bill_date;
            await tb_profit.create(profitData);
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getProfitDataList(req, res) {
    const body = req.body;
    const user = req.user;
    const returnData = {};

    try {
        let queryStr =
            `select
                profit_id, profit_code, biz_code
                , date_format(created_at, '%Y-%m') as created_at, date_format(updated_at, '%Y-%m-%d') as updated_at
                from tbl_erc_profit
                where true
                and domain_id = ?
                order by created_at asc`;

        const replacements = [user.domain_id];

        if (body.profit_code) {
            queryStr += ` and biz_code = ?`;
            replacements.push(body.profit_code);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getProfitDataInfo(req, res) {
    const body = req.body;

    try {
        const result = await tb_profit.findOne({
            where: {
                profit_id: body.profit_id
            }
        });

        const {
            business_income, business_cost, tax_addition, sale_cost,
            manage_cost, finance_cost, business_profit, out_business_income,
            out_business_expend, total_profit, tax_cost, pure_profit,
            business_income_sum, business_cost_sum, tax_addition_sum, sale_cost_sum,
            manage_cost_sum, finance_cost_sum, business_profit_sum, out_business_income_sum,
            out_business_expend_sum, total_profit_sum, tax_cost_sum, pure_profit_sum
        } = result;

        const resultData = {
            business_income: {
                title: '一、营业收入',
                value: business_income,
                total: business_income_sum,
            },
            business_cost: {
                title: '营业成本',
                value: business_cost,
                total: business_cost_sum,
            },
            tax_addition: {
                title: '税金及附加',
                value: tax_addition,
                total: tax_addition_sum,
            },
            sale_cost: {
                title: '销售费用',
                value: sale_cost,
                total: sale_cost_sum,
            },
            manage_cost: {
                title: '管理费用',
                value: manage_cost,
                total: manage_cost_sum,
            },
            finance_cost: {
                title: '财务费用',
                value: finance_cost,
                total: finance_cost_sum,
            },
            business_profit: {
                title: '二、营业利润',
                value: business_profit,
                total: business_profit_sum,
            },
            out_business_income: {
                title: '营业外收入',
                value: out_business_income,
                total: out_business_income_sum,
            },
            out_business_expend: {
                title: '营业外支出',
                value: out_business_expend,
                total: out_business_expend_sum,
            },
            total_profit: {
                title: '三、利润总额',
                value: total_profit,
                total: total_profit_sum,
            },
            tax_cost: {
                title: '所得税费用',
                value: tax_cost,
                total: tax_cost_sum,
            },
            pure_profit: {
                title: '四、净利润',
                value: pure_profit,
                total: pure_profit_sum,
            },
        };
        common.sendData(res, resultData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
