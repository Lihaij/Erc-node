/**
 * Created by Szane on 17/6/29.
 */
const common = require('../../util/CommonUtil');
const GLBConfig = require('../../util/GLBConfig');
const logger = require('../../util/Logger').createLogger('MBCrewSRV');
const model = require('../../model');
const Sequence = require('../../util/Sequence');

const sequelize = model.sequelize;
const tb_crew = model.erc_crew;

exports.MBCrewResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
    } else if (method === 'add') {
        addAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'delete') {
        deleteAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

let addAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let addCrew = await tb_crew.findOne({
            where: {
                foreman_id: doc.foreman,
                worker_id: doc.worker,
                state: GLBConfig.ENABLE
            }
        });
        if (addCrew)
            return common.sendError(res, 'crew_01');
        addCrew = await tb_crew.create({
            foreman_id: doc.foreman,
            worker_id: doc.worker
        });
        let retData = JSON.parse(JSON.stringify(addCrew));
        return common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
let searchAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let queryStr = `select w.*,c.*,u.* from tbl_erc_crew c left join tbl_erc_worker w on c.worker_id = w.user_id  
    left join tbl_common_user u on w.user_id = u.user_id where u.state = ? and w.state = ? and c.state = ? `;
        let replacements = [GLBConfig.ENABLE, GLBConfig.ENABLE, GLBConfig.ENABLE];
        if (doc.foreman != null) {
            queryStr += ' and c.foreman_id = ?';
            replacements.push(doc.foreman);
        }
        let result = await common.simpleSelect(sequelize, queryStr, replacements);
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
};
let deleteAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let delCrew = await tb_crew.findOne({
            where: {
                crew_id: doc.crew_id,
                state: GLBConfig.ENABLE
            }
        });
        if (delCrew) {
            delCrew.state = GLBConfig.DISABLE;
            await delCrew.save();
            return common.sendData(res);
        } else {
            return common.sendError(res, 'crew_02');
        }
    } catch (error) {
        return common.sendFault(res, error);
    }
};