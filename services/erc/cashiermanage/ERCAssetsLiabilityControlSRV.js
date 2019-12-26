const common = require('../../../util/CommonUtil');
const logger = require('../../../util/Logger').createLogger('ERCTaxStatementControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const { CODE_NAME, genBizCode } = require('../../../util/BizCodeUtil');

const moment = require('moment');
const sequelize = model.sequelize;

const tb_assetsliability = model.erc_assetsliability;

exports.ERCAssetsLiabilityControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'initData') {
        await initData(req, res);
    } else if (method === 'genAssetsLiabilityData') {
        await genAssetsLiabilityData(req, res);
    } else if (method === 'getAssetsLiabilityList') {
        await getAssetsLiabilityList(req, res);
    } else if (method === 'getAssetsLiabilityInfo') {
        await getAssetsLiabilityInfo(req, res);
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

async function getAssetsLiabilityIdByDate(req, domainId, queryDate) {
    const queryStr =
        `select
            assetsliability_id
            from tbl_erc_assetsliability
            where true
            and domain_id = ?
            and DATE_FORMAT(created_at,'%Y-%m-%d') = DATE_FORMAT(?,'%Y-%m-%d')`;

    const result = await common.querySimple(sequelize, req, queryStr, [domainId, queryDate]);
    if (result.data && result.data.length > 0) {
        const [ data ] = result.data;
        const { assetsliability_id } = data;
        return assetsliability_id || 0;
    }
    return 0;
}

async function getDebiteMultiCost(req, domainId, codeArray, queryDate) {
    const queryStr =
        `select
            sum(recordingvoucherdetailsc_debite) as cost
            , DATE_FORMAT(created_at,'%Y-%m-%d') as date
            from tbl_erc_recordingvoucherdetailsc
            where true
            and domain_id = ?
            and recordingvouchersc_id > 0
            and recordingvoucherdetailsc_accsum_code in (?, ?, ?)
            and recordingvoucherdetailsc_type = ?
            and DATE_FORMAT(created_at,'%Y-%m-%d') = DATE_FORMAT(?,'%Y-%m-%d')
            group by DATE_FORMAT(created_at,'%Y-%m-%d')`;

    const result = await common.querySimple(sequelize, req, queryStr, [domainId, ...codeArray, 1, queryDate]);
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
            , DATE_FORMAT(created_at,'%Y-%m-%d') as date
            from tbl_erc_recordingvoucherdetailsc
            where true
            and domain_id = ?
            and recordingvouchersc_id > 0
            and recordingvoucherdetailsc_accsum_code = ?
            and recordingvoucherdetailsc_type = ?
            and DATE_FORMAT(created_at,'%Y-%m-%d') = DATE_FORMAT(?,'%Y-%m-%d')
            group by DATE_FORMAT(created_at,'%Y-%m-%d')`;

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
            , DATE_FORMAT(created_at,'%Y-%m-%d') as date
            from tbl_erc_recordingvoucherdetailsc
            where true
            and domain_id = ?
            and recordingvouchersc_id > 0
            and recordingvoucherdetailsc_accsum_code = ?
            and recordingvoucherdetailsc_type = ?
            and DATE_FORMAT(created_at,'%Y-%m-%d') = DATE_FORMAT(?,'%Y-%m-%d')
            group by DATE_FORMAT(created_at,'%Y-%m-%d')`;

    const result = await common.querySimple(sequelize, req, queryStr, [domainId, costCode, 0, queryDate]);
    if (result.data && result.data.length > 0) {
        const [ data ] = result.data;
        const { cost } = data;
        return cost || 0;
    }
    return 0;
}

async function getPrevAssetsLiabilityData(req, domainId, queryDate) {
    const queryStr =
        `select
            *
            from tbl_erc_assetsliability
            where true
            and domain_id = ?
            and TO_DAYS(created_at) < TO_DAYS(?)
            order by created_at desc limit 1`;

    const result = await common.queryPure(sequelize, req, queryStr, [domainId, queryDate]);
    if (result.data && result.data.length > 0) {
        const [ data ] = result.data;
        return data;
    }
    return null;
}

async function getPrevYearLastDayAssetsLiabilityData(req, domainId, queryDate) {
    const queryStr =
        `select
            *
            from tbl_erc_assetsliability
            where true
            and domain_id = ?
            and year(created_at) < year(?)
            order by created_at desc limit 1`;

    const result = await common.queryPure(sequelize, req, queryStr, [domainId, queryDate]);
    if (result.data && result.data.length > 0) {
        const [ data ] = result.data;
        return data;
    }
    return null;
}

async function genAssetsLiabilityData(req, res) {
    const body = req.body;
    const user = req.user;
    const returnData = {};

    try {
        const { domain_id } = user;
        const { bill_date, init_check } = body;
        const assetsliability_id = await getAssetsLiabilityIdByDate(req, domain_id, bill_date);
        const assets_mc = await getDebiteMultiCost(req, domain_id, [1001, 1002, 1015], bill_date);
        const assets_ar = await getDebiteCost(req, domain_id, 1122, bill_date);
        const assets_ap = await getDebiteCost(req, domain_id, 2202, bill_date);
        const assets_oar = await getDebiteCost(req, domain_id, 1231, bill_date) + await getDebiteCost(req, domain_id, 2241, bill_date);
        const assets_stock = await getDebiteMultiCost(req, domain_id, [1403, 1404, 1406, 1411], bill_date);
        const assets_tca = assets_mc + assets_ar + assets_ap + assets_oar + assets_stock;
        const assets_fa = await getDebiteCost(req, domain_id, 1601, bill_date);
        const assets_ad = await getCreditCost(req, domain_id, 1602, bill_date);
        const assets_pfa = assets_fa - assets_ad;
        const assets_lpe = await getDebiteCost(req, domain_id, 1801, bill_date);
        const assets_uca = assets_pfa + assets_lpe;
        const assets_ta = assets_tca + assets_uca;
        const liability_slm = await getCreditCost(req, domain_id, 2001, bill_date);
        const liability_ap = await getCreditCost(req, domain_id, 2202, bill_date);
        const liability_ar = await getCreditCost(req, domain_id, 1122, bill_date);
        const liability_pr = await getCreditCost(req, domain_id, 2211, bill_date) - await getDebiteCost(req, domain_id, 2211, bill_date);
        const liability_tp = await getCreditCost(req, domain_id, 2221, bill_date) - await getDebiteCost(req, domain_id, 2221, bill_date);
        const liability_oap = await getCreditCost(req, domain_id, 2241, bill_date) + await getCreditCost(req, domain_id, 1231, bill_date);
        const liability_tcl = liability_slm + liability_ap + liability_ar + liability_pr + liability_tp + liability_oap;
        const liability_pc = await getCreditCost(req, domain_id, 4001, bill_date);
        const liability_up = await getCreditCost(req, domain_id, 4104, bill_date) - await getDebiteCost(req, domain_id, 4104, bill_date);
        const liability_toe = liability_pc + liability_up;
        const liability_tlo = liability_tcl + liability_toe;

        const assetsLiabilityData = {
            assets_mc,
            assets_ar,
            assets_ap,
            assets_oar,
            assets_stock,
            assets_tca,
            assets_fa,
            assets_ad,
            assets_pfa,
            assets_lpe,
            assets_uca,
            assets_ta,
            liability_slm,
            liability_ap,
            liability_ar,
            liability_pr,
            liability_tp,
            liability_oap,
            liability_tcl,
            liability_pc,
            liability_up,
            liability_toe,
            liability_tlo,
            assets_mc_sum: assets_mc,
            assets_ar_sum: assets_ar,
            assets_ap_sum: assets_ap,
            assets_oar_sum: assets_oar,
            assets_stock_sum: assets_stock,
            assets_tca_sum: assets_tca,
            assets_fa_sum: assets_fa,
            assets_ad_sum: assets_ad,
            assets_pfa_sum: assets_pfa,
            assets_lpe_sum: assets_lpe,
            assets_uca_sum: assets_uca,
            assets_ta_sum: assets_ta,
            liability_slm_sum: liability_slm,
            liability_ap_sum: liability_ap,
            liability_ar_sum: liability_ar,
            liability_pr_sum: liability_pr,
            liability_tp_sum: liability_tp,
            liability_oap_sum: liability_oap,
            liability_tcl_sum: liability_tcl,
            liability_pc_sum: liability_pc,
            liability_up_sum: liability_up,
            liability_toe_sum: liability_toe,
            liability_tlo_sum: liability_tlo
        };
        // console.log('genAssetsLiability id:', assetsliability_id, 'data:', assetsLiabilityData);

        if (!init_check) {
            const prevAssetsLiability = await getPrevAssetsLiabilityData(req, domain_id, bill_date);
            // console.log('prevAssetsLiability:', prevAssetsLiability);
            if (prevAssetsLiability) {
                assetsLiabilityData.assets_mc_sum += prevAssetsLiability.assets_mc_sum;
                assetsLiabilityData.assets_ar_sum += prevAssetsLiability.assets_ar_sum;
                assetsLiabilityData.assets_ap_sum += prevAssetsLiability.assets_ap_sum;
                assetsLiabilityData.assets_oar_sum += prevAssetsLiability.assets_oar_sum;
                assetsLiabilityData.assets_stock_sum += prevAssetsLiability.assets_stock_sum;
                assetsLiabilityData.assets_tca_sum += prevAssetsLiability.assets_tca_sum;
                assetsLiabilityData.assets_fa_sum += prevAssetsLiability.assets_fa_sum;
                assetsLiabilityData.assets_ad_sum += prevAssetsLiability.assets_ad_sum;
                assetsLiabilityData.assets_pfa_sum += prevAssetsLiability.assets_pfa_sum;
                assetsLiabilityData.assets_lpe_sum += prevAssetsLiability.assets_lpe_sum;
                assetsLiabilityData.assets_uca_sum += prevAssetsLiability.assets_uca_sum;
                assetsLiabilityData.assets_ta_sum += prevAssetsLiability.assets_ta_sum;
                assetsLiabilityData.liability_slm_sum += prevAssetsLiability.liability_slm_sum;
                assetsLiabilityData.liability_ap_sum += prevAssetsLiability.liability_ap_sum;
                assetsLiabilityData.liability_ar_sum += prevAssetsLiability.liability_ar_sum;
                assetsLiabilityData.liability_pr_sum += prevAssetsLiability.liability_pr_sum;
                assetsLiabilityData.liability_tp_sum += prevAssetsLiability.liability_tp_sum;
                assetsLiabilityData.liability_oap_sum += prevAssetsLiability.liability_oap_sum;
                assetsLiabilityData.liability_tcl_sum += prevAssetsLiability.liability_tcl_sum;
                assetsLiabilityData.liability_pc_sum += prevAssetsLiability.liability_pc_sum;
                assetsLiabilityData.liability_up_sum += prevAssetsLiability.liability_up_sum;
                assetsLiabilityData.liability_toe_sum += prevAssetsLiability.liability_toe_sum;
                assetsLiabilityData.liability_tlo_sum += prevAssetsLiability.liability_tlo_sum;
            }
        }

        if (assetsliability_id > 0) {
            await tb_assetsliability.update(assetsLiabilityData, {
                where: {
                    assetsliability_id
                }
            });
        } else {
            assetsLiabilityData.assetsliability_code = await Sequence.genAssetsLiabilityCID();
            assetsLiabilityData.biz_code = await genBizCode(CODE_NAME.ZCFZBB, domain_id, 6);
            assetsLiabilityData.domain_id = domain_id;
            assetsLiabilityData.created_at = bill_date;
            assetsLiabilityData.updated_at = bill_date;
            await tb_assetsliability.create(assetsLiabilityData);
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getAssetsLiabilityList(req, res) {
    const body = req.body;
    const user = req.user;
    const returnData = {};

    try {
        let queryStr =
            `select
                assetsliability_id, assetsliability_code, biz_code
                , DATE_FORMAT(created_at,'%Y-%m-%d') as created_at, date_format(updated_at, '%Y-%m-%d') as updated_at
                from tbl_erc_assetsliability
                where true
                and domain_id = ?
                order by created_at asc`;

        const replacements = [user.domain_id];

        if (body.assetsliability_code) {
            queryStr += ` and biz_code = ?`;
            replacements.push(body.assetsliability_code);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getAssetsLiabilityInfo(req, res) {
    const body = req.body;
    const user = req.user;

    try {
        const result = await tb_assetsliability.findOne({
            where: {
                assetsliability_id: body.assetsliability_id
            }
        });

        const {
            assets_mc_sum, assets_ar_sum, assets_ap_sum, assets_oar_sum, assets_stock_sum, assets_tca_sum,
            assets_fa_sum, assets_ad_sum, assets_pfa_sum, assets_lpe_sum, assets_uca_sum, assets_ta_sum,
            liability_slm_sum, liability_ap_sum, liability_ar_sum, liability_pr_sum, liability_tp_sum, liability_oap_sum,
            liability_tcl_sum, liability_pc_sum, liability_up_sum, liability_toe_sum, liability_tlo_sum,
            created_at
        } = result;

        const assets1 = {
            assets_mc: {
                title: '货币资金',
                value: assets_mc_sum,
                total: 0
            },
            assets_ar: {
                title: '应收账款',
                value: assets_ar_sum,
                total: 0
            },
            assets_ap: {
                title: '预付款项',
                value: assets_ap_sum,
                total: 0
            },
            assets_oar: {
                title: '其他应收款',
                value: assets_oar_sum,
                total: 0
            },
            assets_stock: {
                title: '存货',
                value: assets_stock_sum,
                total: 0
            },
            assets_tca: {
                title: '流动资产合计',
                value: assets_tca_sum,
                total: 0
            },
        };

        const assets2 = {
            assets_fa: {
                title: '固定资产',
                value: assets_fa_sum,
                total: 0
            },
            assets_ad: {
                title: '累计折旧',
                value: assets_ad_sum,
                total: 0
            },
            assets_pfa: {
                title: '固定资产净值',
                value: assets_pfa_sum,
                total: 0
            },
            assets_lpe: {
                title: '长期待摊费用',
                value: assets_lpe_sum,
                total: 0
            },
            assets_uca: {
                title: '非流动资产合计',
                value: assets_uca_sum,
                total: 0
            },
        };

        const liability1 = {
            liability_slm: {
                title: '短期借款',
                value: liability_slm_sum,
                total: 0
            },
            liability_ap: {
                title: '应付账款',
                value: liability_ap_sum,
                total: 0
            },
            liability_ar: {
                title: '预收款项',
                value: liability_ar_sum,
                total: 0
            },
            liability_pr: {
                title: '应付职工薪酬',
                value: liability_pr_sum,
                total: 0
            },
            liability_tp: {
                title: '应交税费',
                value: liability_tp_sum,
                total: 0
            },
            liability_oap: {
                title: '其他应付款',
                value: liability_oap_sum,
                total: 0
            },
            liability_tcl: {
                title: '流动负债合计',
                value: liability_tcl_sum,
                total: 0
            },
        };

        const liability2 = {
            liability_pc: {
                title: '实收资本',
                value: liability_pc_sum,
                total: 0
            },
            liability_up: {
                title: '未分配利润',
                value: liability_up_sum,
                total: 0
            },
            liability_toe: {
                title: '所有者权益合计',
                value: liability_toe_sum,
                total: 0
            },
        };

        const assetsTotal = {
            value: assets_ta_sum,
            total: 0
        };

        const liabilityTotal = {
            value: liability_tlo_sum,
            total: 0
        };

        const { domain_id } = user;
        const lastDayData = await getPrevYearLastDayAssetsLiabilityData(req, domain_id, created_at);
        // console.log('lastDayData:', lastDayData);
        if (lastDayData) {
            assets1.assets_mc.total = lastDayData.assets_mc_sum;
            assets1.assets_ar.total = lastDayData.assets_ar_sum;
            assets1.assets_ap.total = lastDayData.assets_ap_sum;
            assets1.assets_oar.total = lastDayData.assets_oar_sum;
            assets1.assets_stock.total = lastDayData.assets_stock_sum;
            assets1.assets_tca.total = lastDayData.assets_tca_sum;
            assets2.assets_fa.total = lastDayData.assets_fa_sum;
            assets2.assets_ad.total = lastDayData.assets_ad_sum;
            assets2.assets_pfa.total = lastDayData.assets_pfa_sum;
            assets2.assets_lpe.total = lastDayData.assets_lpe_sum;
            assets2.assets_uca.total = lastDayData.assets_uca_sum;
            liability1.liability_slm.total = lastDayData.liability_slm_sum;
            liability1.liability_ap.total = lastDayData.liability_ap_sum;
            liability1.liability_ar.total = lastDayData.liability_ar_sum;
            liability1.liability_pr.total = lastDayData.liability_pr_sum;
            liability1.liability_tp.total = lastDayData.liability_tp_sum;
            liability1.liability_oap.total = lastDayData.liability_oap_sum;
            liability1.liability_tcl.total = lastDayData.liability_tcl_sum;
            liability2.liability_pc.total = lastDayData.liability_pc_sum;
            liability2.liability_up.total = lastDayData.liability_up_sum;
            liability2.liability_toe.total = lastDayData.liability_toe_sum;
            assetsTotal.total = lastDayData.assets_ta_sum;
            liabilityTotal.total = lastDayData.liability_tlo_sum;
        }

        common.sendData(res, {
            assets1,
            assets2,
            assetsTotal,
            liability1,
            liability2,
            liabilityTotal
        });
    } catch (error) {
        common.sendFault(res, error);
    }
}
