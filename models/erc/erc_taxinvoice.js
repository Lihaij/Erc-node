/** 退货单表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_taxinvoice', {
    invoice_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    corporateclients_id: {
        type: db.IDNO,
        allowNull: false
    },
    invoice_code: {//发票代码
        type: db.ID,
        allowNull: false
    },
    invoice_type: {//发票类型
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
    },
    resp_user_id: {
        type: db.ID,
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    }
});
