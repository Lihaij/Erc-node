const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**收到的票据**/
module.exports = db.defineModel('tbl_erc_bill_receipt', {
    bill_receipt_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.BIGINT,
        allowNull: true
    },
    bill_declare_number: {//票据申报单号
        type: db.STRING(200),
        allowNull: true
    },
    bill_number: {//票据编号
        type: db.STRING(200),
        allowNull: true
    },
    bill_name: {//票据名称（1支票；2本票；3银行承兑汇票；4商业承兑汇票，4选1）
        type:db.STRING(100),
        defaultValue: '1',
        allowNull: true
    },
    bill_unit_style: {//出票单位类型
        type:db.STRING(100),
        allowNull: true
    },
    bill_unit: {//出票单位
        type:db.STRING(100),
        allowNull: true
    },
    bill_createdate: {//收票日期
        type:db.DATE,
        allowNull: true
    },
    bill_deadline: {//票据到期日
        type:db.DATE,
        allowNull: true
    },
    bill_collector: {//票据收票人-user_id
        type:db.STRING(100),
        allowNull: true
    },
    bill_state: {//票据状态（1持有；2已过期；3已背书转让；4已贴现；5已兑收）
        type:db.STRING(10),
        defaultValue: '1',
        allowNull: true
    },
    bill_remark: {//备注
        type:db.STRING(500),
        allowNull: true
    },
    bill_dealwith_remark: {//背书、贴现等备注
        type:db.STRING(500),
        allowNull: true
    },
    operator_id:{
        type:db.STRING(100),
        allowNull: false
    },
    approver_id:{//审批人ID
        type:db.STRING(100),
        allowNull: true
    },
    bill_receipt_style: {//票据处理单类型（3.背书4.贴现5.兑收）
        type: db.STRING(30),
        allowNull: true
    },
    cashier_style:{//背书单位类型（1供应商、2其他相关单位、3客户）
        type:db.STRING(100),
        allowNull: true
    },
    cashier: {//出纳-user_id || 背书单位（1供应商、2其他相关单位、3客户）
        type:db.STRING(100),
        allowNull: true
    },
    amount:{
        type:db.STRING(200),
        allowNull: true 
    },
    actual_amount:{
        type:db.STRING(200),
        allowNull: true 
    },
    bank_card_number:{
        type:db.STRING(200),
        allowNull: true 
    },
    comfirm_state: {//0.未确认 1.已确认
        type:db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
    complete_state: {//完成状态  0.未完成 1.已完成
        type:db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
});
