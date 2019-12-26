/* 域表 */
const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_affiliated_company', {
    affiliated_company_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    organizational_code: {//组织机构代码
        type: db.STRING(100),
        allowNull: true
    },
    company_name: {//公司名称
        type: db.STRING(100),
        allowNull: true
    },
    company_address: {//公司地址
        type: db.STRING(100),
        allowNull: true
    },
    corporate_representative: {//法人代表
        type: db.STRING(20),
        allowNull: true
    },
});
