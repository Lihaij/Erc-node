
/** 供应商采购单流程 **/
const db = require('../../util/db');
module.exports = db.defineModel('tbl_erc_purchaseworkflow', {
    srm_purchase_id: {
        type: db.ID,
        allowNull: false
    },
    purchase_workflow_state: {
        type: db.STRING(100),
        defaultValue: '',
        allowNull: false
    },
    purchase_workflow_desc: {
        type: db.STRING(200),
        defaultValue: '',
        allowNull: false
    }
});
