/** 发票物料清单*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_taxinvoicmateriel', {
    taxinvoicmateriel_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    invoice_id: {
        type: db.IDNO,
        allowNull: false
    },
    materiel_code: {//货物代码
        type: db.STRING(20),
        allowNull: true
    },
    materiel_name: {//货物名称
        type: db.STRING(100),
        allowNull: true
    },
    materiel_format: {
        type: db.STRING(100),
        allowNull: true
    },
    materiel_unit: {
        type: db.STRING(20),
        allowNull: true
    },
    materiel_amount: {
        type: db.INTEGER,
        allowNull: true
    },
    materiel_tax_price: {
        type: db.DOUBLE,
        allowNull: true
    },
    materiel_tax: {
        type: db.DOUBLE,
        allowNull: true
    },
    materiel_price: {
        type: db.DOUBLE,
        allowNull: true
    }
});
