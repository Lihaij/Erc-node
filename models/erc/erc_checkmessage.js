const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_checkmessage', {
    checkmessage_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    check_id: {
        type: db.IDNO,
        allowNull: true
    },
    check_type: {
        type: db.STRING(20),
        allowNull: true
    },
    check_owner: {
        type: db.STRING(20),
        allowNull: true
    },
    auth_type: {
        type: db.STRING(20),
        allowNull: true
    },
    order_id: {
        type: db.ID,
        allowNull: true
    },
    srv_id: {
        type: db.IDNO,//相关业务主键
        allowNull: true
    },
    check_message: {
        type: db.STRING(1000),
        defaultValue: '',
        allowNull: true
    },
    check_state: {
        type: db.STRING(4),
        allowNull: true
    },
    operater_id: {
        type: db.ID
    },
    operater_name: {
        type: db.STRING(100)
    },
    ordermateriel_id: {
        type: db.ID,
        allowNull: true
    }
});
