/** 固定资产申购 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_fixedassetspurch', {
    fixedassetspurch_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    fixedassetspurch_no: {//申购单编号
        type: db.ID,
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    department_id: {//申请部门
        type: db.ID,
        allowNull: true
    },
    purch_state: {//审批状态 0.待提交 1.待审批 2.未通过 3.已通过
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
    purch_checker_id: {//审批人user_id
        type: db.ID,
        allowNull: true
    },
    purch_check_date: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    purch_refuse_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    },
    biz_code: {
        type: db.STRING(50),
        defaultValue: '',
        allowNull: true
    },
});