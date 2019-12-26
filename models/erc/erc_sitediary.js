const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**商城装修日记维护 **/
module.exports = db.defineModel('tbl_erc_site_diary', {
    diary_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    diary_title: {
        type: db.STRING(200),
        allowNull: true
    },
    diary_subtitle: {
        type: db.STRING(200),
        allowNull: true
    },
    diary_content: {
        type: db.TEXT(),
        allowNull: true
    },
    diary_selected: {
        type: db.IDNO,
        allowNull: true,
    }
});
