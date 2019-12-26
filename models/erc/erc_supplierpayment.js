/** 退货单表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_supplierpayment', {
    supplierpayment_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    supplierpayment_code: {//供应商付款编号
        type: db.ID,
        allowNull: false
    },
    supplier_id: {//供应商ID
        type: db.IDNO,
        allowNull: false
    },
    payment_price: {//付款金额
        type: db.DOUBLE,
        allowNull: false
    },
    payment_note: {//备注
        type: db.STRING(255),
        allowNull: true
    },
    user_id: {//申请人
        type: db.ID,
        defaultValue: '',
        allowNull: false
    },
    approval_date: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    reject_caused: {
        type: db.STRING(300),
        allowNull: true
    },
    apply_state: {//申请状态
        type: db.ID,
        allowNull: true
    },
    payment_state: {//付款状态
        type: db.ID,
        allowNull: true
    },
    paymentconfirm_id: {//付款ID
        type: db.IDNO,
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    biz_code: {
        type: db.ID,
        allowNull: true
    },
});
