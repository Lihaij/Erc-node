/** 品质检验单*/
const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_qualitycheck', {
    qualitycheck_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    qualitycheck_code: {
        type: db.ID,
        allowNull: false
    },
    purchaseorder_id: {//采购单ID
        type: db.ID,
        allowNull: false
    },
    user_id: {//质检人
        type: db.ID,
        allowNull: false
    },
    domain_id: {
        type: db.IDNO,
        allowNull: false
    },
    supplier_id: {//供应商id
        type: db.IDNO,
        allowNull: false
    },
    biz_code: {
        type: db.ID,
        allowNull: true
    },
});
