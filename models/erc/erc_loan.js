/** 贷款表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_loan', {
    loan_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: db.ID,
        allowNull: false
    },
    domain_id: {
        type: db.IDNO,
        allowNull: false
    },
    user_id: {//贷款人
        type: db.ID,
        allowNull: false
    },
    loan_amount: { //贷款金额
        type: db.BIGINT(20),
        defaultValue: 0,
        allowNull: true
    },
    loan_remark: { //备注
        type: db.STRING(300),
        allowNull: true
    },
    loan_state: { //受理状态  0未受理，1已受理
        type: db.STRING(1),
        defaultValue: '0',
        allowNull: true
    }
});
