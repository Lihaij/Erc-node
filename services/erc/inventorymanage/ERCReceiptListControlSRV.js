/**
 * 收货单列表及详情接口
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCReceiptListControlSRV');
const model = require('../../../model');

const sequelize = model.sequelize;
const tb_user = model.user;

exports.ERCReceiptListControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search_receipt') {//收货单列表
        searchReceiptAct(req, res)
    } else if (method === 'search_receipt_item') {//收货单明细
        searchReceiptItemAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};
//初始化数据
async function initAct(req, res) {
    try {
        let returnData = {};
        returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'); //物料单位
        returnData.materielStateManagement = GLBConfig.MATERIELSTATEMANAGEMENT;
        common.sendData(res, returnData)
    } catch (error) {
        return common.sendFault(res, error);
    }
}
//收货列表
async function searchReceiptAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let replacements=[];
        let returnData={};
        let queryStr=`select r.*, s.supplier_name, p.biz_code as purchase_biz_code
                      from tbl_erc_receipt r 
                      left join tbl_erc_supplier s on (r.supplier_id = s.supplier_id and s.state=1)
                      left join tbl_erc_purchaseorder p on (p.purchaseorder_id = r.purchaseorder_id) 
                      where r.domain_id = ? `;
        replacements.push(user.domain_id);

        if(doc.search_text){
            queryStr+=' and (r.biz_code like ? or p.biz_code like ? or s.supplier_name like ?)';
            replacements.push('%'+doc.search_text+'%');
            replacements.push('%'+doc.search_text+'%');
            replacements.push('%'+doc.search_text+'%');
        }
        if (doc.created_at) {
            queryStr += ' and r.created_at >= ? and r.created_at <= ?';
            replacements.push(doc.created_at + ` 00:00:00`);
            replacements.push(doc.created_at + ` 23:59:59`);
        }
        queryStr += ' order by r.created_at desc';

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
        return common.sendFault(res, error);
    }
}
//收货明细列表
async function searchReceiptItemAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let replacements=[];
        let returnData={};
        let queryStr=`select ri.*, mt.materiel_code, mt.materiel_id, mt.materiel_name, mt.materiel_format, mt.materiel_unit 
                      from tbl_erc_receiptitem ri 
                      left join tbl_erc_materiel mt on (ri.materiel_id = mt.materiel_id and mt.state = 1)
                      where ri.receipt_id = ? `;

        replacements.push(doc.receipt_id);

        if(doc.search_text){
            queryStr+=' and (mt.materiel_code like ? or mt.materiel_name like ?)';
            replacements.push('%'+doc.search_text+'%');
            replacements.push('%'+doc.search_text+'%');
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
