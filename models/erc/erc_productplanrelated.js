/** 产品表*/
const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_productplanrelated', {
    product_rlt_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    product_plan_id: {
        type: db.IDNO,
        allowNull: false
    },
    materiel_id: {
        type: db.IDNO,
        allowNull: true
    },
    src_materiel_id: {
        type: db.IDNO,
        allowNull: true
    },
    rlt_materiel_code: {
        type: db.ID,
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    prd_type: {
        type: db.IDNO,
        allowNull: true
    },
    prd_number: {
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    }
});
