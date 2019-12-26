const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**派单模板维护**/
module.exports = db.defineModel('tbl_erc_assignment', {
    assignment_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: db.ID,
        allowNull: false
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    designer_id: {//设计师
        type: db.ID,
        allowNull: true
    },
    design_checker_id: {//设计审核
        type: db.ID,
        allowNull: true
    },
    material_checker_id: {//物料审核
        type: db.ID,
        allowNull: true
    },
    price_checker_id: {//价格审核
        type: db.ID,
        allowNull: true
    },
    change_checker_id: {//变更审核
        type: db.ID,
        allowNull: true
    },
    supervisor_id: {//监理
        type: db.ID,
        allowNull: true
    },
});
