const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**楼盘管理 **/
module.exports = db.defineModel('tbl_erc_estateteam', {
    estateteam_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    estate_id: {
        type: db.IDNO,
        allowNull: false
    },
    user_id: {
        type: db.ID,
        allowNull: false
    }
});
