/**
 * Created by Cici on 2018/4/26.
 */
/** 资金支出管理 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_specialexpense', {
    s_expense_id: {//
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {//机构id
        type: db.IDNO,
        allowNull: true
    },
    s_expense_code: {//编号
        type: db.STRING(100),
        allowNull: true
    },
    s_expense_creator_id: {//申请人ID
        type: db.STRING(100),
        allowNull: true
    },
    s_expense_creator_name: {//申请人名称
        type: db.STRING(100),
        allowNull: true
    },
    s_expense_confirm_time: {//审核日期
        type: db.DATE,
        allowNull: true
    },
    s_expense_confirm_id: {//审核人ID
        type: db.STRING(100),
        allowNull: true
    },
    s_expense_rejected_description: {//审核驳回信息
        type: db.STRING(100),
        allowNull: true
    },
    s_expense_state: {//审核状态
        type: db.STRING(10),
        allowNull: true
    },
    s_expense_type_id:{ //费用报销分类ID
        type: db.STRING(10),
        allowNull: true
    },
    s_sum_fee:{ //合计金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    s_no_invoice_fee:{ //无发票金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    s_have_invoice_fee:{ //有发票金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    s_expense_description:{ //事物描述
        type: db.STRING(1000),
        allowNull: true
    },
    s_capital_cost_type:{ //付款类型
        type: db.INTEGER,
        allowNull: true
    },
    payment_method:{//付款方式
        type: db.STRING(10),
        allowNull: true
    },
    monetary_fund_type:{//货币资金类型
        type: db.STRING(10),
        allowNull: true
    },
    bank_account:{//银行账号
        type: db.STRING(100),
        allowNull: true
    }
});