/**
 * Created by nie on 19/3/4.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**日计划设备计算表，日计划查询时，本表保存当时未报修的所有设备，方便计算日计划的设备分配，日计划查询完毕，将该表清空 **/
module.exports = db.defineModel('tbl_erc_ppmasterdaydevicetemp', {
    ppmasterdaydevicetemp_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    //设备id    关联tbl_erc_fixedassetscheckdetail.fixedassetscheckdetail_id，tbl_erc_productdevice.fixedassetsdetail_id
    fixedassetscheckdetail_id: {
        type: db.IDNO,
        allowNull: true
    },
    productdevice_id: {
        type: db.IDNO,
        allowNull: true
    },
    fixedassets_no: { //设备编号
        type: db.STRING(30),
        allowNull: true
    },
    fixedassets_name: { //设备名称
        type: db.STRING(50),
        allowNull: true
    },
    theory_capacity: { //理论日产能
        type: db.INTEGER,
        allowNull: true
    },
    done_capacity: { //已分配产能
        type: db.INTEGER,
        allowNull: true
    },
    device_level: { //1主设备 2辅设备
        type: db.STRING(5),
        allowNull: true
    }
});