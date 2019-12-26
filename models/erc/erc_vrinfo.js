/**
 * Created by Szane on 17/5/25.
 */
/** VR效果图 **/

const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_vrinfo', {
    vr_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: db.ID,
        allowNull: false
    },
    vr_name: {//效果图名称
        type: db.STRING(200),
        allowNull: false
    },
    vr_url: {//效果图链接
        type: db.STRING(500),
        allowNull: true
    },
    vr_creator: {
        type: db.ID,
        allowNull: true
    }
});
