const db = require('../../util/db');
/**客户联系方式信息**/
module.exports = db.defineModel('tbl_erc_customercontact', {
    customercontact_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: db.ID,
        allowNull: false
    },
    contact_operator: {
        type: db.ID,
        allowNull: false
    },
    contact_type: {//类型
        type: db.STRING(1),
        allowNull: false
    },
    contact_way: {//联系方式
        type: db.STRING(1),
        allowNull: false
    },
    remark: {
        type: db.STRING(200),
        allowNull: false
    }
});