/** 生产任务明细(投料)  对应生产计划
 * 每天的饿生产计划有自己的投料信息，数量为生产任务单的投料*当前生产计划的排产数量*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_ppmasterptdetail', {
    ppmasterptdetail_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    productivetask_id: {
        type: db.IDNO,
        allowNull: true
    },
    materiel_id: {
        type: db.IDNO,
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    ppmaster_id: {
        type: db.IDNO,
        allowNull: true
    },
    productivetaskdetail_id: {
        type: db.IDNO,
        allowNull: true
    },
    taskdetaildesign_number: {   //最终投料数量
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    reality_number: {   //实际数量
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    taskdetailprd_level: {      //层级
        type: db.IDNO,
        allowNull: true
    }
});
