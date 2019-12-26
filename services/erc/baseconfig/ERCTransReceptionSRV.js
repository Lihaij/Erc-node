/**
 * 交通接待维护
 * Created by Zhang Jizhe on 2018/4/10.
 */

const fs = require('fs');
const moment = require('moment');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCTransReceptionSRV');
const model = require('../../../model');
const FDomain = require('../../../bl/common/FunctionDomainBL');

// tables
const sequelize = model.sequelize;
const tb_trafficreceptionapply = model.erc_trafficreceptionapply;
const tb_reimburserank = model.erc_reimburserank;

exports.ERCTransReceptionResource = (req, res) => {
    let method = req.query.method;
   if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    }else if (method === 'remove') {
        removeAct(req, res)
    } else {
        common.sendError(res, 'common_01');
    }
};

//查询交通接待信息
let searchAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};

        let queryStr = 'select * from tbl_common_domain a left join tbl_erc_transreceptionapply b ' +
            'on a.domain_id = b.domain_id where b.domain_id = ? and b.state = ?';

        let replacements = [user.domain_id, GLBConfig.ENABLE];

        if (doc.search_text) {
            queryStr += ' and (b.trapply_code like ?  or b.trapply_creator_name like ? )';
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text);
        }
        if (doc.created_at) {
            queryStr += ` and b.created_at >= ? and b.created_at <= ? `;
            replacements.push(doc.created_at + ` 00:00:00`);
            replacements.push(doc.created_at + ` 23:59:59`);
        }
        if (doc.trapply_id) {
            queryStr += ` and b.trapply_id = ? `;
            replacements.push(doc.trapply_id);
        }
        if (doc.trapply_creator_id){
            queryStr += ` and b.trapply_creator_id = ? `;
            replacements.push(doc.trapply_creator_id);
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];

        for (let i of result.data) {
            let temy = JSON.parse(JSON.stringify(i));
            temy.created_at = i.created_at ? moment(i.created_at).format("YYYY-MM-DD HH:mm") : null;
            temy.trapply_confirm_time = i.trapply_confirm_time ? moment(i.trapply_confirm_time).format("YYYY-MM-DD HH:mm") : null;
            returnData.rows.push(temy)
        }
        common.sendData(res, returnData);

    } catch (error) {
        logger.error('ERCTransReceptionResource-searchAct:' + error);
        common.sendFault(res, error);
    }
};

//新增交通接待信息
let addAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let trapply_code = await Sequence.genTransApplyID();
        let apply = await tb_trafficreceptionapply.create({
            domain_id: user.domain_id,
            trapply_code: trapply_code,
            trapply_creator_id: user.user_id,
            trapply_creator_name: user.name,
            trapply_state: GLBConfig.CHANGESTATE[0].value, //state  0待提交 1审核中 2通过 3驳回
        });
        common.sendData(res, trapply_code);

    } catch (error) {
        logger.error('ERCTransReceptionResource-addAct:' + error);
        common.sendFault(res, error);
    }
};

//删除交通接待信息
let removeAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let apply = await tb_trafficreceptionapply.findOne({
            where: {
                trapply_id: doc.trapply_id
            }
        });
        if (apply) {
            apply.state = GLBConfig.DISABLE;
            await apply.save();
            common.sendData(res, apply);
        } else {
            common.sendData(res, 'trafficApply_01');
        }
    } catch (error) {
        logger.error('ERCTransReceptionResource-removeAct:' + error);
        common.sendFault(res, error);
    }
};
