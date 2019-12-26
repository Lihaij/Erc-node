/**
 * 其他客户收款
 */

const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_othercollection', {
    othercollection_id: { //
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: { //机构id
        type: db.IDNO,
        allowNull: false
    },
    othercollection_type: { //收款类别
        type: db.STRING(30),
        allowNull: true
    },
    othercollection_source_name: { //来款单位名称
        type: db.STRING(100),
        allowNull: true
    },
    othercollection_money: { //收款金额(单位：分)
        type: db.INTEGER,
        allowNull: true
    },
    othercollection_mnoey_type: { //货币资金类型
        type: db.STRING(30),
        allowNull: true
    },
    othercollection_time: { //收款时间
        type: db.DATE,
        allowNull: true
    },
    othercollection_way: { //收款方式
        type: db.STRING(30),
        allowNull: true
    },
    othercollection_bank_no: { //银行账号
        type: db.STRING(50),
        allowNull: true
    },
    othercollection_remark: { //备注
        type: db.STRING(500),
        allowNull: true
    },
    othercollection_creator: { //操作人
        type: db.STRING(50),
        allowNull: true
    }

});