/**
 * 可供评价的评价内容
 * Created by BaiBin on 2019/3/4.
 */

const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_evaluatetype', {
    evaluate_type_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    evaluate_type_text: {
        type: db.STRING(100),//评价可选内容
        allowNull: false
    },
    evaluate_type_score: {
        type: db.INTEGER,//评价分数
        allowNull: false
    },
});