/**
 * 工人
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_worker', {
    user_id: {
        type: db.ID,
        primaryKey: true
    },
    worker_skill: {
        type: db.STRING,
        allowNull: true
    }
});
