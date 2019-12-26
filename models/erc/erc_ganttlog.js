const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_ganttlog', {
    ganttlog_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    gantttasks_id: {
        type: db.IDNO,
        allowNull: false
    },
    order_id: {
        type: db.ID,
        allowNull: false
    },
    update_reason: {//修改原因
        type: db.STRING(4),
        allowNull: true
    },
    remark: {
        type: db.STRING(500),
        allowNull: true
    },
    update_content: {
        type: db.STRING(500),
        allowNull: true
    },
    operator_id: {//操作员
        type: db.ID,
        allowNull: true
    }
});