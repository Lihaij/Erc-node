/* 业务代码表 */
const db = require('../../util/db');

module.exports = db.defineModel('tbl_biz_code', {
    biz_code_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    code_name: {
        type: db.STRING(20),
        allowNull: false
    },
    code_type: {
        type: db.INTEGER,
        allowNull: true
    },
    record_year: {
        type: db.INTEGER,
        allowNull: false,
    },
    record_month: {
        type: db.INTEGER,
        allowNull: false
    },
    record_day: {
        type: db.INTEGER,
        allowNull: true
    },
    current_index: {
        type: db.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
});
