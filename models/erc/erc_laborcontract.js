const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_laborcontract', {
    laborcontract_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.INTEGER,
        allowNull: true
    },
    user_id: {
        type: db.STRING(100),
        allowNull: true
    },
    department_id: {
        type: db.STRING(100),
        allowNull: true
    },
    laborcontract_state: {
        type: db.INTEGER,
        allowNull: true
    },
    laborcontract_number: {
        type: db.STRING(100),
        allowNull: true
    },
    start_date: {
        type: db.DATE,
        allowNull: true
    },
    end_date: {
        type: db.DATE,
        allowNull: true
    },
    operator_id: {
        type: db.STRING(100),
        allowNull: true
    }
})