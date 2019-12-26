/**
 * Created by Szane on 17/6/26.
 */
/** 工队信息（工长与工人）**/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_crew', {
    crew_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    foreman_id: {
        type: db.ID,
        allowNull: false
    },
    worker_id: {
        type: db.ID,
        allowNull: false
    }
});
