/**
 * Created by Cici.
 */
/** 交通接待报销申请 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_trafficreceptionexpense', {
    tr_expense_id: {//
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {//机构id
        type: db.IDNO,
        allowNull: true
    },
    tr_expense_code: {//申请编号
        type: db.STRING(100),
        allowNull: true
    },
    tr_expense_creator_id: {//申请人ID
        type: db.STRING(100),
        allowNull: true
    },
    tr_expense_creator_name: {//申请人名称
        type: db.STRING(100),
        allowNull: true
    },
    tr_expense_confirm_time: {//审核日期
        type: db.DATE,
        allowNull: true
    },
    tr_expense_confirm_id: {//审核人ID
        type: db.STRING(100),
        allowNull: true
    },
    tr_expense_rejected_description: {//审核驳回信息
        type: db.STRING(100),
        allowNull: true
    },
    tr_expense_state: {//审核状态
        type: db.STRING(10),
        allowNull: true
    },
    tr_expense_start_time: {//申请时间起始
        type: db.DATE,
        allowNull: true
    },
    tr_expense_end_time: {//申请时间截止
        type: db.DATE,
        allowNull: true
    },
    tr_expense_pre_fee: {//申请预借费用
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    }
});