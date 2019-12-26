
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCDevelopScribeOrderControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const task = require('../baseconfig/ERCTaskListControlSRV');
const moment = require('moment');
const sequelize = model.sequelize;
const tb_developsubscribeorder = model.erc_developsubscribeorder;
const tb_developsubscribeorderdetail = model.erc_developsubscribeorderdetail;

const tb_task = model.erc_task;
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;

// 研发项目申购单接口
exports.ERCDevelopScribeOrderControlResource = (req, res) => {
    let method = req.query.method;
    if (method==='init'){
        initAct(req,res)
    } else if (method==='getDevelopSubscribeOrder'){
        getDevelopSubscribeOrder(req,res)
    } else if (method==='getDevelopSubscribeOrderDetail'){
        getDevelopSubscribeOrderDetail(req,res)
    } else if (method==='deleteDevelopSubscribeOrder'){
        deleteDevelopSubscribeOrder(req,res)
    } else if (method==='deleteDevelopSubscribeOrderDetail'){
        deleteDevelopSubscribeOrderDetail(req,res)
    } else if (method==='modifyDevelopSubscribeOrderDetail'){
        modifyDevelopSubscribeOrderDetail(req,res)
    } else if (method==='addDevelopSubscribeOrderDetail'){
        addDevelopSubscribeOrderDetail(req,res)
    } else if (method==='sendDevelopSubscribeOrder'){
        sendDevelopSubscribeOrder(req,res)
    } else {
        common.sendError(res, 'common_01')
    }
};
async function initAct(req,res){
    try{
        let doc = common.docTrim(req.body);
        let returnData = {
            developSubscribeOrderState: GLBConfig.DEVELOPSUBSCRIBEORDERSTATE
        };
        common.sendData(res, returnData);
    }catch (error){
        common.sendFault(res, error);
    }
}
//项目研发申购单
async function getDevelopSubscribeOrder(req,res){
    let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
    let queryStr = `select a.develop_code,a.develop_name,b.budget_work_name,so.*,
        u1.name as creatorName,u2.name as examineName
    from tbl_erc_developsubscribeorder so
    left join tbl_erc_develop a on (a.develop_id = so.develop_id and a.state=1)
    left join tbl_erc_developbudget b on (b.developbudget_id = so.developbudget_id  and b.state=1)
    left join tbl_common_user u1 on (so.subscribeorder_creator=u1.user_id and u1.state=1)
    left join tbl_common_user u2 on (so.subscribeorder_examine=u2.user_id and u2.state=1)
    where so.state=1 and so.domain_id=?`;
    replacements.push(user.domain_id);
    if(doc.search_text){
        queryStr+=' and (so.subscribeorder_code like ? or a.develop_code like ? or a.develop_name like ?)';
        let search_text = `%${doc.search_text}%`;
        replacements.push(search_text);
        replacements.push(search_text);
        replacements.push(search_text);
    }
    let result = await common.queryWithCount(sequelize, req, queryStr, replacements)
    returnData.total = result.count;
    returnData.rows = [];
    for (let ap of result.data) {
        let d = JSON.parse(JSON.stringify(ap));
        d.created_at = ap.created_at ? moment(ap.created_at).format("YYYY-MM-DD") : null;
        d.updated_at = ap.updated_at ? moment(ap.updated_at).format("YYYY-MM-DD") : null;
        d.subscribeorder_examine_time = ap.subscribeorder_examine_time ? moment(ap.subscribeorder_examine_time).format("YYYY-MM-DD") : null;
        returnData.rows.push(d)
    }
    common.sendData(res, returnData);
}
//项目研发申购单明细
async function getDevelopSubscribeOrderDetail(req,res){
    let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
    let queryStr = `select * from tbl_erc_developsubscribeorderdetail 
        where state=1 and developsubscribeorder_id=?`;
    replacements.push(doc.developsubscribeorder_id);
    if(doc.search_text){
        queryStr+=' and subscribeorderdetail_name like ?';
        let search_text = `%${doc.search_text}%`;
        replacements.push(search_text);
    }
    let result = await common.queryWithCount(sequelize, req, queryStr, replacements)
    returnData.total = result.count;
    returnData.rows = [];
    for (let ap of result.data) {
        let d = JSON.parse(JSON.stringify(ap));
        d.created_at = ap.created_at ? moment(ap.created_at).format("YYYY-MM-DD") : null;
        d.updated_at = ap.updated_at ? moment(ap.updated_at).format("YYYY-MM-DD") : null;
        returnData.rows.push(d)
    }
    common.sendData(res, returnData);
}

