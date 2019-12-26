//项目里程碑问题
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCProjectMilestoneProblemControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');
const TaskListControlSRV = require('../baseconfig/ERCTaskListControlSRV');

const tb_project_contract = model.erc_project_contract;//项目合同
const tb_project_info = model.erc_project_info;//项目信息
const tb_project_milestone =model.erc_project_milestone;//项目里程碑
const tb_project_milestone_problem =model.erc_project_milestone_problem;//项目里程碑问题
const tb_task = model.erc_task;//任务列表

// 项目里程碑问题增删改查接口
exports.ERCProjectMilestoneProblemControlResource = (req, res) => {
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
    } else if (method === 'setAcceptanceStatus') {//验收
        setAcceptanceStatus(req, res)
    } else if (method === 'upload') {
        uploadAct(req, res)
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
            PROCESS_STATUS:GLBConfig.PROCESS_STATUS,
            PROJECTNAME:'',
            MILESTONENAME:''
        };
        if(doc.project_milestone_id){
            let milestone=await tb_project_milestone.findOne({
                where:{
                    project_milestone_id:doc.project_milestone_id
                }
            })
            returnData.MILESTONENAME=milestone?milestone.milestone_name:'';
            let project_info=await tb_project_info.findOne({
                where:{
                    project_info_id:milestone?milestone.project_info_id:null
                }
            })
            returnData.PROJECTNAME=project_info?project_info.project_name:'';
        }
        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
// 增加项目里程碑问题
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [];
        console.log('problem',doc);
        let problem = await tb_project_milestone_problem.create({
            domain_id: user.domain_id,
            project_milestone_id: doc.project_milestone_id,
            problem_createdate: doc.problem_createdate,
            problem_title: doc.problem_title,
            proposer: user.user_id,
            problem_description: doc.problem_description,
            assignee: doc.assignee,
            deadline:doc.deadline,
        });
        let groupID = common.getUUIDByTime(30);
        await TaskListControlSRV.createTask(user, problem.problem_title, '216',problem.assignee, problem.milestone_problem_id, problem.problem_description, '', groupID);
        let task=await tb_task.findOne({
            where:{
                task_name:problem.problem_title,
                task_type:'216',
                task_review_code:problem.milestone_problem_id
            }
        })
        if(task){
            task.require_complate_time=problem.deadline,
            await task.save();
        }else{
            return common.sendError(res,'task_01');
        }
        common.sendData(res, problem);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
};
//修改项目里程碑问题
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let problem = await tb_project_milestone_problem.findOne({
            where: {
                milestone_problem_id: doc.milestone_problem_id,
                state:GLBConfig.ENABLE
            }
        });
        if (problem) {
            problem.problem_title= doc.problem_title,
            problem.proposer= user.user_id,
            problem.assignee= doc.assignee,
            problem.problem_description= doc.problem_description,
            problem.deadline=doc.deadline,
            await problem.save();
            let task=await tb_task.findOne({
                where:{
                    task_type:'216',
                    task_review_code:problem.milestone_problem_id,
                    domain_id:user.domain_id,
                }
            })
            if(task){
                task.task_name=problem.problem_title,
                task.task_publisher=problem.proposer,
                task.task_performer=problem.assignee,
                task.task_description=problem.problem_description,
                task.require_complate_time=problem.deadline,
                await task.save();
            }else{
                return common.sendError(res,'task_01');
            }
            common.sendData(res, problem)
        } else {
            common.sendError(res, 'project_milestone_problem_02');
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};

//删除项目里程碑问题
async function deleteAct(req, res) {
    try {
        const { body,user } = req;
        const { milestone_problem_id } = body;

        const result = await tb_project_milestone_problem.findOne({
            where: {
                milestone_problem_id
            }
        });
        if (result) {
            result.state = GLBConfig.DISABLE;
            let task=await tb_task.findOne({
                where:{
                    task_type:'216',
                    task_review_code:result.milestone_problem_id,
                    domain_id:user.domain_id,
                }
            })
            if(task){
                task.state = GLBConfig.DISABLE;
                await task.save();
            }else{
                return common.sendError(res,'task_01');
            }

            await result.save();
        }

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//查询获取项目里程碑问题
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
//获取项目里程碑问题
async function getData(req, res, is_single, doc) {
    let user = req.user;
    let replacements = [];
    let queryStr = 'select t.*,cu.name as manage_name,pi.project_name,pi.customer_id,pm.milestone_name,pi.project_state,'+
        'pcu.name as publisher,acu.name as finisher' +
        ' from tbl_erc_project_milestone_problem t' +
        ' right join tbl_erc_project_milestone pm on pm.project_milestone_id=t.project_milestone_id'+
        ' right join tbl_erc_project_info pi on pi.project_info_id=pm.project_info_id'+
        ' left join tbl_common_user cu on cu.user_id = pi.customer_id' +
        ' left join tbl_common_user pcu on pcu.user_id = t.proposer' +
        ' left join tbl_common_user acu on acu.user_id = t.assignee' +
        ' where t.state = 1 and pi.state=1 and t.domain_id = ?';
    replacements.push(user.domain_id);
    if(doc.project_milestone_id){
        queryStr += ' and t.project_milestone_id=?';
        replacements.push(doc.project_milestone_id);
    }
    if (doc.publisher) {
        queryStr += ' and pcu.name like ?';
        replacements.push('%' + doc.publisher + '%');
    }
    if (doc.project_info_id) {
        queryStr += ' and pi.project_info_id=?';
        replacements.push(doc.project_info_id );
    }
    if (doc.finisher) {
        queryStr += ' and acu.name like ?';
        replacements.push('%' + doc.finisher + '%');
    }
    
    // queryStr += ' group by t.project_contract_id';
    queryStr += ' order by t.created_at desc,t.problem_state';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.problem_createdate = r.problem_createdate ? r.problem_createdate.Format('yyyy-MM-dd') : null;
        r.deadline = r.deadline ? r.deadline.Format('yyyy-MM-dd') : null;
        r.real_deadline = r.real_deadline ? r.real_deadline.Format('yyyy-MM-dd') : null;
    }
    if (is_single == true) {
        return result.data[0];
    } else {
        return result;
    }
};
async function uploadAct(req, res) {
    try {
        let fileInfo = await common.fileSave(req);
        let fileUrl = await common.fileMove(fileInfo.url, 'upload');
        fileInfo.url = fileUrl;
        common.sendData(res, fileInfo)
    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function modifyState(applyState, description, lendmoneyrepay_id, applyApprover) {
    try {
        let problem = await tb_project_milestone_problem.findOne({
            where: {
                milestone_problem_id: lendmoneyrepay_id
            }
        });
        if (problem && problem.problem_state != 2) {
            await tb_project_milestone_problem.update({
                problem_state: applyState,
                assignee: applyApprover,
                real_deadline: new Date()
            }, {
                where: {
                    milestone_problem_id: lendmoneyrepay_id
                }
            });
        }
    } catch (error) {
        throw error
    }
};
exports.modifyState = modifyState;