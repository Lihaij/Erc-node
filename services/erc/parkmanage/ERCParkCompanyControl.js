//设计基本信息-园区企业管理
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCParkCompanyControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');

const tb_park_company = model.erc_park_company;//园区企业

const tb_park_supplier = model.erc_park_supplier;//园区供应商
const tb_park_purchase = model.erc_park_purchase;//园区采购

// 园区企业增删改查接口
exports.ERCParkCompanyControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'add') {//新增
        addAct(req, res)
    } else if (method === 'delete') {
        deleteAct(req, res)
    } else if (method === 'modify') {//修改
        modifyAct(req, res)
    } else if (method === 'getCompanyByDomainId') {//获取本企业的信息
        getCompanyByDomainId(req, res)
    } else if (method === 'search') {//获取所有的企业信息
        searchAct(req, res)
    } else if (method === 'search_t') {//园区综合展示1
        parkSearchAct(req, res)
    } else if (method === 'one_company') {//点击地图展示的企业信息详情
        one_company(req, res)
    }else if (method === 'parkstat') {//开发区统计
        parkstat(req, res)
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
            ENABLEL: GLBConfig.ENABLE,
            //TODO采购类型：1.现货 2.标准品
            // associatedInfo: []
        };

        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
// 增加企业
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [];
        let result=await tb_park_company.findOne({
            where:{
                domain_id:user.domain_id
            }
        });
        if(result){
            result.company_name= doc.company_name,
            result.company_address= doc.company_address,
            result.floor_area= doc.floor_area,
            result.construction_area= doc.construction_area,
            result.registered_capital= doc.registered_capital,//注册资本
            result.paid_up_capital= doc.paid_up_capital,//实收资本
            result.plan_investment=doc.plan_investment,//投资总额
            result.actual_investmen= doc.actual_investmen,//实际投资总额
            result.equipment_investment= doc.equipment_investment,//生产设备投资总额
            result.employees_count= doc.employees_count,
            result.patent_number= doc.patent_number,//专利数
            result.map_loaction= doc.map_loaction,//地图位置(经度，维度)
            result.high_tech=doc.high_tech,
            result.map_type=doc.map_type
            await result.save();
            common.sendData(res, result)
        }else{
            let park_company= await tb_park_company.create({
                domain_id: user.domain_id,//
                company_name: doc.company_name,
                company_address: doc.company_address,
                floor_area: doc.floor_area,
                construction_area: doc.construction_area,
                registered_capital: doc.registered_capital,//注册资本
                paid_up_capital: doc.paid_up_capital,//实收资本
                plan_investment: doc.plan_investment,//投资总额
                actual_investmen: doc.actual_investmen,//实际投资总额
                equipment_investment: doc.equipment_investment,//生产设备投资总额
                employees_count: doc.employees_count,
                patent_number: doc.patent_number,//专利数
                map_loaction: doc.map_loaction,//地图位置(经度，维度)
                high_tech:doc.high_tech,
                map_type:doc.map_type
            });
            common.sendData(res, park_company);
        }

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
};
//修改采购
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let park_company = await tb_park_company.findOne({
            where: {
                park_company_id: doc.park_company_id
            }
        });
        if (park_company) {
            // domain_id: user.domain_id,//?
            park_company.company_name= doc.company_name,
            park_company.company_address= doc.company_address,
            park_company.floor_area= doc.floor_area,
            park_company.construction_area= doc.construction_area,
            park_company.registered_capital= doc.registered_capital,//注册资本
            park_company.paid_up_capital= doc.paid_up_capital,//实收资本
            park_company.plan_investment=doc.plan_investment,//投资总额
            park_company.actual_investmen= doc.actual_investmen,//实际投资总额
            park_company.equipment_investment= doc.equipment_investment,//生产设备投资总额
            park_company.employees_count= doc.employees_count,
            park_company.patent_number= doc.patent_number,//专利数
            park_company.map_loaction= doc.map_loaction,//地图位置(经度，维度)
            park_company.high_tech=doc.high_tech,
            park_company.map_type=doc.map_type
            await park_company.save();
            common.sendData(res, park_company)
        } else {
            common.sendError(res, 'park_company_02');
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};
//删除企业
async function deleteAct(req, res) {
    try {
        const { body } = req;
        const { park_company_id } = body;

        const result = await tb_park_company.findOne({
            where: {
                park_company_id
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
//查询获取采购
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
//获取企业
async function getData(req, res, is_single, doc) {
    const { body, user } = req;
    const { park_purchase_id } = body;
    let replacements = [];

    let queryStr = 'SELECT t.park_company_id,t.domain_id,t.floor_area,t.construction_area,t.registered_capital,t.paid_up_capital,'+
    't.plan_investment,t.actual_investmen,t.equipment_investment,t.employees_count,t.patent_number,t.map_loaction,t.high_tech,t.map_type,'+
    't.created_at,t.updated_at,cd.domain_name as company_name,CONCAT(cd.domain_province,cd.domain_city,cd.domain_district,cd.domain_address) as company_address' +
    ' from tbl_erc_park_company t'+
    ' right join tbl_common_domain cd on cd.domain_id=t.domain_id'+
        ' where cd.state = 1';
    queryStr += ' order by t.created_at desc';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;

    }

    if (is_single == true) {
        return result.data[0];
    } else {
        return result;
    }
};
//查询获取园区总体企业信息
async function parkSearchAct(req, res) {
    try {
        let returnData = {};

        const { body, user } = req;
        const { park_company_id } = body;
        let replacements = [];

        let queryStr = 'select count(t.park_company_id) as company_num,sum(t.floor_area) as s_floor_areas,'+
        'sum(t.construction_area) as s_cons_areas,sum(t.plan_investment) as s_plan_invest,'+
        'sum(t.actual_investmen) as s_actual_invest,sum(t.registered_capital) as s_reg_capital,'+
        'sum(t.equipment_investment) as s_equipment_invest,sum(t.patent_number) as s_patent_num,'+
        'sum(t.employees_count) as s_employ_num,sum(case when t.high_tech=1 then 1 else 0 end) as s_high_tech'+
        ' from tbl_erc_park_company t ' +
         ' where t.state = 1';//
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

async function one_company(req, res) {
    try {
        let returnData = {};

        const { body, user } = req;
        const { park_company_id } = body;
        let replacements = [];
        let queryStr = 'SELECT t.park_company_id,t.domain_id,t.floor_area,t.construction_area,t.registered_capital,t.paid_up_capital,'+
        't.plan_investment,t.actual_investmen,t.equipment_investment,t.employees_count,t.patent_number,t.map_loaction,t.high_tech,t.map_type,'+
        't.created_at,t.updated_at,cd.domain_name as company_name,CONCAT(cd.domain_province,cd.domain_city,cd.domain_district,cd.domain_address) as company_address' +
        ' from tbl_erc_park_company t'+
        ' right join tbl_common_domain cd on cd.domain_id=t.domain_id'+
            ' where cd.state = 1 and t.park_company_id=?';
            replacements.push(park_company_id);    
        queryStr += ' order by t.created_at desc';
    
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
    
        }
        return common.sendData(res, result.data[0]);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function getCompanyByDomainId(req, res) {
    try {
        let returnData = {};

        const { body, user } = req;
        const { park_company_id } = body;
        let replacements=[];
        let queryStr = 'SELECT t.park_company_id,t.domain_id,t.floor_area,t.construction_area,t.registered_capital,t.paid_up_capital,'+
        't.plan_investment,t.actual_investmen,t.equipment_investment,t.employees_count,t.patent_number,t.map_loaction,t.high_tech,t.map_type,'+
        't.created_at,t.updated_at,cd.domain_name as company_name,CONCAT(cd.domain_province,cd.domain_city,cd.domain_district,cd.domain_address) as company_address' +
        ' from tbl_erc_park_company t'+
        ' right join tbl_common_domain cd on cd.domain_id=t.domain_id'+
            ' where cd.state = 1 and t.domain_id=?';
            replacements.push(user.domain_id);    
        queryStr += ' order by t.created_at desc';
    
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
    
        }
        return common.sendData(res, result.data[0]);

    } catch (error) {
        return common.sendFault(res, error);
    }
};

async function parkstat(req, res) {
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

        return common.sendData(res, result);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
