/**
 * Created by BaiBin on 2019/5/21.
 */

const common = require('../../../util/CommonUtil');
const ERCEmployeeInformationControlSRV = require('../baseconfig/ERCEmployeeInformationControlSRV');

exports.ERCEmployeeQuitControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        ERCEmployeeInformationControlSRV.initAct(req, res);
    } else if (method === 'get_subordinate_employee') {
        ERCEmployeeInformationControlSRV.getSubordinateEmployeeAct(req,res);
    } else if (method === 'leave_office') {
        ERCEmployeeInformationControlSRV.leaveOfficeAct(req,res);
    } else {
        common.sendError(res, 'common_01')
    }
}