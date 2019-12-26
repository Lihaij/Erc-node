/** 企业每二十四项基本数据表 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_park_data', {
    park_data_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {  // ？
        type: db.BIGINT,
        allowNull: true
    },
    park_company_id:{
        type: db.BIGINT,
        allowNull: true
    },//企业id
    record_date:{
        type: db.DATE,
        allowNull: true
    },//记录的时间-月份
    gdp:{
        type: db.DOUBLE,
        allowNull: true
    },//
    sales:{
        type: db.DOUBLE,
        allowNull: true
    }, //销售额(万元)
    tax_payment:{
        type: db.DOUBLE,
        allowNull: true
    },//纳税总额
    deductible_input_tax:{
        type: db.DOUBLE,
        allowNull: true
    },//待抵扣进项税额
    profit_tax:{
        type: db.DOUBLE,
        allowNull: true
    },//利税总额
    safeproduction_days:{
        type: db.INTEGER,
        allowNull: true
    }, //安全生产天数
    patents_num:{
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    }, //专利数量
    project_RD_num:{
        type: db.INTEGER,
        allowNull: true
    }, //研发立项数量
    land_use:{
        type: db.DOUBLE,
        allowNull: true
    }, //(平方)
    construct_area:{
        type: db.DOUBLE,
        allowNull: true
    },//建筑情况(平方)
    planned_investment:{
        type: db.DOUBLE,
        allowNull: true
    }, //计划投资额
    actual_investment:{
        type: db.DOUBLE,
        allowNull: true
    }, //实际投资额
    fixed_assets:{
        type: db.DOUBLE,
        allowNull: true
    }, //固定资产投资总额
    production_equipment_investment:{
        type: db.DOUBLE,
        allowNull: true
    },//生产设备投资额
    //talents_num, //人才数量(个)   包含院士以上、博士、硕士、本科
    academicians_num:{
        type: db.INTEGER,
        allowNull: true
    },//
    doctors_num:{
        type: db.INTEGER,
        allowNull: true
    },//
    masters_num:{
        type: db.INTEGER,
        allowNull: true
    },//
    undergraduates_num:{
        type: db.INTEGER,
        allowNull: true
    },//
    RD_investment:{
        type: db.DOUBLE,
        allowNull: true
    }, //研发投入金额
    energy_consumption:{
        type: db.DOUBLE,
        allowNull: true
    }, //能源消耗金额
    electricity_consumption:{
        type: db.DOUBLE,
        allowNull: true
    }, //用电情况(度)
    water_consumption:{
        type: db.DOUBLE,
        allowNull: true
    }, //水资源消耗情况(立方)
    gas_consumption:{
        type: db.DOUBLE,
        allowNull: true
    }, //气资源消耗情况(立方)
    gov_subsidies:{
        type: db.DOUBLE,
        allowNull: true
    }, //政府补助情况(万元)
    gov_support_project:{
        type: db.INTEGER,
        allowNull: true
    }, //政府扶持项目申报情况(个)
    gov_support_amount:{
        type: db.DOUBLE,
        allowNull: true
    },//政府扶持项目当月申请金额
    environment_protection:{
        type: db.INTEGER,
        allowNull: true
    }, //环保情况(个)
    coal_consumption:{
        type: db.DOUBLE,
        allowNull: true
    },//煤资源消耗情况(立方)
    subscription_capital:{
        type: db.DOUBLE,
        allowNull: true
    },//认缴资本
    paidin_capital:{
        type: db.DOUBLE,
        allowNull: true
    },//实收资本
    floor_area:{
        type: db.DOUBLE,
        allowNull: true
    }, //占地面积(平方米)
    production_area:{
        type: db.DOUBLE,
        allowNull: true
    },//生产面积
    office_space:{
        type: db.DOUBLE,
        allowNull: true
    },//办公面积 
    death_toll:{
        type: db.INTEGER,
        allowNull: true
    },//死亡人数
    injured_num:{
        type: db.INTEGER,
        allowNull: true
    },//受伤人数
    envir_punished:{//1.是 0.否
        type: db.STRING(4),
        defaultValue: '1',
        allowNull: true
    },//是否被环保处罚
    self_test:{//1.是 0.否
        type: db.STRING(4),
        defaultValue: '1',
        allowNull: true
    },//是否环保自我检测
    self_test:{//1.是 0.否
        type: db.STRING(4),
        defaultValue: '1',
        allowNull: true
    },//是否环保自我检测

    utility:{//实用新型
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    outward:{//外观设计
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    dormitory_area:{//宿舍面积
        type: db.DOUBLE,
        allowNull: true
    },
    high_tech:{//是否高新企业  0否  1是
        type: db.STRING(4),
        defaultValue:'0',
        allowNull: true
    },
    registered_capital:{
        type: db.DOUBLE,
        allowNull: true
    }
});
