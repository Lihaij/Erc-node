/** 委外加工费明细*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_productivetask_machining', {
    prd_task_machining_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    productivetask_id: {
        type: db.IDNO,
        allowNull: false
    },
    product_cost: {
        type: db.DOUBLE,
        allowNull: true,
        defaultValue: 0
    },
    feeding_cost: {
        type: db.DOUBLE,
        allowNull: true,
        defaultValue: 0
    },
    inventory_amount: {//入库数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    biz_code: {
        type: db.ID,
        allowNull: true
    },
});
