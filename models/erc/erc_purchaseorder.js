/* 采购单 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_purchaseorder', {
  purchaseorder_id: { //采购单号，PO开头
    type: db.STRING(30),
    primaryKey: true
  },
  purchaseorder_domain_id: { //采购方
    type: db.IDNO,
    allowNull: true
  },
  order_id: { //对应销售单号
    type: db.STRING(30),
    allowNull: true
  },
  order_domain_id: { //销售方
    type: db.IDNO,
    allowNull: true
  },
  supplier_id: { //供应商ID
    type: db.IDNO,
    allowNull: true
  },
  remark: { //备注
    type: db.STRING(100),
    allowNull: true
  },
  purchaseorder_state: { //采购单状态，0未审核，1审核拒绝，2审核通过
    type: db.ID,
    allowNull: true
  },
  purchase_applicant: { //申请人
    type: db.STRING(30),
    allowNull: true
  },
  purchase_approver: { //审批人
    type: db.STRING(30),
    allowNull: true
  },
  approval_date: { //审批时间
    type: db.DATE,
    allowNull: true
  },
  check_state: { //品质检验状态，0待审核，1部分检验，2全部检验
    type: db.STRING(4),
    defaultValue: '0',
    allowNull: true
  },
  collect_state: { //收货状态，0待收货，1部分收货，2全部收货
    type: db.STRING(4),
    defaultValue: '0',
    allowNull: true
  },
  delivery_date: { //交货时间
    type: db.DATE,
    allowNull: true
  },
  biz_code: { //biz_code
    type: db.STRING(50),
    allowNull: true
  },
  source_apply_id: { //从哪个申请单来的
    type: db.STRING(50),
    allowNull: true
  },
  description: { //审批拒绝理由
    type: db.STRING(200),
    allowNull: true
  }
});