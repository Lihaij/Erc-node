/**
 * Created by shuang.liu on 18/3/28.
 */
const moment = require('moment')
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCLoanControlSRV');
const model = require('../../../model');

const sequelize = model.sequelize;
const tb_loan = model.erc_loan;

exports.ERCLoanControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        returnData.projectTypeInfo = GLBConfig.PROJECTTYPE;//工程类型
        returnData.stateType = GLBConfig.LOANINFO;//贷款状态

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//查询贷款列表
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData={};

        let queryStr = 'select t.*,ut.`name`,ut.phone,ot.order_address,ot.order_house_area,ot.project_type ' +
            'from tbl_erc_loan t ' +
            'left join tbl_common_user ut on t.user_id = ut.user_id ' +
            'left join tbl_erc_order ot on t.order_id = ot.order_id where t.domain_id=?'
        let replacements = [user.domain_id]

        if (doc.search_text) {
            queryStr += ' and (t.order_id like ? or ut.`name` like ? or ut.phone like ? or ot.order_address like ? )'
            let search_text = '%' + doc.search_text + '%'
            replacements.push(search_text)
            replacements.push(search_text)
            replacements.push(search_text)
            replacements.push(search_text)
        }

        if (doc.loan_state) { //0未受理，1已受理
            queryStr += ' and t.loan_state = ?'
            replacements.push(doc.loan_state)
        }
        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        // returnData.rows = result.data;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//修改贷款信息
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let loan = await tb_loan.findOne({
            where: {
                loan_id: doc.loan_id,
                state: GLBConfig.ENABLE
            }
        });
        if (loan) {
            loan.loan_state = doc.loan_state;
            await loan.save();
            return common.sendData(res);
        } else {
            return common.sendError(res, 'loan_01');
        }

    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}


