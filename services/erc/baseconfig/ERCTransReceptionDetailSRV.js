/**
 * 交通接待详情维护
 * Created by Cici.
 */

const fs = require('fs');
const moment = require('moment');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCTransReceptionSRV');
const model = require('../../../model');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const task = require('./ERCTaskListControlSRV');

// tables
const sequelize = model.sequelize;
const tb_trafficreceptionapply = model.erc_trafficreceptionapply;
const tb_reimburserank = model.erc_reimburserank;
const tb_vehicle = model.erc_vehicle;
const tb_user=model.common_user;
const tb_task=model.erc_task;
const tb_trafficreceptionexpense = model.erc_trafficreceptionexpense;
const tb_trafficreceptionexpensedetail = model.erc_trafficreceptionexpensedetail;
const tb_customer = model.erc_customer;

exports.ERCTransReceptionDetailResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'setTask') {
        setTask(req, res)
    } else if (method === 'traffictools') {//工具联动列表
        getTrafficToolsAct(req, res)
    } else {
        common.sendError(res, 'common_01');
    }
};

//获得职级
let getReim = async(req,domain)=>{
    let rank = await tb_reimburserank.findAll({
        where: {
            domain_id: domain,
            state: GLBConfig.ENABLE
        }
    });
    var returnData=[];
    for (let i of rank) {
        let temy = {}
        temy.id=i.reimburserank_id;
        temy.value=i.reimburserank_id;
        temy.text=i.reimburserank_name;
        returnData.push(temy);
    }
    return returnData;
};

//获得车辆
let getVehicle = async(req,domain)=>{
    let vehicle = await tb_vehicle.findAll({
        where: {
            domain_id: domain,
            vehicle_status:GLBConfig.VEHICLESTATUS[0].value,
            state: GLBConfig.ENABLE
        }
    });
    var returnData=[];
    for (let i of vehicle) {
        let temy = {}
        temy.id=i.vehicle_id;
        temy.value=i.vehicle_id;
        temy.text=i.license_plate_num;
        returnData.push(temy);
    }
    return returnData
};

//获得人员
let getUser = async(req,domain)=>{
    let users = await tb_user.findAll({
        where: {
            domain_id: domain,
            state: GLBConfig.ENABLE,
            user_type: GLBConfig.TYPE_OPERATOR
        }
    });
    var returnData=[];
    for (let i of users) {
        let temy = {}
        temy.id=i.user_id;
        temy.value=i.user_id;
        temy.text=i.name;
        returnData.push(temy);
    }
    return returnData
};

//获得审核人任务
let getConfirmUser = async(req,domain,data)=>{
    let user = await tb_user.findOne({
        where: {
            domain_id: domain,
            state: GLBConfig.ENABLE,
            user_type: GLBConfig.TYPE_OPERATOR,
            user_id:data.trapply_confirm_id
        }
    });
    return user
};

let initAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};

        let reimResult= await getReim(req,user.domain_id);
        let vehicleResult = await getVehicle(req,user.domain_id);
        let userResult = await getUser(req,user.domain_id);

        returnData.reimburSerankArr=reimResult;//职级
        returnData.vehicleArr=vehicleResult;//车辆
        returnData.userArr=userResult;//人员
        returnData.trapply_trip_reason_type_arr= GLBConfig.TRAPPLY_TRIP_REASON_TYPE;//出差事由分类
        returnData.trapply_trans_way_arr= GLBConfig.TRAPPLY_TRANS_WAY;//交通方式
        returnData.trapply_vehicle_review_type_arr= GLBConfig.TRAPPLY_VEHICLE_REVIEW_TYPE;//公司派车报销模式
        returnData.trapply_reception_reason_type_arr= GLBConfig.TRAPPLY_RECEPTION_REASON_TYPE;//接待事由分类
        returnData.trapply_reception_review_type_arr= GLBConfig.TRAPPLY_RECEPTION_REVIEW_TYPE;//接待住宿费用报销模式
        returnData.trapply_state_arr= GLBConfig.CHANGESTATE;//审核状态
        returnData.trafficTools = GLBConfig.TRAFFICTOOLS;//公共交通
        common.sendData(res, returnData);
    } catch (error) {
        logger.error('ERCTransReceptionResource-initAct:' + error);
        common.sendFault(res, error);
    }
};

