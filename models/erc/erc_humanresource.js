/** 通知公告表*/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_humanresource', {
    hr_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    // post_title: {//岗位名称
    //     type: db.STRING(100),
    //     allowNull: true
    // },
    department_id: {//部门
        type: db.ID,
        allowNull: true
    },
    position_id: {//岗位
        type: db.ID,
        allowNull: true
    },
    // post_usergroup_id: {//岗位所在部门
    //     type: db.IDNO,
    //     allowNull: true
    // },
    user_id: { //发布人ID
        type: db.ID,
        defaultValue: '',
        allowNull: true
    },
    domain_id: {//发布人所在组织
        type: db.IDNO,
        allowNull: true
    },
    hr_state: {//状态 0.待提交 1.待招录 2.已招录
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
    hr_checker_id: {//招录人user_id
        type: db.ID,
        allowNull: true
    },
    hr_check_date: {//招录时间
        type: db.DATE,
        allowNull: true
    },
    hr_remark: {//备注
        type: db.STRING(300),
        allowNull: true
    }
});
