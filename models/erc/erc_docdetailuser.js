const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**文控管理详情对应责任人 **/
module.exports = db.defineModel('tbl_erc_docdetailuser', {
    docdetailuser_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    docdetail_id: {
        type: db.IDNO,
        allowNull: false
    },
    document_id: {
        type: db.ID,
        allowNull: true
    },
    user_id: {
        type: db.ID,
        allowNull: false
    }
});