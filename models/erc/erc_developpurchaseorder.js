/** 研发项目--材料采购 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_developpurchaseorder', {
    developpurchaseorder_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    develop_id: {              //待摊资产项目ID
        type: db.STRING(30),
        allowNull: false
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    purchaseorder_code: {//采购单编号
        type: db.STRING(30),
        allowNull: true
    },
    purchaseorder_creator: {//采购人
        type: db.STRING(50),
        allowNull: true
    },
    supplier_id: {//采购的供应商
        type: db.STRING(30),
        allowNull: true
    }
});
