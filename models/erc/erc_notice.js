/** 通知公告表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_notice', {
    notice_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {//发布公告部门ID
        type: db.IDNO,
        allowNull: false
    },
    user_id: { //发布人ID
        type: db.ID,
        defaultValue: '',
        allowNull: false
    },
    notice_title: {//公告名称
        type: db.STRING(200),
        allowNull: true
    },
    notice_detail: {//公告明细
        type: db.STRING(1000),
        allowNull: true
    },
    notice_question: {//问题
        type: db.STRING(200),
        allowNull: true
    },
    notice_answer: {//答案
        type: db.STRING(200),
        allowNull: true
    },
    notice_state: {//审批状态 0.待提交 1.待审批 2.未通过 3.已通过
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
    notice_checker_id: {//审批人user_id
        type: db.ID,
        allowNull: true
    },
    notice_check_date: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    notice_refuse_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    },
    notice_answera: {//答案A
        type: db.STRING(200),
        allowNull: true
    },
    notice_answerb: {//答案B
        type: db.STRING(200),
        allowNull: true
    },
    notice_answerc: {//答案C
        type: db.STRING(200),
        allowNull: true
    },
    notice_answerd: {//答案D
        type: db.STRING(200),
        allowNull: true
    }
});
