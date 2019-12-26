/**
 * 工资月
 * Created by BaiBin on 2019/3/12.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_monthwages', {
    monthwages_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    monthwages_date: { //工资月份
        type: db.DATE,
        allowNull: false
    }
});