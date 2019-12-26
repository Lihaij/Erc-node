/**
 * 会计科目详情
 * Created by BaiBin on 2019/1/8.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_accountingdetail', {
    accounting_detail_id: {
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
    other_id: {//对应表的主健
        type: db.STRING(50),
        allowNull: true
    },
    borrow_balance: {//年初借方余额
        type: db.IDNO,
        allowNull: true,
        defaultValue: null,
    },
    loan_balance: {//年初贷方余额
        type: db.IDNO,
        allowNull: true,
        defaultValue: null,
    },
    init_before_borrow_money: {//初始化前借方金额
        type: db.IDNO,
        allowNull: true,
        defaultValue: null,
    },
    init_before_loan_money: {//初始化前贷方金额
        type: db.IDNO,
        allowNull: true,
        defaultValue: null,
    },
    init_borrow_money: {//初始化时借方金额
        type: db.IDNO,
        allowNull: true,
        defaultValue: 0,
    },
    init_loan_money: {//初始化时贷方金额
        type: db.IDNO,
        allowNull: true,
        defaultValue: 0,
    },
    approval_state: {//审批状态 0未提交，1已提交, 2已拒绝, 3已通过
        type: db.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    accounting_type: {//类型，1,按客户 2，供应商 3员工， 4其他相关主体
        type: db.STRING(4),
        allowNull: true,
    }
});