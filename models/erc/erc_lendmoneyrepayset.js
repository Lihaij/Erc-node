const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_lendmoneyrepayset', {
    lendmoneyrepayset_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    lendmoney_id: {
        type: db.IDNO,
        allowNul: true
    },
    repay_date: {
        type: db.DATE,
        allowNull: true
    },
    repay_money: {
        type: db.STRING(100),
        allowNull: true
    },
    domain_id: {
        type: db.INTEGER,
        allowNull: true
    },
    operator_id: {
        type: db.STRING(100),
        allowNull: true
    },
    is_repay: {
        type: db.INTEGER,
        allowNull: true
    }
})