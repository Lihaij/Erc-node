const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_salaryotherdetail', {
    salaryotherdetail_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    salaryother_id: {
        type: db.IDNO,
        allowNull: false
    },
    user_id: {
        type: db.STRING(20),
        allowNull: true
    },
    salaryotherdetail_money: {
        type: db.DOUBLE(11, 2),
        defaultValue: 0,
        allowNull: true
    },
    salaryotherdetail_productivetask_code: {
        type: db.STRING(50),
        allowNull: true
    },
    salaryotherdetail_remark: {
        type: db.STRING(200),
        allowNull: true
    },
});