const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCStopLineGatherControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');

const task = require('../baseconfig/ERCTaskListControlSRV');

const tb_orderrequire = model.erc_orderrequire
const tb_stoplinegather = model.erc_stoplinegather
const tb_stoplineimprove = model.erc_stoplineimprove
exports.ERCStopLineGatherControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'getStopLineGather') { //获取日计划影响因素
        getStopLineGather(req, res);
    } else if (method === 'addStopLineGather') {
        addStopLineGather(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};
async function initAct(req, res) {
    try {
        let returnData = {}

        returnData.productivetask = await getProductiveTask(req, res)
        returnData.orderrequire = await getOrderRequire(req, res)
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

async function addStopLineGather(req, res) {
    try {
        const doc = common.docTrim(req.body),
            user = req.user;
        let returnData = {},
            replacements = [],
            starDay = "",
            endDay = "",
            queryStr = ""

        //日计划影响因素统计表
        starDay = moment(doc.search_text).startOf('week').add(1, 'd').format('YYYY-MM-DD');
        endDay = moment(doc.search_text).endOf('week').add(1, 'd').format('YYYY-MM-DD');

        // queryStr = `delete from tbl_erc_stoplinegather where stoplinegather_date = ?`
        // replacements = [starDay]
        // let delete_result = await sequelize.query(queryStr, {
        //     replacements: replacements,
        //     type: sequelize.QueryTypes.DELETE
        // });

        // replacements = []
        queryStr = `select stopline_require, stopline_remark, count(stopline_require) as counts, sum(stopline_duration) as durations
          from tbl_erc_stopline where domain_id = ? and created_at>=? and created_at<=?`
        replacements.push(user.domain_id)
        replacements.push(starDay)
        replacements.push(endDay)
        queryStr += ` group by stopline_require, stopline_remark`;
        let stopline_result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        let GSCS = await Sequence.genStopLineImporveID(user.domain_id);
        let stoplineimprove = await tb_stoplineimprove.create({
            stoplineimprove_date: starDay,
            stoplineimprove_code: GSCS,
            domain_id: user.domain_id,
            stoplineimprove_begin_date: starDay,
            stoplineimprove_end_date: endDay,
            stoplineimprove_state: 0,
        })

        for (let sr of stopline_result) {
            let stoplinegather = await tb_stoplinegather.create({
                stoplinegather_date: starDay,
                stoplineimprove_id: stoplineimprove.stoplineimprove_id,
                domain_id: user.domain_id,
                stoplinegather_require: sr.stopline_require,
                stoplinegather_remark: sr.stopline_remark,
                stoplinegather_number: sr.counts,
                stoplinegather_duration: sr.durations,
                stoplinegather_state: 0
            })
        }

        common.sendData(res, stoplineimprove);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

async function getStopLineGather(req, res) {
    try {
        const doc = common.docTrim(req.body),
            user = req.user;
        let returnData = {},
            replacements = [],
            starDay = "",
            endDay = "",
            queryStr = ""

        queryStr = `select g.*,r.require_name from tbl_erc_stoplinegather g 
            left join tbl_erc_orderrequire r on (g.stoplinegather_require = r.require_id and r.state=1)
            where g.state=1 and g.domain_id=?`
        replacements.push(user.domain_id)
        if (doc.search_text) {
            queryStr += ` and g.stoplinegather_date=?`
            starDay = moment(doc.search_text).startOf('week').add(1, 'd').format('YYYY-MM-DD');
            replacements.push(starDay)
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}