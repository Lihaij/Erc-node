/** 部门 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_sealdiscard', {
    sealdiscard_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.BIGINT,
        allowNull: true
    },
    user_id: {//申请人
        type: db.ID,
        allowNull: true
    },
    sealcreate_id: {//印章id
        type: db.INTEGER,
        allowNull: true
    },
    sealdiscard_state: {//状态
        type: db.INTEGER,
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
    }
});
