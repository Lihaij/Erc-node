const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_gradedetail', {
    gradedetail_id: {
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
    grade_id: {
        type: db.IDNO,
        allowNull: true
    },
    point: {
        type: db.STRING(50),
        allowNull: true
    },
    advice: {
        type: db.STRING(500),
        allowNull: true
    }
})