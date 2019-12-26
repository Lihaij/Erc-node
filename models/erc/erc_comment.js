/**
 * Created by Szane on 17/6/19.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**用户评论 **/
module.exports = db.defineModel('tbl_erc_comment', {
    comment_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: db.ID,
        allowNull: true
    },
    parent_id: {
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    gantttasks_id: {
        type: db.IDNO,
        allowNull: false
    },
    from_user_id: {
        type: db.ID,
        allowNull: false
    },
    from_name: {
        type: db.STRING(100),
        allowNull: true
    },
    to_user_id: {
        type: db.ID,
        allowNull: true
    },
    to_name: {
        type: db.STRING(100),
        allowNull: true
    },
    content: {
        type: db.STRING(200),
        allowNull: true
    }
});