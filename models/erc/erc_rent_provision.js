/**
 * Created by BaiBin on 2019/7/8.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
//房租计提
module.exports = db.defineModel('tbl_erc_rent_provision', {
    rent_provision_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    department_id: {//申请部门
        type: db.ID,
        allowNull: true
    },
    house_area: {//房屋面积 *100
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    file_id: {//房屋合同id
        type: db.IDNO,
        allowNull: true
    },
    need_invoice:{//是否需要发票 1需要 0不需要
        type: db.STRING(4),
        defaultValue: '0',
        allowNull: true
    }
});
