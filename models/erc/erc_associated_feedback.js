/**
 *  Created by Haij on 2019/10/24.
 */
const db = require('../../util/db');
/**项目关联人反馈**/
module.exports = db.defineModel('tbl_erc_associated_feedback', {
    associated_feedback_id: {//反馈ID
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.BIGINT,
        allowNull: true
    },
    associated_person_id: {//项目关联人ID
        type: db.IDNO,
        allowNull: false
    },
    feedback_date:{//反馈日期
        type:db.DATE,
        allowNull: true
    },
    feedback_content:{//反馈内容
        type:db.TEXT(),
        allowNull: true
    },
    feedback_note:{//反馈备注
        type:db.TEXT(),
        allowNull: true
    }
});