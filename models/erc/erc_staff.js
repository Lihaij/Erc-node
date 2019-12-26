/**
 * Created by Szane on 17/5/31.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**订单服务团队人员信息 **/
module.exports = db.defineModel('tbl_erc_staff', {
    user_id: {
        type: db.ID,
        allowNull: false
    },
    order_id: {
        type: db.ID,
        allowNull: false
    },
    staff_phone: {
        type: db.STRING(20),
        allowNull: true
    },
    staff_state: {
        type: db.STRING(3),
        defaultValue: '1',
        allowNull: true
    },
    staff_type: {
        type: db.STRING(3),
        allowNull: true
    }
});
