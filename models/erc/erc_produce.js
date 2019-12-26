/** 产品表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_produce', {
    produce_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    materiel_id: {
        type: db.IDNO,
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    produce_client_state: {
        type: db.STRING(5),
        defaultValue: '',
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
});
