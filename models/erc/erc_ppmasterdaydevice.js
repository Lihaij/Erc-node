/**
 * Created by nie on 19/3/4.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**日计划设备分配表 **/
module.exports = db.defineModel('tbl_erc_ppmasterdaydevice', {
    ppmasterdaydevice_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    ppmaster_id: {
        type: db.IDNO,
        allowNull: true
    },
    //设备id    关联tbl_erc_fixedassetscheckdetail.fixedassetscheckdetail_id，tbl_erc_productdevice.fixedassetsdetail_id
    fixedassetscheckdetail_id:{ 
        type: db.IDNO,
        allowNull: true
    },
    fixedassets_no: {          //设备编号
        type: db.STRING(30),
        allowNull: true
    },
    fixedassets_name: {          //设备名称
        type: db.STRING(50),
        allowNull: true
    },
    allot_number: {     //分配数量
        type: db.INTEGER,
        allowNull: true
    },
    ppmaster_date: {     //生产计划日期
        type: db.STRING(50),
        allowNull: true
    }
});