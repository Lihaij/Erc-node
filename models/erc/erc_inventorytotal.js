/**收发存明细统计**/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_inventorytotal', {
    inventory_report_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {//机构id
        type: db.IDNO,
        allowNull: true
    },
    relation_id: {//采购单编号/采购入库:purchaseorder_id/产品入库和委外:productivetask_id/其他入库:stockapply_id
        type: db.STRING(30),
        allowNull: false
    },
    relation_sub_id: {//采购单编号/采购入库:purchaseorder_id/产品入库和委外:productivetask_id/其他入库:stockapply_id
        type: db.STRING(30),
        allowNull: true
    },
    warehouse_id: {//仓库ID
        type: db.IDNO,
        allowNull: true
    },
    materiel_id: {//物料ID
        type: db.IDNO,
        allowNull: true
    },
    total_count: {//总数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    actual_count: {//本次操作的数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    inventory_type: {//1采购入库 2销售出库 3其他入库 4其他出库 5产品入库 6领料出库 7委外产品入库 8委外产品出库
        type: db.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    inventory_state: {//1部分 2全部
        type: db.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
});
