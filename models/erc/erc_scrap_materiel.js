const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**物料报废配置 **/
module.exports = db.defineModel('tbl_erc_scrap_materiel', {
    scrap_setting_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    materiel_id: {
        type: db.IDNO,
        allowNull: false
    },
    scrap_materiel_id: {
        type: db.IDNO,
        allowNull: false
    },
    scrap_number: {
        type: db.INTEGER,
        allowNULL: true,
        defaultValue: 0
    }
});
