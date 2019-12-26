/**
 * Created by BaiBin on 2019/1/12.
 */
/**
 * 会计科目
 * Created by BaiBin on 2019/1/8.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_accounting', {
    accounting_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    accounting_code: {//会计科目编号
        type: db.IDNO,
        allowNull: false
    },
    total_borrow_balance: {//总年初借方余额
        type: db.IDNO,
        allowNull: true,
        defaultValue: 0,
    },
    total_loan_balance: {//总年初贷方余额
        type: db.IDNO,
        allowNull: true,
        defaultValue: 0,
    },
    total_init_before_borrow_money: {//总初始化前借方金额
        type: db.IDNO,
        allowNull: true,
        defaultValue: 0,
    },
    total_init_before_loan_money: {//总初始化前贷方金额
        type: db.IDNO,
        allowNull: true,
        defaultValue: 0,
    },
    total_init_borrow_money: {//总初始化时借方金额
        type: db.IDNO,
        allowNull: true,
        defaultValue: 0,
    },
    total_init_loan_money: {//总初始化时贷方金额
        type: db.IDNO,
        allowNull: true,
        defaultValue: 0,
    },
    approval_state: {//审批状态 0未提交，1已提交, 2已拒绝, 3已通过
        type: db.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
});