/* 企业客户表 */
const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_corporateclients', {
    corporateclients_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    corporateclients_no: {//工商注册号
        type: db.ID,
        allowNull: false
    },
    domain_id: {
        type: db.IDNO,
        allowNull: false
    },
    corporateclients_name: {//客户名称
        type: db.STRING(100),
        allowNull: true
    },
    corporateclients_type: {//价格体系  从价格模板选取
        type: db.STRING(5),
        allowNull: true
    },
    corporateclients_address: {//客户地址
        type: db.STRING(100),
        allowNull: true
    },
    corporateclients_contact_phone: {//客户电话
        type: db.STRING(100),
        allowNull: true
    },
    corporateclients_legal_person: {//法人代表
        type: db.STRING(100),
        defaultValue: '',
        allowNull: true
    },
    corporateclients_way: {//结算方式 预付后款到发货  月结结算
        type: db.STRING(5),
        allowNull: true
    },
    corporateclients_advance_ratio: {//预付比例
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    corporateclients_number_days: {//月结天数
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    corporateclients_creditline: {  //信用额度
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    corporateclients_creditline_use: {  //已使用的信用额度
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    corporateclients_class: {  // 客户类型 0品牌体系客户  1定制体系客户
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    corporateclients_category: {  // 客户类别
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    corporateclients_scope: {  //信用额度范围   0 有限，1无限
        type: db.STRING(5),
        allowNull: true
    },
    invoice_type: {//发票类型 0普通发票 1专用发票
        type: db.STRING(5),
        allowNull: true
    },
    resp_user_id: {
        type: db.ID,
        allowNull: true
    },
});
