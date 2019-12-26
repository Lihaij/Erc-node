/**
 * 资金账户调整
 */

const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_capitalaccountchange', {
    capitalaccountchange_id: { //
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: { //机构id
        type: db.IDNO,
        allowNull: false
    },
    capitalaccountchang_code: { //调整单编号
        type: db.STRING(100),
        allowNull: true
    },
    capitalaccountchang_out: { //调出账户
        type: db.STRING(100),
        allowNull: true
    },
    capitalaccountchang_into: { //调入账户
        type: db.STRING(100),
        allowNull: true
    },
    capitalaccountchang_money: { //调整金额(单位：分)
        type: db.INTEGER,
        allowNull: true
    },
    capitalaccountchang_remark: { //备注
        type: db.STRING(500),
        allowNull: true
    },
    capitalaccountchang_creator: { //操作人
        type: db.STRING(50),
        allowNull: true
    }
});