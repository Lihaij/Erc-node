const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**系统基础数据类型表**/
module.exports = db.defineModel('tbl_erc_basetypedetail', {
    basetypedetail_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    basetype_id: {
        type: db.IDNO,
        allowNull: true
    },
    domain_id: {
        type:db.STRING(20),
        allowNull: true
    },
    typedetail_no: {//顺序编码
        type: db.INTEGER,
        allowNull: true
    },
    typedetail_code: {//数据类型编码
        type:db.STRING(30),
        allowNull: true
    },
    typedetail_name: {//数据类型
        type:db.STRING(100),
        allowNull: true
    },
    other_type: {
        type:db.STRING(5),
        allowNull: true
    }
    
});
