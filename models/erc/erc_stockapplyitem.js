/** 出入库申请明细 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_stockapplyitem', {
    stockapplyitem_id: {//明细id
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    stockapply_id: {//申请单号
        type: db.ID,
        allowNull: false
    },
    materiel_id: {//物料id
        type: db.IDNO,
        allowNull: false
    },
    apply_amount: {//申请数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    apply_price: {
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    stock_operate_amount: {//本次操作的数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    remain_number: {//已入库数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    store_price: {
        type: db.DOUBLE,
        defaultValue: 0,
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
    stock_remarks: {//申请备注
        type: db.STRING(300),
        defaultValue: '',
        allowNull: true
    }
});
