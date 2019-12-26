const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_order', {
    order_id: {//销售单号
        type: db.ID,
        primaryKey: true
    },
    domain_id: {//销售方
        type: db.IDNO,
        allowNull: true
    },
    user_id: { //业主的用户ID
        type: db.ID,
        defaultValue: '',
        allowNull: false
    },
    order_title: { //用于业主端展示的订单标题
        type: db.STRING(100),
        allowNull: true
    },
    order_type: { //订单类型  1散客装修单 7大客户 8采购销售单
        type: db.STRING(4),
        defaultValue: '',
        allowNull: false
    },
    order_address: { //装修地址
        type: db.STRING(300),
        allowNull: true
    },
    roomtype_id: { //户型
        type: db.IDNO,
        allowNull: true
    },
    order_house_area: { //面积
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: false
    },
    order_operator: {
        type: db.ID,
        allowNull: true
    },
    order_state: { //状态  ORDERSTATEINFO
        type: db.STRING(100),
        allowNull: true
    },
    sales_id: { //业务员
        type: db.ID,
        allowNull: true
    },
    designer_id: { //设计师
        type: db.ID,
        allowNull: true
    },
    order_supervision: { //监理
        type: db.ID,
        allowNull: true
    },
    order_foreman: { //工长
        type: db.ID,
        allowNull: true
    },
    order_remark: { //订单描述
        type: db.STRING(1000),
        allowNull: true
    },
    template_id: { //套餐ID
        type: db.IDNO,
        allowNull: true
    },
    order_deposit: { //订金
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: false
    },
    earnest: { //预收订金
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: false
    },
    pre_offer: { //最初报价（根据模板计算的价格）
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: false
    },
    final_offer: { //最终报价
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: false
    },
    order_check_state: { // 0 不需要审核 1 待审核
        type: db.STRING(4),
        allowNull: true
    },
    weekend_flag: { //周末开工标示
        type: db.STRING(4),
        defaultValue: '',
        allowNull: false
    },
    break_date: { //开工日期
        type: db.DATE,
        allowNull: true
    },
    actual_start_date: { //实际开工日期
        type: db.DATE,
        allowNull: true
    },
    complete_date: { //完工日期
        type: db.DATE,
        allowNull: true
    },
    pay_kind: { // 付款方式
        type: db.STRING(4),
        allowNull: true
    },
    contract_remark: { //合同描述
        type: db.STRING(1000),
        allowNull: true
    },
    contract_no: { //合同编号
        type: db.ID,
        allowNull: true
    },
    contract_operator: { //合同经办人
        type: db.ID,
        allowNull: true
    },
    contract_date: { //合同创建日期
        type: db.DATE,
        allowNull: true
    },
    estate_id: {
        type: db.IDNO,
        allowNull: true
    },
    estate_room_id: {
        type: db.IDNO,
        allowNull: true
    },
    materiel_remark: { //物料备注
        type: db.STRING(1000),
        allowNull: true
    },
    recommender_phone: { //推荐人手机
        type: db.STRING(20),
        defaultValue: '',
        allowNull: false
    },
    progress_payment: { //工程进度款
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: false
    },
    final_payment: { //尾款
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: false
    },
    interest_rate: { //毛利率
        type: db.DOUBLE,
        allowNull: true
    },
    award_cost: { //发包价格
        type: db.DOUBLE,
        allowNull: true
    },
    other_cost: { //其他费用
        type: db.DOUBLE,
        allowNull: true
    },
    purchase_order_id:{//采购单号
        type: db.STRING(30),
        allowNull: true
    },
    purchase_domain_id:{//采购方ID
        type: db.IDNO,
        allowNull: true
    },
    produce_id:{//产品ID
        type: db.IDNO,
        allowNull: true
    },
    order_sales_id: { //销售人员user_id
        type: db.ID,
        allowNull: true
    },
    purchase_contact: { //采购联系人，就是采购purchase_domain_id的domain_contact值
        type: db.STRING(30),
        allowNull: true
    },
    purchase_phone: { //采购联系电话，就是采购purchase_domain_id的domain_phone值
        type: db.STRING(30),
        allowNull: true
    },
    project_type: { //工程类型 OTYPEINFO
        type: db.STRING(4),
        allowNull: true
    },
    processcreate_state:{//是否生成生产计划
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    purchaser_type:{//采购方类型
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    purchaser_user_id: { //个人采购user_id
        type: db.STRING(30),
        allowNull: true
    },
    sales_data_source: { //销售单数据来源
        type: db.STRING(30),
        allowNull: true
    },
    sap_order_state: { //sap状态
        type: db.INTEGER,
        allowNull: true
    },
    purchaser_corporateclients_id: { //企业采购  企业ID
        type: db.IDNO,
        allowNull: true
    },
    send_creditline_state:{//是否提交信用额度标志
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    order_review_state:{//评审状态  0未提交 1已提交2 2通过 3拒绝
        type: db.STRING(4),
        allowNull: true
    },
    order_review_date:{//评审通过的时间
        type: db.STRING(50),
        allowNull: true
    },
    order_delivery_date: { //交货日期
        type: db.DATE,
        allowNull: true
    },
    biz_code: {
        type: db.ID,
        allowNull: true
    },
});
