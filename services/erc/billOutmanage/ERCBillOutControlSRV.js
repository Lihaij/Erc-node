const TaskListControlSRV = require('../baseconfig/ERCTaskListControlSRV');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const model = require('../../../model');
const sequelize = model.sequelize;
const tb_task = model.erc_task;//任务列表
const tb_bill_out= model.erc_bill_out;

exports.ERCBillOutControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {//票据数据
        searchAct(req, res);
    } else if (method === 'add') {//增加票据
        addAct(req, res);
    } else if (method === 'delete') {
        deleteAct(req, res);
    } else if (method === 'modify') {
        modifyAct(req, res);
    } else if (method === 'searchDealwith') {//查询背书、贴现、兑收数据
        searchDealwithAct(req, res);
    } else if (method === 'dealwith') {//背书、贴现、兑收等操作
        dealwithAct(req, res);
    } else if (method === 'complete') {
        completeAct(req, res);
    } else if (method === 'refuse') {
        refuseAct(req, res);
    } else if (method === 'searchRepay') {
        searchRepayAct(req, res);
    } else if (method === 'addRepay') {
        addRepayAct(req, res);
    } else if (method === 'deleteRepay') {
        deleteRepayAct(req, res);
    } else {
        return common.sendError(res, 'common_01');
    }
}

async function initAct(req, res) {
    try {
        let returnData = {};
        returnData.BILLNAME=GLBConfig.BILLNAME;
        returnData.BILLCOMPANYTYPE = GLBConfig.BILLCOMPANYTYPE;
        returnData.BILLRECEIPTSTATE = GLBConfig.BILLOUTSTATE;
        returnData.BILLDEALSTATE=GLBConfig.MEETINGROOMSTATE;
           
        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};

        let result = await getData(req, res, false, doc);
        returnData.total = result.count;
        returnData.rows = result.data;

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function searchDealwithAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        let result = await getData(req, res, false, {cashier_id: user.user_id});
        returnData.total = result.count;
        returnData.rows = result.data;

        return common.sendData(res, returnData);


    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [];
        let bill_out= await tb_bill_out.create({
            domain_id: user.domain_id,
            bill_declare_number: 'BO' + new Date().Format('yyyyMMdd') + Math.ceil(Math.random() * 100000),
            bill_number: doc.bill_number,
            
            bill_name: doc.bill_name,
            bill_unit_style:doc.bill_unit_style,
            bill_unit:doc.bill_unit,
            bill_deadline:doc.bill_deadline,
            bill_createdate:doc.bill_createdate,
            cashier: doc.cashier,
            bill_remark: doc.bill_remark,
            operator_id:user.user_id,
            approver_id:doc.approver_id,

            cashier_style:doc.cashier_style,//背书人
            amount : doc.amount,
            actual_amount :doc.actual_amount,
            // bill_state:doc.bill_out_style=='3'?'2':'1',//状态
            bill_out_style:'1',
        });
        // if(bill_out.bill_out_style!='3'){
            let task_type='222';
            let task_title='开出票据申请';
            let str='票据编号：'+bill_out.bill_number;
            let task_description=str+' 申请开票';
            let groupID = common.getUUIDByTime(30);
            await TaskListControlSRV.createTask(user, task_title, task_type,bill_out.approver_id, bill_out.bill_out_id, task_description, '', groupID);
            let task=await tb_task.findOne({
                where:{
                    task_name:task_title,
                    task_type:task_type,
                    task_review_code:bill_out.bill_out_id,
                }
            })
            if(task){
                task.require_complate_time=bill_out.bill_deadline,
                await task.save();
            }else{
                return common.sendError(res,'task_02');
            }
        // }
        return common.sendData(res, bill_out);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let lendmoney = await tb_bill_out.findOne({
            where: {
                domain_id: user.domain_id,
                bill_out_id: doc.bill_out_id,
                state: GLBConfig.ENABLE
            }
        });
        if (!lendmoney) {
            return common.sendError(res, 'common_api_02');
        }

        lendmoney.state = GLBConfig.DISABLE;
        await lendmoney.save();

        return common.sendData(res, lendmoney);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let check = await tb_bill_out.findOne({
            where: {
                domain_id: user.domain_id,
                bill_out_id: doc.bill_out_id,
                state: GLBConfig.ENABLE
            }
        });
        if (!check) {
            return common.sendError(res, 'common_api_02');
        }
        check.bill_number= doc.bill_number;
        check.bill_name= doc.bill_name;
        check.bill_unit_style=doc.bill_unit_style;
        check.bill_unit=doc.bill_unit;
        check.bill_deadline=doc.bill_deadline;
        check.bill_createdate=doc.bill_createdate;
        check.cashier= user.cashier;
        check.bill_remark= doc.bill_remark;
        check.operator_id=user.user_id;
        await check.save();
        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
}


