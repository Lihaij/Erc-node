/**
 * Created by Cici on 2018/6/12.
 */

const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

//资产盘点
module.exports = db.defineModel('tbl_erc_longassettakestock',{
    take_stock_id:{ //ID
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    take_stock_no:{ //资产盘点编号
        type: db.STRING(100),
        allowNull:true
    },
    domain_id:{
        type: db.ID,
        allowNull: true
    },
    user_id:{//发布人ID
        type: db.ID,
        allowNull:true
    },
    user_name:{//发布人名称
        type: db.STRING(100),
        allowNull:true
    },
    release_time: {//发布时间
        type: db.DATE,
        allowNull: true
    },
    take_stock_status:{ //资产盘点状态  0.待提交 1.待盘点 2.未通过 3.已通过
        type: db.STRING(10),
        allowNull:true
    },
    take_stock_confirm_id: {//指派人ID
        type: db.ID,
        allowNull: true
    },
    take_stock_confirm_time: {//审核时间
        type: db.DATE,
        allowNull: true
    }
})
