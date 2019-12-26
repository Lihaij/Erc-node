/* 乐宜嘉销售单 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_sopricerecord', {
    pricerecord_id: { //SO开头
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: db.ID,
        allowNull: false
    },
    total_price: {//销售订单总价格
        type: db.DOUBLE,
        allowNull: true
    },
    sale_price: {//当次出库价格
        type: db.DOUBLE,
        allowNull: true
    },
    remain_price: {//剩余价格
        type: db.DOUBLE,
        allowNull: true
    }
});
