/**
 * 评价
 * Created by BaiBin on 2019/3/4.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_evaluate', {
    evaluate_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    task_id: {
        type: db.ID,
        allowNull: false
    },
    evaluate_user: {//评价人
        type: db.ID,
        allowNull: false
    },
    evaluate_performer: {//任务执行人，被评价人
        type: db.ID,
        allowNull: false
    },
    evaluate_score: {
        type: db.INTEGER,//评价分数
        allowNull: true
    },
    evaluate_description: {
        type: db.STRING(100),//描述
        allowNull: true
    }
});