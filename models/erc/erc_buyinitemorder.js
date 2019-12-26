const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**销售出库物料记录表 **/
module.exports = db.defineModel('tbl_erc_buyinitemorder', {
    bii_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {//门店id
        type: db.IDNO,
        allowNull: true
    },
    bir_code: {//入库单号
        type: db.ID,
        allowNull: false
    },
    purchaseorder_id: {//采购订单号
        type: db.ID,
        allowNull: false
    },
    order_id: {//销售单号
        type: db.STRING(30),
        allowNull: false
    },
    warehouse_id: {//仓库ID
        type: db.IDNO,
        allowNull: false
    },
    warehouse_zone_id: {
        type: db.IDNO,
        allowNull: true
    },
    materiel_id: {//物料ID
        type: db.IDNO,
        allowNull: false
    },
    bii_number: {//入库数量
        type: db.IDNO,
        defaultValue: 0,
        allowNull: false
    },
    soi_note: {//备注
        type: db.STRING(30),
        allowNull: true
    }
});
