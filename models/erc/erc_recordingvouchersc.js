/** 记账凭证（资金支出S，客户收款C） **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_recordingvouchersc', {
    recordingvouchersc_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    recordingvouchersc_code: {//记账凭证单号
        type: db.ID,
        allowNull: false
    },
    domain_id: {//机构id
        type: db.IDNO,
        allowNull: false
    },
    recordingvouchersc_depart_id: {//部门Id
        type: db.STRING(100),
        allowNull: true
    },
    recordingvouchersc_time: {//业务日期
        type: db.STRING(100),
        allowNull: true
    },
    recordingvouchersc_count: {//对应明细数
        type: db.INTEGER,
        allowNull: true
    },
    recordingvouchersc_type: {//区分   0资金支出，1客户收款，98，物料收发，99手工记账凭证,100银行账号资金调整
        type: db.STRING(5),
        allowNull: true
    },
    s_recordingvouchersc_type:{ //资金支出的付款类型
        type: db.INTEGER,
        allowNull: true
    },
    recordingvouchersc_user_id: {//创建人
        type: db.STRING(100),
        allowNull: true
    },

    recordingvouchersc_state: {//项目状态   0待提交 1审核中 2通过 3拒绝
        type: db.INTEGER,
        allowNull: true
    },
    recordingvouchersc_examine_time: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    recordingvouchersc_examine: {//审批人
        type: db.STRING(100),
        allowNull: true
    },
    recordingvouchersc_refuse_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    },

    recordingvouchersc_wms_type: {//物料收发记账凭证单据类型
        type: db.STRING(50),
        allowNull: true
    },
    recordingvouchersc_wms_organization: {//物料收发记账凭证对应单位
        type: db.STRING(300),
        allowNull: true
    },
    biz_code: {
        type: db.STRING(100),
        allowNull: true
    },
});
