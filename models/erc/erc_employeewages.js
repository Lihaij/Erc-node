/**
 * 员工工资
 * Created by BaiBin on 2019/3/12.
 */

const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_employeewages', {
    employeewages_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    monthwages_id: { //工资月id
        type: db.IDNO,
        allowNull: false
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    user_id: { //员工编号
        type: db.ID,
        defaultValue: '',
        allowNull: false
    },
    should_wages: { //应发工资 * 100
        type: db.IDNO,
        defaultValue: 0,
        allowNull: false
    },
    tax: { //代扣个人所得税 * 100
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    social_security: {//代扣社保 * 100
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    other_money: {//代扣其他款项 * 100
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    actual_wages: {//实际发放工资 * 100
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    employeewages_date: { //工资月份
        type: db.DATE,
        allowNull: false
    },
});