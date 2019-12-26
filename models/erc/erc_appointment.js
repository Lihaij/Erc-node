const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**客户预约**/
module.exports = db.defineModel('tbl_erc_appointment', {
    appoint_id: {
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
        defaultValue: '',
        allowNull: false
    },
    user_id: {
        type: db.ID,
        defaultValue: '',
        allowNull: false
    },
    ap_type: { // OTYPEINFO
        type: db.STRING(4),
        defaultValue: '',
        allowNull: false
    },
    ap_name: {
        type: db.STRING(100),
        defaultValue: '',
        allowNull: false
    },
    ap_phone: {
        type: db.STRING(20),
        defaultValue: '',
        allowNull: false
    },
    ap_address: {
        type: db.STRING(200),
        defaultValue: '',
        allowNull: true
    },
    roomtype_id: {//户型
        type: db.IDNO,
        allowNull: true
    },
    ap_house_area: {
        type: db.DOUBLE,
        defaultValue: 0,
        allowNull: true
    },
    ap_operator: {
        type: db.ID,
        allowNull: true
    },
    ap_state: {
        type: db.STRING(4),
        allowNull: true
    },
    ap_remarks: {
        type: db.STRING(500),
        defaultValue: '',
        allowNull: false
    },
    ap_estate_room_id: {
        type: db.IDNO,
        allowNull: true
    },
    ap_recommender_phone: { //推荐人手机
        type: db.STRING(20),
        defaultValue: '',
        allowNull: true
    },
    ap_house_type: {
        type: db.STRING(4),
        defaultValue: '',
        allowNull: false
    }
});
