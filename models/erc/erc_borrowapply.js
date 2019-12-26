/**
 * 借款申请
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_borrowapply', {
    borrowapply_id: { //
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: { //机构id
        type: db.IDNO,
        allowNull: false
    },
    borrowapply_code: { //申请借款单号
        type: db.STRING(100),
        allowNull: true
    },
    borrowapply_gathertype: { //收款人类别
        type: db.STRING(5),
        allowNull: true
    },
    borrowapply_gathersubject: { //收取款项人 包括 员工，供应商，客户，其他相关主体
        type: db.STRING(50),
        allowNull: true
    },
    borrowapply_money: { //借款金额(单位：分)
        type: db.INTEGER,
        allowNull: true
    },
    borrowapply_remark: { //备注
        type: db.STRING(500),
        allowNull: true
    },
    borrowapply_accountname: { //支付至账户名称
        type: db.STRING(100),
        allowNull: true
    },
    borrowapply_bankname: { //支付至银行名称
        type: db.STRING(100),
        allowNull: true
    },
    borrowapply_bankno: { //支付至银行账号
        type: db.STRING(100),
        allowNull: true
    },
    borrowapply_state: { //状态  0待提交，1已提交，2通过，3拒绝
        type: db.INTEGER,
        allowNull: true
    },
    borrowapply_operation: { //操作人
        type: db.STRING(100),
        allowNull: true
    },
    borrowapply_examine: { //审批人
        type: db.STRING(100),
        allowNull: true
    },
    borrowapply_examine_time: { //审批时间
        type: db.DATE,
        allowNull: true
    },
    borrowapply_refuse_remark: { //驳回说明
        type: db.STRING(300),
        allowNull: true
    },
});