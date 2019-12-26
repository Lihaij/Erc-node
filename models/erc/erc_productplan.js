/** 产品表*/
const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_productplan', {
    product_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    materiel_id: {
        type: db.IDNO,
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    design_number: {
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    order_id: {
        type: db.ID,
        allowNull: true
    },
    workshop_id: { //车间
        type: db.ID,
        allowNull: true
    },
    valid_state: { //评审状态 0未评审 1评审组 2已评审 3未通过
        type: db.IDNO,
        defaultValue: 0,
        allowNull: false
    },
    active_state: { //复制后有效状态 true有效
        type: db.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    plan_version: {
        type: db.DOUBLE(10, 2),
        allowNull: false,
        defaultValue: 1.00
    },
    copy_product_plan_id: {
        type: db.IDNO,
        allowNull: true
    }
});
