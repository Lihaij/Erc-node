/** 物料表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_otherstockout', {
    otherstockout_id: {//其他出库申请单号
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    stockoutapply_id: {//出库申请单号
        type: db.STRING(30),
        allowNull: true
    },
    performer_user_id: { //审核人
        type: db.STRING(50),
        defaultValue: null,
        allowNull: true
    },
    otherstockout_state: { //状态
        type: db.STRING(4),
        allowNull: true
    },
    domain_id: {//机构id
        type: db.IDNO,
        allowNull: true
    },
});
