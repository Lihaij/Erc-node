/**
 * Created by nie on 19/3/4.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**跟线申请单 **/
module.exports = db.defineModel('tbl_erc_ppmasterreceive', {
    ppmasterreceive_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    domain_id: {
        type: db.IDNO,
        allowNull: true
    },
    ppmaster_id: {          //生产计划
        type: db.IDNO,
        allowNull: true
    },
    ppmasterptdetail_id: {//生产计划的投料ID
        type: db.IDNO,
        allowNull: true
    },
    materiel_id: {
        type: db.IDNO,
        allowNull: false
    },
    ppmasterreceive_code: { //跟线通知单号
        type: db.STRING(50),
        allowNull: true
    },
    ppmasterreceive_lack_number: { //缺少数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    ppmasterreceive_number: { //跟线数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    ppmasterreceive_date: { //收料时间
        type: db.DATE,
        allowNull: true
    },
    ppmasterreceive_user_id: { //收料人
        type: db.STRING(50),
        allowNull: true
    },
    ppmasterreceive_phone: { //收料人电话
        type: db.STRING(50),
        allowNull: true
    },
    ppmasterreceive_state: { //状态  //0提交，1通过
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    }

});