
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCAmortizeDetailControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const task = require('../baseconfig/ERCTaskListControlSRV');
const moment = require('moment');
const sequelize = model.sequelize;
const XLSX = require('xlsx-style');

const tb_amortizesubscribe = model.erc_amortizesubscribe;//材料申购
const tb_amortizeconsume = model.erc_amortizeconsume;//材料消耗单
const tb_amortizeconsumedetail = model.erc_amortizeconsumedetail;//材料消耗单明细
const tb_amortizereceive = model.erc_amortizereceive;//材料收料
const tb_amortizereceivedetail = model.erc_amortizereceivedetail;//收料单明细

const tb_amortizebudget = model.erc_amortizebudget;//预算
const tb_amortizecost = model.erc_amortizecost;//费用
const tb_supplier = model.erc_supplier;
const tb_amortize = model.erc_amortize;
const tb_task = model.erc_task;
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;

const tb_amortizesubscribeorder = model.erc_amortizesubscribeorder;
const tb_amortizesubscribeorderdetail = model.erc_amortizesubscribeorderdetail;
const tb_amortizesubscribeorderdetailend = model.erc_amortizesubscribeorderdetailend;

const tb_amortizepurchaseorder = model.erc_amortizepurchaseorder;
const tb_amortizepurchaseorderdetail = model.erc_amortizepurchaseorderdetail;
const tb_amortizesubcribeorderdetailend = model.erc_amortizesubscribeorderdetailend;

