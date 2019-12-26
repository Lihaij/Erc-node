const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**销售出库订单表 **/
module.exports = db.defineModel('tbl_erc_saleoutorder', {
    sor_id: {
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
    sor_number: {//出货总数量
        type: db.IDNO,
        defaultValue: 0,
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
    sor_contact: {//收货联系人
        type: db.STRING(30),
        allowNull: true
    },
    sor_phone: {//联系电话
        type: db.STRING(30),
        allowNull: true
    },
    logistics_company: {//发货物流公司
        type: db.STRING(30),
        allowNull: true
    },
    send_contact: {//发货联系人
        type: db.STRING(30),
        allowNull: true
    },
    truck_number: {//发过物流公司
        type: db.STRING(30),
        allowNull: true
    },
    driver_name: {//司机姓名
        type: db.STRING(30),
        allowNull: true
    }
});
