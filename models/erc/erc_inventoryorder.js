/**收发存明细**/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_inventoryorder', {
    ior_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {//机构id
        type: db.IDNO,
        allowNull: true
    },
    bill_code: {//单据编号
        type: db.ID,
        allowNull: false
    },
    bs_order_id: {//源单编号/采购入库:qualitycheck_id/产品入库和委外:productivetask_id/其他入库:stockapply_id
        type: db.STRING(30),
        allowNull: false
    },
    warehouse_id: {//仓库ID
        type: db.IDNO,
        allowNull: false
    },
    account_operate_type: {//出入库类型(3其他入库)
        type: db.INTEGER,
        allowNull: true
    },
    ior_contact: {//收货联系人
        type: db.STRING(30),
        allowNull: true
    },
    ior_phone: {//联系电话
        type: db.STRING(30),
        allowNull: true
    },
    supplier_code: {//供应商编码
        type: db.STRING(30),
        allowNull: true
    },
    supplier_name: {//供应商名称
        type: db.STRING(30),
        allowNull: true
    }
});
