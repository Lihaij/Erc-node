/** 会议室维护 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_meetingroom', {
    meetingroom_id: {
        type: db.ID,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: false
    },
    meetingroom_name: { //会议室名称
        type: db.STRING(100),
        allowNull: true
    },
    meetinguser_id: {//会议室管理员
        type: db.ID,
        allowNull: true
    },
    equipmentuser_id: {//设备管理员
        type: db.ID,
        allowNull: true
    }
});
