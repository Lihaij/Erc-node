const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**公司银行账号信息**/
module.exports = db.defineModel('tbl_erc_companybankno', {
    companybankno_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    company_id: {//公司ID
        type: db.IDNO,
        allowNull: true
    },
    companybankno_name: { //银行账户名
        type: db.STRING(100),
        allowNull: true
    },
    companybankno_open: { //开户行名称
        type: db.STRING(100),
        allowNull: true
    },
    companybankno_bank_no: { //银行账号
        type: db.STRING(150),
        allowNull: true
    },
    companybankno_type: { //账户类型
        type: db.STRING(5),
        allowNull: true
    }
});
