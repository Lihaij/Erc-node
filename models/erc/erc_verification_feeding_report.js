/**核销自生生产领料记录**/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
module.exports = db.defineModel('tbl_erc_verification_feeding_report', {
    confirm_feeding_report_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {//机构id
        type: db.IDNO,
        allowNull: true
    },
    productivetask_id: {//生产任务ID
        type: db.IDNO,
        allowNull: false
    },
    feeding_productivetask_id: {//投料生产任务ID
        type: db.IDNO,
        allowNull: false
    },
    verification_amount: {//核销金额
        type: db.DOUBLE,
        allowNull: false,
        defaultValue: 0
    },
    verification_number: {//核销数量
        type: db.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    verification_type: {//核销类型
        type: db.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    verification_state: {//核销状态
        type: db.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
});
