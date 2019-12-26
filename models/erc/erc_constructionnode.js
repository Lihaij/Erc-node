/**
 * Created by Szane on 17/6/6.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/** 施工节点 **/
module.exports = db.defineModel('tbl_erc_constructionnode', {
    node_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    template_id: {
        type: db.IDNO,
        allowNull: false
    },
    node_name: {//节点名称
        type: db.STRING(100),
        allowNull: true
    },
    start_day: {
        type: db.INTEGER,
        allowNull: true
    },
    end_day: {
        type: db.INTEGER,
        allowNull: true
    },
    node_index: {
        type: db.INTEGER,
        allowNull: true
    },
    node_description: {//节点描述
        type: db.STRING(200),
        allowNull: true
    }
});
