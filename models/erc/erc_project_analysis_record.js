/**
 *  Created by Haij on 2019/10/24.
 */
const db = require('../../util/db');
/**项目推动分析记录**/
module.exports = db.defineModel('tbl_erc_project_analysis_record', {
    project_analysis_record_id: {//ID
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.BIGINT,
        allowNull: true
    },
    project_info_id:{//项目信息表ID
        type:db.STRING(30),
        allowNull:false
    },
    record_date:{//记录日期
        type:db.DATE,
        allowNull:true
    },
    active_descried:{//行动描述
        type:db.TEXT(),
        allowNull:true
    },
    active_reflection:{//相关反映
        type:db.TEXT(),
        allowNull:true
    },
    shortage:{//不足
        type:db.TEXT(),
        allowNull:true
    },
    next_step:{//下一步推进
        type:db.TEXT(),
        allowNull:true
    },
});