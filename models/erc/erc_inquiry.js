/**
 * Created by Szane on 17/6/21.
 */
/** 询价（准客户）信息**/
const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_inquiry', {
    inquiry_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    phone: {//客户手机
        type: db.STRING(20),
        allowNull: false
    },
    domain_id: {//门店ID
        type: db.IDNO,
        allowNull: true
    },
    template_id: {//套餐ID
        type: db.IDNO,
        allowNull: true
    },
    house_area: {//房屋面积
        type: db.DOUBLE,
        allowNull: true
    },
    pre_offer: {//快速报价
        type: db.DOUBLE,
        allowNull: true
    },
    customer_name: {//客户姓名
        type: db.STRING(100),
        allowNull: true
    },
    address: {//装修地址
        type: db.STRING(300),
        defaultValue: '',
        allowNull: true
    },
    house_type: {//户型
        type: db.STRING(4),
        allowNull: true
    },
    remark: {//备注
        type: db.STRING(300),
        defaultValue: '',
        allowNull: true
    },
    inquiry_state: {//状态
        type: db.STRING(4),
        defaultValue: '1',
        allowNull: true
    },
    area_code: {//所在城市code
        type: db.STRING(10),
        allowNull: true
    },
    customer_exist: {//客户是否存在
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    }
});