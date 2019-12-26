/** WMS盘点管理**/
const db = require('../../util/db');
module.exports = db.defineModel('tbl_erc_checkinventory', {
    checkinventory_id: {//盘点单号
        type: db.STRING(30),
        primaryKey: true
    },
    domain_id: {//机构id
        type: db.IDNO,
        allowNull: true
    },
    warehouse_id: {//仓库id
        type: db.IDNO,
        allowNull: false
    },
    checkInventory_state: {//盘点状态(新任务、待审批、完成）
        type: db.STRING(4),
        allowNull: true
    },
    check_plan_date: {//计划盘点时间
        type: db.DATE,
        allowNull: true
    },
    check_actual_date: {//实际盘点时间
        type: db.DATE,
        allowNull: true
    },
    check_checker: {//盘点人
        type: db.STRING(30),
        allowNull: true
    },
    check_reviewer: {//审批人
        type: db.STRING(30),
        allowNull: true
    },
    check_review_date: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    warehouse_zone_id: {//仓区的id
        type: db.IDNO,
        allowNull: true
    }
});
