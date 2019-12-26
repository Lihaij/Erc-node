/** 施工模板 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_templateconstruction', {
    template_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    template_name: {//模板名称
        type: db.STRING(100),
        allowNull: true
    },
    template_schedule: {//工期
        type: db.INTEGER,
        allowNull: true
    },
    template_describe: {//模板描述
        type: db.STRING(200),
        allowNull: true
    },
    domain_id: {//门店id
        type: db.INTEGER,
        allowNull: true
    },
});
