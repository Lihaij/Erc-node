/** 研发项目--材料采购明细 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_developpurchaseorderdetail', {
    developpurchaseorderdetail_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    developpurchaseorder_id: {
        type: db.STRING(30),
        allowNull: false
    },
    purchaseorderdetail_name: {//材料名称
        type: db.STRING(100),
        allowNull: true
    },
    purchaseorderdetail_format: {//规格型号
        type: db.STRING(100),
        allowNull: true
    },
    purchaseorderdetail_unit: {//单位
        type: db.STRING(30),
        allowNull: true
    },
    purchaseorderdetail_number: {//采购数量
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    purchaseorderdetail_price: {//采购单价
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    purchaseorderdetail_remark: {//备注
        type: db.STRING(100),
        allowNull: true
    }
});