let caculateExpendDate = (startDate, endDate)=> {
    var start_date=new Date(startDate);
    var end_date=new Date(endDate);
    let interval = end_date.getTime() - start_date.getTime();
    let days = Math.floor(interval/(24*3600*1000))+1;
    return days
};

//计算职级金额
let setReimData=async(data)=>{
    let returnData=data;
    let intervalDate=caculateExpendDate(data.trapply_start_time,data.trapply_end_time);//todo 判断间隔时间
    //交通申请
    if(data.trapply_start_time !== null &&  data.trapply_end_time !== null){
        if(data.reimburserank_trip_putup_level!==null){
            returnData.reimburserank_trip_putup_price=data.reimburserank_trip_putup_level*intervalDate;
        }
        if(data.reimburserank_downtown_traffic_level!==null){
            returnData.reimburserank_downtown_traffic_price=data.reimburserank_downtown_traffic_level*intervalDate;
        }
        if(data.reimburserank_meal_level!==null){
            returnData.reimburserank_meal_price=data.reimburserank_meal_level*intervalDate;
        }
        if(data.reimburserank_gas_level!==null && data.trapply_vehicle_distance!==null && (data.trapply_trans_way==='2' || data.trapply_trans_way==='3')){
            returnData.reimburserank_gas_price=data.reimburserank_gas_level*data.trapply_vehicle_distance;
        }
    }
    //接待申请
    if(data.customer_reimburserank_id !== null && data.trapply_start_time !== null &&  data.trapply_end_time !== null){
        let rank = await tb_reimburserank.findAll({
            where: {
                domain_id: data.domain_id,
                state: GLBConfig.ENABLE,
                reimburserank_id:data.trapply_reception_review_level
            }
        });
        let returnData=data;
        let reimData=[];

        if(rank && rank.length>0){
            let trapply_reception_review_level=rank[0];
            if(parseInt(trapply_reception_review_level.reimburserank_name)>parseInt(data.reimburserank_name)){
                reimData=trapply_reception_review_level;
            }else if(parseInt(data.reimburserank_name)>parseInt(trapply_reception_review_level.reimburserank_name)){
                reimData=data;
            }else{
                reimData=data;
            }

            if(reimData.reimburserank_reception_putup_level!==null && data.trapply_reception_room_num!==null){
                returnData.reimburserank_reception_putup_price=reimData.reimburserank_reception_putup_level*intervalDate*data.trapply_reception_room_num;
            }
            if(reimData.reimburserank_reception_level!==null && data.trapply_reception_crew_num!==null){
                returnData.reimburserank_reception_price=reimData.reimburserank_reception_level*intervalDate*data.trapply_reception_crew_num;
            }

            return returnData
        }else {
            return returnData
        }

    }else {
        return returnData
    }
};

