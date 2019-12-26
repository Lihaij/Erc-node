/**
 * Created by Cici on 2018/4/20.
 */
/**
 * 交通接待申请报销详情
 * **/

const fs = require('fs');
const moment = require('moment');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCTransReceptionSRV');
const model = require('../../../model');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const task = require('./ERCTaskListControlSRV');

//tables
const sequelize = model.sequelize;
const tb_trafficreceptionexpense = model.erc_trafficreceptionexpense;
const tb_trafficreceptionexpensedetail = model.erc_trafficreceptionexpensedetail;
const tb_uploadfile = model.erc_uploadfile;
const tb_paymentconfirm = model.erc_paymentconfirm;
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;
exports.ERCTransReceptionExpenseDetailResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'modify') {
        modifyAct(req, res);
    } else if (method === 'uploadFile') {
        uploadFileAct(req, res);
    } else if (method === 'removeFile') {
        removeFileAct(req, res);
    }  else if (method === 'upload') {
        uploadAct(req, res)
    } else if (method === 'setTask'){
        setTask(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
}

let initAct = async (req, res) => {
    try {
        var doc = common.docTrim(req.body), user = req.user, returnData = {};

        if (!doc.trExpenseCode) {
            common.sendError(res, 'trafficApply_01');
            return
        }

        let queryStr = 'select a.*,c.name as tr_expense_confirm_name from tbl_erc_trafficreceptionexpense a ' +
                'left join tbl_common_domain b on b.domain_id=a.domain_id ' +
                'left join tbl_common_user c on a.tr_expense_confirm_id=c.user_id ' +
                'where a.tr_expense_code = ? and a.state = ?';

        let replacement = [doc.trExpenseCode, GLBConfig.ENABLE];

        let result = await common.simpleSelect(sequelize, queryStr, replacement);

        returnData.expense_data = [];
        for (let i of result) {
            let temy = JSON.parse(JSON.stringify(i));
            temy.tr_expense_start_time = i.tr_expense_start_time ? moment(i.tr_expense_start_time).format('YYYY-MM-DD') : null;
            temy.tr_expense_end_time = i.tr_expense_end_time ? moment(i.tr_expense_end_time).format('YYYY-MM-DD') : null;
            temy.created_at = i.created_at ? moment(i.created_at).format('YYYY-MM-DD HH:mm') : null;
            temy.tr_expense_confirm_time = i.tr_expense_confirm_time ? moment(i.tr_expense_confirm_time).format('YYYY-MM-DD HH:mm') : null;
            returnData.expense_data.push(temy);
        }

        returnData.TR_EXPENSE_TYPE = GLBConfig.TR_EXPENSE_TYPE;
        returnData.CHANGESTATE = GLBConfig.PURCHASEAPPLYSTATE;

        common.sendData(res, returnData)

    } catch (error) {
        logger.error('ERCTransReceptionExpenseDetailResource-searchAct-error:' + error);
        common.sendFault(res, error)
    }
};
//获取交通接待申请报销详情信息
let searchAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};
        let api_name = await common.getApiName(req.path);

        if (!doc.trExpenseCode) {
            common.sendError(res, 'trafficApply_01');
            return
        }
        let queryStr = 'select * from tbl_erc_trafficreceptionexpensedetail' +
            ' where tr_expense_list_code = ? and domain_id = ? and state = ? ';

        let replacement = [doc.trExpenseCode, user.domain_id, GLBConfig.ENABLE];
        let result = await common.queryWithCount(sequelize, req, queryStr, replacement);

        returnData.total = result.count;
        returnData.rows = [];

        for (let i of result.data) {
            let row = JSON.parse(JSON.stringify(i));
            row.files = [];
            let f = await tb_uploadfile.findAll({
                where:{
                    api_name: api_name,
                    order_id: row.tr_detail_id,
                    srv_id: row.tr_detail_id,
                    srv_type:row.tr_detail_fee_id,
                    state: GLBConfig.ENABLE
                }
            })
            if (f.length > 0) {
                row.files = f;
            }
            returnData.rows.push(row);
        }

        common.sendData(res, returnData);

    } catch (error) {
        logger.error('ERCTransReceptionExpenseDetailResource-searchAct-error:' + error);
        common.sendFault(res, error)
    }
}

