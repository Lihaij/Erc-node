/**
 *  Created by Haij on 2019/10/24.
 */
const db = require('../../util/db');
/**项目合同信息**/
module.exports = db.defineModel('tbl_erc_project_contract', {
    project_contract_id: {//合同ID
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.BIGINT,
        allowNull: true
    },
    project_info_id: {//项目ID
        type: db.STRING(30),
        allowNull: false
    },
    contract_amount:{//合同金额
        type:db.STRING(50),
        allowNull:true
    },
    payment_method:{//收款方式
        type:db.STRING(50),
        allowNull:true
    },
    invoice_state:{//是否需要发票：1否（无发票） 2普通发票 3专用发票 
        type:db.STRING(4),
        defaultValue: '1',
        allowNull:true
    },
    contract_date:{//合同订立日期
        type:db.DATE,
        allowNull:true
    },
    contract_scan:{//合同扫描件
        type:db.STRING(200),
        allowNull:true
    },
    project_photo:{//项目照片
        type: db.STRING(200),
        allowNull: true
    },
});