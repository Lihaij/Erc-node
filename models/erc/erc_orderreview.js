/**
 * Created by BaiBin on 2017/11/16.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_orderreview', {
    review_id: {
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
    review_description:{
        type:db.STRING(300),
        allowNull: true
    },
    review_status:{
        type:db.STRING(30),
        allowNull: true
    },
    review_date:{
        type: db.DATEONLY,
        allowNull: true
    },
    duty_user_id:{
        type: db.ID,
        allowNull: true
    }
});