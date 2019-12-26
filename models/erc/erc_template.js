/** 套餐 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_template', {
    template_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    template_name: {//套餐名称
        type: db.STRING(100),
        allowNull: true
    },
    template_describe: {//套餐描述
        type: db.STRING(200),
        allowNull: true
    },
    average_price: {//每平米单价
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: false
    }
});
