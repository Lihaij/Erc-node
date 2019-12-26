const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**报废申请单 **/
module.exports = db.defineModel('tbl_erc_scrapdetail', {
    scrapdetail_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    scrap_id: {                     //申请单ID
        type: db.IDNO,
        allowNull: true
    },
    productivetaskdetail_id: {      //  投料ID
        type: db.IDNO,
        allowNull: true
    },
    materiel_id: {                  //物料ID
        type: db.STRING(50),
        allowNull: true
    },
    productivetask_code: {          //生产任务单号
        type: db.STRING(100),
        allowNull: true
    },
    scrapdetail_number: {           //报废数量
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    scrapdetail_number_standby: {      //备用数量
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    scrapdetail_number_replenish: {      //补充数量
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    scrapdetail_remark: {      //原因
        type: db.STRING(200),
        allowNull: true
    },
});