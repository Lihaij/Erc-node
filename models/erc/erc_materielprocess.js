/** 套餐工序 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_materielprocess', {
    materielprocess_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    materiel_id: {//物料ID
        type: db.IDNO,
        allowNull: false
    },
    process_name: {//工序名称
        type: db.STRING(20),
        allowNull: false
    },
    process_duration: {//工序时长
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    process_level:{//工序优先级别
        type: db.IDNO,
        allowNull: false
    }
});
