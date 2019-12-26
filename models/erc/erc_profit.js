/** 退货单表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_profit', {
    profit_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    profit_code: {
        type: db.ID,
        allowNull: false
    },
    business_income: {//营业收入
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    business_cost: {//营业成本
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    tax_addition: {//税金及附加
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    sale_cost: {//销售费用
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    manage_cost: {//管理费用
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    finance_cost: {//财务费用
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    business_profit: {//营业利润
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    out_business_income: {//营业外收入
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    out_business_expend: {//营业外支出
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    total_profit: {//利润总额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    tax_cost: {//所得税费用
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    pure_profit: {//净利润
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    business_income_sum: {//营业收入
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    business_cost_sum: {//营业成本
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    tax_addition_sum: {//税金及附加
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    sale_cost_sum: {//销售费用
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    manage_cost_sum: {//管理费用
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    finance_cost_sum: {//财务费用
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    business_profit_sum: {//营业利润
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    out_business_income_sum: {//营业外收入
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    out_business_expend_sum: {//营业外支出
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    total_profit_sum: {//利润总额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    tax_cost_sum: {//所得税费用
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    pure_profit_sum: {//净利润
        type: db.DOUBLE,
        defaultValue: 0,
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
