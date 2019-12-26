const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_purchaseapplydetail', {
    purchaseapplydetail_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    purchaseapply_id: {//采购申请单ID
        type: db.STRING(30),
        allowNull: true
    },
    order_id: {//采购申请单ID
        type: db.STRING(30),
        allowNull: true
    },
    materiel_id: {
        type: db.IDNO,
        allowNull: false
    },
    apply_number: {//申请数量
        type: db.INTEGER,
        allowNull: true
    },
    apply_number_done: {//已采购数量
        type: db.INTEGER,
        allowNull: true
    },
    apply_number_now: {//本次采购数量
        type: db.INTEGER,
        allowNull: true
    },
    supplier_id_now: {//本次采购选择的供应商
        type: db.STRING(50),
        allowNull: true
    },
    delivery_time: { //预计到货时间
        type: db.DATE,
        allowNull: true
    },
    remark: { //备注
        type: db.STRING(100),
        allowNull: true
    },
    room_id: {//空间
        type: db.IDNO,
        allowNull: true
    },
    apply_money: {//金额
        type: db.INTEGER,
        allowNull: true
    },
    project_space_id: {//项目编号
        type: db.STRING(30),
        allowNull: true
    }
});
