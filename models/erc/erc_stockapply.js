/** 出入库申请 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_stockapply', {
    stockapply_id: {//申请单号
        type: db.ID,
        primaryKey: true
    },
    domain_id: {//机构id
        type: db.IDNO,
        allowNull: true
    },
    apply_state: {//申请状态 0.待提交 1.待审批 2.未通过 3.已通过
        type: db.STRING(4),
        allowNull: true
    },
    apply_submit: {//申请提交人user_id
        type: db.ID,
        allowNull: true
    },
    apply_review: {//申请审批人user_id
        type: db.ID,
        allowNull: true
    },
    apply_review_date: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    apply_type: {//申请类型（出库、入库1）
        type: db.STRING(4),
        allowNull: true
    },
    apply_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    },
    apply_materiel_remark: {//申请备注
        type: db.STRING(300),
        defaultValue: '',
        allowNull: true
    }
});
