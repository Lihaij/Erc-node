/**
 * Created by Cici on 2018/6/12.
 */

const db = require('../../util/db');
const GLBConfig = require('../../util/GLBConfig');

//资产盘点单详情
module.exports = db.defineModel('tbl_erc_longassettakestockdetail',{
    take_stock_detail_id:{ //ID
        type: db.IDNO,
        autoIncrement: true,
        primaryKey: true
    },
    take_stock_parent_no:{
        type: db.STRING(100),
        allowNull: true
    },
    domain_id:{
        type: db.ID,
        allowNull: true
    },
    user_id:{//创建人ID
        type: db.ID,
        allowNull:true
    },
    take_stock_people_id:{//盘点人ID
        type: db.ID,
        allowNull:true
    },
    take_stock_detail_status:{ //盘点状态 0.待提交 1.待盘点 2.未通过 3.已通过
        type: db.STRING(10),
        allowNull:true
    }
})
