/**
 * Created by BaiBin on 2018/2/9.
 */
/** 工程项目空间详情 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_projectspacedetail', {
    project_space_id: {
        type: db.ID,
        primaryKey: true
    },
    project_id: {
        type: db.ID,
        allowNull: false
    },
    project_detail_id: {
        type: db.IDNO,
        allowNull: false
    },
    project_space_position: {//空间位置
        type: db.STRING(50),
        allowNull: true
    },
    project_space_name: {//施工项
        type: db.STRING(50),
        allowNull: true
    },
    worker_id: {//工种id
        type: db.BIGINT(20),
        allowNull: true
    },
    count: {//数量
        type: db.INTEGER(10),
        allowNull: true
    },
    actual_count: {//实际数量
        type: db.INTEGER(10),
        allowNull: true
    },
    project_space_unit: {//计量单位
        type: db.STRING(20),
        allowNull: true
    },
    worker_budget:{//人工预算单价
        type: db.BIGINT(30),
        allowNull: true
    },
    worker_final_price:{//人工决算单价
        type: db.BIGINT(30),
        allowNull: true
    },
    material_budget:{//材料预算单价
        type: db.BIGINT(30),
        allowNull: true
    },
    worker_total_budget:{//人工预算总价
        type: db.BIGINT(30),
        allowNull: true
    },
    worker_total_final_price:{//人工决算总价
        type: db.BIGINT(30),
        allowNull: true
    },
    material_total_budget:{//材料预算总价
        type: db.BIGINT(30),
        allowNull: true
    },
    material_total_final_price:{//材料决算总价
        type: db.BIGINT(30),
        allowNull: true
    },
});