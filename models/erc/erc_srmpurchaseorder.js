/** 供应商采购单 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_srmpurchaseorder', {
    srm_purchaseorder_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    supplier_code: {
        type: db.STRING(100),
        allowNull: false
    },
    opor_id: {
        type: db.IDNO,
        unique: true,
        allowNull: false
    },
    opor_create_at: {
        type: db.DATE,
        allowNull: false
    },
    opor_shipaddr: {
        type: db.STRING(200),
        defaultValue: '',
        allowNull: false
    },
    srm_purchaseorder_state: {
        type: db.STRING(4),
        allowNull: false
    }
}, {
    indexes: [{
        unique: true,
        fields: ['srm_purchaseorder_id']
    }]
});
