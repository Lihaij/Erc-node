/** 退货单详情表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_returndetail', {
    returndetail_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    return_id: {
        type: db.IDNO,
        allowNull: false
    },
    materiel_id: {
        type: db.IDNO,
        allowNull: false
    },
    return_number: {//退货数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    return_remark: { //备注
        type: db.STRING(500),
        allowNull: true
    }
});