/**
 * Created by BaiBin on 2017/10/24.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_materialpurchaseorder', {
    purchase_order_id: {
        type: db.ID,
        primaryKey: true
    },
    supplier_id: {
        type: db.ID,
        allowNull: false
    },
    purchaser_id: { //采购人ID
        type: db.ID,
        defaultValue: '',
        allowNull: false
    },
    delivery_address: { //送货地址
        type: db.STRING(300),
        defaultValue: '',
        allowNull: false
    },
    total_price: { //总金额
        type: db.DOUBLE,
        allowNull: true
    },
    status: { //状态
        type: db.ID,
        defaultValue: '1',
        allowNull: false
    },
    phone: { //联系电话
        type: db.STRING(20),
        defaultValue: '',
        allowNull: false
    },
    fax_no: { //传真号码
        type: db.STRING(50),
        defaultValue: '',
        allowNull: true
    },
    discount:{//整单折扣
        type: db.DOUBLE,
        allowNull: true
    },
    submit_date: { //提交日期
        type: db.DATE,
        allowNull: true
    },

});