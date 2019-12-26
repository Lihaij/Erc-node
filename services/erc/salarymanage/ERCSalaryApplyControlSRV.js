const common = require('../../../util/CommonUtil');
const logger = require('../../../util/Logger').createLogger('ERCSalaryMineControlSRV');
const model = require('../../../model');
const GLBConfig = require('../../../util/GLBConfig');
const sequelize = model.sequelize;
const moment = require('moment')
const task = require('../baseconfig/ERCTaskListControlSRV');

const tb_salaryapply = model.erc_salaryapply

exports.ERCSalaryApplyControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'addSalaryApply') {
        await addSalaryApply(req, res);
    } else if (method === 'getSalaryApply') {
        await getSalaryApply(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};

async function addSalaryApply(req, res) {
    try {
        const {
            body,
            user
        } = req;
        let result = {}

        result = await tb_salaryapply.create({
            domain_id: user.domain_id,
            user_id: user.user_id,
            superior_user_id: body.superior_user_id,
            salaryapply_money: body.salaryapply_money,
            salaryapply_productivetask_code: body.salaryapply_productivetask_code,
            salaryapply_remark: body.salaryapply_remark,
            salaryapply_date: body.salaryapply_date,
            salaryapply_state: 0
        })

        let taskName = '工资申请';
        let taskDescription = result.salaryapply_id + '  工资申请';
        let groupId = common.getUUIDByTime(30);
        let taskResult = await task.createTask(user, taskName, 101, body.superior_user_id, result.salaryapply_id, taskDescription, '', groupId);
        if (!taskResult) {
            return common.sendError(res, 'task_01');
        }

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function getSalaryApply(req, res) {
    try {
        const {
            body,
            user
        } = req;
        let replacements = [],
            returnData = {}
        let queryStr = `select s.*,u1.name as name,u2.name as superiorName  
            from tbl_erc_salaryapply s
            left join tbl_common_user u1 on (s.user_id = u1.user_id and u1.state=1)
            left join tbl_common_user u2 on (s.superior_user_id = u2.user_id and u2.state=1)
            where s.domain_id=? and s.user_id=?`
        replacements.push(user.domain_id)
        replacements.push(user.user_id)
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at.Format("yyyy-MM-dd");
            result.apply_state = r.salaryapply_state == 0 ? '未同意' : '已同意'
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//修改申请单状态
async function modifySalaryApplyState(applyState, description, salaryapply_id, applyApprover) {
    await tb_salaryapply.update({
        salaryapply_state: applyState,
    }, {
        where: {
            salaryapply_id: salaryapply_id
        }
    });

}
exports.modifySalaryApplyState = modifySalaryApplyState;