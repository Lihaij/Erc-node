const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_certificate', {
    certificate_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.INTEGER,
        allowNull: true
    },
    user_id: {
        type: db.STRING(100),
        allowNull: true
    },
    certificate_number: {//证件编号
        type: db.STRING(100),
        allowNull: true
    },
    certificate_name: {//证件名称
        type: db.STRING(100),
        allowNull: true
    },
    certificate_type: {//证件类型
        type: db.INTEGER,
        allowNull: true
    },
    organization: {//发证单位
        type: db.STRING(100),
        allowNull:true
    },
    validity_start: {//证件有效期-开始
        type: db.DATE,
        allowNull: true
    },
    validity_end: {//证件有效期
        type: db.DATE,
        allowNull: true
    },
    inspect_date: {//证件年检时间
        type: db.DATE,
        allowNull: true
    },
    keeper: {//保管责任人
        type: db.STRING(100),
        allowNull: true
    },
    certificate_state: {//状态
        type: db.INTEGER,
        allowNull: true,
        defaultValue: 1
    },
    ground_acreage: {//土地面积
        type: db.STRING(100),
        allowNull: true
    },
    build_acreage: {//建筑面积
        type: db.STRING(100),
        allowNull: true
    },
    is_public: {//是否向平台公开
        type: db.INTEGER,
        allowNull: true,
        defaultValue: 0
    }
});
