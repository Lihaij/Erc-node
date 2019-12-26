/** 任务类型表 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_taskallot', {
    taskallot_id: {
        type: db.IDNO,
        primaryKey: true
    },
    taskallot_name: {//任务名称
        type: db.STRING(30),
        allowNull: true
    },
    taskallot_describe: {//描述
        type: db.STRING(200),
        allowNull: true
    },
    taskallot_classify: {//类型
        type: db.INTEGER,
        allowNull: true,
        defaultValue: 1
    }
});
