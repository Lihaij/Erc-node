/**
 * Created by Cici on 2018/4/26.
 */
/** 资金支出汇总管理 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_specialexpensesum', {
    s_expense_sum_id: {//
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {//机构id
        type: db.IDNO,
        allowNull: true
    },
    s_expense_sum_code: {//编号
        type: db.STRING(100),
        allowNull: true
    },
    s_expense_sum_depart_id: {//部门Id
        type: db.STRING(100),
        allowNull: true
    },
    s_expense_sum_time: {//业务日期
        type: db.STRING(100),
        allowNull: true
    },
    s_expense_sum_content: {//业务内容
        type: db.STRING(100),
        allowNull: true
    },
    s_expense_sum_amount: {//总金额
        type: db.STRING(100),
        allowNull: true
    },
    s_no_invoice_sum_fee:{ //无发票金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    s_have_invoice_sum_fee:{ //有发票金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    s_capital_cost_sum_type:{ //付款类型
        type: db.INTEGER,
        allowNull: true
    },



});