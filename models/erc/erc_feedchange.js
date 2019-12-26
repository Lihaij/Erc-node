/** 退货单表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_feedchange', {
    feedchange_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    feedchange_code: {//申请单编号
        type: db.STRING(50),
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    productivetask_id: {//生产任务单编号
        type: db.STRING(50),
        allowNull: true
    },
    feedchange_flag: {//状态 0待提交 1已提交 2已通过 3 已驳回
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
    feedchange_examine: {//审批人
        type: db.STRING(100),
        allowNull: true
    },
    feedchange_examine_time: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    feedchange_refuse_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    },
});
