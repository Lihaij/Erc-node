/**
 * Created by BaiBin on 2017/11/16.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_orderinternalreview', {
    internal_review_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: db.ID,
        allowNull: false
    },
    require_id: {
        type: db.ID,
        allowNull: false
    },
    file_id: {
        type: db.ID,
        allowNull: true
    },
    upload_date:{
        type: db.DATEONLY,
        allowNull: true
    },
    duty_user_id:{
        type: db.ID,
        allowNull: true
    }
});