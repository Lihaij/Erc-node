/** 销售订单收款记录 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_salereceivables', {
    sale_receivables_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {//销售订单号
        type: db.ID,
        allowNull: false
    },
    sale_receivables_amount: {//金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    sale_receivables_operator_id: {//收款人id
        type: db.ID,
        allowNull: true
    },
    sale_receivables_pay_type: {//支付方式
        type: db.STRING(4),
        allowNull: true
    }
});
