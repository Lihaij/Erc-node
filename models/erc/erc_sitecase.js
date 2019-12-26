const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**商城案例维护 **/
module.exports = db.defineModel('tbl_erc_sitecase', {
    case_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    case_title: {
        type: db.STRING(200),
        allowNull: true
    },
    case_subtitle: {
        type: db.STRING(200),
        allowNull: true
    },
    case_content: {
        type: db.TEXT(),
        allowNull: true
    }
});
