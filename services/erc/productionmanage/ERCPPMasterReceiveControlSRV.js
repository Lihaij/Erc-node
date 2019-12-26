const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCPPMasterReceiveControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');

const task = require('../baseconfig/ERCTaskListControlSRV');

const tb_productivetaskdetail = model.erc_productivetaskdetail
const tb_productivetask = model.erc_productivetask
const tb_taskallot = model.erc_taskallot
const tb_taskallotuser = model.erc_taskallotuser
// 生产日计划接口
exports.ERCPPMasterReceiveControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'getPPMasterReceive') {
        getPPMasterReceive(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};
async function initAct(req, res) {
    try {
        let returnData = {}

        returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'); //单位
        returnData.ppmasterReceiveState = GLBConfig.PPMASTERRECEIVE_STATE
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

async function getPPMasterReceive(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {},
            replacements = []

            let queryStr = `select pp_r.ppmasterreceive_id,pp_r.ppmasterreceive_code, pt.biz_code, pt.order_id,
            m2.materiel_code as pt_materiel_code,m2.materiel_name as pt_materiel_name,
            m1.materiel_code as pp_r_materiel_code,m1.materiel_name as pp_r_materiel_name,m1.materiel_format as pp_r_materiel_format,m1.materiel_unit as pp_r_materiel_unit,
            pp_r.ppmasterreceive_state,pp_r.ppmasterreceive_lack_number,pp_r.ppmasterreceive_number
            from tbl_erc_ppmasterreceive pp_r 
            left join tbl_erc_ppmasterptdetail pp_ptdetail on (pp_r.ppmasterptdetail_id = pp_ptdetail.ppmasterptdetail_id and pp_ptdetail.state=1)
            left join tbl_erc_productivetask pt on (pt.productivetask_id = pp_ptdetail.productivetask_id and pt.state=1)
            left join tbl_erc_materiel m1 on (pp_r.materiel_id = m1.materiel_id and m1.state=1) 
            left join tbl_erc_materiel m2 on (pt.materiel_id = m2.materiel_id and m2.state=1) 
            where pp_r.domain_id=? and pp_r.state=1`
        replacements = [user.domain_id]

        let result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