//修改交通接待申请报销详情
let modifyAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = [];

        let expense = await tb_trafficreceptionexpensedetail.findOne({
            where: {
                tr_detail_id: doc.old.tr_detail_id
            }
        })
        if (Number(doc.new.tr_detail_expected_fee) >= Number(doc.new.tr_detail_no_invoice_fee) + Number(doc.new.tr_detail_have_invoice_fee)) {
            if (expense) {
                expense.tr_detail_expected_fee = doc.new.tr_detail_expected_fee;
                expense.tr_detail_no_invoice_fee = doc.new.tr_detail_no_invoice_fee;
                expense.tr_detail_have_invoice_fee = doc.new.tr_detail_have_invoice_fee;
                await expense.save();
                common.sendData(res, expense);
            } else {
                common.sendError(res, 'trafficExpenseApply_01');
                return
            }
        } else {
            common.sendError(res, 'trafficExpenseApply_02');
            return
        }

    } catch (error) {
        logger.error('ERCTransReceptionExpenseDetailResource-modifyAct-error:' + error);
        common.sendFault(res, error);
    }
}

//上传附件
let uploadFileAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = [];

        if (!doc.new.tr_expense_list_code) {
            common.sendError(res, 'trafficExpenseApply_01');
            return
        }

        //增加附件
        let api_name = common.getApiName(req.path)
        for (let m of doc.new.files) {
            if (m.url) {
                let fileUrl = await common.fileMove(m.url, 'upload');
                let addFile = await tb_uploadfile.create({
                    api_name: common.getApiName(req.path),
                    file_name: m.name,
                    file_url: fileUrl,
                    file_type: m.type,
                    file_visible: '1',
                    state: GLBConfig.ENABLE,
                    srv_id: doc.new.tr_detail_id,
                    srv_type: doc.new.tr_detail_fee_id,
                    order_id: doc.new.tr_detail_id,
                    file_creator: user.name,
                    user_id: user.user_id
                });
            }
        }

        let retData = JSON.parse(JSON.stringify(doc.new))
        retData.files = []
        let ufs = await tb_uploadfile.findAll({
            where: {
                api_name: api_name,
                order_id: retData.tr_detail_id,
                srv_id: retData.tr_detail_id,
                srv_type: retData.tr_detail_fee_id,
                state: GLBConfig.ENABLE
            }
        })

        if(ufs.length>0){
            retData.files=ufs;
        }

        common.sendData(res, retData);
    } catch (error) {
        logger.error('ERCTransReceptionExpenseDetailResource-addFileAct-error:' + error);
        common.sendFault(res, error);
    }
}

