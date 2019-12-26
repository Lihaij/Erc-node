/** 研发项目--材料申购 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_developreceivedetail', {
    developreceivedetail_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    developreceive_id: {//收料单ID
        type: db.IDNO,
        allowNull: false
    },
    developsubscribe_id: {//申购单物料ID
        type: db.IDNO,
        primaryKey: true
    },
    receivesupplier_name: {//供应商名称
        type: db.STRING(100),
        allowNull: true
    },
    receivedetail_number: {//收料数量
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    receivedetail_price: {//收料单价
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    }
});
