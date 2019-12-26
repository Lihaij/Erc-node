/** 投诉信息**/
const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_complaint', {
    complaint_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {//机构ID
        type: db.IDNO,
        allowNull: true
    },
    order_id: {//订单号
        type: db.ID,
        allowNull: true
    },
    complaint_customer_name: {//客户姓名
        type: db.STRING(30),
        allowNull: true
    },
    complaint_phone: {//客户手机
        type: db.STRING(20),
        allowNull: false
    },
    complaint_user_id: {//客户user_id
        type: db.ID,
        allowNull: true
    },
    complaint_content: {//投诉内容
        type: db.STRING(300),
        allowNull: true
    },
    complaint_state: {//投诉状态
        type: db.STRING(4),
        allowNull: true
    },
    complaint_responser: {//受理人
        type: db.ID,
        allowNull: true
    },
    complaint_handle_record: {//处置记录
        type: db.STRING(300),
        allowNull: true
    }
});