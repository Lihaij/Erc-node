/** 待摊资产 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_amortize_payment', {
    amortize_payment_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    amortize_payment_code: {//付款编号
        type: db.ID,
        allowNull: false
    },
    amortize_id: {//长期资产项目ID
        type: db.IDNO,
        allowNull: false
    },
    payment_type: {//付款类型
        type: db.INTEGER,
        allowNull: false
    },
    payment_price: {//申请金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: false
    },
    payment_note: {//备注
        type: db.STRING(200),
        defaultValue: '',
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
