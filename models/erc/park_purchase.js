/** 采购信息表 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_park_purchase', {
    purchase_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {  // ?应该是对应企业的吧?
        type: db.BIGINT,
        allowNull: true
    },
    // purchas_company_id: {  //采购归属的企业ID
    //     type: db.BIGINT,
    //     allowNull: true
    // },
    purchase_approver:{//发布人，对应user_id
        type: db.STRING(50),
        allowNull: true
    },
    type_id:{//采购分类
        type: db.STRING(50),
        allowNull: true
    },
    purchase_type: {//1.现货  2.标准品
        type: db.STRING(4),
        defaultValue: '1',
        allowNull: true
    },
    purchase_projectname: {
        type: db.STRING(100),
        allowNull: true
    },
    company_name: {
        type: db.STRING(100),
        allowNull: true
    },//企业名称 ?
    purchaser: {
        type: db.STRING(50),
        allowNull: true
    },//联系人
    purchaser_phone: {
        type: db.STRING(50),
        allowNull: true
    },//
    quotation_deadline: {
        type: db.DATE,
        allowNull: true
    },//报价截止时间
    purchase_details: {//采购明细
        type: db.TEXT(),
        allowNull: true
    },
    purchase_rules: {
        type: db.TEXT(),
        allowNull: true
    },
    quotation_details: {
        type: db.TEXT(),
        allowNull: true
    },
    is_passed:{//1.未通过审核  2.已通过审核 3.审核不通过
        type: db.STRING(4),
        defaultValue: '1',
        allowNull: false
    },
    //标记ERC或非ERC的采购？？字段
    purchase_state:{//1.ERC采购  2.非ERC采购
        type: db.STRING(4),
        defaultValue: '1',
        allowNull: false
    },

});
