/**
 *  Created by Haij on 2019/10/24.
 */
const db = require('../../util/db');
/**项目验收**/
module.exports = db.defineModel('tbl_erc_project_acceptance', {
    project_acceptance_id: {//ID
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
    acceptance_date:{//验收时间
        type:db.DATE,
        allowNull:true
    },
    acceptor:{//验收人-user_id
        type:db.STRING(50),
        allowNull:true
    },
    acceptance_photo:{//验收照片
        type: db.STRING(200),
        allowNull: true
    },
    acceptance_assess:{//验收评价
        type: db.TEXT(),
        allowNull: true
    },

});