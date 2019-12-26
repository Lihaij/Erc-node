
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCAmortizeDetailControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const task = require('../baseconfig/ERCTaskListControlSRV');
const moment = require('moment');
const sequelize = model.sequelize;

const tb_amortizesubscribeorder = model.erc_amortizesubscribeorder;
const tb_amortizesubscribeorderdetail = model.erc_amortizesubscribeorderdetail;

const tb_task = model.erc_task;
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;

// 待摊资产申购单列表
exports.ERCAmortizeScribeOrderControlResource = (req, res) => {
    let method = req.query.method;
    if (method==='init'){
        initAct(req,res)
    } else if (method === 'getAmortizeSubscribeOrder'){
        getAmortizeSubscribeOrder(req,res)
    } else if (method==='getAmortizeSubscribeOrderDetail'){
        getAmortizeSubscribeOrderDetail(req,res)
    } else if (method==='deleteAmortizeSubscribeOrder'){
        deleteAmortizeSubscribeOrder(req,res)
    } else if (method==='deleteAmortizeSubscribeOrderDetail'){
        deleteAmortizeSubscribeOrderDetail(req,res)
    } else if (method==='modifyAmortizeSubscribeOrderDetail'){
        modifyAmortizeSubscribeOrderDetail(req,res)
    } else if (method==='addAmortizeSubscribeOrderDetail'){
        addAmortizeSubscribeOrderDetail(req,res)
    } else if (method==='sendAmortizeSubscribeOrder'){
        sendAmortizeSubscribeOrder(req,res)
    } else {
        common.sendError(res, 'common_01')
    }
};
// 初始化基础数据
async function initAct(req,res){
    try{
        let doc = common.docTrim(req.body);
        let returnData = {
            amortizeSubscribeOrderState: GLBConfig.AMORTIZESUBSCRIBEORDERSTATE,
        };
        common.sendData(res, returnData);
    }catch (error){
        common.sendFault(res, error);
    }
}

//待摊资产申购单列表
async function getAmortizeSubscribeOrder(req,res){
    let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
    let queryStr = `select a.amortize_code,a.amortize_name,b.budget_work_name,so.*,
        u1.name as creatorName,u2.name as examineName
    from tbl_erc_amortizesubscribeorder so
    left join tbl_erc_amortize a on (a.amortize_id = so.amortize_id and a.state=1)
    left join tbl_erc_amortizebudget b on (b.amortizebudget_id = so.amortizebudget_id  and b.state=1)
    left join tbl_common_user u1 on (so.subscribeorder_creator=u1.user_id and u1.state=1)
    left join tbl_common_user u2 on (so.subscribeorder_examine=u2.user_id and u2.state=1)
    where so.state=1 and so.domain_id=?`;
    replacements.push(user.domain_id);
    if(doc.search_text){
        queryStr+=' and (so.subscribeorder_code like ? or a.amortize_code like ? or a.amortize_name like ?)';
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
//待摊资产申购单明细
async function getAmortizeSubscribeOrderDetail(req,res){
    let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
    let queryStr = `select * from tbl_erc_amortizesubscribeorderdetail 
        where state=1 and amortizesubscribeorder_id=?`;
    replacements.push(doc.amortizesubscribeorder_id);
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

//删除待摊资产申购单列表
async function deleteAmortizeSubscribeOrder(req,res){
    try {
        let doc = common.docTrim(req.body);
        let amortizesubscribeorder = await tb_amortizesubscribeorder.findOne({
            where: {
                amortizesubscribeorder_id: doc.amortizesubscribeorder_id
            }
        });
        if (amortizesubscribeorder) {
            amortizesubscribeorder.state = GLBConfig.DISABLE;
            await amortizesubscribeorder.save();
        } else {
            common.sendError(res, 'amortizesubscribe_01');
            return
        }

        await tb_amortizesubscribeorderdetail.update({
            state : GLBConfig.DISABLE
        }, {
            where: {
                amortizesubscribeorder_id:doc.amortizesubscribeorder_id
            }
        });
        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//删除待摊资产申购单明细
async function deleteAmortizeSubscribeOrderDetail(req,res){
    try {
        let doc = common.docTrim(req.body);
        let amortizesubscribeorderdetail = await tb_amortizesubscribeorderdetail.findOne({
            where: {
                amortizesubscribeorderdetail_id: doc.amortizesubscribeorderdetail_id
            }
        });
        if (amortizesubscribeorderdetail) {
            amortizesubscribeorderdetail.state = GLBConfig.DISABLE;
            await amortizesubscribeorderdetail.save();
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
//修改待摊资产申购单状态
async function modifyAmortizeSubscribeOrderDetail(req,res){
    try {
        let doc = common.docTrim(req.body);

        let amortizesubscribeorderdetail = await tb_amortizesubscribeorderdetail.findOne({
            where: {
                amortizesubscribeorderdetail_id: doc.old.amortizesubscribeorderdetail_id
            }
        });

        if (amortizesubscribeorderdetail) {
            amortizesubscribeorderdetail.subscribeorderdetail_name = doc.new.subscribeorderdetail_name;
            amortizesubscribeorderdetail.subscribeorderdetail_format = doc.new.subscribeorderdetail_format;
            amortizesubscribeorderdetail.subscribeorderdetail_unit = doc.new.subscribeorderdetail_unit;
            amortizesubscribeorderdetail.subscribeorderdetail_number = doc.new.subscribeorderdetail_number;
            amortizesubscribeorderdetail.subscribeorderdetail_remark = doc.new.subscribeorderdetail_remark;
            await amortizesubscribeorderdetail.save();
            common.sendData(res, amortizesubscribeorderdetail);
        } else {
            common.sendError(res, 'amortizesubscribe_01')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}
//增加待摊资产申购单明细
async function addAmortizeSubscribeOrderDetail(req,res){
    let doc = common.docTrim(req.body);
    let amortizesubscribeorderdetail = await tb_amortizesubscribeorderdetail.create({
        amortizesubscribeorder_id: doc.amortizesubscribeorder_id,
        subscribeorderdetail_name: doc.subscribeorderdetail_name,
        subscribeorderdetail_format: doc.subscribeorderdetail_format,
        subscribeorderdetail_unit: doc.subscribeorderdetail_unit,
        subscribeorderdetail_number: doc.subscribeorderdetail_number,
        subscribeorderdetail_remark: doc.subscribeorderdetail_remark,
    });
    common.sendData(res, amortizesubscribeorderdetail);
}
// 发送任务
async function sendAmortizeSubscribeOrder(req,res){
    let doc = common.docTrim(req.body),user = req.user;
    //校验是否分配任务处理人员
    let taskallot = await tb_taskallot.findOne({
        where:{
            state:GLBConfig.ENABLE,
            taskallot_name:'待摊资产材料申购审核任务'
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
        return common.sendError(res, 'amortize_34');
    }else{
        let taskName = '待摊资产材料申购审核任务';
        let taskDescription ='待摊资产材料申购审核任务';
        let groupId = common.getUUIDByTime(30);
        let taskResult = await task.createTask(user,taskName,34,taskallotuser.user_id,doc.amortizesubscribeorder_id,taskDescription,'',groupId);
        if(!taskResult){
            return common.sendError(res, 'task_01');
        }else {
            await tb_amortizesubscribeorder.update({
                subscribeorder_state:1
            }, {
                where: {
                    amortizesubscribeorder_id:doc.amortizesubscribeorder_id
                }
            });
            common.sendData(res,taskResult);
        }
    }
}
