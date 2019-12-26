/**
 * 报销职级维护
 * Created by Zhang Jizhe on 2018/4/8.
 */
const fs = require('fs');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCReimburseRankSRV');
const model = require('../../../model');
const FDomain = require('../../../bl/common/FunctionDomainBL');

// tables
const sequelize = model.sequelize;
const tb_reimburserank = model.erc_reimburserank;

exports.ERCReimburseRankResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'remove') {
        removeAct(req, res)
    } else {
        common.sendError(res, 'common_01');
    }
};

let initAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        returnData.trafficTools = GLBConfig.TRAFFICTOOLS;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
};

//查询用户报销职级信息
let searchAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};
        let queryStr = 'select * from tbl_common_domain a left join tbl_erc_reimburserank b on a.domain_id = b.domain_id' +
            ' where b.domain_id = ? and b.state = ? ';
        let replacements = [user.domain_id, GLBConfig.ENABLE];
        if (doc.search_text) {
            queryStr += ' and (b.reimburserank_name like ? )';
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

//新增报销职级信息
let addAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let rank = await tb_reimburserank.findOne({
            where: {
                reimburserank_name: doc.reimburserank_name,
                domain_id:user.domain_id,
                state: GLBConfig.ENABLE
            }
        });
        if (rank) {
            common.sendError(res, 'reimburserank_02');
        } else {
            rank = await tb_reimburserank.create({
                domain_id: user.domain_id,
                reimburserank_name: doc.reimburserank_name,
                reimburserank_reception_putup_level: doc.reimburserank_reception_putup_level,
                reimburserank_trip_putup_level: doc.reimburserank_trip_putup_level,
                reimburserank_downtown_traffic_level: doc.reimburserank_downtown_traffic_level,
                reimburserank_meal_level: doc.reimburserank_meal_level,
                reimburserank_reception_level: doc.reimburserank_reception_level,
                reimburserank_gas_level: doc.reimburserank_gas_level,
                reimburserank_traffic_available: doc.reimburserank_traffic_available,
                reimburserank_traffic_tools: doc.reimburserank_traffic_tools
            });
            common.sendData(res, rank);
        }
    } catch (error) {
        common.sendFault(res, error);
    }
};

//修改报销职级信息
let modifyAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), user = req.user;
        let rank = await tb_reimburserank.findOne({
            where: {
                reimburserank_id: doc.old.reimburserank_id
            }
        });
        if (rank) {
            rank.reimburserank_reception_putup_level = doc.new.reimburserank_reception_putup_level;
            rank.reimburserank_trip_putup_level = doc.new.reimburserank_trip_putup_level;
            rank.reimburserank_downtown_traffic_level = doc.new.reimburserank_downtown_traffic_level;
            rank.reimburserank_meal_level = doc.new.reimburserank_meal_level;
            rank.reimburserank_reception_level = doc.new.reimburserank_reception_level;
            rank.reimburserank_gas_level = doc.new.reimburserank_gas_level;
            rank.reimburserank_traffic_available = doc.new.reimburserank_traffic_available;
            rank.reimburserank_traffic_tools = doc.new.reimburserank_traffic_tools
            await rank.save();
            common.sendData(res, rank)
        } else {
            common.sendError(res, 'reimburserank_01')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};

//删除报销职级信息
let removeAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), user = req.user;
        let rank = await tb_reimburserank.findOne({
            where: {
                reimburserank_id: doc.reimburserank_id
            }
        });
        if (rank) {
            rank.state = GLBConfig.DISABLE;
            await rank.save();
            common.sendData(res, rank)
        } else {
            common.sendError(res, 'reimburserank_01')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};



