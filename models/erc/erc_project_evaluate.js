/**
 *  Created by Haij on 2019/10/24.
 */
const db = require('../../util/db');
/**项目评价**/
module.exports = db.defineModel('tbl_erc_project_evaluate', {
    project_evaluate_id: {//ID
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.BIGINT,
        allowNull: true
    },
    project_info_id:{//项目信息ID
        type:db.STRING(30),
        allowNull:false
    },
    evaluator:{//评价人-对应user_id
        type:db.STRING(100),
        allowNull:true
    },
    evaluate_date:{//评价日期
        type:db.DATE,
        allowNull:true
    },
    evaluate_content:{//评价内容
        type:db.TEXT(),
        allowNull:true
    },
});