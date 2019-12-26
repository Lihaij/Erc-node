/**
 * Created by BaiBin on 2018/1/31.
 */
/** 工程项目 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_project', {
    project_id: {
        type: db.ID,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    project_name: {//工程名称
        type: db.STRING(50),
        allowNull: true
    },
    project_budget_amount: {//预算金额
        type: db.BIGINT(30),
        allowNull: true
    },
    project_quoted_amount: {//报价金额
        type: db.BIGINT(30),
        allowNull: true
    },
    project_final_amount: {//决算金额
        type: db.BIGINT(30),
        allowNull: true
    },
    project_estate_id: {//小区
        type: db.INTEGER(5),
        allowNull: true
    },
    project_approver_id: {//审批人id
        type: db.STRING(50),
        allowNull: true
    },
    project_state: {//预算状态 PROJECTSTATE
        type: db.STRING(5),
        allowNull: false
    },
    project_budget_remark: {//预算备注
        type: db.STRING(150),
        allowNull: true
    },
    project_final_remark: {//决算备注
        type: db.STRING(150),
        allowNull: true
    },
    project_check_state: {//验收状态
        type: db.INTEGER,
        allowNull: true
    },

    project_province: {//省
        type: db.STRING(50),
        allowNull: true
    },
    project_city: {//市
        type: db.STRING(50),
        allowNull: true
    },
    project_district: {//区
        type: db.STRING(50),
        allowNull: true
    },
    project_estate_name: {//小区
        type: db.STRING(50),
        allowNull: true
    },
});