const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**物料拆解 **/
module.exports = db.defineModel('tbl_erc_dismantle_materiel_item', {
    dismantle_materiel_item_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    dismantle_materiel_id: {
        type: db.IDNO,
        allowNull: false
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    materiel_id: {
        type: db.IDNO,
        allowNull: false
    },
    warehouse_id: {
        type: db.IDNO,
        allowNull: false
    },
    warehouse_zone_id: {
        type: db.IDNO,
        allowNull: false
    },
    dismantle_number: {
        type: db.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
});
