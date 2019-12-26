/**
 * Created by Szane on 17/6/30.
 */
/** 信息反馈**/

const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_feedback', {
    feedback_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    content: {
        type: db.STRING(1000),
        allowNull: false
    },
    creator: {
        type: db.ID,
        allowNull: false
    }
});
