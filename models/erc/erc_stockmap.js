/** WMS库存查询**/
const db = require('../../util/db');
module.exports = db.defineModel('tbl_erc_stockmap', {
    stockmap_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {//门店id
        type: db.IDNO,
        allowNull: true
    },
    warehouse_id: {//仓库id
        type: db.IDNO,
        allowNull: false
    },
    materiel_id: {//物料id
        type: db.IDNO,
        allowNull: false
    },
    current_amount: {//当前库存数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    available_amount: {//可用数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    frozen_amount: {//出库冻结数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    safe_amount: {//安全库存
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    order_id: {//销售订单号
        type: db.ID,
        allowNull: true
    },
    is_idle_stock: { //是否是闲置库存
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
    warehouse_zone_id: {//仓区的id
        type: db.IDNO,
        allowNull: true
    },
    min_purchase_amount: {//最低采购数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    trigger_safe_model: {//是否触发安全模式
        type: db.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    trigger_idle_scan: {//是否触发闲置库存扫描
        type: db.INTEGER,
        allowNull: true
    },
    unit_price: {//单价
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    price_amount: {//金额  当前库存数量*单价
        type: db.DOUBLE(11, 2),
        defaultValue: 0,
        allowNull: true
    },
    store_price: {//平均价格
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    materiel_code: {//物料编码
        type: db.STRING(30),
        allowNull: true
    },
    submit_state: { //修改安全库存提交状态 0未提交 1已提交 2已通过 3已拒绝
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
    task_description: {//任务反馈
        type: db.STRING(300),
        allowNull: true
    },
    min_purchase_amount_temp: {//最低采购数量缓存
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    safe_amount_temp: {//安全库存缓存
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    storage_type: {//库存类型 1安全库存管理/2订单号管理/3闲置库存管理
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
});
