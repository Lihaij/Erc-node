/** 生产派工单*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_productdesignate', {
    productdesignate_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    productdesignate_code: {    //派工单单号
        type: db.STRING(100),
        allowNull: true
    },
    productdesignate_user_id: {    //生产员工
        type: db.STRING(50),
        allowNull: true
    },
    productdesignate_procedure_id:{        //生产工序
        type: db.ID,
        allowNull: true 
    },
    productdesignate_number: {  //指派数量
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    productdesignate_m_equipment: {//主设备
        type: db.ID,
        allowNull: true 
    },
    productdesignate_a_equipment: {//辅设备
        type: db.ID,
        allowNull: true 
    },
    productdesignate_date: {//日期
        type: db.DATE,
        allowNull: true
    },
    productdesignate_remark: {//备注
        type: db.STRING(255),
        allowNull: true
    },
    productdesignate_state: {//状态 0未确认 1已确认
        type: db.STRING(255),
        allowNull: true
    },
    productdesignate_examine_time: {//通过时间
        type: db.DATE,
        allowNull: true
    },
});
