/**
 *  Created by Haij on 2019/10/24.
 */
const db = require('../../util/db');
/**关联人亲友基本信息**/
module.exports = db.defineModel('tbl_erc_associated_relatives', {
    associated_relatives_id: {//亲友ID
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.BIGINT,
        allowNull: true
    },
    associated_person_id: {//关联人ID
        type:db.STRING(30),
        allowNull:false
    },
    relative_name:{//名称
        type:db.STRING(50),
        allowNull: true
    },
    relative_birthday:{//生日
        type:db.DATE,
        allowNull: true
    },
    relative_phone:{//联系电话
        type:db.STRING(50),
        allowNull:true
    },
    relative_wecat:{//微信号
        type:db.STRING(50),
        allowNull:true
    },
    relative_qq:{//QQ
        type:db.STRING(50),
        allowNull:true
    },
    relative_hobby:{//爱好描述
        type:db.STRING(200),
        allowNull:true
    },
});