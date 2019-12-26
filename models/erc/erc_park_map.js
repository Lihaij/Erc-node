/** 园区地图信息表 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_park_map', {
    park_map_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {  // ？
        type: db.BIGINT,
        allowNull: true
    },
    user_id: {
        type: db.STRING(50),
        allowNull: false
    },
    file_creator: {
        type: db.STRING(100),
        allowNull: true
    },
    // file_name1: {
    //     type: db.STRING(200),
    //     allowNull: true
    // },
    // file_url1: {
    //     type: db.STRING(200),
    //     allowNull: true
    // },
    // file_type1: {
    //     type: db.STRING(200),
    //     allowNull: true
    // },
    // file_name2: {
    //     type: db.STRING(200),
    //     allowNull: true
    // },
    // file_url2: {
    //     type: db.STRING(200),
    //     allowNull: true
    // },
    // file_type2: {
    //     type: db.STRING(200),
    //     allowNull: true
    // },
});
