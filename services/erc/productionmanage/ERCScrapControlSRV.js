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

const tb_scrap = model.erc_scrap
const tb_scrapdetail = model.erc_scrapdetail
// 生产日计划接口
exports.ERCScrapControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'getScrap') {
        getScrap(req, res)
    } else if (method === 'getProductiveTaskDetail') {
        getProductiveTaskDetail(req, res)
    } else if (method === 'addScrap') {
        addScrap(req, res)
    } else if (method === 'getScrapDetail') {
        getScrapDetail(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};
async function initAct(req, res) {
    try {
        let returnData = {}

        returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'); //单位
        returnData.scrapType = GLBConfig.SCRAP_TYPE
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

async function getScrap(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {},
            replacements = []

        let queryStr = `select s.*,u1.username as apply_user,u2.username as examine_user from tbl_erc_scrap s 
            left join tbl_common_user u1 on (s.scrap_apply_user = u1.user_id and u1.state=1)
            left join tbl_common_user u2 on (s.scrap_examine = u2.user_id and u2.state=1)
            where s.state=1 and s.domain_id=?`
        replacements = [user.domain_id]
        if (doc.scrap_id) {
            queryStr += ` and s.scrap_id=?`
            replacements.push(doc.scrap_id)
        }
        let result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.scrap_examine_time = (r.scrap_examine_time) ? moment(r.scrap_examine_time).format('YYYY-MM-DD') : '';
            result.created_at = (r.created_at) ? moment(r.created_at).format('YYYY-MM-DD') : '';
            returnData.rows.push(result)
        }
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

        let queryStr = `select ptd.productivetaskdetail_id,ptd.taskdetaildesign_number,sd.scrapdetail_number,pt.productivetask_code, pt.biz_code,
            0 as nowScrapNumber,0 as nowScrapNumberBak,0 as nowScrapNumberRep,'' as nowScrapRemark,
            m.materiel_format,m.materiel_unit,m.materiel_code,m.materiel_name,m.materiel_unit_bk,m.materiel_id   
            from tbl_erc_productivetaskdetail ptd
            left join tbl_erc_productivetask pt on (ptd.productivetask_id = pt.productivetask_id and pt.state=1)
            left join tbl_erc_scrapdetail sd on (ptd.materiel_id = sd.materiel_id and sd.productivetask_code = pt.productivetask_code and sd.state=1)
            left join tbl_erc_materiel m on (ptd.materiel_id = m.materiel_id and m.state=1)
            where ptd.state=1 and ptd.domain_id=? and pt.productivetask_state<>3`
        replacements = [user.domain_id]
        if (doc.search_text) {
            queryStr += ` and (m.materiel_code like ? or m.materiel_name like ?)`
            replacements.push(doc.search_text)
            replacements.push(doc.search_text)
        }
        let result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.taskdetail_number = Number(r.taskdetaildesign_number) - Number(r.scrapdetail_number);
            returnData.rows.push(result)
        }
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
async function getScrapDetail(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {},
            replacements = []

        let queryStr = `
            select
                sd.*, pt.biz_code
                ,m.materiel_format,m.materiel_unit,m.materiel_code,m.materiel_name,m.materiel_unit_bk   
                from tbl_erc_scrapdetail sd
                left join tbl_erc_productivetaskdetail ptd
                on sd.productivetaskdetail_id = ptd.productivetaskdetail_id
                left join tbl_erc_productivetask pt
                on pt.productivetask_id = ptd.productivetask_id
                left join tbl_erc_materiel m on (sd.materiel_id = m.materiel_id and m.state=1)
                where sd.scrap_id=?`
        replacements = [doc.scrap_id]
        let result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

async function addScrap(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user

        try {
            let doc = common.docTrim(req.body),
                user = req.user,
                returnData = {},
                replacements = []
            //校验是否分配任务处理人员
            let taskallot = await tb_taskallot.findOne({
                where: {
                    state: GLBConfig.ENABLE,
                    taskallot_name: '生产投料报废审核任务'
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
                return common.sendError(res, 'scrap_01');
            } else {
                // 报废申请单
                let SCRAPID = await Sequence.genScrapID(user.domain_id);
                let addScrap = await tb_scrap.create({
                    domain_id: user.domain_id,
                    scrap_no: SCRAPID,
                    scrap_apply_user: user.user_id,
                    scrap_state: 1
                });
                // 报废申请单明细
                for (let sd of doc.scrapDetail) {
                    let addScrapDetail = await tb_scrapdetail.create({
                        scrap_id: addScrap.scrap_id,
                        productivetaskdetail_id: sd.productivetaskdetail_id,
                        materiel_id: sd.materiel_id,
                        productivetask_code: sd.productivetask_code,
                        scrapdetail_number: sd.nowScrapNumber,
                        scrapdetail_number_standby: sd.nowScrapNumberBak,
                        scrapdetail_number_replenish: sd.nowScrapNumberRep,
                        scrapdetail_remark: sd.nowScrapRemark
                    });
                }
                let taskName = '生产投料报废审核任务';
                let taskDescription = '  生产投料报废审核任务';
                let groupId = common.getUUIDByTime(30);
                let taskResult = await task.createTask(user, taskName, 93, taskallotuser.user_id, addScrap.scrap_id, taskDescription, '', groupId);
                if (!taskResult) {
                    return common.sendError(res, 'task_01');
                } else {
                    common.sendData(res, {});
                }
            }

        } catch (error) {
            common.sendFault(res, error);
            return;
        }


    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

async function getProductiveTaskByScrap(scrap_id) {
    //取得报废下的所有报废物料
    const scrapDetailList = await tb_scrapdetail.findAll({
        where: {
            scrap_id
        }
    });

    for (const scrapDetail of scrapDetailList) {
        const { productivetaskdetail_id, productivetask_code, scrapdetail_number_replenish } = scrapDetail;
        const productiveTask = await tb_productivetask.findOne({
            where: {
                productivetask_code
            }
        });

        if (productiveTask) {
            productiveTask.stock_out_state = 2;
            await productiveTask.save();
        }

        const productiveTaskDetail = await tb_productivetaskdetail.findOne({
            where: {
                productivetaskdetail_id
            }
        });

        if (productiveTaskDetail) {
            productiveTaskDetail.taskdetaildesign_number += scrapdetail_number_replenish;
            await productiveTaskDetail.save();
        }
    }
}

async function modifyState(applyState, description, scrap_id, applyApprover, applyDomain_id) {
    try {
        const scrapResult = await tb_scrap.findOne({
            where: {
                scrap_id
            }
        });

        if (scrapResult) {
            scrapResult.scrap_state = applyState;
            scrapResult.scrap_examine = applyApprover;
            scrapResult.scrap_examine_time = new Date();

            await scrapResult.save();

            if (applyState === '2') {
                await getProductiveTaskByScrap(scrap_id);
            }
        }
    } catch (error) {
        throw error
    }
}
exports.modifyState = modifyState
