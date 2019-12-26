/** 待摊资产 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_amortize', {
    amortize_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    amortize_code: {
        type: db.STRING(30),
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    amortize_name: {//项目名称
        type: db.STRING(100),
        allowNull: true
    },
    amortize_budget: {//预算总金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    amortize_departmant_id: {//归属部门
        type: db.STRING(20),
        allowNull: true
    },
    amortize_manager: {//管理责任人
        type: db.STRING(100),
        allowNull: true
    },
    amortize_agelimit: {//预计使用年限
        type: db.INTEGER,
        allowNull: true
    },
    amortize_way: {//摊销方法 AMORTIZED
        type: db.INTEGER,
        allowNull: true
    },
    amortize_creator: {//创建人
        type: db.STRING(50),
        allowNull: true
    },
    amortize_project_state: {//项目状态
        type: db.INTEGER,
        allowNull: true
    },
    amortize_check_state: {//验收状态
        type: db.INTEGER,
        allowNull: true
    },
    amortize_examine: {//审批人
        type: db.STRING(100),
        allowNull: true
    },
    amortize_acceptor: {//验收人
        type: db.STRING(100),
        allowNull: true
    },
    amortize_examine_time: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    amortize_acceptor_time: {//验收时间
        type: db.DATE,
        allowNull: true
    },
    amortize_remark: {//项目描述
        type: db.STRING(200),
        allowNull: true
    },
    amortize_refuse_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    },
    amortize_check_refuse_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    },
    scrap_flag: {//报废标志 0：已报废 1：未报废
        type: db.STRING(4),
        defaultValue: 1,
        allowNull: true
    },
    amortize_already_mos:{//已经摊销月数
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    amortize_already_money:{//已累计摊销金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    amortize_surplus_mos:{//剩余摊销月数
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    amortize_surplus_money:{//剩余摊销金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    take_stock_flag:{//盈亏状态 0：盈亏 1：正常
        type: db.STRING(4),
        defaultValue: 1,
        allowNull: true
    },
    take_stock_description:{//盈亏说明 0：盈亏 1：正常
        type: db.STRING(100),
        allowNull: true
    },
    amortize_money: {//金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    amortize_ratio: {//预计净残值率
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    amortize_property: {//长期资产形式分类 FIXEDASSETS
        type: db.STRING(4),
        allowNull: true
    },
});
