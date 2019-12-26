/** 园区供应商 **/
const CryptoJS = require('crypto-js');
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_park_supplier', {
    park_supplier_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {//?
        type: db.BIGINT,
        allowNull: true
    },

    supplier_phone: {
        type: db.STRING(50),
        allowNull: true
    },
    supplier_mail: {
        type: db.STRING(100),
        allowNull: true
    },//邮箱
    supplier_name: {
        type: db.STRING(100),
        allowNull: true
    },
    supplier_pwd:{
        type: db.STRING(100),
        allowNull: false,
        set: function(val) {
            this.setDataValue('supplier_pwd', CryptoJS.MD5(val).toString());
        }
    },
    legal_person: {//法人
        type: db.STRING(50),
        allowNull: true
    },
    legal_IDCard_number: {
        type: db.STRING(100),
        allowNull: true
    },//法人身份证
    legal_IDCard_photo: {
        type: db.STRING(200),
        allowNull: true
    },//身份证文件路径
    business_license_no: {//工商证号
        type: db.STRING(200),
        allowNull: true
    },
    business_license_photo: {
        type: db.STRING(200),
        allowNull: true
    },//工商证号图片路径
    audit_status: {
        type: db.STRING(4),
        defaultValue: '1',
        allowNull: true
    },//审核状态 1.审核中，2审核通过，3审核失败  *—*
    main_business:{//主营业务
        type: db.STRING(200),
        allowNull: true
    },
    industry_classification:{
        type: db.STRING(5),
        defaultValue: '1',
        allowNull: true
    },//行业分类
    industry_name:{
        type: db.STRING(5),
        defaultValue: '1',
        allowNull: true
    }, //行业名称
    company_size:{
        type: db.STRING(5),
        defaultValue: '1',
        allowNull: true
    },//企业规模

    company_address: {
        type: db.STRING(200),
        allowNull: true
    },
    floor_area: {//占地面积
        type: db.STRING(100),
        allowNull: true
    },
    construction_area: {//建筑面积
        type: db.STRING(200),
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
    }    


});
