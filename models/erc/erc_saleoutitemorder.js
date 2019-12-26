const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**销售出库物料记录表 **/
module.exports = db.defineModel('tbl_erc_saleoutitemorder', {
    soi_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {//门店id
        type: db.IDNO,
        allowNull: true
    },
    sor_code: {//出货单号
        type: db.ID,
        allowNull: false
    },
    order_id: {//销售单号
        type: db.STRING(30),
        allowNull: false
    },
    warehouse_id: {//仓库ID
        type: db.IDNO,
        allowNull: false
    },
    warehouse_zone_id: {
        type: db.IDNO,
        allowNull: true
    },
    materiel_id: {//物料ID
        type: db.IDNO,
        allowNull: false
    },
    soi_number: {//出货数量
        type: db.IDNO,
        defaultValue: 0,
        allowNull: false
    },
    soi_note: {//备注
        type: db.STRING(30),
        allowNull: true
    }
});
