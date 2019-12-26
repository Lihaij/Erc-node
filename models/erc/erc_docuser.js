const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**文件发布对象 **/
module.exports = db.defineModel('tbl_erc_docuser', {
    docuser_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    document_id: {
        type: db.ID,
        allowNull: true
    },
    docdetail_id: {
        type: db.IDNO,
        allowNull: true
    },
    user_id: {
        type: db.ID,
        allowNull: true
    },
    usergroup_id: {//岗位
        type: db.IDNO,
        allowNull: true
    },
    read_state: { // 0未完成 1已完成
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: false
    }
});