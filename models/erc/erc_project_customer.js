/**
 *  Created by Haij on 2019/10/24.
 */
const db = require('../../util/db');
/**项目客户基本信息**/
module.exports = db.defineModel('tbl_erc_project_customer', {
    project_customer_id: {//项目客户ID
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.BIGINT,
        allowNull: true
    },
    business_registration_number: {//工商登记证号
        type: db.STRING(50),
        allowNull: true
    },
    full_name: {//客户全称
        type: db.STRING(50),
        allowNull: true
    },
    address: {//客户地址
        type: db.STRING(100),
        allowNull: true
    },
    phone_number: {//客户联系电话
        type: db.STRING(50),
        allowNull: true
    },
    tax_rate: {//销售客户适用税率
        type: db.STRING(50),
        allowNull: true
    },
    legal_representative: {//法人代表名字
        type: db.STRING(50),
        allowNull: true
    },
    legal_representative_phone: {//法人联络手机
        type: db.STRING(50),
        allowNull: true
    },
    legal_representative_wecat: {//法人微信号
        type: db.STRING(50),
        allowNull: true
    },
    designated_contact_name: {//客户指定联络人名字
        type: db.STRING(50),
        allowNull: true
    },
    designated_contact_phone: {//客户指定联络人手机
        type: db.STRING(50),
        allowNull: true
    },
    designated_contact_wecat: {//客户指定联络人微信
        type: db.STRING(50),
        allowNull: true
    },
    designated_contact_qq: {//客户指定联络人QQ
        type: db.STRING(50),
        allowNull: true
    },
});