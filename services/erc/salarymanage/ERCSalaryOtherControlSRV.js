const common = require('../../../util/CommonUtil');
const logger = require('../../../util/Logger').createLogger('ERCSalaryMineControlSRV');
const model = require('../../../model');
const GLBConfig = require('../../../util/GLBConfig');
const sequelize = model.sequelize;
const moment = require('moment')

const tb_salaryother = model.erc_salaryother
const tb_salaryotherdetail = model.erc_salaryotherdetail
const {
    CODE_NAME,
    genBizCode
} = require('../../../util/BizCodeUtil');

exports.ERCSalaryOtherControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'addSalaryOther') {
        await addSalaryOther(req, res);
    } else if (method === 'addSalaryOtherDetail') {
        await addSalaryOtherDetail(req, res)
    } else if (method === 'getSalaryOther') {
        await getSalaryOther(req, res)
    } else if (method === 'getSalaryOtherDetail') {
        await getSalaryOtherDetail(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};

async function addSalaryOther(req, res) {
    try {
        const {
            body,
            user
        } = req;
        let salaryother_code = await genBizCode(CODE_NAME.EWGZQR, user.domain_id, 6);
        let result = await tb_salaryother.create({
            domain_id: user.domain_id,
            salaryother_code,
            salaryother_type: body.salaryother_type,
            salaryother_remark: body.salaryother_remark,
            salaryother_confirm_user: body.salaryother_confirm_user
        })

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function addSalaryOtherDetail(req, res) {
    try {
        const {
            body,
            user
        } = req;
        let result = await tb_salaryotherdetail.create({
            salaryother_id: body.salaryother_id,
            user_id: body.user_id,
            salaryotherdetail_money: body.salaryotherdetail_money,
            salaryotherdetail_productivetask_code: body.salaryotherdetail_productivetask_code,
            salaryotherdetail_remark: body.salaryotherdetail_remark
        })
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function getSalaryOther(req, res) {
    try {
        const {
            body,
            user
        } = req;
        let replacements = [],
        returnData={}
        let queryStr = `select s.salaryother_id,s.salaryother_code,s.salaryother_type,
            s.created_at,s.salaryother_remark,u.name,sum(d.salaryotherdetail_money) as sum_salaryotherdetail_money
            from tbl_erc_salaryother s 
            left join tbl_erc_salaryotherdetail d on (s.salaryother_id = d.salaryother_id and d.state=1)
            left join tbl_common_user u on (s.salaryother_confirm_user = u.user_id and u.state=1)
            where s.domain_id=?
            group by s.salaryother_id,s.salaryother_code,s.salaryother_type,s.created_at,s.salaryother_remark,u.username`
        replacements.push(user.domain_id)
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at.Format("yyyy-MM-dd");
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function getSalaryOtherDetail(req, res) {
    try {
        const {
            body,
            user
        } = req;
        let replacements = [],returnData={}
        let queryStr = `select s.*,u.name,u.user_id,dt.department_name
             from tbl_erc_salaryotherdetail s 
            left join tbl_common_user u on (s.user_id = u.user_id and u.state=1) 
            left join tbl_erc_custorgstructure ot on (s.user_id = ot.user_id and ot.state=1) 
            left join tbl_erc_department dt on (ot.department_id = dt.department_id and dt.state=1) 
            where s.salaryother_id=?`
        replacements.push(body.salaryother_id)
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at.Format("yyyy-MM-dd");
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}