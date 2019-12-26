/** 交货批次物料明细（订单审核）**/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_deliveryitem', {
    deliveryitem_id: {//交货物料明细id
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    delivery_id: {//交货批次id
        type: db.ID,
        allowNull: false
    },
    materiel_id: {//物料id
        type: db.IDNO,
        allowNull: false
    },
    delivery_item_number: {//交货数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    }
});
