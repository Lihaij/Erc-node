/** 生产计划临时表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_product_plan_execute', {
    product_plan_execute_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    m1_materiel_code: {
        type: db.STRING(255),
        allowNull: true
    },
    m1_materiel_name: {
        type: db.STRING(255),
        allowNull: true
    },
    m1_materiel_id: {
        type: db.STRING(255),
        allowNull: true
    },
    m2_materiel_code: {
        type: db.STRING(255),
        allowNull: true
    },
    m2_materiel_name: {
        type: db.STRING(255),
        allowNull: true
    },
    m2_materiel_id: {
        type: db.STRING(255),
        allowNull: true
    },
    order_id: {
        type: db.STRING(255),
        allowNull: true
    },
    productivetask_code: {
        type: db.STRING(255),
        allowNull: true
    },
    productivetask_state: {
        type: db.STRING(255),
        allowNull: true
    },
    workshop_id: {
        type: db.STRING(255),
        allowNull: true
    },
    department_name: {
        type: db.STRING(255),
        allowNull: true
    },
    product_level: {
        type: db.STRING(255),
        allowNull: true
    },
    procedure_name: {
        type: db.STRING(255),
        allowNull: true
    },
    priority: {
        type: db.STRING(255),
        allowNull: true
    },
    productivetask_id: {
        type: db.STRING(255),
        allowNull: true
    },
    product_id: {
        type: db.STRING(255),
        allowNull: true
    },
    taskdesign_number: {
        type: db.STRING(255),
        allowNull: true
    },
    end_date: {
        type: db.STRING(255),
        allowNull: true
    },
    begin_date: {
        type: db.STRING(255),
        allowNull: true
    },
    UUID: {
        type: db.STRING(255),
        allowNull: true
    },
    prod_end_date: {
        type: db.STRING(255),
        allowNull: true
    }
});
