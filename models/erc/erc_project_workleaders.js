/**
 *  Created by Haij on 2019/10/24.
 */
const db = require('../../util/db');
/**项目工作负责人关联表**/
module.exports = db.defineModel('tbl_erc_project_workleaders', {
    project_workleaders_id: {//项目工作负责人关联ID
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.BIGINT,
        allowNull: true
    },
    project_info_id:{//项目信息ID：来自（项目基本信息表）
        type: db.STRING(30),
        allowNull:false
    },
    user_id: {//项目工作负责人：来自（公司员工信息表）
        type: db.STRING(30),
        allowNull:false
    }
});