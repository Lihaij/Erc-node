/** 产品表*/
const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_productplandetail', {
    product_dtl_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    product_plan_id: {
        type: db.IDNO,
        allowNull: false
    },
    materiel_id: {//产品规划物料ID
        type: db.IDNO,
        allowNull: true
    },
    src_materiel_id: {//产品规划对应投料ID
        type: db.IDNO,
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    prd_level: {
        type: db.IDNO,
        allowNull: true
    },
    design_number: {
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    loss_rate: {
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    workshop_id: {
        type: db.ID,
        allowNull: true
    },
    level_materiel_id: {//上级投料ID
        type: db.IDNO,
        allowNull: true
    },
});
