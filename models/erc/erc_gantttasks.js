const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_gantttasks', {
    gantttasks_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    node_id: {
        type: db.IDNO,
        allowNull: false
    },
    order_id: {
        type: db.ID,
        allowNull: false
    },
    text: {
        type: db.STRING(255),
        allowNull: true
    },
    start_date: {
        type: db.DATE,
        allowNull: true
    },
    end_date: {
        type: db.DATE,
        allowNull: true
    },
    duration: {
        type: db.INTEGER,
        allowNull: true
    },
    progress: {
        type: db.DOUBLE,
        allowNull: true
    },
    sortorder: {
        type: db.INTEGER,
        allowNull: true
    },
    parent: {
        type: db.INTEGER,
        allowNull: false
    },
    leader_id: {//负责人
        type: db.ID,
        allowNull: true
    },
    template_id: {
        type: db.IDNO,
        allowNull: true
    },
    task_state: { // TASKSTATE
        type: db.STRING(4),
        allowNull: false
    }
});
