/**
 * Created by BaiBin on 2017/11/21.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_orderdesign', {
    design_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: db.ID,
        allowNull: false
    },
    require_id: {
        type: db.IDNO,
        allowNull: false
    },
    require_type: { // ORDERREQUIRETYPE
        type: db.STRING(5),
        allowNull: false
    },
    file_name:{
        type:db.STRING(50),
        allowNull: true
    },
    file_url:{
        type:db.STRING(50),
        allowNull: true
    },
    create_user_id:{
        type: db.ID,
        allowNull: true
    }
});
