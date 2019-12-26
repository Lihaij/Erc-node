/** 会议室设备管理 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_meetingroomequipment', {
    meetingroomequipment_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    meetingroom_id: { //会议室ID
        type: db.ID,
        allowNull: false
    },
    equipment_name: { //设备名称
        type: db.STRING(100),
        allowNull: true
    },
    equipment_unit: { //单位
        type: db.STRING(10),
        allowNull: true
    },
    equipment_num: { //数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    assets_id: {//固定，低值编号
        type: db.ID,
        allowNull: true
    },
    domain_id: {//机构ID
        type: db.IDNO,
        allowNull: false
    }
});
