/** 产品工序物料 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_producemateriel', {
    producemateriel_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    produce_id: {
        type: db.IDNO,
        allowNull: false
    },
    produceprocess_id: {
        type: db.IDNO,
        allowNull: true
    },
    materiel_id: {
        type: db.IDNO,
        allowNull: false
    }
});
