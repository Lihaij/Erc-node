/** 请假管理 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_askforleave', {
    askforleave_id: {
        type: db.ID,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: false
    },
    askforuser_id: { //申请人ID
        type: db.ID,
        allowNull: true
    },
    start_time:{//申请开始时间
        type: db.DATE,
        allowNull: true
    },
    end_time:{//申请结束时间
        type: db.DATE,
        allowNull: true
    },
    askforleave_reason: { //请假事由
        type: db.STRING(4),
        allowNull: true
    },
    askforleave_days: { //请假天数
        type: db.DOUBLE,
        allowNull: true
    },
    askforleave_remark: { //请假描述
        type: db.STRING(1024),
        allowNull: true
    },
    askforleave_state: { //状态 0:待提交 1：待审核 2：已通过 3：已驳回
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
    check_time:{//审批时间
        type: db.DATE,
        allowNull: true
    },
    askforleave_checker_id: {//审批人user_id
        type: db.ID,
        allowNull: true
    },
    askforleave_refuse_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    }
});
