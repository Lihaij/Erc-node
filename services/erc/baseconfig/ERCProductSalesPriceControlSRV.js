/**
 * Created by shuang.liu on 18/7/25.
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCProductSalesPriceControlSRV');
const model = require('../../../model');
const moment = require('moment');

const sequelize = model.sequelize;
const tb_user = model.user;
const tb_producepricetemplate = model.erc_producepricetemplate;
const tb_producepricetemplatedetail = model.erc_producepricetemplatedetail;

exports.ERCProductSalesPriceControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search_t') {
        searchTemplateAct(req, res)
    } else if (method === 'add_t') {
        addTemplateAct(req, res)
    } else if (method === 'modify_t') {
        modifyTemplateAct(req, res)
    } else if (method === 'delete_t') {
        deleteTemplateAct(req, res)
    } else if (method === 'search_d') {
        searchTemplateDetailAct(req, res)
    } else if (method === 'modify_d') {
        modifyTemplateDetailAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
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
async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};

        returnData.stateInfo = GLBConfig.USERSTATE; //状态
        returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW');
        returnData.xssysl = await getBaseType('XSSYSL',req.user.domain_id)
        returnData.jgqyxddj = await getBaseType('JGQYXDDJ')
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//获取企业客户销售价格模板
async function searchTemplateAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements = [GLBConfig.ENABLE,user.domain_id];

        let queryStr = 'select * from tbl_erc_producepricetemplate t where t.state=? and t.domain_id=?';
        if (doc.search_text) {
            let search_text = '%'+doc.search_text+'%';
            queryStr += ' and t.producepricetemplate_name like ? ';
            replacements.push(search_text)
        }
        queryStr+=' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//新增价格模板
async function addTemplateAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let template = await tb_producepricetemplate.findOne({
            where: {
                producepricetemplate_name: doc.producepricetemplate_name,
                domain_id: user.domain_id,
                state:GLBConfig.ENABLE
            }
        });

        if (template) {
            common.sendError(res, 'template_01');
            return
        }

        let addTemplate = await tb_producepricetemplate.create({
            producepricetemplate_name: doc.producepricetemplate_name,
            domain_id: user.domain_id
        });

        common.sendData(res, addTemplate);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

//修改价格模板
async function modifyTemplateAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

        let template = await tb_producepricetemplate.findOne({
            where: {
                producepricetemplate_id: doc.old.producepricetemplate_id
            }
        });

        if (template) {
            template.producepricetemplate_name = doc.new.producepricetemplate_name;

            await template.save()
        } else {
            return common.sendError(res, 'template_02');

        }
        common.sendData(res, template);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//删除模板
async function deleteTemplateAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

        let template = await tb_producepricetemplate.findOne({
            where: {
                producepricetemplate_id: doc.producepricetemplate_id,
                state: GLBConfig.ENABLE
            }
        });

        if (template) {
            template.state = GLBConfig.DISABLE;
            await template.save();
            common.sendData(res, template);
        } else {
            common.sendError(res, 'template_02');
            return
        }
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//获取模板详情
async function searchTemplateDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements1 = [GLBConfig.ENABLE,user.domain_id,GLBConfig.ENABLE,doc.producepricetemplate_id];
        let replacements2 = [GLBConfig.ENABLE,user.domain_id,GLBConfig.ENABLE,doc.producepricetemplate_id,user.domain_id,GLBConfig.ENABLE];
        let queryStr1 = 'select mt1.materiel_id ' +
            'from tbl_erc_producepricetemplatedetail t ' +
            'inner join tbl_erc_materiel mt1 on t.materiel_id = mt1.materiel_id and mt1.state=? ' +
            'where t.domain_id=? and t.state=? and t.producepricetemplate_id=? ';
        let result1 = await common.queryWithCount(sequelize, req, queryStr1, replacements1);
        let materielIdArr=[];
        for (let r of result1.data) {
            let result = JSON.parse(JSON.stringify(r));
            materielIdArr.push(result.materiel_id);
        }

        let queryStr = 'select * from ' +
            '(select mt1.materiel_id,mt1.materiel_code,mt1.materiel_name,mt1.materiel_format,mt1.materiel_unit,t.suggest_price,t.start_date,t.end_date,t.price_state,t.price_xssysl,t.price_jgqyxddj ' +
            'from tbl_erc_producepricetemplatedetail t ' +
            'inner join tbl_erc_materiel mt1 on t.materiel_id = mt1.materiel_id and mt1.state=? ' +
            'where t.domain_id=? and t.state=? and t.producepricetemplate_id=? ' +
            'UNION ' +
            'select mt2.materiel_id,mt2.materiel_code,mt2.materiel_name,mt2.materiel_format,mt2.materiel_unit,mt2.materiel_sale as suggest_price,"" as start_date,"" as end_date,1 as price_state,"" as price_xssysl,"" as price_jgqyxddj ' +
            'from tbl_erc_materiel mt2 ' +
            'where mt2.domain_id=? and mt2.state=? and mt2.materiel_state_management in (0,1,2)';
        if(materielIdArr!=null && materielIdArr.length>0){
            let queryInStr= 'not in (' + materielIdArr.join(",") + ')';
            queryStr += 'and mt2.materiel_id '+queryInStr;

        }
        if (doc.search_text) {
            let search_text = '%'+doc.search_text+'%';
            queryStr += ' and (materiel_name like ? or materiel_code like ?) ';
            replacements2.push(search_text)
            replacements2.push(search_text)
        }
        queryStr+=' order by materiel_id desc)a';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements2);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.start_date = r.start_date ? moment(r.start_date).format("YYYY-MM-DD") : null;
            result.end_date = r.end_date ? moment(r.end_date).format("YYYY-MM-DD") : null;

            returnData.rows.push(result)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//修改模板详情
async function modifyTemplateDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        //先删除
        let replacements = [user.domain_id,doc.old.materiel_id,doc.new.producepricetemplate_id];
        let queryStr = 'delete from tbl_erc_producepricetemplatedetail where domain_id=? and materiel_id=? and producepricetemplate_id=? ';
        await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.DELETE});

        //再添加(启用 price_state：1，停用 price_state：0)
        let addTemplateDetail = await tb_producepricetemplatedetail.create({
            producepricetemplate_id: doc.new.producepricetemplate_id,
            domain_id: user.domain_id,
            materiel_id: doc.old.materiel_id,
            suggest_price: doc.new.suggest_price,
            start_date: doc.new.start_date,
            end_date: doc.new.end_date,
            price_state: doc.new.price_state,
            price_xssysl: doc.new.price_xssysl,
            price_jgqyxddj: doc.new.price_jgqyxddj
        });

        common.sendData(res, addTemplateDetail);

    } catch (error) {
        return common.sendFault(res, error);
    }
}