//获得交通接待申请
let searchAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};

        let queryStr = 'select a.*,b.customer_reimburserank_id,r.reimburserank_id,r.reimburserank_name,' +
            'r.reimburserank_reception_putup_level,r.reimburserank_trip_putup_level,r.reimburserank_downtown_traffic_level,' +
            'r.reimburserank_meal_level,r.reimburserank_reception_level,r.reimburserank_gas_level,r.reimburserank_traffic_available,d.name as trapply_confirm_name' +
            ' from tbl_erc_transreceptionapply a ' +
            'left join tbl_erc_customer b on b.user_id = a.trapply_creator_id ' +
            'left join tbl_common_user d on d.user_id = a.trapply_confirm_id ' +
            'left join tbl_erc_reimburserank r on r.reimburserank_id = b.customer_reimburserank_id ' +
            'where a.domain_id = ? and a.state = ?';

        let replacements = [user.domain_id, GLBConfig.ENABLE];

        if (doc.trapply_id) {
            queryStr += ` and a.trapply_id = ? `;
            replacements.push(doc.trapply_id);
        }
        if (doc.trapply_code) {
            queryStr += ` and a.trapply_code = ? `;
            replacements.push(doc.trapply_code);
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let i of result.data) {
            let temy = JSON.parse(JSON.stringify(i));
            temy.created_at = i.created_at ? moment(i.created_at).format("YYYY-MM-DD HH:mm") : null;
            temy.trapply_confirm_time = i.trapply_confirm_time ? moment(i.trapply_confirm_time).format("YYYY-MM-DD HH:mm") : null;
            temy.trapply_start_time = i.trapply_start_time ? moment(i.trapply_start_time).format("YYYY-MM-DD") : null;
            temy.trapply_end_time = i.trapply_end_time ? moment(i.trapply_end_time).format("YYYY-MM-DD") : null;
            returnData.rows.push(temy)
        }

        if(returnData.rows.length>0){
            //职级判断
            let reimData = await setReimData(returnData.rows[0],res);
            returnData.rows[0]=reimData;

            //获得审批人
            if(reimData.trapply_start_time===null && reimData.trapply_end_time !== null){
                let confirm_user= await getConfirmUser(req,user.domain_id,returnData.rows[0]);
                if(confirm_user){
                    returnData.rows[0].confirm_user=confirm_user.name;
                }
            }
            common.sendData(res, returnData);
        }else {
            common.sendData(res, returnData);
        }

    } catch (error) {
        logger.error('ERCTransReceptionResource-searchAct:' + error);
        common.sendFault(res, error);
    }
};

let modifyAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body), user = req.user;
        /*判断车辆是否被占用*/
        if(doc.trapply_vehicle_apply && doc.trapply_start_time && doc.trapply_end_time){
            let startDate = doc.trapply_start_time ? moment(doc.trapply_start_time).format("YYYY-MM-DD") : null;
            let endDate = doc.trapply_end_time ? moment(doc.trapply_end_time).format("YYYY-MM-DD") : null;
            let applyArr = await tb_trafficreceptionapply.findAll({
                where:{
                    state:GLBConfig.ENABLE,
                    domain_id:doc.domain_id,
                    trapply_vehicle_apply:doc.trapply_vehicle_apply,
                    trapply_state:['1','2']
                }
            })

            for (let a of applyArr){
                let temy = JSON.parse(JSON.stringify(a));
                if(temy.trapply_id !== doc.trapply_id){
                    let temyStartDate = temy.trapply_start_time ? moment(temy.trapply_start_time).format("YYYY-MM-DD") : null;
                    let temyEndDate = temy.trapply_end_time ? moment(temy.trapply_end_time).format("YYYY-MM-DD") : null;
                    if(moment(temyStartDate).isSame(startDate) || (moment(startDate).isAfter(temyStartDate) && moment(startDate).isBefore(temyEndDate)) || moment(temyEndDate).isSame(startDate)){
                        return common.sendError(res, 'trafficApply_02');
                    }
                    if(moment(temyStartDate).isSame(endDate) || (moment(endDate).isAfter(temyStartDate) && moment(endDate).isBefore(temyEndDate)) || moment(temyEndDate).isSame(endDate)){
                        return common.sendError(res, 'trafficApply_02');
                    }
                }
            }
        }

        /*保存数据*/
        let apply = await tb_trafficreceptionapply.findOne({
            where: {
                trapply_id: doc.trapply_id
            }
        });

        if (apply) {
            /*apply.trapply_state = doc.trapply_state;*/
            apply.trapply_trip_reason=doc.trapply_trip_reason;
            apply.trapply_trip_reason_type=doc.trapply_trip_reason_type;
            apply.trapply_trip_origin_prov=doc.trapply_trip_origin_prov;
            apply.trapply_trip_origin_city=doc.trapply_trip_origin_city;
            apply.trapply_trip_origin_dist=doc.trapply_trip_origin_dist;//出差起始地区
            apply.trapply_trip_origin_detail=doc.trapply_trip_origin_detail;//出差起始地详细地址
            apply.trapply_trip_termini_prov=doc.trapply_trip_termini_prov;//出差目的地省
            apply.trapply_trip_termini_city=doc.trapply_trip_termini_city;//出差目的地市
            apply.trapply_trip_termini_dist=doc.trapply_trip_termini_dist;//出差目的地区
            apply.trapply_trip_termini_detail=doc.trapply_trip_termini_detail;//出差目的地详细地址
            apply.trapply_trans_way=doc.trapply_trans_way;//交通方式
            apply.trapply_vehicle_apply=doc.trapply_vehicle_apply;//车辆申请
            apply.trapply_vehicle_review_type=doc.trapply_vehicle_review_type;//派车费用报销模式
            apply.trapply_vehicle_distance=doc.trapply_vehicle_distance;//预计公里数
            apply.trapply_traffic_tools=doc.trapply_traffic_tools;//交通工具

            //接待申请详情
            apply.trapply_reception_reason=doc.trapply_reception_reason;//接待事由
            apply.trapply_reception_reason_type=doc.trapply_reception_reason_type;//接待事由分类
            apply.trapply_reception_object=doc.trapply_reception_object;//接待主要对象姓名
            apply.trapply_reception_room_num=doc.trapply_reception_room_num;//住宿登记房间个数
            apply.trapply_reception_review_type=doc.trapply_reception_review_type;//接待费用报销模式
            apply.trapply_reception_review_level=doc.trapply_reception_review_level;//接待主要对象接待级职
            apply.trapply_reception_crew_num=doc.trapply_reception_crew_num;//接待对象随行人数
            apply.trapply_reception_extra=doc.trapply_reception_extra;//赠送礼品或额外活动
            apply.trapply_reception_extra_fee=doc.trapply_reception_extra_fee;//额外活动费用预算
            apply.trapply_recetion_crew_ids=doc.trapply_recetion_crew_ids;//陪同人员IDs
            apply.trapply_pre_fee=doc.trapply_pre_fee;

            apply.trapply_start_time=doc.trapply_start_time;//申请时间起始
            apply.trapply_end_time=doc.trapply_end_time;//申请时间截止

            if(doc.trapply_traffic_fee){
                apply.trapply_traffic_fee=doc.trapply_traffic_fee;
            }else {
                apply.trapply_traffic_fee=0;
                if(doc.trapply_trans_way!=='2' && doc.trapply_trans_way!=='3' && doc.trapply_trans_way!=='2' && doc.trapply_trans_way!=="" && doc.reimburserank_traffic_available!==null){
                    apply.trapply_traffic_fee=doc.reimburserank_traffic_available;
                }
            }

            await apply.save();
            common.sendData(res, apply)
        } else {
            common.sendError(res, 'trafficApply_01');
        }
    } catch (error) {
        logger.error('ERCTransReceptionResource-modifyAct:' + error);
        common.sendFault(res, error);
    }
}

