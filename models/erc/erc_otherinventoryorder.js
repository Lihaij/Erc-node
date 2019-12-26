/**其他收发存明细**/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_otherinventoryorder', {
    other_inventory_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {//机构id
        type: db.IDNO,
        allowNull: true
    },
    other_bill_code: {//单据编号
        type: db.ID,
        allowNull: false
    },
    os_order_id: {//源单编号
        type: db.STRING(30),
        allowNull: false
    },
    warehouse_id: {//仓库ID
        type: db.IDNO,
        allowNull: false
    },
    other_account_type: {//出入库类型(入库1)
        type: db.STRING(4),
        allowNull: true
    }
});