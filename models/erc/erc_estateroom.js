const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**房间管理 **/
module.exports = db.defineModel('tbl_erc_estateroom', {
    room_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    estate_id: {
        type: db.BIGINT(20),
        allowNull: false
    },
    roomtype_id: {
        type: db.BIGINT(20),
        allowNull: false
    },
    room_code: {
        type: db.STRING(30),
        allowNull: true
    },
    build: {
        type: db.STRING(20),
        allowNull: true
    },
    unit: {
        type: db.STRING(50),
        allowNull: true
    },
    room_no: {
        type: db.STRING(20),
        allowNull: true
    },
    order_id: {
        type: db.ID,
        defaultValue: '',
        allowNull: false
    }
});
