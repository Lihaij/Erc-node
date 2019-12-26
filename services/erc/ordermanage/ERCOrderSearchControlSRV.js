const moment = require('moment')
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCOrderSearchControlSRV');
const model = require('../../../model');
const FDomain = require('../../../bl/common/FunctionDomainBL');

const sequelize = model.sequelize;
const tb_order = model.erc_order;
const tb_orderkujiale = model.erc_orderkujiale;

// 酷家乐对接接口
exports.ERCOrderSearchControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search_order') {
        search_order(req, res)
    } else if (method === 'search_design') {
        getDesign(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};
// 查询订单
let search_order = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {},
            replacements = [];
        let queryStr = `select o.*,u.*, e.*, r.*, k.*, o.order_id order_id, o.domain_id domain_id,
                o.created_at order_created_at from
                tbl_erc_order o
                left join tbl_common_user u on o.user_id = u.user_id
                left join tbl_common_domain d on d.domain_id = o.domain_id
                left join tbl_erc_estate e on e.estate_id = o.estate_id
                left join tbl_erc_roomtype r on o.roomtype_id = r.roomtype_id
                left join tbl_erc_orderkujiale k on o.order_id = k.order_id
                where o.state=1 and order_type=1 and o.domain_id ` + await FDomain.getDomainListStr(req);
        if (doc.search_text) {
            queryStr += ' and (o.order_id like ? or o.order_address like ? or u.phone like ? or u.name like ?)';
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
        }
        queryStr += ' order by o.created_at desc LIMIT 8';
        let result = await common.simpleSelect(sequelize, queryStr, replacements);
        returnData.rows = [];
        for (let r of result) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.order_created_at ? moment(r.order_created_at).format("YYYY-MM-DD") : null;
            result.break_date_f = r.break_date ? moment(r.break_date).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 查询签名
let getDesign = async (req, res) => {
    try {
        let doc = common.docTrim(req.body)
        let design = await tb_orderkujiale.findOne({
            where: {
                desid: doc.design_id
            }
        });
        common.sendData(res, design);
    } catch (error) {
        throw error;
    }
}
