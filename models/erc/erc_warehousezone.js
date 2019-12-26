/** wms仓区信息 **/
const db = require('../../util/db');
module.exports = db.defineModel('tbl_erc_warehousezone', {
    warehouse_zone_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    warehouse_id: {//仓库id
        type: db.IDNO,
        allowNull: false
    },
    zone_name: {//仓区名称
        type: db.STRING(100),
        allowNull: false
    },
    zone_remark: {//仓区备注
        type: db.STRING(200),
        allowNull: true
    }
});
