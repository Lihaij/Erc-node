const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCPurchaseDetailControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const sequelize = model.sequelize;
const moment = require('moment');

// 采购单明细接口
exports.ERCPurchaseDetailControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'search') {
        search(req, res);
    }else if (method==='initAct'){
        initAct(req,res)
    }else if (method==='getpuchaseOrderPrint'){
        getpuchaseOrderPrint(req,res)
    }else {
        common.sendError(res, 'common_01')
    }
};
// 查询采购单明细
async function search(req,res){
    let doc = common.docTrim(req.body), user = req.user,replacements=[],returnData={};
    let queryStr=`select m.*,a.purchasedetail_id,a.purchase_number,a.purchase_price,(a.purchase_number*a.purchase_price) as purchase_money,a.order_ids
         from tbl_erc_purchasedetail a 
         left join tbl_erc_materiel m on a.materiel_id=m.materiel_id  
         where a.state=1 `;
    if(doc.purchaseorder_id){
        queryStr+=' and a.purchase_id=?';
        replacements.push(doc.purchaseorder_id)
    }
    if(doc.search_text){
        queryStr+=' and (m.materiel_code like ? or m.materiel_name like ? )';
        replacements.push('%'+doc.search_text+'%');
        replacements.push('%'+doc.search_text+'%');
    }
    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    returnData.total = result.count;
    returnData.rows = [];
    for (let r of result.data) {
        let result = JSON.parse(JSON.stringify(r));
        result.order_sign = result.order_ids ? result.order_ids : '安全库存'
        returnData.rows.push(result)
    }

    
    result = await sequelize.query(queryStr, {replacements: replacements,type: sequelize.QueryTypes.SELECT});
    let sumMoney = 0;
    for(let r of result){
        sumMoney += r.purchase_money
    }
    returnData.sumMoney = sumMoney;
    common.sendData(res, returnData);
}
// 初始化基础数据
async function initAct(req, res) {
    let returnData = {};
    returnData.batchInfo = GLBConfig.BATCHINFO;//批次
    returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW');//单位
    returnData.mateUseState = GLBConfig.MATEUSESTATE;//单位
    returnData.materielSource = GLBConfig.MATERIELSOURCE;//物料来源
    returnData.materielManage = GLBConfig.MATERIELMANAGE;//管理模式
    returnData.materielSourceKind = GLBConfig.MATERIELSOURCEKIND;//来源分类
    returnData.purchaseApplyType = GLBConfig.PURCHASEAPPLYSTATE;//申请单状态

    common.sendData(res, returnData)
}
// 打印采购单模块
async function getpuchaseOrderPrint(req,res){
    let doc = common.docTrim(req.body), user = req.user,replacements=[],returnData={},result;
    try{
        replacements.push(doc.purchaseorder_id);
        let queryStr=`select p.purchaseorder_id,pd.domain_name as puchaseDomainName,sd.domain_name as orderDomainName 
        from tbl_erc_purchaseorder p 
        left join tbl_common_domain pd on (p.purchaseorder_domain_id=pd.domain_id and pd.state=1) 
        left join tbl_common_domain sd on (p.purchaseorder_domain_id=sd.domain_id and sd.state=1) 
        where p.state=1 and p.purchaseorder_id=?`;
        result = await sequelize.query(queryStr, {replacements: replacements,type: sequelize.QueryTypes.SELECT});
        returnData.purchaseorder_id=result[0].purchaseorder_id;
        returnData.puchaseDomainName=result[0].puchaseDomainName;
        returnData.orderDomainName=result[0].orderDomainName;
        returnData.date=[];

        queryStr=`select m.*,pd.purchase_number from tbl_erc_purchasedetail pd 
        left join tbl_erc_materiel m on (pd.materiel_id=m.materiel_id and m.state=1) 
        where pd.state=1 and pd.purchase_id=?`;
        result = await sequelize.query(queryStr, {replacements: replacements,type: sequelize.QueryTypes.SELECT});
        returnData.data=result;
        common.sendData(res, returnData);
    }catch (error){
        common.sendFault(res, error);
    }

}
