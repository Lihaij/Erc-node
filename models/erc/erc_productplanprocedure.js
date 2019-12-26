/** 产品规划工序表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_productplanprocedure', {
    product_procedure_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    product_plan_id: {//产品规划ID
        type: db.IDNO,
        allowNull: false
    },
    materiel_id: {//产品规划物料ID
        type: db.IDNO,
        allowNull: false
    },
    procedure_id: {//工序ID
        type: db.IDNO,
        allowNull: false
    },
    rlt_materiel_code: {//工序要生产的产品ID
        type: db.ID,
        allowNull: true
    },
    priority: {
        type: db.IDNO,
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    }
});
