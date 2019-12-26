/** 岗位 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_position', {
    position_id: {
        type: db.ID,
        primaryKey: true
    },
    usergroup_id: {//对应角色
        type: db.IDNO,
        allowNull: false
    },
    domain_id: {
        type: db.IDNO,
        allowNull: false
    },
    department_id: {//所属部门
        type: db.ID,
        allowNull: false
    },
    position_name: {//岗位名称
        type: db.STRING(50),
        allowNull: true
    },
    p_position_id: {//上级岗位id
        type: db.ID,
        allowNull: true
    },
    department_plan_num: {//岗位编制（岗位规划人数）
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    base_salary: { //基础工资*100
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    capacity_salary:{//能力工资*base_salary
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    performance_salary:{//绩效工资*100
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    actual_salary:{//实际工资*100
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    department_actual_num: {//实有人数
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    position_require:{//岗位能力要求
        type: db.STRING(50),
        allowNull: true
    },
    salary_type: {//计薪方式
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    }
});
