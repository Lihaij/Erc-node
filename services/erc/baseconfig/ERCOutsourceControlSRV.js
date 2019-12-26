/**
 * Created by BaiBin on 2019/3/7.
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const { CODE_NAME, genBizCode } = require('../../../util/BizCodeUtil');
const logger = require('../../../util/Logger').createLogger('ERCNoticeControlSRV');
const model = require('../../../model');
const moment = require('moment');
const task = require('../baseconfig/ERCTaskListControlSRV');

const sequelize = model.sequelize;
const tb_department = model.erc_department;
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;
const tb_user = model.common_user;
const tb_outsource = model.erc_outsource;
const tb_cg = model.erc_custorgstructure;


exports.ERCOutsourceControlSRVResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'add_outsource') {
        addOutsourceAct(req, res);
    } else if (method === 'search_outsource') {
        searchOutsourceAct(req, res);
    } else if (method === 'modify_outsource') {
        modifyOutsourceAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    let doc = common.docTrim(req.body);
    let returnData = {};
    let user = req.user;

    try {
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }

}

//创建外包服务
async function addOutsourceAct(req, res) {
    let doc = common.docTrim(req.body);
    let user = req.user;
    try {
        //查看是否分配任务审核人员
        let taskallot = await tb_taskallot.findOne({
            where: {
                state: GLBConfig.ENABLE,
                taskallot_name: '外包服务审核'
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
            return common.sendError(res, 'task_02');
        }

        //查询员工所在部门
        const cg = await tb_cg.findOne({
            where: {
                user_id: user.user_id,
            }
        });
        const outsource_id = await Sequence.genOutsourceID();
        const outsource = await tb_outsource.create({
            outsource_id: outsource_id,
            domain_id: user.domain_id,
            outsource_name: doc.outsource_name,
            outsource_money: doc.outsource_money * 100,
            outsource_description: doc.outsource_description,
            department_id: cg.department_id,
            outsource_state: 1,
            outsource_creator: user.user_id,
            biz_code: await genBizCode(CODE_NAME.WBFW, user.domain_id, 6)
        });

        const taskName = '外包服务审核';
        const groupId = common.getUUIDByTime(30);
        // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
        await task.createTask(user, taskName, 84, taskallotuser.user_id, outsource_id, '', '', groupId);


        common.sendData(res, outsource);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//修改外包服务
async function modifyOutsourceAct(req, res) {
    let doc = common.docTrim(req.body);
    let user = req.user;
    try {
        //查看是否分配任务审核人员
        let taskallot = await tb_taskallot.findOne({
            where: {
                state: GLBConfig.ENABLE,
                taskallot_name: '外包服务审核'
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
            return common.sendError(res, 'task_02');
        }



        const outsource = await tb_outsource.findOne({
            where: {
                outsource_id: doc.outsource_id,
            }
        });
        if (outsource) {
            outsource.outsource_name = doc.outsource_name;
            outsource.outsource_money = doc.outsource_money * 100;
            outsource.outsource_description = doc.outsource_description;
            outsource.outsource_state = 1; //状态改为待审核
            await outsource.save();
        }

        const taskName = '外包服务审核';
        const groupId = common.getUUIDByTime(30);
        // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
        await task.createTask(user, taskName, 84, taskallotuser.user_id, outsource.outsource_id, '', '', groupId);


        common.sendData(res, outsource);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//查询外包服务
async function searchOutsourceAct(req, res) {
    let doc = common.docTrim(req.body);
    let user = req.user, returnData = {};
    try {
        let sql = `select o.*, u.name, d.department_name from tbl_erc_outsource o
            left join tbl_common_user u on o.outsource_creator = u.user_id
            left join tbl_erc_department d on o.department_id = d.department_id
            where o.domain_id = ?`
        let replacements = [user.domain_id];
        if (doc.search_text) {
            sql += ' and u.name like ?';
            const name = '%' + doc.search_text + '%';
            replacements.push(name);
            sql += ' or u.user_id like ?';
            const user_id = '%' + doc.search_text + '%';
            replacements.push(user_id);
        }
        sql += ' order by o.created_at desc';
        let result = await common.queryWithCount(sequelize, req, sql, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            result.outsource_money = r.outsource_money ? r.outsource_money / 100 : 0;
            if (r.outsource_state === '1') {
                result.outsource_state_text = '待提交';
            } else if (r.outsource_state === '2') {
                result.outsource_state_text = '已通过';
            }else if (r.outsource_state === '3') {
                result.outsource_state_text = '已拒绝';
            }
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//查询外包服务
exports.modifyOutsourceState = async (state, outsource_id, task_description) => {

    try {
        let outsource = await tb_outsource.findOne({
            where: {
                outsource_id: outsource_id
            }
        })
        if (outsource) {
            outsource.outsource_state = state;//1待审核 2通过 3拒绝
            outsource.task_description = task_description;
            await outsource.save();
        }
    } catch (error) {
        logger.error(error.message);
    }
}
