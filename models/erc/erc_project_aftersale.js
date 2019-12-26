/**
 *  Created by Haij on 2019/10/24.
 */
const db = require('../../util/db');
/**项目售后**/
module.exports = db.defineModel('tbl_erc_project_aftersale', {
    project_aftersale_id: {//ID
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.BIGINT,
        allowNull: true
    },
    project_info_id:{//项目信息ID
        type:db.STRING(50),
        allowNull:false
    },
    question_description:{//问题描述
        type:db.TEXT(),
        allowNull:true
    },
    as_task:{//任务
        type:db.TEXT(),
        allowNull:true
    },
    proposer:{//问题提出人-user_id
        type:db.STRING(100),
        allowNull:false
    },
    executor:{//任务人
        type:db.STRING(200),
        allowNull:false
    },
    department_id:{//部门
        type:db.STRING(30),
        allowNull:true
    },
    aftersale_state:{//状态：1待处理 2已处理 3新建 
        type:db.STRING(4),
        defaultValue: '1',
        allowNull:true
    },
    complate_hours:{//处理时长（个小时）
        type:db.STRING(200),
        allowNull:true
    },
    // create_time:{//创建时间
    //     type:db.DATE,
    //     allowNull:true
    // },
    deadline:{//要求处理期限（日期）
        type:db.DATE,
        allowNull:true
    },
    real_dealine:{//实际处理日期
        type:db.DATE,
        allowNull:true
    },
});