const fs = require('fs');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCSupplierMaterielControl');
const task = require('../baseconfig/ERCTaskListControlSRV');
const model = require('../../../model');
const moment = require('moment');

// tables
const sequelize = model.sequelize;
const tb_warehouse = model.erc_warehouse;
const tb_materiel = model.erc_materiel;
const tb_scrap_materiel = model.erc_scrap_materiel;

exports.ERCScrapMaterielControlResource = async (req, res) => {
    const method = req.query.method;
    if (method === 'initScrapData') {
        await initScrapData(req, res);
    } else if (method === 'getScrapMateriel') {
        await getScrapMateriel(req, res);
    } else if (method === 'getWasteProduct') {
        await getWasteProduct(req, res);
    } else if (method === 'getScrapMaterielSetting') {
        await getScrapMaterielSetting(req, res);
    } else if (method === 'addScrapMaterielSetting') {
        await addScrapMaterielSetting(req, res);
    } else if (method === 'modifyScrapMaterielSetting') {
        await modifyScrapMaterielSetting(req, res);
    } else if (method === 'deleteScrapMaterielSetting') {
        await deleteScrapMaterielSetting(req, res);
    } else {
        common.sendError(res, 'common_01');
    }
};

//初始化数据
async function initScrapData(req, res) {
    const { user } = req;

    try {
        const { domain_id } = user;
        let returnData = {
            invalidateorderState: GLBConfig.INVALIDATEORDERSTATE,//报废单状态
            stockModelInfo: GLBConfig.MATERIELMANAGE,
            reasonInfo: GLBConfig.INVALIDATEORDERREASON, //报废原因
            materielStateManagement: GLBConfig.MATERIELSTATEMANAGEMENT,
        };
        returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW');

        returnData.wareHouseInfo = await tb_warehouse.findAll({
            where: {
                domain_id,
                warehouse_type: 5,
                state: GLBConfig.ENABLE
            }
        });

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error)
    }
}

async function getScrapMateriel(req, res) {
    const { body, user } = req;

    try {
        const { search_text } = body;
        const { domain_id } = user;

        let queryStr =
            `select
                mat.materiel_id, mat.materiel_code, mat.materiel_name, mat.materiel_format, mat.materiel_unit
                , wh.warehouse_name, wh.warehouse_type
                , sm.stockmap_id, sm.current_amount
                from tbl_erc_stockmap sm
                left join tbl_erc_materiel mat
                on sm.materiel_id = mat.materiel_id
                left join tbl_erc_warehouse wh
                on sm.warehouse_id = wh.warehouse_id
                where true
                and sm.domain_id = ?
                and mat.materiel_state_management != 9
                and wh.warehouse_type = 5`;

        const replacements = [ domain_id ];

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

async function getWasteProduct(req, res) {
    const { body, user } = req;

    try {
        const { search_text } = body;
        const { domain_id } = user;

        let queryStr =
            `select
                sm.stockmap_id, sm.current_amount
                , mat.materiel_id, mat.materiel_code, mat.materiel_name, mat.materiel_format, mat.materiel_unit
                from tbl_erc_stockmap sm
                left join tbl_erc_materiel mat
                on sm.materiel_id = mat.materiel_id
                where true
                and sm.domain_id = ?
                and mat.materiel_state_management = ?`;

        const replacements = [ domain_id, 9 ];

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

async function getScrapMaterielSetting(req, res) {
    const { body, user } = req;

    try {
        const { materiel_id, search_text } = body;
        const { domain_id } = user;

        let queryStr =
            `select
                smt.scrap_setting_id, smt.scrap_number
                , mat.materiel_code, mat.materiel_name, mat.materiel_format, mat.materiel_unit
                from tbl_erc_scrap_materiel smt
                left join tbl_erc_materiel mat
                on smt.scrap_materiel_id = mat.materiel_id
                where true
                and smt.domain_id = ?`;

        const replacements = [ domain_id ];

        if (materiel_id) {
            queryStr += ` and smt.materiel_id = ?`;
            replacements.push(materiel_id);
        }

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

async function addScrapMaterielSetting(req, res) {
    const { body, user } = req;

    try {
        const { materiel_id, materielArray } = body;
        const { domain_id } = user;

        await sequelize.transaction(async (transaction) => {
            for (const scrap_materiel_id of materielArray) {
                const scrapMateriel = await tb_scrap_materiel.findOne({
                    where: {
                        domain_id,
                        materiel_id,
                        scrap_materiel_id
                    }
                });

                if (!scrapMateriel) {
                    await tb_scrap_materiel.create({
                        domain_id,
                        materiel_id,
                        scrap_materiel_id
                    }, {
                        validate: true,
                        transaction
                    });
                } else {
                    const materielResult = await tb_materiel.findOne({
                        where: {
                            materiel_id: scrap_materiel_id
                        }
                    });
                    const { materiel_name } = materielResult;
                    return common.sendError(res, '', `${materiel_name}已存在`);
                }
            }
        });

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function modifyScrapMaterielSetting(req, res) {
    const { body } = req;

    try {
        const { scrap_setting_id, scrap_number } = body.new;

        const scrapMateriel = await tb_scrap_materiel.findOne({
            where: {
                scrap_setting_id
            }
        });

        if (scrapMateriel) {
            scrapMateriel.scrap_number = scrap_number;
            await scrapMateriel.save();
        }

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function deleteScrapMaterielSetting(req, res) {
    const { body } = req;

    try {
        const { scrap_setting_id } = body;

        await tb_scrap_materiel.destroy({
            where: {
                scrap_setting_id
            }
        });

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
}
