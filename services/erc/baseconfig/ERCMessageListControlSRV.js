const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCMessageListControlSRV');
const model = require('../../../model');
const moment = require('moment');

const sequelize = model.sequelize;
//系统管理->消息管理
exports.ERCMessageListControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method==='search_r'){
        searchReceiveAct(req,res)
    } else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    let doc = common.docTrim(req.body);
    let returnData = {};
    let user = req.user;

    try{
        returnData.roleList=GLBConfig.ORDERSTATEINFO;
        returnData.noticeInfo=GLBConfig.NOTICESTATE;
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }

}
//获得消息管理列表
async function searchReceiveAct(req, res) {
    try {
        let doc = common.docTrim(req.body), returnData = {}, user = req.user;
        let replacements =[user.user_id];
        //通知
        let queryStr = 'select t.*,st.username from tbl_erc_message_user t ' +
            'inner join tbl_common_user st on t.user_id = st.user_id ' +
            'where t.state=1 and t.user_id=? and t.message_user_type not in (9) ';

        queryStr += ' order by t.created_at desc';
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.message_start_date = r.message_start_date ? moment(r.message_start_date).format("YYYY-MM-DD") : null;
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