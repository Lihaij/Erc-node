/**
 * Created by Szane on 17/6/19.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**工作日志 **/
module.exports = db.defineModel('tbl_erc_worklog', {
    worklog_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: db.ID,
        allowNull: false
    },
    gantttasks_id: {
        type: db.IDNO,
        allowNull: false
    },
    content: {
        type: db.STRING(200),
        allowNull: true
    },
    user_id: {
        type: db.ID,
        allowNull: false
    },
    log_type: {
        type: db.STRING(4),
        defaultValue: '1',
        allowNull: true
    }
});
