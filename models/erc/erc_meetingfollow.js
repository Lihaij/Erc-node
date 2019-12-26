/** 会议跟进事件 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_meetingfollow', {
    meetingfollow_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    meeting_id: { //会议ID
        type: db.IDNO,
        allowNull: false
    },
    follow_remark: { //跟进事项描述
        type: db.STRING(100),
        allowNull: true
    },
    executor_id: {//实施责任人
        type: db.ID,
        allowNull: true
    },
    checker_id: {//验收责任人
        type: db.ID,
        allowNull: true
    },
    finish_date:{//要求完成时间
        type: db.DATE,
        allowNull: true
    }
});
