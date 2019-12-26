/**
 * Created by BaiBin on 2018/3/16.
 */
const db = require('../../util/db');
/**客户联系方式信息**/
module.exports = db.defineModel('tbl_erc_decorateinfo', {
    decorate_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    decorate_img_id: {
        type: db.IDNO,
        allowNull: true
    },
    decorate_title: {
        type: db.STRING(50),
        allowNull: true
    },
    decorate_url: {
        type: db.STRING(100),
        allowNull: true
    }
    ,decorate_description: {
        type: db.STRING(300),
        allowNull: true
    },
    decorate_create_id: {
        type: db.ID,
        allowNull: true
    },
    decorate_create_name: {
        type: db.STRING(50),
        allowNull: true
    },
    decorate_type: { //DECORATETYPE
        type: db.STRING(5),
        allowNull: true
    },
    domain_id: {//机构id
        type: db.IDNO,
        allowNull: true
    },
    is_sale: {//SALETYPE
        type: db.STRING(5),
        allowNull: true
    },
    mark: {
        type: db.STRING(100),
        allowNull: true
    },
});