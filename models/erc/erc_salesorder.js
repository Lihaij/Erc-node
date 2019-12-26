/* 乐宜嘉销售单 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_salesorder', {
    salesorder_id: { //SO开头
        type: db.ID,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    purchaseorder_domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    purchaseorder_id: {
        type: db.ID,
        allowNull: true
    },
    salesorder_name: {
        type: db.STRING(100),
        allowNull: true
    },
    salesorder_type: { //待明确
        type: db.ID,
        allowNull: true
    }
});
