/** 部门 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_sealcreate', {
    sealcreate_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.BIGINT,
        allowNull: true
    },
    sealcreate_name: {//印章名称
        type: db.STRING(50),
        allowNull: true
    },
    sealcreate_type: {//印章类型
        type: db.INTEGER,
        allowNull: true
    },
    sealcreate_state: {//状态
        type: db.INTEGER,
        allowNull: true
    },
    purpose: {//用途
        type: db.STRING(200),
        allowNull: true
    },
    user_id: {//申请人
        type: db.ID,
        allowNull: true
    },
    material: {//印章材质
        type: db.STRING(200),
        allowNull: true
    },
    content: {//印章内容
        type: db.STRING(400),
        allowNull: true
    },
    keeper: {//保管员
        type: db.STRING(50),
        allowNull: true
    },
    use_range: {//使用范围
        type: db.STRING(200),
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
    is_borrow: {//是否已外借
        type: db.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    is_discard: {//是否已报废
        type: db.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    is_finish: {//是否已刻印完归位
        type: db.INTEGER,
        allowNull: true,
        defaultValue: 0
    }
});
