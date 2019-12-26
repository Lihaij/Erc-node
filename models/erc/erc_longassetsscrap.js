/** 资产报废 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_longassetsscrap', {
    longassetsscrap_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    longassetsscrap_no: {//报废编号
        type: db.ID,
        allowNull: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    user_id: {//申请人
        type: db.ID,
        allowNull: true
    },
    scrap_type:{//申请报废类型 1.固定资产 2.待摊资产 3.低值易耗品
        type: db.STRING(4),
        allowNull: false
    },
    scrap_state: {//审批状态 0.待提交 1.待审批 2.未通过 3.已通过
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
    scrap_checker_id: {//审批人user_id
        type: db.ID,
        allowNull: true
    },
    scrap_check_date: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    scrap_refuse_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    }
});