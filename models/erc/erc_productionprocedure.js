/** 工序表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_productionprocedure', {
    procedure_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    procedure_code: {
        type: db.ID,
        allowNull: false
    },
    procedure_name: {//生产工序名称
        type: db.STRING(30),
        allowNull: true
    },
    procedure_type: {//生产工序分类
        type: db.IDNO,
        allowNull: true
    },
    procedure_cost: {//生产工序工价
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    procedure_pay: {//生产工序工资
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    procedure_calc: {//保底计算量
        type: db.IDNO,
        allowNull: true
    },
    procedure_master_device: {//对应主生产设备
        type: db.IDNO,
        allowNull: true
    },
    procedure_slave_device: {//对应辅生产设备
        type: db.IDNO,
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    procedure_coefficient: {//系数
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    department_id: {
        type: db.ID,
        allowNull: true
    },
    biz_code: {
        type: db.ID,
        allowNull: true
    },
    default_capacity: { //工序默认产能  如果该工序没有生产设备，则使用这个默认产能做排产
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    work_time: {//每天工作时间
        type: db.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
});
