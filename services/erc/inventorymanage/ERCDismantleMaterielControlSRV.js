const fs = require('fs');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCSupplierMaterielControl');
const task = require('../baseconfig/ERCTaskListControlSRV');
const model = require('../../../model');
const moment = require('moment');
const { CODE_NAME, genBizCode } = require('../../../util/BizCodeUtil');

// tables
const sequelize = model.sequelize;
const tb_warehouse = model.erc_warehouse;
const tb_materiel = model.erc_materiel;
const tb_stockmap = model.erc_stockmap;
const tb_scrap_materiel = model.erc_scrap_materiel;
const tb_dismantle_materiel = model.erc_dismantle_materiel;
const tb_dismantle_materiel_item = model.erc_dismantle_materiel_item;

exports.ERCDismantleMaterielControlResource = async (req, res) => {
    const method = req.query.method;
    if (method === 'initDismantleData') {
        await initDismantleData(req, res);
    } else if (method === 'getDismantleMateriel') {
        await getDismantleMateriel(req, res);
    } else if (method === 'getDismantleMaterielItem') {
        await getDismantleMaterielItem(req, res);
    } else if (method === 'addDismantleMateriel') {
        await addDismantleMateriel(req, res);
    } else if (method === 'modifyDismantleMaterielItem') {
        await modifyDismantleMaterielItem(req, res);
    } else if (method === 'deleteDismantleMateriel') {
        await deleteDismantleMateriel(req, res);
    } else if (method === 'deleteDismantleMaterielItem') {
        await deleteDismantleMaterielItem(req, res);
    } else if (method === 'submitDismantleMaterielTask') {
        await submitDismantleMaterielTask(req, res);
    } else {
        common.sendError(res, 'common_01');
    }
};

//初始化数据
async function initDismantleData(req, res) {
    const { user } = req;

    try {
        const { domain_id } = user;
        const returnData = {};
        returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW');
        returnData.materielStateManagement = GLBConfig.MATERIELSTATEMANAGEMENT;
        returnData.wareHouseInfo = await tb_warehouse.findAll({
            where: {
                domain_id,
                warehouse_type: 5,
                state: GLBConfig.ENABLE
            },
            attributes: [['warehouse_id', 'id'], ['warehouse_name', 'text']]
        });
        returnData.stateInfo = [{id: 0, text: '待提交'}, {id: 1, text: '已提交'}, {id: 2, text: '已拆解'}];

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error)
    }
}

