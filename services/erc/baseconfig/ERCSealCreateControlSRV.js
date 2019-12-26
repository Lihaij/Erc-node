const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCDepartmentControlSRV');
const model = require('../../../model');
const moment = require('moment');
const TaskListControlSRV = require('./ERCTaskListControlSRV');


const sequelize = model.sequelize;
const tb_sealcreate = model.erc_sealcreate;
const tb_user = model.common_user;
const tb_usergroup = model.common_usergroup;
const tb_position = model.erc_position;

exports.ERCSealCreateControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'delete') {
        deleteAct(req, res)
    } else if (method === 'finish') {
        finishAct(req, res)
    } else {
        return common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        returnData.sealCreateType = GLBConfig.SEALCREATETYPE;
        returnData.sealCreateState = GLBConfig.SEALCREATESTATE;
        returnData.sealCreateIsFinish = GLBConfig.SEALCREATEISFINISH;
        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
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

        let addSealCreate = await tb_sealcreate.create({
            domain_id: user.domain_id,
            sealcreate_name: doc.sealcreate_name,
            sealcreate_type: doc.sealcreate_type,
            sealcreate_state: '1',
            purpose: doc.purpose,
            user_id: user.user_id,
            material: doc.material,
            content: doc.content,
            keeper: doc.keeper,
            use_range: doc.use_range,
            is_finish: 0,
            is_discard: 0,
            is_borrow: 0
        });
        let groupID = common.getUUIDByTime(30);
        let description = user.name + '申请刻印印章' + addSealCreate.sealcreate_name;
        await TaskListControlSRV.createTask(user, '印章刻印审核', '201','', addSealCreate.sealcreate_id, description, '', groupID);

        let returnData = await getData(req, res, true, {sealcreate_id: addSealCreate.sealcreate_id});
        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modSealCreate = await tb_sealcreate.findOne({
            where: {
                sealcreate_id: doc.sealcreate_id
            }
        });
        if (!modSealCreate) {
            return common.sendError(res, 'sealcreate_01');
        }
        if (modSealCreate.sealcreate_state != 1) {
            return common.sendError(res, 'sealcreate_02');
        }
        modSealCreate.state = GLBConfig.DISABLE;
        await modSealCreate.save();

        return common.sendData(res, modSealCreate);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function modifyCreateState(applyState, description, sealcreate_id, applyApprover) {
    try {
        let modSealCreate = await tb_sealcreate.findOne({
            where: {
                sealcreate_id: sealcreate_id
            }
        })
        if (modSealCreate && modSealCreate.sealcreate_state == 1) {
            await tb_sealcreate.update({
                sealcreate_state: applyState,
                checker_id: applyApprover,
                check_date: new Date(),
                refuse_remark: description
            }, {
                where: {
                    sealcreate_id:sealcreate_id
                }
            });
        }

    } catch (error) {
        throw error
    }
}

async function finishAct(req, res){
    try {
        let doc = common.docTrim(req.body);
        let sealCreate = await tb_sealcreate.findOne({
            where: {
                sealcreate_id: doc.sealcreate_id,
                state: GLBConfig.ENABLE
            }
        });
        if (sealCreate.sealcreate_state != 2) {
            return common.sendError(res, 'sealcreate_03');
        }
        if (sealCreate.is_finish == 1) {
            return common.sendError(res, 'sealcreate_04');
        }
        sealCreate.is_finish = 1;
        await sealCreate.save();
        return common.sendData(res, sealCreate);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function getData(req, res, is_single, doc){
    let user = req.user;
    let replacements = [];

    let queryStr = 'select tbl_erc_sealcreate.*, tbl_common_user.name as user_name, keeper.name as keeper_name, checker.name as checker_name, tbl_erc_sealcreate.sealcreate_id as id,tbl_erc_sealcreate.sealcreate_id as value, tbl_erc_sealcreate.sealcreate_name as text' +
        ' from tbl_erc_sealcreate' +
        ' inner join tbl_common_user on tbl_common_user.user_id = tbl_erc_sealcreate.user_id' +
        ' left join tbl_common_user keeper on keeper.user_id = tbl_erc_sealcreate.keeper' +
        ' left join tbl_common_user checker on checker.user_id = tbl_erc_sealcreate.checker_id' +
        ' where tbl_erc_sealcreate.state = 1 and tbl_erc_sealcreate.domain_id = ?';

    replacements.push(user.domain_id);

    if (doc.sealcreate_id) {
        queryStr += ' and tbl_erc_sealcreate.sealcreate_id = ?';
        replacements.push(doc.sealcreate_id);
    }
    if (doc.search_text) {
        queryStr += ' and sealcreate_name like ?';
        replacements.push('%' + doc.search_text + '%');
    }
    if (doc.search_type) {
        if (doc.search_type == 'use_add') {
            queryStr += ' and tbl_erc_sealcreate.sealcreate_state = 2 and tbl_erc_sealcreate.is_discard = 0 and tbl_erc_sealcreate.is_finish = 1'
        } else if (doc.search_type == 'discard_add') {
            queryStr += ' and tbl_erc_sealcreate.sealcreate_state = 2 and tbl_erc_sealcreate.is_discard = 0 and tbl_erc_sealcreate.is_finish = 1 and tbl_erc_sealcreate.is_borrow = 0'
        } else if (doc.search_type == 'finish') {
            queryStr += ' and tbl_erc_sealcreate.sealcreate_state = 2 and tbl_erc_sealcreate.is_discard = 0 and tbl_erc_sealcreate.is_finish = 1'
        } else if (doc.search_type == 'creating') {
            queryStr += ' and tbl_erc_sealcreate.sealcreate_state = 2 and tbl_erc_sealcreate.is_finish <> 1'
        } else if (doc.search_type == 'discard') {
            queryStr +=' and tbl_erc_sealcreate.is_discard = 1';
        }

    } else {
        queryStr += ' and tbl_erc_sealcreate.user_id = ?';
        replacements.push(user.user_id);
    }

    queryStr += ' order by tbl_erc_sealcreate.created_at desc';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r. check_date = r.check_date ? r.check_date.Format('yyyy-MM-dd') : null;
    }

    if (is_single == true) {
        return result.data[0];
    } else {
        return result;
    }
}


exports.modifyCreateState = modifyCreateState;
