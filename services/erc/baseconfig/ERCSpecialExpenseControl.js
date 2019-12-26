/**
 * Created by Cici on 2018/4/26.
 */
/**
 * 资金支出管理
 */
const fs = require('fs');
const moment = require('moment');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCTransReceptionSRV');
const model = require('../../../model');
const task = require('./ERCTaskListControlSRV');

// tables
const sequelize = model.sequelize;
const tb_specialexpense = model.erc_specialexpense;
const tb_uploadfile = model.erc_uploadfile;
const tb_paymentconfirm = model.erc_paymentconfirm;

const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;
exports.ERCSpecialExpenseSRV = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'update') {
        updateAct(req, res)
    } else if (method === 'remove') {
        removeAct(req, res)
    } else if (method === 'removeFile') {
        removeFileAct(req, res);
    }  else if (method === 'upload') {
        uploadAct(req, res)
    } else if(method ==='setTask'){
        setTask(req, res);
    }else {
        common.sendError(res, 'common_01')
    }
}

let initAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};

        returnData.S_EXPENSE_TYPE = GLBConfig.S_EXPENSE_TYPE;
        returnData.CHANGESTATE = GLBConfig.CHANGESTATE;
        returnData.CAPITALCOSTTYLE = GLBConfig.CAPITALCOSTTYLE;
        returnData.payment_confirm_state = GLBConfig.PAYMENTCONFIRMSTATE;
        returnData.PAYMENTMETHOD = GLBConfig.PAYMENTMETHOD;
        returnData.MONETARYFUNDTYPE = await getMonetaryFundType(req,res)
        returnData.FYBXTYPE = await getFYBXType(req,res)
        common.sendData(res, returnData);
    } catch (error) {
        logger.error('ERCSpecialeExpenseSRV-initAct:' + error);
        common.sendFault(res, error);
    }
}

let getMonetaryFundType = async (req,res)=>{
    try {
        let returnData = [];

        let queryStr = "select d.* from tbl_erc_basetypedetail d,tbl_erc_basetype t" +
            " where d.basetype_id=t.basetype_id and t.basetype_code='HBZJLX'";
        let result = await sequelize.query(queryStr, {replacements: [], type: sequelize.QueryTypes.SELECT});
        for (let i of result) {
            returnData.push({
                id: i.basetypedetail_id,
                value: i.typedetail_name,
                text: i.typedetail_name
            })
        }

        return returnData
    } catch (error) {
        throw error

    }
}
let getFYBXType = async (req,res)=>{
    try {
        let returnData = [];

        let queryStr = "select d.* from tbl_erc_basetypedetail d,tbl_erc_basetype t" +
            " where d.basetype_id=t.basetype_id and t.basetype_code='FYLKMMXXM' and d.domain_id=?";
            replacements=[req.user.domain_id]
        let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        for (let i of result) {
            returnData.push({
                id: i.basetypedetail_id,
                value: i.typedetail_name,
                text: i.typedetail_name
            })
        }

        return returnData
    } catch (error) {
        throw error

    }
}
//获取资金支出管理列表
let searchAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body), returnData = {};
        let user =req.user;

        let query = 'select b.*,p.paymentconfirm_state,d.basetypedetail_id,d.typedetail_name from tbl_erc_specialexpense b   ' +
            'left join tbl_common_domain a on a.domain_id = b.domain_id ' +
            'left join tbl_erc_paymentconfirm p on (b.s_expense_code = p.paymentconfirm_source_code and p.state=1) ' +
            'left join tbl_erc_basetypedetail d on (b.monetary_fund_type = d.basetypedetail_id and d.state=1)' +
            'where b.domain_id = ? and b.state=?';

        let replacement = [user.domain_id, GLBConfig.ENABLE];
        if (doc.s_expense_type_id) {
            query += 'and b.s_expense_type_id = ?';
            replacement.push(doc.s_expense_type_id);
        }
        if (doc.s_expense_code) {
            query += 'and b.s_expense_code = ?';
            replacement.push(doc.s_expense_code);
        }else {
            query += 'and b.s_expense_creator_id = ?';
            replacement.push(user.user_id);
        }
        if (doc.search_text) {
            query += ' and ( b.s_expense_code like ? or b.s_expense_creator_name like ? )'
            let search_text = '%' + doc.search_text + "%";
            replacement.push(search_text);
            replacement.push(search_text);
        }

        let result = await common.queryWithCount(sequelize, req, query, replacement);

        returnData.total = result.count;
        returnData.rows = [];

        let api_name = common.getApiName(req.path);
        for (let i of result.data) {
            let row = JSON.parse(JSON.stringify(i));
            if(!row.paymentconfirm_state){
                row.paymentconfirm_state = 1
            }
            row.files = [];
            let f = await tb_uploadfile.findAll({
                where:{
                    api_name: api_name,
                    order_id: row.s_expense_id,
                    srv_id: row.s_expense_id,
                    srv_type:row.s_expense_id,
                    state: GLBConfig.ENABLE
                }
            })
            if (f.length > 0) {
                row.files = f;
            }
            row.created_at = i.created_at ? moment(i.created_at).format('YYYY-MM-DD HH:mm') : null;
            row.s_expense_confirm_time = i.s_expense_confirm_time ? moment(i.s_expense_confirm_time).format('YYYY-MM-DD HH:mm') : null;
            returnData.rows.push(row);
        }

        common.sendData(res, returnData);
    } catch (error) {
        logger.error('ERCSpecialeExpenseSRV-searchAct:' + error);
        common.sendFault(res, error);
    }
}

