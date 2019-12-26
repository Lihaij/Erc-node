/**
 * Created by Szane on 17/6/30.
 */
/** 业主反馈**/

const db = require('../../util/db');
module.exports = db.defineModel('tbl_erc_ownerfeedback', {
    feedback_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    order_id: {
        type: db.ID,
        allowNull: true
    },
    user_id: {
        type: db.ID,
        defaultValue: '',
        allowNull: false
    },
    type: {
        type: db.IDNO,
        defaultValue: 0,
        allowNull: false
    },
    status: {
        type: db.IDNO,
        defaultValue: 1,
        allowNull: false
    },
    content: {
        type: db.STRING(1000),
        allowNull: false
    },
    repair_type: {
        type: db.ID,
        allowNull: true
    },
    email: {
        type: db.STRING(30),
        allowNull: true
    },
    qq_no: {
        type: db.STRING(30),
        allowNull: true
    },
    images: {
        type: db.STRING(300),
        allowNull: true
    },
    operator_id: {
        type: db.ID,
        allowNull: true
    },
    record_content: {
        type: db.STRING(300),
        allowNull: true
    },
    resp_person: {
        type: db.STRING(30),
        allowNull: true
    },
    resp_phone: {
        type: db.STRING(30),
        allowNull: true
    }
});
