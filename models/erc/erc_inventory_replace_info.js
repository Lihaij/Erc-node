/**入库替代价格**/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_inventory_replace_info', {
    inventory_replace_info_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    third_id: {
        type: db.ID,
        allowNull: true
    },
    bill_code: {
        type: db.ID,
        allowNull: false
    },
    materiel_id: {
        type: db.IDNO,
        allowNull: false
    },
    replace_price: {
        type: db.DOUBLE,
        allowNull: false,
        defaultValue: 0
    },
    confirm_price: {
        type: db.DOUBLE,
        allowNull: false,
        defaultValue: 0
    },
    inventory_amount: {
        type: db.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    inventory_type: {//1采购入库/2销售出库/4生产领料/8委外生产领料
        type: db.INTEGER,
        allowNull: false
    },
    replace_state: {//1记录替代价格/2确定价格/3记账凭证
        type: db.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
});
