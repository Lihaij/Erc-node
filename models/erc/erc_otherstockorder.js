/* 其他入库单 */
const db = require('../../util/db');

module.exports = db.defineModel('tbl_erc_otherstockorder', {
    otherstock_id: { //其他入库单单号，OS开头
        type: db.STRING(30),
        primaryKey: true
    },
    stockapply_id: {//申请单号
        type: db.ID,
        allowNull: false
    },
    domain_id: {//机构id
        type: db.IDNO,
        allowNull: true
    },
    otherstock_approver: { //审批人
        type: db.ID,
        allowNull: true
    }
});
