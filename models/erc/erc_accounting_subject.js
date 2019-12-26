/**
 * Created by BaiBin on 2019/1/12.
 */
/**
 * 会计科目
 * Created by BaiBin on 2019/1/8.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_accounting_subject', {
    accounting_subject_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    accounting_subject_code: {//会计科目编号
        type: db.INTEGER,
        allowNull: false
    },
    accounting_subject_name: {//会计科目名称
        type: db.STRING(40),
        allowNull: true,
        defaultValue: '',
    },
    accounting_subject_detail: {//会计科目明细名称
        type: db.STRING(40),
        allowNull: true,
        defaultValue: '',
    },
    accounting_subject_type_name: {//会计科目类型名称
        type: db.STRING(40),
        allowNull: true,
        defaultValue: '',
    },
    accounting_subject_type_code: {//会计科目类型编码
        type: db.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
});
