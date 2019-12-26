const common = require('../../../util/CommonUtil');
const AccountConst = require('../../../util/AccountConst');
const logger = require('../../../util/Logger').createLogger('ERCAccountingControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const GLBConfig = require('../../../util/GLBConfig');
const RecordingVouchersc = require('../../../util/RecordingVouchersc');

const moment = require('moment');
const sequelize = model.sequelize;
const tb_capitalaccountchange = model.erc_capitalaccountchange
const {
    CODE_NAME,
    genBizCode
} = require('../../../util/BizCodeUtil');

exports.ERCCapitalAccountChangeControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        await init(req, res);
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'search') {
        searchAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};

async function init(req, res) {
    try {
        const returnData = {};
        let queryStr = `select * from tbl_erc_companybankno b 
            left join tbl_erc_company c on (b.company_id = c.company_id and c.state = 1)
            where b.state = 1 and c.domain_id=?`
        let result = await sequelize.query(queryStr, {
            replacements: [req.user.domain_id],
            type: sequelize.QueryTypes.SELECT
        });
        returnData.COMPANYBANKNO = result.map(item => {
            return {
                id: item.companybankno_id,
                text: item.companybankno_bank_no,
                value: item.companybankno_id
            }
        })
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function addAct(req, res) {
    try {
        let {
            body,
            user
        } = req
        let capitalaccountchang_code = await genBizCode(CODE_NAME.ZJZHBG, user.domain_id, 6)
        let result = await tb_capitalaccountchange.create({
            domain_id: user.domain_id,
            capitalaccountchang_code: capitalaccountchang_code,
            capitalaccountchang_out: body.capitalaccountchang_out,
            capitalaccountchang_into: body.capitalaccountchang_into,
            capitalaccountchang_money: Number(body.capitalaccountchang_money) * 100,
            capitalaccountchang_remark: body.capitalaccountchang_remark,
            capitalaccountchang_creator: user.user_id
        });

        await RecordingVouchersc.createRecordingVoucherSC('ZJZHTZ', user, {
            capitalaccountchang_out: body.capitalaccountchang_out,
            capitalaccountchang_into: body.capitalaccountchang_into,
            amount: body.capitalaccountchang_money
        })
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}
async function searchAct(req, res) {
    try {
        let {
            body,
            user
        } = req
        let returnData = {}

        let queryStr = `select c.*,u.username from tbl_erc_capitalaccountchange c 
            left join tbl_common_user u on (c.capitalaccountchang_creator = u.user_id and u.state = 1) 
            where c.state = 1 and c.domain_id = ?`
        let replacements = [user.domain_id];
        if (body.searchText) {
            queryStr += ` and (capitalaccountchang_out like ? or capitalaccountchang_into like ?) `
            replacements.push('%' + body.searchText + '%')
            replacements.push('%' + body.searchText + '%')
        }
        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = result.created_at ? moment(result.created_at).format("YYYY-MM-DD") : null;
            result.capitalaccountchang_money = Number(result.capitalaccountchang_money) / 100
            returnData.rows.push(result)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}