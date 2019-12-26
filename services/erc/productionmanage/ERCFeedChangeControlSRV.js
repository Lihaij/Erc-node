const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCFeedChangeControlResource');
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
const tb_feedchangelog = model.erc_feedchangelog
// 生产日计划接口
exports.ERCFeedChangeControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'getProductiveTask') {
        getProductiveTask(req, res)
    } else if (method === 'getProductiveTaskDetail') {
        getProductiveTaskDetail(req, res)
    } else if (method === 'saveChange') {
        saveChange(req, res)
    } else if (method === 'sendTask') {
        sendTask(req, res)
    } else if (method === 'getMaterielTemp') {
        getMaterielTemp(req, res)
    } else if (method === 'addProductiveTaskDetailFromMateriel') {
        addProductiveTaskDetailFromMateriel(req, res)
    } else if (method === 'getFeedChangeLog') {
        getFeedChangeLog(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};
async function initAct(req, res) {
    try {
        let returnData = {}

        returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'); //单位
        returnData.feedChangeType = GLBConfig.FEED_CHANGE_TYPE
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
            returnData = {},
            replacements = []

        let queryStr = `select t.productivetask_id,pp.productivetask_code,t.taskdesign_number,
            m.materiel_format,m.materiel_unit,m.materiel_code,m.materiel_name,t.change_state,
            min(ppmaster_date) as minDate 
            from tbl_erc_ppmaster pp 
            left join tbl_erc_productivetask t on (t.productivetask_code=pp.productivetask_code and pp.state=1)
            left join tbl_erc_materiel m on (t.materiel_id=m.materiel_id and m.state=1) 
            where pp.domain_id=? and pp.state=1  and ppmaster_date>now()`
        replacements = [user.domain_id]
        if (doc.productivetask_id) {
            queryStr += ` and t.productivetask_id = ?`
            replacements.push(doc.productivetask_id)
        }
        if (doc.search_text) {
            queryStr += ` and t.productivetask_code = ?`;
            replacements.push(doc.search_text)
        }
        queryStr += ` group by t.productivetask_id,pp.productivetask_code,t.taskdesign_number,m.materiel_format,m.materiel_unit,m.materiel_code,m.materiel_name,t.change_state 
             order by min(ppmaster_date)`
        let result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
async function getProductiveTaskDetail(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {},
            replacements = []
        let queryStr = `select *,0 as nowNumber,'' as nowRemark 
            from tbl_erc_productivetaskdetail ptd
            left join tbl_erc_materiel m on (ptd.materiel_id=m.materiel_id and m.state=1) 
            where ptd.state=1 and productivetask_id=? order by ptd.materiel_id`
        replacements = [doc.productivetask_id]
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

async function saveChange(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {},
            replacements = []

        // let addProductTaskDetail = await tb_productivetaskdetail.create({
        //     productivetask_id: doc.productivetask_id,
        //     materiel_id: doc.materiel_id,
        //     domain_id: user.domain_id,
        //     taskdetaildesign_number: Number(doc.nowNumber) - Number(doc.taskdetaildesign_number),
        //     taskdetailprd_level: doc.taskdetailprd_level,
        //     taskdetailprd_remark: doc.taskdetailprd_remark,
        //     taskdetailprd_batch: 2,
        //     change_state: 0
        // });
        let detail = await tb_productivetaskdetail.findOne({
            where: {
                state: 1,
                productivetaskdetail_id: doc.productivetaskdetail_id
            }
        })

        if (detail) {
            let feedchangelog = await tb_feedchangelog.create({
                user_id: user.user_id,
                productivetaskdetail_id: doc.productivetaskdetail_id,
                before_change: detail.taskdetaildesign_number,
                after_change: doc.change_number,
                change_remark: doc.change_remark
            })

            detail.taskdetaildesign_number = doc.change_number
            detail.save()
        }
        common.sendData(res, detail)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }

}

async function getFeedChangeLog(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {},
            replacements = []

        let queryStr = `select p.biz_code,m.materiel_code,m.materiel_name,m.materiel_unit,m.materiel_format,
            f.before_change,f.after_change,DATE_FORMAT(f.created_at,'%Y-%m-%d %H:%i') as created_at,u.username,f.change_remark
            from tbl_erc_feedchangelog f 
            left join tbl_erc_productivetaskdetail pd on (f.productivetaskdetail_id = pd.productivetaskdetail_id and pd.state=1)
            left join tbl_erc_materiel m on (pd.materiel_id = m.materiel_id and m.state=1)
            left join tbl_erc_productivetask p on (pd.productivetask_id = p.productivetask_id and p.state=1)
            left join tbl_common_user u on (f.user_id = u.user_id and u.state=1)
            where f.state=1 and f.productivetaskdetail_id=? order by feedchangelog_id`
        replacements.push(doc.productivetaskdetail_id)
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

async function sendTask(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {},
            replacements = []

        let ptDetail = await tb_productivetaskdetail.findAll({
            where: {
                state: 1,
                change_state: 0
            }
        })
        if (ptDetail.length == 0) {
            return common.sendError(res, 'feedchange_02');
        }

        /*//校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where: {
                state: GLBConfig.ENABLE,
                taskallot_name: '投料变更任务'
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
            return common.sendError(res, 'feedchange_01');
        } else {
            await tb_productivetask.update({
                change_state: 1
            }, {
                where: {
                    productivetask_id: doc.productivetask_id
                }
            });
            await tb_productivetaskdetail.update({
                change_state: 1
            }, {
                where: {
                    productivetask_id: doc.productivetask_id,
                    change_state: 0
                }
            });
            let taskName = '投料变更任务';
            let taskDescription = '  投料变更任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user, taskName, 90, taskallotuser.user_id, doc.productivetask_id, taskDescription, '', groupId);
            if (!taskResult) {
                return common.sendError(res, 'task_01');
            } else {
                common.sendData(res, {});
            }
        }*/

        await tb_productivetask.update({
            change_state: 2
        }, {
            where: {
                productivetask_id: doc.productivetask_id
            }
        });
        await tb_productivetaskdetail.update({
            change_state: 2
        }, {
            where: {
                productivetask_id: doc.productivetask_id,
            }
        });

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

async function getMaterielTemp(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {},
            replacements = []
        let queryStr = `select *,0 as apply_number from tbl_erc_materiel where state=1 and domain_id=?`
        replacements = [user.domain_id]
        if (doc.matNameOrCodeOrFormat) {
            queryStr += ` and (materiel_code like ? or materiel_name like ?)`
            replacements.push(doc.matNameOrCodeOrFormat)
            replacements.push(doc.matNameOrCodeOrFormat)
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

async function addProductiveTaskDetailFromMateriel(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {},
            replacements = []

        for (let d of doc) {
            let addProductTaskDetail = await tb_productivetaskdetail.create({
                productivetask_id: d.productivetask_id,
                materiel_id: d.materiel_id,
                domain_id: user.domain_id,
                taskdetaildesign_number: Number(d.taskdetaildesign_number),
                taskdetailprd_level: 99,
                taskdetailprd_remark: d.taskdetailprd_remark,
                taskdetailprd_batch: 2,
                change_state: 0
            });
        }

        common.sendData(res, {})
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

async function modifyState(req, productivetask_id) {
    try {
        await tb_productivetask.update({
            change_state: 2
        }, {
            where: {
                productivetask_id: productivetask_id
            }
        });
        await tb_productivetaskdetail.update({
            change_state: 2
        }, {
            where: {
                productivetask_id: productivetask_id,
                change_state: 1
            }
        });
    } catch (error) {
        throw error
    }
}
exports.modifyState = modifyState