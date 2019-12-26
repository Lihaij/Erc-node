const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCProjectInfoSearchControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');
// const task = require('../baseconfig/ERCTaskListControlSRV');

const tb_project_info = model.erc_project_info;//项目信息model
const tb_project_customer = model.erc_project_customer;//项目客户信息
const tb_project_workleaders = model.erc_project_workleaders;//项目-工作责任人关联
const tb_project_milestone =model.erc_project_milestone;//项目里程碑
const tb_project_acceptance=model.erc_project_acceptance;//项目验收表
const tb_project_evaluate=model.erc_project_evaluate;//项目评价表
const tb_uploadfile = model.erc_uploadfile;//附件文件表
const tb_department=model.erc_department;

// 项目信息增删改查接口
exports.ERCProjectInfoSearchControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'delete') {
        deleteAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'getProjectInfoList') {//获取未结束的项目
        getProjectInfoList(req, res)
    } else if (method === 'getAcceptanceByProjectInfoId') {//获取验收详情
        getAcceptanceByProjectInfoId(req, res)
    } else if (method === 'getEvaluatesByProjectInfoId') {//获取项评价详情
        getEvaluatesByProjectInfoId(req, res)
    } else if (method === 'getMilestoneByProjectInfoId') {//获取项目里程碑详情
        getMilestoneByProjectInfoId(req, res)
    } else if (method === 'getAftersaleByProjectInfoId') {//获取项目售后详情
        getAftersaleByProjectInfoId(req, res)
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
            PROJECTSTATE: GLBConfig.PROJECTFLLOWUPSTATE,//项目状态
            ACCEPTANCESTATUS: GLBConfig.ACCEPTANCESTATUS,//验收状态
            PROCESS_STATUS:GLBConfig.PROCESS_STATUS,//售后问题处理状态
        };
        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
