const db = require('../../util/db');
/**供应商**/
module.exports = db.defineModel('tbl_erc_supplier', {
    supplier_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    supplier: { //供应商编号
        type: db.STRING(100),
        allowNull: false
    },
    supplier_name: {
        type: db.STRING(50),
        defaultValue: '',
        allowNull: false
    },
    supplier_short: { //简称
        type: db.STRING(20),
        defaultValue: '',
        allowNull: true
    },
    supplier_province: {
        type: db.STRING(20),
        allowNull: true
    },
    supplier_city: {
        type: db.STRING(20),
        allowNull: true
    },
    supplier_district: {
        type: db.STRING(20),
        allowNull: true
    },
    supplier_address: { //地址
        type: db.STRING(100),
        defaultValue: '',
        allowNull: true
    },
    supplier_fax: { //传真
        type: db.STRING(100),
        defaultValue: '',
        allowNull: true
    },
    supplier_contact: { //联系人
        type: db.STRING(100),
        defaultValue: '',
        allowNull: true
    },
    supplier_phone: { //联系方式
        type: db.STRING(100),
        defaultValue: '',
        allowNull: true
    },
    supplier_description: { //经营范围
        type: db.STRING(200),
        defaultValue: '',
        allowNull: true
    },
    supplier_proportion: { //采购比率
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: false
    },
    supplier_remarks: { //备注
        type: db.STRING(500),
        defaultValue: '',
        allowNull: true
    },

    supplier_class: { //供应商类别
        type: db.STRING(5),
        allowNull: true
    },
    supplier_tax_rate: { //适用税率
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: false
    },
    supplier_way: {//结算方式 预付后款到发货  月结结算
        type: db.STRING(5),
        allowNull: true
    },
    supplier_advance_ratio: {//预付比例
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    supplier_number_days: {//月结天数
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    supplier_bank_no: { //供应商银行账号
        type: db.STRING(30),
        allowNull: true
    },

});