// 待摊资产详情接口，包括构建预算，材料申购，采购，收料，人工结算，耗用，费用，验收8个子模块
exports.ERCAmortizeDetailControlResource = (req, res) => {
    let method = req.query.method;
    if (method==='init'){
        initAct(req,res)
    } else if (method==='getAmortize'){
        getAmortizeInfo(req,res)
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

        returnData.amortizeBudgetState = GLBConfig.AMORTIZEBUDGETSTATE;
        returnData.amortizeSubscribeState = GLBConfig.AMORTIZESUBSCRIBESTATE;
        returnData.amortizeReceiveState = GLBConfig.AMORTIZERECEIVESTATE;
        returnData.amortizeConsumeState = GLBConfig.AMORTIZECONSUMESTATE;
        returnData.amortizeCostState = GLBConfig.AMORTIZECOSTSTATE;
        returnData.amortizeClearingState = GLBConfig.AMORTIZECLEARINGSTATE;
        returnData.amortizeCheckState = GLBConfig.AMORTIZECHECKSTATE;

        returnData.supplierInfo=[];
        returnData.amortizeInfo=[];
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
// 查询待摊资产详细信息
async function getAmortizeInfo(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = [],replacements=[];

        let queryStr = `select a.*,d.department_name,
            u1.username as manager_name,u2.username as creator_name,u3.username as acceptor_name   
            from tbl_erc_amortize a 
            left join tbl_erc_department d on (a.amortize_departmant_id = d.department_id and d.state = 1) 
            left join tbl_common_user u1 on (a.amortize_manager = u1.user_id and u1.state=1) 
            left join tbl_common_user u2 on (a.amortize_creator = u2.user_id and u2.state=1)
            left join tbl_common_user u3 on (a.amortize_acceptor = u3.user_id and u3.state=1)
            where a.domain_id = ? and a.state = 1 and a.amortize_id = ?`;
        replacements.push(user.domain_id);
        replacements.push(doc.amortize_id);
        let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        for (let ap of result) {
            let d = JSON.parse(JSON.stringify(ap));
            d.created_at = ap.created_at ? moment(ap.created_at).format("YYYY-MM-DD") : null;
            d.updated_at = ap.updated_at ? moment(ap.updated_at).format("YYYY-MM-DD") : null;
            d.amortize_examine_time = ap.amortize_examine_time ? moment(ap.amortize_examine_time).format("YYYY-MM-DD") : null;

            returnData.push(d)
        }
        common.sendData(res, returnData);

    } catch (error) {
        common.sendFault(res, error);
    }
}
//////////////材料申购

/*async function deleteSubscribe(req,res){
    try {
        let doc = common.docTrim(req.body);
        let amortizesubscribe = await tb_amortizesubscribe.findOne({
            where: {
                amortizesubscribe_id: doc.amortizesubscribe_id
            }
        });
        if (amortizesubscribe) {
            amortizesubscribe.state = GLBConfig.DISABLE;
            await amortizesubscribe.save();
        } else {
            common.sendError(res, 'amortizesubscribe_01');
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
        let amortizesubscribe = await tb_amortizesubscribe.create({
            amortize_id: doc.amortize_id,
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
        common.sendData(res, amortizesubscribe);
    } catch (error) {
        common.sendFault(res, error);
    }
}*/
/*async function modifySubscribe(req,res){
    try {
        let doc = common.docTrim(req.body);

        let amortizesubscribe = await tb_amortizesubscribe.findOne({
            where: {
                amortizesubscribe_id: doc.old.amortizesubscribe_id
            }
        });

        if (amortizesubscribe) {
            amortizesubscribe.subscribe_name = doc.new.subscribe_name;
            amortizesubscribe.subscribe_format = doc.new.subscribe_format;
            amortizesubscribe.subscribe_unit = doc.new.subscribe_unit;
            amortizesubscribe.subscribe_number = doc.new.subscribe_number;
            amortizesubscribe.subscribe_remark = doc.new.subscribe_remark;
            await amortizesubscribe.save();
            common.sendData(res, amortizesubscribe);
        } else {
            common.sendError(res, 'amortizesubscribe_01')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}*/
// 发送申购审核任务
async function sendSubscribeTask(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user;

        //发送任务
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
            //创建申购单
            let amortizesubscribeorder = await tb_amortizesubscribeorder.create({
                amortize_id: doc.amortize_id,
                domain_id: user.domain_id,
                subscribeorder_code:await Sequence.genAmortizedSucribeOrderID(user),
                amortizebudget_id:doc.amortizebudget_id,
                subscribeorder_creator:user.user_id,
                subscribeorder_state: 1
            });
            //创建申购单明细
            for(var s of doc.subscribeArr){
                let amortizesubscribeorderdetail = await tb_amortizesubscribeorderdetail.create({
                    amortizesubscribeorder_id: amortizesubscribeorder.amortizesubscribeorder_id,
                    subscribeorderdetail_name: s.subscribeorderdetail_name,
                    subscribeorderdetail_format: s.subscribeorderdetail_format,
                    subscribeorderdetail_unit: s.subscribeorderdetail_unit,
                    subscribeorderdetail_number: s.subscribeorderdetail_number,
                    subscribeorderdetail_remark: s.subscribeorderdetail_remark,
                });
            }

            let taskName = '待摊资产材料申购审核任务';
            let taskDescription ='待摊资产材料申购审核任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user,taskName,34,taskallotuser.user_id,amortizesubscribeorder.amortizesubscribeorder_id,taskDescription,'',groupId);
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
// 审核后，修改申购单状态
async function modifySubscribeState(applyState,description,amortizesubscribeorder_id,applyApprover){
    try{
        if(applyState==2){//通过insert tbl_erc_amortizesubscribe

            let amortizesubcribeorder = await tb_amortizesubscribeorder.findAll({
                where:{
                    state:GLBConfig.ENABLE,
                    amortizesubscribeorder_id:amortizesubscribeorder_id
                }
            });
            let amortizesubcribeorderdetail = await tb_amortizesubscribeorderdetail.findAll({
                where:{
                    state:GLBConfig.ENABLE,
                    amortizesubscribeorder_id:amortizesubscribeorder_id
                }
            });
            for(d of amortizesubcribeorderdetail){
                let amortizesubcribeorderdetailend = await tb_amortizesubcribeorderdetailend.create({
                    amortize_id:amortizesubcribeorder[0].amortize_id,
                    subscribeorderdetailend_name:d.subscribeorderdetail_name,
                    subscribeorderdetailend_format:d.subscribeorderdetail_format,
                    subscribeorderdetailend_unit:d.subscribeorderdetail_unit,
                    subscribeorderdetailend_number:d.subscribeorderdetail_number,
                    purchase_done_number:0,
                    purchase_price:0
                });
            }
        }

        await tb_amortizesubscribeorder.update({
            subscribeorder_state:applyState,
            subscribeorder_examine_time:new Date(),
            subscribeorder_examine:applyApprover,
            subscribeorder_refuse_remark:description
        }, {
            where: {
                amortizesubscribeorder_id:amortizesubscribeorder_id
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
        let queryStr = `select *,0 as purchaseorderdetail_price,0 as purchaseorderdetail_number
from tbl_erc_amortizesubscribeorderdetailend 
where state=1 and amortize_id = ?`;
        replacements.push(doc.amortize_id);
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
// 保存采购数据
async function savePurchaseInfo(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user,replacements=[],consume_price=0;
        //采购单
        let amortizepurchaseorder = await tb_amortizepurchaseorder.create({
            amortize_id:doc.amortize_id,
            domain_id:user.domain_id,
            purchaseorder_code:await Sequence.genAmortizedPurchaseeOrderID(user),
            purchaseorder_creator:user.user_id,
            supplier_id:doc.supplier_id
        });

        //subcribe,采购单明细
        for(let p of doc.purchaseArr){
            let amortizepurchaseorderdetail = await tb_amortizepurchaseorderdetail.create({
                amortizepurchaseorder_id:amortizepurchaseorder.amortizepurchaseorder_id,
                purchaseorderdetail_name:p.subscribeorderdetailend_name,
                purchaseorderdetail_format:p.subscribeorderdetailend_format,
                purchaseorderdetail_unit:p.subscribeorderdetailend_unit,
                purchaseorderdetail_number:p.purchaseorderdetail_number,
                purchaseorderdetail_price:p.purchaseorderdetail_price,
                purchaseorderdetail_remark:p.purchaseorderdetail_remark
            });
            let amortizesubscribe = await tb_amortizesubscribe.create({
                amortize_id: doc.amortize_id,
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

            let amortizesubcribeorderdetailend = await tb_amortizesubcribeorderdetailend.findOne({
                where:{
                    amortizesubscribeorderdetailend_id:p.amortizesubscribeorderdetailend_id
                }
            });
            amortizesubcribeorderdetailend.purchase_done_number = (amortizesubcribeorderdetailend.purchase_done_number - 0) + (p.purchaseorderdetail_number - 0);
            amortizesubcribeorderdetailend.save()


        }
        common.sendData(res, amortizepurchaseorder);
    } catch (error) {
        throw error
    }
}
// 检查实时的已完成采购的数量
async function checkPurchaseDoneNumber(req,res){
    let doc = common.docTrim(req.body);
    let amortizesubcribeorderdetailend = await tb_amortizesubcribeorderdetailend.findOne({
        where:{
            amortizesubscribeorderdetailend_id : doc.amortizesubscribeorderdetailend_id
        }
    });
    if(amortizesubcribeorderdetailend.subscribeorderdetailend_number - amortizesubcribeorderdetailend.purchase_done_number < doc.purchaseorderdetail_number){
        common.sendError(res, 'amortizesubscribepurchase_01')
    }else{
        common.sendData(res, {});
    }
}

//----------------------------材料收料----------------------------
// 查询申购信息
async function searchSubscribe(req,res){
        try {
            let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
            let queryStr = `select s.*,p.supplier_name,subscribe_number*subscribe_price as subscribe_money,
            receive_done_number - consume_done_number as residue_done_number,
            consume_now_number*consume_now_price as consume_now_money
            from tbl_erc_amortizesubscribe s 
            left join tbl_erc_supplier p on (s.supplier_id = p.supplier_id and p.state = 1)
            where s.state=1 and s.amortize_id=?`;
            replacements.push(doc.amortize_id);
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
// 检查已经收料完成的物料数量
async function checkReceiveDoneNumber(req,res){
    let doc = common.docTrim(req.body);
    let amortizesubscribe = await tb_amortizesubscribe.findOne({
        where:{
            amortizesubscribe_id : doc.amortizesubscribe_id
        }
    });
    if(amortizesubscribe.subscribe_number - amortizesubscribe.receive_done_number < doc.receive_now_number){
        common.sendError(res, 'amortizesubscribe_02')
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
        let amortizereceive = await tb_amortizereceive.create({
            amortize_id:doc.amortize_id,
            receive_code:receive_code,
            receive_creator:user.user_id
        });

        for(let s of doc.receiveDetailItem){
            //收料单明细
            let amortizereceivedetail = await tb_amortizereceivedetail.create({
                amortizereceive_id: amortizereceive.amortizereceive_id,//收料单ID
                amortizesubscribe_id:s.amortizesubscribe_id,//申购单物料 ID
                receivesupplier_name: s.supplier_name,//供货商ID
                receivedetail_number:s.receive_now_number,//本次收料数量
                receivedetail_price: s.subscribe_price//本次收料单价
            });


            let amortizesubscribe = await tb_amortizesubscribe.findOne({
                where:{
                    amortize_id:doc.amortize_id,
                    amortizesubscribe_id:s.amortizesubscribe_id
                }
            });
            amortizesubscribe.receive_done_number = (amortizesubscribe.receive_done_number - 0) + (s.receive_now_number - 0);
            amortizesubscribe.save()
        }

        common.sendData(res, amortizereceive);
    } catch (error) {
        throw error
    }
}

//----------------------------材料耗用----------------------------
// 检查实时已耗用数量
async function checkConsumeDoneNumber(req,res){
    let doc = common.docTrim(req.body);
    let amortizesubscribe = await tb_amortizesubscribe.findOne({
        where:{
            amortizesubscribe_id : doc.amortizesubscribe_id
        }
    });
    if(amortizesubscribe.receive_done_number - amortizesubscribe.consume_done_number  < doc.consume_now_number){
        common.sendError(res, 'amortizesubscribe_03')
    }else{
        common.sendData(res, {});
    }
}
// 修改申购单中已耗用的数量（临时数据）
async function modifySubscribeConsume(req,res){
    try {
        let doc = common.docTrim(req.body),user = req.user,consume_price=0,replacements=[];

        let amortizesubscribe = await tb_amortizesubscribe.findOne({
            where: {
                amortizesubscribe_id: doc.old.amortizesubscribe_id
            }
        });
        //计算物料耗用单单价=项目内所有收料单的本物料总金额/总收料数量
        let queryStr = `select sum(receivedetail_number * receivedetail_price) / sum(receivedetail_number) as consume_price 
                    from tbl_erc_amortizereceivedetail d,tbl_erc_amortizereceive r 
                    where d.state=1 and r.state=1 and d.amortizereceive_id = r.amortizereceive_id and r.amortize_id = ? and d.amortizesubscribe_id = ?`;
        replacements.push(amortizesubscribe.amortize_id);
        replacements.push(amortizesubscribe.amortizesubscribe_id);
        let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        if(result && result.length>0){
            consume_price = result[0].consume_price?result[0].consume_price:0;
            consume_price = consume_price.toFixed(2)
        }

        if (amortizesubscribe) {
            amortizesubscribe.consume_now_number = doc.new.consume_now_number;
            amortizesubscribe.consume_now_price = consume_price;
            amortizesubscribe.consume_creator = user.user_id;
            await amortizesubscribe.save();
            amortizesubscribe.dataValues.consume_now_money = amortizesubscribe.consume_now_number * amortizesubscribe.consume_now_price;

            common.sendData(res, amortizesubscribe);
        } else {
            common.sendError(res, 'amortizesubscribe_01')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}
// 生成耗用单，发送审核任务
async function sendConumeTask(req,res) {
    try {
    let doc = common.docTrim(req.body), user = req.user;
    //校验是否分配任务处理人员
    let taskallot = await tb_taskallot.findOne({
        where: {
            state: GLBConfig.ENABLE,
            taskallot_name: '待摊资产材料耗用审核任务'
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
        return common.sendError(res, 'amortize_37');
    } else {
        let taskName = '待摊资产材料耗用审核任务';
        let taskDescription = doc.amortize_name + '  待摊资产材料耗用审核任务';
        let groupId = common.getUUIDByTime(30);
        let taskResult = await task.createTask(user, taskName, 37, taskallotuser.user_id, doc.amortize_id, taskDescription, '', groupId);
        if (!taskResult) {
            return common.sendError(res, 'task_01');
        } else {

            await tb_amortizesubscribe.update({
                consume_state: 1,
            }, {
                where: {
                    amortize_id: doc.amortize_id
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
// 审核后，修改耗用单状态
async function modifyConsumeState(applyState,description,amortize_id,applyApprover){
    try {
        let consume_creator = '',replacements=[],consume_price=0;
        if(applyState==2){
            let amortizesubcribe = await tb_amortizesubscribe.findAll({
                where :{
                    state:GLBConfig.ENABLE,
                    amortize_id:amortize_id
                }
            });
            if(amortizesubcribe){
                consume_creator = amortizesubcribe[0].consume_creator
            }else{
                return common.sendError(res, 'amortizesubscribe_01');
            }
            //耗用单
            let amortizeconsume = await tb_amortizeconsume.create({
                amortize_id:amortize_id,
                consume_code:await Sequence.genConsumeID(),
                consume_creator:consume_creator,
                consume_examine_time:new Date(),
                consume_examine:applyApprover,
                consume_refuse_remark:description
            });

            for(let s of amortizesubcribe){
                if(s.consume_now_number>0){
                    //耗用单明细
                    let amortizeconsumedetail = await tb_amortizeconsumedetail.create({
                        amortizeconsume_id: amortizeconsume.amortizeconsume_id,//耗用单ID
                        amortizesubscribe_id:s.amortizesubscribe_id,//申购单物料ID
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
            await tb_amortizesubscribe.update({
                consume_state:applyState,
                consume_examine_time:new Date(),
                consume_examine:applyApprover,
                consume_refuse_remark:description
            }, {
                where: {
                    amortize_id:amortize_id
                }
            });
        }
    } catch (error) {
        throw error
    }
}

//----------------------------构建预算----------------------------
// 查询预算金额：人工预算单价，材料预算单价，人工预算总价，材料预算总价
async function getSumBudgetMoney(req,res){
    let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
    let queryStr = `select ROUND(sum(clearing_reality_money),2) as total_clearing_reality_money , 
        ROUND(sum(budget_number * budget_manual_price + budget_number * budget_materiel_price),2) as total_budget_money
        from tbl_erc_amortizebudget where state=1 and amortize_id=?`;
    replacements.push(doc.amortize_id);
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
            from tbl_erc_amortizebudget where state=1 and amortize_id=?`;
        replacements.push(doc.amortize_id);
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
// 删除预算施工项
async function deleteBudget(req,res){
    try {
        let doc = common.docTrim(req.body);
        let amortizebudget = await tb_amortizebudget.findOne({
            where: {
                amortizebudget_id: doc.amortizebudget_id
            }
        });
        if (amortizebudget) {
            amortizebudget.state = GLBConfig.DISABLE;
            await amortizebudget.save();
        } else {
            common.sendError(res, 'amortizebudget_01');
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
        let amortizebudget = await tb_amortizebudget.create({
            amortize_id: doc.amortize_id,
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
        common.sendData(res, amortizebudget);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 修改预算信息
async function modifyBudget(req,res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let amortizebudget = await tb_amortizebudget.findOne({
            where: {
                amortizebudget_id: doc.old.amortizebudget_id
            }
        });

        if (amortizebudget) {
            amortizebudget.budget_work_name = doc.new.budget_work_name;
            amortizebudget.budget_measurement = doc.new.budget_measurement;
            amortizebudget.budget_number = doc.new.budget_number;
            amortizebudget.budget_manual_price = Number(doc.new.budget_manual_price).toFixed(2);
            amortizebudget.budget_materiel_price = Number(doc.new.budget_materiel_price).toFixed(2);
            amortizebudget.budget_require_detail = doc.new.budget_require_detail;
            await amortizebudget.save();
            amortizebudget.dataValues.budget_manual_money = amortizebudget.budget_number * amortizebudget.budget_manual_price;
            amortizebudget.dataValues.budget_materiel_money = amortizebudget.budget_number * amortizebudget.budget_materiel_price;
            amortizebudget.dataValues.budget_total_money = Number(amortizebudget.budget_number * amortizebudget.budget_manual_price + amortizebudget.budget_number * amortizebudget.budget_materiel_price).toFixed(2);

            common.sendData(res, amortizebudget);
        } else {
            common.sendError(res, 'amortizebudget_01')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}
// 提交预算，发送审核任务
async function sendBudgetTask(req,res){
    try{
        let doc = common.docTrim(req.body), user = req.user;
        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'待摊资产构建预算审核任务'
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
            return common.sendError(res, 'amortize_33');
        }else{
            let taskName = '待摊资产构建预算审核任务';
            let taskDescription = doc.amortize_name + '  待摊资产构建预算审核任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user,taskName,33,taskallotuser.user_id,doc.amortize_id,taskDescription,'',groupId);
            if(!taskResult){
                return common.sendError(res, 'task_01');
            }else {
                await tb_amortizebudget.update({
                    budget_state:1
                }, {
                    where: {
                        amortize_id:doc.amortize_id
                    }
                });
                common.sendData(res,taskResult);
            }
        }
    }catch (error){
        common.sendFault(res, error);
    }
}
// 审核后，修改预算状态
async function modifyBudgetState(applyState,description,amortize_id,applyApprover){
    try{
        let replacements = [];
        if(applyState==2){

            let queryStr=`select sum(budget_number*budget_manual_price+budget_number*budget_materiel_price) as amortize_budget 
                from tbl_erc_amortizebudget where state=1 and amortize_id = ?`;
            replacements.push(amortize_id);
            let result = await sequelize.query(queryStr, {
                replacements: replacements,
                type: sequelize.QueryTypes.SELECT
            })
            if(result && result.length>0)
            await tb_amortize.update({
                amortize_budget:Number(result[0].amortize_budget).toFixed(2),
            }, {
                where: {
                    amortize_id:amortize_id
                }
            });
        }
        await tb_amortizebudget.update({
            budget_state:applyState,
            budget_examine_time:new Date(),
            budget_examine:applyApprover,
            budget_refuse_remark:description
        }, {
            where: {
                amortize_id:amortize_id
            }
        });
    }catch (error){
        throw error
    }
}

//----------------------------人工结算----------------------------
// 修改人工结算金额
async function modifyBudgetClearing(req,res){
    try {
        let doc = common.docTrim(req.body),user = req.user;

        let amortizebudget = await tb_amortizebudget.findOne({
            where: {
                amortizebudget_id: doc.old.amortizebudget_id
            }
        });

        if (amortizebudget) {
            amortizebudget.clearing_now_finishlimit = doc.new.clearing_now_finishlimit;
            amortizebudget.clearing_estimate_money = doc.new.clearing_estimate_money;
            // if(amortizebudget.clearing_reality_money==0){
            //     amortizebudget.clearing_reality_money = amortizebudget.budget_number * amortizebudget.budget_manual_price * (doc.new.clearing_now_finishlimit/100).toFixed(2);
            // }else{
                amortizebudget.clearing_reality_money = doc.new.clearing_reality_money;
            // }
            await amortizebudget.save();
            common.sendData(res, amortizebudget);
        } else {
            common.sendError(res, 'amortizebudget_01')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}
// 发送审核任务
async function sendClearingTask(req,res){
    try {
    let doc = common.docTrim(req.body), user = req.user;
    //校验是否分配任务处理人员
    let taskallot = await tb_taskallot.findOne({
        where:{
            state:GLBConfig.ENABLE,
            taskallot_name:'待摊资产人工结算审核任务'
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
        return common.sendError(res, 'amortize_36');
    }else{
        let taskName = '待摊资产人工结算审核任务';
        let taskDescription = doc.amortize_name + '  待摊资产人工结算审核任务';
        let groupId = common.getUUIDByTime(30);
        let taskResult = await task.createTask(user,taskName,36,taskallotuser.user_id,doc.amortize_id,taskDescription,'',groupId);
        if(!taskResult){
            return common.sendError(res, 'task_01');
        }else {

            await tb_amortizebudget.update({
                clearing_state:1
            }, {
                where: {
                    amortize_id:doc.amortize_id
                }
            });

            common.sendData(res,taskResult);
        }
    }
}catch (error){
    common.sendFault(res, error);
}
}
// 审核后，修改结算状态
async function modifyClearingState(applyState,description,amortize_id,applyApprover){
    try {
        if(applyState==2){
            let amortizebudget = await tb_amortizebudget.findAll({
                where:{
                    state:GLBConfig.ENABLE,
                    amortize_id:amortize_id
                }
            });

            for(let b of amortizebudget){
                if(b.clearing_now_finishlimit !== 0){
                    b.clearing_last_finishlimit = b.clearing_now_finishlimit;
                }
                b.clearing_last_reality_money = b.clearing_reality_money;
                b.clearing_now_finishlimit = 0;
                b.clearing_estimate_money = 0;
                b.clearing_reality_money = 0;
                b.save();
            }

            await tb_amortizebudget.update({
                clearing_state:0,
                clearing_examine:applyApprover,
                clearing_examine_time:new Date(),
                clearing_refuse_remark:description
            }, {
                where: {
                    state:GLBConfig.ENABLE,
                    amortize_id:amortize_id
                }
            });

        }else {
            await tb_amortizebudget.update({
                clearing_state:applyState,
                clearing_examine:applyApprover,
                clearing_examine_time:new Date(),
                clearing_refuse_remark:description
            }, {
                where: {
                    state:GLBConfig.ENABLE,
                    amortize_id:amortize_id
                }
            });
        }


    } catch (error) {
        throw error
    }
}

//----------------------------构建费用----------------------------
// 查询已开票金额与未开票金额
async function getSumCostMoney(req,res){
    let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
    let queryStr = `select sum(amortizecost_invoice_money + amortizecost_noinvoice_money) as total_cost_money 
        from tbl_erc_amortizecost where state=1 and amortize_id=?`;
    replacements.push(doc.amortize_id);
    if (doc.search_text) {
        queryStr += ` and amortizecost_name like ?  `;
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

        let queryStr = `select * from tbl_erc_amortizecost where state=1 and amortize_id=?`;
        replacements.push(doc.amortize_id);
        if (doc.search_text) {
            queryStr += ` and amortizecost_name like ?  `;
            let search_text = `%${doc.search_text}%`;
            replacements.push(search_text);
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count
        returnData.rows = []
        returnData.total_amortizecost_money = 0
        for (let ap of result.data) {
            let d = JSON.parse(JSON.stringify(ap))
            d.created_at = ap.created_at ? moment(ap.created_at).format("YYYY-MM-DD") : null;
            d.updated_at = ap.updated_at ? moment(ap.updated_at).format("YYYY-MM-DD") : null;
            returnData.total_amortizecost_money += d.amortizecost_money-0;
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
        let amortizecost = await tb_amortizecost.findOne({
            where: {
                amortizecost_id: doc.amortizecost_id
            }
        });
        if (amortizecost) {
            amortizecost.state = GLBConfig.DISABLE;
            await amortizecost.save();
        } else {
            common.sendError(res, 'amortizecost_01');
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


        let amortizecost = await tb_amortizecost.create({
            amortize_id: doc.amortize_id,
            amortizecost_name: doc.amortizecost_name,
            amortizecost_money: Number((doc.amortizecost_invoice_money-0) + (doc.amortizecost_noinvoice_money-0)).toFixed(2),
            amortizecost_invoice_money:Number(doc.amortizecost_invoice_money).toFixed(2),
            amortizecost_noinvoice_money: Number(doc.amortizecost_noinvoice_money).toFixed(2),
            amortizecost_state:0
        });
        common.sendData(res, amortizecost);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 修改费用
async function modifyCost(req,res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let amortizecost = await tb_amortizecost.findOne({
            where: {
                amortizecost_id: doc.old.amortizecost_id
            }
        });

        if (amortizecost) {
            amortizecost.amortizecost_name = doc.new.amortizecost_name;
            amortizecost.amortizecost_money = Number((doc.new.amortizecost_invoice_money-0) + (doc.new.amortizecost_noinvoice_money-0)).toFixed(2);
            amortizecost.amortizecost_invoice_money = Number(doc.new.amortizecost_invoice_money).toFixed(2);
            amortizecost.amortizecost_noinvoice_money = Number(doc.new.amortizecost_noinvoice_money).toFixed(2);
            await amortizecost.save();
            common.sendData(res, amortizecost);
        } else {
            common.sendError(res, 'amortizecost_01')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}
// 发送审核任务
async function sendCostTask(req,res){
    try{
        let doc = common.docTrim(req.body), user = req.user;
        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'待摊资产构建费用审核任务'
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
            return common.sendError(res, 'amortize_38');
        }else{
            let taskName = '待摊资产构建费用审核任务';
            let taskDescription = doc.amortize_name + '  待摊资产构建费用审核任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user,taskName,38,taskallotuser.user_id,doc.amortize_id,taskDescription,'',groupId);
            if(!taskResult){
                return common.sendError(res, 'task_01');
            }else {
                await tb_amortizecost.update({
                    amortizecost_state:1
                }, {
                    where: {
                        amortize_id:doc.amortize_id
                    }
                });
                common.sendData(res,taskResult);
            }
        }
    }catch (error){
        common.sendFault(res, error);
    }
}
// 审核后，修改费用状态
async function modifyCostState(applyState,description,amortize_id,applyApprover){
    try{
        await tb_amortizecost.update({
            amortizecost_state:applyState,
            amortizecost_examine_time:new Date(),
            amortizecost_examine:applyApprover,
            amortizecost_refuse_remark:description
        }, {
            where: {
                amortize_id:amortize_id
            }
        });
    }catch (error){
        throw error
    }
}
//----------------------------移交验收----------------------------
// 查询验收数据
async function searchCheck(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[]
        let queryStr,result;
        returnData.totalClearingLastRealityMoney = 0;    //人工决算
        returnData.totalConsumeMoney = 0;   //材料决算
        returnData.totalAmortizeCostMoney = 0;              //其他费用
        returnData.totalMoney = 0;               //费用合计
        returnData.amortizeCheckState

        replacements.push(doc.amortize_id);
        queryStr = `select sum(clearing_last_reality_money) as total_clearing_last_reality_money 
            from tbl_erc_amortizebudget where state=1 and budget_state = 2 and amortize_id = ?`;
        result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        if(result && result.length>0){
            returnData.totalClearingLastRealityMoney = result[0].total_clearing_last_reality_money?result[0].total_clearing_last_reality_money:0;
            returnData.totalClearingLastRealityMoney = Number(returnData.totalClearingLastRealityMoney).toFixed(2)
        }

        queryStr = `select sum(consumedetail_number*consumedetail_price) as total_consume_money 
            from tbl_erc_amortizeconsumedetail d,tbl_erc_amortizeconsume c
             where d.state=1 and c.state=1 and d.amortizeconsume_id = c.amortizeconsume_id and 
             c.amortize_id = ?`;
        result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        if(result && result.length>0){
            returnData.totalConsumeMoney = result[0].total_consume_money?result[0].total_consume_money:0;
            returnData.totalConsumeMoney = Number(returnData.totalConsumeMoney).toFixed(2)
        }

        queryStr=`select sum(amortizecost_money) as total_amortizecost_money from tbl_erc_amortizecost where state=1 and amortize_id = ?`;
        result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        if(result && result.length>0){
            returnData.totalAmortizeCostMoney = result[0].total_amortizecost_money?result[0].total_amortizecost_money:0;
            returnData.totalAmortizeCostMoney = Number(returnData.totalAmortizeCostMoney).toFixed(2)
        }

        returnData.totalMoney = Number(Number(returnData.totalClearingLastRealityMoney) + Number(returnData.totalConsumeMoney) + Number(returnData.totalAmortizeCostMoney)).toFixed(2);

        queryStr=`select amortize_check_state from tbl_erc_amortize where state=1 and amortize_id=?`;
        result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        if(result && result.length>0){
            returnData.amortizeCheckState = result[0].amortize_check_state;
        }

        queryStr=`select subscribe_name,subscribe_format,subscribe_unit,
            sum(receive_done_number - consume_done_number) as surplus_number,
            ROUND(d.receive_price,2) as surplus_price,ROUND(receive_price*sum(receive_done_number - consume_done_number),2) as surplus_money
            from tbl_erc_amortizesubscribe s 
            left join (select amortizesubscribe_id, sum(receivedetail_number * receivedetail_price)/sum(receivedetail_number) as receive_price  
                from  tbl_erc_amortizereceivedetail 
                where state=1 
                group by amortizesubscribe_id) as d 
                on s.amortizesubscribe_id = d.amortizesubscribe_id 
            where s.state=1 and s.amortize_id = ?  `;

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
// 发送审核任务
async function sendCheckTask(req,res){
    try{
        let doc = common.docTrim(req.body), user = req.user;
        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'待摊资产提交验收审核任务'
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
            return common.sendError(res, 'amortize_42');
        }else{
            let taskName = '待摊资产提交验收审核任务';
            let taskDescription = doc.amortize_name + '  待摊资产提交验收审核任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user,taskName,42,taskallotuser.user_id,doc.amortize_id,taskDescription,'',groupId);
            if(!taskResult){
                return common.sendError(res, 'task_01');
            }else {
                await tb_amortize.update({
                    amortize_check_state:1
                }, {
                    where: {
                        amortize_id:doc.amortize_id
                    }
                });
                common.sendData(res,taskResult);
            }
        }
    }catch (error){
        common.sendFault(res, error);
    }
}
// 审核后，修改费用状态
async function modifyCheckState(applyState,description,amortize_id,applyApprover){
    try{
        await tb_amortize.update({
            amortize_check_state:applyState,
            amortize_acceptor_time:new Date(),
            amortize_acceptor:applyApprover,
            amortize_check_refuse_remark:description
        }, {
            where: {
                amortize_id:amortize_id
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
// 导入数据excel
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
// 导入预算excel
async function importBudget(req,res){
    try {
        const { user, body } = req;
        const worksheet = await common.exceltojson(body.uploadurl);
        const excelJsonArray = XLSX.utils.sheet_to_json(worksheet);
        let successNumber = 0;
        let errorNumber = 0;

        for (const itemData of excelJsonArray) {
            const [budget_work_name, budget_measurement, budget_number, budget_manual_price, budget_materiel_price] = Object.entries(itemData);
            let budget = await tb_amortizebudget.findOne({
                where:{
                    state:GLBConfig.ENABLE,
                    amortize_id:body.amortize_id,
                    budget_work_name:budget_work_name[1]
                }
            });
            if(!budget){
                let amortizebudget = await tb_amortizebudget.create({
                    amortize_id: body.amortize_id,
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
// 导入申购excel
async function importSubscribe(req,res){
    try {
        const { user, body } = req;
        const worksheet = await common.exceltojson(body.uploadurl);
        const excelJsonArray = XLSX.utils.sheet_to_json(worksheet);
        let successNumber = 0;
        let errorNumber = 0;

        //创建申购单
        let amortizesubscribeorder = await tb_amortizesubscribeorder.create({
            amortize_id: body.amortize_id,
            domain_id: user.domain_id,
            subscribeorder_code:await Sequence.genAmortizedSucribeOrderID(user),
            amortizebudget_id:body.amortizebudget_id,
            subscribeorder_creator:user.user_id,
            subscribeorder_state: 1
        });

        for (const itemData of excelJsonArray) {
            const [subscribeorderdetail_name, subscribeorderdetail_format, subscribeorderdetail_unit, subscribeorderdetail_number, subscribeorderdetail_remark] = Object.entries(itemData);
            if(subscribeorderdetail_name && subscribeorderdetail_name[1] && subscribeorderdetail_format && subscribeorderdetail_format[1] && subscribeorderdetail_unit && subscribeorderdetail_unit[1] && subscribeorderdetail_number && subscribeorderdetail_number){
            let amortizesubscribeorderdetail = await tb_amortizesubscribeorderdetail.create({
                amortizesubscribeorder_id : amortizesubscribeorder.amortizesubscribeorder_id,
                subscribeorderdetail_name : subscribeorderdetail_name[1]?subscribeorderdetail_name[1]:'',
                subscribeorderdetail_format : subscribeorderdetail_format[1]?subscribeorderdetail_format[1]:'',
                subscribeorderdetail_unit : subscribeorderdetail_unit[1]?subscribeorderdetail_unit[1]:'',
                subscribeorderdetail_number : subscribeorderdetail_number[1]?subscribeorderdetail_number[1]:'',
                subscribeorderdetail_remark : (subscribeorderdetail_remark && subscribeorderdetail_remark[1])?subscribeorderdetail_remark[1]:'',
            });
            successNumber++;
            }
            else{
                errorNumber++
            }
        }

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
            let taskResult = await task.createTask(user,taskName,34,taskallotuser.user_id,amortizesubscribeorder.amortizesubscribeorder_id,taskDescription,'',groupId);
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
