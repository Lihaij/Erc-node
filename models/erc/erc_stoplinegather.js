/** 停线通知单（汇总）
 * 日计划影响因素表
*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_stoplinegather', {
    stoplinegather_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    stoplineimprove_id: {
        type: db.IDNO,
        allowNull: true
    },
    stoplinegather_date: { //汇总的日期，星期一
        type: db.STRING(50),
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    stoplinegather_require: { //评审项目
        type: db.STRING(50),
        allowNull: true
    },
    stoplinegather_remark: { //订单评审描述
        type: db.STRING(500),
        allowNull: true
    },
    stoplinegather_number: { //数量 
        type: db.INTEGER,
        allowNull: true
    },
    stoplinegather_duration: { //时长
        type: db.INTEGER,
        allowNull: true
    },
    stoplinegather_state: { //状态  0未确认 1已确认
        type: db.STRING(10),
        allowNull: true
    }
});

