//设计基本信息-园区企业管理
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCParkDataControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');

const tb_park_data = model.erc_park_data;//园区二十四项基本数据
const tb_park_company = model.erc_park_company//园区企业
const tb_park_supplier = model.erc_park_supplier//园区供应商
const tb_park_purchase = model.erc_park_purchase;//园区二十四项企业信息

// 园区企业增删改查接口
exports.ERCParkDataControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'add') {//新增
        addAct(req, res)
    } else if (method === 'modify') {//修改
        modifyAct(req, res)
    } else if (method === 'delete') {
        deleteAct(req, res)
    } else if (method === 'search') {//本企业录入的信息
        searchAct(req, res)
    } else if (method === 'search_deatils') {//园区当年十二月信息某项信息
        SearchOneOfThisYear(req, res)
    // } else if (method === 'search_lasrdeatils') {//园区去年总体十二月信息  某项信息
    //     SearchLastYear(req, res)
    } else if (method === 'this_month') {//园区当月二十四项所有数据 计算环比
        this_month(req, res)
    } else if (method === 'last_month') {//园区上月二十四项所有数据
        last_month(req, res)
    } else if (method === 'last_on_month') {//园区去年同月二十四项所有数据
        last_on_month(req, res)
    } else if (method === 'talentCount') {//园区个企业人才统计栏？？
        TalentCountAct(req, res)
    } else if (method === 'thisyear_count') {//园区当年二十四项信息总数
        thisyear_count(req, res)
    } else if (method === 'thismonth_count') {//园区当月二十四项信息总数
        thismonth_count(req, res)
    } else if (method === 'lastmonth_count') {//园区上月二十四项信息总数
        lastmonth_count(req, res)
    } else if (method === 'last_year_month') {//园区去年上月二十四项信息总数
        last_year_month(req, res)
    }else if (method === 'twenty_four') {//园区二十四项
        twenty_four(req, res)
    }else if (method === 'pie_chart') {//三个饼状图
        pie_chart(req, res)
    }else if (method === 'getDateByMonth') {//获取企业上月数据  以便录入
        getDateByMonth(req, res)
    }else if (method === 'currentMonthTotal') {//当前各月累计
        currentMonthTotal(req, res)
    } else if (method === 'lastyear_count') {//园区去年二十四项信息总数
        lastyear_count(req, res)
    } else if (method === 'showDeatilsByDomainId') {//当年每个企业十二个月的二十四项数据展示
        showDeatilsByDomainId(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};
//初始化参数
async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {
            TFINFO: GLBConfig.TFINFO,//是否
            //
            companyInfo: []//选择企业录入
        };
        let project_company = await tb_park_company.findAll({
            where: {
                // domain_id: req.user.domain_id,
                state: GLBConfig.ENABLE
            }
        });
        for (let l of project_company) {
            returnData.companyInfo.push({
                id: l.park_company_id,
                value: l.park_company_id,
                text: l.company_name
            });
        }

        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
// 增加企业信息
async function addAct(req, res) {
    try {

        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [];
        let data_result=await getParkDataByDate(doc.record_date,user);
        if(data_result.length>0){
            let park_data = await tb_park_data.findOne({
                where: {
                    park_data_id: data_result[0].park_data_id
                }
            });
            if (park_data) {
                // park_company_id=doc.park_company_id,//企业id
                park_data.record_date = doc.record_date,//记录的时间-月份
                    park_data.gdp = doc.gdp,//
                    park_data.sales = doc.sales, //销售额(万元)
                    park_data.subscription_capital= doc.subscription_capital,//认缴资本
                    park_data.paidin_capital= doc.subscription_capital,//实收资本
                    park_data.tax_payment = doc.tax_payment,//纳税总额
                    park_data.deductible_input_tax = doc.deductible_input_tax,//待抵扣进项税额
                    park_data.profit_tax = doc.profit_tax,//利税总额
                    park_data.safeproduction_days = doc.safeproduction_days, //安全生产天数
                    park_data.patents_num = doc.patents_num, //专利数量
                    park_data.project_RD_num = doc.project_RD_num, //研发立项数量
                    park_data.land_use = doc.land_use, //(平方)
                    park_data.construct_area = doc.construct_area,//建筑情况(平方)
                    park_data.planned_investment = doc.planned_investment, //计划投资额
                    park_data.actual_investment = doc.actual_investment, //实际投资额
                    park_data.fixed_assets = doc.fixed_assets, //固定资产投资总额
                    park_data.production_equipment_investment = doc.production_equipment_investment,//生产设备投资额
                    //talents_num, //人才数量(个)   包含院士以上、博士、硕士、本科
                    park_data.academicians_num = doc.academicians_num,//
                    park_data.doctors_num = doc.doctors_num,//
                    park_data.masters_num = doc.masters_num,//
                    park_data.undergraduates_num = doc.undergraduates_num,//
                    park_data.RD_investment = doc.RD_investment, //研发投入金额
                    park_data.energy_consumption = doc.energy_consumption, //能源消耗金额
                    park_data.electricity_consumption = doc.electricity_consumption, //用电情况(度)
                    park_data.water_consumption = doc.water_consumption, //水资源消耗情况(立方)
                    park_data.gas_consumption = doc.gas_consumption, //气资源消耗情况(立方)
                    park_data.gov_subsidies = doc.gov_subsidies, //政府补助情况(万元)
                    park_data.gov_support_project = doc.gov_support_project, //政府扶持项目申报情况(个)??  当月申请金额??
                    park_data.gov_support_amount = doc.gov_support_amount,//政府扶持项目当月申请金额
                    park_data.environment_protection = doc.environment_protection, //环保情况(个)
                    park_data.coal_consumption = doc.coal_consumption//煤资源消耗情况(立方)
    
                    park_data.floor_area=doc.floor_area, //占地面积
                    park_data.production_area=doc.production_area,//生产面积
                    park_data.office_space=doc.office_space,//办公面积
                    park_data.death_toll=doc.death_toll,//死亡人数
                    park_data.injured_num=doc.injured_num,//受伤人数
                    park_data.envir_punished=doc.envir_punished,//是否被环保处罚
                    park_data.self_test=doc.self_test,//是否环保自我检测

                    park_data.utility=doc.utility;//实用新型
                    park_data.outward=doc.outward;//外观设计
                    park_data.dormitory_area=doc.dormitory_area;//宿舍面积
                    park_data.high_tech=doc.high_tech;//是否高新技术企业
                    park_data.registered_capital=doc.registered_capital;//各月实存注册资本

                    await park_data.save();
                return common.sendData(res, park_data)
            } else {
                return common.sendError(res, 'park_data_02');
            }
        //    return sendError(res, 'data_exit')
        }
        let park_data = await tb_park_data.create({
            domain_id: user?user.domain_id : 0,//?
            park_company_id: doc.park_company_id,//企业id
            record_date: doc.record_date,//记录的时间-月份
            gdp: doc.gdp,//
            sales: doc.sales, //销售额(万元)
            subscription_capital: doc.subscription_capital,//认缴资本
		    paidin_capital: doc.subscription_capital,//实收资本
            tax_payment: doc.tax_payment,//纳税总额
            deductible_input_tax: doc.deductible_input_tax,//待抵扣进项税额
            profit_tax: doc.profit_tax,//利税总额
            safeproduction_days: doc.safeproduction_days, //安全生产天数
            patents_num: doc.patents_num, //专利数量
            project_RD_num: doc.project_RD_num, //研发立项数量
            land_use: doc.land_use, //(平方)
            construct_area: doc.construct_area,//建筑情况(平方)
            planned_investment: doc.planned_investment, //计划投资额
            actual_investment: doc.actual_investment, //实际投资额
            fixed_assets: doc.fixed_assets, //固定资产投资总额
            production_equipment_investment: doc.production_equipment_investment,//生产设备投资额
            //talents_num, //人才数量(个)   包含院士以上、博士、硕士、本科
            academicians_num: doc.academicians_num,//
            doctors_num: doc.doctors_num,//
            masters_num: doc.masters_num,//
            undergraduates_num: doc.undergraduates_num,//
            RD_investment: doc.RD_investment, //研发投入金额
            energy_consumption: doc.energy_consumption, //能源消耗金额
            electricity_consumption: doc.electricity_consumption, //用电情况(度)
            water_consumption: doc.water_consumption, //水资源消耗情况(立方)
            gas_consumption: doc.gas_consumption, //气资源消耗情况(立方)
            gov_subsidies: doc.gov_subsidies, //政府补助情况(万元)
            gov_support_project: doc.gov_support_project, //政府扶持项目申报情况(个)??  当月申请金额??
            gov_support_amount: doc.gov_support_amount,//政府扶持项目当月申请金额
            environment_protection: doc.environment_protection, //环保情况(个)
            coal_consumption: doc.coal_consumption,//煤资源消耗情况(立方)

            floor_area:doc.floor_area, //占地面积
            production_area:doc.production_area,//生产面积
            office_space:doc.office_space,//办公面积
            death_toll:doc.death_toll,//死亡人数
            injured_num:doc.injured_num,//受伤人数
            envir_punished:doc.envir_punished,//是否被环保处罚
            self_test:doc.self_test,//是否环保自我检测

            utility:doc.utility,//实用新型
            outward:doc.outward,//外观设计
            dormitory_area:doc.dormitory_area,//宿舍面积
            high_tech:doc.high_tech,//是否高新技术企业
            registered_capital:doc.registered_capital,//各月实存注册资本

        });
        common.sendData(res, park_data);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
};
//修改二十四项企业信息
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let park_data = await tb_park_data.findOne({
            where: {
                park_data_id: doc.park_data_id
            }
        });
        if (park_data) {
            // park_company_id=doc.park_company_id,//企业id
            park_data.record_date = doc.record_date,//记录的时间-月份
                park_data.gdp = doc.gdp,//
                park_data.sales = doc.sales, //销售额(万元)
                park_data.subscription_capital= doc.subscription_capital,//认缴资本
                park_data.paidin_capital= doc.subscription_capital,//实收资本
                park_data.tax_payment = doc.tax_payment,//纳税总额
                park_data.deductible_input_tax = doc.deductible_input_tax,//待抵扣进项税额
                park_data.profit_tax = doc.profit_tax,//利税总额
                park_data.safeproduction_days = doc.safeproduction_days, //安全生产天数
                park_data.patents_num = doc.patents_num, //专利数量
                park_data.project_RD_num = doc.project_RD_num, //研发立项数量
                park_data.land_use = doc.land_use, //(平方)
                park_data.construct_area = doc.construct_area,//建筑情况(平方)
                park_data.planned_investment = doc.planned_investment, //计划投资额
                park_data.actual_investment = doc.actual_investment, //实际投资额
                park_data.fixed_assets = doc.fixed_assets, //固定资产投资总额
                park_data.production_equipment_investment = doc.production_equipment_investment,//生产设备投资额
                //talents_num, //人才数量(个)   包含院士以上、博士、硕士、本科
                park_data.academicians_num = doc.academicians_num,//
                park_data.doctors_num = doc.doctors_num,//
                park_data.masters_num = doc.masters_num,//
                park_data.undergraduates_num = doc.undergraduates_num,//
                park_data.RD_investment = doc.RD_investment, //研发投入金额
                park_data.energy_consumption = doc.energy_consumption, //能源消耗金额
                park_data.electricity_consumption = doc.electricity_consumption, //用电情况(度)
                park_data.water_consumption = doc.water_consumption, //水资源消耗情况(立方)
                park_data.gas_consumption = doc.gas_consumption, //气资源消耗情况(立方)
                park_data.gov_subsidies = doc.gov_subsidies, //政府补助情况(万元)
                park_data.gov_support_project = doc.gov_support_project, //政府扶持项目申报情况(个)??  当月申请金额??
                park_data.gov_support_amount = doc.gov_support_amount,//政府扶持项目当月申请金额
                park_data.environment_protection = doc.environment_protection, //环保情况(个)
                park_data.coal_consumption = doc.coal_consumption//煤资源消耗情况(立方)

                park_data.floor_area=doc.floor_area, //占地面积
                park_data.production_area=doc.production_area,//生产面积
                park_data.office_space=doc.office_space,//办公面积
                park_data.death_toll=doc.death_toll,//死亡人数
                park_data.injured_num=doc.injured_num,//受伤人数
                park_data.envir_punished=doc.envir_punished,//是否被环保处罚
                park_data.self_test=doc.self_test,//是否环保自我检测

                park_data.utility=doc.utility;//实用新型
                park_data.outward=doc.outward;//外观设计
                park_data.dormitory_area=doc.dormitory_area;//宿舍面积
                park_data.high_tech=doc.high_tech;//是否高新技术企业
                park_data.registered_capital=doc.registered_capital;//各月实存注册资本
                await park_data.save();
            common.sendData(res, park_data)
        } else {
            common.sendError(res, 'park_data_02');
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};
//通过日期查找，存在则提醒用户已录入该企业本年月数据
async function getParkDataByDate(record_date,user) {
    try {
        let r = false,replacements=[];
        let y=record_date.substr(0,4);
        let m=record_date.substr(5,2);
        console.log('月',m);
        console.log('年',y);
        console.log('年',user.domain_id);
        // const result = await tb_park_data.findOne({
        //     where: {
        //         record_date,
        //         domain_id:user.domain_id,
        //     }
        // });
        let queryStr = 'select t.park_data_id from tbl_erc_park_data t' +
        ' where t.state = 1 and t.domain_id= ? and YEAR(t.record_date)= ? and MONTH(t.record_date)=?';
        replacements.push(user.domain_id);
        replacements.push(y);
        replacements.push(m);
        let result = await common.simpleSelect(sequelize,queryStr, replacements);

        r = result;

        return r;
    } catch (error) {
        common.sendFault(res, error);
    }
};
//删除数据信息
async function deleteAct(req, res) {
    try {
        const { body } = req;
        const { park_data_id } = body;

        const result = await tb_park_data.findOne({
            where: {
                park_data_id
            }
        });

        if (result) {
            result.state = GLBConfig.DISABLE;
            await result.save();
        }

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//查询获取二十四项企业信息
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};

        let result = await getData(req, res, false, doc);

        returnData.total = result.count;
        returnData.rows = result.data;

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
//获取数据
async function getData(req, res, is_single, doc) {
    const { body, user } = req;
    const { park_purchase_id } = body;
    let replacements = [];

    let queryStr = 'select cd.domain_name as company_name,c.park_company_id as company_id,t.* from tbl_erc_park_data t ' +
        ' inner join tbl_erc_park_company c on c.domain_id=t.domain_id'+
        ' inner join tbl_common_domain cd on cd.domain_id=t.domain_id'+
        ' where cd.state = 1 and t.domain_id=?';
    replacements.push(user.domain_id);
    if(doc.year){
            queryStr += ' and YEAR(t.record_date)=?';
            replacements.push(doc.year);
    }else{
        queryStr += ' and YEAR(t.record_date)=YEAR(NOW())';
    }
    queryStr += ' order by t.record_date ASC';
    
    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
        r.record_date = r.record_date ? r.record_date.Format('yyyy-MM') : null;

    }

    if (is_single == true) {
        return result.data[0];
    } else {
        return result;
    }
};
//查询获取园区当年某项基本信息(十二个月)
async function SearchOneOfThisYear(req, res) {
    try {
        let returnData = {};

        const { body, user } = req;
        //fieldName,为查询的某一项数据,即字段名
        const { item } = body;
        if(!item){
            return common.sendError(res, 'park_data_item');
        }
        let replacements = [];
        let items=new Set(['safeproduction_days','project_RD_num','envir_punished']);
        let fieldName='t.'+item;
        if(item=='talents_num'){
            fieldName='t.academicians_num+t.doctors_num+t.masters_num+t.undergraduates_num';
        }else if(item=='patents_num'){
            fieldName='t.patents_num+t.utility+t.outward';
        }else if(item=='energy_amount'){
            // fieldName='CONVERT(t.electricity_consumption+t.water_consumption+t.gas_consumption+t.coal_consumption,DECIMAL(10,2))';
            fieldName='CONVERT(t.energy_consumption,DECIMAL(10,2))';
        }else if(item=='production_area'){
            fieldName='CONVERT(t.production_area+t.office_space+t.dormitory_area)';//生产、办公、宿舍面积之和
        }else if(items.has(item)){
            fieldName='t.'+item;
        }else{
            fieldName='CONVERT(t.'+item+',DECIMAL(10,2))';
        }
        let str='select cd.domain_name as company_name,max(case MONTH(t.record_date) when 1  then #{field} else 0 end) as Jan,' +
        'max(case MONTH(t.record_date) when 2 then #{field} else 0 end) as Feb,' +
        'max(case MONTH(t.record_date) when 3 then #{field} else 0 end) as Mar,' +
        'max(case MONTH(t.record_date) when 4 then #{field} else 0 end) as Apr,' +
        'max(case MONTH(t.record_date) when 5 then #{field} else 0 end) as May,' +
        'max(case MONTH(t.record_date) when 6 then #{field} else 0 end) as June,' +
        'max(case MONTH(t.record_date) when 7 then #{field} else 0 end) as July,' +
        'max(case MONTH(t.record_date) when 8 then #{field} else 0 end) as Aug,' +
        'max(case MONTH(t.record_date) when 9 then #{field} else 0 end) as Sept,' +
        'max(case MONTH(t.record_date) when 10 then #{field} else 0 end) as Oct,' +
        'max(case MONTH(t.record_date) when 11 then #{field} else 0 end) as Nov,' +
        'max(case MONTH(t.record_date) when 12 then #{field} else 0 end) as Dece,' +
        'ifnull(sum(#{field}),0) as total,min(t.created_at) as cre' +
        ' from tbl_erc_park_data t' +
        // ' inner join tbl_erc_park_company c on c.domain_id=t.domain_id'+
        ' right join tbl_common_domain cd on cd.domain_id=t.domain_id';

        let queryStr = str+
            ' where YEAR(t.record_date)=YEAR(NOW()) and t.state = 1';
            queryStr +=' group by t.domain_id';
            queryStr +=' order by sum(#{field}) desc,min(t.created_at)';
        let newQueryStr=queryStr.replace(/#{field}/g, fieldName);
        // let result = await common.queryWithCount(sequelize, req, newQueryStr, replacements);
        let result = await common.simpleSelect(sequelize, newQueryStr, replacements);
        let num=1;
        for (let r of result) {
            r.rowNum=num++;
            r.cre = r.cre ? r.cre.Format('yyyy-MM-dd') : null;
        }
        let queryStr1 = str+
        ' where YEAR(t.record_date)=YEAR(NOW()) and t.state = 1';
        let newQueryStr1=queryStr1.replace(/#{field}/g, fieldName);
        // let result = await common.queryWithCount(sequelize, req, newQueryStr, replacements);
        let result1 = await common.simpleSelect(sequelize, newQueryStr1, []);//汇总
        let queryStr2 = str+
        ' where YEAR(t.record_date)=YEAR(NOW())-1 and t.state = 1';
        let newQueryStr2=queryStr2.replace(/#{field}/g, fieldName);
        // let result = await common.queryWithCount(sequelize, req, newQueryStr, replacements);
        let result2 = await common.simpleSelect(sequelize, newQueryStr2, []);//上年同期
        result1[0].company_name='汇总';
        result2[0].company_name='上年同期';
        result.push(result1[0]);
        result.push(result2[0]);
        return common.sendData(res, result);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function currentMonthTotal(req, res) {
    try {
        let result = {};

        const { body, user } = req;
        //fieldName,为查询的某一项数据,即字段名
        const { item } = body;
        if(!item){
            return common.sendError(res, 'park_data_item');
        }
        let items=new Set(['safeproduction_days','project_RD_num','envir_punished']);
        let replacements = [];
        let fieldName=item;
        if(item=='talents_num'){
            fieldName='t.academicians_num+t.doctors_num+t.masters_num+t.undergraduates_num';
        }else if(item=='patents_num'){
            fieldName='t.patents_num+t.utility+t.outward';
        }else if(item=='energy_amount'){
            // fieldName='CONVERT(t.electricity_consumption+t.water_consumption+t.gas_consumption+t.coal_consumption,DECIMAL(10,2))';
            fieldName='CONVERT(t.energy_consumption,DECIMAL(10,2))';
        }else if(items.has(item)){
            fieldName='t.'+item;
        }else{
            fieldName='CONVERT(t.'+item+',DECIMAL(10,2))';
        }
        let strSingle='select cd.domain_name as company_name,max(case MONTH(t.record_date) when 1  then #{field} else 0 end) as Jan,' +
        'max(case MONTH(t.record_date) when 2 then #{field} else 0 end) as Feb,' +
        'max(case MONTH(t.record_date) when 3 then #{field} else 0 end) as Mar,' +
        'max(case MONTH(t.record_date) when 4 then #{field} else 0 end) as Apr,' +
        'max(case MONTH(t.record_date) when 5 then #{field} else 0 end) as May,' +
        'max(case MONTH(t.record_date) when 6 then #{field} else 0 end) as June,' +
        'max(case MONTH(t.record_date) when 7 then #{field} else 0 end) as July,' +
        'max(case MONTH(t.record_date) when 8 then #{field} else 0 end) as Aug,' +
        'max(case MONTH(t.record_date) when 9 then #{field} else 0 end) as Sept,' +
        'max(case MONTH(t.record_date) when 10 then #{field} else 0 end) as Oct,' +
        'max(case MONTH(t.record_date) when 11 then #{field} else 0 end) as Nov,' +
        'max(case MONTH(t.record_date) when 12 then #{field} else 0 end) as Dece,' +
        'ifnull(sum(#{field}),0) as total,min(t.created_at) as cre' +
        ' from tbl_erc_park_data t' +
        ' inner join tbl_common_domain cd on cd.domain_id=t.domain_id'+
        ' where YEAR(t.record_date)=YEAR(NOW()) and t.state = 1';

        let queryStr1 = 'select sum(case MONTH(t.record_date) when 1  then #{field} else 0 end) as Jan,' +
        'sum(case MONTH(t.record_date) when 1 then #{field} when 2 then #{field} else 0 end) as Feb,' +
        'sum(case MONTH(t.record_date) when 1 then #{field} when 2 then #{field} when 3 then #{field} else 0 end) as Mar,' +
        'sum(case MONTH(t.record_date) when 1 then #{field} when 2 then #{field} when 3 then #{field} when 4 then #{field} else 0 end) as Apr,' +
        'sum(case MONTH(t.record_date) when 1 then #{field} when 2 then #{field} when 3 then #{field} when 4 then #{field} when 5 then #{field} else 0 end) as May,' +
        'sum(case MONTH(t.record_date) when 1 then #{field} when 2 then #{field} when 3 then #{field} when 4 then #{field} when 5 then #{field} when 6 then #{field} else 0 end) as June,' +
        'sum(case MONTH(t.record_date) when 1 then #{field} when 2 then #{field} when 3 then #{field} when 4 then #{field} when 5 then #{field} when 6 then #{field}  when 7 then #{field} else 0 end) as July,' +
        'sum(case MONTH(t.record_date) when 1 then #{field} when 2 then #{field} when 3 then #{field} when 4 then #{field} when 5 then #{field} when 6 then #{field}  when 7 then #{field} when 8 then #{field} else 0 end) as Aug,' +
        'sum(case MONTH(t.record_date) when 1 then #{field} when 2 then #{field} when 3 then #{field} when 4 then #{field} when 5 then #{field} when 6 then #{field}  when 7 then #{field} when 8 then #{field} when 9 then #{field} else 0 end) as Sept,' +
        'sum(case MONTH(t.record_date) when 1 then #{field} when 2 then #{field} when 3 then #{field} when 4 then #{field} when 5 then #{field} when 6 then #{field}  when 7 then #{field} when 8 then #{field} when 9 then #{field}  when 10 then #{field} else 0 end) as Oct,' +
        'sum(case MONTH(t.record_date) when 1 then #{field} when 2 then #{field} when 3 then #{field} when 4 then #{field} when 5 then #{field} when 6 then #{field}  when 7 then #{field} when 8 then #{field} when 9 then #{field}  when 10 then #{field}  when 11 then #{field} else 0 end) as Nov,' +
        'sum(#{field}) as Dece,' +
        'ifnull(sum(#{field}),0) as total,min(t.created_at) as cre' +
        ' from tbl_erc_park_data t' +
        // ' inner join tbl_erc_park_company c on c.domain_id=t.domain_id'+
        ' inner join tbl_common_domain cd on cd.domain_id=t.domain_id'+
        ' where YEAR(t.record_date)=YEAR(NOW()) and t.state = 1';
        let newQueryStr1=queryStr1.replace(/#{field}/g, fieldName);
        let result1 = await common.simpleSelect(sequelize, newQueryStr1, []);//各月累计
        result1[0].total_name='当年各月累计';
        result['currentMonthTotal']=result1[0];
        if(item=='safeproduction_days'){//
         let queryStr2 = queryStr1.replace(/#{field}/g, 'death_toll');
        let result2 = await common.simpleSelect(sequelize, queryStr2, []);
        let queryStr3 = queryStr1.replace(/#{field}/g, 'injured_num');
        let result3 = await common.simpleSelect(sequelize, queryStr3, []);
        let queryStr4 = strSingle.replace(/#{field}/g, 'injured_num');
        let result4 = await common.simpleSelect(sequelize, queryStr4, []);
        // result['currentMonthTotal'].total_name='无重大安全天数每月累计';
            result2[0].total_name='各月死亡人数累计';
            result['selfTestTotal']=result2[0];
            result3[0].total_name='各月受伤人数累计';
            result['currentMonthTotal']=result3[0];
            result4[0].total_name='各月受伤人数';
            result['punishTotal']=result4[0];
        }
        if(item=='envir_punished'){//环保情况
            let str='select sum(#{field}) as total ' +
            ' from tbl_erc_park_data t ' +
            ' right join tbl_common_domain cd on cd.domain_id=t.domain_id'+
            ' where YEAR(t.record_date)=YEAR(NOW()) and MONTH(t.record_date)=MONTH(NOW()) and cd.state=1 and t.state = 1';//
            let queryStr5 = str.replace(/#{field}/g, 'envir_punished');
            let result5 = await common.simpleSelect(sequelize, queryStr5, []);
            let queryStr6 = str.replace(/#{field}/g, 'self_test');
            let result6 = await common.simpleSelect(sequelize, queryStr6, []);
            str='select sum(#{field}) as total ' +
            ' from tbl_erc_park_data t ' +
            ' right join tbl_common_domain cd on cd.domain_id=t.domain_id'+
            ' where YEAR(t.record_date)=YEAR(NOW()) and cd.state=1 and t.state = 1';
            let queryStr7 = str.replace(/#{field}/g, 'envir_punished');
            let result7 = await common.simpleSelect(sequelize, queryStr7, []);
            result7[0].total_name='当年处罚企业累计量'
            result['currentMonthTotal']=result7[0];
            result5[0].total_name='处罚企业当月量';
            result['punishTotal']=result5[0];
            result6[0].total_name='自我检测企业当月量';
            result['selfTestTotal']=result6[0];
        }
        if(item=='patents_num'){//发明专利
            let patentStr = queryStr1.replace(/#{field}/g, 'patents_num');
            let patent = await common.simpleSelect(sequelize, patentStr, []);
            let utilityStr = queryStr1.replace(/#{field}/g, 'utility');
            let utility = await common.simpleSelect(sequelize, utilityStr, []);
            let outwardStr = queryStr1.replace(/#{field}/g, 'outward');
            let outward = await common.simpleSelect(sequelize, outwardStr, []);
            result['currentMonthTotal'].total_name='专利汇总数每月累计';
            patent[0].total_name='发明专利数每月累计';
            result['patents']=patent[0];
            utility[0].total_name='实用新型数每月累计';
            result['utility']=utility[0];
            outward[0].total_name='外观设计数每月累计';
            result['outward']=outward[0];
        }
        if(item=='production_area'){//建筑情况
            let queryStr5 = strSingle.replace(/#{field}/g, 'office_space');
            let result5 = await common.simpleSelect(sequelize, queryStr5, []);
            let queryStr6 = strSingle.replace(/#{field}/g, 'dormitory_area');
            let result6 = await common.simpleSelect(sequelize, queryStr6, []);
            result['currentMonthTotal'].total_name='生产面积各月量';
            result5[0].total_name='办公面积各月量';
            result['punishTotal']=result5[0];
            result6[0].total_name='宿舍面积各月量';
            result['selfTestTotal']=result6[0];
        }
        return common.sendData(res, result);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
//获取三饼图
async function pie_chart(req, res) {
    try {
        const { body, user } = req;
        let now = new Date(); // 可以传值调式 NOW = NEW DATE(2019,2,30); 今天是3月30号
        let year = now.getFullYear();//getYear()+1900=getFullYear()
        let month = now.getMonth() + 1;//0-11表示1-12月
        if (parseInt(month) < 10) {
            month = "0" + month;
        }
        let beginYearMonthDate = year +'-01-01';
        now = year + '-' + month + '-01' ; // 如果取当月日期可直接 RETURN 返回
        let preYearMonthDate =  (year-1).toString()+month+'01'; //同比月份
        let preMonth = parseInt(month)  - 1;
        preMonth = preMonth < 10 ? '0' + preMonth : preMonth; // 获取上个月的值
        let preMonthDate =year + '-' + preMonth + '-01' ;

        if (parseInt(month) == 1 ) {//如果是1月份，要上个月 ，则取上一年的12月份
            preMonthDate = (parseInt(year) - 1) + '-12-01' ;
        }
        //fieldName,为查询的某一项数据,即字段名
        const { item } = body;
        if(! item ){
            return common.sendError(res, '-1','统计项不能为空');
        }
        let replacements = [];
        let fieldName=item;
        if(item=='talents_num'){
            fieldName='t.academicians_num+t.doctors_num+t.masters_num+t.undergraduates_num';
        }else if(item=='patents_num'){
            fieldName='t.patents_num+t.utility+t.outward';
        }else if(item=='energy_amount'){
            // fieldName='t.electricity_consumption+t.water_consumption+t.gas_consumption+t.coal_consumption';
            fieldName='t.energy_consumption';
        }else{
            fieldName='t.'+item;
        }
        if(item=='talents_num'){
            let returnData={};
            let queryStr = 'select ' +
            'sum(#{field}) as value ' +
            ' from tbl_erc_park_data t ' +
            ' right join tbl_common_domain cd on cd.domain_id=t.domain_id'+
            ' where DATE_FORMAT( record_date,\'%Y-%m-%d\')="' + preMonthDate + '" and cd.state=1 and t.state = 1';//
            let queryStr2 = 'select ' +
            'sum(#{field}) as value ' +
            ' from tbl_erc_park_data t ' +
            ' right join tbl_common_domain cd on cd.domain_id=t.domain_id'+
            ' where DATE_FORMAT( record_date,\'%Y-%m-%d\')="' + now + '" and cd.state=1 and t.state = 1';//
            let newQueryStr=queryStr.replace(/#{field}/g, "academicians_num");
            let r1=await common.simpleSelect(sequelize, newQueryStr, replacements);
            newQueryStr=queryStr.replace(/#{field}/g, "doctors_num");
            let r2=await common.simpleSelect(sequelize, newQueryStr, replacements);
            newQueryStr=queryStr.replace(/#{field}/g, "masters_num");
            let r3=await common.simpleSelect(sequelize, newQueryStr, replacements);
            newQueryStr=queryStr.replace(/#{field}/g, "undergraduates_num");
            let r4=await common.simpleSelect(sequelize, newQueryStr, replacements);
            for (let r of r1) {
                r.id = '1';
                r.name='院士及以上'
            }
            for (let r of r2) {
                r.id = '2';
                r.name='博士'
            }
            for (let r of r3) {
                r.id = '3';
                r.name='硕士'
            }
            for (let r of r4) {
                r.id = '4';
                r.name='本科'
            }
            r1.push(r2[0]);
            r1.push(r3[0]);
            r1.push(r4[0]);
            let total=0;
            for (let r of r1) {
                total += parseInt(r.value);
            }
            console.log('1111111111',total);
            if(total>0){
                for (let r of r1) {
                    r.persent = parseFloat(r.value/total).toFixed(4);
                }
            }else {
                for (let r of r1) {
                    r.persent =0;
                }
            }
            returnData['PreYearMonthStat']=r1;

            newQueryStr=queryStr2.replace(/#{field}/g, "academicians_num");
            r1=await common.simpleSelect(sequelize, newQueryStr, replacements);
            newQueryStr=queryStr2.replace(/#{field}/g, "doctors_num");
            r2=await common.simpleSelect(sequelize, newQueryStr, replacements);
            newQueryStr=queryStr2.replace(/#{field}/g, "masters_num");
            r3=await common.simpleSelect(sequelize, newQueryStr, replacements);
            newQueryStr=queryStr2.replace(/#{field}/g, "undergraduates_num");
            r4=await common.simpleSelect(sequelize, newQueryStr, replacements);
            for (let r of r1) {
                r.id = '1';
                r.name='院士及以上'
            }
            for (let r of r2) {
                r.id = '2';
                r.name='博士'
            }
            for (let r of r3) {
                r.id = '3';
                r.name='硕士'
            }
            for (let r of r4) {
                r.id = '4';
                r.name='本科'
            }
            r1.push(r2[0]);
            r1.push(r3[0]);
            r1.push(r4[0]);
            total=0;
            for (let r of r1) {
                total += parseInt(r.value);
            }
            if(total>0){
                for (let r of r1) {
                    r.persent = parseFloat(r.value/total).toFixed(4);
                }
            }else {
                for (let r of r1) {
                    r.persent =0;
                }
            }
            returnData['CurrentMonthStat']=r1;

            return common.sendData(res, returnData);
        }

        let queryStr = 'select t.domain_id as id, cd.domain_name as name,' +
            'round(sum(#{field}),2) as value ' +
            ' from tbl_erc_park_data t ' +
            // ' inner join tbl_erc_park_company c on c.domain_id=t.domain_id'+
            ' inner join tbl_common_domain cd on cd.domain_id=t.domain_id'+
            ' where YEAR(t.record_date)=YEAR(NOW()) and t.state = 1';//
        queryStr += ' group by t.domain_id,cd.domain_name ';

        let newQueryStr=queryStr.replace(/#{field}/g, fieldName);
        // let result = await common.queryWithCount(sequelize, req, newQueryStr, replacements);
        let yearResult = await common.simpleSelect(sequelize, newQueryStr, replacements);


        let result ={};
        let total =0;
        for (let r of yearResult) {
            total += r.value;
        }
        if(total>0){
            for (let r of yearResult) {
                r.persent = parseFloat(r.value/total).toFixed(4);
            }
        }else {
            for (let r of yearResult) {
                r.persent =0;
            }
        }

        result['YearStat'] = yearResult;
        queryStr = 'select t.domain_id as id, cd.domain_name as name,' +
            'round(sum(#{field}),2) as value' +
            ' from tbl_erc_park_data t ' +
            // ' inner join tbl_erc_park_company c on c.domain_id=t.domain_id'+
            ' inner join tbl_common_domain cd on cd.domain_id=t.domain_id'+
            ' where DATE_FORMAT( record_date,\'%Y-%m-%d\')="' + preMonthDate + '" and t.state = 1';//
        queryStr += ' group by t.domain_id,cd.domain_name ';

        newQueryStr=queryStr.replace(/#{field}/g, fieldName);
        // let result = await common.queryWithCount(sequelize, req, newQueryStr, replacements);
        let preYearMonthReult = await common.simpleSelect(sequelize, newQueryStr, replacements);
        total =0;
        for (let r of preYearMonthReult) {
            total += r.value;
        }
        if(total>0){
            for (let r of preYearMonthReult) {
                r.persent = parseFloat(r.value/total).toFixed(4);
            }
        }else {
            for (let r of preYearMonthReult) {
                r.persent =0;
            }
        }
        result['PreYearMonthStat'] = preYearMonthReult;
        queryStr = 'select t.domain_id as id, cd.domain_name as name,' +
            'round(sum(#{field}),2) as value' +
            ' from tbl_erc_park_data t ' +
            // ' inner join tbl_erc_park_company c on c.domain_id=t.domain_id'+
            ' inner join tbl_common_domain cd on cd.domain_id=t.domain_id'+
            ' where DATE_FORMAT( record_date,\'%Y-%m-%d\')="' + now + '" and t.state = 1';//
        queryStr += ' group by  t.domain_id,cd.domain_name ';

        newQueryStr=queryStr.replace(/#{field}/g, fieldName);

        let currentMonthReult = await common.simpleSelect(sequelize, newQueryStr, replacements);
        total =0;
        for (let r of currentMonthReult) {
            total += r.value;
        }
        if(total>0){
            for (let r of currentMonthReult) {
                r.persent = parseFloat(r.value/total).toFixed(4);
            }
        }else {
            for (let r of currentMonthReult) {
                r.persent =0;
            }
        }
        result['CurrentMonthStat'] = currentMonthReult;
        if(item=='talents_num'){
            return common.sendData(res, result);
        }

        return common.sendData(res, result);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
//查询获取园区当月二十四项列表信息
async function this_month(req, res) {
    try {
        let returnData = {};

        const { body, user } = req;
        const { park_company_id } = body;
        let replacements = [];

        let queryStr = 'select cd.domain_name as company_name,c.park_company_id as company_id,t.* from tbl_erc_park_data t ' +
        ' inner join tbl_erc_park_company c on c.domain_id=t.domain_id'+
        ' inner join tbl_common_domain cd on cd.domain_id=t.domain_id'+
        ' where YEAR(t.record_date)=YEAR(NOW()) and month(t.record_date)=month(NOW()) and t.state = 1';
    queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
        }
        returnData.total = result.count;
        returnData.rows = result.data;

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
//查询获取园区上月二十四项列表信息
async function last_month(req, res) {
    try {
        let returnData = {};

        const { body, user } = req;
        const { park_company_id,searchName } = body;
        let replacements = [];

        let queryStr = 'select cd.domain_name as company_name,c.park_company_id as company_id,t.* from tbl_erc_park_data t ' +
        ' inner join tbl_erc_park_company c on c.domain_id=t.domain_id'+
        ' inner join tbl_common_domain cd on cd.domain_id=t.domain_id'+
        ' where PERIOD_DIFF(date_format(now(),\'%Y%m\'),date_format(t.record_date,\'%Y%m\')) =1 and t.state = 1';
    queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
        }
        returnData.total = result.count;
        returnData.rows = result.data;

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
//查询获取园区上年本月二十四项列表信息
async function last_on_month(req, res) {
    try {
        let returnData = {};

        const { body, user } = req;
        const { park_company_id,searchName } = body;
        let replacements = [];

        let queryStr = 'select cd.domain_name as company_name,c.park_company_id as company_id,t.* from tbl_erc_park_data t ' +
        ' inner join tbl_erc_park_company c on c.domain_id=t.domain_id'+
        ' inner join tbl_common_domain cd on cd.domain_id=t.domain_id'+
        ' where PERIOD_DIFF(date_format(now(),\'%Y%m\'),date_format(t.record_date,\'%Y%m\'))=12 and t.state = 1';
    queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
        }
        returnData.total = result.count;
        returnData.rows = result.data;

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function lastyear_count(req, res) {
    try {
        let returnData = {};

        const { body, user } = req;
        const { park_company_id } = body;
        let replacements = [];

        let queryStr = 'select sum(t.gdp) as s_gdp,sum(t.sales) as sales,' +
            'sum(t.subscription_capital) as s_subscription_capital,sum(t.paidin_capital) as s_paidin_capital,sum(t.tax_payment) as tax_payment,' +
            'sum(t.deductible_input_tax) as s_input_tax,sum(t.profit_tax) as s_profit_tax,' +
            'sum(t.planned_investment) as s_planned_investment,sum(t.actual_investment) as s_actual_investment,sum(t.fixed_assets) as s_fixed_assets,'+
            'sum(t.production_equipment_investment) as s_equipment_investment,sum(t.safeproduction_days) as s_safeproduction_days,' +
            'sum(t.death_toll) as s_death_toll,sum(t.injured_num) as s_injured_num,'+

            // 'sum(t.floor_area) as s_floor_area,sum(t.production_area) as s_production_area,sum(t.office_space) as s_office_space,'+
            // 'sum(t.project_RD_num) as s_project_RD_num,sum(t.patents_num) as s_patents_num,'+
            'sum(t.academicians_num) as s_academicians_num,sum(t.doctors_num) as s_doctors_num,sum(t.masters_num) as s_masters_num,' +
            'sum(t.undergraduates_num) as s_undergraduates_num,' +

            'sum(t.electricity_consumption) as s_electricity_consumption,sum(t.water_consumption) as s_water_consumption,' +
            'sum(t.gas_consumption) as s_gas_consumption,sum(t.coal_consumption) as s_coal_consumption,' +
            'sum(case when t.envir_punished=1 then 1 else 0 end) as s_envir_punished,sum(case when t.self_test=1 then 1 else 0 end) as s_self_test,'  +

            'sum(t.gov_subsidies) as s_gov_subsidies,sum(t.gov_support_project) as s_gov_support_project,' +
            'sum(t.gov_support_amount) as s_gov_support_amount,sum(t.environment_protection) as s_environment_protection,' +
            'sum(t.RD_investment) as s_RD_investment,sum(t.energy_consumption) as s_energy_consumption,' +
            'sum(t.land_use) as s_land_use,sum(t.construct_area) as s_construct_area'+
            ' from tbl_erc_park_data t ' +
            ' where YEAR(t.record_date)=YEAR(NOW())-1  and t.state = 1';//
        // queryStr += ' group by t.park_company_id';
        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
        }
        // returnData.total = result.count;
        // returnData.rows = result.data;

        return common.sendData(res, result);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
//当年总和
async function thisyear_count(req, res) {
    try {
        let returnData = {};

        const { body, user } = req;
        const { park_company_id } = body;
        let replacements = [];

        let queryStr = 'select sum(t.gdp) as s_gdp,sum(t.sales) as sales,' +
            'sum(t.subscription_capital) as s_subscription_capital,sum(t.paidin_capital) as s_paidin_capital,sum(t.tax_payment) as tax_payment,' +
            'sum(t.deductible_input_tax) as s_input_tax,sum(t.profit_tax) as s_profit_tax,' +
            'sum(t.planned_investment) as s_planned_investment,sum(t.actual_investment) as s_actual_investment,sum(t.fixed_assets) as s_fixed_assets,'+
            'sum(t.production_equipment_investment) as s_equipment_investment,sum(t.safeproduction_days) as s_safeproduction_days,' +
            'sum(t.death_toll) as s_death_toll,sum(t.injured_num) as s_injured_num,'+

            // 'sum(t.floor_area) as s_floor_area,sum(t.production_area) as s_production_area,sum(t.office_space) as s_office_space,'+
            // 'sum(t.project_RD_num) as s_project_RD_num,sum(t.patents_num) as s_patents_num,'+
            'sum(t.academicians_num) as s_academicians_num,sum(t.doctors_num) as s_doctors_num,sum(t.masters_num) as s_masters_num,' +
            'sum(t.undergraduates_num) as s_undergraduates_num,' +

            'sum(t.electricity_consumption) as s_electricity_consumption,sum(t.water_consumption) as s_water_consumption,' +
            'sum(t.gas_consumption) as s_gas_consumption,sum(t.coal_consumption) as s_coal_consumption,' +
            'sum(case when t.envir_punished=1 then 1 else 0 end) as s_envir_punished,sum(case when t.self_test=1 then 1 else 0 end) as s_self_test,'  +

            'sum(t.gov_subsidies) as s_gov_subsidies,sum(t.gov_support_project) as s_gov_support_project,' +
            'sum(t.gov_support_amount) as s_gov_support_amount,sum(t.environment_protection) as s_environment_protection,' +
            'sum(t.RD_investment) as s_RD_investment,sum(t.energy_consumption) as s_energy_consumption,' +
            'sum(t.land_use) as s_land_use,sum(t.construct_area) as s_construct_area'+
            ' from tbl_erc_park_data t ' +
            ' where YEAR(t.record_date)=YEAR(NOW())  and t.state = 1';//
        // queryStr += ' group by t.park_company_id';
        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
        }
        // returnData.total = result.count;
        // returnData.rows = result.data;

        return common.sendData(res, result);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function last_year_month(req, res) {
    try {
        let returnData = {};

        const { body, user } = req;
        const { park_company_id } = body;
        let replacements = [];

        let queryStr = 'select sum(t.gdp) as s_gdp,sum(t.sales) as sales,' +
            'sum(t.subscription_capital) as s_subscription_capital,sum(t.paidin_capital) as s_paidin_capital,sum(t.tax_payment) as tax_payment,' +
            'sum(t.deductible_input_tax) as s_input_tax,sum(t.profit_tax) as s_profit_tax,' +
            'sum(t.planned_investment) as s_planned_investment,sum(t.actual_investment) as s_actual_investment,sum(t.fixed_assets) as s_fixed_assets,'+
            'sum(t.production_equipment_investment) as s_equipment_investment,sum(t.safeproduction_days) as s_safeproduction_days,' +
            'sum(t.death_toll) as s_death_toll,sum(t.injured_num) as s_injured_num,'+

            'sum(t.floor_area) as s_floor_area,sum(t.production_area) as s_production_area,sum(t.office_space) as s_office_space,'+
            'sum(t.project_RD_num) as s_project_RD_num,sum(t.patents_num) as s_patents_num,'+
            'sum(t.academicians_num) as s_academicians_num,sum(t.doctors_num) as s_doctors_num,sum(t.masters_num) as s_masters_num,' +
            'sum(t.undergraduates_num) as s_undergraduates_num,' +

            'sum(t.electricity_consumption) as s_electricity_consumption,sum(t.water_consumption) as s_water_consumption,' +
            'sum(t.gas_consumption) as s_gas_consumption,sum(t.coal_consumption) as s_coal_consumption,' +
            'sum(case when t.envir_punished=1 then 1 else 0 end) as s_envir_punished,sum(case when t.self_test=1 then 1 else 0 end) as s_self_test,'  +

            'sum(t.gov_subsidies) as s_gov_subsidies,sum(t.gov_support_project) as s_gov_support_project,' +
            'sum(t.gov_support_amount) as s_gov_support_amount,sum(t.environment_protection) as s_environment_protection,' +
            'sum(t.RD_investment) as s_RD_investment,sum(t.energy_consumption) as s_energy_consumption,' +
            'sum(t.land_use) as s_land_use,sum(t.construct_area) as s_construct_area'+
            ' from tbl_erc_park_data t ' +
            ' where PERIOD_DIFF(date_format(now(),\'%Y%m\'),date_format(t.record_date,\'%Y%m\'))=13  and t.state = 1';//
        // queryStr += ' group by t.park_company_id';
        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
        }
        // returnData.total = result.count;
        // returnData.rows = result.data;

        return common.sendData(res, result);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function thismonth_count(req, res) {
    try {
        let returnData = {};

        const { body, user } = req;
        const { park_company_id } = body;
        let replacements = [];

        let queryStr = 'select sum(t.gdp) as s_gdp,sum(t.sales) as sales,' +
            'sum(t.subscription_capital) as s_subscription_capital,sum(t.paidin_capital) as s_paidin_capital,sum(t.tax_payment) as tax_payment,' +
            'sum(t.deductible_input_tax) as s_input_tax,sum(t.profit_tax) as s_profit_tax,' +
            'sum(t.planned_investment) as s_planned_investment,sum(t.actual_investment) as s_actual_investment,sum(t.fixed_assets) as s_fixed_assets,'+
            'sum(t.production_equipment_investment) as s_equipment_investment,sum(t.safeproduction_days) as s_safeproduction_days,' +
            'sum(t.death_toll) as s_death_toll,sum(t.injured_num) as s_injured_num,'+

            'sum(t.floor_area) as s_floor_area,sum(t.production_area) as s_production_area,sum(t.office_space) as s_office_space,'+
            'sum(t.project_RD_num) as s_project_RD_num,sum(t.patents_num) as s_patents_num,'+
            'sum(t.academicians_num) as s_academicians_num,sum(t.doctors_num) as s_doctors_num,sum(t.masters_num) as s_masters_num,' +
            'sum(t.undergraduates_num) as s_undergraduates_num,' +

            'sum(t.electricity_consumption) as s_electricity_consumption,sum(t.water_consumption) as s_water_consumption,' +
            'sum(t.gas_consumption) as s_gas_consumption,sum(t.coal_consumption) as s_coal_consumption,' +
            'sum(case when t.envir_punished=1 then 1 else 0 end) as s_envir_punished,sum(case when t.self_test=1 then 1 else 0 end) as s_self_test,'  +

            'sum(t.gov_subsidies) as s_gov_subsidies,sum(t.gov_support_project) as s_gov_support_project,' +
            'sum(t.gov_support_amount) as s_gov_support_amount,sum(t.environment_protection) as s_environment_protection,' +
            'sum(t.RD_investment) as s_RD_investment,sum(t.energy_consumption) as s_energy_consumption,' +
            'sum(t.land_use) as s_land_use,sum(t.construct_area) as s_construct_area'+
            ' from tbl_erc_park_data t ' +
            ' where YEAR(t.record_date)=YEAR(NOW()) and MONTH(t.record_date)=MONTH(NOW())  and t.state = 1';//
        // queryStr += ' group by t.park_company_id';
        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
        }
        // returnData.total = result.count;
        // returnData.rows = result.data;

        return common.sendData(res, result);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function lastmonth_count(req, res) {
    try {
        let returnData = {};

        const { body, user } = req;
        const { park_company_id } = body;
        let replacements = [];

        let queryStr = 'select sum(t.gdp) as s_gdp,sum(t.sales) as sales,' +
            'sum(t.subscription_capital) as s_subscription_capital,sum(t.paidin_capital) as s_paidin_capital,sum(t.tax_payment) as tax_payment,' +
            'sum(t.deductible_input_tax) as s_input_tax,sum(t.profit_tax) as s_profit_tax,' +
            'sum(t.planned_investment) as s_planned_investment,sum(t.actual_investment) as s_actual_investment,sum(t.fixed_assets) as s_fixed_assets,'+
            'sum(t.production_equipment_investment) as s_equipment_investment,sum(t.safeproduction_days) as s_safeproduction_days,' +
            'sum(t.death_toll) as s_death_toll,sum(t.injured_num) as s_injured_num,'+

            'sum(t.floor_area) as s_floor_area,sum(t.production_area) as s_production_area,sum(t.office_space) as s_office_space,'+
            'sum(t.project_RD_num) as s_project_RD_num,sum(t.patents_num) as s_patents_num,'+
            'sum(t.academicians_num) as s_academicians_num,sum(t.doctors_num) as s_doctors_num,sum(t.masters_num) as s_masters_num,' +
            'sum(t.undergraduates_num) as s_undergraduates_num,' +

            'sum(t.electricity_consumption) as s_electricity_consumption,sum(t.water_consumption) as s_water_consumption,' +
            'sum(t.gas_consumption) as s_gas_consumption,sum(t.coal_consumption) as s_coal_consumption,' +
            'sum(case when t.envir_punished=1 then 1 else 0 end) as s_envir_punished,sum(case when t.self_test=1 then 1 else 0 end) as s_self_test,'  +

            'sum(t.gov_subsidies) as s_gov_subsidies,sum(t.gov_support_project) as s_gov_support_project,' +
            'sum(t.gov_support_amount) as s_gov_support_amount,sum(t.environment_protection) as s_environment_protection,' +
            'sum(t.RD_investment) as s_RD_investment,sum(t.energy_consumption) as s_energy_consumption,' +
            'sum(t.land_use) as s_land_use,sum(t.construct_area) as s_construct_area'+
            ' from tbl_erc_park_data t ' +
            ' where PERIOD_DIFF(date_format(now(),\'%Y%m\'),date_format(t.record_date,\'%Y%m\')) =1  and t.state = 1';//
        // queryStr += ' group by t.park_company_id';
        // queryStr += ' order by t.created_at desc';

       
        let result = await common.simpleSelect(sequelize, queryStr, replacements);
        for (let r of result) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
        }
        // returnData.total = result.count;
        // returnData.rows = result.data;

        return common.sendData(res, result);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
//二十四项面板
async function twenty_four(req, res) {
    try {
        const { body, user } = req;
        const { park_company_id } = body;
        let returnData=[];

        let thisyear=await thisyear_r(req, res);//当年
        let lastyearmonth=await lastyear_r(req, res);//上年同期 
        let thismonth=await thismonth_r(req, res);//当月
        let lastmonth=await lastmonth_r(req, res);//上月
        let count_num=await grand_total(req, res);//累计
        let lastyear=await lasty_r(req, res);//去年
        let park_info= await parkinfo(req,res);
        let sm=thismonth.s_water_consumption+thismonth.s_gas_consumption+thismonth.s_coal_consumption+thismonth.s_electricity_consumption;
        let sy=thisyear.s_water_consumption+thisyear.s_gas_consumption+thisyear.s_coal_consumption+thisyear.s_electricity_consumption;
        let sly=lastyear.s_water_consumption+lastyear.s_gas_consumption+lastyear.s_coal_consumption+lastyear.s_electricity_consumption;
        let gdp_growth=parseFloat(lastyear.s_gdp?(thisyear.s_gdp-lastyear.s_gdp)/lastyear.s_gdp:0).toFixed(2);//年度GDP的增幅

        console.log(park_info.construction_area);
        let one,two,three,four,five,six,seven,eight,nine,ten,eleven,twelve,thirteen,fourteen,fifteen,
        sixteen,seventeen,eighteen,nineteen,twenty,twenty_first,twenty_second,twenty_three,twenty_four;
        one= {index:'1',item:'gdp',description:'GDP（万元）',record:
                [{name:'当月汇总',value:parseFloat(thismonth.s_gdp-0).toFixed(2)},
                    {name:'当年汇总',value:parseFloat(thisyear.s_gdp-0).toFixed(2)},
                    {name:'同比增加',value:parseFloat(lastyearmonth.s_gdp?(thismonth.s_gdp - lastyearmonth.s_gdp) / lastyearmonth.s_gdp:0).toFixed(2)},
                    {name:'环比增加',value:parseFloat(lastmonth.s_gdp?(thismonth.s_gdp - lastmonth.s_gdp) / lastmonth.s_gdp:0).toFixed(2)}]
            };
        two={index:'2',item:'sales',description:'销售额（万元）',record:
                [{name:'当月汇总',value:parseFloat(thismonth.sales-0).toFixed(2)},
        {name:'当年汇总',value:parseFloat(thisyear.sales-0).toFixed(2)},
        {name:'同比增加',value:parseFloat(lastyearmonth.sales?(thismonth.sales - lastyearmonth.sales) / lastyearmonth.sales:0).toFixed(2)},
        {name:'环比增加',value:parseFloat(lastmonth.sales?(thismonth.sales - lastmonth.sales) / lastmonth.sales:0).toFixed(2)}]
        };
        three={index:'3',item:'tax_payment',description:'纳税总额（万元）',record:
                [{name:'当月汇总',value:parseFloat(thismonth.tax_payment-0).toFixed(2)},
                    {name:'当年汇总',value:parseFloat(thisyear.tax_payment-0).toFixed(2)},
                    {name:'同比增加',value:parseFloat(lastyearmonth.tax_payment?(thismonth.tax_payment - lastyearmonth.tax_payment) / lastyearmonth.tax_payment:0).toFixed(2)},
                    {name:'环比增加',value:parseFloat(lastmonth.tax_payment?(thismonth.tax_payment - lastmonth.tax_payment) / lastmonth.tax_payment:0).toFixed(2)}]
        };
        four={index:'4',item:'deductible_input_tax',description:'待抵扣进项税额（万元）',record:
        [{name:'当月汇总',value:parseFloat(thismonth.s_input_tax-0).toFixed(2)},
            {name:'当年汇总',value:parseFloat(thisyear.s_input_tax-0).toFixed(2)},
            {name:'同比增加',value:parseFloat(lastyearmonth.s_input_tax?(thismonth.s_input_tax - lastyearmonth.s_input_tax) / lastyearmonth.s_input_tax:0).toFixed(2)},
            {name:'环比增加',value:parseFloat(lastmonth.s_input_tax?(thismonth.s_input_tax - lastmonth.s_input_tax) / lastmonth.s_input_tax:0).toFixed(2)}]
        };
        five={index:'5',item:'profit_tax',description:'利税总额（万元）',record:
                [{name:'当月汇总',value:parseFloat(thismonth.s_profit_tax-0).toFixed(2)},
                    {name:'当年汇总',value:parseFloat(thisyear.s_profit_tax-0).toFixed(2)},
                    {name:'同比增加',value:parseFloat(lastyearmonth.s_profit_tax?(thismonth.s_profit_tax - lastyearmonth.s_profit_tax) / lastyearmonth.s_profit_tax:0).toFixed(2)},
                    {name:'环比增加',value:parseFloat(lastmonth.s_profit_tax?(thismonth.s_profit_tax - lastmonth.s_profit_tax) / lastmonth.s_profit_tax:0).toFixed(2)}]
        };
        console.log('six',lastmonth.s_profit_tax);
        six={index:'6',item:'safeproduction_days',description:'安全生产天数（天）',record:
                [
                    {name:'当月死亡人数',value:parseFloat(thismonth.s_death_toll-0).toFixed(0)},
                    {name:'当月受伤人数',value:parseFloat(thismonth.s_injured_num-0).toFixed(0)},
                    {name:'当年累计伤亡人数',value:parseInt(Number(thisyear.s_death_toll)+Number(thisyear.s_injured_num))}]
        };
        seven={index:'7',item:'patents_num',description:'专利数量（个）',record:
                [{name:'发明专利',value:parseFloat(thisyear.s_patents_num-0).toFixed(0)},
                    {name:'实用新型',value:parseFloat(thisyear.s_utility-0).toFixed(0)},//此数据未存入
                    {name:'外观设计',value:parseFloat(thisyear.s_outward-0).toFixed(0)},//此数据未存入
                    {name:'汇总',value:parseFloat(Number(thisyear.s_patents_num)+Number(thisyear.s_utility)+Number(thisyear.s_outward))}]
        };
        eight={index:'8',item:'project_RD_num',description:'研发立项数量（个）',record:
                [{name:'本月立项数量',value:parseFloat(thismonth.s_project_RD_num-0).toFixed(0)},
                    {name:'当年立项数量',value:parseFloat(thisyear.s_project_RD_num-0).toFixed(0)},
                    {name:'累计立项数量',value:parseFloat(count_num.s_project_RD_num-0).toFixed(0)}]
        };
        nine={index:'9',item:'floor_area',description:'土地使用情况（平方）',record:
                [
                    {name:'企业总占地面积',value:parseFloat(thismonth.s_floor_area-0).toFixed(2)},
                    ]
        };
        ten={index:'10',item:'production_area',description:'建筑情况（平方）',record:
                [{name:'园区总建筑面积',value:parseFloat(park_info.construction_area-0).toFixed(2)},
                    {name:'生产厂房面积',value:parseFloat(thismonth.s_production_area-0).toFixed(2)},
                    {name:'管理办公室面积',value:parseFloat(thismonth.s_office_space-0).toFixed(2)} ,
                    {name:'宿舍面积',value:parseFloat(thismonth.s_dormitory_area-0).toFixed(2)}]
        };
        eleven={index:'11',item:'planned_investment',description:'计划投资额（万元）',record:
                [{name:'当月新增计划投资额',value:parseFloat(thismonth.s_planned_investment).toFixed(2)},
                    {name:'当年新增计划投资额',value:parseFloat(thisyear.s_planned_investment).toFixed(2)},
            {name:'累计计划投资额',value:parseFloat(count_num.s_planned_investment-0).toFixed(2)}]
        };
        twelve={index:'12',item:'actual_investment',description:'实际投资额（万元）',record:
                [{name:'当月新增投资额',value:parseFloat(thismonth.s_actual_investment).toFixed(2)},
                    {name:'当年新增投资额',value:parseFloat(thisyear.s_actual_investment).toFixed(2)},
                    {name:'累计投资额',value:parseFloat(count_num.s_actual_investment-0).toFixed(2)}]
          };

        thirteen={index:'13',item:'fixed_assets',description:'固定资产投资额（万元）',record:
                [{name:'当月新增',value:parseFloat(thismonth.s_fixed_assets).toFixed(2)},
                    {name:'当年新增',value:parseFloat(thisyear.s_fixed_assets).toFixed(2)},
                    {name:'累计',value:parseFloat(count_num.s_fixed_assets-0).toFixed(2)}]
        };
        fourteen={index:'14',item:'production_equipment_investment',description:'生产设备投资额（万元）',record:
                [{name:'当月新增',value:parseFloat(thismonth.s_equipment_investment).toFixed(2)},
                    {name:'当年新增',value:parseFloat(thisyear.s_equipment_investment).toFixed(2)},
                    {name:'累计',value:parseFloat(count_num.s_equipment_investment-0).toFixed(2)}]
        };
        fifteen={index:'15',item:'talents_num',description:'人才数量（位）',record:
                [{name:'院士及以上',value:parseFloat(thismonth.s_academicians_num-0).toFixed(0)},
                    {name:'博士',value:parseFloat(thismonth.s_doctors_num-0).toFixed(0)},
                    {name:'硕士',value:parseFloat(thismonth.s_masters_num-0).toFixed(0)},
                    {name:'本科',value:thismonth.s_undergraduates_num-0}]
        };
        sixteen={index:'16',item:'RD_investment',description:'研发投入金额（万元）',record:
                [{name:'本月投入金额',value:parseFloat(thismonth.s_RD_investment-0).toFixed(2)},
                    {name:'当年投入金额',value:parseFloat(thisyear.s_RD_investment-0).toFixed(2)},
                    {name:'年度同比增幅',value:parseFloat(thismonth.s_masters_num-0).toFixed(2)}]
        };
        seventeen={index:'17',item:'energy_amount',description:'能源消耗金额（万元）',record:
                [{name:'当月消耗金额',value:parseFloat(thismonth.s_energy_consumption-0).toFixed(2)},
                    {name:'当年消耗金额',value:parseFloat(thisyear.s_energy_consumption-0).toFixed(2)},
                    {name:'年度同比增幅',value:parseFloat(lastyearmonth.s_energy_consumption?(thismonth.s_energy_consumption - lastyearmonth.s_energy_consumption) / lastyearmonth.s_energy_consumption:0).toFixed(2)},
                    {name:'年度产值同比增幅',value:parseFloat(gdp_growth).toFixed(2)}]
        };
        eighteen={index:'18',item:'electricity_consumption',description:'用电情况（度）',record:
                [{name:'当月消耗金额',value: parseFloat(thismonth.s_electricity_consumption-0).toFixed(2)},
                    {name:'当年消耗金额',value:parseFloat(thisyear.s_electricity_consumption-0).toFixed(2)},
                    {name:'年度同比增幅',value:parseFloat(lastyear.s_electricity_consumption?(thisyear.s_electricity_consumption-lastyear.s_electricity_consumption)/lastyear.s_electricity_consumption:0).toFixed(2)},
                    {name:'年度产值同比增幅',value:parseFloat(gdp_growth).toFixed(2)}]
        };
        nineteen={index:'19',item:'water_consumption',description:'水资源消耗情况（立方）',record:
                [{name:'当月消耗',value: parseFloat(thismonth.s_water_consumption-0).toFixed(2)},
                    {name:'当年消耗',value:parseFloat(thisyear.s_water_consumption-0).toFixed(2)},
                    {name:'年度同比增幅',value:parseFloat(lastyear.s_water_consumption?(thisyear.s_water_consumption-lastyear.s_water_consumption)/lastyear.s_water_consumption:0).toFixed(2)},
                    {name:'年度产值同比增幅',value:gdp_growth}]
        };
        twenty={index:'20',item:'gas_consumption',description:'气资源消耗情况（立方）',record:
                [{name:'当月消耗',value: parseFloat(thismonth.s_gas_consumption-0).toFixed(2)},
                    {name:'当年消耗',value:parseFloat(thisyear.s_gas_consumption-0).toFixed(2)},
                    {name:'年度同比增幅',value:parseFloat(lastyear.s_gas_consumption?(thisyear.s_gas_consumption-lastyear.s_gas_consumption)/lastyear.s_gas_consumption:0).toFixed(2)},
                    {name:'年度产值同比增幅',value:parseFloat(gdp_growth).toFixed(2)}]
        };
        twenty_first={index:'21',item:'coal_consumption',description:'煤炭资源消耗情况（立方）',record:
                [{name:'当月消耗',value: parseFloat(thismonth.s_coal_consumption-0).toFixed(2)},
                    {name:'当年消耗',value:parseFloat(thisyear.s_coal_consumption-0).toFixed(2)},
                    {name:'年度同比增幅',value:parseFloat(lastyear.s_coal_consumption?(thisyear.s_coal_consumption-lastyear.s_coal_consumption)/lastyear.s_coal_consumption:0).toFixed(2)},
                    {name:'年度产值同比增幅',value:gdp_growth}]
        };
        twenty_second={index:'22',item:'gov_subsidies',description:'政府补助情况（万元）',record:
        [{name:'当月补助金额',value: parseFloat(thismonth.s_gov_subsidies?thismonth.s_gov_subsidies:0).toFixed(2)},
            {name:'当年补助金额',value:parseFloat(thisyear.s_gov_subsidies?thisyear.s_gov_subsidies:0).toFixed(2)},
            {name:'年度同比增幅',value:parseFloat(lastyear.s_gov_subsidies?(thisyear.s_gov_subsidies-lastyear.s_gov_subsidies)/lastyear.s_gov_subsidies:0).toFixed(2)}
]};
        twenty_three={index:'23',item:'gov_support_amount',description:'政府扶持项目申报情况（万元）',record:
                [{name:'当月申请金额',value: thismonth.s_gov_support_amount?thismonth.s_gov_support_amount:0},
                    {name:'当年申请金额',value:thisyear.s_gov_support_amount?thisyear.s_gov_support_amount:0},
                    {name:'年度同比增幅',value:parseFloat(lastyear.s_gov_support_amount?(thisyear.s_gov_support_amount-lastyear.s_gov_support_amount)/lastyear.s_gov_support_amount:0).toFixed(2)}
                   ]
        };

        twenty_four={index:'24',item:'envir_punished',description:'环保情况（个）',record:
                [{name:'已自我检测企业',value: thismonth.s_self_test},
                    {name:'当月被处罚企业',value:thismonth.s_envir_punished},
                    {name:'当年被处罚企业',value:thisyear.s_envir_punished}]
        };
        
        returnData.push(one);
        returnData.push(two);
        returnData.push(three);
        returnData.push(four);
        returnData.push(five);
        returnData.push(six);
        returnData.push(seven);
        returnData.push(eight);
        returnData.push(nine);
        returnData.push(ten);
        returnData.push(eleven);
        returnData.push(twelve);
        returnData.push(thirteen);
        returnData.push(fourteen);
        returnData.push(fifteen);
        returnData.push(sixteen);
        returnData.push(seventeen);
        returnData.push(eighteen);
        returnData.push(nineteen);
        returnData.push(twenty);
        returnData.push(twenty_first);
        returnData.push(twenty_second);
        returnData.push(twenty_three);
        returnData.push(twenty_four);
        console.log('二十四项结束');

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
};

//当年总和
async function thisyear_r(req, res) {
    try {
        let returnData = {};

        const { body, user } = req;
        const { park_company_id } = body;
        let replacements = [];

        let queryStr = 'select sum(t.gdp) as s_gdp,sum(t.sales) as sales,' +
            'sum(t.subscription_capital) as s_subscription_capital,sum(t.paidin_capital) as s_paidin_capital,sum(t.tax_payment) as tax_payment,' +
            'sum(t.deductible_input_tax) as s_input_tax,sum(t.profit_tax) as s_profit_tax,' +
            'sum(t.planned_investment) as s_planned_investment,sum(t.actual_investment) as s_actual_investment,sum(t.fixed_assets) as s_fixed_assets,'+
            'sum(t.production_equipment_investment) as s_equipment_investment,sum(t.safeproduction_days) as s_safeproduction_days,' +
            'sum(t.death_toll) as s_death_toll,sum(t.injured_num) as s_injured_num,'+

            'sum(t.floor_area) as s_floor_area,sum(t.production_area) as s_production_area,sum(t.office_space) as s_office_space,'+
            'sum(t.project_RD_num) as s_project_RD_num,sum(t.patents_num) as s_patents_num,'+
            'sum(t.academicians_num) as s_academicians_num,sum(t.doctors_num) as s_doctors_num,sum(t.masters_num) as s_masters_num,' +
            'sum(t.undergraduates_num) as s_undergraduates_num,' +
            
            'sum(t.utility) as s_utility,sum(t.outward) as s_outward,' +
            'sum(t.electricity_consumption) as s_electricity_consumption,sum(t.water_consumption) as s_water_consumption,' +
            'sum(t.gas_consumption) as s_gas_consumption,sum(t.coal_consumption) as s_coal_consumption,' +
            'sum(case when t.envir_punished=1 then 1 else 0 end) as s_envir_punished,sum(case when t.self_test=1 then 1 else 0 end) as s_self_test,'  +

            'sum(t.gov_subsidies) as s_gov_subsidies,sum(t.gov_support_project) as s_gov_support_project,' +
            'sum(t.gov_support_amount) as s_gov_support_amount,sum(t.environment_protection) as s_environment_protection,' +
            'sum(t.RD_investment) as s_RD_investment,sum(t.energy_consumption) as s_energy_consumption,' +
            'sum(t.land_use) as s_land_use,sum(t.construct_area) as s_construct_area'+
            ' from tbl_erc_park_data t ' +
            ' where YEAR(t.record_date)=YEAR(NOW())  and t.state = 1';//
        // queryStr += ' group by t.park_company_id';
        queryStr += ' order by t.created_at desc';
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        return result.data[0];

    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function lastyear_r(req, res) {
    try {
        let returnData = {};

        const { body, user } = req;
        const { park_company_id } = body;
        let replacements = [];

        let queryStr = 'select sum(t.gdp) as s_gdp,sum(t.sales) as sales,' +
            'sum(t.subscription_capital) as s_subscription_capital,sum(t.paidin_capital) as s_paidin_capital,sum(t.tax_payment) as tax_payment,' +
            'sum(t.deductible_input_tax) as s_input_tax,sum(t.profit_tax) as s_profit_tax,' +
            'sum(t.planned_investment) as s_planned_investment,sum(t.actual_investment) as s_actual_investment,sum(t.fixed_assets) as s_fixed_assets,'+
            'sum(t.production_equipment_investment) as s_equipment_investment,sum(t.safeproduction_days) as s_safeproduction_days,' +
            'sum(t.death_toll) as s_death_toll,sum(t.injured_num) as s_injured_num,'+

            'sum(t.floor_area) as s_floor_area,sum(t.production_area) as s_production_area,sum(t.office_space) as s_office_space,'+
            'sum(t.project_RD_num) as s_project_RD_num,sum(t.patents_num) as s_patents_num,'+
            'sum(t.academicians_num) as s_academicians_num,sum(t.doctors_num) as s_doctors_num,sum(t.masters_num) as s_masters_num,' +
            'sum(t.undergraduates_num) as s_undergraduates_num,' +

            'sum(t.electricity_consumption) as s_electricity_consumption,sum(t.water_consumption) as s_water_consumption,' +
            'sum(t.gas_consumption) as s_gas_consumption,sum(t.coal_consumption) as s_coal_consumption,' +
            'sum(case when t.envir_punished=1 then 1 else 0 end) as s_envir_punished,sum(case when t.self_test=1 then 1 else 0 end) as s_self_test,'  +

            'sum(t.gov_subsidies) as s_gov_subsidies,sum(t.gov_support_project) as s_gov_support_project,' +
            'sum(t.gov_support_amount) as s_gov_support_amount,sum(t.environment_protection) as s_environment_protection,' +
            'sum(t.RD_investment) as s_RD_investment,sum(t.energy_consumption) as s_energy_consumption,' +
            'sum(t.land_use) as s_land_use,sum(t.construct_area) as s_construct_area'+
            ' from tbl_erc_park_data t ' +
            ' where PERIOD_DIFF(date_format(now(),\'%Y%m\'),date_format(t.record_date,\'%Y%m\')) =12  and t.state = 1';//
        // queryStr += ' group by t.park_company_id';
        // queryStr += ' order by t.created_at desc';

        let result = await common.simpleSelect(sequelize, queryStr, replacements);
        return result[0];

    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function thismonth_r(req, res) {
    try {
        let returnData = {};

        const { body, user } = req;
        const { park_company_id } = body;
        let replacements = [];

        let queryStr = 'select sum(t.gdp) as s_gdp,sum(t.sales) as sales,' +
            'sum(t.subscription_capital) as s_subscription_capital,sum(t.paidin_capital) as s_paidin_capital,sum(t.tax_payment) as tax_payment,' +
            'sum(t.deductible_input_tax) as s_input_tax,sum(t.profit_tax) as s_profit_tax,' +
            'sum(t.planned_investment) as s_planned_investment,sum(t.actual_investment) as s_actual_investment,sum(t.fixed_assets) as s_fixed_assets,'+
            'sum(t.production_equipment_investment) as s_equipment_investment,sum(t.safeproduction_days) as s_safeproduction_days,' +
            'sum(t.death_toll) as s_death_toll,sum(t.injured_num) as s_injured_num,'+

            'sum(t.floor_area) as s_floor_area,sum(t.production_area) as s_production_area,sum(t.office_space) as s_office_space,'+
            'sum(t.project_RD_num) as s_project_RD_num,sum(t.patents_num) as s_patents_num,'+
            'sum(t.academicians_num) as s_academicians_num,sum(t.doctors_num) as s_doctors_num,sum(t.masters_num) as s_masters_num,' +
            'sum(t.undergraduates_num) as s_undergraduates_num,sum(t.dormitory_area) as s_dormitory_area,' +

            'sum(t.electricity_consumption) as s_electricity_consumption,sum(t.water_consumption) as s_water_consumption,' +
            'sum(t.gas_consumption) as s_gas_consumption,sum(t.coal_consumption) as s_coal_consumption,' +
            'sum(case when t.envir_punished=1 then 1 else 0 end) as s_envir_punished,sum(case when t.self_test=1 then 1 else 0 end) as s_self_test,'  +

            'sum(t.gov_subsidies) as s_gov_subsidies,sum(t.gov_support_project) as s_gov_support_project,' +
            'sum(t.gov_support_amount) as s_gov_support_amount,sum(t.environment_protection) as s_environment_protection,' +
            'sum(t.RD_investment) as s_RD_investment,sum(t.energy_consumption) as s_energy_consumption,' +
            'sum(t.land_use) as s_land_use,sum(t.construct_area) as s_construct_area'+
            ' from tbl_erc_park_data t ' +
            ' where YEAR(t.record_date)=YEAR(NOW()) and MONTH(t.record_date)=MONTH(NOW())  and t.state = 1';//
        // queryStr += ' group by t.park_company_id';
        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        return result.data[0];

    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function lastmonth_r(req, res) {
    try {
        let returnData = {};

        const { body, user } = req;
        const { park_company_id } = body;
        let replacements = [];

        let queryStr = 'select sum(t.gdp) as s_gdp,sum(t.sales) as sales,' +
            'sum(t.subscription_capital) as s_subscription_capital,sum(t.paidin_capital) as s_paidin_capital,sum(t.tax_payment) as tax_payment,' +
            'sum(t.deductible_input_tax) as s_input_tax,sum(t.profit_tax) as s_profit_tax,' +
            'sum(t.planned_investment) as s_planned_investment,sum(t.actual_investment) as s_actual_investment,sum(t.fixed_assets) as s_fixed_assets,'+
            'sum(t.production_equipment_investment) as s_equipment_investment,sum(t.safeproduction_days) as s_safeproduction_days,' +
            'sum(t.death_toll) as s_death_toll,sum(t.injured_num) as s_injured_num,'+

            'sum(t.floor_area) as s_floor_area,sum(t.production_area) as s_production_area,sum(t.office_space) as s_office_space,'+
            'sum(t.project_RD_num) as s_project_RD_num,sum(t.patents_num) as s_patents_num,'+
            'sum(t.academicians_num) as s_academicians_num,sum(t.doctors_num) as s_doctors_num,sum(t.masters_num) as s_masters_num,' +
            'sum(t.undergraduates_num) as s_undergraduates_num,' +

            'sum(t.electricity_consumption) as s_electricity_consumption,sum(t.water_consumption) as s_water_consumption,' +
            'sum(t.gas_consumption) as s_gas_consumption,sum(t.coal_consumption) as s_coal_consumption,' +
            'sum(case when t.envir_punished=1 then 1 else 0 end) as s_envir_punished,sum(case when t.self_test=1 then 1 else 0 end) as s_self_test,'  +

            'sum(t.gov_subsidies) as s_gov_subsidies,sum(t.gov_support_project) as s_gov_support_project,' +
            'sum(t.gov_support_amount) as s_gov_support_amount,sum(t.environment_protection) as s_environment_protection,' +
            'sum(t.RD_investment) as s_RD_investment,sum(t.energy_consumption) as s_energy_consumption,' +
            'sum(t.land_use) as s_land_use,sum(t.construct_area) as s_construct_area'+
            ' from tbl_erc_park_data t ' +
            ' where PERIOD_DIFF(date_format(now(),\'%Y%m\'),date_format(t.record_date,\'%Y%m\')) =1  and t.state = 1';//
        // queryStr += ' group by t.park_company_id';
        // queryStr += ' order by t.created_at desc';

        let result = await common.simpleSelect(sequelize, queryStr, replacements);
        return result[0];

    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function grand_total(req, res) {//累计计量
    try {
        let replacements = [];

        let queryStr = 'select sum(t.planned_investment) as s_planned_investment,sum(t.actual_investment) as s_actual_investment,sum(t.fixed_assets) as s_fixed_assets,'+
            'sum(t.production_equipment_investment) as s_equipment_investment,sum(t.safeproduction_days) as s_safeproduction_days,' +
            'sum(t.project_RD_num) as s_project_RD_num,sum(t.patents_num) as s_patents_num'+
            ' from tbl_erc_park_data t ' +
            ' where t.state = 1';//
        // queryStr += ' group by t.park_company_id';
        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        return result.data[0];

    } catch (error) {
        return common.sendFault(res, error);
    }
};

async function lasty_r(req, res) {//去年总和
    try {
        let returnData = {};

        const { body, user } = req;
        const { park_company_id } = body;
        let replacements = [];

        let queryStr = 'select sum(t.gdp) as s_gdp,sum(t.sales) as sales,' +
            'sum(t.subscription_capital) as s_subscription_capital,sum(t.paidin_capital) as s_paidin_capital,sum(t.tax_payment) as tax_payment,' +
            'sum(t.deductible_input_tax) as s_input_tax,sum(t.profit_tax) as s_profit_tax,' +
            'sum(t.planned_investment) as s_planned_investment,sum(t.actual_investment) as s_actual_investment,sum(t.fixed_assets) as s_fixed_assets,'+
            'sum(t.production_equipment_investment) as s_equipment_investment,sum(t.safeproduction_days) as s_safeproduction_days,' +
            'sum(t.death_toll) as s_death_toll,sum(t.injured_num) as s_injured_num,'+

            'sum(t.floor_area) as s_floor_area,sum(t.production_area) as s_production_area,sum(t.office_space) as s_office_space,'+
            'sum(t.project_RD_num) as s_project_RD_num,sum(t.patents_num) as s_patents_num,'+
            'sum(t.academicians_num) as s_academicians_num,sum(t.doctors_num) as s_doctors_num,sum(t.masters_num) as s_masters_num,' +
            'sum(t.undergraduates_num) as s_undergraduates_num,' +

            'sum(t.electricity_consumption) as s_electricity_consumption,sum(t.water_consumption) as s_water_consumption,' +
            'sum(t.gas_consumption) as s_gas_consumption,sum(t.coal_consumption) as s_coal_consumption,' +
            'sum(case when t.envir_punished=1 then 1 else 0 end) as s_envir_punished,sum(case when t.self_test=1 then 1 else 0 end) as s_self_test,'  +

            'sum(t.gov_subsidies) as s_gov_subsidies,sum(t.gov_support_project) as s_gov_support_project,' +
            'sum(t.gov_support_amount) as s_gov_support_amount,sum(t.environment_protection) as s_environment_protection,' +
            'sum(t.RD_investment) as s_RD_investment,sum(t.energy_consumption) as s_energy_consumption,' +
            'sum(t.land_use) as s_land_use,sum(t.construct_area) as s_construct_area'+
            ' from tbl_erc_park_data t ' +
            ' where YEAR(t.record_date)=YEAR(NOW())-1  and t.state = 1';//
        // queryStr += ' group by t.park_company_id';
        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        return result.data[0];

    } catch (error) {
        return common.sendFault(res, error);
    }
};


//园区企业人才统计 TODO??
async function TalentCountAct(req, res) {
    try {
        let returnData = {};

        const { body, user } = req;
        const { park_company_id } = body;
        let replacements = [];

        let queryStr = 'select count(t.park_data_id) as date_num,sum(t.floor_area) as s_floor_areas,' +
            'sum(t.construction_area) as s_cons_areas,sum(t.plan_investment) as s_plan_invest' +
            'sum(t.actual_investmen) as s_actual_invest,sum(t.registered_capital) as s.reg_capital' +
            'sum(t.equipment_investment) as s_equipment_invest,sum(t.patent_number) as s_patent_num' +
            'sum(t.employees_count) as s_employ_num,sum(case when t.high_tech=1 then 1 else 0 end) as s_high_tech' +
            ' from tbl_erc_park_data t ' +
            ' where t.state = 1';//
        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
        }
        returnData.total = result.count;
        returnData.rows = result.data;

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
//园区信息
async function parkinfo(req,res) {
    try {
        let returnData = {};
        let queryStr =' SELECT\n' +
            '        (SELECT COUNT(*) FROM tbl_common_domain WHERE state=1) AS company_count,\n' +
            '            round(SUM(floor_area),2) AS floor_area,\n' +
            '            round(SUM(construction_area),2) AS construction_area,\n' +
            '            round(SUM(plan_investment),2) AS plan_investment,\n' +
            '            round(SUM(actual_investmen),2) AS actual_investment,\n' +
            '            round(SUM(registered_capital),2) AS registered_capital,\n' +
            '            round(SUM(equipment_investment),2) AS equipment_investment,\n' +
            '            ROUND(SUM(patent_number)) AS patent_number,\n' +
            '            ROUND(SUM(employees_count)) AS employees_count,\n' +
            '            SUM(high_tech) AS hig_tech_count\n' +
            '        FROM tbl_erc_park_company WHERE state=1'

        let result = await common.queryPure(sequelize, req, queryStr, null);

        return result.data[0];

    } catch (error) {
        return common.sendFault(res, error);
    }
};
//园区信息
async function Search_each(req, res) {
    try {
        let returnData = {};

        const { body, user } = req;
        const { park_company_id } = body;
        let replacements = [];

        let queryStr = 'select cd.domain_name as company_name,sum(t.gdp) as s_gdp,' +
            'sum(t.sales) as sales,sum(t.tax_payment) as tax_payment' +
            'sum(t.deductible_input_tax) as s_input_tax,sum(t.profit_tax) as s_profit_tax' +
            'sum(t.safeproduction_days) as s_safeproduction_days,sum(t.patents_num) as s_patents_num' +
            'sum(t.construct_area) as s_construct_area,sum(t.planned_investment) as s_planned_investment' +
            'sum(t.actual_investment) as s_actual_investment,sum(t.fixed_assets) as s_fixed_assets' +
            'sum(t.production_equipment_investment) as s_equipment_investment,sum(t.academicians_num) as s_academicians_num' +
            'sum(t.doctors_num) as s_doctors_num,sum(t.masters_num) as s_masters_num' +
            'sum(t.undergraduates_num) as s_undergraduates_num,sum(t.RD_investment) as s_RD_investment' +
            'sum(t.energy_consumption) as s_energy_consumption,sum(t.electricity_consumption) as s_electricity_consumption' +
            'sum(t.water_consumption) as s_water_consumption,sum(t.gas_consumption) as s_gas_consumption' +
            'sum(t.gov_subsidies) as s_gov_subsidies,sum(t.gov_support_project) as s_gov_support_project' +
            'sum(t.gov_support_amount) as s_gov_support_amount,sum(t.environment_protection) as s_environment_protection' +
            'sum(t.coal_consumption) as s_coal_consumption' +
            ' from tbl_erc_park_data t ' +
            // ' inner join tbl_erc_park_company c on c.domain_id=t.domain_id'+
            ' inner join tbl_common_domain cd on cd.domain_id=t.domain_id'+
            ' where t.state = 1';//
        queryStr += ' group by t.park_company_id';
        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
        }
        // returnData.total = result.count;
        // returnData.rows = result.data;

        return common.sendData(res, result);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
//园区信息
async function showDeatilsByDomainId(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let result=[];
        let twenty_four=[
            {project:'企业当月新增GDP贡献（万元）',info:'',name:'gdp'},
            {project:'企业当月新增销售额（万元）',info:'',name:'sales'},
            {project:'企业当月新增纳税（万元）',info:'',name:'tax_payment'},
            {project:'当月实存待抵扣进项税额（万元）',info:'',name:'deductible_input_tax'},
            {project:'企业当月新增计划投资额（万元）',info:'',name:'planned_investment'},
            {project:'企业当月新增实际投资额（万元）',info:'',name:'actual_investment'},
            {project:'企业当月新增固定资产投资额（万元）',info:'',name:'fixed_assets'},
            {project:'企业当月新增生产设备投资额（万元）',info:'',name:'production_equipment_investment'},
            {project:'当月新增研发投入金额（万元）',info:'',name:'RD_investment'},
            {project:'企业当月新增能耗总金额（万元）',info:'',name:'energy_consumption'},
            {project:'企业当月新增政府补助资金额（万元）',info:'',name:'gov_subsidies'},
            {project:'企业环保数据',info:'是否自我监测',name:'self_test'},
            {project:'企业环保数据',info:'当月是否被处罚',name:'envir_punished'},
            {project:'企业安全生产数据',info:'当月新增死亡人数（人）',name:'death_toll'},
            {project:'企业安全生产数据',info:'当月新增受伤人数（人）',name:'injured_num'},
            {project:'企业人才储备各月实存人数（人）',info:'院士及以上',name:'academicians_num'},
            {project:'企业人才储备各月实存人数（人）',info:'博士',name:'doctors_num'},
            {project:'企业人才储备各月实存人数（人）',info:'硕士',name:'masters_num'},
            {project:'企业人才储备各月实存人数（人）',info:'本科',name:'undergraduates_num'},
            {project:'企业当月新增专利数量（个)',info:'发明专利',name:'patents_num'},
            {project:'企业当月新增专利数量（个)',info:'实用新型',name:'utility'},
            {project:'企业当月新增专利数量（个)',info:'外观设计',name:'outward'},
            {project:'企业各月实存用地面积（平方）',info:'',name:'floor_area'},
            {project:'企业各月实存建筑面积（平方）',info:'生产厂房面积',name:'production_area'},
            {project:'企业各月实存建筑面积（平方）',info:'管理帮面积',name:'office_space'},
            {project:'企业各月实存建筑面积（平方）',info:'宿舍面积',name:'dormitory_area'},
            {project:'企业当月新增研发立项数量（个）',info:'',name:'project_RD_num'},
            {project:'企业当月新增政府项目申报金额（万元）',info:'',name:'gov_support_amount'},
            {project:'企业当月新增用电数量（度）',info:'',name:'electricity_consumption'},
            {project:'企业当月新增用水数量（立方）',info:'',name:'water_consumption'},
            {project:'企业当月新增用汽数量（立方）',info:'',name:'gas_consumption'},
            {project:'企业当月新增用煤数量（吨）',info:'',name:'coal_consumption'},
        ];
        for(let item of twenty_four){
            let r=await getDataByFileName(req, res, item.name, doc);
            r.project=item.project;
            r.info=item.info;
            result.push(r);
        }
        returnData.total = result.length;
        returnData.rows = result;
        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
//获取数据
async function getDataByFileName(req, res, item, doc) {
    const { body, user } = req;
    let replacements = [];
    let items=new Set(['self_test','envir_punished','project_RD_num','death_toll','injured_num','academicians_num',
    'doctors_num','masters_num','undergraduates_num','patents_num','utility','outward']);
        let fielName='t.'+item;
        if(items.has(item)){
            fielName='t.'+item;
        }else{
            fielName='CONVERT(t.'+item+',DECIMAL(10,2))';
        }

    let queryStr = 'select cd.domain_name as company_name,max(case MONTH(t.record_date) when 1  then #{field} else null end) as Jan,' +
    'max(case MONTH(t.record_date) when 2 then #{field} else null end) as Feb,' +
    'max(case MONTH(t.record_date) when 3 then #{field} else null end) as Mar,' +
    'max(case MONTH(t.record_date) when 4 then #{field} else null end) as Apr,' +
    'max(case MONTH(t.record_date) when 5 then #{field} else null end) as May,' +
    'max(case MONTH(t.record_date) when 6 then #{field} else null end) as June,' +
    'max(case MONTH(t.record_date) when 7 then #{field} else null end) as July,' +
    'max(case MONTH(t.record_date) when 8 then #{field} else null end) as Aug,' +
    'max(case MONTH(t.record_date) when 9 then #{field} else null end) as Sept,' +
    'max(case MONTH(t.record_date) when 10 then #{field} else null end) as Oct,' +
    'max(case MONTH(t.record_date) when 11 then #{field} else null end) as Nov,' +
    'max(case MONTH(t.record_date) when 12 then #{field} else null end) as Dece,' +
    'sum(#{field}) as total,min(YEAR(t.record_date)) as year' +
    ' from tbl_erc_park_data t' +
    ' right join tbl_common_domain cd on cd.domain_id=t.domain_id'+
    ' where cd.state = 1 and t.state=1 and t.domain_id=?';
    replacements.push(user.domain_id);
    if(doc.year){
        queryStr += ' and YEAR(t.record_date)=?';
            replacements.push(doc.year);
    }else{
        queryStr += ' and YEAR(t.record_date)=YEAR(NOW())';
    }
    let str=queryStr.replace(/#{field}/g, fielName);
    let result = await common.simpleSelect(sequelize, str, replacements);
    if(doc.year){
        for(let r of result){
            r.year=doc.year;
        }
    }
    if(item==='self_test'||item==='envir_punished'){
        for(let r of result){
            r.Jan=r.Jan?(r.Jan==0?'否':'是'):null;
            r.Feb=r.Feb?(r.Feb==0?'否':'是'):null;
            r.Mar=r.Mar?(r.Mar==0?'否':'是'):null;
            r.Apr=r.Apr?(r.Apr==0?'否':'是'):null;
            r.May=r.May?(r.May==0?'否':'是'):null;
            r.June=r.June?(r.June==0?'否':'是'):null;
            r.July=r.July?(r.July==0?'否':'是'):null;
            r.Aug=r.Aug?(r.Aug==0?'否':'是'):null;
            r.Sept=r.Sept?(r.Sept==0?'否':'是'):null;
            r.Oct=r.Oct?(r.Oct==0?'否':'是'):null;
            r.Nov=r.Nov?(r.Nov==0?'否':'是'):null;
            r.Dece=r.Dece?(r.Dece==0?'否':'是'):null;
        }
    }
    return result[0];
};
//获取数据
async function getDateByMonth(req, res) {
    try{
    let doc = common.docTrim(req.body),
            user = req.user;
    if(!doc.record_date){
        return common.sendError(res, 'date_error')
    }
    let record_date=doc.record_date;
    let replacements = [];
    let y=record_date.substr(0,4);
        let m=record_date.substr(5,2);
        let queryStr = 'select t.* from tbl_erc_park_data t' +
        ' where t.state = 1 and t.domain_id= ? and YEAR(t.record_date)= ? and MONTH(t.record_date)=?';
        replacements.push(user.domain_id);
        replacements.push(y);
        replacements.push(m);
        let result = await common.simpleSelect(sequelize,queryStr, replacements);
        for (let r of result) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
            r.record_date = r.record_date ? r.record_date.Format('yyyy-MM') : null;
        }
    return common.sendData(res, result[0]);

} catch (error) {
    return common.sendFault(res, error);
}
};