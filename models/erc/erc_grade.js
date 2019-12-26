/*5S评分*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_grade', {
    grade_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.BIGINT,
        allowNull: true
    },
    user_id: {
        type: db.STRING(100),
        allowNull: true
    },
    grade_number: {
        type: db.BIGINT,
        allowNull: true
    },
    grade_name: {
        type: db.STRING(50),
        allowNull: true
    },
    info: {
        type: db.STRING(500),
        allowNull: true
    },
    score: {
        type: db.STRING(50),
        allowNull: true
    },
    department_id: {
        type: db.STRING(30),
        allowNull: true
    },
    is_use: {
        type: db.INTEGER,
        allowNull: true
    }
})