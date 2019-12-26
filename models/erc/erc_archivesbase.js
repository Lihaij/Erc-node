/** 部门 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_archives_base', {
    archivesbase_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.BIGINT,
        allowNull: true
    },

    archives_type: {//档案类型
        type: db.INTEGER,
        allowNull: false
    },
     build_time: {//形成时限要求
        type: db.INTEGER,
        allowNull: true
    },
    manage_time: {//部门管理时间要求
        type: db.INTEGER,
        allowNull: true
    },
    dep_keeper_id: {//部门归档责任人
        type: db.STRING(50),
        allowNull: true
    },
    company_keeper_id: {//部门归档责任人
        type: db.STRING(50),
        allowNull: true
    },
});
