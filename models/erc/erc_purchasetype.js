/**
 * 采购类型
 * Created by BaiBin on 2019/3/4.
 */

const db = require('../../util/db');
module.exports = db.defineModel('tbl_erc_purchasetype', {
    purchase_type_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    purchase_type_no: { //编号
        type: db.STRING(30),
        primaryKey: true
    },
    purchase_type_name: {
        type: db.STRING(100),//分类名称
        allowNull: false
    }
});
