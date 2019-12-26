/**
 * Created by Zhang Jizhe on 2018/4/8.
 */
/** 报销职级 **/
const db = require('../../util/db');
module.exports = db.defineModel('tbl_erc_reimburserank', {
    reimburserank_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    reimburserank_name: {//报销职级
        type: db.STRING(100),
        allowNull: true
    },
    reimburserank_reception_putup_level: {//接待住宿标准
        type: db.STRING(10),
        allowNull: true
    },
    reimburserank_trip_putup_level: {//出差住宿标准
        type: db.STRING(10),
        allowNull: true
    },
    reimburserank_downtown_traffic_level: {//市内交通补助标准
        type: db.STRING(10),
        allowNull: true
    },
    reimburserank_meal_level: {//伙食补助标准
        type: db.STRING(10),
        allowNull: true
    },
    reimburserank_reception_level: {//接待费标准
        type: db.STRING(10),
        allowNull: true
    },
    reimburserank_gas_level: {//油补标准
        type: db.STRING(10),
        allowNull: true
    },
    reimburserank_traffic_available: {//可使用交通金额
        type: db.STRING(10),
        allowNull: true
    },
    domain_id: {//
        type: db.INTEGER,
        allowNull: true
    },
    reimburserank_traffic_tools: {//可使用交通工具
        type: db.STRING(10),
        allowNull: true
    }
});
