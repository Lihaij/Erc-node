/**
 *  Created by Haij on 2019/10/24.
 */
const db = require('../../util/db');
/**项目基本信息**/
module.exports = db.defineModel('tbl_erc_project_info', {
    project_info_id: {//项目信息ID
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.BIGINT,
        allowNull: true
    },
    project_number:{//项目编号
        type:db.STRING(50),
        allowNull:true
    },
    project_name:{//项目名称
        type:db.STRING(50),
        allowNull:true
    },
    project_address:{//项目地址
        type:db.STRING(100),
        allowNull:true
    },
    project_customer_id:{//项目客户信息ID：来自（项目客户信息表）
        type:db.STRING(30),
        allowNull:false
    },
    customer_id:{//项目业务负责人：来自（公司员工信息表）user_id
        type:db.STRING(30),
        allowNull:false
    },
    project_state:{//状态：1立项 2进行中 3结束
        type: db.STRING(4),
        defaultValue: '1',
        allowNull: true
    },
});