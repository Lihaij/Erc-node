/**自动生成领料明细**/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_inventory_procedure_account', {
    inventory_procedure_account_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {//机构id
        type: db.IDNO,
        allowNull: true
    },
    prd_task_procedure_id: {//工序移交ID
        type: db.IDNO,
        allowNull: false
    },
    inventory_number: {//实际数量
        type: db.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    qualified_number: {//核实的数量
        type: db.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    qualified_state: {
        type: db.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
});
