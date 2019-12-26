/** 产品表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_productproceduredevice', {
    ppdevice_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    productprocedure_id: {//生产工序ID
        type: db.IDNO,
        allowNull: false
    },
    device_level: {//设备等级 主1/从2
        type: db.IDNO,
        allowNull: false
    },
    productdevice_id: {//生产设备ID
        type: db.IDNO,
        allowNull: false
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    hour_capacity: {//每小时产能
        type: db.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    day_capacity: {//日产能
        type: db.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
});
