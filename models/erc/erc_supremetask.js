/** 任务会中表 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_supremetask', {
  supremetask_id: {
      type: db.ID,
      primaryKey: true
  },
  domain_id: {
    type: db.IDNO,
    allowNull: true
  },
  task_type: {//任务类型 TASKTYPE
    type: db.STRING(4),
    allowNull: true
  },
  customtaskallot_id: {
    type: db.IDNO,
    allowNull: true
  },
  task_group: {//任务分组
    type: db.STRING(30),
    allowNull: true
  },
  task_publisher: { //发布者(user_id)
    type: db.ID,
    allowNull: true
  },
  task_name: {//任务名称
    type: db.STRING(30),
    allowNull: true
  },
  task_description: {//任务描述
    type: db.STRING(300),
    allowNull: true
  },
  supremetask_state: {//TASKLISTSTATE
    type: db.STRING(4),
    allowNull: true
  },
  currenttask_level: {
    type: db.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  maxtask_level: {
    type: db.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
});