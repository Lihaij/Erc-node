/* 客户信用额度，预付款明细表 */
const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_creditlinedetail', {
    creditlinedetail_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    corporateclients_id: {//企业客户id
        type: db.IDNO,
        allowNull: false
    },
    creditlinedetail_type:{//类型  1增加2减少
        type: db.INTEGER,
        allowNull: true
    },
    creditlinedetail_businessid:{//业务单号
        type: db.STRING(100),
        allowNull: true
    },
    creditlinedetail_money:{//金额  本次收款或支出的金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    creditlinedetail_surplus_creditline:{//结余信用额度
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    creditlinedetail_surplus_advance:{//结余预付款金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    creditlinedetail_detail_type:{//0信用，1预付款
        type: db.STRING(5),
        allowNull: true
    }
});
