/** 物料表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_invalidateapplyorder', {
    invalidateapplyorder_id: {//报废提交显示
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    invalidateorder_id: {//报废单号
        type: db.ID,
        allowNull: true
    },
    stockmap_id: {
        type: db.INTEGER,
        defaultValue: null,
        allowNull: true
    },
    materiel_id: {
        type: db.INTEGER,
        defaultValue: null,
        allowNull: true
    },
    warehouse_id: {
        type: db.INTEGER,
        allowNull: false
    },
    warehouse_zone_id: {//仓区的id
        type: db.IDNO,
        allowNull: true
    },
    invalidateapplyorder_amount: {
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    invalidateorder_reason: {//报废原因  INVALIDATEORDERREASON
        type: db.STRING(5),
        defaultValue: '1',
        allowNull: false
    },
    invalidatemateriel_type: {//报废物料类型
        type: db.INTEGER,
        allowNull: false
    },
    scrap_warehouse_id: {
        type: db.INTEGER,
        allowNull: true
    },
    scrap_warehouse_zone_id: {//仓区的id
        type: db.INTEGER,
        allowNull: true
    },
});
