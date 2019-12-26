/** 研发项目--收料单 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_developreceive', {
    developreceive_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    develop_id: {
        type: db.STRING(30),
        allowNull: false
    },
    receive_code: {//收料单编号
        type: db.STRING(100),
        allowNull: true
    },
    receive_creator: {//收料人
        type: db.STRING(100),
        allowNull: true
    },
    receive_examine: {//审批人
        type: db.STRING(100),
        allowNull: true
    },
    receive_examine_time: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    receive_refuse_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    },
});

