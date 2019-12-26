const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**文件接收人处理状态表 **/
module.exports = db.defineModel('tbl_erc_docuserstate', {
    docuserstate_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    document_id: {
        type: db.ID,
        allowNull: true
    },
    user_id: {
        type: db.ID,
        allowNull: true
    },
    read_state: { // 0未读 1已读
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: false
    }
});