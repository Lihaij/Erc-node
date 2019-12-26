/** 任务类型表 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_customtaskallot', {
  customtaskallot_id: {
    type: db.IDNO,
    autoIncrement: true,
    primaryKey: true
  },
  domain_id: {
    type: db.IDNO,
    allowNull: true
  },
  taskallot_id: {
    type: db.ID,
    allowNull: true
  },
  customtaskallot_name: { //任务名称
    type: db.STRING(30),
    allowNull: true
  },
  customtaskallot_describe: { //描述
    type: db.STRING(200),
    allowNull: true
  }
});