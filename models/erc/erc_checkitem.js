/** WMS盘点单**/
const db = require('../../util/db');
module.exports = db.defineModel('tbl_erc_checkitem', {
    checkitem_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    checkinventory_id: {//盘点单号
        type: db.STRING(30),
        allowNull: true
    },
    materiel_id: {//物料id
        type: db.IDNO,
        allowNull: false
    },
    check_stock_amount: {//当前库存数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    check_actual_amount: {//盘点结果数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    check_profit: {//库存损益
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    }
});
