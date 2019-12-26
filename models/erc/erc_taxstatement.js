/** 退货单表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_taxstatement', {
    taxstatement_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    taxstatement_code: {
        type: db.ID,
        allowNull: false
    },
    tax_type: {//税务类型
        type: db.IDNO,
        allowNull: false
    },
    tax_sub_type: {//税务子类型
        type: db.IDNO,
        allowNull: false
    },
    value_length: {
        type: db.IDNO,
        allowNull: false
    },
    tax_value: {//值
        type: db.STRING(255),
        defaultValue: '',
        allowNull: false
    },
    start_date: {
        type: db.DATE,
        allowNull: false
    },
    end_date: {
        type: db.DATE,
        allowNull: false
    },
    verify_state: {//审批人状态
        type: db.ID,
        allowNull: true
    },
    verify_user: {//审批人user_id
        type: db.ID,
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    biz_code: {
        type: db.ID,
        allowNull: true
    },
});
