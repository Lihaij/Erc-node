/**
 * Created by Szane on 17/6/19.
 */
const fs = require('fs');
const common = require('../../util/CommonUtil');
const GLBConfig = require('../../util/GLBConfig');
const Sequence = require('../../util/Sequence');
const logger = require('../../util/Logger').createLogger('CustomerControlSRV');
const model = require('../../model');

const sequelize = model.sequelize
const tb_usergroup = model.common_usergroup;
const tb_user = model.common_user;
const tb_customer = model.erc_customer;
const tb_domain = model.common_domain;
const INF = 0xffffff;

exports.MBCustomerResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'search_d') {
        searchDomainAct(req, res)
    } else if (method === 'modify') {

    } else {
        common.sendError(res, 'common_01')
    }
};

async function initAct(req, res) {
    let returnData = {}

    common.sendData(res, returnData)
}

async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        let queryStr = 'select a.*,b.* from tbl_common_user a left join tbl_erc_customer b on a.user_id = b.user_id where a.user_type = ? ';
        let replacements = [GLBConfig.TYPE_CUSTOMER];

        if (doc.user_id) {
            queryStr += ' and a.user_id = ?';
            replacements.push(doc.user_id)
        }
        let result = await common.simpleSelect(sequelize, queryStr, replacements);
        common.sendData(res, result);
    } catch (error) {
        return common.sendFault(res, error);

    }
}
