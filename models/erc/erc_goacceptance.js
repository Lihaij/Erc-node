/** 验收单--户型 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_goacceptance', {
    goacceptance_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    goacceptance_index: {//验收编号
        type: db.INTEGER,
        allowNull: false
    },
    gonode_id: {//工序id
        type: db.IDNO,
        allowNull: false
    },
    goroom_id: {
        type: db.IDNO,
        allowNull: true
    },
    goroom_type: {//空间
        type: db.STRING(20),
        allowNull: true
    },
    goacceptance_name: {//验收项
        type: db.STRING(20),
        allowNull: false
    },
    gois_hidden: { //是否隐藏
        type: db.STRING(2),
        defaultValue: '0',
        allowNull: false
    },
    gotechnological_require: {//工艺要求
        type: db.STRING(500),
        defaultValue: '',
        allowNull: false
    },
    goevidence_require: {//采集证据要求
        type: db.STRING(500),
        defaultValue: '',
        allowNull: false
    },
    goupload_format: {//上传格式
        type: db.STRING(20),
        defaultValue: '',
        allowNull: false
    },
    roomtype_id: {//户型id
        type: db.IDNO,
        allowNull: true
    }
});
