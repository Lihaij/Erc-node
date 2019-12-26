const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**报废申请单 **/
module.exports = db.defineModel('tbl_erc_scrap', {
    scrap_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    scrap_no: {
        type: db.STRING(20),
        allowNull: true
    },
    scrap_apply_user: {//申请人
        type: db.STRING(50),
        allowNull: true
    },
    scrap_state: {      //申请状态  0未提交 1审核中 2通过   3拒绝
        type: db.STRING(5),
        allowNull: true
    },
    scrap_examine: {//审批人
        type: db.STRING(100),
        allowNull: true
    },
    scrap_examine_time: {//审批时间
        type: db.DATE,
        allowNull: true
    }
});