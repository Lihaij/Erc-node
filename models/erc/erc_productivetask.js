/** 生产任务*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_productivetask', {
    productivetask_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    productivetask_code: {
        type: db.STRING(50),
        allowNull: true
    },
    product_id: { //产品规划Id
        type: db.IDNO,
        allowNull: true
    },
    materiel_id: {
        type: db.IDNO,
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    product_level: { //产品层级，确定是否是最终的产品 暂不用
        type: db.IDNO,
        allowNull: true
    },
    taskdesign_number: { //数量
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    stock_in_number: { //已入库数量
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    stock_in_state: { //入库状态
        type: db.STRING(4),
        defaultValue: '1',
        allowNull: true
    },
    stock_out_number: { //已出库数量
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    stock_out_state: { //出库状态
        type: db.STRING(4),
        defaultValue: '1',
        allowNull: true
    },
    order_id: { //单号
        type: db.STRING(400),
        allowNull: true
    },
    productivetask_state: { //生产任务单状态    1未生产，2生产中，3完成
        type: db.STRING(4),
        allowNull: true
    },
    taskdesign_price: { //单价
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    department_id: { //车间 自制废弃/委外保留用作supplier_id
        type: db.STRING(50),
        allowNull: true
    },
    procedure_id: { //工序（废弃）
        type: db.ID,
        allowNull: true
    },
    change_state: { //投料变更提交状态    0待提交、1已提交、2已通过、3已驳回
        type: db.ID,
        allowNull: true
    },
    outsource_sign: { //委外标志  该生产任务单是委外还是自制  1自制   3委外
        type: db.ID,
        allowNull: true
    },
    procedure_level: { //所在工序的优先级（废弃）
        type: db.STRING(5),
        allowNull: true
    },
    biz_code: { //biz_code（废弃）
        type: db.STRING(50),
        allowNull: true
    },
    materiel_code: { //materiel_code
        type: db.STRING(100),
        allowNull: true
    },
    ppmaster_begin_time: {//排产起始日期
        type: db.DATE,
        allowNull: true
    },
    ppmaster_end_time: {//排产起始日期
        type: db.DATE,
        allowNull: true
    }
});
