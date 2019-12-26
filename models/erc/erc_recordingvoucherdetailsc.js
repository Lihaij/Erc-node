/** 记账凭证明细（资金支出S，客户收款C） **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_recordingvoucherdetailsc', {
    recordingvoucherdetailsc_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    recordingvouchersc_id: {//记账凭证id
        type: db.ID,
        allowNull: false
    },
    recordingvoucherdetailsc_digest: {//摘要
        type: db.STRING(100),
        allowNull: true
    },
    recordingvoucherdetailsc_accsum: {//总账科目text
        type: db.STRING(100),
        allowNull: true
    },
    recordingvoucherdetailsc_activeAccount: {//明细科目text
        type: db.STRING(100),
        allowNull: true
    },
    recordingvoucherdetailsc_accsum_code: {//总账科目code
        type: db.STRING(20),
        allowNull: true
    },
    recordingvoucherdetailsc_activeAccount_code: {//明细科目code
        type: db.STRING(20),
        allowNull: true
    },
    recordingvoucherdetailsc_debite: {//借方金额
        type: db.STRING(100),
        allowNull: true
    },
    recordingvoucherdetailsc_credit: {//贷方金额
        type: db.STRING(100),
        allowNull: true
    },
    recordingvoucherdetailsc_type: {// 0贷，1借, 2平
        type: db.STRING(5),
        allowNull: true
    },
    recordingvoucherdetailsc_GLtype: {// 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        type: db.STRING(5),
        allowNull: true
    },
    domain_id: {//机构id
        type: db.IDNO,
        allowNull: false
    },
    recordingvoucherdetailsc_depart_id: {//部门Id
        type: db.STRING(10),
        allowNull: true
    },
    recordingvoucherdetailsc_carryover_state: {//结转状态 默认0，结转1
        type: db.STRING(10),
        allowNull: true
    },
});
