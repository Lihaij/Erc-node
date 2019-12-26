/** 企业客户产品表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_produce_client', {
    produce_client_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    produce_id: {//tbl_erc_produce表主键（作废，改为与materiel表关联）
        type: db.IDNO,
        allowNull: true
    },
    materiel_id: {//tbl_erc_materiel表主键
        type: db.IDNO,
        allowNull: true
    },
    client_domain_id: {//体验店客户domain_id或企业客户corporateclients_id
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
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    // user_id: {
    //     type: db.ID,
    //     allowNull: true
    // },
    produce_client_state: {
        type: db.STRING(5),
        defaultValue: '1',
        allowNull: true
    },
    produce_client_type:{//类型 1：体验店客户 2：企业客户
        type: db.STRING(4),
        allowNull: true
    }
});
