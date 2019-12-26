const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**物料拆解 **/
module.exports = db.defineModel('tbl_erc_dismantle_materiel', {
    dismantle_materiel_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    biz_code: {
        type: db.ID,
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    warehouse_id: {
        type: db.IDNO,
        allowNull: false
    },
    submit_user_id: {
        type: db.ID,
        allowNull: false
    },
    assign_user_id: {
        type: db.ID,
        allowNull: false
    },
    dismantle_state: {
        type: db.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    complete_date: {
        type: db.DATE,
        allowNull: true,
    }
});
