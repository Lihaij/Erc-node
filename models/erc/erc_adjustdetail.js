/**
 * 银行账号调整明细表
 * Created by BaiBin on 2019/3/15.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_adjustdetail', {
    adjustdetail_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    export_bank_no: {//导出账号 原始账号
        type: db.STRING(100),
        allowNull: true
    },
    import_bank_no: {//导入账号 调整后账号
        type: db.STRING(100),
        allowNull: true
    },
    adjust_money: {// 调整金额 * 100
        type: db.IDNO,
        defaultValue: 0,
        allowNull: false
    },
    operator_id: { //操作人
        type: db.ID,
        allowNull: true
    }
});