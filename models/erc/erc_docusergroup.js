const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**文控管理外部文件发布对象 **/
module.exports = db.defineModel('tbl_erc_docusergroup', {
    docusergroup_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    document_id: {
        type: db.ID,
        allowNull: true
    },
    docdetail_id: {
        type: db.IDNO,
        allowNull: true
    },
    p_usergroup_id: {//部门
        type: db.IDNO,
        allowNull: true
    },
    usergroup_id: {//岗位
        type: db.IDNO,
        allowNull: true
    },
    department_id: {//部门
        type: db.ID,
        allowNull: true
    },
    position_id: {//岗位
        type: db.ID,
        allowNull: true
    }
});
