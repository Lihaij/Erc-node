/**
 * Created by Cici.
 */
/** 交通接待报销申请详情 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_trafficreceptionexpensedetail', {
    tr_detail_id: {//
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {//机构ID
        type: db.IDNO,
        allowNull: true
    },
    tr_expense_list_code: {//交通接待报销申请CODE
        type: db.STRING(100),
        allowNull: true
    },
    tr_detail_fee_id:{ //预计费用类型ID
        type:db.STRING(100),
        defaultValue: 0,
        allowNull: true
    },
    tr_detail_expected_fee:{ //预计票金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    tr_detail_no_invoice_fee:{ //无发票金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    tr_detail_have_invoice_fee:{ //有发票金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    }
});