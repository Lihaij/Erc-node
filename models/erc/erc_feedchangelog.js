const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_feedchangelog', {
  feedchangelog_id: {
    type: db.IDNO,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: db.ID,
  },
  productivetaskdetail_id: {
    type: db.ID,
  },
  before_change: {
    type: db.INTEGER,
    allowNull: true
  },
  after_change: {
    type: db.INTEGER,
    allowNull: true
  },
  change_remark: {
    type: db.STRING(100),
    allowNull: true
  },
});