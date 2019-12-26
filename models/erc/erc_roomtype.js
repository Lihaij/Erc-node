/**
 * Created by Szane on 17/6/19.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**户型管理 **/
module.exports = db.defineModel('tbl_erc_roomtype', {
    roomtype_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    estate_id: {
        type: db.BIGINT(20),
        allowNull: true
    },
    roomtype_name: { //户型名
        type: db.STRING(50),
        allowNull: true
    },
    roomtype_spec_name: { //户型的房型
        type: db.STRING(50),
        allowNull: true
    },
    roomtype_srcage: { //建筑面积
        type: db.DOUBLE,
        allowNull: true
    },
    roomtype_area: { //套内面积
        type: db.DOUBLE,
        allowNull: true
    },
    roomtype_plan_pic: { //户型图片
        type: db.STRING(200),
        allowNull: true
    },
    roomtype_room_count: { //户型图片
        type: db.STRING(200),
        allowNull: true
    },
    roomtype_kjl_planid: { //酷家乐户型id
        type: db.STRING(50),
        allowNull: true
    }
});
