/** 改善措施表
*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_stoplineimprovedetail', {
    stoplineimprovedetail_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    stoplineimprovedetail_remark: { //改善措施
        type: db.STRING(500),
        allowNull: true
    },
    stoplinegather_id: {
        type: db.IDNO,
        allowNull: true
    },

    stoplineimprovedetail_put_person: {    //责任实施人
        type: db.STRING(50),
        allowNull: true
    },

    stoplineimprovedetail_supe_person: { //监督人
        type: db.STRING(50),
        allowNull: true
    },
    stoplineimprovedetail_put_state: {    //状态 0未确认    1已确认
        type: db.STRING(5),
        allowNull: true
    },
    stoplineimprovedetail_supe_state: {    //状态 0未确认    1已确认
        type: db.STRING(5),
        allowNull: true
    },
});