async function setTask(req,res){
    try{// user, taskName, taskType  4, taskPerformer, taskReviewCode, taskDescription
        let user=req.user;
        let doc = req.body;
        // 申请状态 0待提交，1已提交，2通过,3拒绝

        let transapply = await tb_trafficreceptionapply.findOne({
            where:{
                state:GLBConfig.ENABLE,
                trapply_id:doc.trapply_id
            }
        });

        /*判断车辆是否被占用*/
        if(transapply.trapply_vehicle_apply && transapply.trapply_start_time && transapply.trapply_end_time){
            let startDate = transapply.trapply_start_time ? moment(transapply.trapply_start_time).format("YYYY-MM-DD") : null;
            let endDate = transapply.trapply_end_time ? moment(transapply.trapply_end_time).format("YYYY-MM-DD") : null;
            let applyArr = await tb_trafficreceptionapply.findAll({
                where:{
                    state:GLBConfig.ENABLE,
                    domain_id:transapply.domain_id,
                    trapply_vehicle_apply:transapply.trapply_vehicle_apply,
                    trapply_state:['1','2']
                }
            })

            for (let a of applyArr){
                let temy = JSON.parse(JSON.stringify(a));
                if(temy.trapply_id !== doc.trapply_id){
                    let temyStartDate = temy.trapply_start_time ? moment(temy.trapply_start_time).format("YYYY-MM-DD") : null;
                    let temyEndDate = temy.trapply_end_time ? moment(temy.trapply_end_time).format("YYYY-MM-DD") : null;
                    if(moment(temyStartDate).isSame(startDate) || (moment(startDate).isAfter(temyStartDate) && moment(startDate).isBefore(temyEndDate)) || moment(temyEndDate).isSame(startDate)){
                        return common.sendError(res, 'trafficApply_02');
                    }
                    if(moment(temyStartDate).isSame(endDate) || (moment(endDate).isAfter(temyStartDate) && moment(endDate).isBefore(temyEndDate)) || moment(temyEndDate).isSame(endDate)){
                        return common.sendError(res, 'trafficApply_02');
                    }
                }
            }
        }

        let taskName = '出差、用车接待申请通知';
        let taskDescription ='  交通接待申请:' + doc.trapply_code;
        let groupId = common.getUUIDByTime(30);
        // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
        let taskResult = await task.createTask(user,taskName,22,'',doc.trapply_code,taskDescription,'',groupId);
        if(!taskResult){
            return common.sendError(res, 'task_02');
        }else{
            //更改申请状态
            if(transapply){
                transapply.trapply_state='1';
                await transapply.save()
            }
            //更改车辆状态
            if(doc.trapply_vehicle_apply){
                let vehicle = await tb_vehicle.findOne({
                    where: {
                        vehicle_id: doc.trapply_vehicle_apply,
                        state: GLBConfig.ENABLE
                    }
                });
                if(vehicle){
                    vehicle.vehicle_status_flag=1;
                    await vehicle.save();
                    common.sendData(res, {})

                }else {
                    common.sendData(res, {})

                }
            }else {
                common.sendData(res, {})

            }

        }
    }catch (error){
        common.sendFault(res, error);
    }
}


