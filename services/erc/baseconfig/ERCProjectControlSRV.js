/**
 * Created by BaiBin on 2018/1/31.
 */
const fs = require('fs');
const path = require('path');
const iconvLite = require('iconv-lite');
const moment = require('moment');
const config = require('../../../config');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ProduceControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const TaskListControlSRV = require('./ERCTaskListControlSRV');
const task = require('../baseconfig/ERCTaskListControlSRV');

const sequelize = model.sequelize;
const tb_project = model.erc_project;
const tb_projectdetail = model.erc_projectdetail;
const tb_projectspacedetail = model.erc_projectspacedetail;
const tb_workerprice = model.erc_workerprice;
const tb_user = model.common_user;

const tb_projectsubscribe = model.erc_projectsubscribe;//材料申购
const tb_projectconsume = model.erc_projectconsume;//材料消耗单
const tb_projectconsumedetail = model.erc_projectconsumedetail;//材料消耗单明细
const tb_projectreceive = model.erc_projectreceive;//材料收料
const tb_projectreceivedetail = model.erc_projectreceivedetail;//收料单明细

const tb_projectbudget = model.erc_projectbudget;//预算
const tb_projectcost = model.erc_projectcost;//费用
const tb_supplier = model.erc_supplier;
const tb_task = model.erc_task;
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;

const tb_projectsubscribeorder = model.erc_projectsubscribeorder;
const tb_projectsubscribeorderdetail = model.erc_projectsubscribeorderdetail;
const tb_projectsubscribeorderdetailend = model.erc_projectsubscribeorderdetailend;

const tb_projectpurchaseorder = model.erc_projectpurchaseorder;
const tb_projectpurchaseorderdetail = model.erc_projectpurchaseorderdetail;
const tb_projectsubcribeorderdetailend = model.erc_projectsubscribeorderdetailend;

exports.ERCProjectControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'search'){
        searchAct(req, res)
    } else if (method === 'add'){
        addAct(req, res)
    } else if (method === 'modify'){
        modifyAct(req, res)
    } else if (method === 'getEstate'){
        getEstate(req, res)
    } else if (method === 'search_detail'){
        searchDetailAct(req, res)
    } else if (method === 'modify_detail'){
        modifyDetailAct(req, res)
    } else if (method === 'delete_detail'){
        deleteDetailAct(req, res)
    }  else if (method === 'search_space_detail'){
        searchSpaceDetailAct(req, res)
    } else if (method === 'add_space'){
        addSpaceAct(req, res)
    } else if (method === 'modify_space'){
        modifySpaceAct(req, res)
    } else if (method === 'delete_space'){
        deleteSpaceAct(req, res)
    } else if (method === 'save_space'){
        saveSpaceAct(req, res)
    } else if (method === 'calculate_detail'){
        calculateDetailAct(req, res)
    } else if (method === 'submit_detail'){
        submitDetailAct(req, res)
    } else if (method === 'upload') {
        uploadAct(req, res)
    } else if (method === 'download_template') {
        downloadTemplateACT(req, res)
    } else if (method === 'import_space'){
        importSpace(req, res)
    } else if (method==='getProject'){
        getProjectInfo(req,res)
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
    } else if (method==='getProjectIdByProjectsubscribeorderId'){
        getProjectIdByProjectsubscribeorderId(req,res)
    } else {
        common.sendError(res, 'common_01');
    }
};

