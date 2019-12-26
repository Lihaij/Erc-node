/** 物料表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_stockoutapply', {
    stockoutapply_id: {//出库申请单号
        type: db.ID,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    user_id: { //申请人
        type: db.ID,
        allowNull: false
    },
    performer_user_id: { //审核人
        type: db.STRING(50),
        defaultValue: null,
        allowNull: true
    },
    complete_date: { //完成日期
        type: db.DATE,
        allowNull: true
    },
    stockoutapply_state: { //状态 STOCKOUTAPPLYSTATE
        type: db.STRING(4),
        allowNull: true
    },
    stockoutapply_rebut_reason: {//驳回说明
        type: db.STRING(50),
        defaultValue: null,
        allowNull: true
    },
    stockoutapply_remark: {//备注
        type: db.STRING(50),
        defaultValue: null,
        allowNull: true
    },
});
