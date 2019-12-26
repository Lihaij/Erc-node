const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_materialpurchaseorderdetail', {
    purchase_order_detail_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    purchasedetail_id:{ //采购申请单详情id
        type: db.STRING(30),
        allowNull: true
    },
    purchase_id: {//采购申请单ID
        type: db.STRING(30),
        allowNull: true
    },
    purchase_order_id: {//采购单ID
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
    check_status: {//采购项是否加入  采购单  1 加入 0 未加入
        type: db.STRING(30),
        defaultValue: '0',
        allowNull: true
    },
    delivery_time: { //预计到货时间
        type: db.DATE,
        allowNull: true
    },
    remark: { //备注
        type: db.STRING(100),
        allowNull: true
    },
    unit_price:{ //单价
        type:db.DOUBLE,
        allowNull:true
    },
    amount: { //金额
        type:db.DOUBLE,
        allowNull:true
    }
});
