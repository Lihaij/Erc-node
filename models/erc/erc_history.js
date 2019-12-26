/** 订单日志 **/
const db = require('../../util/db');
module.exports = db.defineModel('tbl_erc_history', {
    history_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: db.ID,
        allowNull: false
    },
    order_state: {//状态
        type: db.STRING(100),
        allowNull: false
    },
    history_event: {//事件
        type: db.STRING(100),
        allowNull: false
    },
    history_content: {//修改内容
        type: db.STRING(200),
        allowNull: false
    },
    operator_name: {//操作人
        type: db.STRING(100),
        allowNull: false
    }
});
