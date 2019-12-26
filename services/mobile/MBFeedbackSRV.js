/**
 * Created by Szane on 17/6/30.
 */
const common = require('../../util/CommonUtil');
const GLBConfig = require('../../util/GLBConfig');
const logger = require('../../util/Logger').createLogger('MBFeedbackSRV');
const model = require('../../model');
const Sequence = require('../../util/Sequence');

const sequelize = model.sequelize;
const tb_feedback = model.erc_feedback;

exports.MBFeedbackResource = (req, res) => {
    let method = req.query.method;
    if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'add') {
        addAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

let searchAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), user = req.user;
        let queryStr = ` select f.*,u.username,u.name from tbl_erc_feedback f left join tbl_common_user u on f.creator = u.user_id 
          where  f.state = ? `;
        let replacements = [GLBConfig.ENABLE];
        if (doc.user_id != null) {
            queryStr += ` and u.user_id = ? `;
            replacements.push(doc.user_id);
        }
        let result = await common.simpleSelect(sequelize, queryStr, replacements);
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
};
let addAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), user = req.user;
        let addFeedback = await tb_feedback.create({
            content: doc.content,
            creator: doc.user_id
        });
        let retData = JSON.parse(JSON.stringify(addFeedback));
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
};