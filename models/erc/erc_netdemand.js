/**
 * Created by Szane on 17/6/19.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**工地物料净需求 **/
module.exports = db.defineModel('tbl_erc_netdemand', {
    netdemand_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    materiel_id: {//物料ID
        type: db.ID,
        allowNull: true
    },
    order_id: {//销售单号
        type: db.STRING(30),
        allowNull: true
    },
    netdemand_amount: {//净需求数量
        type: db.INTEGER,
        allowNull: true
    },
    mrp_date: {//本次mrp运算日期
        type: db.DATEONLY,
        allowNull: true
    },
    mrp_domain_id: {//本次mrp运算的机构ID
        type: db.ID,
        allowNull: true
    },
    mrp_state: {//是否已执行mrp运算 0未执行 1已执行
        type: db.STRING(5),
        allowNull: true
    }
});