async function getData(req, res, is_single, doc) {
    let user = req.user;
    let replacements = [];

    let queryStr = 'select l.*, case when l.bill_unit_style = 1 then c.corporateclients_name when l.bill_unit_style = 2 then s.supplier_name when l.bill_unit_style = 3 then o.other_main_name end as company_name, operator.name as operator_name, cashier.name as cashier_name' +
    // let queryStr = 'select l.*,operator.name as operator_name, cashier.name as cashier_name' +
        ' from tbl_erc_bill_out l' +
        ' left join tbl_common_user operator on operator.user_id = l.operator_id' +
        ' left join tbl_common_user cashier on cashier.user_id = l.cashier' +
        ' left join tbl_erc_corporateclients c on c.corporateclients_id = l.bill_unit' +
        ' left join tbl_erc_supplier s on s.supplier_id = l.bill_unit' +
        ' left join tbl_common_user u on u.user_id = l.bill_unit' +
        ' left join tbl_erc_othermain o on o.other_main_id = l.bill_unit' +
        ' where l.state = 1 and l.domain_id = ?';
    replacements.push(user.domain_id);

    if (doc.bill_out_id) {
        queryStr += ' and l.bill_out_id = ?';
        replacements.push(doc.bill_out_id);
    }
    if (doc.bill_number) {
        queryStr += ' and l.bill_number like ?';
        replacements.push('%'+ doc.bill_number + '%');
    }
    if (doc.cashier_name) {
        queryStr += ' and cashier.name like ?';
        replacements.push('%'+ doc.cashier_name + '%');
    }
    if (doc.bill_name) {
        queryStr += ' and l.bill_name like ?';
        replacements.push('%'+ doc.bill_name + '%');
    }
    if (doc.search_type == 1) {
        queryStr += ' and l.operator_id = ?';
        replacements.push(user.user_id);
    }
    if (doc.cashier) {
        queryStr += ' and l.cashier = ?';
        replacements.push(doc.cashier_id);
    }
    // if (doc.bill_state) {
    //     queryStr += ' and l.bill_state = ?';
    //     replacements.push(doc.bill_state);
    // }
    if (doc.bill_out_style) {
        queryStr += ' and l.bill_out_style = ?';
        replacements.push(doc.bill_out_style);
    }
    queryStr += ' order by l.created_at desc';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.bill_deadline = r.bill_deadline ? r.bill_deadline.Format('yyyy-MM-dd') : null;
        r.bill_createdate = r.bill_createdate ? r.bill_createdate.Format('yyyy-MM-dd') : null;
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
    }

    if (is_single == true) {
        return result.data[0];
    } else {
        return result;
    }
}

