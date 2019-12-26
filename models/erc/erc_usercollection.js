/**
 * Created by BaiBin on 2018/3/19.
 */
const db = require('../../util/db');
/**客户联系方式信息**/
module.exports = db.defineModel('tbl_erc_usercollection', {
    collection_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: db.ID,
        allowNull: true
    },
    decorate_id: {
        type: db.ID,
        allowNull: false
    },
    open_id: {
        type: db.ID,
        allowNull: true
    },
});