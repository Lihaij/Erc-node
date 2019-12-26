/** 退货单表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_return', {
    return_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    qualitycheck_id: {//品质检验单ID
        type: db.IDNO,
        allowNull: false
    },
    purchaseorder_id: {//采购单ID
        type: db.ID,
        allowNull: false
    },
    return_state: {//处理状态 0.待提交 1.待审批 2.未通过 3.已通过
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
    return_checker_id: {//审批人user_id
        type: db.ID,
        allowNull: true
    },
    return_check_date: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    return_refuse_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    }
});
