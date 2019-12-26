/**
 * Created by BaiBin on 2017/12/1.
 */
const common = require('../../util/CommonUtil');
const complaintSRV = require("../erc/customermanage/ERCComplaintControlSRV");
exports.ERCComplaintControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        complaintSRV.initAct(req, res);
    } else if (method === 'search') {
        complaintSRV.searchAct(req, res);
    } else if (method === 'add') {
        complaintSRV.addAct(req, res);
    } else if (method === 'handle_complaint') {//处理投诉
        complaintSRV.handleComplaintAct(req, res);
    } else if (method === 'initUserFeedback') {
        await complaintSRV.initUserFeedback(req, res);
    } else if (method === 'initMobileUser') {
        await complaintSRV.initMobileUser(req, res);
    } else if (method === 'createUserFeedback') {
        await complaintSRV.createUserFeedback(req, res);
    } else if (method === 'updateUserFeedback') {
        await complaintSRV.updateUserFeedback(req, res);
    } else if (method === 'getUserFeedback') {
        await complaintSRV.getUserFeedback(req, res);
    }  else {
        common.sendError(res, 'common_01')
    }
};
