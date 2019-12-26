/** 收货单物料明细 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_receiptitem', {
    receiptitem_id: {//明细id
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    receipt_id: {//收货单号，RT开头
        type: db.ID,
        allowNull: false
    },
    materiel_id: {//物料id
        type: db.IDNO,
        allowNull: false
    },
    purchasedetail_id: {//采购单详情id
        type: db.IDNO,
        allowNull: false
    },
    receipt_item_number: {//收货数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    qualified_number: {//合格品数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
});
