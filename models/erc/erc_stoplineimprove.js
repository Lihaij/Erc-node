/** 改善措施表
*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_stoplineimprove', {
    stoplineimprove_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    stoplineimprove_code: { //编号
        type: db.STRING(50),
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    stoplineimprove_date: { //汇总的日期 星期一
        type: db.STRING(50),
        allowNull: true
    },
    stoplineimprove_begin_date: { //汇总的日期
        type: db.STRING(50),
        allowNull: true
    },
    stoplineimprove_end_date: { //汇总的日期
        type: db.STRING(50),
        allowNull: true
    },
    stoplineimprove_state: { //状态     0未确认 1已提交
        type: db.STRING(5),
        allowNull: true
    },
    stoplineimprove_creator: { //提交人     
        type: db.STRING(30),
        allowNull: true
    },
    stoplineimprove_creator_date: { //提交日期     
        type: db.STRING(30),
        allowNull: true
    },
});

