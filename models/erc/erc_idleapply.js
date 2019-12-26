/** 闲置库存申请 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_idleapply', {
    idleapply_id: {//申请单号
        type: db.ID,
        primaryKey: true
    },
    domain_id: {//机构id
        type: db.IDNO,
        allowNull: true
    },
    order_id: {//销售订单号
        type: db.ID,
        allowNull: true
    },
    idle_apply_state: {//申请状态 1.待审批 2.已审核 3.驳回
        type: db.STRING(4),
        allowNull: true
    },
    idle_apply_submit: {//申请提交人user_id
        type: db.ID,
        allowNull: true
    },
    idle_apply_review: {//申请审批人user_id
        type: db.ID,
        allowNull: true
    },
    idle_apply_review_date: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    idle_apply_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    }
});
