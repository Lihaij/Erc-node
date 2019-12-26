/** 户型物料 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_goordermateriel', {
    goordermateriel_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    roomtype_id: {//户型id
        type: db.IDNO,
        allowNull: false
    },
    goroom_id: {
        type: db.IDNO,
        allowNull: true
    },
    gomateriel_id: {
        type: db.IDNO,
        allowNull: false
    },
    gomateriel_amount: {//数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    gomateriel_batch: {//批次
        type: db.INTEGER,
        allowNull: true
    },
    goroom_type: {//空间类型
        type: db.STRING(20),
        allowNull: true
    },
    gomateriel_type: {//物料类型(定制品、标准品) ROOMMATERIALINFO
        type: db.STRING(20),
        allowNull: false
    },
    gopurchase_state: { //物料（采购）状态
        type: db.STRING(4),
        allowNull: true
    },
    gopurchase_id: { //采购ID
        type: db.ID,
        allowNull: true
    },
});
