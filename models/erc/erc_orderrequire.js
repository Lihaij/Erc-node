/**
 * Created by BaiBin on 2017/11/13.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_orderrequire', {
    require_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    type_id: {
        type: db.ID,
        allowNull: false
    },
    require_name: {//空间类型
        type: db.STRING(50),
        allowNull: true
    },
    require_description: {//空间
        type: db.STRING(300),
        allowNull: true
    },
    require_hidden: {//空间
        type: db.STRING(50),
        allowNull: true
    },
    require_user_id: {
        type: db.ID,
        allowNull: true
    }
});
