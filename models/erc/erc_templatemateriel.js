/** 物料模板 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_templatemateriel', {
    template_id: {
        type: db.IDNO,
        allowNull: false
    },
    materiel_id: {
        type: db.IDNO,
        allowNull: false
    },
    materiel_number: {
        type: db.INTEGER,
        allowNull: false
    },
    room_type: {//空间
        type: db.STRING(20),
        allowNull: true
    },
    template_material_batch: {//模板的物料批次，与物料批次不一定相同
        type: db.STRING(20),
        allowNull: true
    },
    materiel_source: { //物料来源
        type: db.STRING(12),
        allowNull: true
    }
});
