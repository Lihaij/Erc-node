/**
 * Created by shuang.liu on 18/3/16.
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCQualityCheckControlSRV');
const model = require('../../../model');

const sequelize = model.sequelize;
const tb_user = model.user;

exports.ERCQualityCheckControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'search_d') {
        searchDetailAct(req, res)
    } else if (method === 'QualityCheckDetailPrint') {
        QualityCheckDetailPrintAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    let returnData = {};


    common.sendData(res, returnData)
}
//查看品质检验单的数据
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let replacements=[];
        let returnData={};
        let queryStr='select t.*,d.domain_name as order_domain,s.supplier_name,u.name as user_name from tbl_erc_qualitycheck t ' +
            'left join tbl_erc_supplier s on (t.supplier_id=s.supplier_id and s.state=1) ' +
            'left join tbl_common_user u on (t.user_id=u.user_id and u.state=1) ' +
            'left join tbl_erc_purchaseorder p on (p.purchaseorder_id=t.purchaseorder_id) ' +
            'left join tbl_common_domain d on (p.order_domain_id=d.domain_id and d.state=1) ' +
            'where t.domain_id=?';
        replacements.push(user.domain_id);

        if(doc.search_text){
            queryStr+=' and (t.qualitycheck_id like ? or t.purchaseorder_id like ? or s.supplier_name like ?)';
            replacements.push('%'+doc.search_text+'%');
            replacements.push('%'+doc.search_text+'%');
            replacements.push('%'+doc.search_text+'%');
        }
        if (doc.created_at) {
            queryStr += ' and t.created_at >= ? and t.created_at <= ?';
            replacements.push(doc.created_at + ` 00:00:00`);
            replacements.push(doc.created_at + ` 23:59:59`);
        }
        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for(let r of result.data){
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at.Format("yyyy-MM-dd hh:mm:ss");
            returnData.rows.push(result)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//查看品质检验单详情的数据
async function searchDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let replacements=[];
        let returnData={};

        let queryStr='select t.*,mt.materiel_code,mt.materiel_id,mt.materiel_name,mt.materiel_format,mt.materiel_unit from tbl_erc_qualitycheckdetail t ' +
            'left join tbl_erc_materiel mt on t.materiel_id = mt.materiel_id ' +
            'where t.qualitycheck_id=?';
        replacements.push(doc.qualitycheck_id);

        if(doc.search_text){
            queryStr+=' and (mt.materiel_code like ? or mt.materiel_name like ?)';
            replacements.push('%'+doc.search_text+'%');
            replacements.push('%'+doc.search_text+'%');
        }
        queryStr += ' order by mt.materiel_id';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//打印品质检验单详情的数据
async function qualityCheckDetail(body) {
    let queryStr = `select a.qualitycheck_id,a.purchasedetail_id, a.qualified_number, 
    a.remark, a.unqualified_number, a.created_at, 
    b.materiel_id, b.materiel_code, b.materiel_name, b.materiel_format, b.materiel_unit, 
    b.materiel_cost, concat(b.materiel_tax * 100, '%') as materiel_tax from tbl_erc_qualitycheckdetail a 
    left join tbl_erc_materiel b on a.materiel_id = b.materiel_id where true and a.state = 1 and a.qualitycheck_id = ?`;
    const replacements = [ body.qualitycheck_id ];

    if (body.search_text) {
        queryStr += ' and (b.materiel_code like ?';
        replacements.push(body.search_text);
        queryStr += ' or b.materiel_name like ?)';
        replacements.push(body.search_text);
    }
    return await common.simpleSelect(sequelize, queryStr, replacements);
}
//打印品质检验单详情的数据
async function QualityCheckDetailPrintAct(req, res) {
    try {
        const { body, user } = req;
        const unitInfo = await global.getBaseTypeInfo(user.domain_id, 'JLDW');
        const returnData = await qualityCheckDetail(body);
        common.sendData(res, { unitInfo, returnData });
    } catch (error) {
        common.sendFault(res, error);
    }
}
