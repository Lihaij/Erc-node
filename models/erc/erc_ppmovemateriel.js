/**
 * Created by nie on 19/3/4.
 */
const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');
/**挪料任务 **/
module.exports = db.defineModel('tbl_erc_ppmovemateriel', {
    ppmovemateriel_id: {
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    ppmovemateriel_code: { //跟线通知单号
        type: db.STRING(50),
        allowNull: true
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
    order_id: {//销售单号
        type: db.ID,
        allowNull: false
    },
    materiel_id: {
        type: db.IDNO,
        allowNull: false
    },
    moved_number: { //挪料数量
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    },
    ppmovemateriel_date: { //收料时间
        type: db.DATE,
        allowNull: true
    },
    ppmovemateriel_user_id: { //收料人
        type: db.STRING(50),
        allowNull: true
    },
    ppmovemateriel_phone: { //收料人电话
        type: db.STRING(50),
        allowNull: true
    },
    ppmovemateriel_state: { //状态  //0提交，1通过
        type: db.INTEGER,
        defaultValue: 0,
        allowNull: true
    }

});