//新增资金支出管理
let addAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user

        let sExpenseCode = await Sequence.genSpecialExpenseID();
        let s_expense = await tb_specialexpense.create({
            domain_id:user.domain_id,
            s_expense_code: sExpenseCode,
            s_expense_creator_id: user.user_id,
            s_expense_creator_name: user.name,
            s_expense_state: GLBConfig.CHANGESTATE[0].value,
            s_expense_type_id: doc.s_expense_type_id,
            s_sum_fee: doc.s_sum_fee,
            s_no_invoice_fee: doc.s_no_invoice_fee,
            s_have_invoice_fee: doc.s_have_invoice_fee,
            s_expense_description: doc.s_expense_description,
            s_capital_cost_type: doc.s_capital_cost_type,
            payment_method:doc.payment_method,
            monetary_fund_type:doc.monetary_fund_type,
            bank_account:doc.bank_account
        })

        //修改附件
        if(s_expense){
            let api_name = common.getApiName(req.path)
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
                        srv_id: s_expense.s_expense_id,
                        srv_type: s_expense.s_expense_id,
                        order_id: s_expense.s_expense_id,
                        file_creator: user.name,
                        user_id: user.user_id
                    });
                }
            }

            s_expense.dataValues.files = []
            let ufs = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
                    order_id: s_expense.s_expense_id,
                    srv_id: s_expense.s_expense_id,
                    srv_type: s_expense.s_expense_id,
                    state: GLBConfig.ENABLE
                }
            })

            if(ufs.length>0){
                s_expense.dataValues.files=ufs;
            }

            common.sendData(res, s_expense);
        }

    } catch (error) {
        logger.error('ERCSpecialeExpenseSRV-addAct:' + error);
        common.sendFault(res, error);
    }
}

//修改资金支出信息
let updateAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),user=req.user;

        let expense = await tb_specialexpense.findOne({
            where: {
                s_expense_id: doc.s_expense_id,
                state: GLBConfig.ENABLE
            }
        });

        if (expense) {
            expense.s_expense_type_id = doc.s_expense_type_id;
            expense.s_sum_fee = doc.s_sum_fee;
            expense.s_no_invoice_fee = doc.s_no_invoice_fee;
            expense.s_no_invoice_fee = doc.s_no_invoice_fee;
            expense.s_have_invoice_fee = doc.s_have_invoice_fee;
            expense.s_expense_description = doc.s_expense_description;
            expense.s_capital_cost_type = doc.s_capital_cost_type;
            expense.payment_method = doc.payment_method;
            expense.monetary_fund_type = doc.monetary_fund_type;
            expense.bank_account = doc.bank_account;

            await expense.save();

            //修改附件
            let api_name = common.getApiName(req.path)
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
                        srv_id: doc.s_expense_id,
                        srv_type: doc.s_expense_id,
                        order_id: doc.s_expense_id,
                        file_creator: user.name,
                        user_id: user.user_id
                    });
                }
            }

            expense.dataValues.files = []
            let ufs = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
                    order_id: expense.s_expense_id,
                    srv_id: expense.s_expense_id,
                    srv_type: expense.s_expense_id,
                    state: GLBConfig.ENABLE
                }
            })

            if(ufs.length>0){
                expense.dataValues.files=ufs;
            }

            common.sendData(res, expense);
        } else {
            common.sendError(res, 'trafficApply_01');
            return
        }

    } catch (error) {
        logger.error('ERCSpecialeExpenseSRV-addAct:' + error);
        common.sendFault(res, error);
    }
};

