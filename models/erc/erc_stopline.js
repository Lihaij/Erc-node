/** 停线通知单*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_stopline', {
    stopline_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    stopline_code: { //停线通知单编号
        type: db.STRING(50),
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    productivetask_id: { //生产任务
        type: db.IDNO,
        allowNull: true
    },
    stopline_duration: { //停线时长
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    stopline_department_id: { //影响部门
        type: db.STRING(50),
        allowNull: true
    },
    stopline_recipient: { //责任单位接收人
        type: db.STRING(50),
        allowNull: true
    },
    stopline_site: { //品质在场人员
        type: db.STRING(50),
        allowNull: true
    },
    stopline_require: { //评审项目
        type: db.STRING(50),
        allowNull: true
    },
    stopline_remark: { //评审项目
        type: db.STRING(500),
        allowNull: true
    },
    stopline_state: { //0提交，1通过
        type: db.STRING(5),
        allowNull: true
    }
});

