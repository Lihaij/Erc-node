/** 部门 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_archives', {
    archives_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.BIGINT,
        allowNull: true
    },
    user_id: {
        type: db.STRING(50),
        allowNull: true
    },
    archives_type: {//档案类型
        type: db.INTEGER,
        allowNull: false
    },
    archives_no: {//档案编号
        type: db.STRING(100),
        allowNull: false
    },
    archives_name: {//档案名称
        type: db.STRING(100),
        allowNull: false
    },
    department_id: {//留存部门id
        type: db.STRING(50),
        allowNull: false
    },
    keep_time: {//留存时长
        type: db.INTEGER,
        allowNull: true
    },
    keep_begin_date: {//留存开始日期
        type: db.DATE,
        allowNull: true
    },
    keep_end_date: {//留存截止日期
        type: db.DATE,
        allowNull: true
    },
    instruction: { //档案说明
        type: db.STRING(1024),
        allowNull: true
    },
    archives_file_id: {//附件id
        type: db.IDNO,
        allowNull: true
    },
    archiveshand_id: {//应交档案id
        type: db.INTEGER,
        allowNull: true
    },
    archives_state: {//状态
        type: db.INTEGER,
        allowNull: true
    },
    predepartment_id: {//转交前部门id
        type: db.STRING(50),
        allowNull: true
    },
    prekeep_date: {//转交日期
        type: db.DATE,
        allowNull: true
    },
    keeper: {//保管责任人
        type: db.STRING(50),
        allowNull: true
    }
});
