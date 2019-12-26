const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_salaryapply', {
    salaryapply_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    user_id: {
        type: db.STRING(20),
        allowNull: true
    },
    superior_user_id: {
        type: db.STRING(20),
        allowNull: true
    },
    salaryapply_money: {
        type: db.DOUBLE(11, 2),
        defaultValue: 0,
        allowNull: true
    },
    salaryapply_productivetask_code: {
        type: db.STRING(50),
        allowNull: true
    },
    salaryapply_remark: {
        type: db.STRING(200),
        allowNull: true
    },
    salaryapply_date: {
        type: db.STRING(70),
        allowNull: true
    },
    salaryapply_state: { //0不同意，1同意
        type: db.STRING(5),
        allowNull: true
    },
});