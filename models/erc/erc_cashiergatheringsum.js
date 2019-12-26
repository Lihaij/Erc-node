/**
 * Created by Cici on 2018/4/26.
 */
/** 客户收款汇总 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_cashiergatheringsum', {
    cashiergatheringsum_id: {//
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {//机构id
        type: db.IDNO,
        allowNull: true
    },
    cashiergatheringsum_code: {//编号
        type: db.STRING(100),
        allowNull: true
    },
    cashiergatheringsum_depart_id: {//部门Id
        type: db.STRING(100),
        allowNull: true
    },
    cashiergatheringsum_time: {//业务日期
        type: db.STRING(100),
        allowNull: true
    },
    cashiergatheringsum_content: {//业务内容
        type: db.STRING(100),
        allowNull: true
    },
    cashiergatheringsum_amount: {//总金额
        type: db.STRING(100),
        allowNull: true
    }
});