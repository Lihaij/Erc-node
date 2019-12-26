const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**客户积分类型**/
module.exports = db.defineModel('tbl_erc_pointtype', {
    pointtype_id: {
        type: db.IDNO,
        primaryKey: true
    },
    customerpoint_name: { //积分类型名称
        type: db.STRING(100),
        allowNull: false
    },
    base_point: {//基础积分
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    pointtype_remarks: {//备注
        type: db.STRING(500),
        allowNull: true
    }
});
