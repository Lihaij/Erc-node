/** 固定资产维修 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_fixedassetsrepairmaterials', {
    fixedassetsrepairmaterials_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    fixedassetsrepair_id: {
        type: db.IDNO,
        allowNull: true
    },
    repair_name: {//维修材料名称
        type: db.STRING(100),
        allowNull: true
    },
    repair_model: {//规格型号
        type: db.STRING(20),
        allowNull: true
    },
    repair_unit: {//计量单位
        type: db.STRING(10),
        allowNull: true
    },
    repair_price: { //维修材料单价*100
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    repair_number: { //数量
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: false
    },
});