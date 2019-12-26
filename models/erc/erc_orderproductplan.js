
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**销售订单计划详情 **/
module.exports = db.defineModel('tbl_erc_orderproductplan', {
    orderproductplan_id: {//生产任务单号
        type: db.STRING(30),
        allowNull: false,
        primaryKey: true
    },
    order_id: {
        type: db.ID,
        allowNull: false
    },
    produceprocess_id: {//工序ID
        type: db.STRING(30),
        allowNull: true
    },
    process_duration: {//工序时长
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    process_begin_date: {//工序开始日期
        type: db.DATEONLY,
        allowNull: false
    },
    process_end_date: {//工序结束日期
        type: db.DATEONLY,
        allowNull: false
    },
    plan_assign:{//审核人
        type: db.STRING(30),
        allowNull: true
    },
    pp_date: {//本次运算日期
        type: db.DATEONLY,
        allowNull: true
    },
    plan_state:{//计划状态，  0新计划，1已指派，2通过,3驳回
        type: db.STRING(30),
        allowNull: true
    },
    description:{
        type: db.STRING(100),
        allowNull: true
    }
});
