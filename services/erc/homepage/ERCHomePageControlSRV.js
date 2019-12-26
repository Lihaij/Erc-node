const fs = require('fs');
const moment = require('moment');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCHomePageControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');

const sequelize = model.sequelize
const tb_message_user = model.erc_message_user;
const tb_order = model.erc_order;
const tb_user = model.common_user;
const tb_task = model.erc_task;


exports.ERCHomePageControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'getTotalCustomer') {//总客户数
        getTotalCustomer(req, res)
    } else if (method === 'getIncreasedCustomer') {//本月新增客户数
        getIncreasedCustomer(req, res)
    } else if (method === 'getActiveOrder') {//活跃订单
        getActiveOrder(req, res)
    } else if (method === 'getSalesAmount') {//本月营业额
        getSalesAmount(req, res)
    } else if (method === 'getLatestOrder') {//最近5条订单
        getLatestOrder(req, res)
    } else if (method==='getNoitceOrder'){
        getNoitceOrderActOrigin(req,res)
    } else if (method==='getNoitceOrderMB') {
        getNoitceOrderAct(req,res);
    }else if (method==='search_t'){
        searchTaskAct(req,res)
    } else if (method==='set_read'){
        setReadAct(req,res)
    } else if (method==='delete_message'){
        deleteAct(req,res)
    } else if (method === 'check_password'){
        checkPasswordAct(req,res);
    } else {
        common.sendError(res, 'common_01')
    }
}

