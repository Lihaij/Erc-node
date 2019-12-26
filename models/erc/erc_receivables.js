/** 收款记录 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_receivables', {
    receivables_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: db.ID,
        allowNull: false
    },
    receivables_amount: {//金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    receivables_type: {//类型
        type: db.STRING(4),
        allowNull: true
    },
    receivables_operator_id: {//收款人id
        type: db.ID,
        allowNull: true
    },
    receivables_pay_type: {//支付方式
        type: db.STRING(4),
        allowNull: true
    }
});
