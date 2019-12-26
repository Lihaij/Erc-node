const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_orderworkflow', {
    order_id: {
        type: db.ID,
        allowNull: false
    },
    orderworkflow_state: {
        type: db.STRING(100),
        defaultValue: '',
        allowNull: false
    },
    orderworkflow_desc: {
        type: db.STRING(200),
        defaultValue: '',
        allowNull: false
    }
});
