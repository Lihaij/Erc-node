/**
 * Created by shuang.liu on 18/5/2.
 */
const fs = require('fs');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCCorporateClientsControlSRV');
const model = require('../../../model');
const moment = require('moment');
const ERCAccountingControlSRV = require('../cashiermanage/ERCAccountingControlSRV')

const FDomain = require('../../../bl/common/FunctionDomainBL');
// tables
const sequelize = model.sequelize;
const tb_corporateclients = model.erc_corporateclients;
const tb_produce_client = model.erc_produce_client;
const tb_producepricetemplate = model.erc_producepricetemplate;

//B端客户管理->企业客户列表接口
exports.ERCCorporateClientsControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'search_price') {//销售报价
        searchPriceAct(req, res)
    } else if (method === 'add_p') {
        addBusinessPriceAct(req, res)
    } else if (method === 'modify_doc') {
        modifyDocAct(req, res)
    } else if (method === 'search_d') {
        searchDetailAct(req, res)
    } else if (method==='modifyCreditLine'){
        modifyCreditLine(req,res)
    } else if (method==='searchCreditLineDetail'){
        searchCreditLineDetail(req,res)
    } else if (method === 'search_a') {
        searchSalesAct(req, res)
    } else {
        common.sendError(res, 'common_01');
    }
};

async function initAct(req, res) {
    let user = req.user;
    let replacements = [];
    let returnData = {};

    await FDomain.getDomainListInit(req, returnData);

    returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'); //单位
    returnData.prodeuceInfo = GLBConfig.PRODUCECLIENTSTATE;
    returnData.settletInfo = GLBConfig.PAYMENTTYPE;
    returnData.creditLineDetailType = GLBConfig.CREDITLINEDETAILTYPE
    returnData.orderStateSalesInfo = [];
    for(let o of GLBConfig.ORDERSTATEINFO){
        if(o.id=='NEW' || o.id=='PAYED' || o.id=='REVIEWING' || o.id=='SHIPPED' || o.id=='FINISHI'){
            returnData.orderStateSalesInfo.push({
                id: o.id,
                value: o.value,
                text: o.text
            });
        }
    }

    let queryStr = 'select producepricetemplate_id as id,producepricetemplate_name text from tbl_erc_producepricetemplate where state=1 and domain_id=?';
    replacements.push(user.domain_id);
    let queryRst = await sequelize.query(queryStr, {
        replacements: replacements,
        type: sequelize.QueryTypes.SELECT,
        state: GLBConfig.ENABLE
    });
    returnData.businesscustomerType=queryRst;//客户类别

    common.sendData(res, returnData)
}
//查询企业客户列表
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let replacements = [user.domain_id];
        let returnData = {};

        let queryStr='select t.* from tbl_erc_corporateclients t ' +
            'where t.state = 1 and t.domain_id = ? ';
        if (doc.search_text) {
            queryStr += ' and (t.corporateclients_no like ? or t.corporateclients_name like ?)';
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text)
            replacements.push(search_text)
        }
        if (doc.corporateclients_type) {
            queryStr += ` and t.corporateclients_type= ? `;
            replacements.push(doc.corporateclients_type);
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.corporateclients_address = r.corporateclients_province + r.corporateclients_city +r.corporateclients_district + r.corporateclients_address
            result.business_tax = ((r.business_tax*100).toFixed(2)) +'%';
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
//增加企业客户
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let business_tax = 0

        let corporateclients = await tb_corporateclients.findAll({
            where:{
                state:GLBConfig.ENABLE,
                corporateclients_name:doc.corporateclients_name
            }
        });
        if(corporateclients && corporateclients.length>0){
            common.sendError(res, 'corporateclients_01');
            return
        }

        if (doc.business_tax != undefined) {
            business_tax = doc.business_tax
        }
        let corporateclients_no = await Sequence.getCorporateClientsID();
        let addCC = await tb_corporateclients.create({
            corporateclients_no: corporateclients_no,
            domain_id: user.domain_id,
            corporateclients_name:doc.corporateclients_name,
            corporateclients_type: doc.corporateclients_type,
            corporateclients_province:doc.corporateclients_province,
            corporateclients_city: doc.corporateclients_city,
            corporateclients_district:doc.corporateclients_district,
            corporateclients_address: doc.corporateclients_address,
            corporateclients_contact:doc.corporateclients_contact,
            corporateclients_phone: doc.corporateclients_phone,
            corporateclients_fax:doc.corporateclients_fax,
            business_registration_no: doc.business_registration_no,
            business_tax:business_tax/100,
            corporateclients_contact_qq: doc.corporateclients_contact_qq,
            corporateclients_contact_wechat:doc.corporateclients_contact_wechat,
            legalperson_contact: doc.legalperson_contact,
            legalperson_phone:doc.legalperson_phone,
            legalperson_qq: doc.legalperson_qq,
            legalperson_wechat:doc.legalperson_wechat,
            corporateclients_mobile_phone: doc.corporateclients_mobile_phone,
            // month_settlement: doc.month_settlement,
            settlement_way:doc.settlement_way
        });

        //添加会计科目详情
        await ERCAccountingControlSRV.addAccountingDetail(1122,corporateclients_no,user.domain_id, '1');
        await ERCAccountingControlSRV.addAccountingDetail(1231,corporateclients_no,user.domain_id, '1');
        await ERCAccountingControlSRV.addAccountingDetail(2241,corporateclients_no,user.domain_id, '1');

        common.sendData(res, addCC)

    } catch (error) {
        common.sendFault(res, error);
    }
}
//修改企业客户信息
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modCC = await tb_corporateclients.findOne({
            where: {
                corporateclients_id: doc.corporateclients_id
            }
        });

        if (modCC) {
            modCC.legalperson_contact = doc.legalperson_contact;
            modCC.legalperson_phone = doc.legalperson_phone;
            modCC.legalperson_qq = doc.legalperson_qq;
            modCC.legalperson_wechat = doc.legalperson_wechat;
            modCC.corporateclients_contact = doc.corporateclients_contact;
            modCC.corporateclients_phone = doc.corporateclients_phone;
            modCC.corporateclients_contact_wechat = doc.corporateclients_contact_wechat;
            modCC.corporateclients_contact_qq = doc.corporateclients_contact_qq;
            modCC.settlement_way = doc.settlement_way;
            modCC.month_settlement = doc.month_settlement;


            await modCC.save();

            common.sendData(res, modCC);
        } else {
            common.sendError(res, 'customer_03');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}
