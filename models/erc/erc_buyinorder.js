const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**销售出库订单表 **/
module.exports = db.defineModel('tbl_erc_buyinorder', {
    bir_id: {
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
    bir_number: {//入库总数量
        type: db.IDNO,
        defaultValue: 0,
        allowNull: false
    },
    purchaseorder_id: {//采购订单号
        type: db.ID,
        allowNull: false
    },
    warehouse_id: {//仓库ID
        type: db.IDNO,
        allowNull: false
    },
    supplier_code: {//供应商编码
        type: db.STRING(30),
        allowNull: true
    },
    supplier_name: {//供应商名称
        type: db.STRING(30),
        allowNull: true
    },
    bir_phone: {//联系电话
        type: db.STRING(30),
        allowNull: true
    }
});
