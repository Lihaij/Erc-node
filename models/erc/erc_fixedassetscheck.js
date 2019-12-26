/** 固定资产验收 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_fixedassetscheck', {
    fixedassetscheck_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    fixedassetscheck_no: {//验收单编号
        type: db.ID,
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    user_id: {//验收人
        type: db.ID,
        allowNull: true
    },
    check_flag: {//提交审核方式 0.资产验收单列表tab页提交（驳回后可修改） 1：资产验收tab页提交，驳回后不可修改
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
    check_state: {//审批状态 0.待提交 1.待审批 2.未通过 3.已通过
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
    check_checker_id: {//审批人user_id
        type: db.ID,
        allowNull: true
    },
    check_check_date: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    check_refuse_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    }
});