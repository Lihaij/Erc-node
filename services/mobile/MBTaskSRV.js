/**
 * Created by BaiBin on 2017/11/24.
 */
const common = require('../../util/CommonUtil');
const GLBConfig = require('../../util/GLBConfig');
const logger = require('../../util/Logger').createLogger('MBOrderSRV');
const model = require('../../model');
const Sequence = require('../../util/Sequence');
const sms = require('../../util/SMSUtil.js');

const sequelize = model.sequelize;
const taskSRV = require('../erc/baseconfig/ERCTaskListControlSRV');

exports.ERCTaskListControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        taskSRV.initAct(req, res);
    } else if (method === 'search') {
        taskSRV.searchAct(req, res);
    } else if (method === 'add') {
        taskSRV.addAct(req, res);
    } else if (method === 'complete') {//完成任务
        taskSRV.completeAct(req, res);
    }else if (method === 'confirm') {//确认已完成任务
        taskSRV.confirmAct(req, res);
    } else if (method === 'review') {//完成任务
        taskSRV.reviewAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};
