/* 域表 */
const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_businessdomain', {
    businessdomain_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain: {
        type: db.STRING(100),
        unique: true
    },
    businesscustomer_type: {   //客户类型
        type: db.STRING(5),
        allowNull: true
    },
    businessregistration: {    //工商登记号
        type: db.STRING(100),
        allowNull: true
    },
    business_tax: {  //适用税率
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    business_contact_qq: {
        type: db.STRING(100),
        defaultValue: '',
        allowNull: true
    },
    business_contact_wechat: {
        type: db.STRING(100),
        defaultValue: '',
        allowNull: true
    },
    legalperson_contact: {
        type: db.STRING(100),
        defaultValue: '',
        allowNull: true
    },
    legalperson_phone: {
        type: db.STRING(100),
        defaultValue: '',
        allowNull: true
    },
    legalperson_contact_qq: {
        type: db.STRING(100),
        defaultValue: '',
        allowNull: true
    },
    legalperson_contact_wechat: {
        type: db.STRING(100),
        defaultValue: '',
        allowNull: true
    },
    mouthsettlement: {  //
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    settlementway: {    //
        type: db.STRING(5),
        allowNull: true
    },
});
