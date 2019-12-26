const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCMasterPlanControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');

const tb_domain = model.common_domain;
const tb_user = model.common_user;

const tb_orderproductplan = model.erc_orderproductplan;//装修订单计划详情，按工序
const tb_order = model.erc_order;
// 生产主计划接口
exports.ERCMasterPlanControlResource = (req, res) => {
    let method = req.query.method;
    if(method === 'dataExtract') {
        dataExtract(req, res);
    }else if (method==='getMainPaln'){
        getMainPaln(req,res)
    }else if (method==='modifyProcessDate'){
        modifyProcessDate(req,res)
    }else if (method==='init'){
        initAct(req,res)
    }else {
        common.sendError(res, 'common_01')
    }
};

// 获取数据源，非大客户订单，并且没有生成主计划的订单
async function personalOrder(params){
    let queryStr,result,resultdetail,replacements=[],
        actualBeginDate,processBeginDate,processEndDate;

    queryStr=`select * from tbl_erc_order 
        where state=1 and order_type not in (7,8) and actual_start_date is not null and processcreate_state=0`;
    result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});

    for(let r of result){
        if(r.actual_start_date){
            actualBeginDate=moment(r.actual_start_date).format("YYYY-MM-DD");
        }else {
            actualBeginDate=''
        }
        replacements=[];
        queryStr=`select p.*,o.order_id,o.domain_id from tbl_erc_produceprocess p,tbl_erc_order o 
            where p.state=1 and o.state=1 and p.produce_id=o.produce_id 
            and o.order_id=? order by p.process_level `;
        replacements.push(r.order_id);
        resultdetail = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});

        processBeginDate='',processEndDate='';
        for(let rd of resultdetail){
            let ppID =  await Sequence.genProductPlanID(rd.domain_id);
            if(actualBeginDate!=''){
                if(processBeginDate==''){
                    processBeginDate = moment(actualBeginDate).format('YYYY-MM-DD');
                    processEndDate = moment(actualBeginDate).add('days',rd.process_duration-1).format('YYYY-MM-DD');
                }else {
                    processBeginDate= moment(processEndDate).add('days',1).format('YYYY-MM-DD');
                    processEndDate= moment(processBeginDate).add('days',rd.process_duration-1).format('YYYY-MM-DD');
                }
            }
            await tb_orderproductplan.create({
                orderproductplan_id:ppID,//计划单号
                order_id: rd.order_id,//销售单ID
                produceprocess_id:rd.produceprocess_id,//工序ID
                process_duration: rd.process_duration,//工序时长
                process_begin_date:processBeginDate,//工序开始时间
                process_end_date:processEndDate,//工序结束时间
                plan_assign:'',//指定人
                // pp_date:params.yesterday,//本次运算的日期
                plan_state:0,
                description:''
            });
        }
        await tb_order.update({processcreate_state:1}, {where: {order_id:r.order_id}});
    }
}
// 生成主计划
async function dataExtract(req, res){
    let doc=common.docTrim(req.body);

    // let yesterday = moment().add('days',-1).format('YYYY-MM-DD');
    let yesterday = doc.mrp_date;
    let beginTime = yesterday +' 00:00:00';
    let endTime = yesterday +' 23:59:59';

    let params={
        yesterday:yesterday,
        beginTime:beginTime,
        endTime:endTime
    };
    //散客订单
    await personalOrder(params);
    common.sendData(res, {});
}
// 查询主计划列表
async function getMainPaln(req,res){
    let queryStr,replacements=[],returnData={};
    let doc=common.docTrim(req.body);
    let user = req.user
    queryStr=`select op.orderproductplan_id,pp.process_name,'场地' as construction_site,
        op.process_begin_date,op.process_end_date,op.order_id,m.materiel_name,op.plan_state,op.description,u.name   
        from tbl_erc_orderproductplan op 
        left join tbl_erc_produceprocess pp on (op.produceprocess_id=pp.produceprocess_id and pp.state=1)
        left join tbl_erc_order o on (op.order_id=o.order_id and o.state=1) 
        left join tbl_erc_produce p on (o.produce_id=p.produce_id and p.state=1) 
        left join tbl_erc_materiel m on (p.materiel_id=m.materiel_id and m.state=1) 
        left join tbl_common_user u on (op.plan_assign=u.user_id and u.state=1) 
        where op.state=1 and o.order_state not in ('FINISHI','CANCELLED') and o.domain_id=? ` ;
    replacements.push(user.domain_id);
    if(doc.orderproductplan_id){
        queryStr+=' and op.orderproductplan_id like ?';
        replacements.push('%' + doc.orderproductplan_id + '%');
    }
    if(doc.order_id){
        queryStr+=' and o.order_id like ?';
        replacements.push('%' + doc.order_id + '%');
    }
    if(doc.process_begin_date){
        queryStr+=' and op.process_begin_date>=?';
        replacements.push(doc.process_begin_date);
    }
    if(doc.process_end_date){
        queryStr+=' and op.process_end_date<=?';
        replacements.push(doc.process_end_date);
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
// 修改主计划的开工与结束时间
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
        processBeginDate = moment(processEndDate).subtract('days',ol.process_duration-1).format('YYYY-MM-DD');
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
        processEndDate = moment(processBeginDate).add('days',om.process_duration-1).format('YYYY-MM-DD');
        diffDate = moment(processEndDate).diff(moment(processBeginDate), 'days');
        om.process_end_date = processEndDate;
        om.process_begin_date = processBeginDate;
        om.process_duration = diffDate;
        om.save()
    }
    common.sendData(res, orderproductplan);
}
// 初始化基础数据
async function initAct(req, res) {
    let returnData = {};
    await FDomain.getDomainListInit(req, returnData);
    returnData.planState = GLBConfig.PLANSTATE;//计划单状态
    returnData.user = [];
    let user=req.user;
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