//新增销售报价记录
async function addBusinessPriceAct(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user;

        let safe = await tb_produce_client.findOne({
            where:{
                materiel_id: doc.materiel_id,
                client_domain_id: doc.corporateclients_id,
                state:GLBConfig.ENABLE,
                produce_client_type:2
            }
        });
        if(safe){
            safe.suggest_price =doc.suggest_price;
            safe.end_date =doc.end_date;
            safe.start_date =doc.start_date;
            safe.produce_client_state =doc.produce_client_state;
            await safe.save();
            common.sendData(res, safe);
        }else{
            let usergroup = await tb_produce_client.create({
                domain_id: user.domain_id,
                client_domain_id: doc.corporateclients_id,
                materiel_id: doc.materiel_id,
                suggest_price: doc.suggest_price,
                end_date: doc.end_date,
                start_date: doc.start_date,
                produce_client_state: doc.produce_client_state,
                produce_client_type:2
            });
            common.sendData(res, usergroup);
        }
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//查询销售报价
async function searchPriceAct(req, res) {
    try {
        let doc = req.body;
        let returnData = {};
        let user = req.user;
        let materielIdArr=[];
        let materielIdArr1=[];

        //查询单独编辑的物料价格
        let produceclient = await tb_produce_client.findOne({
            where:{
                client_domain_id: doc.corporateclients_id,
                state:GLBConfig.ENABLE,
                produce_client_type:2
            }
        });
        if(produceclient){
            let replacements1 = [doc.corporateclients_id,GLBConfig.ENABLE];
            let queryStr1 = 'select t.materiel_id ' +
                'from tbl_erc_produce_client t ' +
                'where t.materiel_id is not null and t.client_domain_id=? and t.state=? and produce_client_type=2 ';
            let result1 = await common.simpleSelect(sequelize, queryStr1, replacements1);

            for (let r of result1) {
                let result = JSON.parse(JSON.stringify(r));
                materielIdArr.push(result.materiel_id);
                materielIdArr1.push(result.materiel_id);
            }
        }

        //查询客户模板信息
        let pricetemplate = await tb_producepricetemplate.findOne({
            where:{
                domain_id: user.domain_id,
                state:GLBConfig.ENABLE,
                producepricetemplate_id: doc.producepricetemplate_id
            }
        });
        if(pricetemplate){
            let replacements1 = [GLBConfig.ENABLE,user.domain_id,GLBConfig.ENABLE,pricetemplate.producepricetemplate_id];
            let queryStr1 = 'select mt1.materiel_id ' +
                'from tbl_erc_producepricetemplatedetail t ' +
                'inner join tbl_erc_materiel mt1 on t.materiel_id = mt1.materiel_id and mt1.state=? ' +
                'where t.domain_id=? and t.state=? and t.producepricetemplate_id=? ';

            if(materielIdArr!=null && materielIdArr.length>0){
                let queryInStr= 'not in (' + materielIdArr.join(",") + ')';
                queryStr1 += 'and mt1.materiel_id '+queryInStr;

            }

            let result1 = await common.simpleSelect(sequelize, queryStr1, replacements1);

            for (let r of result1) {
                let result = JSON.parse(JSON.stringify(r));
                materielIdArr.push(result.materiel_id);
            }
        }

        let replacements2 = [GLBConfig.ENABLE,doc.corporateclients_id,GLBConfig.ENABLE,GLBConfig.ENABLE,user.domain_id,GLBConfig.ENABLE,pricetemplate.producepricetemplate_id,user.domain_id,GLBConfig.ENABLE];

        let queryStr = 'select b.* from (select a.* from ' +
            '(select pc.materiel_id,m.materiel_code as materiel_code, ' +
            'm.materiel_name,m.materiel_format,m.materiel_unit,pc.suggest_price as PRICE,pc.domain_id,pc.start_date as start_date,pc.end_date ' +
            'from tbl_erc_produce_client pc ' +
            'inner join tbl_erc_materiel m on pc.materiel_id = m.materiel_id and m.state = ? ' +
            'where pc.client_domain_id = ? and pc.state = ? and produce_client_type=2 ' +
            'UNION ALL ' +
            'select mt1.materiel_id,mt1.materiel_code, ' +
            'mt1.materiel_name,mt1.materiel_format,mt1.materiel_unit,t.suggest_price as PRICE,t.domain_id,t.start_date,t.end_date ' +
            'from tbl_erc_producepricetemplatedetail t ' +
            'inner join tbl_erc_materiel mt1 on t.materiel_id = mt1.materiel_id and mt1.state=? ' +
            'where t.domain_id=? and t.state=? and t.producepricetemplate_id=? ' ;
        if(materielIdArr1!=null && materielIdArr1.length>0){
            let queryInStr= 'not in (' + materielIdArr1.join(",") + ')';
            queryStr += 'and mt1.materiel_id '+queryInStr;

        }
        queryStr +=' UNION ALL ' +
            'select m2.materiel_id,m2.materiel_code as materiel_code, ' +
            'm2.materiel_name,m2.materiel_format,m2.materiel_unit,m2.materiel_sale as PRICE,m2.domain_id,"" as start_date,"" as end_date ' +
            'from tbl_erc_materiel m2 ' +
            'where m2.domain_id = ? and m2.state = ? and m2.materiel_state_management in (0,1,2) ';
        if(materielIdArr!=null && materielIdArr.length>0){
            let queryInStr= 'not in (' + materielIdArr.join(",") + ')';
            queryStr += 'and m2.materiel_id '+queryInStr;

        }
        queryStr+=' )a ';
        if (doc.search_text) {
            let search_text = '%'+doc.search_text+'%';
            queryStr += ' where a.materiel_name like ? or a.materiel_code like ? ';
            replacements2.push(search_text)
            replacements2.push(search_text)
        }
        queryStr+=' order by a.materiel_id)b';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements2);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.start_date = r.start_date ? moment(r.start_date).format("YYYY-MM-DD") : null;
            result.end_date = r.end_date ? moment(r.end_date).format("YYYY-MM-DD") : null;

            returnData.rows.push(result)
        }

        common.sendData(res, returnData)

    } catch (error) {
        return common.sendFault(res, error);
    }
}
//修改企业客户信息及适用税率
async function modifyDocAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modCC = await tb_corporateclients.findOne({
            where: {
                corporateclients_id: doc.old.corporateclients_id
            }
        });
        let business_tax = 0
        if (doc.new.business_tax != undefined) {
            business_tax = (doc.new.business_tax).replace(/%/g,"")
        }
        if (modCC) {
            modCC.corporateclients_name = doc.new.corporateclients_name;
            modCC.corporateclients_type = doc.new.corporateclients_type;
            modCC.corporateclients_address = doc.new.corporateclients_address;
            modCC.corporateclients_mobile_phone = doc.new.corporateclients_mobile_phone;
            modCC.corporateclients_fax = doc.new.corporateclients_fax;
            modCC.business_registration_no = doc.new.business_registration_no;
            modCC.business_tax = business_tax/100;

            await modCC.save();
            modCC.business_tax = ((modCC.business_tax*100).toFixed(2)) +'%';
            common.sendData(res, modCC);
        } else {
            common.sendError(res, 'customer_03');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}

