/**
 * 外包服务
 * Created by BaiBin on 2019/3/7.
 */
const db = require('../../util/db');
module.exports = db.defineModel('tbl_erc_outsource', {
    outsource_id: {//外包编号
        type: db.ID,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    outsource_name: {//外包名称
        type: db.STRING(50),
        allowNull: true
    },
    outsource_money: { //预计金额 * 100
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    outsource_description: {//描述
        type: db.STRING(300),
        allowNull: true
    },
    department_id: {//申请部门
        type: db.ID,
        allowNull: true
    },
    outsource_state: {//状态 1待审核 2通过 3拒绝
        type: db.STRING(4),
        allowNull: true
    },
    outsource_creator: {//申请人
        type: db.ID,
        allowNull: true
    },
    task_description: {//任务备注
        type: db.STRING(300),
        allowNull: true
    },
    biz_code: {
        type: db.ID,
        allowNull: true
    },
});
