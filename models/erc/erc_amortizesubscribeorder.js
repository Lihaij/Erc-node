/** 待摊资产--材料申购 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_amortizesubscribeorder', {
    amortizesubscribeorder_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    amortize_id: {              //待摊资产项目ID
        type: db.STRING(30),
        allowNull: false
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    amortizebudget_id: {        //预算ID
        type: db.STRING(30),
        allowNull: false
    },
    subscribeorder_code: {//申购单编号
        type: db.STRING(30),
        allowNull: true
    },
    subscribeorder_creator: {//申购人
        type: db.STRING(50),
        allowNull: true
    },
    subscribeorder_state: {//状态  0新记录，1已提交，2通过，3拒绝
        type: db.INTEGER,
        allowNull: true
    },
    subscribeorder_examine: {//审批人
        type: db.STRING(100),
        allowNull: true
    },
    subscribeorder_examine_time: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    subscribeorder_refuse_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    },

});
