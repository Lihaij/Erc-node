
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCDevelopDetailControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const task = require('../baseconfig/ERCTaskListControlSRV');
const moment = require('moment');
const sequelize = model.sequelize;
const XLSX = require('xlsx-style');

const tb_developsubscribe = model.erc_developsubscribe;//材料申购
const tb_developconsume = model.erc_developconsume;//材料消耗单
const tb_developconsumedetail = model.erc_developconsumedetail;//材料消耗单明细
const tb_developreceive = model.erc_developreceive;//材料收料
const tb_developreceivedetail = model.erc_developreceivedetail;//收料单明细

const tb_developbudget = model.erc_developbudget;//预算
const tb_developcost = model.erc_developcost;//费用
const tb_supplier = model.erc_supplier;
const tb_develop = model.erc_develop;
const tb_task = model.erc_task;
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;

const tb_developsubscribeorder = model.erc_developsubscribeorder;
const tb_developsubscribeorderdetail = model.erc_developsubscribeorderdetail;
const tb_developsubscribeorderdetailend = model.erc_developsubscribeorderdetailend;

const tb_developpurchaseorder = model.erc_developpurchaseorder;
const tb_developpurchaseorderdetail = model.erc_developpurchaseorderdetail;
const tb_developsubcribeorderdetailend = model.erc_developsubscribeorderdetailend;

// 研发详情接口，包括构建预算，材料申购，采购，收料，人工结算，耗用，费用，验收8个子模块
exports.ERCDevelopDetailControlResource = (req, res) => {
    let method = req.query.method;
    if (method==='init'){
        initAct(req,res)
    } else if (method==='getDevelop'){
        getDevelopInfo(req,res)
    } else if (method === 'searchBudget'){
        searchBudget(req,res)
    } else if (method === 'deleteBudget'){
        deleteBudget(req,res)
    } else if (method==='addBudget'){
        addBudget(req,res)
    } else if (method==='modifyBudget'){
        modifyBudget(req,res)
    } else if (method==='sendBudgetTask'){
        sendBudgetTask(req,res)
    } else if (method==='countTotalMoney'){
        countTotalMoney(req,res)
    } else if (method==='sendSubscribeTask'){
        sendSubscribeTask(req,res)
    } else if (method==='addReceive'){
        addReceive(req,res)
    } else if (method==='checkReceiveDoneNumber'){
        checkReceiveDoneNumber(req,res)
    } else if (method==='sendConumeTask'){
        sendConumeTask(req,res)
    } else if (method==='modifySubscribeConsume'){
        modifySubscribeConsume(req,res)
    } else if (method==='checkConsumeDoneNumber'){
        checkConsumeDoneNumber(req,res)
    } else if (method==='searchCost'){
        searchCost(req,res)
    } else if (method==='deleteCost'){
        deleteCost(req,res)
    } else if (method==='addCost'){
        addCost(req,res)
    } else if (method==='modifyCost'){
        modifyCost(req,res)
    } else if (method==='sendCostTask'){
        sendCostTask(req,res)
    } else if (method==='sendClearingTask'){
        sendClearingTask(req,res)
    } else if (method==='modifyBudgetClearing'){
        modifyBudgetClearing(req,res)
    } else if (method==='searchCheck'){
        searchCheck(req,res)
    } else if (method==='sendCheckTask'){
        sendCheckTask(req,res)
    } else if (method==='getSumBudgetMoney'){
        getSumBudgetMoney(req,res)
    } else if (method==='getSumCostMoney'){
        getSumCostMoney(req,res)
    } else if (method==='searchSubcribeOrderDetailEnd'){
        searchSubcribeOrderDetailEnd(req,res)
    } else if (method==='savePurchaseInfo'){
        savePurchaseInfo(req,res)
    } else if (method==='searchSubscribe'){
        searchSubscribe(req,res)
    } else if (method==='checkPurchaseDoneNumber'){
        checkPurchaseDoneNumber(req,res)
    } else if (method==='upload'){
        upload(req,res)
    } else if (method==='importData'){
        importData(req,res)
    } else {
        common.sendError(res, 'common_01')
    }
};

// 初始化基础数据
async function initAct(req,res){
    try{
        let doc = common.docTrim(req.body), user = req.user,returnData={},replacements=[];

        returnData.developBudgetState = GLBConfig.DEVELOPBUDGETSTATE;
        returnData.developSubscribeState = GLBConfig.DEVELOPSUBSCRIBESTATE;
        returnData.developReceiveState = GLBConfig.DEVELOPRECEIVESTATE;
        returnData.developConsumeState = GLBConfig.DEVELOPCONSUMESTATE;
        returnData.developCostState = GLBConfig.DEVELOPCOSTSTATE;
        returnData.developClearingState = GLBConfig.DEVELOPCLEARINGSTATE;
        returnData.developCheckState = GLBConfig.DEVELOPCHECKSTATE;

        returnData.supplierInfo=[];
        returnData.developInfo=[];
        let supplier = await tb_supplier.findAll({
            where:{
                domain_id:user.domain_id,
                state:GLBConfig.ENABLE
            }
        });

        for(let s of supplier){
            returnData.supplierInfo.push({
                id:s.supplier_id,
                text:s.supplier_name,
                value:s.supplier_name
            })
        }
        common.sendData(res, returnData);
    }catch (error){
        common.sendFault(res, error);
    }
}
// 查询研发项目详细信息
async function getDevelopInfo(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = [],replacements=[];

        let queryStr = `select a.*,d.department_name,
            u2.username as creator_name,u3.username as acceptor_name   
            from tbl_erc_develop a 
            left join tbl_erc_department d on (a.develop_departmant_id = d.department_id and d.state = 1) 
            left join tbl_common_user u2 on (a.develop_creator = u2.user_id and u2.state=1)
            left join tbl_common_user u3 on (a.develop_acceptor = u3.user_id and u3.state=1)
            where a.domain_id = ? and a.state = 1 and a.develop_id = ?`;
        replacements.push(user.domain_id);
        replacements.push(doc.develop_id);
        let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        for (let ap of result) {
            let d = JSON.parse(JSON.stringify(ap));
            d.created_at = ap.created_at ? moment(ap.created_at).format("YYYY-MM-DD") : null;
            d.updated_at = ap.updated_at ? moment(ap.updated_at).format("YYYY-MM-DD") : null;
            d.develop_examine_time = ap.develop_examine_time ? moment(ap.develop_examine_time).format("YYYY-MM-DD") : null;

            returnData.push(d)
        }
        common.sendData(res, returnData);

    } catch (error) {
        common.sendFault(res, error);
    }
}
//----------------------------材料申购----------------------------

