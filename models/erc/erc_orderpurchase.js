
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_orderpurchase', {
    purchase_id: {//采购ID
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: db.ID,
        allowNull: false
    },
    purchase_type: {//采购类型: 集团采购，本地采购
        type: db.STRING(4),
        allowNull: true
    },
    supplier_domain_id: {//采购供应商
        type: db.IDNO,
        allowNull: true
    },
    purchase_list_state: {//采购单状态: 新建，部分采购，已完成
        type: db.STRING(4),
        allowNull: false
    },
    pre_delivery_date: { //预发货日期
        type: db.DATEONLY,
        allowNull: true
    },
    delivery_addr: {
        type: db.STRING(200),
        defaultValue: '',
        allowNull: true
    },
    change_flag: {//是否为变更记录，0：否；1：是
        type: db.STRING(4),
        defaultValue: '0'
    }
});
