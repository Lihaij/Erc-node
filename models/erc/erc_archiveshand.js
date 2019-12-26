const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_archiveshand', {
    archiveshand_id: {
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
    archiveshand_type: {//档案类型
        type: db.INTEGER,
        allowNull: true
    },
    archiveshand_name: {//档案名称
        type: db.STRING(100),
        allowNull: true
    },
    department_keeper: {//部门归档责任人
        type: db.STRING(100),
        allowNull: true
    },
    domain_keeper: {//公司归档责任人
        type: db.STRING(100),
        allowNull: true
    },
    archiveshand_state: {//状态
        type: db.INTEGER,
        allowNull: true,
        defaultValue: 1
    },
    place_date: {//归档日期
        type: db.DATE,
        allowNull: true
    }
})