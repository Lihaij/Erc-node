/** 户型物料 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_domainsignworker', {
    domainsignworker_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: false
    },
    user_id: {
        type: db.ID,
        allowNull: false
    },
    domainsign_date: {
        type: db.DATEONLY,
        allowNull: false
    },
    domainsign_deposit: {
        type: db.INTEGER,
        allowNull: false
    },
    domainsign_remark: {
      type: db.STRING(200),
      defaultValue: '',
      allowNull: false
    }
});
