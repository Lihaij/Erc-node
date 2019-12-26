
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCDevelopPurchaseOrderControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const task = require('../baseconfig/ERCTaskListControlSRV');
const moment = require('moment');
const sequelize = model.sequelize;

// 研发项目采购单接口
exports.ERCDevelopPurchaseOrderControlResource = (req, res) => {
    let method = req.query.method;
    if (method==='getDevelopPurchaseOrder'){
        getDevelopPurchaseOrder(req,res)
    } else if (method==='getDevelopPurchaseOrderDetail'){
        getDevelopPurchaseOrderDetail(req,res)
    } else {
        common.sendError(res, 'common_01')
    }
};
// 查询研发项目采购单列表
async function getDevelopPurchaseOrder(req,res){
    let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
    let queryStr = `select a.develop_code,a.develop_name,po.*,s.supplier_name,u1.name as creatorName  
        from tbl_erc_developpurchaseorder po 
        left join tbl_erc_develop a on (a.develop_id = po.develop_id and a.state=1)
        left join tbl_erc_supplier s on (po.supplier_id = s.supplier_id and s.state=1)
        left join tbl_common_user u1 on (po.purchaseorder_creator=u1.user_id and u1.state=1)
        where po.state=1 and po.domain_id=?`;
    replacements.push(user.domain_id);
    if(doc.search_text){
        queryStr+=' and (po.purchaseorder_code like ? or a.develop_code like ? or a.develop_name like ?)';
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
// 查询研发项目采购单明细
async function getDevelopPurchaseOrderDetail(req,res){
    let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
    let queryStr = `select *,
        ROUND(purchaseorderdetail_number*purchaseorderdetail_price,2) as purchase_total_money
        from tbl_erc_developpurchaseorderdetail 
        where state=1 and developpurchaseorder_id=?`;
    replacements.push(doc.developpurchaseorder_id);
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
