/**
 *  用户选择的评价内容
 * Created by BaiBin on 2019/3/4.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_evaluatecontent', {
    evaluate_conent_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    evaluate_id: { //评价id
        type: db.IDNO,
        allowNull: false
    },
    evaluate_type_id: {
        type: db.IDNO,//评价可选内容
        allowNull: true
    },
});