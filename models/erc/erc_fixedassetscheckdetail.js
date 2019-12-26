/** 固定资产验收详情 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_fixedassetscheckdetail', {
    fixedassetscheckdetail_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    fixedassetscheck_id: {//验收单编号
        type: db.ID,
        allowNull: true
    },
    fixedassets_no: {//固定资产编号
        type: db.ID,
        allowNull: true
    },
    fixedassets_name: {//固定资产名称
        type: db.STRING(100),
        allowNull: true
    },
    fixedassets_model: {//规格型号
        type: db.STRING(20),
        allowNull: true
    },
    fixedassets_unit: {//计量单位
        type: db.STRING(10),
        allowNull: true
    },
    fixedassets_category: {//固定资产分类
        type: db.STRING(4),
        allowNull: true
    },
    use_time_limit: {//预计使用年限
        type: db.STRING(10),
        allowNull: true
    },
    residual_value_rate: {//预计净残值率
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    depreciation_category: {//折旧方法
        type: db.STRING(4),
        allowNull: true
    },
    department_id: {//归属部门
        type: db.ID,
        allowNull: true
    },
    fixedassets_property: {//固定资产性质分类
        type: db.STRING(4),
        allowNull: true
    },
    user_id: {//管理责任人
        type: db.ID,
        allowNull: true
    },
    deprecition_month: {//已计提折旧月数
        type: db.STRING(4),
        defaultValue: 0,
        allowNull: true
    },
    deprecition_price: { //已计提折旧金额*100
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    residual_deprecition_month: {//剩余折旧月数
        type: db.STRING(4),
        defaultValue: 0,
        allowNull: true
    },
    scrap_flag: {//报废标志 0：已报废 1：未报废
        type: db.STRING(4),
        defaultValue: 1,
        allowNull: true
    },
    fixedassetscheck_acceptance: {//验收类型
        type: db.STRING(4),
        allowNull: true
    },
    take_stock_flag:{//盈亏状态 0：盈亏 1：正常
        type: db.STRING(4),
        defaultValue: 1,
        allowNull: true
    },
    take_stock_description:{//盈亏说明 0：盈亏 1：正常
        type: db.STRING(100),
        allowNull: true
    },
    fixedassetspurchdetail_id:{//固定资产申购详情表主键
        type: db.IDNO,
        allowNull: true
    },
    original_value: {//固定资产原值
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    monthly_depreciation: {//月折旧
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },

    fixedassets_number: {//数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    fixedassets_price: {//单价
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    fixedassets_money: {//金额
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    fixedassets_type: {//LONGASSETSTYPE 长期资产性质分类
        type: db.STRING(4),
        allowNull: true
    },
    fixedassets_device: {//标记 是否成为生产设备   0未标记，1已标记
        type: db.STRING(4),
        defaultValue: 0,
        allowNull: true
    },
    fixedassets_supplier_id: {//供应商id
        type: db.STRING(30),
        allowNull: true
    },
});