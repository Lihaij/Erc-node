/** 门店物料仓库关系表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_ms2w', {
    ms2w_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_kind: { //门店细分类型
        type: db.STRING(3),
        defaultValue: '',
        allowNull: true
    },
    materiel_type: {//物料分类
        type: db.STRING(20),
        allowNull: true
    },
    warehouse_code: {//仓库编号
        type: db.STRING(20),
        allowNull: true
    }
});
