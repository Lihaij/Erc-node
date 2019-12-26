const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_certificateuse', {
    certificateuse_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    certificate_id: {//证照id
        type: db.INTEGER,
        allowNull: true
    },
    domain_id: {
        type: db.INTEGER,
        allowNull: true
    },
    user_id: {
        type: db.STRING(100),
        allowNull: true
    },
    use_reason: {//借出原因
        type: db.STRING(200),
        allowNull: true
    },
    revert_state: {
        type: db.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    revert_date: {//预计归还日期
        type: db.DATE,
        allowNull: true
    },
    revert_date_actual: {//实际归还时间
        type: db.DATE,
        allowNull: true
    },
    checker_id: {//审核人
        type: db.STRING(100),
        allowNull: true
    },
    check_date: {//审核日期
        type: db.DATE,
        allowNull: true
    },
    refuse_remark: {//拒绝原因
        type: db.STRING(200),
        allowNull: true
    },
    certificateuse_state: {//借用状态
        type: db.INTEGER,
        allowNull: true
    }

});
