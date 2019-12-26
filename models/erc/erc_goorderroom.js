/** 户型空间 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_goorderroom', {
    goroom_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    roomtype_id: {//户型id
        type: db.IDNO,
        allowNull: false
    },
    goroom_type: {//空间类型
        type: db.STRING(20),
        allowNull: true
    },
    goroom_name: {//空间
        type: db.STRING(50),
        allowNull: true
    }
});
