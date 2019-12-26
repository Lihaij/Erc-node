const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_salaryother', {
    salaryother_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    salaryother_code: {
        type: db.STRING(50),
        allowNull: true
    },
    salaryother_type: {
        type: db.STRING(20),
        allowNull: true
    },
    salaryother_remark: {
        type: db.STRING(200),
        allowNull: true
    },
    salaryother_confirm_user: {
        type: db.STRING(20),
        allowNull: true
    }
});