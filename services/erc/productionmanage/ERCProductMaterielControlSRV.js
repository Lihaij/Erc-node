const common = require('../../../util/CommonUtil');
const logger = require('../../../util/Logger').createLogger('ERCTaxStatementControlSRV');
const model = require('../../../model');
const GLBConfig = require('../../../util/GLBConfig');

const sequelize = model.sequelize;

exports.ERCProductMaterielControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'initProductMateriel') {
        await initProductMateriel(req, res);
    } else if (method === 'getSelfProductMateriel') {
        await getSelfProductMateriel(req, res);
    } else if (method === 'getOutSourcingProductMateriel') {
        await getOutSourcingProductMateriel(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

async function initProductMateriel(req, res) {
    const { user } = req;
    const { domain_id } = user;
    const returnData = {};

    try {
        returnData.unitInfo = await global.getBaseTypeInfo(domain_id, 'JLDW');
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getScrapMateriel(domain_id, productivetaskdetail_id, materiel_id) {
    const queryStr =
        `select
            sum(sd.scrapdetail_number) as scrapdetail_number
            from tbl_erc_scrapdetail sd
            left join tbl_erc_scrap sp
            on sp.scrap_id = sd.scrap_id
            where true
            and sp.domain_id = ?
            and sp.scrap_state = ?
            and sd.productivetaskdetail_id = ?
            and sd.materiel_id = ?
            group by sd.productivetaskdetail_id`;

    return await common.simpleSelect(sequelize, queryStr, [domain_id, 2, productivetaskdetail_id, materiel_id]);
}

async function getSelfProductMateriel(req, res) {
    const { body, user } = req;
    const returnData = {};

    try {
        const { domain_id } = user;
        const { department_id, outsource_sign, search_text } = body;

        let queryStr =
            `select
                ptd.productivetaskdetail_id, ptd.design_number, ptd.taskdetaildesign_number, ptd.stock_out_number
                , pt.productivetask_id, pt.biz_code, pt.stock_in_number, pt.outsource_sign
                , (pt.stock_in_number * ptd.design_number) as result_in_number
                , (ptd.stock_out_number - pt.stock_in_number * ptd.design_number) as balance_number
                , mat.materiel_id, mat.materiel_code, mat.materiel_name, mat.materiel_format, mat.materiel_unit
                , gdp.department_id, dpt.department_name
                from tbl_erc_productivetaskdetail ptd
                left join tbl_erc_productivetask pt
                on pt.productivetask_id = ptd.productivetask_id
                left join tbl_erc_materiel mat
                on ptd.materiel_id = mat.materiel_id
                left join (
                select
                pt.productivetask_id, ptp.department_id
                from tbl_erc_productivetask pt
                left join tbl_erc_productivetaskprocess ptp
                on ptp.productivetask_id = pt.productivetask_id
                where pt.domain_id = ?
                group by pt.productivetask_id, ptp.department_id) gdp
                on gdp.productivetask_id = pt.productivetask_id
                left join tbl_erc_department dpt
                on dpt.department_id = gdp.department_id
                where true
                and pt.domain_id = ?`;

        const replacements = [ domain_id, domain_id ];

        if (search_text) {
            queryStr += ` and (pt.biz_code like ? or mat.materiel_code like ? or mat.materiel_name like ?)`;
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
        }

        if (department_id) {
            queryStr += ` and gdp.department_id = ?`;
            replacements.push(department_id);
        }

        if (outsource_sign) {
            queryStr += ` and pt.outsource_sign = ?`;
            replacements.push(outsource_sign);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        const resultData = result.data;

        for (const resultItem of resultData) {
            const { productivetaskdetail_id, materiel_id } = resultItem;
            const [ scrapResult ] = await getScrapMateriel(domain_id, productivetaskdetail_id, materiel_id);
            if (scrapResult) {
                const { scrapdetail_number } = scrapResult;
                resultItem.scrap_number = parseInt(scrapdetail_number);
                resultItem.balance_number -= parseInt(scrapdetail_number);
            }
        }

        returnData.total = result.count;
        returnData.rows = resultData;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getOutSourcingProductMateriel(req, res) {
    const { body, user } = req;
    const returnData = {};

    try {
        const { domain_id } = user;
        const { department_id, outsource_sign, search_text } = body;

        let queryStr =
            `select
                ptd.productivetaskdetail_id, ptd.design_number, ptd.taskdetaildesign_number, ptd.stock_out_number
                , pt.productivetask_id, pt.biz_code, pt.stock_in_number, pt.department_id, pt.outsource_sign
                , (pt.stock_in_number * ptd.design_number) as result_in_number
                , (ptd.stock_out_number - pt.stock_in_number * ptd.design_number) as balance_number
                , mat.materiel_id, mat.materiel_code, mat.materiel_name, mat.materiel_format, mat.materiel_unit
                , spl.supplier_name
                from tbl_erc_productivetaskdetail ptd
                left join tbl_erc_productivetask pt
                on pt.productivetask_id = ptd.productivetask_id
                left join tbl_erc_materiel mat
                on ptd.materiel_id = mat.materiel_id
                left join tbl_erc_supplier spl
                on spl.supplier_id = pt.department_id
                where true
                and pt.domain_id = ?`;

        const replacements = [ domain_id ];

        if (search_text) {
            queryStr += ` and (pt.biz_code like ? or mat.materiel_code like ? or mat.materiel_name like ?)`;
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
        }

        if (department_id) {
            queryStr += ` and pt.department_id = ?`;
            replacements.push(department_id);
        }

        if (outsource_sign) {
            queryStr += ` and pt.outsource_sign = ?`;
            replacements.push(outsource_sign);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        const resultData = result.data;

        for (const resultItem of resultData) {
            const { productivetaskdetail_id, materiel_id } = resultItem;
            const [ scrapResult ] = await getScrapMateriel(domain_id, productivetaskdetail_id, materiel_id);
            if (scrapResult) {
                const { scrapdetail_number } = scrapResult;
                resultItem.scrap_number = parseInt(scrapdetail_number);
                resultItem.balance_number -= parseInt(scrapdetail_number);
            }
        }

        returnData.total = result.count;
        returnData.rows = resultData;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
