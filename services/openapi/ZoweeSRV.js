const fs = require('fs');
const common = require('../../util/CommonUtil');
const GLBConfig = require('../../util/GLBConfig');
const Sequence = require('../../util/Sequence');
const logger = require('../../util/Logger').createLogger('ZoweeInterfaceSRV');
const model = require('../../model');

const tb_zoweeprocess = model.erc_zoweeprocess;

exports.ZoweeControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'updatePRDOrderState') {
        updatePRDOrderStateAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

let updatePRDOrderStateAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body)

        await common.transaction(async function(t) {
            for (let item of doc.list) {
                if (!('zoweeprocess_id' in item)) {
                    logger.error('zoweeprocess_id do not exists.')
                    throw new Error('zoweeprocess_id do not exists.')
                }

                if (!('zoweeprocess_state' in item)) {
                    logger.error('zoweeprocess_state do not exists.')
                    throw new Error('zoweeprocess_state do not exists.')
                }

                if (!('zoweeprocess_feedback' in item)) {
                    logger.error('zoweeprocess_feedback do not exists.')
                    throw new Error('zoweeprocess_feedback do not exists.')
                }
                let process = await tb_zoweeprocess.findOne({
                    where: {
                        zoweeprocess_id: item.zoweeprocess_id
                    }
                })
                if (process) {
                    process.zoweeprocess_state = item.zoweeprocess_state
                    process.zoweeprocess_feedback = item.zoweeprocess_feedback
                    await process.save({
                        transaction: t
                    })
                } else {
                    logger.error(item.zoweeprocess_id + ' do not exists.')
                    throw new Error(item.zoweeprocess_id + ' do not exists.')
                }

            }
        })

        common.sendData(res);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
