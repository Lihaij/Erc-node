/**
 * Created by Szane on 17/5/23.
 */
const moment = require('moment')
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCOrderControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const qr = require('qr-image');
const FDomain = require('../../../bl/common/FunctionDomainBL');

const sequelize = model.sequelize;
const tb_order = model.erc_order;
const tb_orderworkflow = model.erc_orderworkflow;
const tb_orderroom = model.erc_orderroom;
const tb_ordermateriel = model.erc_ordermateriel;
const tb_materiel = model.erc_materiel;

exports.ERCOrderShopSyncControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'sync') {
        syncAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

// 乐宜家C端商城查询物料接口
async function syncAct(req, res) {
    try {
        let doc = common.docTrim(req.body)

        if (!('order_id' in doc)) {
            return common.sendError(res, 'ordershopsync_01');
        }
        if (!('materiels' in doc)) {
            return common.sendError(res, 'ordershopsync_02');
        }
        if (!('authorization' in doc)) {
            return common.sendError(res, 'ordershopsync_04');
        }

        let order = await tb_order.findOne({
            where: {
                order_id: doc.order_id
            }
        });
        if (!order) {
            return common.sendError(res, 'ordershopsync_01');
        }

        let orderworkflow = await tb_orderworkflow.findOne({
            where: {
                order_id: doc.order_id,
                orderworkflow_state: 'SIGNED'
            }
        });

        if (orderworkflow) {
            return common.sendError(res, 'ordershopsync_03');
        }

        await common.transaction(async function(t) {
            for (let m of doc.materiels) {
                if (!('materiel_code' in m)) {
                    logger.error('materiel_code do not exists.')
                    throw new Error('materiel_code do not exists.')
                }
                if (!('room_id' in m)) {
                    logger.error('room_id do not exists.')
                    throw new Error('room_id do not exists.')
                }
                if (!('materiel_amount' in m)) {
                    logger.error('materiel_amount do not exists.')
                    throw new Error('materiel_amount do not exists.')
                }
                let materiel = await tb_materiel.findOne({
                    where: {
                        materiel_code: m.materiel_code
                    }
                });

                let ordermateriel = await tb_ordermateriel.findOne({
                    where: {
                        order_id: order.order_id,
                        materiel_id: materiel.materiel_id,
                        room_id: m.room_id
                    }
                });

                if (ordermateriel) {
                    ordermateriel.materiel_amount = m.materiel_amount
                    ordermateriel.state = GLBConfig.ENABLE
                    await ordermateriel.save({
                        transaction: t
                    })
                } else {
                    let room = await tb_orderroom.findOne({
                        where: {
                            order_id: order.order_id,
                            room_id: m.room_id
                        }
                    })
                    await tb_ordermateriel.create({
                        room_id: m.room_id,
                        order_id: doc.order_id,
                        materiel_id: materiel.materiel_id,
                        materiel_amount: m.materiel_amount,
                        room_type: room.room_type
                    }, {
                        transaction: t
                    });
                }
            }
        })
        let clients = common.getWSClientsByToken(doc.authorization)
        common.wsClientsClose(clients)

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
}
