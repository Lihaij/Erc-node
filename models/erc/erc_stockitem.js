/** 安全库存明细 **/
const db = require('../../util/db');
module.exports = db.defineModel('tbl_erc_stockitem', {
    stockitem_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    stockmap_id: {//库存id
        type: db.IDNO,
        allowNull: false
    },
    item_amount: {//库存数量(某一仓区的存储数量）
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    store_price: {
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    warehouse_id: {//仓库id
        type: db.IDNO,
        allowNull: false
    },
    warehouse_zone_id: {//仓区的id
        type: db.IDNO,
        allowNull: true
    }
});
