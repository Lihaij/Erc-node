/** 产品表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_productdevice', {
    productdevice_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    fixedassetsdetail_id: {//固定资产ID
        type: db.IDNO,
        allowNull: false
    },
    //废弃
    day_capacity: {//日产能
        type: db.IDNO,
        allowNull: true,
        defaultValue: 0
    },
    device_level: {//设备等级 主1/从2
        type: db.IDNO,
        allowNull: false
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    //废弃
    work_time: {//每天工作时间
        type: db.INTEGER,
        allowNull: true
    },
    //废弃
    hour_capacity: {//每小时产能
        type: db.INTEGER,
        allowNull: true
    },

});
