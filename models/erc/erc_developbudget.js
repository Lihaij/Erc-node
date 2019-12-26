/** 研发项目--构建预算 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_developbudget', {
    developbudget_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    develop_id: {
        type: db.STRING(30),
        allowNull: false
    },
    budget_work_name: {//施工项名称
        type: db.STRING(100),
        allowNull: true
    },
    budget_measurement: {//计量单位
        type: db.STRING(20),
        allowNull: true
    },
    budget_number: {//数量
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    budget_manual_price: {//人工预算单价
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    budget_materiel_price: {//材料预算单价
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    budget_state: {//状态  待提交，已提交，通过，拒绝
        type: db.INTEGER,
        allowNull: true
    },
    budget_examine: {//审批人
        type: db.STRING(100),
        allowNull: true
    },
    budget_examine_time: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    budget_refuse_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    },
    clearing_last_finishlimit: {//上次施工完成度
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    clearing_last_reality_money: {//上次施工完实际进度款
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    clearing_now_finishlimit: {//本次施工完成度
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    clearing_estimate_money: {//预计进度款
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    clearing_reality_money: {//实际进度款
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    clearing_state: {//状态  待提交，已提交，通过，拒绝
        type: db.INTEGER,
        allowNull: true
    },
    clearing_examine: {//审批人
        type: db.STRING(100),
        allowNull: true
    },
    clearing_examine_time: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    clearing_refuse_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    },
});