/*async function deleteSubscribe(req,res){
    try {
        let doc = common.docTrim(req.body);
        let developsubscribe = await tb_developsubscribe.findOne({
            where: {
                developsubscribe_id: doc.developsubscribe_id
            }
        });
        if (developsubscribe) {
            developsubscribe.state = GLBConfig.DISABLE;
            await developsubscribe.save();
        } else {
            common.sendError(res, 'developsubscribe_01');
            return
        }
        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}*/
/*async function addSubscribe(req,res){
    try {
        let doc = common.docTrim(req.body);
        let developsubscribe = await tb_developsubscribe.create({
            develop_id: doc.develop_id,
            subscribe_name: doc.subscribe_name,
            subscribe_format: doc.subscribe_format,
            subscribe_unit:doc.subscribe_unit,
            subscribe_number: doc.subscribe_number,
            receive_done_number: 0,
            consume_done_number: 0,
            subscribe_remark: doc.subscribe_remark,
            subscribe_state:0,
            receive_state:0,
            consume_state:0
        });
        common.sendData(res, developsubscribe);
    } catch (error) {
        common.sendFault(res, error);
    }
}*/
/*async function modifySubscribe(req,res){
    try {
        let doc = common.docTrim(req.body);

        let developsubscribe = await tb_developsubscribe.findOne({
            where: {
                developsubscribe_id: doc.old.developsubscribe_id
            }
        });

        if (developsubscribe) {
            developsubscribe.subscribe_name = doc.new.subscribe_name;
            developsubscribe.subscribe_format = doc.new.subscribe_format;
            developsubscribe.subscribe_unit = doc.new.subscribe_unit;
            developsubscribe.subscribe_number = doc.new.subscribe_number;
            developsubscribe.subscribe_remark = doc.new.subscribe_remark;
            await developsubscribe.save();
            common.sendData(res, developsubscribe);
        } else {
            common.sendError(res, 'developsubscribe_01')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}*/
