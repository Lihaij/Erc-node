/** 研发项目 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_develop', {
    develop_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    develop_code: {
        type: db.STRING(30),
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    develop_name: {//项目名称
        type: db.STRING(100),
        allowNull: true
    },
    develop_format: {//规格型号
        type: db.STRING(100),
        allowNull: true
    },
    develop_unit: {//计量单位
        type: db.STRING(100),
        allowNull: true
    },
    develop_budget: {//预算总金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    develop_departmant_id: {//归属部门
        type: db.STRING(20),
        allowNull: true
    },
    develop_manager: {//管理责任人
        type: db.STRING(100),
        allowNull: true
    },
    develop_agelimit: {//预计使用年限
        type: db.INTEGER,
        allowNull: true
    },
    develop_way: {//摊销方法
        type: db.INTEGER,
        allowNull: true
    },
    develop_creator: {//创建人
        type: db.STRING(50),
        allowNull: true
    },
    develop_project_state: {//项目状态
        type: db.INTEGER,
        allowNull: true
    },
    develop_check_state: {//验收状态
        type: db.INTEGER,
        allowNull: true
    },
    develop_examine: {//审批人
        type: db.STRING(100),
        allowNull: true
    },
    develop_acceptor: {//验收人
        type: db.STRING(100),
        allowNull: true
    },
    develop_examine_time: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    develop_acceptor_time: {//验收时间
        type: db.DATE,
        allowNull: true
    },
    develop_remark: {//项目描述
        type: db.STRING(200),
        allowNull: true
    },
    develop_refuse_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    },
    develop_check_refuse_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    },
    scrap_flag: {//报废标志 0：已报废 1：未报废
        type: db.STRING(4),
        defaultValue: 1,
        allowNull: true
    },
    develop_already_mos:{//已经摊销月数
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    develop_already_money:{//已累计摊销金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    develop_surplus_mos:{//剩余摊销月数
        type: db.INTEGER,
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
    }
});
