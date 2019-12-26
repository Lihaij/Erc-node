/** 待摊资产--构建预算 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_cashiergathering', {
    cashiergathering_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    cashiergathering_code: {
        type: db.STRING(30),
        allowNull: false
    },
    cashiergathering_name: {//款项名称
        type: db.STRING(100),
        allowNull: true
    },
    cashiergathering_type: {//款项类型
        type: db.INTEGER,
        allowNull: true
    },
    cashiergathering_customer_code: {//客户编号
        type: db.STRING(100),
        allowNull: true
    },
    cashiergathering_source_name: {//来款单位名称
        type: db.STRING(100),
        allowNull: true
    },
    cashiergathering_gathering_money: {//收款金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    cashiergathering_order_balance: {//关联订单的当前余额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    cashiergathering_phone: {//联系电话
        type: db.STRING(100),
        allowNull: true
    },
    cashiergathering_cashier: {//收款人
        type: db.STRING(100),
        allowNull: true
    },
    cashiergathering_cashier_time: {//收款时间
        type: db.DATE,
        allowNull: true
    },
    cashiergathering_remark: {//备注
        type: db.STRING(100),
        allowNull: true
    },
    cashiergathering_declarant: {//申报人
        type: db.STRING(100),
        allowNull: true
    },
    cashiergathering_state: {//状态  待确认，已确认
        type: db.INTEGER,
        allowNull: true
    },
    cashiergathering_examine: {//审批人
        type: db.STRING(100),
        allowNull: true
    },
    cashiergathering_examine_time: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    cashiergathering_refuse_remark: {//驳回说明
        type: db.STRING(300),
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
    },
    cashiergathering_order_id:{//订单号
        type: db.STRING(100),
        allowNull: true
    },
});
