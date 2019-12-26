/**
 * Created by Szane on 17/5/25.
 */
/** 套餐 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_orderroom', {
    room_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: db.ID,
        allowNull: false
    },
    room_type: { //空间类型
        type: db.STRING(20),
        allowNull: true
    },
    room_name: { //空间
        type: db.STRING(50),
        allowNull: true
    },
    room_area: { //地面面积
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: false
    },
    wall_area: { //墙面面积
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: false
    },
    ground_perimeter: { //地面周长
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: false
    },
    kjl_room_id: { //酷家乐空间id
        type: db.STRING(50),
        defaultValue: '',
        allowNull: false
    }
});
