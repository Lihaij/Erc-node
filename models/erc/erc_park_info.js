/** 园区信息详情表 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_park_info', {
    park_info_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {  // ？
        type: db.BIGINT,
        allowNull: true
    },
    park_name: {//园区名称
        type: db.STRING(100),
        allowNull: true
    },
    park_location:{//园区位置
        type: db.STRING(100),
        allowNull: true
    },
    park_createdate: {//园区成立时间
        type: db.DATE,
        allowNull: true
    },
    park_field1:{
        type: db.STRING(100),
        allowNull: true
    },
    park_field2:{
        type: db.STRING(100),
        allowNull: true
    }
});
