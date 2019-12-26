/** 资产报废详情 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_longassetsscrapdetail', {
    longassetsscrapdetail_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    longassetsscrap_id: {
        type: db.IDNO,
        allowNull: false
    },
    fixedasset_id: {//固定资产相关表主键（固定资产，待摊资产，低值易耗品）
        type: db.IDNO,
        allowNull: false
    },
    return_price: { //可回收金额*100
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    expend_price: { //消耗费用*100
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    longassetsscrap_remark: { //报废原因
        type: db.STRING(100),
        allowNull: true
    }
});