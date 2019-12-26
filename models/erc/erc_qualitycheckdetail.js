/** 品质检验单详情*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_qualitycheckdetail', {
    qualitycheckdetail_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    qualitycheck_id: {
        type: db.IDNO,
        allowNull: false
    },
    materiel_id: {
        type: db.IDNO,
        allowNull: false
    },
    purchasedetail_id: {//采购单详情ID
        type: db.IDNO,
        allowNull: false
    },
    qualified_number: {//合格品数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    unqualified_number: {//不合格品数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    remark: { //备注
        type: db.STRING(500),
        allowNull: true
    },
    finishStock_price: {//已入库价格
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    finishStock_number: {//已入库数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    order_id: {//对应销售单号
        type: db.STRING(30),
        allowNull: true
    },
    warehouse_id: {//仓库ID
        type: db.IDNO,
        allowNull: true
    },
    warehouse_zone_id: {//仓区的id
        type: db.IDNO,
        allowNull: true
    },
    stock_operate_amount: {//本次操作的数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    }
});