async function modifyTransApplyState(applyState,description,trapplyCode,applyApprover,applyDomain_id){
    let NowDoMainId = applyDomain_id;

    let applay = await tb_trafficreceptionapply.findOne({
        where:{
            trapply_code:trapplyCode
        }
    })

    if(applay){
        applay.trapply_state = applyState;
        applay.trapply_confirm_time = new Date();
        applay.trapply_confirm_id = applyApprover;
        applay.trapply_rejected_description = description;
        await applay.save();
        //如果驳回修改车辆状态更新类型
        if(applyState === GLBConfig.CHANGESTATE[3].value){
            await tb_vehicle.update({
                vehicle_status:GLBConfig.VEHICLESTATUS[0].value,
                vehicle_status_flag:GLBConfig.VEHICLESTATUSFLAG[0].value
            },{
                where:{
                    state:GLBConfig.ENABLE,
                    vehicle_id:applay.trapply_vehicle_apply,
                    vehicle_status_flag:GLBConfig.VEHICLESTATUSFLAG[1].value
                }
            })
        }
        //增加交通接待申请报销单
        if(applyState===GLBConfig.CHANGESTATE[2].value){
            AddTrExpense(trapplyCode);
        }
    }


}

//增加交通接待申请报销单
async function AddTrExpense(trapplyCode){
    let apply='' , applyArray=[];
    let queryStr = 'select a.*,b.customer_reimburserank_id,r.reimburserank_id,r.reimburserank_name,' +
        'r.reimburserank_reception_putup_level,r.reimburserank_trip_putup_level,r.reimburserank_downtown_traffic_level,' +
        'r.reimburserank_meal_level,r.reimburserank_reception_level,r.reimburserank_gas_level,r.reimburserank_traffic_available' +
        ' from tbl_erc_transreceptionapply a ' +
        'left join tbl_erc_customer b on b.user_id = a.trapply_creator_id ' +
        'left join tbl_erc_reimburserank r on r.reimburserank_id = b.customer_reimburserank_id ' +
        'where a.trapply_code = ? and a.state = ?';

    let replacements = [trapplyCode, GLBConfig.ENABLE];

    let result = await common.simpleSelect(sequelize, queryStr, replacements);

    for (let i of result){
        let temy = JSON.parse(JSON.stringify(i));
        temy.trapply_start_time = i.trapply_start_time ? moment(i.trapply_start_time).format("YYYY-MM-DD") : null;
        temy.trapply_end_time = i.trapply_end_time ? moment(i.trapply_end_time).format("YYYY-MM-DD") : null;
        applyArray.push(temy)
    }

    if(applyArray && applyArray.length>0){
        apply=applyArray[0];
        let expenseCode=await Sequence.genTransExpenseApplyID();
        let expense = await tb_trafficreceptionexpense.create({
            domain_id:apply.domain_id,
            tr_expense_code:expenseCode,
            tr_expense_creator_id:apply.trapply_creator_id,
            tr_expense_creator_name:apply.trapply_creator_name,
            tr_expense_state:GLBConfig.CHANGESTATE[0].value,
            tr_expense_pre_fee:apply.trapply_pre_fee,
            tr_expense_start_time:apply.trapply_start_time,
            tr_expense_end_time:apply.trapply_end_time,
            trapply_traffic_fee:apply.trapply_traffic_fee
        })

        if(expense){
            let applyData = await setReimData(apply);
            let TR_EXPENSE_TYPE=GLBConfig.TR_EXPENSE_TYPE;

            if(applyData){
                for(let type of TR_EXPENSE_TYPE){
                    for(let applyKey in applyData){
                        if(applyKey == type.value && applyData[applyKey]!=0  && applyData[applyKey]!==undefined  && applyData[applyKey]!==null){
                            let expenseDetail = await tb_trafficreceptionexpensedetail.create({
                                domain_id:applyData.domain_id,
                                tr_expense_list_code:expenseCode,
                                tr_detail_fee_id:type.id,
                                tr_detail_expected_fee:applyData[applyKey],
                                tr_detail_have_invoice_fee:applyData[applyKey]
                            })
                        }
                    }
                }
            }

            
        }
    }
}


