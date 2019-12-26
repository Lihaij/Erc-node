/**
 * Created by shuang.liu on 18/4/17.
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCAskForLeaveControlSRV');
const model = require('../../../model');
const task = require('../baseconfig/ERCTaskListControlSRV');
const moment = require('moment');

const sequelize = model.sequelize;
const tb_user = model.user;
const tb_askforleave = model.erc_askforleave;
const tb_task = model.erc_task;
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;
const tb_uploadfile = model.erc_uploadfile;

//请假列表管理接口
exports.ERCAskForLeaveControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'delete') {
        deleteAct(req, res)
    } else if (method === 'submit') {
        submitAct(req, res)
    } else if (method === 'upload') {
        uploadAct(req, res)
    } else if (method === 'search_files') {
        searchFilesAct(req, res);
    } else if (method==='add_fi'){
        addFileAct(req,res)
    } else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        returnData.askforleaveReason = GLBConfig.ASKFORLEAVEREASON;//请假事由
        returnData.askforleaveState = GLBConfig.CHANGESTATE; //审批状态

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//查询请假列表
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements =[user.user_id];
        let queryStr='select t.*,ut.`name` as askforuser_name from tbl_erc_askforleave t ' +
            'left join tbl_common_user ut on t.askforuser_id = ut.user_id ' +
            'where t.state=1 and t.askforuser_id=? ';
        if (doc.askforleave_id) {
            queryStr += ` and t.askforleave_id =? `;
            replacements.push(doc.askforleave_id);
        }
        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.check_time = r.check_time ? moment(r.check_time).format("YYYY-MM-DD") : null;
            result.created_at = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            result.start_time = r.start_time ? moment(r.start_time).format("YYYY-MM-DD") : null;
            result.end_time = r.end_time ? moment(r.end_time).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//增加请假申请及请假申请审批任务
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        //发布审批请求
        //校验是否分配退货任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'请假审批任务'
            }
        });
        let taskallotuser = await tb_taskallotuser.findOne({
            where:{
                state:GLBConfig.ENABLE,
                domain_id: user.domain_id,
                taskallot_id:taskallot.taskallot_id
            }
        });
        if (!taskallotuser) {
            return common.sendError(res, 'askForLeavetask_01');
        }else{
            let askforleave_id = await Sequence.getAskForLeaveID();
            let addAsk = await tb_askforleave.create({
                askforleave_id: askforleave_id,
                domain_id: user.domain_id,
                askforuser_id:user.user_id,
                start_time: doc.start_time,
                end_time: doc.end_time,
                askforleave_reason: doc.askforleave_reason,
                askforleave_days: doc.askforleave_days,
                askforleave_remark: doc.askforleave_remark,
                askforleave_state: 1
            });

            let taskName = '请假审批任务';
            let taskDescription = doc.askforleave_id + '  请假审批任务';
            let groupId = common.getUUIDByTime(30);
            // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
            let taskResult = await task.createTask(user,taskName,27,taskallotuser.user_id,addAsk.askforleave_id,taskDescription,'',groupId);
            if(!taskResult){
                return common.sendError(res, 'task_01');
            }
            let askforleave = (addAsk.askforleave_id).replace('QJ','');
            for (let m of doc.files) {
                if (m.file_url) {
                    let fileUrl = await common.fileMove(m.file_url, 'upload');
                    let addFile = await tb_uploadfile.create({
                        api_name: common.getApiName(req.path),
                        file_name: m.file_name,
                        file_url: fileUrl,
                        file_type: m.file_type,
                        file_visible: '1',
                        state: GLBConfig.ENABLE,
                        srv_id: askforleave,
                        // srv_type: addAsk.askforleave_id,
                        // order_id: addAsk.askforleave_id,
                        // file_creator: user.name,
                        user_id: user.user_id
                    });
                }
            }
            common.sendData(res, addAsk);
        }
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

//修改请假申请
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modAsk = await tb_askforleave.findOne({
            where: {
                askforleave_id: doc.askforleave_id
            }
        });
        if (modAsk) {
            modAsk.start_time = doc.start_time;
            modAsk.end_time = doc.end_time;
            modAsk.askforleave_reason = doc.askforleave_reason;
            modAsk.askforleave_days = doc.askforleave_days;
            modAsk.askforleave_remark = doc.askforleave_remark;
            await modAsk.save();

            common.sendData(res, modAsk);
        } else {
            common.sendError(res, 'askForLeave_01');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}
//删除请假申请
async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modAsk = await tb_askforleave.findOne({
            where: {
                askforleave_id: doc.askforleave_id
            }
        });
        if (modAsk) {
            modAsk.state = GLBConfig.DISABLE;
            await modAsk.save();

            common.sendData(res, modAsk);
        } else {
            common.sendError(res, 'askForLeave_01');
            return
        }
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//提交请假审批任务
async function submitAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let modAsk = await tb_askforleave.findOne({
            where: {
                askforleave_id: doc.askforleave_id
            }
        });
        if (modAsk) {
            //更新请假数据
            modAsk.start_time = doc.start_time;
            modAsk.end_time = doc.end_time;
            modAsk.askforleave_reason = doc.askforleave_reason;
            modAsk.askforleave_days = doc.askforleave_days;
            modAsk.askforleave_remark = doc.askforleave_remark;
            await modAsk.save();

            //发布审批请求
            //校验是否分配退货任务处理人员
            let taskallot = await tb_taskallot.findOne({
                where:{
                    state:GLBConfig.ENABLE,
                    taskallot_name:'请假审批任务'
                }
            });
            let taskallotuser = await tb_taskallotuser.findOne({
                where:{
                    state:GLBConfig.ENABLE,
                    domain_id: user.domain_id,
                    taskallot_id:taskallot.taskallot_id
                }
            });
            if (!taskallotuser) {
                return common.sendError(res, 'askForLeavetask_01');
            }else{
                let taskName = '请假审批任务';
                let taskDescription = doc.askforleave_id + '  请假审批任务';
                let groupId = common.getUUIDByTime(30);
                // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
                let taskResult = await task.createTask(user,taskName,27,taskallotuser.user_id,doc.askforleave_id,taskDescription,'',groupId);
                if(!taskResult){
                    return common.sendError(res, 'task_01');
                }else{
                    let askforleave = await tb_askforleave.findOne({
                        where: {
                            askforleave_id: doc.askforleave_id,
                            state: 1
                        }
                    });
                    if(askforleave){
                        askforleave.askforleave_state=1;
                        await askforleave.save()
                    }
                    common.sendData(res, askforleave);
                }

            }

            common.sendData(res, modAsk);
        } else {
            common.sendError(res, 'askForLeave_01');
            return
        }


    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//更新文件
async function uploadAct (req, res){
    try {
        let fileInfo = await common.fileSave(req);
        // let fileUrl = await common.fileMove(fileInfo.url, 'upload');
        // fileInfo.url = fileUrl;
        common.sendData(res, fileInfo)
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//修改请假申请状态
async function modifyAskForLeaveState(applyState,description,askforleave_id,applyApprover){

    await tb_askforleave.update({
        askforleave_state:applyState,
        check_time:new Date(),
        askforleave_checker_id:applyApprover,
        askforleave_refuse_remark:description
    }, {
        where: {
            askforleave_id:askforleave_id
        }
    });

}
exports.modifyAskForLeaveState = modifyAskForLeaveState;
//查询相关文件
async function searchFilesAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let askforleave = (doc.askforleave_id).replace('QJ','');

        let queryStr = `select * from tbl_erc_askforleave t where t.state=1 and t.askforleave_id=?`;

        let replacements = [doc.askforleave_id];
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        let resultData = {
            designs: []
        };
        // let api_name = common.getApiName(req.path)
        for (let r of result) {
            let row = JSON.parse(JSON.stringify(r));
            row.files = []
            let ufs = await tb_uploadfile.findAll({
                where: {
                    api_name: 'ERCASKFORLEAVECONTROL',
                    srv_id: askforleave,
                    state: GLBConfig.ENABLE
                }
            })
            if (ufs.length !=0) {
                for (let f of ufs) {
                    row.files.push(f)
                }
                resultData.designs.push(row)
            } else {
                // resultData.designs.push(row)
            }
        }
        common.sendData(res, resultData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//增加附件
async function addFileAct(req, res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let askforleave = (doc.askforleave_id).replace('QJ','');
        //附件
        let addFile = await tb_uploadfile.create({
            api_name: common.getApiName(req.path),
            file_name: doc.file_name,
            file_url: doc.file_url,
            file_type: doc.file_type,
            file_visible: '1',
            state: GLBConfig.ENABLE,
            srv_id: askforleave
        });

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
}