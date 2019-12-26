/* 域表 */
const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_landagent', {
    landagent_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    landagent_name: {
        type: db.STRING(100),
        allowNull: true
    },
    landagent_address: {
        type: db.STRING(100),
        allowNull: true
    },
    landagent_phone: {
        type: db.STRING(20),
        allowNull: true
    },
    landagent_contact: {
        type: db.STRING(50),
        allowNull: true
    }
});
