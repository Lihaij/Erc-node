const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCStopLineImproveControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');

const task = require('../baseconfig/ERCTaskListControlSRV');

const tb_orderrequire = model.erc_orderrequire
const tb_stoplinegather = model.erc_stoplinegather
const tb_stoplineimprovedetail = model.erc_stoplineimprovedetail
const tb_stoplineimprove = model.erc_stoplineimprove
exports.ERCStopLineImproveControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'getStopLineImprove') { //获取日计划影响因素
        getStopLineImprove(req, res);
    } else if (method === 'getStopLineGatherByRanking') {
        getStopLineGatherByRanking(req, res)
    } else if (method === 'getStopLineImproveDetail') {
        getStopLineImproveDetail(req, res)
    } else if (method === 'addStopLineImproveDetail') {
        addStopLineImproveDetail(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};

async function initAct(req, res) {
    try {
        let returnData = {}
        returnData.stoplineimproveState = GLBConfig.STOPLINEIMPROVE_STATE
        returnData.stoplineimprovePutState = GLBConfig.STOPLINEIMPROVEDETAIL_PUT_STATE
        returnData.stoplineimproveSupeState = GLBConfig.STOPLINEIMPROVEDETAIL_SUPE_STATE
        returnData.stoplineGatherState = GLBConfig.STOPLINEGATHER_STATE
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

async function getStopLineImprove(req, res) {
    try {
        const doc = common.docTrim(req.body),
            user = req.user;
        let returnData = {},
            replacements = [],
            queryStr = ""

        queryStr = `select i.*,u.username from tbl_erc_stoplineimprove i 
        left join tbl_common_user u on (i.stoplineimprove_creator = u.user_id and u.state=1)
        where i.domain_id=?`
        replacements.push(user.domain_id)
        if (doc.search_date_begin) {
            queryStr += ` and i.stoplineimprove_begin_date>=?`
            replacements.push(search_date_begin)
        }
        if (doc.search_date_end) {
            queryStr += ` and i.stoplineimprove_end_date<=?`
            replacements.push(search_date_end)
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

async function getStopLineGatherByRanking(req, res) {
    try {
        const doc = common.docTrim(req.body),
            user = req.user;
        let returnData = {},
            replacements = [],
            queryStr = ""

        queryStr = `select g.*,r.require_name from tbl_erc_stoplinegather g
        left join tbl_erc_orderrequire r on (g.stoplinegather_require = r.require_id and r.state=1)
        where g.state=1 and g.stoplineimprove_id = ? order by g.stoplinegather_number`
        replacements.push(doc.stoplineimprove_id)
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

async function getStopLineImproveDetail(req, res) {
    try {
        const doc = common.docTrim(req.body),
            user = req.user;
        let returnData = {},
            replacements = [],
            queryStr = ""

        queryStr = `select sid.*,u1.username as putName,u2.username as supeName from tbl_erc_stoplineimprovedetail sid 
            left join tbl_common_user u1 on (sid.stoplineimprovedetail_put_person = u1.user_id and u1.state=1)
            left join tbl_common_user u2 on (sid.stoplineimprovedetail_supe_person = u2.user_id and u2.state=1)
            where sid.state=1 and sid.stoplinegather_id=?`
        replacements.push(doc.stoplinegather_id)
        if (doc.stoplineimprovedetail_id) {
            queryStr += ` and sid.stoplineimprovedetail_id=?`
            replacements.push(doc.stoplineimprovedetail_id)
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

async function addStopLineImproveDetail(req, res) {
    try {
        const doc = common.docTrim(req.body),
            user = req.user;

        let stoplineimprovedetail = await tb_stoplineimprovedetail.create({
            stoplineimprovedetail_remark: doc.stoplineimprovedetail_remark,
            stoplinegather_id: doc.stoplinegather_id,
            stoplineimprovedetail_put_person: doc.stoplineimprovedetail_put_person,
            stoplineimprovedetail_supe_person: doc.stoplineimprovedetail_supe_person,
            stoplineimprovedetail_put_state: 0,
            stoplineimprovedetail_supe_state: 0,
        })

        let taskName = '日计划影响因素,实施责任人改善措施';
        let taskDescription = '  日计划影响因素,实施责任人改善措施';
        let groupId = common.getUUIDByTime(30);
        let taskResult = await task.createTask(user, taskName, 96, doc.stoplineimprovedetail_put_person, stoplineimprovedetail.stoplineimprovedetail_id, taskDescription, '', groupId);
        if (!taskResult) {
            return common.sendError(res, 'task_01');
        }

        taskName = '日计划影响因素,监督人改善措施';
        taskDescription = '  日计划影响因素,监督人改善措施';
        groupId = common.getUUIDByTime(30);
        taskResult = await task.createTask(user, taskName, 97, doc.stoplineimprovedetail_supe_person, stoplineimprovedetail.stoplineimprovedetail_id, taskDescription, '', groupId);
        if (!taskResult) {
            return common.sendError(res, 'task_01');
        }
        common.sendData(res, stoplineimprovedetail);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}


async function checkState(stoplineimprovedetail_id) {
    try {

        let stoplineimprovedetailOne = await tb_stoplineimprovedetail.findOne({
            where: {
                state: 1,
                stoplineimprovedetail_id: stoplineimprovedetail_id
            }
        })
        let stoplineimprovedetailAll = await tb_stoplineimprovedetail.findAll({
            where: {
                state: 1,
                stoplinegather_id: stoplineimprovedetailOne.stoplinegather_id
            }
        })

        // 所有的改善措施均为已确认，则该评审项为已确认
        let completeState = 1
        for (let s of stoplineimprovedetailAll) {
            if (s.stoplineimprovedetail_put_state == 0 || s.stoplineimprovedetail_supe_state == 0) {
                completeState = 0
                break
            }
        }
 
        await tb_stoplinegather.update({
            stoplinegather_state: completeState
        }, {
            where: {
                stoplinegather_id: stoplineimprovedetailOne.stoplinegather_id
            }
        });
        

        //所有的评审项均为已确认，则该改善措施跟进为已确认
        let stoplinegatherOne = await tb_stoplinegather.findOne({
            where: {
                state: 1,
                stoplinegather_id: stoplineimprovedetailOne.stoplinegather_id
            }
        })
        let stoplinegatherAll = await tb_stoplinegather.findOne({
            where: {
                state: 1,
                stoplineimprove_id: stoplinegatherOne.stoplineimprove_id
            }
        })

        completeState = 1
        for (let s of stoplinegatherAll) {
            if (s.stoplinegather_state == 0) {
                completeState = 0
                break
            }
        }
        await tb_stoplineimprove.update({
            stoplineimprove_state: completeState
        }, {
            where: {
                stoplineimprove_id: stoplinegatherOne.stoplineimprove_id
            }
        });
    } catch (error) {
        throw error
    }
}
async function modifyPutState(req, stoplineimprovedetail_id) {
    try {
        await tb_stoplineimprovedetail.update({
            stoplineimprovedetail_put_state: 1
        }, {
            where: {
                stoplineimprovedetail_id: stoplineimprovedetail_id
            }
        });
        await checkState(stoplineimprovedetail_id)
    } catch (error) {
        throw error
    }
}
async function modifySupeState(req, stoplineimprovedetail_id) {
    try {
        await tb_stoplineimprovedetail.update({
            stoplineimprovedetail_supe_state: 1
        }, {
            where: {
                stoplineimprovedetail_id: stoplineimprovedetail_id
            }
        });
        await checkState(stoplineimprovedetail_id)
    } catch (error) {
        throw error
    }
}

exports.modifyPutState = modifyPutState
exports.modifySupeState = modifySupeState