//首页初始化数据
async function initAct(req, res) {
    try {
        let returnData = {
            taskTypeInfo: GLBConfig.TASKTYPE,//任务类型
            stateInfo:GLBConfig.STOCKORDERSTATE,
            noticeInfo:GLBConfig.NOTICESTATE
        }
        let replacements0 = [];
        let replacements = [];
        let user = req.user;

        let groupSql = 'select group_concat(pt.usergroup_id) usergroup from tbl_common_usergroup pt ' +
            'where pt.domain_id=? and pt.parent_id!=0 and pt.usergroup_type=01';
        replacements0.push(user.domain_id);
        let groupStrResult = await sequelize.query(groupSql, {
            replacements: replacements0,
            type: sequelize.QueryTypes.SELECT,
            state: GLBConfig.ENABLE
        });
        let groupStr=null;
        if(groupStrResult && groupStrResult.length>0){
            groupStr=groupStrResult[0].usergroup;
        }

        let queryStr = 'select 0 as id,dt.domain_name as text,0 parent_id from tbl_common_domain dt where dt.domain_id=? UNION ALL ' +
            'select t.usergroup_id as id,t.usergroup_name as text,t.parent_id from tbl_common_usergroup t ' +
            'where t.domain_id=? and t.parent_id!=0 and t.usergroup_type=01';
        replacements.push(user.domain_id);
        replacements.push(user.domain_id);
        if (groupStr){
            queryStr += ' and not FIND_IN_SET (t.parent_id,?)';
            replacements.push(groupStr)
        }
        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT,
            state: GLBConfig.ENABLE
        });
        returnData.roleList=queryRst;
        common.sendData(res, returnData)
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//获得总客户数
async function getTotalCustomer(req, res) {
    try {
        let doc = common.docTrim(req.body), returnData = {};
        let queryStr = 'select u.*,c.* from tbl_common_user u, tbl_erc_customer c, tbl_common_domain d where u.user_id = c.user_id and' +
            ' u.domain_id = d.domain_id and u.domain_id = ?';

        let customers = await sequelize.query(queryStr, {
            replacements: [doc.domain_id],
            type: sequelize.QueryTypes.SELECT
        });
        returnData.totalCustomer = customers.length;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//查询本月新增客户数
async function getIncreasedCustomer(req, res) {
    try {
        let doc = common.docTrim(req.body), returnData = {};
        let queryStr = "select u.*,c.* from tbl_common_user u, tbl_erc_customer c, tbl_common_domain d where u.user_id = c.user_id and" +
            " u.domain_id = d.domain_id and date_format(c.created_at,'%Y-%m')=date_format(now(),'%Y-%m') and u.domain_id = ?";

        let customers = await sequelize.query(queryStr, {
            replacements: [doc.domain_id],
            type: sequelize.QueryTypes.SELECT
        })
        returnData.increasedCustomer = customers.length;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//查询活跃订单
async function getActiveOrder(req, res) {
    try {
        let doc = common.docTrim(req.body), returnData = {};
        let queryStr = "select * from tbl_erc_order where order_state not in ('CANCELLED','FINISHI') and domain_id = ?";

        let orders = await sequelize.query(queryStr, {
            replacements: [doc.domain_id],
            type: sequelize.QueryTypes.SELECT
        })
        returnData.orderCount = orders.length;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//查询最近5条订单
async function getLatestOrder(req, res) {
    try {
        let doc = common.docTrim(req.body), returnData = {}, user = req.user;

        let queryStr = `select t.*,u.username from tbl_erc_task t 
        left join tbl_common_user u on (t.task_publisher = u.user_id and t.state = 1) 
        where t.task_state= '1' and t.task_performer = ? `

        queryStr += ' order by t.task_priority asc,t.created_at desc'
        let orders = await sequelize.query(queryStr, {
            replacements: [user.user_id],
            type: sequelize.QueryTypes.SELECT
        })
        returnData.latestOrder = [];
        for(let t of orders){
            let result = JSON.parse(JSON.stringify(t));
            result.task_create_date = t.created_at.Format("yyyy-MM-dd");
            returnData.latestOrder.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//本月营业额
async function getSalesAmount(req, res) {
    try {
        let doc = common.docTrim(req.body), returnData = {};
        let queryStr = "select sum(final_offer) as total_offer from tbl_erc_order where " +
            "date_format(created_at,'%Y-%m')=date_format(now(),'%Y-%m') and order_state in " +
            "('SIGNED','WORKING','FINISHI','CANCELLED') and domain_id = ?";

        let amount = await sequelize.query(queryStr, {
            replacements: [doc.domain_id],
            type: sequelize.QueryTypes.SELECT
        })
        returnData.salesAmount = amount[0].total_offer;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function getNoitceOrderActOrigin(req, res) {
    try {
        let doc = common.docTrim(req.body), returnData = {}, user = req.user;

        let queryStr =
            `select
                t.*,st.username,ut.read_state
                from tbl_erc_notice_user ut
                inner join tbl_erc_notice t
                on ut.notice_id = t.notice_id
                inner join tbl_common_user st
                on ut.user_id = st.user_id
                where true
                and t.state=1
                and t.notice_state = 3
                and t.domain_id = ?`;

        const replacements = [user.domain_id];

        // queryStr += ' and t.user_id = ?';
        // replacements.push(user.user_id);

        queryStr += ' order by t.created_at desc';
        let orders = await sequelize.query(queryStr, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        })
        returnData.noitceOrder = [];
        for(let t of orders){
            let result = JSON.parse(JSON.stringify(t));
            result.create_date = t.created_at.Format("yyyy-MM-dd");
            returnData.noitceOrder.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//获得通知消息
async function getNoitceOrderAct(req, res) {
    try {
        let doc = common.docTrim(req.body), returnData = {}, user = req.user;
        let replacements =[user.user_id];
        //通知
        let queryStr = 'select t.*,st.username, u.name as customer_name from tbl_erc_message_user t ' +
            'inner join tbl_common_user st on t.user_id = st.user_id ' +
            'left join tbl_erc_order o on o.order_id = t.message_id and t.message_user_type IN (2,8) ' +
            'left join tbl_common_user u on u.user_id = o.user_id and t.message_user_type IN (2,8) ' +
            'where t.state=1 and t.user_id=? and t.message_user_type not in (9) ';

        queryStr += ' order by t.created_at desc';
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.message_start_date = r.message_start_date ? moment(r.message_start_date).format("YYYY-MM-DD") : null;
            result.mobile_title = r.message_user_title;
            result.mobile_state = r.message_user_state;
            if (r.message_user_type == 1) {
                result.message_user_title = '公告名称：' + r.message_user_title;
            } else if (r.message_user_type == 2) {
                result.message_user_title = '订单单号：' + r.message_user_title;
            } else if (r.message_user_type == 8) {
                result.message_user_title = '订单单号：' + r.message_user_title;
            }
            if (r.message_user_state == '0'){
                result.message_user_state = '未读'
            } else if (r.message_user_state == '1') {
                result.message_user_state = '已读'
            } else if (r.message_user_state == 'DESIGNING'){
                result.message_user_state = '设计中'
            } else if (r.message_user_state == 'CHECKING') {
                result.message_user_state = '审核中'
            } else if (r.message_user_state == 'SIGNED') {
                result.message_user_state = '签约中'
            } else if (r.message_user_state == 'REVIEWING') {
                result.message_user_state = '评审中'
            } else if (r.message_user_state == 'WORKING') {
                result.message_user_state = '施工中'
            } else if (r.message_user_state == 'FINISHI') {
                result.message_user_state = '已完成'
            } else if (r.message_user_state == 'CANCELLED') {
                result.message_user_state = '取消'
            } else if (r.message_user_state == 'PAYED') {
                result.message_user_state = '已付款'
            } else if (r.message_user_state == 'SHIPPED') {
                result.message_user_state = '发货中'
            } else {
                result.message_user_state = '无'
            }
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//获得任务列表
let searchTaskAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};
        let queryStr = `select * from tbl_erc_task where state = 1 `;

        let replacements = [];
        if (doc.domain_id) {
            queryStr += ` and domain_id = ? `;
            replacements.push(doc.domain_id);
        }
        if (doc.task_state) {
            queryStr += ` and find_in_set(task_state , ?) `;
            replacements.push(doc.task_state);
        }
        if (doc.current_type == 1) { //收到的任务
            queryStr += ` and task_performer = ? `;
            replacements.push(user.user_id);
        }
        if (doc.current_type == 2) { //自己发布的任务
            queryStr += ` and task_publisher = ? `;
            replacements.push(user.user_id);
        }

        queryStr += ' order by created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

//设置消息已读
let setReadAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), user = req.user;
        let message = await tb_message_user.findOne({
            where: {
                message_user_id: doc.message_user_id
            }
        })
        if (message) {
            message.read = '1'
            await message.save();
        }
        common.sendData(res, message);
    } catch (error) {
        common.sendFault(res, error);
    }
};

//删除消息
let deleteAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), user = req.user;
        await tb_message_user.update(
            { state: 0 }, /* set attributes' value */
            {
                where: {
                    message_user_id: {
                        $in:doc.message_user_ids
                    }
                }
            }
        );
        common.sendData(res, {});
    } catch (error) {
        common.sendFault(res, error);
    }
};

//验证密码是否为初始密码
let checkPasswordAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);

        const user = await tb_user.findOne({
           where: {
               user_id: doc.user_id
           }
        });

        const originPwd = 'e10adc3949ba59abbe56e057f20f883e';//初始密码为123456，加密之后
        common.sendData(res, {
            isEqual: originPwd === user.password
        });
    } catch (error) {
        common.sendFault(res, error);
    }
};