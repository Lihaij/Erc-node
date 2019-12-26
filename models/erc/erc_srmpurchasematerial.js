/** 供应商采购单 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_srmpurchasematerial', {
    srm_purchasematerial_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    srm_purchaseorder_id: {
        type: db.IDNO,
        allowNull: false
    },
    opor_id: {
        type: db.IDNO,
        allowNull: false
    },
    purchase_id: {//采购ID
        type: db.IDNO,
        allowNull: false
    },
    ordermateriel_id: {
        type: db.IDNO,
        allowNull: false
    },
    por1_whscode: { // 仓库编号
        type: db.STRING(20),
        allowNull: false
    },
    materiel_code: { //物料编码
        type: db.STRING(20),
        allowNull: false
    },
    por1_quantity: { // 数量
        type: db.DOUBLE(19, 2),
        allowNull: false
    },
    por1_uom: { // 计量单位
        type: db.STRING(20),
        allowNull: false
    },
    delivery_amount: { // 发货数量
        type: db.DOUBLE(19, 2),
        allowNull: false
    },
    srm_purchasematerial_state: { //发货状态
        type: db.STRING(4),
        allowNull: false
    },
    por1_docentry: {//sap 采购单号
        type: db.STRING(20),
        allowNull: false
    }
});
