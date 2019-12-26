const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/** 施工节点-户型 **/
module.exports = db.defineModel('tbl_erc_goconstructionnode', {
    gonode_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    roomtype_id: {//户型id
        type: db.IDNO,
        allowNull: false
    },
    gonode_name: {//节点名称
        type: db.STRING(100),
        allowNull: true
    },
    gostart_day: {
        type: db.INTEGER,
        allowNull: true
    },
    goend_day: {
        type: db.INTEGER,
        allowNull: true
    },
    gonode_index: {
        type: db.INTEGER,
        allowNull: true
    },
    gonode_description: {//节点描述
        type: db.STRING(200),
        allowNull: true
    },
    gonode_level: {//工序级别
        type: db.STRING(12),
        allowNull: true
    },
    gonode_duration: {//工序时长
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
});
