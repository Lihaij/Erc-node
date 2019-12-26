/** 部门 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_department', {
    department_id: {
        type: db.ID,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: false
    },
    department_name: {//部门名称
        type: db.STRING(50),
        allowNull: true
    },
    p_department_id: {//上级部门id
        type: db.ID,
        allowNull: true
    },
    department_level: {//管理架构层级
        type: db.STRING(4),
        allowNull: true
    },
    department_plan_num: {//部门编制（部门规划人数）
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    department_state: {//部门启用或停用
        type: db.STRING(8),
        allowNull: true
    },
    department_type: {//类型
        type: db.STRING(10),
        allowNull: true
    },
    vacation_type: {
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    work_time: {//每天工作时间(废弃)
        type: db.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    mrp_begin_time: {//排产起始日期
        type: db.DATE,
        allowNull: true
    },
    rent_house_area: {//房屋面积 *100
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    rent_month: {//月租标准 *100
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    rent_file_id: {//房屋合同id
        type: db.IDNO,
        allowNull: true
    },
    rent_need_invoice:{//是否需要提供发票 0 不需要，1提供普通发票 2提供专用发票 NEED_INVOICE
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
    rent_other_main_id:{//房租其他相关主体id
        type: db.ID,
        allowNull: true
    },
    water_amount:{//用水量*100
        type: db.IDNO,
        allowNull: true
    },
    water_money: {//一吨水的单价 *100
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    water_pre_money: {//预估一个月水费*100
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    water_other_main_id: {//水费其他相关主体
        type: db.ID,
        allowNull: true
    },
    water_need_invoice:{//是否需要提供发票 0 不需要，1提供普通发票 2提供专用发票 NEED_INVOICE
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
    electric_amount:{//用电量
        type: db.IDNO,
        allowNull: true
    },
    electric_money: {//一度电的单价 *100
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    electric_pre_money: {//预估一个月电费*100
        type: db.IDNO,
        defaultValue: 0,
        allowNull: true
    },
    electric_other_main_id: {//电费其他相关主体
        type: db.ID,
        allowNull: true
    },
    electric_need_invoice:{//是否需要提供发票 0 不需要，1提供普通发票 2提供专用发票 NEED_INVOICE
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
});
