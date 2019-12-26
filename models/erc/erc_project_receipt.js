/**
 *  Created by Haij on 2019/10/24.
 */
const db = require('../../util/db');
/**项目收款申报**/
module.exports = db.defineModel('tbl_erc_project_receipt', {
    project_receipt_id: {//ID
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
    r_createdate:{//发起时间
        type:db.DATE,
        allowNull:true
    },
    proposer:{//问题提出人-user_id
        type:db.STRING(100),
        allowNull:false
    },
    task_title:{//任务标题
        type:db.STRING(500),
        allowNull:true
    },
    r_priority:{//优先级：3普通 2紧急 1.特别紧急
        type:db.STRING(4),
        defaultValue: '1',
        allowNull:true
    },
    complete_time:{//要求完成时间
        type:db.DATE,
        allowNull:true
    },
    real_complete_time:{//实际完成时间
        type:db.DATE,
        allowNull:true
    },
    r_executor:{//指派人-对应user_id?
        type:db.STRING(50),
        allowNull:true
    },
    task_description:{//任务描述
        type:db.TEXT(),
        allowNull:true
    },
    receipt_state:{//状态：1待处理 2已处理 3新建 
        type:db.STRING(4),
        defaultValue: '1',
        allowNull:true
    },
});
