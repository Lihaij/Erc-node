const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_lendmoneyrepay', {
    lendmoneyrepay_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.INTEGER,
        allowNull: true
    },
    operator_id: {
        type: db.STRING(100),
        allowNull: true
    },
    lendmoney_id: {
        type: db.INTEGER,
        allowNull: true
    },
    repay_money: {
        type: db.STRING(100),
        allowNull: true
    },
    repay_interest: {
        type: db.STRING(100),
        allowNull: true
    },
    lendmoneyrepay_state: {
        type: db.INTEGER,
        allowNull: true
    },
    checker_id: {
        type: db.STRING(100),
        allowNull: true
    },
    check_date: {
        type: db.DATE,
        allowNull: true
    }

})