/** 任务 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_task', {
    task_id: {//任务单号
        type: db.ID,
        primaryKey: true
    },
    domain_id: {//机构id
        type: db.IDNO,
        allowNull: true
    },
    task_name: {//任务名称
        type: db.STRING(500),
        allowNull: true
    },
    task_type: {//任务类型 TASKTYPE
        type: db.STRING(4),
        allowNull: true
    },
    task_priority: {//优先级 TASKPRORITY
        type: db.STRING(4),
        allowNull: true
    },
    task_publisher: {//发布者(user_id)
        type: db.ID,
        allowNull: true
    },
    task_performer: {//执行者(user_id),审批时填写审批人user_id
        type: db.ID,
        allowNull: true
    },
    task_state: {//状态 TASKSTATE
        type: db.STRING(4),
        allowNull: true
    },
    task_complete_date: {//完成时间
        type: db.DATE,
        allowNull: true
    },
    task_review_code: {//审批单号(采购申请单号、销售单号）
        type: db.ID,
        allowNull: true
    },
    review_id: {//订单评审的id
        type: db.ID,
        allowNull: true
    },
    task_description: {//任务描述
        type: db.STRING(300),
        allowNull: true
    },
    task_remark: {//任务备注
        type: db.STRING(300),
        allowNull: true
    },
    task_group: {//任务分组
        type: db.STRING(30),
        allowNull: true
    },
    end_time:{//完成时间
        type: db.DATE,
        allowNull: true
    },
    taskallotuser_level: { // 任务级别
      type: db.INTEGER,
      allowNull: true
    },
    customtaskallot_id: {
      type: db.IDNO,
      allowNull: true
    },
    require_complate_time:{//要求完成时间
        type: db.DATE,
        allowNull: true
    },
    task_classify: {
        type: db.INTEGER,
        allowNull: true,
        defaultValue: 1
    }
});
