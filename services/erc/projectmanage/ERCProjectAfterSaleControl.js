//项目售后
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCProjectAfterSaleControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');
const TaskListControlSRV = require('../baseconfig/ERCTaskListControlSRV');

const tb_project_contract = model.erc_project_contract;//项目合同
const tb_project_info = model.erc_project_info;//项目信息
const tb_project_milestone =model.erc_project_milestone;//项目里程碑
const tb_project_aftersale =model.erc_project_aftersale;//项目售后
const tb_task = model.erc_task;//任务列表
const tb_custorgstructure=model.erc_custorgstructure;
const tb_department=model.erc_department;

// 项目售后增删改查接口
exports.ERCProjectAfterSaleControlResource = (req, res) => {
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
            // PROJECTSTATE: GLBConfig.PROJECTFLLOWUPSTATE,//项目状态
            // ACCEPTANCESTATUS: GLBConfig.ACCEPTANCESTATUS,//验收状态
            PROJECTINFO:[],
            PROCESS_STATUS:GLBConfig.PROCESS_STATUS,
            USERINFO:{id:user.user_id,value:user.user_id,text:user.name}
        };
        let project_infos = await tb_project_info.findAll({
            where: {
                domain_id: req.user.domain_id,
                state: GLBConfig.ENABLE,
                project_state:'3'
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
// 增加项目售后
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [];
        console.log('aftersale',doc);
        let department= await tb_custorgstructure.findOne({
            where:{
                user_id:doc.executor
            }
        })
        let problem = await tb_project_aftersale.create({
            domain_id: user.domain_id,
            project_info_id: doc.project_info_id,
            question_description: doc.question_description,
            as_task: doc.as_task,
            proposer: user.user_id,
            executor: doc.executor,
            department_id:department?department.department_id:null,
            deadline:doc.deadline
        });
        let groupID = common.getUUIDByTime(30);
        await TaskListControlSRV.createTask(user, problem.as_task, '217',problem.executor, problem.project_aftersale_id, problem.question_description, '', groupID);
        let task=await tb_task.findOne({
            where:{
                task_name:problem.as_task,
                task_type:'217',
                task_review_code:problem.project_aftersale_id
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
//修改项目售后
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let problem = await tb_project_aftersale.findOne({
            where: {
                project_aftersale_id: doc.project_aftersale_id,
                state:GLBConfig.ENABLE
            }
        });
        let department= await tb_custorgstructure.findOne({
            where:{
                user_id:doc.executor
            }
        })
        if (problem) {
            problem.as_task= doc.as_task,
            problem.proposer= user.user_id,
            problem.executor= doc.executor,
            problem.question_description= doc.question_description,
            problem.department_id=department?department.department_id:problem.department_id,
            problem.deadline=doc.deadline,
            await problem.save();
            let task=await tb_task.findOne({
                where:{
                    task_type:'217',
                    task_review_code:problem.project_aftersale_id,
                    domain_id:user.domain_id,
                }
            })
            if(task){
                task.task_name=problem.as_task,
                task.task_publisher=problem.proposer,
                task.task_performer=problem.executor,
                task.task_description=problem.question_description,
                task.require_complate_time=problem.deadline,
                await task.save();
            }else{
                return common.sendError(res,'task_01');
            }
            common.sendData(res, problem)
        } else {
            common.sendError(res, 'project_aftersale_02');
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};

//删除项目售后
async function deleteAct(req, res) {
    try {
        const { body,user } = req;
        const { project_aftersale_id } = body;

        const result = await tb_project_aftersale.findOne({
            where: {
                project_aftersale_id
            }
        });
        if (result) {
            result.state = GLBConfig.DISABLE;
            let task=await tb_task.findOne({
                where:{
                    task_type:'217',
                    task_review_code:result.project_aftersale_id,
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
//查询获取项目售后
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
//获取项目售后
async function getData(req, res, is_single, doc) {
    let user = req.user;
    let replacements = [];
    let queryStr = 'select t.*,cu.name as manage_name,pi.project_name,pi.customer_id,pi.project_state,'+
        'pcu.name as publisher,acu.name as finisher'+
        ' from tbl_erc_project_aftersale t' +
        ' right join tbl_erc_project_info pi on t.project_info_id=pi.project_info_id'+
        ' left join tbl_common_user cu on cu.user_id = pi.customer_id' +
        ' left join tbl_common_user pcu on pcu.user_id = t.proposer' +
        ' left join tbl_common_user acu on acu.user_id = t.executor' +
        // ' left join tbl_erc_custorgstructure dct on dct.user_id = t.executor'+
        // ' left join tbl_erc_department dpt on dpt.department_id=dct.department_id'+
        ' where t.state = 1 and pi.state=1 and t.domain_id = ?';
    replacements.push(user.domain_id);
    if(doc.project_aftersale_id){
        queryStr += ' and t.project_aftersale_id=?';
        replacements.push(doc.project_aftersale_id);
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
    if (doc.question_description) {
        queryStr += ' and t.question_description like ?';
        replacements.push('%' + doc.question_description + '%');
    }
    
    // queryStr += ' order by pi.project_name,t.aftersale_state,t.created_at desc';

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
    if (is_single == true) {
        return result.data[0];
    } else {
        return result;
    }
};
async function uploadAct(req, res) {
    try {
        let fileInfo = await common.fileSave(req);
        common.sendData(res, fileInfo)
    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function modifyState(applyState, description, lendmoneyrepay_id, applyApprover) {
    try {
        let problem = await tb_project_aftersale.findOne({
            where: {
                project_aftersale_id: lendmoneyrepay_id
            }
        });

        if (problem && problem.aftersale_state != 2) {
            var createTime =new Date(problem.created_at);  
            var finishTime = new Date();    //结束时间
            
            var milliseconds = finishTime.getTime() - createTime.getTime();   //时间差的毫秒数
            var hours=parseFloat(milliseconds/(3600*1000)).toFixed(2);
            let department= await tb_custorgstructure.findOne({
                where:{
                    user_id:applyApprover
                }
            })
            await tb_project_aftersale.update({
                aftersale_state: applyState,
                executor: applyApprover,
                complate_hours:hours,
                department_id:department?department.department_id:problem.department_id,
                real_deadline: finishTime
            }, {
                where: {
                    project_aftersale_id: lendmoneyrepay_id
                }
            });
        }
    } catch (error) {
        throw error
    }
};
exports.modifyState = modifyState;