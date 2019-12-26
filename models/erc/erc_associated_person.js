/**
 *  Created by Haij on 2019/10/24.
 */
const db = require('../../util/db');
/**项目关联人基本信息**/
module.exports = db.defineModel('tbl_erc_associated_person', {
    associated_person_id: {//项目关联人ID
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.BIGINT,
        allowNull: true
    },
    project_info_id:{//项目信息id:关联人对应的项目信息
        type: db.STRING(30),
        allowNull: false
    },
    associated_name:{//关联人名称
        type:db.STRING(50),
        allowNull: true
    },
    associated_birthday:{//关联人生日
        type:db.DATE,
        allowNull: true
    },
    associated_phone:{//联系电话
        type:db.STRING(50),
        allowNull:true
    },
    associated_wecat:{//微信号
        type:db.STRING(50),
        allowNull:true
    },
    associated_qq:{//QQ
        type:db.STRING(50),
        allowNull:true
    },
    associated_hobby:{//爱好描述
        type:db.TEXT(),
        allowNull:true
    },
    role_descried:{//作用描述
        type:db.TEXT(),
        allowNull:true
    },

});