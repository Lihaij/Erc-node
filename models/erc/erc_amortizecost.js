/** 待摊资产--构建费用 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_amortizecost', {
    amortizecost_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    amortize_id: {
        type: db.STRING(30),
        allowNull: false
    },
    amortizecost_name: {//构建费用事项
        type: db.STRING(100),
        allowNull: true
    },
    amortizecost_money: {//金额
        type: db.STRING(20),
        allowNull: true
    },
    amortizecost_invoice_money: {//有发票金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    amortizecost_noinvoice_money: {//无发票金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    amortizecost_state: {//状态  待提交，已提交，通过，拒绝
        type: db.INTEGER,
        allowNull: true
    },
    amortizecost_examine: {//审批人
        type: db.STRING(100),
        allowNull: true
    },
    amortizecost_examine_time: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    amortizecost_refuse_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    },
});
