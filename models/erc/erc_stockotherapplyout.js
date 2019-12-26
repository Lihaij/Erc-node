/** 物料表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_stockotherapplyout', {
    stockotherapplyout_id: {//出库任务提交显示
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    stockoutapplydetail_id: {
        type: db.INTEGER,
        allowNull: false
    },
    stockoutapply_id: {//出库申请单号
        type: db.STRING(30),
        allowNull: true
    },
    materiel_id: {
        type: db.INTEGER,
        allowNull: true
    },
    warehouse_id: {
        type: db.INTEGER,
        allowNull: false
    },
    warehouse_zone_id: {//仓区的id
        type: db.INTEGER,
        allowNull: true
    },
    stockotherapplyout_amount: {//需要出库数量
        type: db.INTEGER,
        allowNull: false
    },
    waitoutapply_amount: {//本次出库数量出库数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    stockotherapplyout_type: {//物料出库类型
        type: db.STRING(5),
        allowNull: false
    },
});
