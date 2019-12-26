/** 收货单 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_receipt', {
    receipt_id: {//收货单号，RT开头
        type: db.ID,
        primaryKey: true,
        allowNull: false
    },
    purchaseorder_id: {//采购单id
        type: db.ID,
        allowNull: false
    },
    domain_id: {//机构id
        type: db.IDNO,
        allowNull: false
    },
    supplier_id: {//供应商id
        type: db.IDNO,
        allowNull: true
    },
    check_state: { //品质检验状态，0待审核，1部分检验，2全部检验
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
    biz_code: {
        type: db.ID,
        allowNull: true
    }
});
