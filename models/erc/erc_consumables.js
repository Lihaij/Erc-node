/**
 * Created by Cici on 2018/5/29.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

//低值易耗品
module.exports = db.defineModel('tbl_erc_consumables',{
    consumables_id:{ //ID
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    consumables_code:{ //code
        type: db.STRING(100),
        allowNull:true
    },
    domain_id:{
        type: db.STRING(100),
        allowNull: true
    },
    consumables_creator_id:{//申请人ID
        type: db.STRING(100),
        allowNull:true
    },
    consumables_creator_name: {//申请人名称
        type: db.STRING(100),
        allowNull: true
    },
    consumables_confirm_time: {//审核日期
        type: db.DATE,
        allowNull: true
    },
    consumables_confirm_id: {//审核人ID
        type: db.STRING(100),
        allowNull: true
    },
    consumables_rejected_description: {//审核驳回信息
        type: db.STRING(100),
        allowNull: true
    },
    consumables_status:{ //审核状态
        type: db.STRING(10),
        allowNull:true
    },
    consumables_department_id: {//申请部门
        type: db.STRING(100),
        allowNull: true
    },
    consumables_type_id:{ //低值易耗品类型 1资产申购单 2验收单 3资产验收(申购审批成功的提交验收)
        type: db.STRING(10),
        allowNull: true
    }
})