//初始化页面信息
async function initAct(req,res){

    try {
        let returnData = {},
            user = req.user;

        returnData.projectProjectState = GLBConfig.PROJECTCHECKSTATE;
        returnData.projectBudgetState = GLBConfig.PROJECTBUDGETSTATE;
        returnData.projectSubscribeState = GLBConfig.PROJECTSUBSCRIBESTATE;
        returnData.projectReceiveState = GLBConfig.PROJECTRECEIVESTATE;
        returnData.projectConsumeState = GLBConfig.PROJECTCONSUMESTATE;
        returnData.projectCostState = GLBConfig.PROJECTCOSTSTATE;
        returnData.projectClearingState = GLBConfig.PROJECTCLEARINGSTATE;
        returnData.projectCheckState = GLBConfig.PROJECTCHECKSTATE;
        returnData.supplierInfo=[];

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

        returnData.projectState = GLBConfig.PROJECTSTATE
        returnData.spacePositionInfo = GLBConfig.SPACEPOSITION

        let staff = await tb_user.findAll({
            where: {
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id,
                user_type: '01',
            }
        });
        returnData.staffInfo = []
        for (let s of staff) {
            returnData.staffInfo.push({
                id: (s.user_id).toString(),
                value: (s.user_id).toString(),
                text: s.name
            });
        }

        let professions = await tb_workerprice.findAll({
            where:{
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id
            }
        });
        returnData.professionInfo = [];
        for (let p of professions) {
            returnData.professionInfo.push({
                id: (p.worker_id).toString(),
                value: (p.worker_id).toString(),
                text: p.worker_name
            });
        }
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }

}
//获取工程项目信息
async function searchAct(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};
        let queryStr = `select p.* from tbl_erc_project p
                where p.state=1 `;
        //type=1 预算  type=2 决算
        if (doc.type) {
            if (doc.type === '1') {

            } else {
                queryStr += ` and p.project_state in ('3', '5', '6', '7')`;
            }
        }

        if (user.domain_id) {
            queryStr += ` and p.domain_id = ?`;
            replacements.push(user.domain_id);
        }
        if (doc.project_id) {
            queryStr += ` and p.project_id = ?`;
            replacements.push(doc.project_id);
        }
        if(doc.search_text){
            queryStr+=` and (p.project_id like ? or p.project_name like ?) `;
            replacements.push('%'+doc.search_text+'%');
            replacements.push('%'+doc.search_text+'%');
        }
        queryStr+=` order by p.created_at desc `;
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        // for (let r of result.data) {
        //     if (r.project_quoted_amount) {
        //         r.project_quoted_amount = (r.project_quoted_amount / 100)
        //     }
        //     if (r.project_budget_amount) {
        //         r.project_budget_amount = (r.project_budget_amount / 100)
        //     }
        //     if (r.project_final_amount) {
        //         r.project_final_amount = (r.project_final_amount / 100)
        //     }
        // }
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }

}
//获取楼盘管理信息
async function getEstate(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let replacements = [];

        let queryStr = 'select * from tbl_erc_estate where state=1 and province=? and city=? and district=?';
        replacements.push(doc.province);
        replacements.push(doc.city);
        replacements.push(doc.district);

        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        let returnData = [];
        for (let i = 0; i < queryRst.length; i++) {
            let elem = {};
            elem.id = queryRst[i].estate_id;
            elem.value = queryRst[i].estate_name;
            elem.text = queryRst[i].estate_name;
            returnData.push(elem)
        }

        common.sendData(res, returnData);

    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//创建工程项目，提交审批任务
async function addAct(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user
        //发送任务
        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'工程项目新建审核任务'
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
            return common.sendError(res, 'task_02');
        }else{
            let project_id = await Sequence.getProjectID(user.domain_id);
            console.log(project_id)
            let pro = await tb_project.create({
                project_id:project_id,
                domain_id:user.domain_id,
                project_name: doc.project_name,
                // project_estate_id: doc.project_estate_id,
                project_approver_id: doc.project_approver_id,
                project_province:doc.project_province,
                project_city:doc.project_city,
                project_district:doc.project_district,
                project_estate_name:doc.project_estate_name,
                project_state: '1'
            });
            //添加项目详情
            let replacements = [];
            let queryStr = 'select r.*, s.goroom_id as space_id, s.goroom_name as space_name from tbl_erc_goorderroom s left join tbl_erc_roomtype r on s.roomtype_id = r.roomtype_id where r.estate_id = ?';
            replacements.push(doc.project_estate_id);
            let queryRst = await sequelize.query(queryStr, {
                replacements: replacements,
                type: sequelize.QueryTypes.SELECT
            });
            for (let r of queryRst) {
                await tb_projectdetail.create({
                    project_id: pro.project_id,
                    estate_id: pro.project_estate_id,
                    roomtype_id: r.roomtype_id,
                    roomtype_name: r.roomtype_name,
                    space_id: r.space_id,
                    space_name: r.space_name,
                    space_state: 0
                });
            }

            let taskName = '工程项目新建审核任务';
            let taskDescription ='工程项目新建审核任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user,taskName,65,taskallotuser.user_id,project_id,taskDescription,'',groupId);
            if(!taskResult){
                return common.sendError(res, 'task_01');
            }else {
                common.sendData(res,taskResult);
            }
        }
        common.sendData(res, pro);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//修改工程项目信息
async function modifyAct(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user
        let pd = await tb_project.findOne({
            where: {
                project_id: doc.old.project_id
            }
        });
        if (pd) {
            pd.project_approver_id = doc.new.project_approver_id
            await pd.save();
        }
        // if (pd.project_budget_amount) {
        //     pd.project_budget_amount = pd.project_budget_amount / 100;
        // }
        // if (pd.project_quoted_amount) {
        //     pd.project_quoted_amount = pd.project_quoted_amount / 100
        // }
        common.sendData(res, pd);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//查询项目详情
async function searchDetailAct(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};
        let queryStr = 'select * from tbl_erc_projectdetail where state = 1 and project_id = ?'
        replacements.push(doc.project_id);
        if(doc.search_text){
            queryStr+=' and (space_name like ?) ';
            replacements.push('%'+doc.search_text+'%');
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        // for(let r of result.data){
        //     if (r.space_budget_amount) {
        //         r.space_budget_amount = r.space_budget_amount / 100;
        //     }
        //     if (r.space_total_amount) {
        //         r.space_total_amount = r.space_total_amount / 100;
        //     }
        //     if (r.space_final_amount) {
        //         r.space_final_amount = r.space_final_amount / 100;
        //     }
        //     if (r.space_final_total_amount) {
        //         r.space_final_total_amount = r.space_final_total_amount / 100;
        //     }
        // }

        let pds = await tb_projectdetail.findAll({
            where: {
                project_id: doc.project_id,
                state:GLBConfig.ENABLE
            }
        })
        let total_price = 0;
        for (let p of pds) {
            total_price += p.space_total_amount
        }

        returnData.total_price = total_price;
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//修改详情
async function modifyDetailAct(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user
        let pd = await tb_projectdetail.findOne({
            where: {
                project_detail_id: doc.old.project_detail_id
            }
        });
        if (pd) {
            pd.space_count = doc.new.space_count
            if (doc.new.space_budget_amount) {
                pd.space_total_amount = doc.new.space_budget_amount * doc.new.space_count;
            }
            await pd.save();
        }
        // if (doc.new.space_budget_amount) {
        //     pd.space_total_amount = doc.new.space_budget_amount * doc.new.space_count;
        // }
        // if (pd.space_budget_amount) {
        //     pd.space_budget_amount = pd.space_budget_amount / 100
        // }
        common.sendData(res, pd);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//删除详情
async function deleteDetailAct(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user
        let pd = await tb_projectdetail.findOne({
            where: {
                project_detail_id: doc.project_detail_id
            }
        });
        if (pd) {
            pd.state = GLBConfig.DISABLE;
            await pd.save();
        }

        common.sendData(res, pd);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//查询空间详情
async function searchSpaceDetailAct(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};
        let queryStr = `select s.*, w.worker_cost, w.worker_unit, a.purchaseapply_id, p.apply_state from tbl_erc_projectspacedetail s
         left join tbl_erc_workerprice w on (s.worker_id =  w.worker_id)
         left join (select distinct purchaseapply_id, project_space_id from tbl_erc_purchaseapplydetail) a on (s.project_space_id = a.project_space_id)
         left join tbl_erc_purchaseapply p on (a.purchaseapply_id = p.purchaseapply_id)
         where s.state = 1 and w.state = 1 and s.project_detail_id = ?`
        replacements.push(doc.project_detail_id);
        if(doc.project_space_position){
            queryStr+=` and project_space_position = ? `;
            replacements.push(doc.project_space_position);
        }
        if(doc.worker_id){
            queryStr+=` and (s.worker_id = ?) `;
            replacements.push(doc.worker_id);
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for(let r of result.data){
            // if (r.worker_budget) {
            //     r.worker_budget =  r.worker_budget / 100;
            // }
            if (r.material_budget) {
                r.material_budget = r.material_budget / 100;
            }
            // if (r.worker_total_budget) {
            //     r.worker_total_budget = r.worker_total_budget / 100;
            // }
            // if (r.material_total_budget) {
            //     r.material_total_budget = r.material_total_budget / 100;
            // }
            // if (r.worker_final_price) {
            //     r.worker_final_price = r.worker_final_price / 100;
            // }
            // if (r.worker_total_final_price) {
            //     r.worker_total_final_price = r.worker_total_final_price / 100;
            // }
            // if (r.material_total_final_price) {
            //     r.material_total_final_price = r.material_total_final_price / 100;
            // }
        }
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//增加空间
async function addSpaceAct(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user

        //查找工种价格
        let worker = await tb_workerprice.findOne({
            where: {
                worker_id: doc.worker_id
            }
        })
        let space_id = await Sequence.getProjectSpaceID(user.domain_id);
        doc.worker_budget = worker.worker_cost;
        doc.worker_total_budget = worker.worker_cost * doc.count;
        doc.material_total_budget = doc.material_budget  * doc.count;
        let pro = await tb_projectspacedetail.create({
            project_space_id: space_id,
            project_id: doc.project_id,
            project_detail_id: doc.project_detail_id,
            project_space_position: doc.project_space_position,
            project_space_name: doc.project_space_name,
            worker_id: doc.worker_id,
            count: doc.count,
            project_space_unit: doc.project_space_unit,
            worker_budget: doc.worker_budget,
            material_budget: doc.material_budget * 100,
            worker_total_budget: doc.worker_total_budget,
            material_total_budget: doc.material_total_budget,
        });
        await calculateTotalPrice(doc.project_detail_id);
        common.sendData(res, pro);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//计算总价格
async function calculateTotalPrice(projectDetailId){
    //重新计算总金额
    let space_details = await tb_projectspacedetail.findAll({
        where:{
            project_detail_id: projectDetailId,
            state: GLBConfig.ENABLE
        }
    })
    let total_price = 0;
    let final_price = 0;
    for (let space of space_details) {
        total_price += space.worker_total_budget + space.material_total_budget
        final_price += space.worker_total_final_price + space.material_total_final_price
    }

    let pro_detail = await tb_projectdetail.findOne({
        where:{
            project_detail_id: projectDetailId
        }
    })
    if(pro_detail) {
        pro_detail.space_budget_amount = total_price
        pro_detail.space_final_amount = final_price
        pro_detail.space_total_amount = total_price * pro_detail.space_count
        pro_detail.space_final_total_amount = final_price * pro_detail.space_count
        await pro_detail.save();
    }
}
//修改空间
async function modifySpaceAct(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user
        let pd = await tb_projectspacedetail.findOne({
            where: {
                project_space_id: doc.old.project_space_id,
                state: GLBConfig.ENABLE
            }
        });
        if (pd) {
            pd.project_space_position = doc.new.project_space_position
            pd.project_space_name = doc.new.project_space_name
            pd.worker_id = doc.new.worker_id
            pd.count = doc.new.count
            pd.actual_count = doc.new.actual_count
            if (doc.new.worker_budget) {
                pd.worker_budget = doc.new.worker_budget
            }
            if (doc.new.worker_final_price) {
                pd.worker_final_price = doc.new.worker_final_price
            }
            if (doc.new.material_budget) {
                pd.material_budget = doc.new.material_budget * 100
            }
            if (doc.new.worker_budget && doc.new.count) {
                pd.worker_total_budget = doc.new.worker_budget * doc.new.count
            }
            if (doc.new.worker_final_price && doc.new.actual_count) {
                pd.worker_total_final_price = doc.new.worker_final_price * doc.new.actual_count
            }
            if (doc.new.material_budget && doc.new.count) {
                pd.material_total_budget = doc.new.material_budget * doc.new.count
            }
            await pd.save();
        }

        await calculateTotalPrice(pd.project_detail_id);

        pd.material_budget = doc.new.material_budget

        common.sendData(res, pd);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//删除空间
async function deleteSpaceAct(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user
        let pd = await tb_projectspacedetail.findOne({
            where: {
                project_space_id: doc.project_space_id
            }
        });
        if (pd) {
            pd.state = GLBConfig.DISABLE;
            await pd.save();
        }
        await calculateTotalPrice(pd.project_detail_id);
        common.sendData(res, pd);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//保存空间信息
async function saveSpaceAct(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user
        let psds = await tb_projectspacedetail.findAll({
            where: {
                project_detail_id: doc.project_detail_id,
                state: GLBConfig.ENABLE
            }
        });
        let space_total_price = 0;
        for(let p of psds){
            space_total_price += (p.worker_total_budget + p.material_total_budget)
        }
        let pds = await tb_projectdetail.findOne({
            where: {
                project_detail_id: doc.project_detail_id
            }
        })
        if (pds) {
            pds.space_budget_amount = space_total_price
            if (pds.space_count) {
                pds.space_total_amount = pds.space_budget_amount * pds.space_count
            }
            await pds.save();
        }
        common.sendData(res, pds);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//计算详情价格
async function calculateDetailAct(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user

        let pds = await tb_projectdetail.findAll({
            where: {
                project_id: doc.project_id
            }
        })
        let returnData = {}
        let total_price = 0;
        for (let p of pds) {
            total_price += p.space_total_amount
        }
        returnData.total_price = total_price;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//提交审核
async function submitDetailAct(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user

        let proDetails = await tb_projectdetail.findAll({
            where: {
                project_id: doc.project_id,
                state: GLBConfig.ENABLE
            }
        })
        let space_total_amount = 0;
        for(let d of proDetails) {
            if (d.space_total_amount === null) {
                common.sendError(res, 'project_01');
                return;
            }
            space_total_amount += d.space_total_amount ? d.space_total_amount:0
        }

        let pro = await tb_project.findOne({
            where: {
                project_id: doc.project_id
            }
        })
        if (pro) {
            pro.project_state = '1';
            pro.project_budget_amount = space_total_amount;
            pro.project_quoted_amount = doc.project_quoted_amount;
            await pro.save();
        }

        //生成一条任务
        let taskName = '预算审核';
        let taskType = '12';
        let taskPerformer = pro.project_approver_id;
        let taskReviewCode = doc.project_id;
        let taskDescription = '预算审核申请';
        await TaskListControlSRV.createTask(user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription);

        common.sendData(res, pro);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//获取项目任务
async function reviewProjectlTask(reviewState, reviewType, projectId, taskRemark){
    let pro = await tb_project.findOne({
        where: {
            project_id: projectId
        }
    })
    if (reviewType === '12') {
        if (reviewState === 0) {
            pro.project_state = '4'
        } else if (reviewState === 1) {
            pro.project_state = '3'
        }
        pro.project_budget_remark = taskRemark;
    } else if (reviewType === '13') {
        if (reviewState === 0) {
            pro.project_state = '7'
        } else if (reviewState === 1) {
            pro.project_state = '6'
        }
        pro.project_final_remark = taskRemark;
    }
    await pro.save();
}
let uploadAct = async (req, res) => {
    try {
        let fileInfo = await common.fileSave(req)
        common.sendData(res, fileInfo)
    } catch (error) {
        common.sendFault(res, error)
    }
};
//下载模板
async function downloadTemplateACT(req, res) {
    try {
        let str = '//项目预算详情ID,空间位置,施工项,工种ID,数量,人工预算单价,材料预算单价\r12,天花,按灯,1,1,100,100\r工种ID请在运营数据管理下人工价格标准查看';

        // let filename = 'download_' + common.getUUIDByTime(32) + '.csv';
        let filename = '乐宜嘉项目预算详情导入模板.csv';
        let tempfile = path.join(__dirname, '../../../' + config.uploadOptions.uploadDir + '/' + filename);
        let csvBuffer = iconvLite.encode(str, 'gb2312');
        fs.writeFile(tempfile, csvBuffer, function(err) {
            if (err) throw err;
            common.sendData(res, config.tmpUrlBase + filename);
        });
    } catch (error) {
        common.sendFault(res, error);
    }
}
//空间导入
async function importSpace(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        logger.debug('importSpace:', doc);

        let jsonArray = await common.csvtojsonByPath(doc.uploadurl);
        let dataArray = [];
        for (let i = 0; i < jsonArray.length; i++) {
            if (jsonArray[i].length === 0) {
                common.sendError(res, 'project_04');
                return;
            }
            let item = jsonArray[i];
            if (item.length !== 7) {
                common.sendError(res, 'project_03');
                return;
            }
            let worker_id = item[3];
            //查找工种价格
            let worker = await tb_workerprice.findOne({
                where: {
                    worker_id: worker_id,
                    state:GLBConfig.ENABLE
                }
            })
            if (worker){
                let space_id = await Sequence.getProjectSpaceID(user.domain_id);
                let pro = await tb_projectspacedetail.create({
                    project_space_id: space_id,
                    project_id: doc.project_id,
                    project_detail_id: item[0],
                    project_space_position: item[1],
                    project_space_name: item[2],
                    worker_id: worker_id,
                    count: item[4],
                    project_space_unit: worker.worker_unit,
                    worker_budget: parseInt(item[5]),
                    material_budget: parseInt(item[6]) * 100,
                    worker_total_budget: parseInt(item[5]) *  parseInt(item[4]),
                    material_total_budget: parseInt(item[6]) * parseInt(item[4]),
                });
                dataArray.push(pro)
            } else {
                let errMsg = '不存在工人id' + worker_id
                common.sendError(res, null, errMsg);
                return;
            }
        }

        let pro_details = await tb_projectdetail.findAll({
            where: {
                project_id: doc.project_id,
                state: GLBConfig.ENABLE
            }
        })

        for (pro of pro_details) {
            let spaces = await tb_projectspacedetail.findAll({
                where: {
                    state: GLBConfig.ENABLE,
                    project_detail_id: pro.project_detail_id
                }
            })
            let space_total_price = 0
            for (space of spaces) {
                space_total_price += (space.worker_total_budget + space.material_total_budget)
            }
            pro.space_budget_amount = space_total_price
            pro.space_total_amount = space_total_price * pro.space_count
            await pro.save();
        }

        common.sendData(res, dataArray);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//获取预算金额
async function getSumBudgetMoney(req,res){
    let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
    let queryStr = `select ROUND(sum(clearing_reality_money),2) as total_clearing_reality_money , 
        ROUND(sum(budget_number * budget_manual_price + budget_number * budget_materiel_price),2) as total_budget_money
        from tbl_erc_projectbudget where state=1 and project_id=?`;
    replacements.push(doc.project_id);
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

//获取预算信息
async function searchBudget(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];

        let queryStr = `select * , 
            budget_number * budget_manual_price as budget_manual_money,
            budget_number * budget_materiel_price as budget_materiel_money,
            budget_number * budget_manual_price + budget_number * budget_materiel_price as budget_total_money
            from tbl_erc_projectbudget where state=1 and project_id=?`;
        replacements.push(doc.project_id);
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
//发送预算审核任务
async function sendBudgetTask(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user;

        //发送任务
        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'工程项目提交预算审核任务'
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
            return common.sendError(res, 'project_34');
        }else{
            await tb_projectdetail.update({
                space_state:1
            }, {
                where: {
                    project_id:doc.project_id
                }
            });

            //更新报价金额
            await tb_project.update({
                project_quoted_amount:doc.project_quoted_amount
            }, {
                where: {
                    project_id:doc.project_id
                }
            });


            let taskName = '工程项目提交预算审核任务';
            let taskDescription ='工程项目提交预算审核任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user,taskName,66,taskallotuser.user_id,doc.project_id,taskDescription,'',groupId);
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
//修改预算审核状态
async function modifyBudgetState(applyState,description,project_id,applyApprover){
    try {
        if(applyState == 2){
            let proDetails = await tb_projectdetail.findAll({
                where: {
                    project_id: project_id,
                    state: GLBConfig.ENABLE
                }
            })
            let space_total_amount = 0;
            for(let d of proDetails) {
                space_total_amount += d.space_total_amount ? d.space_total_amount:0
            }

            let pro = await tb_project.findOne({
                where: {
                    project_id: project_id
                }
            })
            if (pro) {
                pro.project_budget_amount = space_total_amount;
                await pro.save();
            }

            //将数据插入projectBudget
            let proSpaceDetail = await tb_projectspacedetail.findAll({
                where:{
                    state: GLBConfig.ENABLE,
                    project_id: project_id
                }
            })

            for(let s of proSpaceDetail){
                let projectbudget = await tb_projectbudget.create({
                    project_id: project_id,
                    budget_work_name: s.project_space_name,   //施工项目名称
                    budget_measurement: s.project_space_unit, //计量单位
                    budget_number:s.count,       //数量
                    budget_manual_price:(Number(s.worker_budget)).toFixed(2),//人工预算单价
                    budget_materiel_price: (Number(s.material_budget)/100).toFixed(2),//材料预算单价
                    budget_state:2,         //状态  待提交，已提交，通过，拒绝
                    clearing_state:0,
                    clearing_last_finishlimit:0,
                    clearing_last_reality_money:0
                });
            }
        }

        await tb_projectdetail.update({
            space_state:applyState,
            space_examine_time:new Date(),
            space_examine:applyApprover,
            space_refuse_remark:description
        }, {
            where: {
                project_id:project_id
            }
        });
    } catch (error) {
        throw error;
    }
}
//发布工程项目材料申购审核任务
async function sendSubscribeTask(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user;

        //发送任务
        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'工程项目材料申购审核任务'
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
            return common.sendError(res, 'project_34');
        }else{
            //创建申购单
            let projectsubscribeorder = await tb_projectsubscribeorder.create({
                project_id: doc.project_id,
                domain_id: user.domain_id,
                subscribeorder_code:await Sequence.genProjectSucribeOrderID(user),
                projectbudget_id:doc.projectbudget_id,
                subscribeorder_creator:user.user_id,
                subscribeorder_state: 1
            });
            //创建申购单明细
            for(var s of doc.subscribeArr){
                let projectsubscribeorderdetail = await tb_projectsubscribeorderdetail.create({
                    projectsubscribeorder_id: projectsubscribeorder.projectsubscribeorder_id,
                    subscribeorderdetail_name: s.subscribeorderdetail_name,
                    subscribeorderdetail_format: s.subscribeorderdetail_format,
                    subscribeorderdetail_unit: s.subscribeorderdetail_unit,
                    subscribeorderdetail_number: s.subscribeorderdetail_number,
                    subscribeorderdetail_remark: s.subscribeorderdetail_remark,
                });
            }

            let taskName = '工程项目材料申购审核任务';
            let taskDescription ='工程项目材料申购审核任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user,taskName,60,taskallotuser.user_id,projectsubscribeorder.projectsubscribeorder_id,taskDescription,'',groupId);
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
//修改工程项目材料申购审核状态
async function modifySubscribeState(applyState,description,projectsubscribeorder_id,applyApprover){
    try{
        if(applyState==2){//通过insert tbl_erc_projectsubscribe

            let projectsubcribeorder = await tb_projectsubscribeorder.findAll({
                where:{
                    state:GLBConfig.ENABLE,
                    projectsubscribeorder_id:projectsubscribeorder_id
                }
            });
            let projectsubcribeorderdetail = await tb_projectsubscribeorderdetail.findAll({
                where:{
                    state:GLBConfig.ENABLE,
                    projectsubscribeorder_id:projectsubscribeorder_id
                }
            });
            for(d of projectsubcribeorderdetail){
                let projectsubcribeorderdetailend = await tb_projectsubcribeorderdetailend.create({
                    project_id:projectsubcribeorder[0].project_id,
                    subscribeorderdetailend_name:d.subscribeorderdetail_name,
                    subscribeorderdetailend_format:d.subscribeorderdetail_format,
                    subscribeorderdetailend_unit:d.subscribeorderdetail_unit,
                    subscribeorderdetailend_number:d.subscribeorderdetail_number,
                    purchase_done_number:0,
                    purchase_price:0
                });
            }
        }

        await tb_projectsubscribeorder.update({
            subscribeorder_state:applyState,
            subscribeorder_examine_time:new Date(),
            subscribeorder_examine:applyApprover,
            subscribeorder_refuse_remark:description
        }, {
            where: {
                projectsubscribeorder_id:projectsubscribeorder_id
            }
        });

    }catch (error){
        throw error
    }
}

//材料采购
async function searchSubcribeOrderDetailEnd(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
        let queryStr = `select *,0 as purchaseorderdetail_price,0 as purchaseorderdetail_number
            from tbl_erc_projectsubscribeorderdetailend 
            where state=1 and project_id = ?`;
        replacements.push(doc.project_id);
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
//保存采购信息
async function savePurchaseInfo(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user,replacements=[],consume_price=0;
        //采购单
        let projectpurchaseorder = await tb_projectpurchaseorder.create({
            project_id:doc.project_id,
            domain_id:user.domain_id,
            purchaseorder_code:await Sequence.genProjectPurchaseeOrderID(user),
            purchaseorder_creator:user.user_id,
            supplier_id:doc.supplier_id
        });

        //subcribe,采购单明细
        for(let p of doc.purchaseArr){
            let projectpurchaseorderdetail = await tb_projectpurchaseorderdetail.create({
                projectpurchaseorder_id:projectpurchaseorder.projectpurchaseorder_id,
                purchaseorderdetail_name:p.subscribeorderdetailend_name,
                purchaseorderdetail_format:p.subscribeorderdetailend_format,
                purchaseorderdetail_unit:p.subscribeorderdetailend_unit,
                purchaseorderdetail_number:p.purchaseorderdetail_number,
                purchaseorderdetail_price:p.purchaseorderdetail_price,
                purchaseorderdetail_remark:p.purchaseorderdetail_remark
            });
            let projectsubscribe = await tb_projectsubscribe.create({
                project_id: doc.project_id,
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

            let projectsubcribeorderdetailend = await tb_projectsubcribeorderdetailend.findOne({
                where:{
                    projectsubscribeorderdetailend_id:p.projectsubscribeorderdetailend_id
                }
            });
            projectsubcribeorderdetailend.purchase_done_number = (projectsubcribeorderdetailend.purchase_done_number - 0) + (p.purchaseorderdetail_number - 0);
            projectsubcribeorderdetailend.save()


        }
        common.sendData(res, projectpurchaseorder);
    } catch (error) {
        throw error
    }
}
//校验数量
async function checkPurchaseDoneNumber(req,res){
    let doc = common.docTrim(req.body);
    let projectsubcribeorderdetailend = await tb_projectsubcribeorderdetailend.findOne({
        where:{
            projectsubscribeorderdetailend_id : doc.projectsubscribeorderdetailend_id
        }
    });
    if(projectsubcribeorderdetailend.subscribeorderdetailend_number - projectsubcribeorderdetailend.purchase_done_number < doc.purchaseorderdetail_number){
        common.sendError(res, 'projectsubscribepurchase_01')
    }else{
        common.sendData(res, {});
    }
}
//材料收料
async function searchSubscribe(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
        let queryStr = `select s.*,p.supplier_name,subscribe_number*subscribe_price as subscribe_money,
            receive_done_number - consume_done_number as residue_done_number,
            consume_now_number*consume_now_price as consume_now_money
            from tbl_erc_projectsubscribe s 
            left join tbl_erc_supplier p on (s.supplier_id = p.supplier_id and p.state = 1)
            where s.state=1 and s.project_id=?`;
        replacements.push(doc.project_id);
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
//校验收料数量
async function checkReceiveDoneNumber(req,res){
    let doc = common.docTrim(req.body);
    let projectsubscribe = await tb_projectsubscribe.findOne({
        where:{
            projectsubscribe_id : doc.projectsubscribe_id
        }
    });
    if(projectsubscribe.subscribe_number - projectsubscribe.receive_done_number < doc.receive_now_number){
        common.sendError(res, 'projectsubscribe_02')
    }else{
        common.sendData(res, {});
    }
}
//增加收料单
async function addReceive(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user,replacements=[],consume_price=0;

        //收料单
        let receive_code = await Sequence.genReceiveID();
        let projectreceive = await tb_projectreceive.create({
            project_id:doc.project_id,
            receive_code:receive_code,
            receive_creator:user.user_id
        });

        for(let s of doc.receiveDetailItem){
            //收料单明细
            let projectreceivedetail = await tb_projectreceivedetail.create({
                projectreceive_id: projectreceive.projectreceive_id,//收料单ID
                projectsubscribe_id:s.projectsubscribe_id,//申购单物料 ID
                receivesupplier_name: s.supplier_name,//供货商ID
                receivedetail_number:s.receive_now_number,//本次收料数量
                receivedetail_price: s.subscribe_price//本次收料单价
            });


            let projectsubscribe = await tb_projectsubscribe.findOne({
                where:{
                    project_id:doc.project_id,
                    projectsubscribe_id:s.projectsubscribe_id
                }
            });
            projectsubscribe.receive_done_number = (projectsubscribe.receive_done_number - 0) + (s.receive_now_number - 0);
            projectsubscribe.save()
        }

        common.sendData(res, projectreceive);
    } catch (error) {
        throw error
    }
}
//材料耗用
async function checkConsumeDoneNumber(req,res){
    let doc = common.docTrim(req.body);
    let projectsubscribe = await tb_projectsubscribe.findOne({
        where:{
            projectsubscribe_id : doc.projectsubscribe_id
        }
    });
    if(projectsubscribe.receive_done_number - projectsubscribe.consume_done_number  < doc.consume_now_number){
        common.sendError(res, 'projectsubscribe_03')
    }else{
        common.sendData(res, {});
    }
}
async function modifySubscribeConsume(req,res){
    try {
        let doc = common.docTrim(req.body),user = req.user,consume_price=0,replacements=[];

        let projectsubscribe = await tb_projectsubscribe.findOne({
            where: {
                projectsubscribe_id: doc.old.projectsubscribe_id
            }
        });
        //计算物料耗用单单价=项目内所有收料单的本物料总金额/总收料数量
        let queryStr = `select sum(receivedetail_number * receivedetail_price) / sum(receivedetail_number) as consume_price 
                    from tbl_erc_projectreceivedetail d,tbl_erc_projectreceive r 
                    where d.state=1 and r.state=1 and d.projectreceive_id = r.projectreceive_id and r.project_id = ? and d.projectsubscribe_id = ?`;
        replacements.push(projectsubscribe.project_id);
        replacements.push(projectsubscribe.projectsubscribe_id);
        let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        if(result && result.length>0){
            consume_price = result[0].consume_price?result[0].consume_price:0;
            consume_price = consume_price.toFixed(2)
        }

        if (projectsubscribe) {
            projectsubscribe.consume_now_number = doc.new.consume_now_number;
            projectsubscribe.consume_now_price = consume_price;
            projectsubscribe.consume_creator = user.user_id;
            await projectsubscribe.save();
            projectsubscribe.dataValues.consume_now_money = projectsubscribe.consume_now_number * projectsubscribe.consume_now_price;

            common.sendData(res, projectsubscribe);
        } else {
            common.sendError(res, 'projectsubscribe_01')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}
//发布工程项目材料耗用审核任务
async function sendConumeTask(req,res) {
    try {
        let doc = common.docTrim(req.body), user = req.user;
        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where: {
                state: GLBConfig.ENABLE,
                taskallot_name: '工程项目材料耗用审核任务'
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
            return common.sendError(res, 'project_37');
        } else {
            let taskName = '工程项目材料耗用审核任务';
            let taskDescription = doc.project_name + '  工程项目材料耗用审核任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user, taskName, 62, taskallotuser.user_id, doc.project_id, taskDescription, '', groupId);
            if (!taskResult) {
                return common.sendError(res, 'task_01');
            } else {

                await tb_projectsubscribe.update({
                    consume_state: 1,
                }, {
                    where: {
                        project_id: doc.project_id
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
//修改工程项目材料耗用审核状态
async function modifyConsumeState(applyState,description,project_id,applyApprover){
    try {
        let consume_creator = '',replacements=[],consume_price=0;
        if(applyState==2){
            let projectsubcribe = await tb_projectsubscribe.findAll({
                where :{
                    state:GLBConfig.ENABLE,
                    project_id:project_id
                }
            });
            if(projectsubcribe){
                consume_creator = projectsubcribe[0].consume_creator
            }else{
                return common.sendError(res, 'projectsubscribe_01');
            }
            //耗用单
            let projectconsume = await tb_projectconsume.create({
                project_id:project_id,
                consume_code:await Sequence.genConsumeID(),
                consume_creator:consume_creator,
                consume_examine_time:new Date(),
                consume_examine:applyApprover,
                consume_refuse_remark:description
            });

            for(let s of projectsubcribe){
                if(s.consume_now_number>0){
                    //耗用单明细
                    let projectconsumedetail = await tb_projectconsumedetail.create({
                        projectconsume_id: projectconsume.projectconsume_id,//耗用单ID
                        projectsubscribe_id:s.projectsubscribe_id,//申购单物料ID
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
            await tb_projectsubscribe.update({
                consume_state:applyState,
                consume_examine_time:new Date(),
                consume_examine:applyApprover,
                consume_refuse_remark:description
            }, {
                where: {
                    project_id:project_id
                }
            });
        }
    } catch (error) {
        throw error
    }
}

//人工结算
async function modifyBudgetClearing(req,res){
    try {
        let doc = common.docTrim(req.body),user = req.user;

        let projectbudget = await tb_projectbudget.findOne({
            where: {
                projectbudget_id: doc.old.projectbudget_id
            }
        });

        if (projectbudget) {
            projectbudget.clearing_now_finishlimit = doc.new.clearing_now_finishlimit;
            projectbudget.clearing_estimate_money = doc.new.clearing_estimate_money;
            // if(projectbudget.clearing_reality_money==0){
            //     projectbudget.clearing_reality_money = projectbudget.budget_number * projectbudget.budget_manual_price * (doc.new.clearing_now_finishlimit/100).toFixed(2);
            // }else{
            projectbudget.clearing_reality_money = doc.new.clearing_reality_money;
            // }
            await projectbudget.save();
            common.sendData(res, projectbudget);
        } else {
            common.sendError(res, 'projectbudget_01')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}
//发布工程项目人工结算审核任务
async function sendClearingTask(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user;
        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'工程项目人工结算审核任务'
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
            return common.sendError(res, 'project_36');
        }else{
            let taskName = '工程项目人工结算审核任务';
            let taskDescription = doc.project_name + '  工程项目人工结算审核任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user,taskName,61,taskallotuser.user_id,doc.project_id,taskDescription,'',groupId);
            if(!taskResult){
                return common.sendError(res, 'task_01');
            }else {

                await tb_projectbudget.update({
                    clearing_state:1
                }, {
                    where: {
                        project_id:doc.project_id
                    }
                });

                common.sendData(res,taskResult);
            }
        }
    }catch (error){
        common.sendFault(res, error);
    }
}
//修改工程项目人工结算审核状态
async function modifyClearingState(applyState,description,project_id,applyApprover){
    try {
        if(applyState==2){
            let projectbudget = await tb_projectbudget.findAll({
                where:{
                    state:GLBConfig.ENABLE,
                    project_id:project_id
                }
            });

            for(let b of projectbudget){
                if(b.clearing_now_finishlimit !== 0){
                    b.clearing_last_finishlimit = b.clearing_now_finishlimit;
                }
                b.clearing_last_reality_money = b.clearing_reality_money;
                b.clearing_now_finishlimit = 0;
                b.clearing_estimate_money = 0;
                b.clearing_reality_money = 0;
                b.save();
            }

            await tb_projectbudget.update({
                clearing_state:0,
                clearing_examine:applyApprover,
                clearing_examine_time:new Date(),
                clearing_refuse_remark:description
            }, {
                where: {
                    state:GLBConfig.ENABLE,
                    project_id:project_id
                }
            });

        }else {
            await tb_projectbudget.update({
                clearing_state:applyState,
                clearing_examine:applyApprover,
                clearing_examine_time:new Date(),
                clearing_refuse_remark:description
            }, {
                where: {
                    state:GLBConfig.ENABLE,
                    project_id:project_id
                }
            });
        }


    } catch (error) {
        throw error
    }
}
//构建费用
async function getSumCostMoney(req,res){
    let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];
    let queryStr = `select sum(projectcost_invoice_money + projectcost_noinvoice_money) as total_cost_money 
        from tbl_erc_projectcost where state=1 and project_id=?`;
    replacements.push(doc.project_id);
    if (doc.search_text) {
        queryStr += ` and projectcost_name like ?  `;
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
//获取待摊资产构建费用
async function searchCost(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];

        let queryStr = `select * from tbl_erc_projectcost where state=1 and project_id=?`;
        replacements.push(doc.project_id);
        if (doc.search_text) {
            queryStr += ` and projectcost_name like ?  `;
            let search_text = `%${doc.search_text}%`;
            replacements.push(search_text);
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count
        returnData.rows = []
        returnData.total_projectcost_money = 0
        for (let ap of result.data) {
            let d = JSON.parse(JSON.stringify(ap))
            d.created_at = ap.created_at ? moment(ap.created_at).format("YYYY-MM-DD") : null;
            d.updated_at = ap.updated_at ? moment(ap.updated_at).format("YYYY-MM-DD") : null;
            returnData.total_projectcost_money += d.projectcost_money-0;
            returnData.rows.push(d)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//删除待摊资产构建费用信息
async function deleteCost(req,res){
    try {
        let doc = common.docTrim(req.body);
        let projectcost = await tb_projectcost.findOne({
            where: {
                projectcost_id: doc.projectcost_id
            }
        });
        if (projectcost) {
            projectcost.state = GLBConfig.DISABLE;
            await projectcost.save();
        } else {
            common.sendError(res, 'projectcost_01');
            return
        }
        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//新增待摊资产构建费用
async function addCost(req,res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;


        let projectcost = await tb_projectcost.create({
            project_id: doc.project_id,
            projectcost_name: doc.projectcost_name,
            projectcost_money: Number((doc.projectcost_invoice_money-0) + (doc.projectcost_noinvoice_money-0)).toFixed(2),
            projectcost_invoice_money:Number(doc.projectcost_invoice_money).toFixed(2),
            projectcost_noinvoice_money: Number(doc.projectcost_noinvoice_money).toFixed(2),
            projectcost_state:0
        });
        common.sendData(res, projectcost);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//修改待摊资产构建费用
async function modifyCost(req,res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let projectcost = await tb_projectcost.findOne({
            where: {
                projectcost_id: doc.old.projectcost_id
            }
        });

        if (projectcost) {
            projectcost.projectcost_name = doc.new.projectcost_name;
            projectcost.projectcost_money = Number((doc.new.projectcost_invoice_money-0) + (doc.new.projectcost_noinvoice_money-0)).toFixed(2);
            projectcost.projectcost_invoice_money = Number(doc.new.projectcost_invoice_money).toFixed(2);
            projectcost.projectcost_noinvoice_money = Number(doc.new.projectcost_noinvoice_money).toFixed(2);
            await projectcost.save();
            common.sendData(res, projectcost);
        } else {
            common.sendError(res, 'projectcost_01')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}
//发布工程项目构建费用审核任务
async function sendCostTask(req,res){
    try{
        let doc = common.docTrim(req.body), user = req.user;
        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'工程项目构建费用审核任务'
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
            return common.sendError(res, 'project_38');
        }else{
            let taskName = '工程项目构建费用审核任务';
            let taskDescription = doc.project_name + '  工程项目构建费用审核任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user,taskName,63,taskallotuser.user_id,doc.project_id,taskDescription,'',groupId);
            if(!taskResult){
                return common.sendError(res, 'task_01');
            }else {
                await tb_projectcost.update({
                    projectcost_state:1
                }, {
                    where: {
                        project_id:doc.project_id
                    }
                });
                common.sendData(res,taskResult);
            }
        }
    }catch (error){
        common.sendFault(res, error);
    }
}

//修改工程项目构建费用审核状态
async function modifyCostState(applyState,description,project_id,applyApprover){
    try{
        await tb_projectcost.update({
            projectcost_state:applyState,
            projectcost_examine_time:new Date(),
            projectcost_examine:applyApprover,
            projectcost_refuse_remark:description
        }, {
            where: {
                project_id:project_id
            }
        });
    }catch (error){
        throw error
    }
}
//验收移交
async function searchCheck(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[]
        let queryStr,result;
        returnData.totalClearingLastRealityMoney = 0;    //人工决算
        returnData.totalConsumeMoney = 0;   //材料决算
        returnData.totalProjectCostMoney = 0;              //其他费用
        returnData.totalMoney = 0;               //费用合计
        returnData.projectCheckState

        replacements.push(doc.project_id);
        queryStr = `select sum(clearing_last_reality_money) as total_clearing_last_reality_money 
            from tbl_erc_projectbudget where state=1 and budget_state = 2 and project_id = ?`;
        result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        if(result && result.length>0){
            returnData.totalClearingLastRealityMoney = result[0].total_clearing_last_reality_money?result[0].total_clearing_last_reality_money:0;
            returnData.totalClearingLastRealityMoney = Number(returnData.totalClearingLastRealityMoney).toFixed(2)
        }

        queryStr = `select sum(consumedetail_number*consumedetail_price) as total_consume_money 
            from tbl_erc_projectconsumedetail d,tbl_erc_projectconsume c
             where d.state=1 and c.state=1 and d.projectconsume_id = c.projectconsume_id and 
             c.project_id = ?`;
        result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        if(result && result.length>0){
            returnData.totalConsumeMoney = result[0].total_consume_money?result[0].total_consume_money:0;
            returnData.totalConsumeMoney = Number(returnData.totalConsumeMoney).toFixed(2)
        }

        queryStr=`select sum(projectcost_money) as total_projectcost_money from tbl_erc_projectcost where state=1 and project_id = ?`;
        result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        if(result && result.length>0){
            returnData.totalProjectCostMoney = result[0].total_projectcost_money?result[0].total_projectcost_money:0;
            returnData.totalProjectCostMoney = Number(returnData.totalProjectCostMoney).toFixed(2)
        }

        returnData.totalMoney = Number(returnData.totalClearingLastRealityMoney) + Number(returnData.totalConsumeMoney) + Number(returnData.totalProjectCostMoney);

        queryStr=`select project_check_state from tbl_erc_project where state=1 and project_id=?`;
        result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        if(result && result.length>0){
            returnData.projectCheckState = result[0].project_check_state;
        }

        queryStr=`select subscribe_name,subscribe_format,subscribe_unit,
            sum(receive_done_number - consume_done_number) as surplus_number,
            ROUND(d.receive_price,2) as surplus_price,ROUND(receive_price*sum(receive_done_number - consume_done_number),2) as surplus_money
            from tbl_erc_projectsubscribe s 
            left join (select projectsubscribe_id, sum(receivedetail_number * receivedetail_price)/sum(receivedetail_number) as receive_price  
                from  tbl_erc_projectreceivedetail 
                where state=1 
                group by projectsubscribe_id) as d 
                on s.projectsubscribe_id = d.projectsubscribe_id 
            where s.state=1 and s.project_id = ?  `;

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
//发布工程项目提交验收审核任务
async function sendCheckTask(req,res){
    try{
        let doc = common.docTrim(req.body), user = req.user;
        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'工程项目提交验收审核任务'
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
            return common.sendError(res, 'project_42');
        }else{
            let taskName = '工程项目提交验收审核任务';
            let taskDescription = doc.project_name + '  工程项目提交验收审核任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user,taskName,64,taskallotuser.user_id,doc.project_id,taskDescription,'',groupId);
            if(!taskResult){
                return common.sendError(res, 'task_01');
            }else {
                await tb_project.update({
                    project_check_state:1
                }, {
                    where: {
                        project_id:doc.project_id
                    }
                });
                common.sendData(res,taskResult);
            }
        }
    }catch (error){
        common.sendFault(res, error);
    }
}
//修改工程项目提交验收审核状态
async function modifyCheckState(applyState,description,project_id,applyApprover){
    try{
        await tb_project.update({
            project_check_state:applyState,
            project_acceptor_time:new Date(),
            project_acceptor:applyApprover,
            project_check_refuse_remark:description
        }, {
            where: {
                project_id:project_id
            }
        });
    }catch (error){
        throw error
    }
}

//修改工程项目审核状态
async function modifyProjectState(applyState,description,project_id,applyApprover){
    try{
        await tb_project.update({
            project_state:applyState
        }, {
            where: {
                project_id:project_id
            }
        });
    }catch (error){
        throw error
    }
}

//按订单获取待摊资产材料申购信息
async function getProjectIdByProjectsubscribeorderId(req,res){
    try {
        let doc = common.docTrim(req.body),replacements=[];
        let queryStr,result;

        queryStr = `select project_id from tbl_erc_projectsubscribeorder
            where state=1 and projectsubscribeorder_id=?`;
        replacements.push(doc.projectsubscribeorder_id);
        result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}
exports.initAct = initAct;
exports.searchAct = searchAct;
exports.searchDetailAct = searchDetailAct;
exports.searchSpaceDetailAct = searchSpaceDetailAct;
exports.modifySpaceAct = modifySpaceAct;
exports.reviewProjectlTask = reviewProjectlTask;
exports.calculateTotalPrice = calculateTotalPrice;

exports.modifySubscribeState = modifySubscribeState;
exports.modifyConsumeState = modifyConsumeState;
exports.modifyCostState = modifyCostState;
exports.modifyClearingState = modifyClearingState;
exports.modifyCheckState = modifyCheckState;
exports.modifyProjectState = modifyProjectState;
exports.modifyBudgetState = modifyBudgetState;