//删除项目研发申购单
async function deleteDevelopSubscribeOrder(req,res){
    try {
        let doc = common.docTrim(req.body);
        let developsubscribeorder = await tb_developsubscribeorder.findOne({
            where: {
                developsubscribeorder_id: doc.developsubscribeorder_id
            }
        });
        if (developsubscribeorder) {
            developsubscribeorder.state = GLBConfig.DISABLE;
            await developsubscribeorder.save();
        } else {
            common.sendError(res, 'amortizesubscribe_01');
            return
        }

        await tb_developsubscribeorderdetail.update({
            state : GLBConfig.DISABLE
        }, {
            where: {
                developsubscribeorder_id:doc.developsubscribeorder_id
            }
        });
        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//删除项目研发申购单明细
async function deleteDevelopSubscribeOrderDetail(req,res){
    try {
        let doc = common.docTrim(req.body);
        let developsubscribeorderdetail = await tb_developsubscribeorderdetail.findOne({
            where: {
                developsubscribeorderdetail_id: doc.developsubscribeorderdetail_id
            }
        });
        if (developsubscribeorderdetail) {
            developsubscribeorderdetail.state = GLBConfig.DISABLE;
            await developsubscribeorderdetail.save();
        } else {
            common.sendError(res, 'amortizesubscribe_01');
            return
        }
        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 修改项目研发申购单明细
async function modifyDevelopSubscribeOrderDetail(req,res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let developsubscribeorderdetail = await tb_developsubscribeorderdetail.findOne({
            where: {
                developsubscribeorderdetail_id: doc.old.developsubscribeorderdetail_id
            }
        });

        if (developsubscribeorderdetail) {
            developsubscribeorderdetail.subscribeorderdetail_name = doc.new.subscribeorderdetail_name;
            developsubscribeorderdetail.subscribeorderdetail_format = doc.new.subscribeorderdetail_format;
            developsubscribeorderdetail.subscribeorderdetail_unit = doc.new.subscribeorderdetail_unit;
            developsubscribeorderdetail.subscribeorderdetail_number = doc.new.subscribeorderdetail_number;
            developsubscribeorderdetail.subscribeorderdetail_remark = doc.new.subscribeorderdetail_remark;
            await developsubscribeorderdetail.save();
            common.sendData(res, developsubscribeorderdetail);
        } else {
            common.sendError(res, 'amortizesubscribe_01')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}
// 增加项目研发申购单明细
async function addDevelopSubscribeOrderDetail(req,res){
    let doc = common.docTrim(req.body);
    let developsubscribeorderdetail = await tb_developsubscribeorderdetail.create({
        developsubscribeorder_id: doc.developsubscribeorder_id,
        subscribeorderdetail_name: doc.subscribeorderdetail_name,
        subscribeorderdetail_format: doc.subscribeorderdetail_format,
        subscribeorderdetail_unit: doc.subscribeorderdetail_unit,
        subscribeorderdetail_number: doc.subscribeorderdetail_number,
        subscribeorderdetail_remark: doc.subscribeorderdetail_remark,
    });
    common.sendData(res, developsubscribeorderdetail);
}

// 发送研发申购单任务
async function sendDevelopSubscribeOrder(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user;
        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'研发材料申购审核任务'
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
            return common.sendError(res, 'develop_34');
        }else{
            let taskName = '研发项目材料申购审核任务';
            let taskDescription ='研发项目材料申购审核任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user,taskName,52,taskallotuser.user_id,doc.developsubscribeorder_id,taskDescription,'',groupId);
            if(!taskResult){
                return common.sendError(res, 'task_01');
            }else {
                await tb_developsubscribeorder.update({
                    subscribeorder_state:1
                }, {
                    where: {
                        developsubscribeorder_id:doc.developsubscribeorder_id
                    }
                });
                common.sendData(res,taskResult);
            }
        }
    }catch (error){
        common.sendFault(res, error);
    }
}