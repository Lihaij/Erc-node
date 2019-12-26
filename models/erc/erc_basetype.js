const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**系统基础数据类型表**/
module.exports = db.defineModel('tbl_erc_basetype', {
    basetype_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    basetype_code: {//数据编码
        type: db.STRING(30),
        allowNull: true
    },
    basetype_name: {//数据名称
        type:db.STRING(100),
        allowNull: true
    }
});
