/** 固定资产维修 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_fixedassetsrepair', {
    fixedassetsrepair_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    fixedassetsrepair_no: {//维修单编号
        type: db.ID,
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    submit_user_id: {//提交人
        type: db.ID,
        allowNull: true
    },
    fixedassetscheckdetail_id: {
        type: db.IDNO,
        allowNull: false
    },
    fixedassets_no: {//固定资产编号
        type: db.ID,
        allowNull: false
    },
    repair_plan_time: {//预计维修时间
        type: db.DATE,
        allowNull: true
    },
    fault_remark: {//资产故障诊断记录
        type: db.STRING(1024),
        allowNull: true
    },
    repair_state: {//审批状态 0.待提交 1.未完成 2.已完成
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
    repair_checker_id: {//审批人user_id
        type: db.ID,
        allowNull: true
    },
    repair_check_date: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    repair_refuse_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    }
});