const common = require('../../../util/CommonUtil');
const AccountConst = require('../../../util/AccountConst');
const logger = require('../../../util/Logger').createLogger('ERCAccountingControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const GLBConfig = require('../../../util/GLBConfig');
const RecordingVouchersc = require('../../../util/RecordingVouchersc');
const task = require('../baseconfig/ERCTaskListControlSRV');

const moment = require('moment');
const sequelize = model.sequelize;
const tb_borrowapply = model.erc_borrowapply

const tb_user = model.common_user
const tb_supplier = model.erc_supplier
const tb_corporateclients = model.erc_corporateclients
const tb_othermain = model.erc_othermain
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser
const tb_paymentconfirm = model.erc_paymentconfirm

const {
    CODE_NAME,
    genBizCode
} = require('../../../util/BizCodeUtil');

exports.ERCBorrowMoneyApplyControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        await init(req, res);
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'search') {
        searchAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};

async function init(req, res) {
    try {
        const returnData = {};
        returnData.GATHERTYPE = [{
            id: 0,
            text: '员工',
            value: 0
        }, {
            id: 1,
            text: '客户',
            value: 1
        }, {
            id: 2,
            text: '供应商',
            value: 2
        }, {
            id: 3,
            text: '其他相关主体',
            value: 3
        }]
        returnData.EXAMINESTATE = [{
            id: 0,
            text: '待提交',
            value: 0
        }, {
            id: 1,
            text: '已提交',
            value: 1
        }, {
            id: 2,
            text: '通过',
            value: 2
        }, {
            id: 3,
            text: '拒绝',
            value: 3
        }]
        //员工
        returnData.USER = await tb_user.findAll({
            where: {
                state: 1,
                domain_id: req.user.domain_id
            }
        }).map(item => {
            return {
                id: item.user_id,
                text: item.username,
                value: item.user_id
            }
        })
        //客户
        returnData.corporateclients = await tb_corporateclients.findAll({
            where: {
                state: 1,
                domain_id: req.user.domain_id
            }
        }).map(item => {
            return {
                id: item.corporateclients_id,
                text: item.corporateclients_name,
                value: item.corporateclients_id
            }
        })
        //供应商
        returnData.supplier = await tb_supplier.findAll({
            where: {
                state: 1,
                domain_id: req.user.domain_id
            }
        }).map(item => {
            return {
                id: item.supplier_id,
                text: item.supplier_name,
                value: item.supplier_id
            }
        })
        //其他相关主体
        returnData.othermain = await tb_othermain.findAll({
            where: {
                state: 1,
                domain_id: req.user.domain_id
            }
        }).map(item => {
            return {
                id: item.other_main_id,
                text: item.other_main_name,
                value: item.other_main_id
            }
        })
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function addAct(req, res) {
    try {
        let {
            body,
            user
        } = req
        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where: {
                state: GLBConfig.ENABLE,
                taskallot_name: '申请借款任务'
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
            return common.sendError(res, 'borrowapply_01');
        } else {
            let borrowapply_code = await genBizCode(CODE_NAME.JKSQ, user.domain_id, 6)
            let result = await tb_borrowapply.create({
                domain_id: user.domain_id,
                borrowapply_code: borrowapply_code,
                borrowapply_gathertype: body.borrowapply_gathertype,
                borrowapply_gathersubject: body.borrowapply_gathersubject,
                borrowapply_money: Number(body.borrowapply_money) * 100,
                borrowapply_remark: body.borrowapply_remark,
                borrowapply_accountname: body.borrowapply_accountname,
                borrowapply_bankname: body.borrowapply_bankname,
                borrowapply_bankno: body.borrowapply_bankno,
                borrowapply_operation: user.user_id,
                borrowapply_state: 1
            });
            let taskName = '申请借款审核任务';
            let taskDescription = result.borrowapply_code + '  申请借款审批任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user, taskName, 100, taskallotuser.user_id, result.borrowapply_id, taskDescription, '', groupId);
            if (!taskResult) {
                return common.sendError(res, 'task_01');
            } else {
                common.sendData(res, result);
            }
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function searchAct(req, res) {
    try {
        let {
            body,
            user
        } = req
        let returnData = {}



        let queryStr = `select * from (SELECT
	        CASE b.borrowapply_gathertype
            WHEN 0 THEN u.username
            WHEN 1 THEN c.corporateclients_name
            WHEN 2 THEN s.supplier_name
            ELSE o.other_main_name END as borrowapply_gathersubject_name,
            b.*
            FROM tbl_erc_borrowapply b
            LEFT JOIN tbl_common_user u ON (b.borrowapply_gathersubject = u.user_id and u.state=1)
            LEFT JOIN tbl_erc_corporateclients c ON (b.borrowapply_gathersubject = c.corporateclients_id and c.state=1 )
            LEFT JOIN tbl_erc_supplier s ON (b.borrowapply_gathersubject = s.supplier_id and s.state=1)
            LEFT JOIN tbl_erc_othermain o ON (b.borrowapply_gathersubject = o.other_main_id and o.state=1)
            where b.state=1 and b.domain_id=?) as a where true`
        let replacements = [user.domain_id];
        if (body.searchText) {
            queryStr += ` and (borrowapply_gathersubject_name like ?) `
            replacements.push('%' + body.searchText + '%')
        }
        if (body.borrowapply_id) {
            queryStr += ` and borrowapply_id = ?`
            replacements.push(body.borrowapply_id)
        }
        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = result.created_at ? moment(result.created_at).format("YYYY-MM-DD") : null;
            result.borrowapply_money = Number(result.borrowapply_money) / 100
            returnData.rows.push(result)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function modifyBorrowState(applyState, description, borrowapply_id, applyApprover) {
    await sequelize.transaction(async transaction => {
        await tb_borrowapply.update({
            borrowapply_state: applyState,
            borrowapply_examine_time: new Date(),
            borrowapply_examine: applyApprover,
            borrowapply_refuse_remark: description
        }, {
            where: {
                borrowapply_id: borrowapply_id
            }
        }, {
            transaction
        });

        if (applyState == 2) {
            // todo
            // 插入付款列表
            let borrowapply = await tb_borrowapply.findOne({
                where: {
                    state: 1,
                    borrowapply_id: borrowapply_id
                }
            })
            const paymentConfirm = await tb_paymentconfirm.create({
                domain_id: borrowapply.domain_id,
                paymentconfirm_name: GLBConfig.PAYMENTCONFIRMTYPE[5].value,
                paymentconfirm_source_code: borrowapply.borrowapply_code,
                paymentconfirm_money: Number(borrowapply.borrowapply_money) / 100,
                paymentconfirm_expend_user: borrowapply.borrowapply_gathersubject,
                paymentconfirm_declarant: borrowapply.borrowapply_operation,
                paymentconfirm_declarant_time: borrowapply.created_at,
                paymentconfirm_state: GLBConfig.PAYMENTCONFIRMSTATE[0].value,
                s_expense_type_id: borrowapply_id,
                paymentconfirm_expend_user_type: borrowapply.borrowapply_gathertype
            }, {
                transaction
            });
        }
    })
}

exports.modifyBorrowState = modifyBorrowState;