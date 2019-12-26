/**
 * 其他相关主体
 * Created by BaiBin on 2019/1/8.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_othermain', {
    other_main_id: {
        type: db.ID,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    creater_id: {//创建人
        type: db.ID,
        allowNull: true
    },
    other_main_code: {//企业组织代码
        type: db.STRING(30),
        allowNull: false
    },
    other_main_name: {//其他相关主体名称
        type: db.STRING(30),
        allowNull: false
    },
    bank_no: {//银行账号
        type: db.STRING(30),
        allowNull: false
    },
    other_main_remark: {//备注说明
        type: db.STRING(100),
        allowNull: true
    },
});