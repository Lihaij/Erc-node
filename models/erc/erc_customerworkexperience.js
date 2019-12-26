/* 用户工作经历表 */
const CryptoJS = require('crypto-js');
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

module.exports = db.defineModel('tbl_erc_customerworkexperience', {
    work_experience_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: db.ID,
        allowNull: false
    },
    experience_start_date:{//开始日期
        type: db.DATE,
        allowNull: true
    },
    experience_end_date:{//结束日期
        type: db.DATE,
        allowNull: true
    },
    position_name: {//岗位
        type: db.STRING(50),
        allowNull: false
    },
    witness: {//证明人
        type: db.STRING(20),
        defaultValue: '',
        allowNull: true
    },
    witness_phone: {//证明人手机
        type: db.STRING(20),
        defaultValue: '',
        allowNull: true
    },
    experience_remark: {//工作经历描述
        type: db.STRING(500),
        defaultValue: '',
        allowNull: true
    }

});