// 增加项目信息
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [];
        console.log(doc);
        let addPeojectInfo = await tb_project_info.create({
            domain_id: user.domain_id,
            project_number: doc.project_number,
            project_name: doc.project_name,
            project_address: doc.project_address,
            project_customer_id: doc.project_customer_id,
            customer_id: doc.customer_id,
            project_state: doc.project_state,
        });
        //增加项目-工作责任人关联表记录
        if (addPeojectInfo) {
            let userIdsArr = doc.user_ids.split(",");
            for (let userId of userIdsArr) {
                let addProjectInfo_User = await tb_project_workleaders.create({
                    domain_id: user.domain_id,
                    project_info_id: addPeojectInfo.project_info_id,
                    user_id: userId
                });
            }

        }

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
            project_info.project_number = doc.project_number,
                project_info.project_name = doc.project_name,
                project_info.project_address = doc.project_address,
                project_info.project_customer_id = doc.project_customer_id,
                project_info.customer_id = doc.customer_id,
                project_info.project_state = doc.project_state,
                await project_info.save();
            if (doc.user_ids) {
                const deleteResult = await tb_project_workleaders.destroy({
                    where: {
                        project_info_id: doc.project_info_id
                    }
                });
                let userIdsArr = doc.user_ids.split(",");
                console.log(userIdsArr);
                for (let userId of userIdsArr) {
                    let project_workleaders = await tb_project_workleaders.create({
                        domain_id: user.domain_id,
                        project_info_id: doc.project_info_id,
                        user_id: userId
                    });
                }
            }
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
async function getData(req, res, is_single, doc) {
    let user = req.user;
    let replacements = [];

        let queryStr = 'select t.*,cu.name as manage_name,pc.full_name,GROUP_CONCAT(pcu.name) as owner_names,pa.project_acceptance_id from tbl_erc_project_info t'+
        ' left join tbl_common_user cu on cu.user_id = t.customer_id' +
        ' left join tbl_erc_project_customer pc on t.project_customer_id=pc.project_customer_id' +
        ' left join tbl_erc_project_acceptance pa on t.project_info_id=pa.project_info_id' +
        ' left join tbl_erc_project_workleaders pw on t.project_info_id=pw.project_info_id'+
        ' left join tbl_common_user pcu on pw.user_id=pcu.user_id'+
        ' where t.state = 1 and t.domain_id = ?';
    replacements.push(user.domain_id);

    if (doc.project_name) {
        queryStr += ' and t.project_name like ?';
        replacements.push('%' + doc.project_name + '%');
    }
    if (doc.project_number) {
        queryStr += ' and t.project_number like ?';
        replacements.push('%' + doc.project_number + '%');
    }
    if (doc.project_leadername) {
        queryStr += ' and cu.name like ?';
        replacements.push('%' + doc.project_leadername + '%');
    }
    queryStr += ' group by t.project_info_id';
    queryStr += ' order by pa.project_acceptance_id desc,t.project_name,t.created_at desc';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.check_date = r.check_date ? r.check_date.Format('yyyy-MM-dd') : null;
    }

    if (is_single == true) {
        return result.data[0];
    } else {
        return result;
    }
};
//获取未验收结束的项目信息列表
async function getProjectInfoList(req, res) {
    try {
        const { body, user } = req;
        let replacements = [];
    let queryStr = 'select t.*,u.name as manage_name from tbl_erc_project_info t ' +
            ' left join tbl_erc_project_acceptance pa on pa.project_info_id=t.project_info_id'+
            ' left join tbl_common_user u on u.user_id=t.customer_id'+
            ' where t.state=1  and t.domain_id=? and pa.project_acceptance_id is null';
        queryStr += ' order by t.project_info_id,t.customer_id,t.created_at desc';
        replacements.push(user.domain_id);
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
        }
        return common.sendData(res, result.data);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function getAcceptanceByProjectInfoId(req, res) {
    const { body, user } = req;
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

    let replacements = [];
    let queryStr = 'select t.*,pi.project_name,pi.customer_id,pi.project_state,cu.name as manage_name,ccu.name as acceptor_name'+
        ' from tbl_erc_project_acceptance t' +
        ' right join tbl_erc_project_info pi on pi.project_info_id=t.project_info_id'+
        ' left join tbl_common_user cu on cu.user_id = pi.customer_id' +
        ' left join tbl_common_user ccu on ccu.user_id = t.acceptor' +
        ' where t.state = 1 and pi.state=1 and t.domain_id = ? and t.project_info_id=?';
    replacements.push(user.domain_id);
    replacements.push(doc.project_info_id);

    queryStr += ' order by pi.project_name,t.acceptance_date,t.created_at desc';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.acceptance_date = r.acceptance_date ? r.acceptance_date.Format('yyyy-MM-dd') : null;
        r.file = await tb_uploadfile.findOne({
            where: {
                api_name: 'ERCPROJECTACCEPTANCECONTROL',
                srv_id: r.project_acceptance_id,
                srv_type: '302',
                state: GLBConfig.ENABLE
            }
        });
        r.file_url=r.file?r.file.file_url:null;

    }
        let returnData = {};
        returnData.total = result.count;
        returnData.rows = result.data;
        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function getEvaluatesByProjectInfoId(req, res) {
    const { body, user } = req;
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

    let replacements = [];
    let queryStr = 'select t.*,pi.project_name,pi.customer_id,pi.project_state,cu.name as manage_name,ccu.name as evaluate_name'+
        ' from tbl_erc_project_evaluate t' +
        ' right join tbl_erc_project_info pi on pi.project_info_id=t.project_info_id'+
        ' left join tbl_common_user cu on cu.user_id = pi.customer_id' +
        ' left join tbl_common_user ccu on ccu.user_id = t.evaluator' +
        ' where t.state = 1 and pi.state=1 and t.domain_id = ? and t.project_info_id=?';
    replacements.push(user.domain_id);
    replacements.push(doc.project_info_id);

    queryStr += ' order by pi.project_name,t.evaluate_date,t.created_at desc';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.evaluate_date = r.evaluate_date ? r.evaluate_date.Format('yyyy-MM-dd') : null;
    }
        let returnData = {};
        returnData.total = result.count;
        returnData.rows = result.data;
        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function getMilestoneByProjectInfoId(req, res) {
    const { body, user } = req;
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

    let replacements = [];
    let queryStr = 'select t.*,cu.name as manage_name,pi.project_name,pi.customer_id,pi.project_state,GROUP_CONCAT(mcu.name) as participant'+
        ' from tbl_erc_project_milestone t' +
        ' right join tbl_erc_project_info pi on pi.project_info_id=t.project_info_id'+
        ' left join tbl_common_user cu on cu.user_id = pi.customer_id' +
        ' left join tbl_erc_project_milestone_participants pmp on pmp.project_milestone_id = t.project_milestone_id' +
        ' left join tbl_common_user mcu on mcu.user_id = pmp.user_id' +
        ' where t.state = 1 and pi.state=1 and t.domain_id = ? and t.project_info_id=?';
    replacements.push(user.domain_id);
    replacements.push(doc.project_info_id);
    queryStr += ' group by t.project_milestone_id';     
    queryStr += ' order by pi.project_name,t.acceptance_status,t.created_at desc';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.milestone_date = r.milestone_date ? r.milestone_date.Format('yyyy-MM-dd') : null;
        r.acceptancetime = r.acceptancetime ? r.acceptancetime.Format('yyyy-MM-dd') : null;
    }
        let returnData = {};
        returnData.total = result.count;
        returnData.rows = result.data;
        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function getAftersaleByProjectInfoId(req, res) {
    const { body, user } = req;
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

    let replacements = [];
    let queryStr = 'select t.*,cu.name as manage_name,pi.project_name,pi.customer_id,pi.project_state,'+
        'pcu.name as publisher,acu.name as finisher'+
        ' from tbl_erc_project_aftersale t' +
        ' left join tbl_erc_project_info pi on t.project_info_id=pi.project_info_id'+
        ' left join tbl_common_user cu on cu.user_id = pi.customer_id' +
        ' left join tbl_common_user pcu on pcu.user_id = t.proposer' +
        ' left join tbl_common_user acu on acu.user_id = t.executor' +
        ' where t.state = 1 and pi.state=1 and t.domain_id=? and t.project_info_id=?';
    replacements.push(user.domain_id);
    replacements.push(doc.project_info_id);

    queryStr += ' order by pi.project_name,t.aftersale_state,t.created_at desc';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.deadline = r.deadline ? r.deadline.Format('yyyy-MM-dd') : null;
        r.real_deadline = r.real_deadline ? r.real_deadline.Format('yyyy-MM-dd') : null;
        let department=await tb_department.findOne({
            where:{
                department_id:r.department_id
            }
        })
        r.department_name=department?department.department_name:null;
    }
        let returnData = {};
        returnData.total = result.count;
        returnData.rows = result.data;
        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
