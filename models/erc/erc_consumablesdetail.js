/**
 * Created by Cici on 2018/5/29.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

//低值易耗品详情
module.exports = db.defineModel('tbl_erc_consumablesdetail',{
    consumables_detail_id:{ //ID
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id:{
        type: db.STRING(100),
        allowNull:true
    },
    consumables_parent_code:{
        type: db.STRING(100),
        allowNull:true
    },
    consumables_detail_code:{ //code
        type: db.STRING(100),
        allowNull:true
    },
    consumables_detail_creator_id:{//申请人ID
        type: db.STRING(100),
        allowNull: true
    },
    consumables_detail_creator_name: {//申请人名称
        type: db.STRING(100),
        allowNull: true
    },
    consumables_detail_status:{ //审核状态
        type: db.STRING(10),
        allowNull:true
    },

    consumables_detail_type_id:{ //1资产申购单 2验收单
        type: db.STRING(10),
        allowNull:true
    },
    consumables_name:{ //低值易耗品名称
        type: db.STRING(100),
        allowNull:true
    },
    consumables_specifications:{ //规格型号
        type: db.STRING(100),
        allowNull:true
    },
    consumables_unit:{ //计量单位
        type: db.STRING(100),
        allowNull:true
    },
    consumables_administrator_id:{ //管理人
        type: db.STRING(100),
        allowNull:true
    },
    department_id:{ //部门
        type: db.ID,
        allowNull:true
    },
    consumables_acceptance_type_id:{ //验收类型ID
        type: db.STRING(10),
        allowNull:true
    },
    consumables_number:{ //数量
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull:true
    },
    consumables_price:{ //单价
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull:true
    },
    consumables_invoice:{ //提供发票 0：不提供 1：提供
        type: db.IDNO,
        allowNull:true
    },
    consumables_subject:{ //资产提供主体
        type: db.STRING(100),
        allowNull:true
    },
    scrap_flag: {//报废标志 0：已报废 1：未报废
        type: db.STRING(4),
        defaultValue: 1,
        allowNull: true
    },
    take_stock_flag:{//盈亏状态 0：盈亏 1：正常
        type: db.STRING(4),
        defaultValue: 1,
        allowNull: true
    },
    take_stock_description:{//盈亏说明 0：盈亏 1：正常
        type: db.STRING(100),
        allowNull: true
    },
    consumables_flag: {//申购资产是否提交验收0：未提交 1：审核中 2：已驳回 3：已通过
        type: db.STRING(4),
        defaultValue: 0,
        allowNull: true
    },
    consumables_purch_detail_id:{ //对应资产申购时的id
        type: db.IDNO,
        allowNull: true
    },
    consumables_supplier_id: {//供应商id
        type: db.STRING(30),
        allowNull: true
    },
})
