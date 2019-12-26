/* 用户人事合同表 */
const CryptoJS = require('crypto-js');
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_customercontract', {
    user_contract_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: db.ID,
        allowNull: false
    },
    contract_name: {//合同名称
        type: db.STRING(100),
        allowNull: false
    },
    sign_name: {//签约人
        type: db.STRING(20),
        defaultValue: '',
        allowNull: true
    },
    contract_no: {//合同编号
        type: db.STRING(100),
        defaultValue: '',
        allowNull: true
    },
    start_date:{//合同开始日期
        type: db.DATE,
        allowNull: true
    },
    end_date:{//合同结束日期
        type: db.DATE,
        allowNull: true
    },
    probation_end_date:{//试用期结束日期
        type: db.DATE,
        allowNull: true
    },
    official_date:{//转正日期
        type: db.DATE,
        allowNull: true
    },
    base_salary: { //基础工资*100
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    capacity_salary:{//能力工资*100
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    performance_salary:{//绩效工资*100
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    total_salary:{//工资总额*100
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    deposit_bank: {//开户行
        type: db.STRING(100),
        defaultValue: '',
        allowNull: true
    },
    bank_account: {//银行账号
        type: db.STRING(100),
        defaultValue: '',
        allowNull: true
    },
    contract_state: {//合同状态
        type: db.STRING(100),
        defaultValue: '',
        allowNull: true
    }
});
