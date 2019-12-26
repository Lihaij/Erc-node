const fs = require('fs');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('GroupControlSRV');
const model = require('../../../model');

const sequelize = model.sequelize;

exports.ERCPriceSuperviseControlSRVResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'initPriceSupervise') {
        await initPriceSupervise(req, res);
    } else if (method === 'initMaterielSupervise') {
        await initMaterielSupervise(req, res);
    } else if (method === 'getSupplierList') {
        await getSupplierList(req, res);
    } else if (method === 'getSupplierMateriel') {
        await getSupplierMateriel(req, res);
    } else if (method === 'getSaleTemplateList') {
        await getSaleTemplateList(req, res);
    } else if (method === 'getSaleTemplateMateriel') {
        await getSaleTemplateMateriel(req, res);
    } else {
        common.sendError(res, 'common_01');
    }
};

async function initPriceSupervise(req, res) {
    common.sendData(res, {});
}

async function getBaseType(code,domain_id){
    try {
        let returnData = [],replacements = []
        let queryStr = `select d.*, t.basetype_code from tbl_erc_basetypedetail d,tbl_erc_basetype t
             where d.basetype_id=t.basetype_id and t.basetype_code=?`;
        replacements.push(code)
        if(domain_id){
            queryStr+=` and d.domain_id=?`
            replacements.push(domain_id)
        }
        let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        for(let r of result){
            returnData.push({
                id:r.basetypedetail_id,
                value:r.basetypedetail_id,
                text:r.typedetail_name,
            })
        }
        return returnData
    } catch (error) {
        throw error
    }
}

async function initMaterielSupervise(req, res) {
    const returnData = {};
    returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'); //物料单位
    returnData.priceEffective = GLBConfig.PRICEEFFECTIVE;//价格生效依据
    returnData.jgqyxddj = await getBaseType('JGQYXDDJ');
    common.sendData(res, returnData);
}

async function getSupplierList(req, res) {
    try {
        const { body, user } = req;
        const { domain_id } = user;
        const replacements = [GLBConfig.ENABLE, domain_id];

        let queryStr =
            `select * from tbl_erc_supplier
                where true
                and state = ?
                and domain_id = ?`;

        if (body.search_text) {
            queryStr += ` and (supplier like ? or supplier_name like ?)`;
            replacements.push(`%${body.search_text}%`);
            replacements.push(`%${body.search_text}%`);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        common.sendData(res, {total: result.count, rows: result.data});
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getSupplierMateriel(req, res) {
    try {
        const { body } = req;
        const returnData = {};

        let replacements = [];

        let queryStr = `
            select sm.suppliermateriel_id,sm.suppliermateriel_purchasepricetax,sm.supplier_id
            , date(sm.suppliermateriel_effectivedata) as suppliermateriel_effectivedata,date(sm.suppliermateriel_expirydate) as suppliermateriel_expirydate,sm.materiel_id
            , sm.suppliermateriel_mincount,sm.suppliermateriel_purchaseprice,sm.suppliermateriel_deliveryday
            , sm.suppliermateriel_tax,sm.suppliermateriel_priceeffective,m.materiel_id,m.materiel_code
            , m.materiel_format,m.materiel_name,m.materiel_unit,m.materiel_type,sm.suppliermateriel_currency_price
            , sm.suppliermateriel_begin_time,sm.suppliermateriel_shortest_days
            from tbl_erc_suppliermateriel sm
            left join tbl_erc_materiel m on sm.materiel_id = m.materiel_id
            where m.state = 1 and sm.state = 1`;

        if (body.supplier_id) {
            queryStr += ' and sm.supplier_id = ?';
            replacements.push(body.supplier_id);
        }

        if (body.search_text) {
            queryStr += ' and (m.materiel_code like ? or m.materiel_name like ? or m.materiel_format like ?)';
            const search_text = `%${body.search_text}%`;
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getSaleTemplateList(req, res) {
    try {
        const { body, user } = req;
        const { domain_id } = user;
        const returnData = {};
        const replacements = [GLBConfig.ENABLE, domain_id];

        let queryStr =
            `select * from tbl_erc_producepricetemplate t
             where t.state = ? and t.domain_id = ?`;
        if (body.search_text) {
            queryStr += ' and t.producepricetemplate_name like ?';
            replacements.push(`%${body.search_text}%`)
        }
        queryStr += ' order by t.created_at desc';

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getSaleTemplateMateriel(req, res) {
    try {
        const { body } = req;
        const { producepricetemplate_id } = body;
        const returnData = {};
        const replacements = [producepricetemplate_id];

        let queryStr =
            `select
                mt.materiel_code, mt.materiel_name, mt.materiel_format, mt.materiel_unit
                , ppd.suggest_price, date(ppd.start_date) as start_date, date(ppd.end_date) as end_date, ppd.price_jgqyxddj
                from tbl_erc_producepricetemplate ppt
                left join tbl_erc_producepricetemplatedetail ppd
                on ppt.producepricetemplate_id = ppd.producepricetemplate_id
                left join tbl_erc_materiel mt
                on ppd.materiel_id = mt.materiel_id
                where true
                and ppt.producepricetemplate_id = ?`;

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
