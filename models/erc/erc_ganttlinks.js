const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_ganttlinks', {
    ganttlinks_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    source: {
        type: db.INTEGER,
        allowNull: false
    },
    target: {
        type: db.INTEGER,
        allowNull: false
    },
    type: {
        type: db.STRING(1),
        allowNull: false
    },
    gantttasks_id: {
        type: db.ID
    }
});