// 发送申购任务
async function sendSubscribeTask(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user;

        //发送任务
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
            //创建申购单
            let developsubscribeorder = await tb_developsubscribeorder.create({
                develop_id: doc.develop_id,
                domain_id: user.domain_id,
                subscribeorder_code:await Sequence.genDevelopSucribeOrderID(user),
                developbudget_id:doc.developbudget_id,
                subscribeorder_creator:user.user_id,
                subscribeorder_state: 1
            });
            //创建申购单明细
            for(var s of doc.subscribeArr){
                let developsubscribeorderdetail = await tb_developsubscribeorderdetail.create({
                    developsubscribeorder_id: developsubscribeorder.developsubscribeorder_id,
                    subscribeorderdetail_name: s.subscribeorderdetail_name,
                    subscribeorderdetail_format: s.subscribeorderdetail_format,
                    subscribeorderdetail_unit: s.subscribeorderdetail_unit,
                    subscribeorderdetail_number: s.subscribeorderdetail_number,
                    subscribeorderdetail_remark: s.subscribeorderdetail_remark,
                });
            }

            let taskName = '研发项目材料申购审核任务';
            let taskDescription ='研发项目材料申购审核任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user,taskName,52,taskallotuser.user_id,developsubscribeorder.developsubscribeorder_id,taskDescription,'',groupId);
            if(!taskResult){
                return common.sendError(res, 'task_01');
            }else {
                common.sendData(res,taskResult);
            }
        }


    }catch (error){
        common.sendFault(res, error);
    }
}
// 修改申购状态
async function modifySubscribeState(applyState,description,developsubscribeorder_id,applyApprover){
    try{
        if(applyState==2){//通过insert tbl_erc_developsubscribe

            let developsubcribeorder = await tb_developsubscribeorder.findAll({
                where:{
                    state:GLBConfig.ENABLE,
                    developsubscribeorder_id:developsubscribeorder_id
                }
            });
            let developsubcribeorderdetail = await tb_developsubscribeorderdetail.findAll({
                where:{
                    state:GLBConfig.ENABLE,
                    developsubscribeorder_id:developsubscribeorder_id
                }
            });
            for(d of developsubcribeorderdetail){
                let developsubcribeorderdetailend = await tb_developsubcribeorderdetailend.create({
                    develop_id:developsubcribeorder[0].develop_id,
                    subscribeorderdetailend_name:d.subscribeorderdetail_name,
                    subscribeorderdetailend_format:d.subscribeorderdetail_format,
                    subscribeorderdetailend_unit:d.subscribeorderdetail_unit,
                    subscribeorderdetailend_number:d.subscribeorderdetail_number,
                    purchase_done_number:0,
                    purchase_price:0
                });
            }
        }

        await tb_developsubscribeorder.update({
            subscribeorder_state:applyState,
            subscribeorder_examine_time:new Date(),
            subscribeorder_examine:applyApprover,
            subscribeorder_refuse_remark:description
        }, {
            where: {
                developsubscribeorder_id:developsubscribeorder_id
            }
        });

    }catch (error){
        throw error
    }
}
//----------------------------材料采购----------------------------
async function searchSubcribeOrderDetailEnd(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
        let queryStr = `select *,0 as purchaseorderdetail_price,0 as purchaseorderdetail_number from tbl_erc_developsubscribeorderdetailend 
where state=1 and develop_id = ?`;
        replacements.push(doc.develop_id);
        if (doc.search_text) {
            queryStr += ` and subscribeorderdetailend_name like ?  `;
            let search_text = `%${doc.search_text}%`;
            replacements.push(search_text);
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let ap of result.data) {
            let d = JSON.parse(JSON.stringify(ap));
            d.created_at = ap.created_at ? moment(ap.created_at).format("YYYY-MM-DD") : null;
            d.updated_at = ap.updated_at ? moment(ap.updated_at).format("YYYY-MM-DD") : null;
            returnData.rows.push(d)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 保存采购信息
async function savePurchaseInfo(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user,replacements=[],consume_price=0;
        //采购单
        let developpurchaseorder = await tb_developpurchaseorder.create({
            develop_id:doc.develop_id,
            domain_id:user.domain_id,
            purchaseorder_code:await Sequence.genDevelopPurchaseeOrderID(user),
            purchaseorder_creator:user.user_id,
            supplier_id:doc.supplier_id
        });

        //subcribe,采购单明细
        for(let p of doc.purchaseArr){
            let developpurchaseorderdetail = await tb_developpurchaseorderdetail.create({
                developpurchaseorder_id:developpurchaseorder.developpurchaseorder_id,
                purchaseorderdetail_name:p.subscribeorderdetailend_name,
                purchaseorderdetail_format:p.subscribeorderdetailend_format,
                purchaseorderdetail_unit:p.subscribeorderdetailend_unit,
                purchaseorderdetail_number:p.purchaseorderdetail_number,
                purchaseorderdetail_price:p.purchaseorderdetail_price,
                purchaseorderdetail_remark:p.purchaseorderdetail_remark
            });
            let developsubscribe = await tb_developsubscribe.create({
                develop_id: doc.develop_id,
                subscribe_name: p.subscribeorderdetailend_name,
                subscribe_format: p.subscribeorderdetailend_format,
                subscribe_unit:p.subscribeorderdetailend_unit,
                subscribe_number: p.purchaseorderdetail_number,
                subscribe_price: p.purchaseorderdetail_price,
                supplier_id: doc.supplier_id,
                receive_done_number: 0,
                consume_done_number: 0,
                subscribe_remark: p.purchaseorderdetail_remark,
                subscribe_state:0,
                receive_state:0,
                consume_state:0
            });

            let developsubcribeorderdetailend = await tb_developsubcribeorderdetailend.findOne({
                where:{
                    developsubscribeorderdetailend_id:p.developsubscribeorderdetailend_id
                }
            });
            developsubcribeorderdetailend.purchase_done_number = (developsubcribeorderdetailend.purchase_done_number - 0) + (p.purchaseorderdetail_number - 0);
            developsubcribeorderdetailend.save()


        }
        common.sendData(res, developpurchaseorder);
    } catch (error) {
        throw error
    }
}
// 查询已采购数量
async function checkPurchaseDoneNumber(req,res){
    let doc = common.docTrim(req.body);
    let developsubcribeorderdetailend = await tb_developsubcribeorderdetailend.findOne({
        where:{
            developsubscribeorderdetailend_id : doc.developsubscribeorderdetailend_id
        }
    });
    if(developsubcribeorderdetailend.subscribeorderdetailend_number - developsubcribeorderdetailend.purchase_done_number < doc.purchaseorderdetail_number){
        common.sendError(res, 'developsubscribepurchase_01')
    }else{
        common.sendData(res, {});
    }
}
//----------------------------材料收料----------------------------
// 查询申购单信息
async function searchSubscribe(req,res){
        try {
            let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
            let queryStr = `select s.*,p.supplier_name,subscribe_number*subscribe_price as subscribe_money,
            receive_done_number - consume_done_number as residue_done_number,
            consume_now_number*consume_now_price as consume_now_money
            from tbl_erc_developsubscribe s 
            left join tbl_erc_supplier p on (s.supplier_id = p.supplier_id and p.state = 1)
            where s.state=1 and s.develop_id=?`;
            replacements.push(doc.develop_id);
            if(doc.subscribe_state){
                queryStr+=' and subscribe_state=?';
                replacements.push(doc.subscribe_state);
            }
            if (doc.search_text) {
                queryStr += ` and subscribe_name like ?  `;
                let search_text = `%${doc.search_text}%`;
                replacements.push(search_text);
            }
            if(doc.tableIndex == 5){
                queryStr += ' and s.receive_done_number<>0'
            }
            let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
            returnData.total = result.count
            returnData.rows = []
            for (let ap of result.data) {
                let d = JSON.parse(JSON.stringify(ap));
                d.created_at = ap.created_at ? moment(ap.created_at).format("YYYY-MM-DD") : null;
                d.updated_at = ap.updated_at ? moment(ap.updated_at).format("YYYY-MM-DD") : null;
                d.consume_now_money = d.consume_now_money?d.consume_now_money:0;
                d.consume_now_money = d.consume_now_money.toFixed(2);
                d.subscribe_money = d.subscribe_money.toFixed(2);
                d.receivesupplier_name = '';
                d.receive_now_number = 0;
                d.receive_now_price = 0;
                d.receive_now_money = 0;
                returnData.rows.push(d)
            }
            common.sendData(res, returnData);
        } catch (error) {
            common.sendFault(res, error);
        }
    }
// 检查已收料数量
async function checkReceiveDoneNumber(req,res){
    let doc = common.docTrim(req.body);
    let developsubscribe = await tb_developsubscribe.findOne({
        where:{
            developsubscribe_id : doc.developsubscribe_id
        }
    });
    if(developsubscribe.subscribe_number - developsubscribe.receive_done_number < doc.receive_now_number){
        common.sendError(res, 'developsubscribe_02')
    }else{
        common.sendData(res, {});
    }
}
// 增加收料单
async function addReceive(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user,replacements=[],consume_price=0;

        //收料单
        let receive_code = await Sequence.genReceiveID();
        let developreceive = await tb_developreceive.create({
            develop_id:doc.develop_id,
            receive_code:receive_code,
            receive_creator:user.user_id
        });

        for(let s of doc.receiveDetailItem){
            //收料单明细
            let developreceivedetail = await tb_developreceivedetail.create({
                developreceive_id: developreceive.developreceive_id,//收料单ID
                developsubscribe_id:s.developsubscribe_id,//申购单物料 ID
                receivesupplier_name: s.supplier_name,//供货商ID
                receivedetail_number:s.receive_now_number,//本次收料数量
                receivedetail_price: s.subscribe_price//本次收料单价
            });


            let developsubscribe = await tb_developsubscribe.findOne({
                where:{
                    develop_id:doc.develop_id,
                    developsubscribe_id:s.developsubscribe_id
                }
            });
            developsubscribe.receive_done_number = (developsubscribe.receive_done_number - 0) + (s.receive_now_number - 0);
            developsubscribe.save()
        }

        common.sendData(res, developreceive);
    } catch (error) {
        throw error
    }
}

