/**
 * Created by BaiBin on 2018/2/7.
 */
/** 工程项目 **/
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_projectdetail', {
    project_detail_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    project_id: {//项目id
        type: db.ID,
        primaryKey: false
    },
    estate_id: {//楼盘id
        type: db.BIGINT(30),
        allowNull: true
    },
    roomtype_id: {//户型id
        type: db.BIGINT(30),
        allowNull: true
    },
    roomtype_name: {//户型名称
        type: db.STRING(50),
        allowNull: true
    },
    space_id: {//空间id
        type: db.BIGINT(30),
        allowNull: true
    },
    space_name: {//空间名称
        type: db.STRING(50),
        allowNull: true
    },
    space_budget_amount: {//空间预算金额
        type: db.BIGINT(30),
        allowNull: true
    },
    space_final_amount: {//空间决算金额
        type: db.BIGINT(30),
        allowNull: true
    },
    space_count: {//空间预算数量
        type: db.BIGINT(20),
        allowNull: true
    },
    space_total_amount: {//预算总金额
        type: db.BIGINT(30),
        allowNull: true
    },
    space_final_total_amount: {//决算总金额
        type: db.BIGINT(30),
        allowNull: true
    },
    space_state: {//状态  0新记录，1已提交，2通过，3拒绝
        type: db.INTEGER,
        allowNull: true
    },
    space_examine: {//审批人
        type: db.STRING(100),
        allowNull: true
    },
    space_examine_time: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    space_refuse_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    }

});