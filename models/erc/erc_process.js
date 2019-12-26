/** 全局工序 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_process', {
    process_id: {//工序id
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    process_name: {//工序名称
        type: db.STRING(30),
        allowNull: true
    }
});
