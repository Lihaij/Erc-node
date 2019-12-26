const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**文控管理详情 **/
module.exports = db.defineModel('tbl_erc_docdetail', {
    docdetail_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    document_id: {
        type: db.ID,
        allowNull: false
    },
    clause_no: { //条款编号
        type: db.STRING(30),
        allowNull: true
    },
    clause_title: {//条款
        type: db.STRING(2500),
        allowNull: true
    },
    user_ids: {//相关负责人，多个字符串用英文逗号连接
        type: db.STRING(500),
        allowNull: true
    }
});