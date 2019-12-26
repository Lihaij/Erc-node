/** 车辆维护 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_vehicle', {
    vehicle_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: false
    },
    license_plate_num: { //车牌号
        type: db.STRING(10),
        allowNull: true
    },
    vehicle_brand: { //汽车品牌
        type: db.STRING(100),
        allowNull: true
    },
    vehicle_type: { //车辆种类
        type: db.STRING(10),
        allowNull: true
    },
    vehicle_status: { //使用状态 0：待使用，1：使用中
        type: db.STRING(4),
        defaultValue: 0,
        allowNull: true
    },
    vehicle_status_flag: { //使用状态 0：手动更新，1：自动更新
        type: db.STRING(4),
        defaultValue: 0,
        allowNull: true
    },
    admin_user_id: { //车辆管理员
        type: db.ID,
        allowNull: true
    },
    fixedassetscheckdetail_id: {
        type: db.IDNO,
        allowNull: true
    },
});