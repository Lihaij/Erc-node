/** 接收通知公告机构表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_notice_org', {
    notice_org_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    notice_id: {//公告ID
        type: db.IDNO,
        allowNull: false
    },
    domain_id: {//接收公告机构ID
        type: db.IDNO,
        allowNull: false
    },
    usergroup_id: {//接收公告角色组ID
        type: db.IDNO,
        allowNull: true
    },
    department_id: {//部门ID
        type: db.ID,
        allowNull: true
    }
});
