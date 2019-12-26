const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**文控管理回答试题表 **/
module.exports = db.defineModel('tbl_erc_docdetailsubmitquestion', {
    docdetailsubmitquestion_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    docdetailquestion_id: {
        type: db.ID,
        allowNull: false
    },
    document_id: {
        type: db.ID,
        allowNull: false
    },
    docdetail_id: {
        type: db.IDNO,
        allowNull: true
    },
    user_id: {
        type: db.ID,
        allowNull: false
    },
    submit_question_answer: {//回答问题答案
        type: db.STRING(4),
        allowNull: true
    }
});