/** 退货单表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_assetsliability', {
    assetsliability_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    assetsliability_code: {
        type: db.ID,
        unique: true,
        allowNull: false
    },
    assets_mc: {//货币资金
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    assets_ar: {//应收账款
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    assets_ap: {//预付账款
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    assets_oar: {//其他应收款
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    assets_stock: {//存货
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    assets_tca: {//流动资产合计
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    assets_fa: {//固定资产
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    assets_ad: {//累计折旧
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    assets_pfa: {//固定资产净值
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    assets_lpe: {//长期待摊费用
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    assets_uca: {//非流动资产合计
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    assets_ta: {//资产总计
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    liability_slm: {//短期借款
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    liability_ap: {//应付账款
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    liability_ar: {//预收款项
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    liability_pr: {//应付职工薪酬
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    liability_tp: {//应交税费
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    liability_oap: {//其他应付款
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    liability_tcl: {//流动负债合计
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    liability_pc: {//实收资本
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    liability_up: {//未分配利润
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    liability_toe: {//所有者权益合计
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    liability_tlo: {//负债及所有者权益总计
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    assets_mc_sum: {//货币资金
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    assets_ar_sum: {//应收账款
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    assets_ap_sum: {//预付账款
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    assets_oar_sum: {//其他应收款
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    assets_stock_sum: {//存货
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    assets_tca_sum: {//流动资产合计
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    assets_fa_sum: {//固定资产
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    assets_ad_sum: {//累计折旧
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    assets_pfa_sum: {//固定资产净值
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    assets_lpe_sum: {//长期待摊费用
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    assets_uca_sum: {//非流动资产合计
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    assets_ta_sum: {//资产总计
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    liability_slm_sum: {//短期借款
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    liability_ap_sum: {//应付账款
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    liability_ar_sum: {//预收款项
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    liability_pr_sum: {//应付职工薪酬
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    liability_tp_sum: {//应交税费
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    liability_oap_sum: {//其他应付款
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    liability_tcl_sum: {//流动负债合计
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    liability_pc_sum: {//实收资本
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    liability_up_sum: {//未分配利润
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    liability_toe_sum: {//所有者权益合计
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    liability_tlo_sum: {//负债及所有者权益总计
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
