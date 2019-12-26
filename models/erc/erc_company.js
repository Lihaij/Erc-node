const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**公司信息**/
module.exports = db.defineModel('tbl_erc_company', {
    company_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {//门店id
        type: db.IDNO,
        allowNull: true
    },
    company_code: { //公司编号
        type: db.STRING(50),
        allowNull: true
    },
    company_name: { //公司名称
        type: db.STRING(50),
        allowNull: true
    },
    company_business_scope: { //经营范围
        type: db.STRING(150),
        allowNull: true
    },
    company_main_business: { //主营业务
        type: db.STRING(150),
        allowNull: true
    },
    company_legal: { //法人代表
        type: db.STRING(50),
        allowNull: true
    },
    company_legal_no: { //法人代表身份证号
        type: db.STRING(50),
        allowNull: true
    },
    company_agency_phone: { //法定代理电话
        type: db.STRING(30),
        allowNull: true
    },
    company_ERC_name: { //ERC联系人姓名
        type: db.STRING(30),
        allowNull: true
    },
    company_ERC_phone: { //ERC联系人电话
        type: db.STRING(50),
        allowNull: true
    },
    company_ERC_QQ: { //ERC联系人qq
        type: db.STRING(50),
        allowNull: true
    },
    company_province: { //ERC联系人省
        type: db.STRING(50),
        allowNull: true
    },
    company_city: { //ERC联系人市
        type: db.STRING(50),
        allowNull: true
    },
    company_area: { //ERC联系人区
        type: db.STRING(50),
        allowNull: true
    },
    company_adress: { //ERC联系人详细地址
        type: db.STRING(150),
        allowNull: true
    },
    company_recording_currency: { //记账本位币
        type: db.STRING(50),
        allowNull: true
    },
    company_foreign: { //外币
        type: db.STRING(50),
        allowNull: true
    },
    company_precision: { //价格精度
        type: db.INTEGER,
        allowNull: true,
        defaultValue: 2
    },
    company_profit_pursuit: { //利润诉求
        type: db.STRING(50),
        allowNull: true
    },
    company_advance_date: { //提前天数
        type: db.STRING(50),
        allowNull: true
    },
    company_recognition_criteria: { //生产设备类固定资产确认标准
        type: db.STRING(50),
        allowNull: true
    },
    company_service_purchase_criteria: { //外包劳务简易采购流程金额标准
        type: db.STRING(50),
        allowNull: true
    },
    company_property_purchase_criteria: { //资产简易采购流程金额标准
        type: db.STRING(50),
        allowNull: true
    },
    company_complex_supplier_number: { //复杂采购流程需要输入供应商家数
        type: db.STRING(50),
        allowNull: true
    },
    company_piece_amount: { //计件员工保底金额
        type: db.STRING(50),
        allowNull: true
    },
    company_dayoff_type: { //休息类型   0单休，1双休，2不休
        type: db.STRING(20),
        allowNull: true
    },
    sale_goods_tax_rate: {
        type: db.INTEGER,
        allowNull: true
    },
    provide_labor_tax_rate: {
        type: db.INTEGER,
        allowNull: true
    },
    receiver_id:{// 信息接收员id
        type:db.STRING(50),
        allowNull: true
    }
});
