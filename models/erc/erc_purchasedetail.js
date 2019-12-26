const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_purchasedetail', {
    purchasedetail_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    purchase_id: {//采购申请单ID
        type: db.STRING(30),
        allowNull: true
    },
    materiel_id: {
        type: db.IDNO,
        allowNull: false
    },
    purchase_number: {//采购数量
        type: db.INTEGER,
        allowNull: true
    },
    purchase_price: { //采购单价
        type: db.DOUBLE,
        allowNull: true
    },
    remark: { //备注
        type: db.STRING(100),
        allowNull: true
    },
    order_ids: { //净需求表订单id，多个用','分隔
        type: db.STRING(200),
        allowNull: true
    },
    qualified_number: {//合格品数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    collect_number: {//已收货数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    source_apply_id: { //从哪个申请单明细来的
        type: db.STRING(50),
        allowNull: true
      },
});
