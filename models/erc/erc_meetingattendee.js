/** 会议参会人员 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_meetingattendee', {
    meetingattendee_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    meeting_id: { //会议ID
        type: db.IDNO,
        allowNull: false
    },
    attendee_id: { //参会人员ID
        type: db.ID,
        allowNull: true
    },
    meetingattendee_state: { //状态 0:未确认 1：已确认
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    }
});
