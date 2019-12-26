/** 会议管理 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_meeting', {
    meeting_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: false
    },
    user_id: {//提交人id
        type: db.ID,
        allowNull: false
    },
    meeting_name: { //会议议题
        type: db.STRING(100),
        allowNull: true
    },
    start_time:{//会议开始时间
        type: db.DATE,
        allowNull: true
    },
    end_time:{//会议结束时间
        type: db.DATE,
        allowNull: true
    },
    meetingroom_id: {//会议地点
        type: db.ID,
        allowNull: true
    },
    meetinguser_id: {//会议室管理员
        type: db.ID,
        allowNull: true
    },
    equipmentuser_id: {//设备管理员
        type: db.ID,
        allowNull: true
    },
    host_id: {//会议主持人
        type: db.ID,
        allowNull: true
    },
    meetingroom_state: { //会议室状态 0:未确认 1：已确认
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
    host_state: { //会议主持人状态 0:未确认 1：已确认
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
    meetingequipment_state: { //会议室设备 0:未确认 1：已确认
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
    meeting_state: {//会议状态 0.待提交 1.已提交 2.已完成
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
    meeting_remark: { //会议记录
        type: db.STRING(1024),
        allowNull: true
    },
    meeting_remark_state: {//会议记录状态 0.待提交 1.已提交
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
    meeting_remark_user: {//会议记录人
        type: db.ID,
        allowNull: true
    },
    meeting_decision: { //会议决议
        type: db.STRING(1024),
        allowNull: true
    },
    meeting_decision_user: {//会议决议人
        type: db.ID,
        allowNull: true
    }
});
