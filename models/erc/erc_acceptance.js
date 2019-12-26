/** 验收单 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_acceptance', {
    acceptance_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    acceptance_index: {//验收编号
        type: db.INTEGER,
        allowNull: false
    },
    template_id: {
        type: db.IDNO,
        allowNull: false
    },
    node_id: {//工序id
        type: db.IDNO,
        allowNull: false
    },
    room_type: {//空间
        type: db.STRING(20),
        allowNull: false
    },
    acceptance_name: {//验收项
        type: db.STRING(20),
        allowNull: false
    },
    is_hidden: { //是否隐藏
        type: db.STRING(2),
        defaultValue: '0',
        allowNull: false
    },
    technological_require: {//工艺要求
        type: db.STRING(500),
        defaultValue: '',
        allowNull: false
    },
    evidence_require: {//采集证据要求
        type: db.STRING(500),
        defaultValue: '',
        allowNull: false
    },
    upload_format: {//上传格式
        type: db.STRING(20),
        defaultValue: '',
        allowNull: false
    }
});
