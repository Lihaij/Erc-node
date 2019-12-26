/**
 *  Created by Haij on 2019/10/24.
 */
const db = require('../../util/db');
/**项目里程碑参与人员表**/
module.exports = db.defineModel('tbl_erc_project_milestone', {
    project_milestone_id: {//ID
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
    milestone_date:{//里程碑日期
        type:db.DATE,
        allowNull:true
    },
    milestone_name:{//里程碑名称
        type:db.STRING(200),
        allowNull:true
    },
    achievement:{//里程碑成果描述
        type:db.TEXT(),
        allowNull:true
    },
    participants:{//参与人员
        type:db.STRING(300),
        allowNull:true
    },
    acceptance_status:{//验收状态：0未验收 1已验收
        type:db.STRING(4),
        defaultValue: '0',
        allowNull:true
    },
    acceptancetime:{//验收时间
        type:db.DATE,
        allowNull:true
    }
});