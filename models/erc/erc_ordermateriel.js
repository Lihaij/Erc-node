/** 套餐 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_ordermateriel', {
    ordermateriel_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    room_id: {
        type: db.ID,
        allowNull: true
    },
    order_id: {
        type: db.ID,
        allowNull: false
    },
    template_id: {
        type: db.IDNO,
        allowNull: true
    },
    materiel_id: {
        type: db.IDNO,
        allowNull: false
    },
    materiel_amount: { //数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    materiel_batch: { //批次
        type: db.STRING(20),
        allowNull: true
    },
    purchase_state: { //物料（采购）状态
        type: db.STRING(4),
        allowNull: true
    },
    purchase_id: { //采购ID
        type: db.ID,
        allowNull: true
    },
    change_flag: { //是否为变更记录，0：否；1：是
        type: db.STRING(4),
        defaultValue: 0,
        allowNull: false
    },
    change_type: { //变更类型
        type: db.STRING(4),
        allowNull: true
    },
    change_price: { //变更金额
        type: db.DOUBLE,
        allowNull: true
    },
    change_state: { //变更状态
        type: db.STRING(4),
        allowNull: true
    },
    room_type: { //空间类型
        type: db.STRING(20),
        allowNull: true
    },
    ordermateriel_cost: {
        type: db.INTEGER,
        allowNull: true
    },
    ordermateriel_remark: { //物料的报价备注
        type: db.STRING(200),
        allowNull: true
    },
    sale_price: { //销售金额
        type: db.DOUBLE,
        allowNull: true
    },
    kjl_type: { //酷家乐type
        type: db.STRING(20),
        allowNull: true
    },
    kjl_imageurl: { //酷家乐imageurl
        type: db.STRING(200),
        allowNull: true
    },
    kjl_name: { //酷家乐imageurl
        type: db.STRING(50),
        allowNull: true
    },
    kjl_brand: { //酷家乐brand
        type: db.STRING(50),
        allowNull: true
    },
    kjl_specification: { //酷家乐specification
        type: db.STRING(100),
        allowNull: true
    },
    kjl_unit: { //酷家乐unit
        type: db.STRING(10),
        allowNull: true
    },
    kjl_number: {
      type: db.DOUBLE,
      allowNull: true
    },
    kjl_unitprice: {
      type: db.DOUBLE,
      allowNull: true
    },
    kjl_realprice: {
      type: db.DOUBLE,
      allowNull: true
    },
    kjl_group: {
      type: db.STRING(10),
      allowNull: true
    },
    sap_order_state: { //sap状态
        type: db.INTEGER,
        allowNull: true
    },
    mrp_state: {//是否已执行mrp运算 0未执行 1已执行
        type: db.STRING(5),
        allowNull: true
    },
});
