/** 退货单表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_saleinvoice', {
    invoice_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    start_invoice_code: {//起号
        type: db.ID,
        allowNull: false
    },
    end_invoice_code: {//止号
        type: db.ID,
        allowNull: false
    },
    invoice_type: {//发票类型
        type: db.IDNO,
        allowNull: false
    },
    invoice_amount: {
        type: db.IDNO,
        allowNull: true
    },
    manage_type: {
        type: db.IDNO,
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    }
});