//查询企业客户详情
async function searchDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let replacements = [user.domain_id,doc.corporateclients_id];
        let returnData = {};

        let queryStr='select t.* from tbl_erc_corporateclients t ' +
            'where t.state = 1 and t.domain_id = ? and t.corporateclients_id = ?';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
//修改信用额度信息
async function modifyCreditLine(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modCC = await tb_corporateclients.findOne({
            where: {
                corporateclients_id: doc.corporateclients_id
            }
        });

        if (modCC) {
            modCC.creditline_money = doc.creditline_money;
            await modCC.save();

            common.sendData(res, modCC);
        } else {
            common.sendError(res, 'customer_03');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}
//查询信用额度详情
async function searchCreditLineDetail(req,res){
    try {
        let doc = common.docTrim(req.body),user = req.user,replacements = [],returnData = {};

        let queryStr='select d.*,(d.creditlinedetail_surplus_creditline+d.creditlinedetail_surplus_advance) as total_surplus_money' +
            ' from tbl_erc_creditlinedetail d where d.state = 1 and d.corporateclients_id = ?';
        replacements.push(doc.corporateclients_id);
        if(doc.search_text){
            queryStr+=' and creditlinedetail_businessid like ?';
            replacements.push(('%' + doc.search_text + '%'));
        }
        if(doc.creditlinedetail_type){
            queryStr+=' and creditlinedetail_type = ?';
            replacements.push(doc.creditlinedetail_type);
        }
        if(doc.createdBeginTime){
            queryStr+=' and created_at >= ?';
            replacements.push(doc.createdBeginTime + ' 00:00:00');
        }
        if(doc.createdEndTime){
            queryStr+=' and created_at <= ?';
            replacements.push(doc.createdEndTime + ' 23:59:59');
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at ? moment(r.created_at).format("YYYY-MM-DD HH:mm") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
//查询销售订单列表
async function searchSalesAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let replacements = [user.domain_id,doc.corporateclients_id];
        let returnData = {};

        let queryStr=`select o.* from tbl_erc_order o
         left join tbl_erc_corporateclients c on (o.purchaser_corporateclients_id=c.corporateclients_id and c.state=1)
         where o.state=1 and o.purchaser_type = 3 and o.domain_id=? and corporateclients_id = ?`;

        if (doc.search_text) {
            queryStr += ' and (o.order_id like ? )';
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text)
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
