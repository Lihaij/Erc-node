/** 研发项目--材料耗用 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_developconsume', {
    developconsume_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    develop_id: {
        type: db.STRING(30),
        allowNull: false
    },
    consume_code: {//耗用单编号
        type: db.STRING(100),
        allowNull: true
    },
    consume_creator: {//耗用人
        type: db.STRING(100),
        allowNull: true
    },
    consume_examine: {//审批人
        type: db.STRING(100),
        allowNull: true
    },
    consume_examine_time: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    consume_refuse_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    }
});
