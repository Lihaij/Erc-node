/**收发存明细**/
const db = require('../../util/db');

/*
采购入库对应的是供应商
销售出库对应的客户
产品入库和出库对应生产车间
委外入库和出库对应供应商
其它入库和出库对应供应商客户和公司所有部门
*/

module.exports = db.defineModel('tbl_erc_inventoryaccount', {
    inventoryaccount_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {//机构id
        type: db.IDNO,
        allowNull: true
    },
    bill_code: {//单据编号
        type: db.ID,
        allowNull: false
    },
    order_id: {//源单编号
        type: db.STRING(30),
        allowNull: true
    },
    p_order_id: {//采购单编号/采购入库:purchaseorder_id/产品入库和委外:productivetask_id/其他入库:stockapply_id
        type: db.STRING(30),
        allowNull: true
    },
    warehouse_id: {//仓库ID
        type: db.IDNO,
        allowNull: false
    },
    warehouse_zone_id: {//仓区
        type: db.IDNO,
        allowNull: true
    },
    materiel_id: {//物料ID
        type: db.IDNO,
        allowNull: false
    },
    account_operate_amount: {//本次操作的数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    inventory_price: {//本次价格
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    remain_amount: {//结存数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    account_operate_type: {//1采购入库 2销售出库 3其他入库 4其他出库 5产品入库 6领料出库 7委外产品入库 8委外产品出库
        type: db.INTEGER,
        allowNull: true
    },
    account_note: {//备注
        type: db.STRING(100),
        allowNull: true
    },
    company_name: {//对应单位
        type: db.STRING(100),
        allowNull: true
    },
    relation_data_id: { //采购入库：qualitycheck_id/销售出库：corporateclients_id/产品出入库：department_id/其他出入库
        type: db.ID,
        allowNull: true
    }
});