//删除附件
let removeFileAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);

        let uploadfiles = await tb_uploadfile.findAll({
            where: {
                file_id: {
                    $in: doc.fileIds
                },
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

let uploadAct = async (req, res) => {
    try {
        let fileInfo = await common.fileSave(req)
        common.sendData(res, fileInfo)
    } catch (error) {
        common.sendFault(res, error)
    }
};

//发布任务
async function setTask(req,res){
    try{// user, taskName, taskType  4, taskPerformer, taskReviewCode, taskDescription
        let user=req.user;
        let doc = req.body;
        // 申请状态 0待提交，1已提交，2通过,3拒绝

        let expense = await tb_trafficreceptionexpense.findOne({
            where:{
                state:GLBConfig.ENABLE,
                tr_expense_code:doc.tr_expense_code
            }
        });

        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'出纳管理新增付款确认任务'
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
            common.sendError(res, 'cashier_02');
            return
        }else{
            await tb_trafficreceptionexpense.update({
                tr_expense_state:1,
                tr_expense_confirm_time:new Date(),
                tr_expense_confirm_id:user.user_id,
                // tr_expense_rejected_description:description
            }, {
                where: {
                    tr_expense_code:doc.tr_expense_code
                }
            });

            let trafficreceptionexpense = await tb_trafficreceptionexpense.findOne({
                where:{
                    state:GLBConfig.ENABLE,
                    tr_expense_code:doc.tr_expense_code
                }
            });
            let tr_expense_pre_fee = trafficreceptionexpense.tr_expense_pre_fee;
            let queryStr = `select sum(tr_detail_no_invoice_fee + tr_detail_have_invoice_fee) as total_money 
            from tbl_erc_trafficreceptionexpensedetail where state=1 and tr_expense_list_code = ?`;
            let replacement = [doc.tr_expense_code];
            let result = await sequelize.query(queryStr, {
                replacements: replacement,
                type: sequelize.QueryTypes.SELECT
            });
            let sumFee = 0;
            if(result && result.length>0){
                sumFee = result[0].total_money?result[0].total_money:0
            }
            let paymentconfirm = await tb_paymentconfirm.create({
                domain_id:user.domain_id,
                paymentconfirm_name: 2,
                paymentconfirm_source_code: doc.tr_expense_code,
                paymentconfirm_money: sumFee - tr_expense_pre_fee,
                paymentconfirm_expend_user: trafficreceptionexpense.tr_expense_creator_id,
                paymentconfirm_declarant: trafficreceptionexpense.tr_expense_creator_id,
                paymentconfirm_declarant_time: trafficreceptionexpense.created_at,
                paymentconfirm_state:1
            })

            let taskName = '出纳管理新增付款确认任务：交通接待报销' ;
            let taskDescription =  '交通接待报销  出纳管理新增付款确认任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user,taskName,46,taskallotuser.user_id,paymentconfirm.paymentconfirm_id,taskDescription,'',groupId);
            if(!taskResult){
                common.sendError(res, 'task_01');
                return
            }
            //更改申请状态
            if(expense){
                expense.tr_expense_state='1';
                await expense.save()
            }
            common.sendData(res, {})
        }
    }catch (error){
        common.sendFault(res, error);
    }
}

//交通接待报销
async function modifyTrEpenseState(applyState,description,trExpenseCode,applyApprover,applyDomain_id,user){
    let NowDoMainId = applyDomain_id;

    await tb_trafficreceptionexpense.update({
        tr_expense_state:applyState,
        tr_expense_confirm_time:new Date(),
        tr_expense_confirm_id:applyApprover,
        tr_expense_rejected_description:description
        /* apply_approver:applyApprover,*/
    }, {
        where: {
            tr_expense_code:trExpenseCode
        }
    });

    //通过后生成付款确认记录
    if(applyState == 2){
        let trafficreceptionexpense = await tb_trafficreceptionexpense.findOne({
            where:{
                state:GLBConfig.ENABLE,
                tr_expense_code:trExpenseCode
            }
        });
        let tr_expense_pre_fee = trafficreceptionexpense.tr_expense_pre_fee;
        let queryStr = `select sum(tr_detail_no_invoice_fee + tr_detail_have_invoice_fee) as total_money 
            from tbl_erc_trafficreceptionexpensedetail where state=1 and tr_expense_list_code = ?`;
        let replacement = [trExpenseCode];
        let result = await sequelize.query(queryStr, {
            replacements: replacement,
            type: sequelize.QueryTypes.SELECT
        });
        let sumFee = 0;
        if(result && result.length>0){
            sumFee = result[0].total_money?result[0].total_money:0
        }


        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'出纳管理新增付款确认任务'
            }
        });
        let taskallotuser = await tb_taskallotuser.findOne({
            where:{
                state:GLBConfig.ENABLE,
                domain_id: applyDomain_id,
                taskallot_id:taskallot.taskallot_id
            }
        });

        if (!taskallotuser) {
            throw new Error(cashier_01)
        }else{
            let paymentconfirm = await tb_paymentconfirm.create({
                domain_id:trafficreceptionexpense.domain_id,
                paymentconfirm_name: 2,
                paymentconfirm_source_code: trExpenseCode,
                paymentconfirm_money: sumFee - tr_expense_pre_fee,
                paymentconfirm_expend_user: trafficreceptionexpense.tr_expense_creator_id,
                paymentconfirm_declarant: trafficreceptionexpense.tr_expense_creator_id,
                paymentconfirm_declarant_time: trafficreceptionexpense.created_at,
                paymentconfirm_state:1
            })

            let taskName = '付款确认：交通接待报销' ;
            let taskDescription =  '付款确认  交通接待报销';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user,taskName,46,taskallotuser.user_id,paymentconfirm.paymentconfirm_id,taskDescription,'',groupId);
            if(!taskResult){
                throw new Error(task_01);
            }
        }
    }
}


exports.modifyTrEpenseState=modifyTrEpenseState;