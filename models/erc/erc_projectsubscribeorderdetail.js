/** 待摊资产--材料申购 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_projectsubscribeorderdetail', {
    projectsubscribeorderdetail_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    projectsubscribeorder_id: {
        type: db.STRING(30),
        allowNull: false
    },
    subscribeorderdetail_name: {//材料名称
        type: db.STRING(100),
        allowNull: true
    },
    subscribeorderdetail_format: {//规格型号
        type: db.STRING(100),
        allowNull: true
    },
    subscribeorderdetail_unit: {//单位
        type: db.STRING(30),
        allowNull: true
    },
    subscribeorderdetail_number: {//申购数量
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    subscribeorderdetail_remark: {//备注
        type: db.STRING(100),
        allowNull: true
    }
});
