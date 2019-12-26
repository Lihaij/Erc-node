/**
 * Created by Szane on 17/6/30.
 */
const common = require('../../util/CommonUtil');
const GLBConfig = require('../../util/GLBConfig');
const logger = require('../../util/Logger').createLogger('MBWorkerSRV');
const model = require('../../model');
const Sequence = require('../../util/Sequence');

const sequelize = model.sequelize;
const tb_crew = model.erc_worker;

exports.MBWorkerResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
    } else if (method === 'add') {
        addAct(req, res);
    } else if (method === 'delete') {
        searchAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

let addAct = async(res, req)=> {
    try {
        let doc = common.docTrim(req.body);
        let addCrew = await tb_crew.findOrCreate({
            foreman_id: doc.foreman,
            worker_id: doc.worker
        });
        let retData = JSON.parse(JSON.stringify(addCrew));
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
