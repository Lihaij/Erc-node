/**企业客户销售价格模板表 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_producepricetemplate', {
    producepricetemplate_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    producepricetemplate_name: {
        type: db.STRING(100),
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    }
});
