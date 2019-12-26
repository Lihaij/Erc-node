//项目收款申报
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCProjectCollectReportControl');
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
const tb_project_receipt =model.erc_project_receipt;//项目收款申报
const tb_task = model.erc_task;//任务列表

// 项目收款申报增删改查接口
exports.ERCProjectCollectReportControlResource = (req, res) => {
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
            PRIORITY:GLBConfig.PRIORITY,//优先级
            PROJECTINFO:[],
        };
        let project_infos = await tb_project_info.findAll({
            where: {
                domain_id: req.user.domain_id,
                state: GLBConfig.ENABLE,
            }
        });
        for (let l of project_infos) {
            returnData.PROJECTINFO.push({
                id: l.project_info_id,
                value: l.project_info_id,
                text: l.project_name
            });
        }
        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
// 增加项目收款申报
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [];
        let problem = await tb_project_receipt.create({
            domain_id: user.domain_id,
            project_info_id: doc.project_info_id,
            r_createdate: doc.r_createdate,
            task_title: doc.task_title,
            r_priority:doc.r_priority,
            complete_time:doc.complete_time,
            real_complete_time:doc.real_complete_time,
            proposer: user.user_id,
            task_description: doc.task_description,
            r_executor: doc.r_executor,
        });
        let groupID = common.getUUIDByTime(30);
        await TaskListControlSRV.createTask(user, problem.task_title, '218',problem.r_executor, problem.project_receipt_id, problem.task_description, '', groupID);
        let task=await tb_task.findOne({
            where:{
                task_name:problem.task_title,
                task_type:'218',
                task_review_code:problem.project_receipt_id
            }
        })
        if(task){
            task.require_complate_time=problem.complete_time,
            task.task_priority=problem.r_priority,
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
//修改项目收款申报
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let problem = await tb_project_receipt.findOne({
            where: {
                project_receipt_id: doc.project_receipt_id,
                state:GLBConfig.ENABLE
            }
        });
        if (problem) {
            problem.task_title= doc.task_title,
            problem.proposer= user.user_id,
            problem.r_priority=doc.r_priority,
            problem.r_executor= doc.r_executor,
            problem.task_description= doc.task_description,
            problem.complete_time=doc.complete_time,
            await problem.save();
            let task=await tb_task.findOne({
                where:{
                    task_type:'218',
                    task_review_code:problem.project_receipt_id,
                    domain_id:user.domain_id,
                }
            })
            if(task){
                task.task_name=problem.task_title,
                task.task_publisher=problem.proposer,
                task.task_priority=problem.r_priority,
                task.task_performer=problem.r_executor,
                task.task_description=problem.task_description,
                task.require_complate_time=problem.complete_time,
                await task.save();
            }else{
                return common.sendError(res,'task_01');
            }
            common.sendData(res, problem)
        } else {
            common.sendError(res, 'project_receipt_02');
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};

//删除项目收款申报
async function deleteAct(req, res) {
    try {
        const { body,user } = req;
        const { project_receipt_id } = body;

        const result = await tb_project_receipt.findOne({
            where: {
                project_receipt_id
            }
        });
        if (result) {
            result.state = GLBConfig.DISABLE;
            let task=await tb_task.findOne({
                where:{
                    task_type:'218',
                    task_review_code:result.project_receipt_id,
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
//查询获取项目收款申报
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
//获取项目收款申报
async function getData(req, res, is_single, doc) {
    let user = req.user;
    let replacements = [];
    let queryStr = 'select t.*,cu.name as manage_name,pi.project_name,pi.customer_id,pi.project_state,'+
        'pcu.name as publisher,acu.name as finisher' +
        ' from tbl_erc_project_receipt t' +
        // ' left join tbl_erc_project_milestone pm on pm.project_milestone_id=t.project_milestone_id'+
        ' right join tbl_erc_project_info pi on pi.project_info_id=t.project_info_id'+
        ' left join tbl_common_user cu on cu.user_id = pi.customer_id' +
        ' left join tbl_common_user pcu on pcu.user_id = t.proposer' +
        ' left join tbl_common_user acu on acu.user_id = t.r_executor' +
        ' where t.state = 1 and pi.state=1 and t.domain_id = ?';
    replacements.push(user.domain_id);
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
    if (doc.task_description) {
        queryStr += ' and t.task_description like ?';
        replacements.push('%' + doc.task_description + '%');
    }
    
    // queryStr += ' group by t.project_contract_id';
    queryStr += ' order by t.created_at desc,t.r_priority';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.r_createdate = r.r_createdate ? r.r_createdate.Format('yyyy-MM-dd') : null;
        r.complete_time = r.complete_time ? r.complete_time.Format('yyyy-MM-dd') : null;
        r.real_complete_time = r.real_complete_time ? r.real_complete_time.Format('yyyy-MM-dd') : null;
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
        let problem = await tb_project_receipt.findOne({
            where: {
                project_receipt_id: lendmoneyrepay_id
            }
        });
        if (problem && problem.receipt_state != 2) {
            await tb_project_receipt.update({
                receipt_state: applyState,
                r_executor: applyApprover,
                real_complete_time: new Date()
            }, {
                where: {
                    project_receipt_id: lendmoneyrepay_id
                }
            });
        }
    } catch (error) {
        throw error
    }
};
exports.modifyState = modifyState;