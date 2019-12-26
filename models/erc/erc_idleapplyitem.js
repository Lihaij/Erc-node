/** 闲置申请明细 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_idleapplyitem', {
    idleapplyitem_id: {//明细id
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    idleapply_id: {//申请单号
        type: db.ID,
        allowNull: false
    },
    materiel_id: {//物料id
        type: db.IDNO,
        allowNull: false
    },
    idle_item_amount: {//申请数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    warehouse_id: {//仓库ID
        type: db.IDNO,
        allowNull: true
    },
    warehouse_zone_id: {//仓区的id
        type: db.IDNO,
        allowNull: true
    }
});
