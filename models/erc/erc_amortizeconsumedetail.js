/** 待摊资产--材料申购 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_amortizeconsumedetail', {
    amortizeconsumedetail_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    amortizeconsume_id: {//耗用单ID
        type: db.IDNO,
        allowNull: false
    },
    amortizesubscribe_id: {//申购单物料ID
        type: db.IDNO,
        primaryKey: true
    },
    consumedetail_number: {//耗用数量
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    consumedetail_price: {//耗用单价
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    }
});
