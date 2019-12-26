const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_orderacceptance', {
    orderacceptance_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    gantttasks_id: {
        type: db.IDNO,
        allowNull: false
    },
    order_id: {
        type: db.ID,
        allowNull: false
    },
    room_id: {
        type: db.IDNO,
        allowNull: false
    },
    acceptance_id: {
        type: db.IDNO,
        allowNull: false
    },
    acceptance_index: {//验收编号
        type: db.INTEGER,
        allowNull: false
    },
    template_id: {
        type: db.IDNO,
        allowNull: true
    },
    node_id: {
        type: db.IDNO,
        allowNull: false
    },
    room_type: {//空间
        type: db.STRING(20),
        allowNull: true
    },
    acceptance_name: {//验收项
        type: db.STRING(20),
        allowNull: true
    },
    is_hidden: { //是否隐藏
        type: db.STRING(2),
        defaultValue: '0',
        allowNull: true
    },
    technological_require: {//工艺要求
        type: db.STRING(200),
        defaultValue: '',
        allowNull: true
    },
    evidence_require: {//采集证据要求
        type: db.STRING(100),
        defaultValue: '',
        allowNull: true
    },
    acceptance_state: {//验收状态 ACCEPTANCESTATEINFO
        type: db.STRING(30),
        allowNull: false
    },
    upload_format: {//上传格式
        type: db.STRING(20),
        defaultValue: '',
        allowNull: true
    },
    acceptance_submit_date: {//提交日期
        type: db.DATE,
        allowNull: true
    },
    acceptance_submit_id: {//提交用户id
        type: db.ID,
        allowNull: true
    },
    acceptance_comment: {//验收备注
        type: db.STRING(500),
        defaultValue: '',
        allowNull: true
    },
    acceptance_check_date: {//审核通过日期
        type: db.DATE,
        allowNull: true
    },
    acceptance_check_id: {//审核id
        type: db.ID,
        allowNull: true
    }
});
