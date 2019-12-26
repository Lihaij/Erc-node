/**企业客户销售价格模板详情表 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_producepricetemplatedetail', {
    producepricetemplatedetail_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    producepricetemplate_id: {
        type: db.IDNO
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    materiel_id: {
        type: db.IDNO,
        allowNull: true
    },
    suggest_price: { //建议报价
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    start_date:{//有效期开始日期
        type: db.DATE,
        allowNull: true
    },
    end_date:{//有效期结束日期
        type: db.DATE,
        allowNull: true
    },
    price_state: {//状态：1：启用；0：停用
        type: db.STRING(4),
        defaultValue: '1',
        allowNull: true
    },
    price_xssysl: {//销售适用税率
        type: db.STRING(30),
        defaultValue: '1',
        allowNull: true
    },
    price_jgqyxddj: {//价格启用选定单据
        type: db.STRING(30),
        defaultValue: '1',
        allowNull: true
    }


});
