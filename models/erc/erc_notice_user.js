/** 接收通知公告人员表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_notice_user', {
    notice_user_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    notice_id: {//公告ID
        type: db.IDNO,
        allowNull: false
    },
    domain_id: {//接收公告部门ID
        type: db.IDNO,
        allowNull: false
    },
    user_id: { //接收人ID
        type: db.ID,
        defaultValue: '',
        allowNull: false
    },
    read_state: {//是否阅读 0:未读 1：已读
        type: db.STRING(2),
        defaultValue: '0',
        allowNull: false
    }
});
