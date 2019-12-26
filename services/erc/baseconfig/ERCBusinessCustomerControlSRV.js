const fs = require('fs');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('GroupControlSRV');
const model = require('../../../model');
const mapUtil = require('../../../util/MapUtil.js');
const moment = require('moment');
const ERCAccountingControlSRV = require('../cashiermanage/ERCAccountingControlSRV')

const FDomain = require('../../../bl/common/FunctionDomainBL');
// tables
const sequelize = model.sequelize;
const tb_common_domain = model.common_domain;
const tb_common_apidomain = model.common_apidomain;
const tb_common_domaintemplate = model.common_domaintemplate
const tb_usergroup = model.common_usergroup;
const tb_user = model.common_user;
const tb_common_templatemenu = model.common_templatemenu;
const tb_common_domainmenu = model.common_domainmenu;
const tb_common_systemmenu = model.common_systemmenu;
const tb_businessdomain = model.erc_businessdomain;
const tb_produce_client = model.erc_produce_client;
const tb_producepricetemplate = model.erc_producepricetemplate;
const tb_producepricetemplatedetail = model.erc_producepricetemplatedetail;


//B端客户管理->体验店列表接口
exports.ERCBusinessCustomerControlSRVResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'StaffControlSRV_search') {
        StaffControlSRVSearch(req, res)
    } else if (method === 'search_sale') {
        searchSale(req, res)
    } else if (method === 'search_price') {
        search_price(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'addbusinessprice') {
        addbusinessprice(req, res)
    } else if (method === 'save') {
        saveAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else {
        common.sendError(res, 'common_01');
    }
};

async function initAct(req, res) {
    let returnData = {},
        user = req.user;
    let replacements = [];

    await FDomain.getDomainListInit(req, returnData);

    returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'); //单位
    returnData.prodeuceInfo = GLBConfig.PRODUCECLIENTSTATE;//有效、无效类型
    returnData.settletInfo = GLBConfig.SETTLEMENTWAY;//结算类型
    const [admin, institution, headOffice, ...otherType] = GLBConfig.DOMAINTYPE;// 域类型
    returnData.domainTypeInfo = GLBConfig.DOMAINTYPE;// 域类型
    returnData.companyTypeInfo = otherType;

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
//查询体验店列表
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};

        let queryStr=`select cd.*,nb.businesscustomer_type,nb.businessregistration,nb.business_tax,nb.businessdomain_id 
                      from tbl_common_domain cd left join tbl_erc_businessdomain nb on cd.domain = nb.domain
                      where cd.state = 1 and cd.domain_type not in (0)`
        if (doc.search_text) {
            queryStr += ' and (cd.domain like ? or cd.domain_name like ?)'
            let search_text = '%' + doc.search_text + '%'
            replacements.push(search_text)
            replacements.push(search_text)
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        //returnData.rows = result.data;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.domain_address = r.domain_province + r.domain_city +r.domain_district + r.domain_address;
            result.business_tax = ((r.business_tax*100).toFixed(2)) +'%';
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
//新增体验店列表
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user
        let domain_coordinate = '';
        let re = await mapUtil.getGeoByAddress(doc.domain_province + doc.domain_city + doc.domain_district + doc.domain_address);
        if (re && re.infocode == '10000' && re.geocodes && re.geocodes.length > 0)
            domain_coordinate = re.geocodes[0].location;
        else
            return common.sendError(res, 'geo_01');
        let domain = await tb_common_domain.findOne({
            where: {
                $or: [
                    {domain: doc.domain},
                    {domain_name: doc.domain_name}
                ]
            }
        });
        if (domain) {
            common.sendError(res, 'domain_01');
            return
        } else {
            let business_tax = 0
            if (doc.business_tax != undefined) {
                business_tax = doc.business_tax
            }
            domain = await tb_common_domain.create({
                domain: doc.domain,
                domain_type: doc.domain_type,
                domaintemplate_id: doc.domaintemplate_id,
                domain_name: doc.domain_name,
                domain_province: doc.domain_province,
                domain_city: doc.domain_city,
                domain_district: doc.domain_district,
                domain_address: doc.domain_address,
                domain_coordinate: domain_coordinate,
                domain_contact: doc.domain_contact,
                domain_phone: doc.domain_phone,
                domain_description: doc.domain_description,
                domain_fax: doc.domain_fax
            });

            //创建会计科目详情
            await ERCAccountingControlSRV.addFinanceAccountingDetail(domain.domain_id);
            //添加会计科目对应总金额
            await ERCAccountingControlSRV.addAccounting(domain.domain_id);
            //添加会计科目无明细科目详情
            await ERCAccountingControlSRV.addNoDetailAccountingDetail(domain.domain_id);

            let businessdomain = await tb_businessdomain.create({
                domain: doc.domain,
                businesscustomer_type: doc.businesscustomer_type,
                businessregistration: doc.businessregistration,
                business_tax: business_tax/100
            });

            let usergroup = await tb_usergroup.create({
                domain_id: domain.domain_id,
                usergroup_name: 'administrator',
                usergroup_type: GLBConfig.TYPE_ADMINISTRATOR,
                node_type: GLBConfig.MTYPE_ROOT,
                parent_id: 0
            });

            let adduser = await tb_user.create({
                user_id: await Sequence.genUserID(),
                domain_id: domain.domain_id,
                usergroup_id: usergroup.usergroup_id,
                username: doc.domain + 'admin',
                name: 'admin',
                password: 'admin',
                user_type: GLBConfig.TYPE_ADMINISTRATOR
            });

            async function genDomainMenu(domaintemplate_id, parentId, cparentId) {
                let menus = await tb_common_templatemenu.findAll({
                    where: {
                        domaintemplate_id: domaintemplate_id,
                        parent_id: parentId
                    }
                });
                for (let m of menus) {
                    let sub_menus = [];
                    if (m.node_type === GLBConfig.MTYPE_ROOT) {
                        let dm = await tb_common_domainmenu.create({
                            domain_id: domain.domain_id,
                            domainmenu_name: m.templatemenu_name,
                            domainmenu_icon: m.templatemenu_icon,
                            api_id: m.api_id,
                            api_function: m.api_function,
                            node_type: m.node_type,
                            parent_id: cparentId
                        })
                        sub_menus = await genDomainMenu(domaintemplate_id, m.templatemenu_id, dm.domainmenu_id);
                    } else {
                        let dm = await tb_common_domainmenu.create({
                            domain_id: domain.domain_id,
                            domainmenu_name: m.templatemenu_name,
                            domainmenu_icon: m.templatemenu_icon,
                            api_id: m.api_id,
                            api_function: m.api_function,
                            node_type: m.node_type,
                            parent_id: cparentId
                        })
                    }
                }
            }

            await genDomainMenu(doc.domaintemplate_id, '0', '0')

            common.sendData(res, domain);
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}
//查询销售订单
async function searchSale(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};
        let queryStr=`select * from tbl_erc_order where purchaser_type = 1 and state = 1`
        if (user.domain_id) {
            queryStr += ' and domain_id = ?'
            replacements.push(user.domain_id)
        }

        if (doc.domain_id) {
            queryStr += ' and purchase_domain_id = ?'
            replacements.push(doc.domain_id)
        }
        if (doc.search_text) {
            queryStr += ' and order_id like ? '
            let search_text = '%' + doc.search_text + '%'
            replacements.push(search_text)
        }
        if (doc.order_state) {
            queryStr += ' and order_state = ?'
            replacements.push(doc.order_state)
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//新增销售报价
async function addbusinessprice(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],addProduce;

        let safe = await tb_produce_client.findOne({
            where:{
                materiel_id: doc.materiel_id,
                client_domain_id: doc.client_domain_id,
                state:GLBConfig.ENABLE,
                produce_client_type:GLBConfig.ENABLE
            }
        });
        if(safe){
            safe.suggest_price =doc.suggest_price
            safe.end_date =doc.end_date
            safe.start_date =doc.start_date
            safe.produce_client_state =doc.produce_client_state
            await safe.save()
            common.sendData(res, safe);
        }else{
            let usergroup = await tb_produce_client.create({
                domain_id: user.domain_id,
                client_domain_id: doc.client_domain_id,
                materiel_id: doc.materiel_id,
                suggest_price: doc.suggest_price,
                end_date: doc.end_date,
                start_date: doc.start_date,
                produce_client_state: doc.produce_client_state,
                produce_client_type:GLBConfig.ENABLE
            });
            common.sendData(res, usergroup);
        }
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//查询 体验馆详情->企业客户 详情信息
async function StaffControlSRVSearch(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};

        let queryStr=`select * from tbl_erc_businessdomain where state = 1`
        if (doc.domain) {
            queryStr += ' and domain = ?'
            replacements.push(doc.domain)
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//查询企业客户销售价格
async function search_price(req, res) {
    try {
        let doc = req.body;
        let returnData = {};
        let user = req.user;
        let materielIdArr=[];
        let materielIdArr1=[];

        //查询单独编辑的物料价格
        let produceclient = await tb_produce_client.findOne({
            where:{
                client_domain_id: doc.domain_id,
                state:GLBConfig.ENABLE,
                produce_client_type:GLBConfig.ENABLE
            }
        });
        if(produceclient){
            let replacements1 = [doc.domain_id,GLBConfig.ENABLE];
            let queryStr1 = 'select t.materiel_id ' +
                'from tbl_erc_produce_client t ' +
                'where t.materiel_id is not null and t.client_domain_id=? and t.state=? and produce_client_type=1 ';
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

        let replacements2 = [GLBConfig.ENABLE,doc.domain_id,GLBConfig.ENABLE,GLBConfig.ENABLE,user.domain_id,GLBConfig.ENABLE,pricetemplate.producepricetemplate_id,user.domain_id,GLBConfig.ENABLE];

        let queryStr = 'select b.* from (select a.* from ' +
            '(select pc.materiel_id,m.materiel_code as materiel_code, ' +
            'm.materiel_name,m.materiel_format,m.materiel_unit,pc.suggest_price as PRICE,pc.domain_id,pc.start_date as start_date,pc.end_date ' +
            'from tbl_erc_produce_client pc ' +
            'inner join tbl_erc_materiel m on pc.materiel_id = m.materiel_id and m.state = ? ' +
            'where pc.client_domain_id = ? and pc.state = ? and produce_client_type = 1 ' +
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
//保存企业客户详情信息
async function saveAct(req,res){
    try {
        let doc = common.docTrim(req.body),

            user = req.user,
            replacements = [],addProduce;
        logger.info(doc)
        let bussinfo = await tb_businessdomain.findOne({
            where:{
                domain: doc.domain
            }
        });
        if(bussinfo){
            bussinfo.business_contact_qq =doc.business_contact_qq
            bussinfo.business_contact_wechat =doc.business_contact_wechat
            bussinfo.legalperson_contact =doc.legalperson_contact
            bussinfo.legalperson_phone =doc.legalperson_phone
            bussinfo.legalperson_contact_wechat =doc.legalperson_contact_wechat
            bussinfo.legalperson_contact_qq =doc.legalperson_contact_qq
            bussinfo.settlementway =doc.settlementway
            bussinfo.mouthsettlement =doc.mouthsettlement
            await bussinfo.save()
        }else{
            let usergroup = await tb_businessdomain.create({
                domain: doc.domain,
                businesscustomer_type: '1',
                business_contact_qq: doc.business_contact_qq,
                business_contact_wechat: doc.business_contact_wechat,
                legalperson_contact: doc.legalperson_contact,
                legalperson_phone: doc.legalperson_phone,
                legalperson_contact_wechat: doc.legalperson_contact_wechat,
                legalperson_contact_qq: doc.legalperson_contact_qq,
                settlementway: doc.settlementway,
                mouthsettlement: doc.mouthsettlement,

            });
            common.sendData(res, usergroup);
        }
        common.sendData(res, bussinfo)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//修改企业客户详情信息
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let modCC = await tb_businessdomain.findOne({
            where: {
                domain: doc.old.domain
            }
        });
        let mod = await tb_common_domain.findOne({
            where: {
                domain: doc.old.domain
            }
        });
        let business_tax = 0
        if (doc.new.business_tax != undefined) {
            business_tax = (doc.new.business_tax).replace(/%/g,"")
        }
        if (modCC) {
            modCC.businesscustomer_type = doc.new.businesscustomer_type;
            modCC.businessregistration = doc.new.businessregistration;
            modCC.business_tax = business_tax/100;
            await modCC.save();

            if(mod){
                mod.domain_fax = doc.new.domain_fax;
                await mod.save();
            }
            returnData.modCC=modCC;
            returnData.mod=mod;
            returnData.modCC.business_tax= ((modCC.business_tax*100).toFixed(2)) +'%';
            common.sendData(res, returnData);
        } else {
            common.sendError(res, 'customer_03');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}
//查询企业客户销售价格
exports.searchPrice = async(req,domain_id,client_domain_id,searchParams) => {
    try {
        let returnData = {};
        let materielIdArr=[];
        let materielIdArr1=[];

        //查询单独编辑的物料价格
        let produceclient = await tb_produce_client.findOne({
            where:{
                client_domain_id: client_domain_id,
                state:GLBConfig.ENABLE,
                produce_client_type:GLBConfig.ENABLE
            }
        });
        if(produceclient){
            let replacements1 = [client_domain_id,GLBConfig.ENABLE];
            let queryStr1 = 'select t.materiel_id ' +
                'from tbl_erc_produce_client t ' +
                'where t.materiel_id is not null and t.client_domain_id=? and t.state=? and produce_client_type=1 ';
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
                domain_id: domain_id,
                state:GLBConfig.ENABLE
            }
        });
        if(pricetemplate){
            let replacements1 = [GLBConfig.ENABLE,domain_id,GLBConfig.ENABLE,pricetemplate.producepricetemplate_id];
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

        let replacements2 = [GLBConfig.ENABLE,client_domain_id,GLBConfig.ENABLE,GLBConfig.ENABLE,domain_id,GLBConfig.ENABLE,pricetemplate.producepricetemplate_id,domain_id,GLBConfig.ENABLE];

        let queryStr = 'select b.* from (select a.* from ' +
            '(select pc.materiel_id,m.materiel_code as materiel_code, ' +
            'm.materiel_name,m.materiel_format,m.materiel_unit,pc.suggest_price as PRICE,pc.domain_id,pc.start_date as start_date,pc.end_date ' +
            'from tbl_erc_produce_client pc ' +
            'inner join tbl_erc_materiel m on pc.materiel_id = m.materiel_id and m.state = ? ' +
            'where pc.client_domain_id = ? and pc.state = ? and produce_client_type=1 ' +
            'UNION ALL ' +
            'select mt1.materiel_id,mt1.materiel_code, ' +
            'mt1.materiel_name,mt1.materiel_format,mt1.materiel_unit,t.suggest_price as PRICE,t.domain_id,t.start_date,t.end_date ' +
            'from tbl_erc_producepricetemplatedetail t ' +
            'inner join tbl_erc_materiel mt1 on t.materiel_id = mt1.materiel_id and mt1.state=? ' +
            'where t.domain_id=? and t.state=? and t.producepricetemplate_id=? ';
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
        queryStr+=' )a where 1=1 ';
        if (searchParams.materiel_id) {
            queryStr += ' and a.materiel_id=? ';
            replacements2.push(searchParams.materiel_id)
        }
        if (searchParams.search_text) {
            queryStr += ' and (a.materiel_code like ? or a.materiel_name like ?) ';
            replacements2.push('%' + searchParams.search_text + '%')
            replacements2.push('%' + searchParams.search_text + '%')
        }
        queryStr+='order by a.materiel_id)b ';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements2);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.start_date = r.start_date ? moment(r.start_date).format("YYYY-MM-DD") : null;
            result.end_date = r.end_date ? moment(r.end_date).format("YYYY-MM-DD") : null;

            returnData.rows.push(result)
        }

        return returnData;

    } catch (error) {
        logger.info("物料价格获取错误！")
        return null;
    }
};

