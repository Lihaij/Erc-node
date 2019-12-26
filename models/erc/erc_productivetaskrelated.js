/** 生产任务明细(联产品/边余料)*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_productivetaskrelated', {
    productivetaskrelated_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    productivetask_id: {
        type: db.IDNO,
        allowNull: true
    },
    materiel_id: {
        type: db.IDNO,
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    taskrelateddesign_number: {   //数量
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    related_stock_in_number: {//联产品或边余料已入库的数量
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    related_stock_out_number: {//联产品或边余料已出库的数量
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    taskrelated_type: {   //1联产品，2边余料
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    productivetask_biz_code: { //biz_code
        type: db.STRING(50),
        allowNull: true
    }
});
