/** 园区企业信息表 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_park_company', {
    park_company_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {  // ?
        type: db.BIGINT,
        allowNull: true
    },
    company_name: {// ?
        type: db.STRING(100),
        allowNull: true
    },
    company_address: {
        type: db.STRING(200),
        allowNull: true
    },
    floor_area: {//占地面积
        type: db.DOUBLE,
        allowNull: true
    },
    construction_area: {//建筑面积
        type: db.DOUBLE,
        allowNull: true
    },
    registered_capital: {
        type: db.DOUBLE,
        allowNull: true
    },//注册资本
    paid_up_capital: {
        type: db.DOUBLE,
        allowNull: true
    },//实收资本
    plan_investment: {
        type: db.DOUBLE,
        allowNull: true
    },//投资总额
    actual_investmen: {
        type: db.DOUBLE,
        allowNull: true
    },//实际投资总额
    equipment_investment: {
        type: db.DOUBLE,
        allowNull: true
    },//生产设备投资总额
    employees_count: {
        type: db.INTEGER,
        allowNull: true
    },
    patent_number: {
        type: db.INTEGER,
        allowNull: true
    },//专利数
    map_loaction: {
        type: db.STRING(100),
        allowNull: true
    },//地图位置(经度，维度)
    high_tech:{//是否高新企业  0否  1是
        type: db.STRING(4),
        defaultValue:'0',
        allowNull: true
    },
    map_type:{//第几个地图
        type: db.STRING(4),
        defaultValue:'1',
        allowNull: true
    }
});
