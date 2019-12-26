/**
 * Created by shuang.liu on 18/3/16.
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCReturnNoteControlSRV');
const model = require('../../../model');

const sequelize = model.sequelize;
const tb_user = model.user;

exports.ERCReturnNoteControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'search_d') {
        searchDetailAct(req, res)
    } else if (method === 'ReturnNoteDetailPrint') {
        ReturnNoteDetailPrintAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
}
//初始化状态，计量单位
async function initAct(req, res) {
    try {
        let returnData = {};
        returnData.stockInfo = GLBConfig.STOCKORDERSTATE
        returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'); //计量单位
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//查看退货单的数据
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let replacements=[];
        let returnData={};

        let queryStr='select t.*,d.domain_name as order_domain,s.supplier_name,u.name as user_name,qt.created_at as check_date from tbl_erc_return t ' +
            'inner join tbl_erc_qualitycheck qt on t.qualitycheck_id = qt.qualitycheck_id ' +
            'left join tbl_erc_supplier s on (qt.supplier_id=s.supplier_id and s.state=1) ' +
            'left join tbl_common_user u on (qt.user_id=u.user_id and u.state=1) ' +
            'left join tbl_erc_purchaseorder p on (p.purchaseorder_id=t.purchaseorder_id) ' +
            'left join tbl_common_domain d on (p.order_domain_id=d.domain_id and d.state=1) ' +
            'where qt.domain_id=? and t.domain_id = ?';
        replacements.push(user.domain_id,user.domain_id);

        if(doc.search_text){
            queryStr+=' and (t.return_id like ? or t.purchaseorder_id like ? or s.supplier_name like ?)';
            replacements.push('%'+doc.search_text+'%');
            replacements.push('%'+doc.search_text+'%');
            replacements.push('%'+doc.search_text+'%');
        }
        if (doc.created_at) {
            queryStr += ' and qt.created_at >= ? and qt.created_at <= ?';
            replacements.push(doc.created_at + ` 00:00:00`);
            replacements.push(doc.created_at + ` 23:59:59`);
        }
        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for(let r of result.data){
            let result = JSON.parse(JSON.stringify(r));
            result.check_date = r.check_date.Format("yyyy-MM-dd hh:mm:ss");
            returnData.rows.push(result)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//查看退货单详情的数据
async function searchDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let replacements=[];
        let returnData={};

        let queryStr='select t.*,s.purchaseorder_id,mt.materiel_code,mt.materiel_id,mt.materiel_name,mt.materiel_format,mt.materiel_unit from tbl_erc_returndetail t ' +
            'left join tbl_erc_materiel mt on t.materiel_id = mt.materiel_id ' +
            'left join tbl_erc_return s on (t.return_id=s.return_id) ' +
            'where t.return_id=?';
        replacements.push(doc.return_id);

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
        return
    }
}
//打印退货单详情的数据
async function returnNoteDetail(body) {
    let queryStr = `select a.returndetail_id,a.return_id, a.return_number, 
    a.return_remark, a.materiel_id, a.created_at, 
    b.materiel_id, b.materiel_code, b.materiel_name, b.materiel_format, b.materiel_unit, 
    b.materiel_cost, concat(b.materiel_tax * 100, '%') as materiel_tax from tbl_erc_returndetail a 
    left join tbl_erc_materiel b on a.materiel_id = b.materiel_id where true and a.state = 1 and a.return_id = ?`;
    const replacements = [ body.return_id ];

    if (body.search_text) {
        queryStr += ' and (b.materiel_code like ?';
        replacements.push(body.search_text);
        queryStr += ' or b.materiel_name like ?)';
        replacements.push(body.search_text);
    }
    return await common.simpleSelect(sequelize, queryStr, replacements);
}
//打印退货单详情的数据
async function ReturnNoteDetailPrintAct(req, res) {
    try {
        const { body, user } = req;
        const unitInfo = await global.getBaseTypeInfo(user.domain_id, 'JLDW');
        const returnData = await returnNoteDetail(body);
        common.sendData(res, { unitInfo, returnData });
    } catch (error) {
        common.sendFault(res, error);
    }
}
