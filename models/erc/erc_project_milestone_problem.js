/**
 *  Created by Haij on 2019/10/24.
 */
const db = require('../../util/db');
/**里程碑问题处理**/
module.exports = db.defineModel('tbl_erc_project_milestone_problem', {
    milestone_problem_id: {//ID
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.BIGINT,
        allowNull: true
    },
    project_milestone_id:{//里程碑ID
        type:db.STRING(30),
        allowNull:false
    },
    problem_createdate:{//问题创建日期
        type:db.DATE,
        allowNull:true
    },
    problem_title:{//问题标题
        type:db.STRING(500),
        allowNull:true
    },
    proposer:{//问题提出人-user_id
        type:db.STRING(100),
        allowNull:false
    },
    problem_description:{//问题描述
        type:db.TEXT(),
        allowNull:true
    },
    assignee:{//指派人
        type:db.STRING(100),
        allowNull:false
    },
    deadline:{//处理期限（日期）
        type:db.DATE,
        allowNull:true
    },
    real_deadline:{//实际处理日期
        type:db.DATE,
        allowNull:true
    },
    problem_state:{//状态：1待处理 2已处理 3新建 
        type:db.STRING(4),
        defaultValue: '1',
        allowNull:true
    },
});