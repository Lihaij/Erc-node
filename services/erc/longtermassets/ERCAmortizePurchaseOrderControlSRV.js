
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCAmortizeDetailControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const task = require('../baseconfig/ERCTaskListControlSRV');
const moment = require('moment');
const sequelize = model.sequelize;

// 待摊资产采购单接口
exports.ERCAmortizePurchaseOrderControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'getAmortizePurchaseOrder'){
        getAmortizePurchaseOrder(req,res)
    } else if (method==='getAmortizePurchaseOrderDetail'){
        getAmortizePurchaseOrderDetail(req,res)
    } else {
        common.sendError(res, 'common_01')
    }
};

// 查询待摊资产采购单
async function getAmortizePurchaseOrder(req,res){
    let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
    let queryStr = `select a.amortize_code,a.amortize_name,po.*,s.supplier_name,u1.name as creatorName 
        from tbl_erc_amortizepurchaseorder po 
        left join tbl_erc_amortize a on (a.amortize_id = po.amortize_id and a.state=1)
        left join tbl_erc_supplier s on (po.supplier_id = s.supplier_id and s.state=1)
        left join tbl_common_user u1 on (po.purchaseorder_creator=u1.user_id and u1.state=1)
        where po.state=1 and po.domain_id=?`;
    replacements.push(user.domain_id);
    if(doc.search_text){
        queryStr+=' and (po.purchaseorder_code like ? or a.amortize_code like ? or a.amortize_name like ?)';
        let search_text = `%${doc.search_text}%`;
        replacements.push(search_text);
        replacements.push(search_text);
        replacements.push(search_text);
    }
    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    returnData.total = result.count;
    returnData.rows = [];
    for (let ap of result.data) {
        let d = JSON.parse(JSON.stringify(ap));
        d.created_at = ap.created_at ? moment(ap.created_at).format("YYYY-MM-DD") : null;
        d.updated_at = ap.updated_at ? moment(ap.updated_at).format("YYYY-MM-DD") : null;
        returnData.rows.push(d)
    }
    common.sendData(res, returnData);
}
// 查询待摊资产采购单明细
async function getAmortizePurchaseOrderDetail(req,res){
    let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
    let queryStr = `select *,
        ROUND(purchaseorderdetail_number*purchaseorderdetail_price,2) as purchase_total_money
        from tbl_erc_amortizepurchaseorderdetail 
        where state=1 and amortizepurchaseorder_id=?`;
    replacements.push(doc.amortizepurchaseorder_id);
    if(doc.search_text){
        queryStr+=' and purchaseorderdetail_name like ?';
        let search_text = `%${doc.search_text}%`;
        replacements.push(search_text);
    }
    let result = await common.queryWithCount(sequelize, req, queryStr, replacements)
    returnData.total = result.count;
    returnData.rows = [];
    for (let ap of result.data) {
        let d = JSON.parse(JSON.stringify(ap));
        d.created_at = ap.created_at ? moment(ap.created_at).format("YYYY-MM-DD") : null;
        d.updated_at = ap.updated_at ? moment(ap.updated_at).format("YYYY-MM-DD") : null;
        returnData.rows.push(d)
    }
    common.sendData(res, returnData);
}