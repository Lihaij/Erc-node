/** 生产任务明细(投料)*/
const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_productivetaskdetail', {
    productivetaskdetail_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    productivetask_id: {
        type: db.IDNO,
        allowNull: true
    },
    materiel_id: {
        type: db.IDNO,
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    taskdetaildesign_number: { //最终投料数量
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    design_number: { //比例数量    产品规划中投料的数量，最小单位
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    taskdetailprd_level: { //层级
        type: db.IDNO,
        allowNull: true
    },
    taskdetailprd_batch: { //批次 1初始  2新增
        type: db.INTEGER,
        defaultValue: 1,
        allowNull: true
    },
    taskdetailprd_remark: {
        type: db.STRING(500),
        allowNull: true
    },
    change_state: { //投料变更提交状态    0待提交、1已提交、2已通过、3已驳回
        type: db.ID,
        allowNull: true
    },
    stock_out_number: {//已出库数量
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    stock_out_state: {//出库状态
        type: db.INTEGER,
        defaultValue: 1,
        allowNull: true
    },
    productivetask_biz_code: { //biz_code
        type: db.STRING(50),
        allowNull: true
    }
});
