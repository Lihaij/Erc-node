
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCStcokInApplyControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const moment = require('moment');
const task = require('../baseconfig/ERCTaskListControlSRV');

const sequelize = model.sequelize;
const tb_user = model.common_user;
const tb_stockapply = model.erc_stockapply;
const tb_suppliermateriel = model.erc_suppliermateriel;
const tb_stockapplyitem = model.erc_stockapplyitem;
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;

exports.ERCStcokInApplyControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'add') {
        addAct(req, res);
    } else if (method === 'modify') {
        modifyAct(req, res);
    } else if (method === 'delete') {
        deleteAct(req, res);
    } else if (method==='getStockApply') {
        getStockApplyAct(req, res)
    } else if (method==='deleteStockApplyDetail'){
        deleteStockApplyDetailAct(req,res)
    } else if (method==='getStockApplyDetail'){
        getStockApplyDetailAct(req,res)
    } else if (method==='getStockMateriel'){
        getStockMaterielAct(req,res)
    } else if (method==='addStockApplyDetail'){
        addStockApplyDetailAct(req,res)
    } else if (method==='setTask'){
        setTaskAct(req,res)
    } else {
        common.sendError(res, 'common_01')
    }
};
//初始化数据
async function initAct(req, res) {
    try {
        let returnData = {},user=req.user;
        await FDomain.getDomainListInit(req, returnData);
        returnData.unitInfo = await global.getBaseTypeInfo(user.domain_id, 'JLDW');//单位
        returnData.materielStateManagement = GLBConfig.MATERIELSTATEMANAGEMENT;
        returnData.mateUseState = GLBConfig.MATEUSESTATE;//单位
        returnData.materielSource = GLBConfig.MATERIELSOURCE;//物料来源
        returnData.materielManage = GLBConfig.MATERIELMANAGE;//管理模式
        returnData.materielSourceKind = GLBConfig.MATERIELSOURCEKIND;//来源分类
        returnData.purchaseApplyType = GLBConfig.STOCKORDERSTATE;//入库单状态

        returnData.user = await tb_user.findAll({
            where:{
                state: GLBConfig.ENABLE,
                domain_id:user.domain_id
            },
            attributes: [['user_id', 'id'], ['name', 'text']]
        });

        common.sendData(res, returnData)
    }catch (error) {
        common.sendFault(res, error);
    }
}
//入库申请列表
async function searchAct(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user,replacements=[],returnData={};
        let queryStr=`select s.stockapply_id,s.apply_state,s.apply_review_date,s.apply_remark,s.apply_materiel_remark,s.created_at,
             ap.name as apply_submit,av.name as apply_review 
             from tbl_erc_stockapply s 
             left join tbl_common_user ap on (s.apply_submit=ap.user_id and ap.state=1) 
             left join tbl_common_user av on (s.apply_review=av.user_id and av.state=1) 
             where s.state=1 and s.domain_id=? `;
        replacements.push(user.domain_id);
        if(doc.apply_state){
            queryStr+=' and s.apply_state=?';
            replacements.push(doc.apply_state)
        }
        if(doc.search_text){
            queryStr+=' and stockapply_id like ?';
            replacements.push('%'+doc.search_text+'%');
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for(let r of result.data){
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at.Format("yyyy-MM-dd");
            result.apply_review_date = (r.apply_review_date)?r.apply_review_date.Format("yyyy-MM-dd"):'';
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    }catch (error) {
        common.sendFault(res, error);
        return
    }
}
//创建入库申请
async function addAct(req,res){
    let doc = common.docTrim(req.body),user = req.user;

    try {
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'入库申请'
            }
        });

        let taskallotuser = await tb_taskallotuser.findOne({
            where:{
                state:GLBConfig.ENABLE,
                domain_id: user.domain_id,
                taskallot_id:taskallot.taskallot_id
            }
        });

        if (taskallotuser) {
            let applyID = await Sequence.genApplyID(user.domain_id);
            let create = await tb_stockapply.create({
                stockapply_id: applyID,
                domain_id:user.domain_id,
                apply_state: 1,
                apply_review: doc.apply_review,
                apply_submit:user.user_id,
                apply_type: 1//入库
            });
            common.sendData(res, create);
        } else {
            common.sendError(res, 'task_02');
        }
    }catch (error) {
        common.sendFault(res, error);
    }
}
//修改入库申请
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user
        let stockapplyitem = await tb_stockapplyitem.findOne({
            where: {
                stockapplyitem_id: doc.new.stockapplyitem_id,
                materiel_id: doc.new.materiel_id
            }
        })
        let stockapply = await tb_stockapply.findOne({
            where: {
                stockapply_id: stockapplyitem.stockapply_id
            }
        })
        if (stockapply.apply_state == '0' || stockapply.apply_state == '2') {
            if (stockapplyitem) {
                stockapplyitem.apply_amount = doc.new.apply_amount;
                stockapplyitem.apply_price = doc.new.apply_price;
                stockapplyitem.stock_remarks = doc.new.stock_remarks;
                await stockapplyitem.save();
            }
        } else {
            doc.new.apply_amount = stockapplyitem.apply_amount;
            doc.new.apply_price = stockapplyitem.apply_price;
            doc.new.stock_remarks = stockapplyitem.stock_remarks;
        }
        common.sendData(res, stockapplyitem)
    } catch (error) {
        common.sendFault(res, error)
    }
}
//删除
async function deleteAct(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        let stockapply = await tb_stockapply.findOne({
            where: {
                stockapply_id:doc.stockapply_id
            }
        });
        if (stockapply) {
            stockapply.state =  GLBConfig.DISABLE;
            await stockapply.save()
        } else {
            return common.sendError(res, 'puchase_apply_03');
        }
        common.sendData(res, stockapply);

    } catch (error) {
        return common.sendFault(res, error);
    }
}
//获取申请列表
async function getStockApplyAct(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user,replacements=[],returnData=[];
        let queryStr=`select s.stockapply_id,s.apply_state,s.apply_review_date,s.created_at,
             ap.username as apply_submit,av.username as apply_review
             from tbl_erc_stockapply s
             left join tbl_common_user ap on (s.apply_submit=ap.user_id and ap.state=1)
             left join tbl_common_user av on (s.apply_review=av.user_id and av.state=1)
             where s.state=1 `;
        if(doc.stockapply_id){
            queryStr+=' and s.stockapply_id=?';
            replacements.push(doc.stockapply_id)
        }

        let result =  await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        for(let r of result){
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at.Format("yyyy-MM-dd");
            result.apply_review_date = (r.apply_review_date)?r.apply_review_date.Format("yyyy-MM-dd"):'';
            returnData.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }

}
//删除申请详情
async function deleteStockApplyDetailAct(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        let stockapplyitem = await tb_stockapplyitem.findOne({
            where: {
                stockapplyitem_id:doc.stockapplyitem_id
            }
        });
        if (stockapplyitem) {
            stockapplyitem.state =  GLBConfig.DISABLE;
            await stockapplyitem.save()
        } else {
            common.sendError(res, 'puchase_apply_03');
            return
        }
        common.sendData(res, stockapplyitem);

    } catch (error) {
        return common.sendFault(res, error);
    }
}
//获取申请详情列表
async function getStockApplyDetailAct(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, replacements = [], returnData = {};

        let queryStr =
            `select
                m.*, si.apply_amount, si.apply_price, si.stockapplyitem_id, si.stock_remarks
                from tbl_erc_stockapplyitem si
                left join tbl_erc_materiel m
                on (si.materiel_id = m.materiel_id)
                where m.state=1 and si.state=1 `;
        if (doc.stockapply_id) {
            queryStr += ' and si.stockapply_id=?';
            replacements.push(doc.stockapply_id);
        }
        if (doc.search_text) {
            queryStr += ' and (m.materiel_code like ? or m.materiel_name like ?)';
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        // for(let r of result.data){
        //     let result = JSON.parse(JSON.stringify(r));
        // result.created_at = r.created_at.Format("yyyy-MM-dd");
        // result.delivery_time = (r.delivery_time)?r.delivery_time.Format("yyyy-MM-dd"):'';
        //     returnData.rows.push(result)
        // }
        common.sendData(res, returnData);
    }catch (error){
        common.sendFault(res, error);
        return;
    }
}
//物料列表
async function getStockMaterielAct(req,res){
    try {
        const { body, user } = req;
        const { matNameOrCodeOrFormat } = body;
        const { domain_id } = user;
        const returnData = {};

        let queryStr =
            `select
                mat.*, "" as stock_remarks, 0 as apply_amount, 0 as apply_price
                from tbl_erc_materiel mat
                where mat.state = 1 and mat.domain_id = ?`;

        const replacements = [ domain_id ];

        if (matNameOrCodeOrFormat) {
            queryStr += ' and (mat.materiel_code like ? or mat.materiel_name like ?)';
            replacements.push('%' + matNameOrCodeOrFormat + '%');
            replacements.push('%' + matNameOrCodeOrFormat + '%');
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    }catch (error){
        common.sendFault(res, error);
    }
}
//添加入库申请明细
async function addStockApplyDetailAct(req,res){
    try {
        let doc = common.docTrim(req.body);

        for(let d of doc){

            let stockapplyitem = await tb_stockapplyitem.findOne({
                where: {
                    stockapply_id: d.stockapply_id,
                    materiel_id: d.materiel_id,
                    state: 1
                }
            });
            if (stockapplyitem) {
                stockapplyitem.apply_amount = Number(stockapplyitem.apply_amount)+Number(d.apply_amount)
                await stockapplyitem.save()
            } else {
                let addStockApplyDetailAct = await tb_stockapplyitem.create({
                    stockapply_id: d.stockapply_id,
                    materiel_id:d.materiel_id,
                    apply_amount:d.apply_amount,
                    apply_price:d.apply_price,
                    stock_operate_amount:0,
                    remain_number:null,
                    warehouse_id:null,
                    warehouse_zone_id:null,
                    stock_remarks:d.stock_remarks
                });
            }

        }
        common.sendData(res, addStockApplyDetailAct);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//处理申请任务
async function setTaskAct(req,res){
    try{// user, taskName, taskType  4, taskPerformer, taskReviewCode, taskDescription
        let user=req.user;
        let doc = common.docTrim(req.body);
        // 申请状态 0待提交，1已提交，2通过,3拒绝

        let stockapply = await tb_stockapply.findOne({
            where:{
                state:GLBConfig.ENABLE,
                stockapply_id:doc.stockapply_id
            }
        });
        let stockapplyitem = await tb_stockapplyitem.findAll({
            where:{
                state:GLBConfig.ENABLE,
                stockapply_id:doc.stockapply_id
            }
        });
        let taskName = '入库申请';
        let taskDescription = doc.stockapply_id + '  入库申请';
        let groupId = common.getUUIDByTime(30);
        // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
        let taskResult = await task.createTask(user,taskName,10,'',doc.stockapply_id,taskDescription,'',groupId);
        if(!taskResult){
            return common.sendError(res, 'task_02');
        }else{
            if(stockapply.apply_state == 1){
                let remark=''
                let re=/^;.*;$/
                for (let d of stockapplyitem) {
                    remark+=d.stock_remarks+';'
                }
                if (re.test(remark)) {
                    remark = ''
                } else {
                    remark=(remark.slice(remark.length-1)==';')?remark.slice(0,-1):remark;
                }
                stockapply.apply_materiel_remark = stockapply.apply_materiel_remark + remark
                await stockapply.save()
            } else if (stockapply.apply_state == 2) {
                stockapply.apply_state = 1;
                stockapply.apply_materiel_remark = '';
                let remark=''
                let re=/^;.*;$/
                for (let d of stockapplyitem) {
                    remark+=d.stock_remarks+';'
                }
                if (re.test(remark)) {
                    remark = ''
                } else {
                    remark=(remark.slice(remark.length-1)==';')?remark.slice(0,-1):remark;
                }
                remark=(remark.slice(remark.length-1)==';')?remark.slice(0,-1):remark;
                stockapply.apply_materiel_remark = stockapply.apply_materiel_remark + remark

                await stockapply.save()
            }
            common.sendData(res, {})
        }

    }catch (error){
        common.sendFault(res, error);
    }
}
