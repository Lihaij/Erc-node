/** 退货单表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_supplierinvoice', {
    invoice_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    supplier_id: {
        type: db.IDNO,
        allowNull: false
    },
    invoice_code: {//发票代码
        type: db.ID,
        allowNull: false
    },
    materiel_code: {//货物代码
        type: db.STRING(20),
        allowNull: false
    },
    materiel_name: {//货物名称
        type: db.STRING(100),
        allowNull: false
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
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    }
});
