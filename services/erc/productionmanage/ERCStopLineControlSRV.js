const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCStopLineControlResource');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');

const task = require('../baseconfig/ERCTaskListControlSRV');

const tb_productivetask = model.erc_productivetask
const tb_taskallot = model.erc_taskallot
const tb_taskallotuser = model.erc_taskallotuser
const tb_orderrequire = model.erc_orderrequire
const tb_stopline = model.erc_stopline
const tb_user = model.common_user

exports.ERCStopLineControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'getStopLine') {
        getStopLine(req, res)
    } else if (method === 'addStopLine') {
        addStopLine(req, res)
    } else if (method === 'getDepartment') {
        getDepartment(req, res)
    } else if (method === 'get_influence_factor') {//获取日计划影响因素
        getInfluenceFactorAct(req, res);
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
async function getProductiveTask(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = [],
            replacements = []

        let productivetask = await tb_productivetask.findAll({
            where: {
                state: 1,
                productivetask_state: {
                    '$ne': 3,
                },
                domain_id: user.domain_id
            }
        })

        for (let p of productivetask) {
            returnData.push({
                id: p.productivetask_id,
                value: p.productivetask_id,
                text: p.productivetask_code
            })
        }
        return returnData
    } catch (error) {
        throw error
    }
}

async function getOrderRequire(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = [],
            replacements = []

        let orderrequire = await tb_orderrequire.findAll({
            where: {
                state: 1,
                type_id: 4,
                domain_id: user.domain_id
            }
        })

        for (let o of orderrequire) {
            returnData.push({
                id: o.require_id,
                value: o.require_id,
                text: o.require_name
            })
        }
        return returnData
    } catch (error) {
        throw error
    }
}

async function getDepartment(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = []

        let nowUser = await tb_user.findOne({
            where: {
                state: 1,
                user_id: doc.user_id
            }
        })
        let queryStr = `select d.department_id,d.department_name 
                from tbl_erc_position p,tbl_erc_department d 
                where  p.department_id=d.department_id and p.usergroup_id=? and p.state=1 and p.domain_id=?`
        replacements.push(nowUser.usergroup_id)
        replacements.push(nowUser.domain_id)
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }


}
async function getStopLine(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {},
            replacements = []

        let queryStr = `select s.*,d.department_name,pt.productivetask_code,
            u1.name as recipientName,u2.name as siteName,oq.require_name
            from tbl_erc_stopline s
            left join tbl_erc_department d on (s.stopline_department_id = d.department_id and d.state=1)
            left join tbl_common_user u1 on (u1.user_id=s.stopline_recipient and u1.state=1)
            left join tbl_common_user u2 on (u2.user_id=s.stopline_site and u2.state=1)
            left join tbl_erc_orderrequire oq on (oq.require_id=s.stopline_require and oq.state=1)
            left join tbl_erc_productivetask pt on (pt.productivetask_id = s.productivetask_id and pt.state=1)
            where s.state=1 and s.domain_id=?`
        replacements = [user.domain_id]
        if (doc.stopline_id) {
            queryStr += ` and s.stopline_id = ?`
            replacements.push(doc.stopline_id)
        }
        if (doc.search_text) {
            queryStr += ` and (s.stopline_code like ? or p.productivetask_code like ?)`
            replacements.push(doc.search_text)
            replacements.push(doc.search_text)
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];

        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            // result.stopline_duration = (r.stopline_duration) ? moment(r.stopline_duration).format('YYYY-MM-DD HH:MM') : '';
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function addStopLine(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user

        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where: {
                state: GLBConfig.ENABLE,
                taskallot_name: '异常停线任务'
            }
        });
        let taskallotuser = await tb_taskallotuser.findOne({
            where: {
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id,
                taskallot_id: taskallot.taskallot_id
            }
        });
        if (!taskallotuser) {
            return common.sendError(res, 'amortize_32');
        } else {
            let SLID = await Sequence.genStopLineID(user.domain_id);
            let stopline = await tb_stopline.create({
                stopline_code: SLID,
                domain_id: user.domain_id,
                productivetask_id: doc.productivetask_id,
                stopline_duration: doc.stopline_duration,
                stopline_department_id: doc.stopline_department_id,
                stopline_recipient: doc.stopline_recipient,
                stopline_site: doc.stopline_site,
                stopline_require: doc.stopline_require,
                stopline_remark: doc.stopline_remark,
                stopline_state: 0
            })

            let taskName = '异常停线通知';
            let taskDescription = '  异常停线通知';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user, taskName, 91, taskallotuser.user_id, stopline.stopline_id, taskDescription, '', groupId);
            if (!taskResult) {
                return common.sendError(res, 'task_01');
            } else {
                common.sendData(res, stopline);
            }
        }
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

async function modifyState(req, stopline_id) {
    try {
        let stopline = await tb_stopline.findOne({
            where: {
                state: 1,
                stopline_id: stopline_id
            }
        })
        stopline.stopline_state = '1';
        await stopline.save();
    } catch (error) {
        throw error
    }
}
exports.modifyState = modifyState
