/**
 *  Created by Haij on 2019/10/24.
 */
const db = require('../../util/db');
/**项目关联人活动**/
module.exports = db.defineModel('tbl_erc_associated_active', {
    associated_active_id: {//活动ID
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.BIGINT,
        allowNull: true
    },
    associated_person_id: {//项目关联人ID
        type: db.IDNO,
        allowNull: false
    },
    active_date:{//活动日期
        type:db.DATE,
        allowNull: true
    },
    active_name:{//活动名称
        type:db.STRING(200),
        allowNull: true
    },
    active_description:{//活动描述
        type:db.TEXT(),
        allowNull: true
    },
    active_note:{//活动备注
        type:db.TEXT(),
        allowNull: true
    }


});