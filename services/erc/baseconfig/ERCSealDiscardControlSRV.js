const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCDepartmentControlSRV');
const model = require('../../../model');
const moment = require('moment');
const TaskListControlSRV = require('./ERCTaskListControlSRV');


const sequelize = model.sequelize;
const tb_sealcreate = model.erc_sealcreate;
const tb_sealdiscard = model.erc_sealdiscard;
const tb_user = model.common_user;
const tb_usergroup = model.common_usergroup;
const tb_position = model.erc_position;

exports.ERCSealDiscardControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'delete') {
        deleteAct(req, res)
    } else {
        return common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        returnData.sealDiscardState = GLBConfig.SEALDISCARDSTATE;
        returnData.sealCreateType = GLBConfig.SEALCREATETYPE;
        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function getData(req, res, is_single, doc){
    let user = req.user;
    let replacements = [];

    let queryStr = 'select c.sealcreate_id, c.sealcreate_name, c.sealcreate_type, c.purpose, u.name as user_name, d.created_at, c.material, c.content, k.name as keeper_name, h.name as checker_name, d.sealdiscard_state, d.sealdiscard_id' +
        ' from tbl_erc_sealdiscard d' +
        ' inner join tbl_erc_sealcreate c on c.sealcreate_id = d.sealcreate_id' +
        ' inner join tbl_common_user u on u.user_id = d.user_id' +
        ' left join tbl_common_user k on k.user_id = c.keeper' +
        ' left join tbl_common_user h on h.user_id = d.checker_id' +
        ' where d.state = 1 and d.domain_id = ?';

    replacements.push(user.domain_id);

    if (doc.search_type == 1) {
        queryStr += ' and d.user_id = ?';
        replacements.push(user.user_id);
    }
    if (doc.search_text) {
        queryStr += ' and c.sealcreate_name like ?';
        replacements.push(doc.search_text);
    }

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
    }

    if (is_single == true) {
        return result.data[0];
    } else {
        return result;
    }
}

async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};

        let result = await getData(req, res, false, doc);

        returnData.total = result.count;
        returnData.rows = result.data;

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let sealCreate = await tb_sealcreate.findOne({
            where: {
                sealcreate_id:doc.sealcreate_id
            }
        });

        if (sealCreate.is_borrow == 1) {
            return common.sendError(res, 'sealdiscard_01');
        }

        if (sealCreate.is_discard == 1) {
            return common.sendError(res, 'sealdiscard_02');
        }

        let sealDiscardCheck = await tb_sealdiscard.findOne({
            where: {
                sealcreate_id: doc.sealcreate_id,
                sealdiscard_state: 1,
                state: GLBConfig.ENABLE
            }
        })
        if (sealDiscardCheck) {
            return common.sendError(res, 'sealdiscard_03');
        }

        let sealDiscard = await tb_sealdiscard.create({
            domain_id: user.domain_id,
            user_id: user.user_id,
            sealcreate_id: doc.sealcreate_id,
            sealdiscard_state: 1
        })

        let groupID = common.getUUIDByTime(30);
        let description = user.name + '申请报废印章' + sealCreate.sealcreate_name;
        await TaskListControlSRV.createTask(user, '印章报废审核', '204',sealCreate.keeper, sealDiscard.sealdiscard_id, description, '', groupID);

        let returnData = await getData(req, res, true, {sealdiscard_id: sealDiscard.sealdiscard_id});

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modSealDiscard = await tb_sealdiscard.findOne({
            where: {
                sealdiscard_id: doc.sealdiscard_id
            }
        });
        if (!modSealDiscard) {
            return common.sendError(res, 'sealdiscard_04');
        }
        if (modSealDiscard.sealdiscard_state != 1) {
            return common.sendError(res, 'sealcreate_02');
        }
        modSealDiscard.state = GLBConfig.DISABLE;
        await modSealDiscard.save();

        return common.sendData(res, modSealDiscard);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function modifyDiscardState(applyState, description, sealdiscard_id, applyApprover) {
    try {
        let modSealDiscard = await tb_sealdiscard.findOne({
            where: {
                sealdiscard_id: sealdiscard_id
            }
        })
        if (modSealDiscard && modSealDiscard.sealdiscard_state == 1) {
            await tb_sealdiscard.update({
                sealdiscard_state: applyState,
                checker_id: applyApprover,
                check_date: new Date(),
                refuse_remark: description
            }, {
                where: {
                    sealdiscard_id: sealdiscard_id
                }
            });

            await tb_sealcreate.update({
                is_discard: 1
            }, {
                where: {
                    sealcreate_id: modSealDiscard.sealcreate_id
                }
            })
        }

    } catch (error) {
        throw error
    }
}


exports.modifyDiscardState = modifyDiscardState;