//----------------------------材料耗用----------------------------
// 检查已耗用数量
async function checkConsumeDoneNumber(req,res){
    let doc = common.docTrim(req.body);
    let developsubscribe = await tb_developsubscribe.findOne({
        where:{
            developsubscribe_id : doc.developsubscribe_id
        }
    });
    if(developsubscribe.receive_done_number - developsubscribe.consume_done_number  < doc.consume_now_number){
        common.sendError(res, 'developsubscribe_03')
    }else{
        common.sendData(res, {});
    }
}
// 修改申购单的已耗用数量(临时)
async function modifySubscribeConsume(req,res){
    try {
        let doc = common.docTrim(req.body),user = req.user,consume_price=0,replacements=[];

        let developsubscribe = await tb_developsubscribe.findOne({
            where: {
                developsubscribe_id: doc.old.developsubscribe_id
            }
        });
        //计算物料耗用单单价=项目内所有收料单的本物料总金额/总收料数量
        let queryStr = `select sum(receivedetail_number * receivedetail_price) / sum(receivedetail_number) as consume_price 
                    from tbl_erc_developreceivedetail d,tbl_erc_developreceive r 
                    where d.state=1 and r.state=1 and d.developreceive_id = r.developreceive_id and r.develop_id = ? and d.developsubscribe_id = ?`;
        replacements.push(developsubscribe.develop_id);
        replacements.push(developsubscribe.developsubscribe_id);
        let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        if(result && result.length>0){
            consume_price = result[0].consume_price?result[0].consume_price:0;
            consume_price = consume_price.toFixed(2)
        }

        if (developsubscribe) {
            developsubscribe.consume_now_number = doc.new.consume_now_number;
            developsubscribe.consume_now_price = consume_price;
            developsubscribe.consume_creator = user.user_id;
            await developsubscribe.save();
            developsubscribe.dataValues.consume_now_money = developsubscribe.consume_now_number * developsubscribe.consume_now_price;

            common.sendData(res, developsubscribe);
        } else {
            common.sendError(res, 'developsubscribe_01')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}
// 发送耗用审核任务
async function sendConumeTask(req,res) {
    try {
    let doc = common.docTrim(req.body), user = req.user;
    //校验是否分配任务处理人员
    let taskallot = await tb_taskallot.findOne({
        where: {
            state: GLBConfig.ENABLE,
            taskallot_name: '研发材料耗用审核任务'
        }
    });
    let taskallotuser = await tb_taskallotuser.findOne({
        where: {
            state: GLBConfig.ENABLE,
            domain_id: user.domain_id,
            taskallot_id: taskallot.taskallot_id
        }
    });

    if (!taskallotuser) {
        return common.sendError(res, 'develop_37');
    } else {
        let taskName = '研发项目材料耗用审核任务';
        let taskDescription = doc.develop_name + '  研发项目材料耗用审核任务';
        let groupId = common.getUUIDByTime(30);
        let taskResult = await task.createTask(user, taskName, 55, taskallotuser.user_id, doc.develop_id, taskDescription, '', groupId);
        if (!taskResult) {
            return common.sendError(res, 'task_01');
        } else {

            await tb_developsubscribe.update({
                consume_state: 1,
            }, {
                where: {
                    develop_id: doc.develop_id
                }
            });

            common.sendData(res, taskResult);
        }
    }
}
catch (error){
        common.sendFault(res, error);
    }
}
// 修改耗用单状态
async function modifyConsumeState(applyState,description,develop_id,applyApprover){
    try {
        let consume_creator = '',replacements=[],consume_price=0;
        if(applyState==2){
            let developsubcribe = await tb_developsubscribe.findAll({
                where :{
                    state:GLBConfig.ENABLE,
                    develop_id:develop_id
                }
            });
            if(developsubcribe){
                consume_creator = developsubcribe[0].consume_creator
            }else{
                return common.sendError(res, 'developsubscribe_01');
            }
            //耗用单
            let developconsume = await tb_developconsume.create({
                develop_id:develop_id,
                consume_code:await Sequence.genConsumeID(),
                consume_creator:consume_creator,
                consume_examine_time:new Date(),
                consume_examine:applyApprover,
                consume_refuse_remark:description
            });

            for(let s of developsubcribe){
                if(s.consume_now_number>0){
                    //耗用单明细
                    let developconsumedetail = await tb_developconsumedetail.create({
                        developconsume_id: developconsume.developconsume_id,//耗用单ID
                        developsubscribe_id:s.developsubscribe_id,//申购单物料ID
                        consumedetail_number:s.consume_now_number,//本次耗用数量
                        consumedetail_price: s.consume_now_price//本次耗用单价
                    });
                }
                //更新申请单
                s.consume_done_number = s.consume_done_number + s.consume_now_number;
                s.consume_now_number = 0;
                s.consume_now_price = 0;
                s.consume_state = 0;
                await s.save()
            }

        }else{
            await tb_developsubscribe.update({
                consume_state:applyState,
                consume_examine_time:new Date(),
                consume_examine:applyApprover,
                consume_refuse_remark:description
            }, {
                where: {
                    develop_id:develop_id
                }
            });
        }
    } catch (error) {
        throw error
    }
}

//----------------------------构建预算----------------------------
// 查询预算金额
async function getSumBudgetMoney(req,res){
    let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
    let queryStr = `select sum(clearing_reality_money) as total_clearing_reality_money , 
        sum(budget_number * budget_manual_price + budget_number * budget_materiel_price) as total_budget_money
        from tbl_erc_developbudget where state=1 and develop_id=?`;
    replacements.push(doc.develop_id);
    if(doc.budget_state){
        queryStr+=' and budget_state=?';
        replacements.push(doc.budget_state);
    }
    if (doc.search_text) {
        queryStr += ` and budget_work_name like ?  `;
        let search_text = `%${doc.search_text}%`;
        replacements.push(search_text);
    }

    let result = await sequelize.query(queryStr, {
        replacements: replacements,
        type: sequelize.QueryTypes.SELECT
    });

    if(result && result.length>0){
        returnData.total_clearing_reality_money = result[0].total_clearing_reality_money?result[0].total_clearing_reality_money:0
        returnData.total_budget_money = result[0].total_budget_money?result[0].total_budget_money:0
    }
    common.sendData(res, returnData);
}
// 查询预算列表
async function searchBudget(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];

        let queryStr = `select * , 
            budget_number * budget_manual_price as budget_manual_money,
            budget_number * budget_materiel_price as budget_materiel_money,
            budget_number * budget_manual_price + budget_number * budget_materiel_price as budget_total_money
            from tbl_erc_developbudget where state=1 and develop_id=?`;
        replacements.push(doc.develop_id);
        if(doc.budget_state){
            queryStr+=' and budget_state=?';
            replacements.push(doc.budget_state);
        }
        if (doc.search_text) {
            queryStr += ` and budget_work_name like ?  `;
            let search_text = `%${doc.search_text}%`;
            replacements.push(search_text);
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let ap of result.data) {
            let d = JSON.parse(JSON.stringify(ap));
            d.created_at = ap.created_at ? moment(ap.created_at).format("YYYY-MM-DD") : null;
            d.updated_at = ap.updated_at ? moment(ap.updated_at).format("YYYY-MM-DD") : null;
            returnData.rows.push(d)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 删除预算
async function deleteBudget(req,res){
    try {
        let doc = common.docTrim(req.body);
        let developbudget = await tb_developbudget.findOne({
            where: {
                developbudget_id: doc.developbudget_id
            }
        });
        if (developbudget) {
            developbudget.state = GLBConfig.DISABLE;
            await developbudget.save();
        } else {
            common.sendError(res, 'developbudget_01');
            return
        }
        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error)
    }
}
// 增加预算
async function addBudget(req,res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let developbudget = await tb_developbudget.create({
            develop_id: doc.develop_id,
            budget_work_name: doc.budget_work_name,
            budget_measurement: doc.budget_measurement,
            budget_number:doc.budget_number,
            budget_manual_price: Number(doc.budget_manual_price).toFixed(2),
            budget_materiel_price: Number(doc.budget_materiel_price).toFixed(2),
            budget_state:0,
            clearing_state:0,
            clearing_last_finishlimit:0,
            clearing_last_reality_money:0
        });
        common.sendData(res, developbudget);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 修改预算
async function modifyBudget(req,res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let developbudget = await tb_developbudget.findOne({
            where: {
                developbudget_id: doc.old.developbudget_id
            }
        });

        if (developbudget) {
            developbudget.budget_work_name = doc.new.budget_work_name;
            developbudget.budget_measurement = doc.new.budget_measurement;
            developbudget.budget_number = doc.new.budget_number;
            developbudget.budget_manual_price = Number(doc.new.budget_manual_price).toFixed(2);
            developbudget.budget_materiel_price = Number(doc.new.budget_materiel_price).toFixed(2);
            await developbudget.save();
            developbudget.dataValues.budget_manual_money = developbudget.budget_number * developbudget.budget_manual_price;
            developbudget.dataValues.budget_materiel_money = developbudget.budget_number * developbudget.budget_materiel_price;
            developbudget.dataValues.budget_total_money = Number(developbudget.budget_number * developbudget.budget_manual_price + developbudget.budget_number * developbudget.budget_materiel_price).toFixed(2);

            common.sendData(res, developbudget);
        } else {
            common.sendError(res, 'developbudget_01')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}
// 发送预算任务
async function sendBudgetTask(req,res){
    try{
        let doc = common.docTrim(req.body), user = req.user;
        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'研发构建预算审核任务'
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
            return common.sendError(res, 'develop_33');
        }else{
            let taskName = '研发项目构建预算审核任务';
            let taskDescription = doc.develop_name + '  研发项目构建预算审核任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user,taskName,51,taskallotuser.user_id,doc.develop_id,taskDescription,'',groupId);
            if(!taskResult){
                return common.sendError(res, 'task_01');
            }else {
                await tb_developbudget.update({
                    budget_state:1
                }, {
                    where: {
                        develop_id:doc.develop_id
                    }
                });
                common.sendData(res,taskResult);
            }
        }
    }catch (error){
        common.sendFault(res, error);
    }
}
// 修改预算状态
async function modifyBudgetState(applyState,description,develop_id,applyApprover){
    try{
        let replacements = [];
        if(applyState==2){

            let queryStr=`select sum(budget_number*budget_manual_price+budget_number*budget_materiel_price) as develop_budget 
                from tbl_erc_developbudget where state=1 and develop_id = ?`;
            replacements.push(develop_id);
            let result = await sequelize.query(queryStr, {
                replacements: replacements,
                type: sequelize.QueryTypes.SELECT
            })
            if(result && result.length>0)
            await tb_develop.update({
                develop_budget:result[0].develop_budget,
            }, {
                where: {
                    develop_id:develop_id
                }
            });
        }
        await tb_developbudget.update({
            budget_state:applyState,
            budget_examine_time:new Date(),
            budget_examine:applyApprover,
            budget_refuse_remark:description
        }, {
            where: {
                develop_id:develop_id
            }
        });
    }catch (error){
        throw error
    }
}
//----------------------------人工结算----------------------------
// 修改结算金额
async function modifyBudgetClearing(req,res){
    try {
        let doc = common.docTrim(req.body),user = req.user;

        let developbudget = await tb_developbudget.findOne({
            where: {
                developbudget_id: doc.old.developbudget_id
            }
        });

        if (developbudget) {
            developbudget.clearing_now_finishlimit = doc.new.clearing_now_finishlimit;
            developbudget.clearing_estimate_money = doc.new.clearing_estimate_money;
            // if(developbudget.clearing_reality_money==0){
            //     developbudget.clearing_reality_money = developbudget.budget_number * developbudget.budget_manual_price * (doc.new.clearing_now_finishlimit/100).toFixed(2);
            // }else{
                developbudget.clearing_reality_money = doc.new.clearing_reality_money;
            // }
            await developbudget.save();
            common.sendData(res, developbudget);
        } else {
            common.sendError(res, 'developbudget_01')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}
// 发送结算任务
async function sendClearingTask(req,res){
    try {
    let doc = common.docTrim(req.body), user = req.user;
    //校验是否分配任务处理人员
    let taskallot = await tb_taskallot.findOne({
        where:{
            state:GLBConfig.ENABLE,
            taskallot_name:'研发人工结算审核任务'
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
        return common.sendError(res, 'develop_36');
    }else{
        let taskName = '研发项目人工结算审核任务';
        let taskDescription = doc.develop_name + '  研发项目人工结算审核任务';
        let groupId = common.getUUIDByTime(30);
        let taskResult = await task.createTask(user,taskName,54,taskallotuser.user_id,doc.develop_id,taskDescription,'',groupId);
        if(!taskResult){
            return common.sendError(res, 'task_01');
        }else {

            await tb_developbudget.update({
                clearing_state:1
            }, {
                where: {
                    develop_id:doc.develop_id
                }
            });

            common.sendData(res,taskResult);
        }
    }
}catch (error){
    common.sendFault(res, error);
}
}
// 修改结算状态
async function modifyClearingState(applyState,description,develop_id,applyApprover){
    try {
        if(applyState==2){
            let developbudget = await tb_developbudget.findAll({
                where:{
                    state:GLBConfig.ENABLE,
                    develop_id:develop_id
                }
            });

            for(let b of developbudget){
                if(b.clearing_now_finishlimit !== 0){
                    b.clearing_last_finishlimit = b.clearing_now_finishlimit;
                }
                b.clearing_last_reality_money = b.clearing_reality_money;
                b.clearing_now_finishlimit = 0;
                b.clearing_estimate_money = 0;
                b.clearing_reality_money = 0;
                b.save();
            }

            await tb_developbudget.update({
                clearing_state:0,
                clearing_examine:applyApprover,
                clearing_examine_time:new Date(),
                clearing_refuse_remark:description
            }, {
                where: {
                    state:GLBConfig.ENABLE,
                    develop_id:develop_id
                }
            });

        }else {
            await tb_developbudget.update({
                clearing_state:applyState,
                clearing_examine:applyApprover,
                clearing_examine_time:new Date(),
                clearing_refuse_remark:description
            }, {
                where: {
                    state:GLBConfig.ENABLE,
                    develop_id:develop_id
                }
            });
        }


    } catch (error) {
        throw error
    }
}
//----------------------------构建费用----------------------------
// 查询费用金额
async function getSumCostMoney(req,res){
    let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
    let queryStr = `select sum(developcost_invoice_money + developcost_noinvoice_money) as total_cost_money 
        from tbl_erc_developcost where state=1 and develop_id=?`;
    replacements.push(doc.develop_id);
    if (doc.search_text) {
        queryStr += ` and developcost_name like ?  `;
        let search_text = `%${doc.search_text}%`;
        replacements.push(search_text);
    }

    let result = await sequelize.query(queryStr, {
        replacements: replacements,
        type: sequelize.QueryTypes.SELECT
    });

    if(result && result.length>0){
        returnData.total_cost_money = result[0].total_cost_money?result[0].total_cost_money:0;
    }
    common.sendData(res, returnData);
}
// 查询费用列表
async function searchCost(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];

        let queryStr = `select * from tbl_erc_developcost where state=1 and develop_id=?`;
        replacements.push(doc.develop_id);
        if (doc.search_text) {
            queryStr += ` and developcost_name like ?  `;
            let search_text = `%${doc.search_text}%`;
            replacements.push(search_text);
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count
        returnData.rows = []
        returnData.total_developcost_money = 0
        for (let ap of result.data) {
            let d = JSON.parse(JSON.stringify(ap))
            d.created_at = ap.created_at ? moment(ap.created_at).format("YYYY-MM-DD") : null;
            d.updated_at = ap.updated_at ? moment(ap.updated_at).format("YYYY-MM-DD") : null;
            returnData.total_developcost_money += d.developcost_money-0;
            returnData.rows.push(d)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 删除费用
async function deleteCost(req,res){
    try {
        let doc = common.docTrim(req.body);
        let developcost = await tb_developcost.findOne({
            where: {
                developcost_id: doc.developcost_id
            }
        });
        if (developcost) {
            developcost.state = GLBConfig.DISABLE;
            await developcost.save();
        } else {
            common.sendError(res, 'developcost_01');
            return
        }
        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
// 增加费用
async function addCost(req,res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;


        let developcost = await tb_developcost.create({
            develop_id: doc.develop_id,
            developcost_name: doc.developcost_name,
            developcost_money: Number((doc.developcost_invoice_money-0) + (doc.developcost_noinvoice_money-0)).toFixed(2),
            developcost_invoice_money:Number(doc.developcost_invoice_money).toFixed(2),
            developcost_noinvoice_money: Number(doc.developcost_noinvoice_money).toFixed(2),
            developcost_state:0
        });
        common.sendData(res, developcost);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 修改费用
async function modifyCost(req,res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let developcost = await tb_developcost.findOne({
            where: {
                developcost_id: doc.old.developcost_id
            }
        });

        if (developcost) {
            developcost.developcost_name = doc.new.developcost_name;
            developcost.developcost_money = Number((doc.new.developcost_invoice_money-0) + (doc.new.developcost_noinvoice_money-0)).toFixed(2);
            developcost.developcost_invoice_money = Number(doc.new.developcost_invoice_money).toFixed(2);
            developcost.developcost_noinvoice_money = Number(doc.new.developcost_noinvoice_money).toFixed(2);
            await developcost.save();
            common.sendData(res, developcost);
        } else {
            common.sendError(res, 'developcost_01')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}
// 发送费用任务
async function sendCostTask(req,res){
    try{
        let doc = common.docTrim(req.body), user = req.user;
        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'研发构建费用审核任务'
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
            return common.sendError(res, 'develop_38');
        }else{
            let taskName = '研发项目构建费用审核任务';
            let taskDescription = doc.develop_name + '  研发项目构建费用审核任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user,taskName,56,taskallotuser.user_id,doc.develop_id,taskDescription,'',groupId);
            if(!taskResult){
                return common.sendError(res, 'task_01');
            }else {
                await tb_developcost.update({
                    developcost_state:1
                }, {
                    where: {
                        develop_id:doc.develop_id
                    }
                });
                common.sendData(res,taskResult);
            }
        }
    }catch (error){
        common.sendFault(res, error);
    }
}
// 修改费用状态
async function modifyCostState(applyState,description,develop_id,applyApprover){
    try{
        await tb_developcost.update({
            developcost_state:applyState,
            developcost_examine_time:new Date(),
            developcost_examine:applyApprover,
            developcost_refuse_remark:description
        }, {
            where: {
                develop_id:develop_id
            }
        });
    }catch (error){
        throw error
    }
}
//----------------------------移交验收----------------------------
// 查询验收信息
async function searchCheck(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[]
        let queryStr,result;
        returnData.totalClearingLastRealityMoney = 0;    //人工决算
        returnData.totalConsumeMoney = 0;   //材料决算
        returnData.totalDevelopCostMoney = 0;              //其他费用
        returnData.totalMoney = 0;               //费用合计
        returnData.developCheckState

        replacements.push(doc.develop_id);
        queryStr = `select sum(clearing_last_reality_money) as total_clearing_last_reality_money 
            from tbl_erc_developbudget where state=1 and budget_state = 2 and develop_id = ?`;
        result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        if(result && result.length>0){
            returnData.totalClearingLastRealityMoney = result[0].total_clearing_last_reality_money?result[0].total_clearing_last_reality_money:0;
            returnData.totalClearingLastRealityMoney = Number(returnData.totalClearingLastRealityMoney).toFixed(2)
        }

        queryStr = `select sum(consumedetail_number*consumedetail_price) as total_consume_money 
            from tbl_erc_developconsumedetail d,tbl_erc_developconsume c
             where d.state=1 and c.state=1 and d.developconsume_id = c.developconsume_id and 
             c.develop_id = ?`;
        result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        if(result && result.length>0){
            returnData.totalConsumeMoney = result[0].total_consume_money?result[0].total_consume_money:0;
            returnData.totalConsumeMoney = Number(returnData.totalConsumeMoney).toFixed(2)
        }

        queryStr=`select sum(developcost_money) as total_developcost_money from tbl_erc_developcost where state=1 and develop_id = ?`;
        result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        if(result && result.length>0){
            returnData.totalDevelopCostMoney = result[0].total_developcost_money?result[0].total_developcost_money:0;
            returnData.totalDevelopCostMoney = Number(returnData.totalDevelopCostMoney).toFixed(2)
        }

        returnData.totalMoney = Number(Number(returnData.totalClearingLastRealityMoney) + Number(returnData.totalConsumeMoney) + Number(returnData.totalDevelopCostMoney)).toFixed(2);

        queryStr=`select develop_check_state from tbl_erc_develop where state=1 and develop_id=?`;
        result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        if(result && result.length>0){
            returnData.developCheckState = result[0].develop_check_state;
        }

        queryStr=`select subscribe_name,subscribe_format,subscribe_unit,
            sum(receive_done_number - consume_done_number) as surplus_number,
            ROUND(d.receive_price,2) as surplus_price,ROUND(receive_price*sum(receive_done_number - consume_done_number),2) as surplus_money
            from tbl_erc_developsubscribe s 
            left join (select developsubscribe_id, sum(receivedetail_number * receivedetail_price)/sum(receivedetail_number) as receive_price  
                from  tbl_erc_developreceivedetail 
                where state=1 
                group by developsubscribe_id) as d 
                on s.developsubscribe_id = d.developsubscribe_id 
            where s.state=1 and s.develop_id = ?  `;

        if(doc.search_text){
            queryStr +=' and subscribe_name like ?';
            let search_text = `%${doc.search_text}%`;
            replacements.push(search_text);
        }
        queryStr += ' group by subscribe_name,subscribe_format,subscribe_unit,d.receive_price';
        result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 发送验收任务
async function sendCheckTask(req,res){
    try{
        let doc = common.docTrim(req.body), user = req.user;
        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'研发提交验收审核任务'
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
            return common.sendError(res, 'develop_42');
        }else{
            let taskName = '研发项目提交验收审核任务';
            let taskDescription = doc.develop_name + '  研发项目提交验收审核任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user,taskName,57,taskallotuser.user_id,doc.develop_id,taskDescription,'',groupId);
            if(!taskResult){
                return common.sendError(res, 'task_01');
            }else {
                await tb_develop.update({
                    develop_check_state:1
                }, {
                    where: {
                        develop_id:doc.develop_id
                    }
                });
                common.sendData(res,taskResult);
            }
        }
    }catch (error){
        common.sendFault(res, error);
    }
}
// 修改验收状态
async function modifyCheckState(applyState,description,develop_id,applyApprover){
    try{
        await tb_develop.update({
            develop_check_state:applyState,
            develop_acceptor_time:new Date(),
            develop_acceptor:applyApprover,
            develop_check_refuse_remark:description
        }, {
            where: {
                develop_id:develop_id
            }
        });
    }catch (error){
        throw error
    }
}

// 上传文件模块
async function upload(req, res) {
    try {
        let uploadurl = await common.fileSave(req);
        common.sendData(res, {uploadurl: uploadurl})
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 导入数据
async function importData(req, res){
    try {
        const { type } = req.body;
        switch (type) {
            case 1:
                await importBudget(req, res);
                break;

            case 2:
                await importSubscribe(req, res);
                break;
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 导入预算
async function importBudget(req,res){
    try {
        const { user, body } = req;
        const worksheet = await common.exceltojson(body.uploadurl);
        const excelJsonArray = XLSX.utils.sheet_to_json(worksheet);
        let successNumber = 0;
        let errorNumber = 0;

        for (const itemData of excelJsonArray) {
            const [budget_work_name, budget_measurement, budget_number, budget_manual_price, budget_materiel_price] = Object.entries(itemData);
            let budget = await tb_developbudget.findOne({
                where:{
                    state:GLBConfig.ENABLE,
                    develop_id:body.develop_id,
                    budget_work_name:budget_work_name[1]
                }
            });
            if(!budget){
                let developbudget = await tb_developbudget.create({
                    develop_id: body.develop_id,
                    budget_work_name:budget_work_name[1],
                    budget_measurement: budget_measurement[1],
                    budget_number:budget_number[1],
                    budget_manual_price: budget_manual_price[1],
                    budget_materiel_price: budget_materiel_price[1],
                    budget_state:0,
                    clearing_state:0,
                    clearing_last_finishlimit:0,
                    clearing_last_reality_money:0
                });
                successNumber++;
            }
        }
        common.sendData(res, {successNumber, errorNumber});
    } catch (error) {
        throw error;
    }
}
// 导入申购数据
async function importSubscribe(req,res){
    try {
        const { user, body } = req;
        const worksheet = await common.exceltojson(body.uploadurl);
        const excelJsonArray = XLSX.utils.sheet_to_json(worksheet);
        let successNumber = 0;
        let errorNumber = 0;

        //创建申购单
        let developsubscribeorder = await tb_developsubscribeorder.create({
            develop_id: body.develop_id,
            domain_id: user.domain_id,
            subscribeorder_code:await Sequence.genDevelopSucribeOrderID(user),
            developbudget_id:body.developbudget_id,
            subscribeorder_creator:user.user_id,
            subscribeorder_state: 1
        });

        for (const itemData of excelJsonArray) {
            const [subscribeorderdetail_name, subscribeorderdetail_format, subscribeorderdetail_unit, subscribeorderdetail_number, subscribeorderdetail_remark] = Object.entries(itemData);
            if(subscribeorderdetail_name && subscribeorderdetail_name[1] && subscribeorderdetail_format && subscribeorderdetail_format[1] && subscribeorderdetail_unit && subscribeorderdetail_unit[1] && subscribeorderdetail_number && subscribeorderdetail_number[1]){
            let developsubscribeorderdetail = await tb_developsubscribeorderdetail.create({
                developsubscribeorder_id : developsubscribeorder.developsubscribeorder_id,
                subscribeorderdetail_name : subscribeorderdetail_name[1]?subscribeorderdetail_name[1]:'',
                subscribeorderdetail_format : subscribeorderdetail_format[1]?subscribeorderdetail_format[1]:'',
                subscribeorderdetail_unit : subscribeorderdetail_unit[1]?subscribeorderdetail_unit[1]:'',
                subscribeorderdetail_number : subscribeorderdetail_number[1]?subscribeorderdetail_number[1]:'',
                subscribeorderdetail_remark : (subscribeorderdetail_remark && subscribeorderdetail_remark[1])?subscribeorderdetail_remark[1]:'',
            });
            successNumber++;
            }else{
                errorNumber++;
            }
        }

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
            let taskResult = await task.createTask(user,taskName,52,taskallotuser.user_id,developsubscribeorder.developsubscribeorder_id,taskDescription,'',groupId);
            if(!taskResult){
                return common.sendError(res, 'task_01');
            }else {
                common.sendData(res,taskResult);
            }
        }
        common.sendData(res, {successNumber, errorNumber});
    } catch (error) {
        throw error;
    }
}


exports.modifyBudgetState = modifyBudgetState;
exports.modifySubscribeState = modifySubscribeState;
exports.modifyConsumeState = modifyConsumeState;
exports.modifyCostState = modifyCostState;
exports.modifyClearingState = modifyClearingState;
exports.modifyCheckState = modifyCheckState;
