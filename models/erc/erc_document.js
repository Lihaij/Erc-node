const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**文控管理 **/
module.exports = db.defineModel('tbl_erc_document', {
    document_id: {
        type: db.ID,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: false
    },
    user_id: {//录入人
        type: db.ID,
        allowNull: false
    },
    document_type: { //文件类型 1:内部文件 2：外部文件
        type: db.STRING(4),
        allowNull: false
    },
    document_title: {//文件题目
        type: db.STRING(100),
        allowNull: true
    },
    document_unit: {//发文单位
        type: db.STRING(100),
        allowNull: true
    },
    document_date: {//生效日期
        type: db.DATE,
        allowNull: true
    },
    document_state: {//审批状态 0.待提交 1.待审批 2.未通过 3.已通过
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    },
    document_checker_id: {//审批人user_id
        type: db.ID,
        allowNull: true
    },
    document_check_date: {//审批时间
        type: db.DATE,
        allowNull: true
    },
    document_refuse_remark: {//驳回说明
        type: db.STRING(300),
        allowNull: true
    }
});