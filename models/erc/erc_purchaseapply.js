/* 采购单 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_purchaseapply', {
  purchaseapply_id: { //采购申请单号，AP开头
    type: db.STRING(30),
    primaryKey: true
  },
  app_domain_id: { //当前采购单所属domain
    type: db.IDNO,
    allowNull: true
  },
  apply_state: { //申请状态 0待提交，1已提交，2通过,3拒绝
    type: db.IDNO,
    allowNull: true
  },
  apply_applicant: { //申请人
    type: db.STRING(30),
    allowNull: true
  },
  apply_approver: { //审批人
    type: db.STRING(30),
    allowNull: true
  },
  approval_date: { //审批时间
    type: db.DATE,
    allowNull: true
  },
  description: { //描述
    type: db.STRING(100),
    allowNull: true
  },
  order_type: { //1销售订单，2项目施工编号
    type: db.IDNO,
    allowNull: true
  },
  apply_supplier: { //供应商
    type: db.STRING(20),
    allowNull: true
  },
  productivetask_code: { //生产单转外购，记录生产单号
    type: db.STRING(50),
    allowNull: true
  },
  biz_code: { //biz_code
    type: db.STRING(50),
    allowNull: true
  },
  data_source: { //申请单来源  1mrp，2手动申请
    type: db.STRING(5),
    allowNull: true
  }
});