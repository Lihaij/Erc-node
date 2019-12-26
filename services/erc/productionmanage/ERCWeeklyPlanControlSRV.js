const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCWeeklyPlanControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const task = require('../baseconfig/ERCTaskListControlSRV');
const sequelize = model.sequelize;
const moment = require('moment');

const tb_domain = model.common_domain;
const tb_user = model.common_user;

const tb_orderproductplan = model.erc_orderproductplan;//装修订单计划详情，按工序

// 生产周计划接口
exports.ERCWeeklyPlanControlResource = (req, res) => {
    let method = req.query.method;
    if(method === 'getWeeklyPaln') {
        getWeeklyPaln(req, res);
    }else if (method==='modifyProcessDate'){
        modifyProcessDate(req,res)
    }else if (method==='init'){
        initAct(req,res)
    }else if (method==='setTask'){
        setTask(req,res)
    }else {
        common.sendError(res, 'common_01')
    }
};

// 修改周计划的开始与结束时间
async function modifyProcessDate(req,res){
    let queryStr,replacements=[],returnData={};
    let doc=common.docTrim(req.body);
    let processBeginDate='',processEndDate='',diffDate;

    // orderproductplan_id,process_end_date,process_begin_date

    //==
    let orderproductplan = await tb_orderproductplan.findOne({
        where:{
            state:GLBConfig.ENABLE,
            orderproductplan_id:doc.orderproductplan_id
        }
    });
    if(orderproductplan){
        diffDate = moment(doc.process_end_date).diff(moment(doc.process_begin_date), 'days');
        orderproductplan.process_end_date = doc.process_end_date;
        orderproductplan.process_begin_date = doc.process_begin_date;
        orderproductplan.process_duration = diffDate;
        await orderproductplan.save()
    }

    //<
    let orderproductplanless = await tb_orderproductplan.findAll({
        where :{
            state:GLBConfig.ENABLE,
            orderproductplan_id:{
                $lt:doc.orderproductplan_id
            },
            order_id:{
                $eq:orderproductplan.order_id
            }
        },
        order: [
            ['orderproductplan_id', 'DESC']
        ]
    });

    for(let ol of orderproductplanless){
        if(processEndDate==''){
            processEndDate =  moment(doc.process_begin_date).subtract('days',1).format('YYYY-MM-DD');
        }else{
            processEndDate =  moment(processBeginDate).subtract('days',1).format('YYYY-MM-DD');
        }
        processBeginDate = moment(processEndDate).subtract('days',ol.process_duration).format('YYYY-MM-DD');
        diffDate = moment(processEndDate).diff(moment(processBeginDate), 'days');
        ol.process_end_date = processEndDate;
        ol.process_begin_date = processBeginDate;
        ol.process_duration = diffDate;
        await ol.save()
    }


    //>
    processEndDate='';
    processBeginDate='';
    let orderproductplanmore = await tb_orderproductplan.findAll({
        where :{
            state:GLBConfig.ENABLE,
            orderproductplan_id:{
                $gt:doc.orderproductplan_id
            },
            order_id:{
                $eq:orderproductplan.order_id
            }
        },
        order: [
            ['orderproductplan_id']
        ]
    });

    for(let om of orderproductplanmore){
        if(processBeginDate==''){
            processBeginDate =  moment(doc.process_end_date).add('days',1).format('YYYY-MM-DD');
        }else{
            processBeginDate =  moment(processEndDate).add('days',1).format('YYYY-MM-DD');
        }
        processEndDate = moment(processBeginDate).add('days',om.process_duration).format('YYYY-MM-DD');
        diffDate = moment(processEndDate).diff(moment(processBeginDate), 'days');
        om.process_end_date = processEndDate;
        om.process_begin_date = processBeginDate;
        om.process_duration = diffDate;
        om.save()
    }
    common.sendData(res, orderproductplan);
}
// 查询周计划列表
async function getWeeklyPaln(req,res){
    let queryStr,replacements=[],returnData={};
    let doc=common.docTrim(req.body),user=req.user;
    let beginDate =moment().add('days',doc.dateNum).format('YYYY-MM-DD');

    queryStr=`select op.orderproductplan_id,pp.process_name,'场地' as construction_site,
        op.process_begin_date,op.process_end_date,op.order_id,m.materiel_name,op.plan_state,op.description,u.name
        from tbl_erc_orderproductplan op
        left join tbl_erc_produceprocess pp on (op.produceprocess_id=pp.produceprocess_id and pp.state=1)
        left join tbl_erc_order o on (op.order_id=o.order_id and o.state=1)
        left join tbl_erc_produce p on (o.produce_id=p.produce_id and p.state=1)
        left join tbl_erc_materiel m on (p.materiel_id=m.materiel_id and m.state=1)
        left join tbl_common_user u on (op.plan_assign=u.user_id and u.state=1)
        where op.state=1 and o.order_state not in ('FINISHI','CANCELLED') and process_begin_date>=? and o.domain_id=? ` ;
    replacements.push(beginDate);
    replacements.push(user.domain_id);
    if(doc.orderproductplan_id){
        queryStr+=' and op.orderproductplan_id like ?';
        replacements.push('%' + doc.orderproductplan_id + '%');
    }
    if(doc.order_id){
        queryStr+=' and o.order_id like ?';
        replacements.push('%' + doc.order_id + '%');
    }
    queryStr+=' order by op.orderproductplan_id,pp.process_level';
    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    returnData.total = result.count;
    returnData.rows = [];
    for(let r of result.data){
        let result = JSON.parse(JSON.stringify(r));
        result.process_begin_date = (r.process_begin_date)?moment(r.process_begin_date).format('YYYY-MM-DD'):'';
        result.process_end_date = (r.process_end_date)?moment(r.process_end_date).format('YYYY-MM-DD'):'';

        if(moment().isBefore(result.process_begin_date)){
            result.process_state='未开工'
        }else if (moment().isBetween(result.process_begin_date, result.process_end_date)){
            result.process_state='施工中'
        }else if (moment().isAfter(result.process_end_date)){
            result.process_state='已完工'
        }
        returnData.rows.push(result)
    }
    common.sendData(res, returnData);

}
// 初始化基础数据
async function initAct(req, res) {
    let returnData = {};
    let user=req.user;
    await FDomain.getDomainListInit(req, returnData);
    returnData.planState = GLBConfig.PLANSTATE;//计划单状态
    returnData.user = [];
    let userDate = await tb_user.findAll({
        where:{
            state: GLBConfig.ENABLE,
            domain_id:user.domain_id
        }
    });
    for(let u of userDate){
        returnData.user.push({
            id:u.user_id,
            text:u.name,
            value:u.user_id
        })
    }
    common.sendData(res, returnData)
}

// 生成周计划需要提交申请
async function setTask(req,res){
    try{// user, taskName, taskType  4, taskPerformer, taskReviewCode, taskDescription
        let user=req.user;
        let doc=req.body;
        let taskArr = doc.taskArr;
        for(let t of taskArr){
            let taskName = '周计划';
            let groupId = common.getUUIDByTime(30);

            let taskResult = await task.createTask(user,taskName,4,'',t.orderproductplan_id,'','',groupId);
            if(!taskResult){
                return common.sendError(res, 'task_02');
            }else{
                await tb_orderproductplan.update({
                    plan_state:1,
                    // plan_assign:doc.task_user_id
                }, {
                    where: {
                        orderproductplan_id:t.orderproductplan_id
                    }
                });
            }
        }
        common.sendData(res, {})
    }catch (error){
        common.sendFault(res, error);
    }
}

// 审核后，修改周计划的状态
async function modifyPlanState(planState,description,orderproductplanId,planAssign){

    await tb_orderproductplan.update({
        plan_state:planState,
        description:description,
        plan_assign:planAssign
    }, {
        where: {
            orderproductplan_id:orderproductplanId
        }
    });
}
exports.modifyPlanState = modifyPlanState;
