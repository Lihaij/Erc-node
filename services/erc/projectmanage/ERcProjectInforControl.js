const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCDailyPlanControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');
// const task = require('../baseconfig/ERCTaskListControlSRV');

const tb_project_info = model.erc_project_info;//项目信息model

// 项目信息增删改查接口
exports.ERCProjectInfoControlResource = (req, res) => {
    let method = req.query.method;
    if(method==='init'){
        initAct(req,res)
    }else if (method==='search'){
        searchAct(req,res)
    }else if (method==='add'){
        addAct(req,res)
    }else if (method==='delete'){
        deleteAct(req,res)
    }else if (method==='modify'){
        modifyAct(req,res)
    }else if (method==='get'){
        getAct(req,res)
    }else {
        common.sendError(res, 'common_01')
    }
};
//初始化参数
async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        returnData.ENABLE=GLBConfig.ENABLE;
        returnData.PROJECTSTATE=GLBConfig.PROJECTFLLOWUPSTATE;//项目状态
        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
// 增加项目信息
async function addAct(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [];

        let addPeojectInfo = await tb_project_info.create({
            domain_id:user.domain_id,
            project_number: doc.project_number,
            project_name:doc.project_name,
            project_customer_id: doc.project_customer_id,
            customer_id: doc.customer_id,
            project_state: doc.project_state,
        });
        common.sendData(res, addPeojectInfo);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
};
//修改项目信息
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let project_info = await tb_project_info.findOne({
            where: {
                project_info_id: doc.project_info_id
            }
        });
        if (project_info) {
            project_info.project_number= doc.project_number,
            project_info.project_name=doc.project_name,
            project_info.project_customer_id= doc.project_customer_id,
            project_info.customer_id= doc.customer_id,
            project_info.project_state= doc.project_state,
            await project_info.save();
            common.sendData(res, project_info)
        } else {
            common.sendError(res, 'project_info_02');
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};
//删除项目信息
async function deleteAct(req, res) {
    try {
        const { body } = req;
        const { project_info_id } = body;

        const result = await tb_project_info.findOne({
            where: {
                project_info_id
            }
        });
        //TODO结束的项目才允许删除
        // let projectCount = await tb_project.count({
        //     where: {
        //         project_info_id: project_info_id
        //     }
        // });

        if (result) {
            result.state = GLBConfig.DISABLE;
            await result.save();
        }

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//查询获取项目信息
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
//获取项目信息
async function getData(req, res, is_single, doc){
    let user = req.user;
    let replacements = [];

    let queryStr = 'select t.* from tbl_erc_project_info t where t.state = 1 and t.domain_id = ?';

    replacements.push(user.domain_id);

    if (doc.full_name) {
        queryStr += ' and full_name like ?';
        replacements.push('%' + doc.full_name + '%');
    }
    if (doc.address) {
        queryStr += ' and address like ?';
        replacements.push('%' + doc.address + '%');
    }
    if (doc.phone_number) {
        queryStr += ' and phone_number like ?';
        replacements.push('%' + doc.phone_number + '%');
    }

    queryStr += ' order by t.created_at desc';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r. check_date = r.check_date ? r.check_date.Format('yyyy-MM-dd') : null;
    }

    if (is_single == true) {
        return result.data[0];
    } else {
        return result;
    }
};
