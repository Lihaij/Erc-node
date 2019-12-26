/** 工序移交验收明细*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_productivetask_procedure', {
    prd_task_procedure_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    productivetask_id: {
        type: db.IDNO,
        allowNull: false
    },
    procedure_id: {//工序ID
        type: db.IDNO,
        allowNull: true
    },
    transfer_number: {//移交数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    qualified_number: {//合格数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    unqualified_number: {//待移交数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    procedure_state: {//检验状态/0未检验/1已检验
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    user_id: {//质检人
        type: db.ID,
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    biz_code: {
        type: db.ID,
        allowNull: true
    },
});
