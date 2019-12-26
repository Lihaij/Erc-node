const db = require('../../util/db');
/**员工组织架构表**/
module.exports = db.defineModel('tbl_erc_custorgstructure', {
    custorgstructure_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: db.ID,
        allowNull: false
    },
    department_id: {//部门
        type: db.ID,
        allowNull: false
    },
    position_id: {//岗位
        type: db.ID,
        allowNull: false
    }
});