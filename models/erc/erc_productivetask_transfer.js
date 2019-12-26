/** 工序移交*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_productivetask_transfer', {
    prd_task_procedure_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    productivetask_id: {
        type: db.IDNO,
        allowNull: false
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
    appoint_user_id: {//指派人ID
        type: db.ID,
        allowNull: true
    },
    procedure_id: {//工序ID
        type: db.IDNO,
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
});
