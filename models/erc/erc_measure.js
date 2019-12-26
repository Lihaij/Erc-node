/**
 * Created by Szane on 17/5/25.
 */
/** 量尺 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_measure', {
    measure_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: db.ID,
        allowNull: false
    },
    measure_room: { //空间
        type: db.STRING(20),
        allowNull: true
    },
    measure_length: { //长
        type: db.DOUBLE,
        defaultValue: 0.0,
        allowNull: false
    },
    measure_width: { //宽
        type: db.DOUBLE,
        defaultValue: 0.0,
        allowNull: false
    },
    measure_height: { //高
        type: db.DOUBLE,
        defaultValue: 0.0,
        allowNull: false
    },
    measure_pillar: { //是否有柱 0:否 1:是
        type: db.STRING(2),
        allowNull: true
    },
    measure_desc: { //描述
        type: db.STRING(100),
        defaultValue: '',
        allowNull: false
    },
    measure_creator: { //创建人ID
        type: db.STRING(20),
        allowNull: true
    },
    has_bay_window: { //是否有飘窗
        type: db.STRING(2),
        defaultValue: '0',
        allowNull: true
    },
    has_downcomer: { //是否有下水管
        type: db.STRING(2),
        defaultValue: '0',
        allowNull: true
    },
    space3d_url: { //3d链接
        type: db.STRING(500),
        defaultValue: '',
        allowNull: false
    }
});
