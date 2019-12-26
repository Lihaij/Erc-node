const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_checkflow', {
    check_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: db.ID
    },
    srv_id: {
        type: db.IDNO,//相关业务主键
        allowNull: true
    },
    check_type: {
        type: db.STRING(20),
        allowNull: false
    },
    check_owner: {
        type: db.STRING(20),
        allowNull: false
    },
    check_desc: {
        type: db.STRING(300)
    },
    optional_flag: {
        type: db.STRING(4),
        allowNull: false
    },
    check_state: { //CHECKSTATEINFO
        type: db.STRING(4),
        allowNull: true
    },
    operater_id: {
        type: db.ID
    },
    operater_name: {
        type: db.STRING(100)
    }
});
