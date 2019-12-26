/** wms仓库信息 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_warehouse', {
    warehouse_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    warehouse_code: {//仓库编号
        type: db.STRING(20),
        allowNull: true
    },
    warehouse_name: {//仓库名称
        type: db.STRING(100),
        allowNull: true
    },
    warehouse_type: {//仓库类型
        type: db.STRING(4),
        allowNull: true
    },
    warehouse_state: {//仓库状态
        type: db.STRING(4),
        allowNull: true
    },
    warehouse_address: {//仓库地址
        type: db.STRING(200),
        allowNull: true
    },
    warehouse_contact: {//联系人
        type: db.STRING(100),
        allowNull: true
    },
    warehouse_phone: {//联系方式
        type: db.STRING(20),
        allowNull: true
    },
    warehouse_fax: {//联系人传真
        type: db.STRING(20),
        allowNull: true
    },
    warehouse_remark: {//备注
        type: db.STRING(200),
        allowNull: true
    },
    warehouse_zone_id: {//仓区id
        type: db.IDNO,
        allowNull: true
    },
    domain_id: {//机构id
        type: db.IDNO,
        allowNull: true
    }
});
