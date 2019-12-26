/** 人工价格表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_workerprice', {
    worker_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    worker_name: {//工种名称
        type: db.STRING(100),
        allowNull: true
    },
    worker_unit: {//计量单位
        type: db.STRING(100),
        allowNull: true
    },
    worker_cost: {//人工单价
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    }
});
