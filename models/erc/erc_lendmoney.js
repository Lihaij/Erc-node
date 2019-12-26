const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_lendmoney', {
    lendmoney_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    lendmoney_number: {
        type: db.STRING(100),
        allowNUll: true
    },
    domain_id: {
        type: db.INTEGER,
        allowNull: true
    },
    company_type: {
        type: db.INTEGER,
        allowNull: true
    },
    company_id: {
        type: db.STRING(100),
        allowNull: true
    },
    money: {
        type: db.STRING(100),
        allowNull: true
    },
    expire_date: {
        type: db.DATE,
        allowNull: true
    },
    interest_date: {
        type: db.DATE,
        allowNull: true
    },
    interest_rate: {
        type: db.STRING(100),
        allowNull: true
    },
    operator_id: {
        type: db.STRING(100),
        allowNull: true
    },
    cashier_id: {
        type: db.STRING(100),
        allowNull: true
    },
    lendmoney_state: {
        type: db.INTEGER,
        allowNull: true
    },
    arrive_date: {
        type: db.DATE,
        allowNull: true
    },
    arrive_money: {
        type: db.STRING(100),
        allowNull: true
    },
    is_repay: {
        type: db.INTEGER,
        allowNull: true
    }

})