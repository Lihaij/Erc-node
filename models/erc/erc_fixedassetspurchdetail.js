/** 固定资产申购详情 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_fixedassetspurchdetail', {
    fixedassetspurchdetail_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    fixedassetspurch_id: {
        type: db.IDNO,
        allowNull: false
    },
    fixedassets_no: {//固定资产编号
        type: db.STRING(100),
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
    fixedassets_num: {//数量
        type: db.INTEGER,
        allowNull: true
    },
    fixedassets_flag: {//是否提交验收0：未提交 1：审核中 2：已驳回 3：已通过
        type: db.STRING(4),
        defaultValue: '',
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
    user_id: {//管理责任人
        type: db.ID,
        allowNull: true
    },
    fixedassetscheck_acceptance: {//验收类型
        type: db.STRING(4),
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
    }

});