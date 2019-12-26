/** 产品表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_financerecord', {
    financerecord_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    financerecord_code: {
        type: db.ID,
        allowNull: false
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    bill_date: {
        type: db.STRING(32),
        allowNull: false
    },
    wms_type: {//进销存类型/1入库/2出库
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    manage_type: {//出入库类型/1采购销售/2生产/3其他/4委外
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    organization: {//对应单位
        type: db.STRING(64),
        allowNull: true
    },
    org_type: {//对应类型
        type: db.STRING(10),
        allowNull: true
    },
    total_amount: {//数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    total_price: {//金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    whether_RD: {//是否生成记账凭证，物料收发汇总表生成记账凭证，新增recordingvouchersc，recordingvoucherdetailsc时用到的标志，
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    }
});
