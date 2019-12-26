/** 消息通知人员表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_message_user', {
    message_user_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    message_id: {//ID
        type: db.ID,
        allowNull: false
    },
    domain_id: {
        type: db.IDNO,
        allowNull: false
    },
    user_id: { //接收人ID
        type: db.ID,
        defaultValue: '',
        allowNull: false
    },
    message_user_state: {//状态
        type: db.STRING(100),
        allowNull: true
    },
    message_start_date: { //开始日期
        type: db.DATE,
        allowNull: true
    },
    message_user_type: {//1公告 2散客装修单订单 8采购销售单 9审批状态更新
        type: db.STRING(100),
        allowNull: true
    },
    message_user_title: {//名称
        type: db.STRING(200),
        allowNull: true
    },
    read: {//名称
        type: db.STRING(5), // 0未读，1已读
        allowNull: true
    }
});

