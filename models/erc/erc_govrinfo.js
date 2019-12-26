/** 户型VR效果图 **/
const db = require('../../util/db');
module.exports = db.defineModel('tbl_erc_govrinfo', {
    govr_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    roomtype_id: {//户型id
        type: db.IDNO,
        allowNull: false
    },
    govr_name: {//效果图名称
        type: db.STRING(200),
        allowNull: false
    },
    govr_url: {//效果图链接
        type: db.STRING(500),
        allowNull: true
    },
    govr_creator: {//创建人
        type: db.ID,
        allowNull: true
    }
});