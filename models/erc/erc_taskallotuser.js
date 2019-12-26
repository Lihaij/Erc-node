/** 任务审核人员分配表 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_taskallotuser', {
  taskallotuser_id: {
    type: db.IDNO,
    autoIncrement: true,
    primaryKey: true
  },
  taskallot_id: {
    type: db.IDNO,
    allowNull: true
  },
  user_id: {
    type: db.ID,
    allowNull: true
  },
  domain_id: {
    type: db.IDNO,
    allowNull: true
  },
  taskallotuser_level: {
    type: db.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  customtaskallot_id: {
    type: db.IDNO,
    allowNull: true
  },
  islastpost: {
      type: db.INTEGER,
      defaultValue: 0,
      allowNull: true
  }
});