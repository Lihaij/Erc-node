/** 生产任务工序表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_productivetaskprocess', {
    productivetaskprocess_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    productivetask_id: {
        type: db.IDNO,
        allowNull: true
    },
    productivetask_code: {
        type: db.STRING(50),
        allowNull: true
    },
    department_id: { //车间
        type: db.STRING(50),
        allowNull: true
    },
    procedure_id: { //工序
        type: db.ID,
        allowNull: true
    },
    procedure_level: { //所在工序的优先级
        type: db.STRING(5),
        allowNull: true
    }
});