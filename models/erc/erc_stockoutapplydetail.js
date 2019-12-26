/** 物料表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_stockoutapplydetail', {
    stockoutapplydetail_id: {//出库任务提交显示
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    stockoutapply_id: {//出库申请单号
        type: db.STRING(30),
        allowNull: true
    },
    materiel_id: {
        type: db.INTEGER,
        defaultValue: null,
        allowNull: true
    },
    stockoutapplydetail_amount: {//需要出库数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    already_amount: {//已出库数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    stockoutapplydetail_type: {//物料出库类型
        type: db.STRING(5),
        allowNull: false
    },
    stockoutapplydetail_remark: {//备注
        type: db.STRING(100),
        allowNull: true
    },
});
