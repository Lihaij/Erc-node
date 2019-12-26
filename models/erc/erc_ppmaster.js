/**
 * Created by nie on 19/3/4.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**生产主计划 **/
module.exports = db.defineModel('tbl_erc_ppmaster', {
    ppmaster_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    ppmaster_date: {                    //日期
        type: db.STRING(30),
        allowNull: true
    },
    ppmaster_department_id: {           //车间
        type: db.STRING(30),
        allowNull: true
    },
    ppmaster_procedure_id: {            //工序
        type: db.IDNO,
        allowNull: true
    },
    ppmaster_procedure_level: {            //所在工序的级别
        type: db.STRING(5),
        allowNull: true
    },
    ppmaster_m_equipment_capacity: {    //主设备每小时产能
        type: db.INTEGER,
        allowNull: true
    },
    ppmaster_a_equipment_capacity: {    //辅设备每小时产能
        type: db.INTEGER,
        allowNull: true
    },
    ppmaster_work_duration: {           //作业小时数
        type: db.INTEGER,
        allowNull: true
    },
    ppmaster_theory_capacity_day: {     //理论日产能
        type: db.INTEGER,
        allowNull: true
    },
    ppmaster_holiday_capacity: {     //节假日影响的产能 负数
        type: db.INTEGER,
        allowNull: true
    },
    ppmaster_repairs_capacity: {     //报修影响的产能 负数
        type: db.INTEGER,
        allowNull: true
    },
    ppmaster_reality_capacity: {     //实际产能
        type: db.INTEGER,
        allowNull: true
    },
    productivetask_code: {          //生产任务单号
        type: db.STRING(30),
        allowNull: true
    },
    ppmaster_produce_number: {      //排产数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    ppmaster_residue_number: {      //剩余排产数量  ，最后应为0
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    ppmaster_check_materiel_state: {      //日计划物料状态   0待清查、1物料不齐全、2物料齐全
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    ppmaster_check_device_state: {      //日计划设备状态   0待清查、1设备不齐全、2设备齐全
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    ppmaster_check_person_state: {      //日计划人员状态   0待清查、1人员不齐全、2人员齐全
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    ppmaster_user_id: { //分配的员工
        type: db.STRING(50),
        allowNull: true
    },
    ppmaster_order_id: { //该排产计划所属销售订单号
        type: db.STRING(50),
        allowNull: true
    },
    ppmaster_materiel_id: { //该排产计划所属销售订单号
        type: db.STRING(50),
        allowNull: true
    }
});