/** 员工工序关联 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_userprocedure', {
    userprocedure_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: db.ID,
        allowNull: true 
    },
    procedure_id: {
        type: db.ID,
        allowNull: true 
    }
});
