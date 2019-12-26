const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**客户积分**/
module.exports = db.defineModel('tbl_erc_customerpoint', {
    customerpoint_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: db.ID,
        allowNull: false
    },
    pointtype_id: { //积分类型
        type: db.IDNO,
        allowNull: false
    },
    customer_point: {//积分（正数为增加，负数为消费）
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    order_id: {//销售单号
        type: db.ID,
        allowNull: true
    },
    customerpoint_remarks: {//备注
        type: db.STRING(500),
        allowNull: true
    }
});
