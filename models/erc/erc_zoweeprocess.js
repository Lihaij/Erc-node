/**
 * 造艺
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_zoweeprocess', {
    zoweeprocess_id: { //合同自编号
        type: db.ID,
        primaryKey: true
    },
    ordermateriel_id: { //订单物料编号
        type: db.IDNO,
        allowNull: true
    },
    zoweeprocess_type: { //订单类型 ZOWEEPROCESSTYPE
        type: db.STRING(10),
        defaultValue: '1',
        allowNull: true
    },
    zoweeprocess_date: { //希望交货期
        type: db.DATEONLY,
        allowNull: true
    },
    zoweeprocess_name: { //客户姓名
        type: db.STRING(30),
        allowNull: true
    },
    zoweeprocess_address: { //客户地址
        type: db.STRING(300),
        allowNull: true
    },
    zoweeprocess_phone: { //客户电话
        type: db.STRING(30),
        allowNull: true
    },
    zoweeprocess_designer: { //设计师名称
        type: db.STRING(30),
        allowNull: true
    },
    zoweeprocess_designphone: { //设计师电话
        type: db.STRING(20),
        allowNull: true
    },
    zoweeprocess_remark: { //合同备注
        type: db.STRING(300),
        allowNull: true
    },
    zoweeprocess_state: { //制造单状态 ZOWEEPROCESSSTATE
        type: db.STRING(10),
        allowNull: true
    },
    zoweeprocess_feedback: { //制造单反馈
        type: db.STRING(10),
        allowNull: true
    }
});
