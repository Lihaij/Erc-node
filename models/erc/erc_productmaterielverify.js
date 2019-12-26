/** 产品表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_productmaterielverify', {
    materiel_verify_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    product_plan_id: {
        type: db.IDNO,
        allowNull: false
    },
    product_ppd_id: {
        type: db.IDNO,
        allowNull: false
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    require_id: {
        type: db.IDNO,
        allowNull: false
    },
    verify_type: {
        type: db.IDNO,
        allowNull: false
    }
});
