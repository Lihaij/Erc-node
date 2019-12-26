/** 交货批次（订单审核）**/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_delivery', {
    delivery_id: {//交货批次id
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {//订单号
        type: db.ID,
        allowNull: false
    },
    delivery_state: {//交货状态
        type: db.STRING(4),
        allowNull: true
    },
    delivery_remark: {//备注
        type: db.STRING(100),
        allowNull: true
    },
    delivery_date: {//交货日期
        type: db.DATE,
        allowNull: true
    }
});