async function dealwithAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let check = await tb_bill_out.findOne({
            where: {
                domain_id: user.domain_id,
                bill_out_id: doc.bill_out_id,
                state: GLBConfig.ENABLE,
            }
        });
        if (!check) {
            return common.sendError(res, 'common_api_02');
        }

        check.bill_out_style = doc.bill_out_style;
        if(doc.bill_out_style=='5'){
            check.comfirm_state='1';
        }
        // check.bill_number=doc.bill_number;
        // check.bill_name=doc.bill_name;
        // check.bill_deadline=doc.bill_deadline;
        check.cashier_style=doc.cashier_style;//背书人
        check.bill_unit_style=doc.bill_unit_style;//出票单位
        check.amount = doc.amount;
        check.actual_amount = doc.actual_amount;
        check.bill_state=doc.bill_state;//状态
        check.bill_dealwith_remark=doc.bill_dealwith_remark;
        await check.save();
       

        let returnData = await getData(req, res, true, {bill_out_id: doc.bill_out_id});

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
}
async function completeAct(req, res) {//确认完成
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let check = await tb_bill_out.findOne({
            where: {
                domain_id: user.domain_id,
                bill_out_id: doc.bill_out_id,
                state: GLBConfig.ENABLE,
                // complete_state: '0'
            }
        });
        if (!check) {
            return common.sendError(res, 'common_api_02');
        }

        let data = {};
        data.complete_state = '1';
        data.bill_state = doc.bill_state;
        data.bank_card_number = doc.bank_card_number;
        if(doc.bill_out_style=='3'){
            let task=await tb_task.findOne({
                where:{
                    task_type:'223',
                    task_review_code:check.bill_out_id,
                    task_state : '1'
                }
            })
            if(task){
                task.task_state = '2';
                task.task_complete_date=new Date(),
                await task.save();
            }
        }
        await tb_bill_out.update(data, {
            where: {
                bill_out_id: doc.bill_out_id,
            }
        });

        let returnData = await getData(req, res, true, {bill_out_id: doc.bill_out_id});

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function refuseAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let check = await tb_bill_out.findOne({
            where: {
                domain_id: user.domain_id,
                bill_out_id: doc.bill_out_id,
                state: GLBConfig.ENABLE,
                lendmoney_state: 1
            }
        });
        if (!check) {
            return common.sendError(res, 'common_api_02');
        }

        let data = {};
        data.lendmoney_state = 3;
        await tb_bill_out.update(data, {
            where: {
                bill_out_id: doc.bill_out_id
            }
        });

        let returnData = await getData(req, res, true, {bill_out_id: doc.bill_out_id});

        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function searchRepayAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        let check = await tb_bill_out.findOne({
            where: {
                domain_id: user.domain_id,
                bill_out_id: doc.bill_out_id,
                state: GLBConfig.ENABLE
            }
        });
        if (!check) {
            return common.sendError(res, 'common_api_02');
        }

        let result = await getRepayData(req, res, doc);

        returnData.total = result.count;
        returnData.rows = result.data;

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function addRepayAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let check = await tb_bill_out.findOne({
            where: {
                domain_id: user.domain_id,
                bill_out_id: doc.bill_out_id,
                state: GLBConfig.ENABLE
            }
        });
        if (!check) {
            return common.sendError(res, 'common_api_02');
        }

        let repaySet = await tb_bill_out_dealwith.create({
            bill_out_id: doc.bill_out_id,
            repay_money: doc.repay_money,
            repay_date: doc.repay_date,
            domain_id: user.domain_id,
            operator_id: user.user_id
        });

        return common.sendData(res, repaySet);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function deleteRepayAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let check = await tb_bill_out_dealwith.findOne({
            where: {
                domain_id: user.domain_id,
                lendmoneyrepayset_id: doc.lendmoneyrepayset_id,
                state: GLBConfig.ENABLE
            }
        });
        if (!check) {
            return common.sendError(res, 'common_api_02');
        }

        check.state = GLBConfig.DISABLE;
        await check.save();

        return common.sendData(res, check);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function getRepayData(req, res, doc) {
    let replacements = [];

    let queryStr = 'select *' +
        ' from tbl_erc_bill_out_dealwith' +
        ' where state = 1 and bill_out_id = ?';
    replacements.push(doc.bill_out_id);

    queryStr += ' order by repay_date';
    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

    for (let r of result.data) {
        r.repay_date = r.repay_date ? r.repay_date.Format('yyyy-MM-dd') : null;
    }

    return result;
};
async function modifyState(applyState, description, lendmoneyrepay_id, applyApprover) {
    try {
        let problem = await tb_bill_out.findOne({
            where: {
                bill_out_id: lendmoneyrepay_id,
                state:'1'
            }
        });
        if (problem && problem.comfirm_state=='0') {
            let data={
            };
            data.bill_state= applyState;
            data.approver_id= applyApprover;
            // data.comfirm_state='1';
            data.bill_out_style='3';
            if(applyState=='3'){
                data.complete_state='1';
            }
            await tb_bill_out.update(data, {
                where: {
                    bill_out_id: lendmoneyrepay_id
                }
            });
        }
    } catch (error) {
        throw error
    }
};
exports.modifyState = modifyState;
exports.getData = getData;