async function getDismantleMateriel(req, res) {
    const { body, user } = req;

    try {
        const { search_text } = body;
        const { domain_id } = user;

        let queryStr =
            `select
                dm.dismantle_materiel_id, dm.biz_code, dm.dismantle_state, dm.complete_date
                , dm.warehouse_id, dm.assign_user_id, date(dm.complete_date) as complete_date
                , wh.warehouse_name, sur.name as submit_username, aur.name as assign_username
                from tbl_erc_dismantle_materiel dm
                left join tbl_erc_warehouse wh
                on dm.warehouse_id = wh.warehouse_id
                left join tbl_common_user sur
                on dm.submit_user_id = sur.user_id
                left join tbl_common_user aur
                on dm.assign_user_id = aur.user_id
                where true
                and dm.state = ?
                and dm.domain_id = ?`;

        const replacements = [ GLBConfig.ENABLE, domain_id ];

        if (search_text) {
            queryStr += ` and (mat.materiel_code like ? or mat.materiel_name like ?)`;
            replacements.push(search_text);
            replacements.push(search_text);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        const returnData = {total: result.count, rows: result.data};

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getDismantleMaterielItem(req, res) {
    const { body, user } = req;

    try {
        const { dismantle_materiel_id, search_text } = body;
        const { domain_id } = user;

        let queryStr =
            `select
                dmi.dismantle_materiel_item_id, dmi.dismantle_number, dmi.materiel_id
                , mat.materiel_code, mat.materiel_name, mat.materiel_format, mat.materiel_unit
                , whz.zone_name
                from tbl_erc_dismantle_materiel_item dmi
                left join tbl_erc_materiel mat
                on dmi.materiel_id = mat.materiel_id
                left join tbl_erc_warehousezone whz
                on dmi.warehouse_zone_id = whz.warehouse_zone_id
                where true
                and dmi.state = ?
                and dmi.domain_id = ?
                and dmi.dismantle_materiel_id = ?`;

        const replacements = [ GLBConfig.ENABLE, domain_id, dismantle_materiel_id ];

        if (search_text) {
            queryStr += ` and (mat.materiel_code like ? or mat.materiel_name like ?)`;
            replacements.push(search_text);
            replacements.push(search_text);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        const returnData = {total: result.count, rows: result.data};

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function addDismantleMateriel(req, res) {
    const { body, user } = req;

    try {
        const { dismantle_materiel_id, warehouse_id, assign_user_id, dismantleArray } = body;
        const { domain_id, user_id } = user;
        let dismantleMateriel = null;

        await sequelize.transaction(async (transaction) => {
            if (dismantle_materiel_id) {
                dismantleMateriel = await tb_dismantle_materiel.findOne({
                    where: {
                        dismantle_materiel_id,
                        state: GLBConfig.ENABLE
                    }
                });
            } else {
                dismantleMateriel = await tb_dismantle_materiel.create({
                    domain_id,
                    biz_code: await genBizCode(CODE_NAME.CJPG, domain_id, 6),
                    warehouse_id,
                    assign_user_id,
                    submit_user_id: user_id
                }, {
                    validate: true,
                    transaction
                });
            }

            if (dismantleMateriel) {
                const {dismantle_materiel_id} = dismantleMateriel;
                for (const dismantleItem of dismantleArray) {
                    const { materiel_id, warehouse_zone_id, remain_number } = dismantleItem;

                    const dismantleMaterielItem = await tb_dismantle_materiel_item.findOne({
                        where: {
                            dismantle_materiel_id,
                            domain_id,
                            materiel_id,
                            warehouse_id,
                            warehouse_zone_id
                        }
                    });

                    if (!dismantleMaterielItem) {
                        await tb_dismantle_materiel_item.create({
                            dismantle_materiel_id,
                            domain_id,
                            materiel_id,
                            warehouse_id,
                            warehouse_zone_id,
                            dismantle_number: remain_number
                        }, {
                            validate: true,
                            transaction
                        });
                    } else {
                        const materielResult = await tb_materiel.findOne({
                            where: {
                                materiel_id
                            }
                        });
                        const { materiel_name } = materielResult;
                        return common.sendError(res, '', `${materiel_name}已存在`);
                    }
                }
            } else {
                return common.sendError(res, '', `创建拆解派工单失败`);
            }
        });

        common.sendData(res, dismantleMateriel);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function modifyDismantleMaterielItem(req, res) {
    const { body } = req;

    try {
        const { dismantle_materiel_item_id, dismantle_number } = body.new;

        const dismantleMaterielItem = await tb_dismantle_materiel_item.findOne({
            where: {
                dismantle_materiel_item_id
            }
        });

        if (dismantleMaterielItem) {
            dismantleMaterielItem.dismantle_number = dismantle_number;
            await dismantleMaterielItem.save();
        }

        common.sendData(res, dismantleMaterielItem);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function deleteDismantleMateriel(req, res) {
    const { body } = req;

    try {
        const { dismantle_materiel_id } = body;

        const dismantleMateriel = await tb_dismantle_materiel.findOne({
            where: {
                dismantle_materiel_id
            }
        });

        if (dismantleMateriel) {
            await tb_dismantle_materiel_item.destroy({
                where: {
                    dismantle_materiel_id
                }
            });

            dismantleMateriel.state = GLBConfig.DISABLE;
            await dismantleMateriel.save();
        }

        common.sendData(res, dismantleMateriel);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function deleteDismantleMaterielItem(req, res) {
    const { body } = req;

    try {
        const { dismantle_materiel_item_id } = body;

        await tb_dismantle_materiel_item.destroy({
            where: {
                dismantle_materiel_item_id
            }
        });

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function submitDismantleMaterielTask(req, res) {
    const { body, user } = req;

    try {
        const { dismantle_materiel_id } = body;

        const dismantleMateriel = await tb_dismantle_materiel.findOne({
            where: {
                dismantle_materiel_id
            }
        });

        if (dismantleMateriel) {
            const { assign_user_id } = dismantleMateriel;
            dismantleMateriel.dismantle_state = 1;
            await dismantleMateriel.save();

            const taskName = '拆解派工单任务';
            const taskDescription = '分配拆解物料人员';
            const groupId = common.getUUIDByTime(30);
            const taskResult = await task.createTask(user, taskName, 59, assign_user_id, dismantle_materiel_id, taskDescription, '', groupId);
            if (!taskResult) {
                return common.sendError(res, 'task_01');
            }
        }

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
}

exports.applyDismantleMaterielTask = async (req, res, dismantle_materiel_id) => {
    const { user } = req;
    const { domain_id } = user;

    await sequelize.transaction(async (transaction) => {
        // 取得拆解单数据
        const dismantleMateriel = await tb_dismantle_materiel.findOne({
            where: {
                dismantle_materiel_id
            }
        });

        if (dismantleMateriel) {
            //取得拆解单的物料内容
            const dismantleArray = await tb_dismantle_materiel_item.findAll({
                where: {
                    dismantle_materiel_id
                }
            });

            const { warehouse_id } = dismantleMateriel;
            const warehouseResult = await tb_warehouse.findOne({
                where: {
                    warehouse_id,
                    domain_id
                }
            });

            if (warehouseResult) {
                const { warehouse_type, warehouse_name } = warehouseResult;
                if (parseInt(warehouse_type) !== 5) {
                    return common.sendError(res, '', `${warehouse_name}不是废料仓`);
                }
            } else {
                return common.sendError(res, '', `仓库不存在`);
            }

            for (const dismantleItem of dismantleArray) {
                //遍历拆解单所有拆解物料信息
                const { materiel_id, warehouse_zone_id, dismantle_number } = dismantleItem;

                //查询库存中的待拆解物料
                const stockMapResult = await tb_stockmap.findOne({
                    where: {
                        materiel_id,
                        warehouse_id,
                        warehouse_zone_id,
                        domain_id
                    }
                });

                if (stockMapResult) {
                    //库存的物料当前数量减去需要拆解的数量
                    stockMapResult.current_amount = stockMapResult.current_amount - dismantle_number;

                    await stockMapResult.save({
                        validate: true,
                        transaction
                    });
                } else {
                    return common.sendError(res, '', `无法取得库存中待拆解的报废`);
                }

                //物料报废配置列表
                const scrapMaterielArray = await tb_scrap_materiel.findAll({
                    where: {
                        materiel_id,
                        domain_id
                    }
                });

                if (scrapMaterielArray.length < 1) {
                    return common.sendError(res, '', `没有找到报废配置`);
                }

                for (const scrapMaterielItem of scrapMaterielArray) {
                    const { scrap_materiel_id, scrap_number } = scrapMaterielItem;

                    //取得废料的数据
                    const stockMapScrap = await tb_stockmap.findOne({
                        where: {
                            materiel_id: scrap_materiel_id,
                            warehouse_id,
                            warehouse_zone_id,
                            domain_id
                        }
                    });

                    if (stockMapScrap) {
                        stockMapScrap.current_amount += dismantle_number * scrap_number;
                        await stockMapScrap.save({
                            validate: true,
                            transaction
                        });
                    } else {
                        await tb_stockmap.create({
                            materiel_id: scrap_materiel_id,
                            warehouse_id,
                            warehouse_zone_id,
                            domain_id,
                            current_amount: dismantle_number * scrap_number
                        }, {
                            validate: true,
                            transaction
                        });
                    }
                }
            }

            dismantleMateriel.dismantle_state = 2;
            dismantleMateriel.complete_date = new Date();
            await dismantleMateriel.save({
                validate: true,
                transaction
            });
        } else {
            return common.sendError(res, '', `无法取得报废拆解单`);
        }
    });
};
