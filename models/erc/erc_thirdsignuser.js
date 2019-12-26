/** 户型物料 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**供应商和开发商管理员**/
module.exports = db.defineModel('tbl_erc_thirdsignuser', {
    thirdsignuser_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: false
    },
    supplier_id: {
        type: db.IDNO,
        allowNull: false
    },
    user_id: {
        type: db.ID,
        allowNull: false
    },
    third_sign_type: {
        type: db.IDNO,
        allowNull: false
    },
    summary: {
        type: db.STRING(100),
        allowNull: true
    },
});
