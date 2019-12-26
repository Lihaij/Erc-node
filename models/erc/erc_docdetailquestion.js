const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**文控管理试题表 **/
module.exports = db.defineModel('tbl_erc_docdetailquestion', {
    docdetailquestion_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    document_id: {
        type: db.ID,
        allowNull: true
    },
    docdetail_id: {
        type: db.IDNO,
        allowNull: true
    },
    question_title: {//问题标题
        type: db.STRING(100),
        allowNull: true
    },
    question_a: {//问题
        type: db.STRING(100),
        allowNull: true
    },
    question_b: {//问题B
        type: db.STRING(100),
        allowNull: true
    },
    question_c: {//问题C
        type: db.STRING(100),
        allowNull: true
    },
    question_d: {//问题D
        type: db.STRING(100),
        allowNull: true
    },
    question_answer: {//问题答案
        type: db.STRING(4),
        allowNull: true
    },
    submit_question_answer: {//回答问题答案
        type: db.STRING(4),
        allowNull: true
    }
});