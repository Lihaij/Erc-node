const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**客户信息**/
module.exports = db.defineModel('tbl_erc_operator', {
    user_id: {
        type: db.ID,
        primaryKey: true
    },
    kujiale_appuid: { // 酷家乐用户名
      type: db.STRING(100),
      defaultValue: '',
      allowNull: false
    }
});