exports.modifyTransApplyState = modifyTransApplyState;

async function getTrafficToolsAct(req, res) {

    let doc = req.body
    let returnData = {};
    let user = req.user;
    let traffictools = [];
    try{

        let customer = await tb_customer.findOne({
            where: {
                user_id: user.user_id
            }
        });
        if (customer == null) {
            return common.sendError(res, 'user_08');
        }
        if (customer.customer_reimburserank_id != undefined) {

            let reimburserank = await tb_reimburserank.findOne({
                where: {
                    reimburserank_id: customer.customer_reimburserank_id
                }
            });
            if (reimburserank.reimburserank_traffic_tools) {
                if (reimburserank.reimburserank_traffic_tools == 1 ) {
                    traffictools.push(
                        {
                            id: 1,
                            value: '1',
                            text: '飞机'
                        },
                        {
                            id: 2,
                            value: '2',
                            text: '高铁'
                        },
                        {
                            id: 3,
                            value: '3',
                            text: '火车'
                        },
                        {
                            id: 4,
                            value: '4',
                            text: '汽车'
                        })
                } else if (reimburserank.reimburserank_traffic_tools == 2 ) {
                    traffictools.push(
                        {
                            id: 2,
                            value: '2',
                            text: '高铁'
                        },
                        {
                            id: 3,
                            value: '3',
                            text: '火车'
                        },
                        {
                            id: 4,
                            value: '4',
                            text: '汽车'
                        })
                } else if (reimburserank.reimburserank_traffic_tools == 3 ) {
                    traffictools.push(
                        {
                            id: 3,
                            value: '3',
                            text: '火车'
                        },
                        {
                            id: 4,
                            value: '4',
                            text: '汽车'
                        })
                } else if (reimburserank.reimburserank_traffic_tools == 4 ) {
                    traffictools.push(
                        {
                            id: 4,
                            value: '4',
                            text: '汽车'
                        })
                } else {
                    traffictools.push(
                        {
                            id: 5,
                            value: '5',
                            text: '请选择报销职级'
                        })
                }
                returnData.tools=traffictools;
                common.sendData(res, returnData)
            } else {
                traffictools.push(
                    {
                        id: 5,
                        value: '5',
                        text: '请选择报销职级'
                    })
            }
            returnData.tools=traffictools;
            common.sendData(res, returnData)
        } else {
            return common.sendError(res, 'user_08');
        }
    } catch (error) {
        common.sendFault(res, error);
        return
    }

}