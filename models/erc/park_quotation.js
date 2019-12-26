/** 报价表单 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_park_quotation', {
    park_quotation_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {  //
        type: db.BIGINT,
        allowNull: true
    },
    purchase_id: {
        type: db.IDNO,
        allowNull: false
    },//采购id，对应的采购报价
    qutation_date: {
        type: db.DATE,
        allowNull: true
    },//报价日期
    quoted_price: {
        type: db.STRING(100),
        allowNull: true
    },//报价
    quoted_detail:{
        type: db.TEXT(),
        allowNull: true
    },//报价说明
    quoted_contact:{//报价联系人
        type: db.STRING(100),
        allowNull: true
    },
    quoted_phone:{//报价联系人手机
        type: db.STRING(100),
        allowNull: true
    },
    park_supplier_id: {//操作者-对应的是供应商ID
        type: db.STRING(200),
        allowNull: false
    }
});
