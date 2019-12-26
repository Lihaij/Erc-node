/**
 * 收款规则
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_receivablesrule', {
    receivablesrule_id: { //规则id
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    receivables_rule_name: { //收款项名称
        type: db.STRING(30),
        allowNull: false
    },
    receivables_rule_rate: { //收款比例
        type: db.DOUBLE,
        allowNull: false
    },
    domain_id: { //机构id
        type: db.IDNO,
        allowNull: false
    },
});
