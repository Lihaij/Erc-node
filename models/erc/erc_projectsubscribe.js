/** 待摊资产--材料申购 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_projectsubscribe', {
    //申购单数据
    projectsubscribe_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    project_id: {
        type: db.STRING(30),
        allowNull: false
    },
    subscribe_name: {//材料名称
        type: db.STRING(100),
        allowNull: true
    },
    subscribe_format: {//规格型号
        type: db.STRING(100),
        allowNull: true
    },
    subscribe_unit: {//单位
        type: db.STRING(30),
        allowNull: true
    },
    subscribe_number: {//采购数量
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    subscribe_price: {//采购单价
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    supplier_id: {//采购的供应商
        type: db.STRING(30),
        allowNull: true
    },
    receive_done_number: {//已收料数量
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    consume_done_number: {//已耗用数量
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    subscribe_remark: {//备注
        type: db.STRING(100),
        allowNull: true
    },
    subscribe_state: {//状态  0新记录，1已提交，2通过，3拒绝
        type: db.INTEGER,
        allowNull: true
    },
    subscribe_examine: {//审批人
        type: db.STRING(100),
        allowNull: true
    },
    subscribe_examine_time: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    subscribe_refuse_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    },

    //材料耗用临时数据
    consume_now_number: {//本次耗用数量（临时）
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    consume_creator: {//耗用人（临时）
        type: db.STRING(50),
        allowNull: true
    },
    consume_now_price: {//本次耗用单价（临时）
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    consume_state: {//状态  0新记录，1已提交，2通过，3拒绝
        type: db.INTEGER,
        allowNull: true
    },
    consume_examine: {//审批人
        type: db.STRING(100),
        allowNull: true
    },
    consume_examine_time: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    consume_refuse_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    }
});
