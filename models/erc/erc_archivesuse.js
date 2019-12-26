/** 档案外借申请 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_archivesuse', {
    archivesuse_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.BIGINT,
        allowNull: true
    },
    archives_id: {//档案id
        type: db.BIGINT,
        allowNull: true
    },
    archivesuse_state: {//状态
        type: db.INTEGER,
        allowNull: true
    },
    user_id: {//申请人
        type: db.ID,
        allowNull: true
    },
    purpose: {//用途
        type: db.STRING(200),
        allowNull: true
    },
    use_date: {//预计归还日期
        type: db.DATE,
        allowNull: true
    },

    checker_id: {//核准人
        type: db.STRING(50),
        allowNull: true
    },
    check_date: {//核准日期
        type: db.DATE,
        allowNull: true
    },
    refuse_remark: {//拒绝原因
        type: db.STRING(200),
        allowNull: true
    },
    revert_state: {//归还状态
        type: db.INTEGER,
        allowNull: true
    },
    revert_date: {//归还日期
        type: db.DATE,
        allowNull: true
    }
});
