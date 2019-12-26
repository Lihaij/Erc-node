/** 生产设备产能表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

//废弃
module.exports = db.defineModel('tbl_erc_productdevice_capacity', {
    productdevice_capacity_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    productdevice_id: {//生产设备ID
        type: db.IDNO,
        allowNull: false
    },
    materiel_id: {//物料ID
        type: db.IDNO,
        allowNull: false
    },
    work_time: {//每天工作时间
        type: db.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    hour_capacity: {//每小时产能
        type: db.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    day_capacity: {//日产能
        type: db.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
});
