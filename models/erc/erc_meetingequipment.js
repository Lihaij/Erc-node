/** 会议需要设备 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_meetingequipment', {
    meetingequipment_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    meeting_id: { //会议ID
        type: db.IDNO,
        allowNull: false
    },
    meetingroomequipment_id: { //设备ID
        type: db.IDNO,
        allowNull: true
    },
    equipment_num: { //需要数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    }
});