//删除资金支出信息
let removeAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let expense = await tb_specialexpense.findOne({
            where: {
                s_expense_id: doc.s_expense_id
            }
        });
        if (expense) {
            expense.state = GLBConfig.DISABLE;
            await expense.save();
            common.sendData(res, expense);
        } else {
            common.sendData(res, 'trafficApply_01');
        }

    } catch (error) {
        logger.error('ERCSpecialeExpenseSRV-removeAct:' + error);
        common.sendFault(res, error);
    }
};

//上传附件
let uploadAct = async (req, res) => {
    try {
        let fileInfo = await common.fileSave(req)
        common.sendData(res, fileInfo)
    } catch (error) {
        common.sendFault(res, error)
    }
};

let removeFileAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);

        let uploadfiles = await tb_uploadfile.findAll({
            where: {
                file_id: doc.file_id,
                state: GLBConfig.ENABLE
            }
        });
        for (let file of uploadfiles) {
            file.state = GLBConfig.DISABLE
            await file.save();
        }

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//创建任务
async function setTask(req,res){
    try{// user, taskName, taskType  4, taskPerformer, taskReviewCode, taskDescription
        let user=req.user;
        let doc = req.body;
        // 申请状态 0待提交，1已提交，2通过,3拒绝

        let expense = await tb_specialexpense.findOne({
            where:{
                state:GLBConfig.ENABLE,
                s_expense_code:doc.s_expense_code
            }
        });
        let taskName = '资金支出管理申请';
        let taskDescription ='  资金支出管理申请:' + doc.s_expense_code;
        let groupId = common.getUUIDByTime(30);
        // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
        let taskResult = await task.createTask(user,taskName,28,'',doc.s_expense_code,taskDescription,'',groupId);
        if(!taskResult){
            return common.sendError(res, 'task_02');
        }else{
            //更改申请状态
            if(expense){
                expense.s_expense_state='1';
                await expense.save()
            }
            common.sendData(res, {})
        }
    }catch (error){
        common.sendFault(res, error);
    }
}

//审核
async function modifySpecialEpenseState(applyState,description,sExpenseCode,applyApprover,applyDomain_id,user,taskallotuser){
    let NowDoMainId = applyDomain_id;

    await tb_specialexpense.update({
        s_expense_state:applyState,
        s_expense_confirm_time:new Date(),
        s_expense_confirm_id:applyApprover,
        s_expense_rejected_description:description
    }, {
        where: {
            s_expense_code:sExpenseCode
        }
    });

    //通过后生成付款确认记录
    if(applyState == 2){
        let specialexpense = await tb_specialexpense.findOne({
            where:{
                state:GLBConfig.ENABLE,
                s_expense_code:sExpenseCode
            }
        });

        let paymentconfirm = await tb_paymentconfirm.create({
            domain_id:specialexpense.domain_id,
            paymentconfirm_name: 1,
            paymentconfirm_source_code:sExpenseCode,
            paymentconfirm_money: specialexpense.s_sum_fee,
            paymentconfirm_no_invoice_fee: specialexpense.s_no_invoice_fee,
            paymentconfirm_have_invoice_fee: specialexpense.s_have_invoice_fee,
            paymentconfirm_expend_user: specialexpense.s_expense_creator_id,
            paymentconfirm_declarant: specialexpense.s_expense_creator_id,
            paymentconfirm_declarant_time: specialexpense.created_at,
            paymentconfirm_state:1,
            s_expense_type_id:specialexpense.s_expense_type_id
        })

        let taskName = '付款确认：资金支出' ;
        let taskDescription =  '付款确认  资金支出';
        let groupId = common.getUUIDByTime(30);
        let taskResult = await task.createTask(user,taskName,46,taskallotuser.user_id,paymentconfirm.paymentconfirm_id,taskDescription,'',groupId);
        if(!taskResult){
            throw new Error(task_01);
        }

    }
}

exports.modifySpecialEpenseState=modifySpecialEpenseState;