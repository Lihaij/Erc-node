/**
 * Created by Szane on 17/6/19.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**楼盘管理 **/
module.exports = db.defineModel('tbl_erc_estate', {
    estate_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    estate_no: {
        type: db.STRING(20),
        allowNull: true
    },
    province: {
        type: db.STRING(20),
        allowNull: true
    },
    city: {
        type: db.STRING(20),
        allowNull: true
    },
    district: {
        type: db.STRING(20),
        allowNull: true
    },
    estate_name: {
        type: db.STRING(50),
        allowNull: true
    },
    source: {
        type: db.STRING(20),
        allowNull: true
    },
    land_agent: {
        type: db.STRING(20),
        allowNull: true
    },
    address: {
        type: db.STRING(200),
        allowNull: true
    }
});