/** 待摊资产--材料申购 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_projectsubscribeorderdetailend', {
    projectsubscribeorderdetailend_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    project_id: {        //预算ID
        type: db.STRING(30),
        allowNull: false
    },
    subscribeorderdetailend_name: {//材料名称
        type: db.STRING(100),
        allowNull: true
    },
    subscribeorderdetailend_format: {//规格型号
        type: db.STRING(100),
        allowNull: true
    },
    subscribeorderdetailend_unit: {//单位
        type: db.STRING(30),
        allowNull: true
    },
    subscribeorderdetailend_number: {//申购数量
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    purchase_done_number: {//已采购数量
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    }
});
