const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const model = require('../../../model');
const sequelize = model.sequelize;
const tb_archiveshand = model.erc_archiveshand;

exports.ERCArchivesHandControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'add') {
        addAct(req, res);
    } else if (method === 'delete') {
        deleteAct(req, res);
    } else {
        return common.sendError(res, 'common_01');
    }
}

async function initAct(req, res) {
    try {
        let returnData = {};
        let user = req.user;

        returnData.archivesHandState = GLBConfig.ARCHIVESHANDSTATE;
        returnData.archivesHandType = await global.getBaseTypeInfo(user.domain_id, 'DALX');
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

async function getData(req, res, is_single, doc) {
    let user = req.user;
    let replacements = [];

    let queryStr = 'select ah.*, department_keeper.name as department_keeper_name, domain_keeper.name as domain_keeper_name, ah.archiveshand_id as id, ah.archiveshand_id as value, ah.archiveshand_name as text' +
        ' from tbl_erc_archiveshand ah' +
        ' left join tbl_common_user department_keeper on department_keeper.user_id = ah.department_keeper' +
        ' left join tbl_common_user domain_keeper on domain_keeper.user_id = ah.domain_keeper' +
        ' where ah.state = 1 and ah.domain_id = ?';

    replacements.push(user.domain_id);

    if (doc.archiveshand_id) {
        queryStr += ' and ah.archiveshand_id = ?';
        replacements.push(doc.archiveshand_id);
    }
    if (doc.archiveshand_type) {
        queryStr += ' and ah.archiveshand_type = ?';
        replacements.push(doc.archiveshand_type);
    }
    if (doc.search_text) {
        queryStr += ' and ah.archiveshand_name like ?';
        replacements.push('%' + doc.search_text + '%');
    }
    if (doc.search_type == 1) {
        queryStr += ' and ah.user_id = ?';
        replacements.push(user.user_id);
    }
    queryStr += ' order by ah.created_at desc';
    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.place_date = r.place_date ? r.place_date.Format('yyyy-MM-dd') : null;
    }

    if (is_single == true) {
        return result.data[0];
    } else {
        return result
    }

}

async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

        let archiveshand_id = await save(req, res, doc, false);
        let returnData = await getData(req, res, true, {archiveshand_id: archiveshand_id});

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function save(req, res, doc, is_update) {
    let user = req.user;
    let data = {};

    data.domain_id = user.domain_id;
    data.user_id = user.user_id;
    data.archiveshand_type = doc.archiveshand_type;
    data.archiveshand_name = doc.archiveshand_name;
    data.department_keeper = doc.department_keeper;
    data.domain_keeper = doc.domain_keeper;
    data.archiveshand_state = 1;
    data.place_date = doc.place_date;

    if (is_update == false) {
        let archivesHand = await tb_archiveshand.create(data);
        return archivesHand.archiveshand_id;
    } else {
        await tb_archiveshand.update(data, {
            where: {
                archiveshand_id: doc.archiveshand_id
            }
        })
        return doc.archiveshand_id;
    }

}

async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let archivesHand = await tb_archiveshand.findOne({
            where: {
                domain_id: user.domain_id,
                archiveshand_id: doc.archiveshand_id,
                state: GLBConfig.ENABLE
            }
        });

        if (!archivesHand) {
            return common.sendError(res, 'common_api_02');
        }

        archivesHand.state = GLBConfig.DISABLE;
        await archivesHand.save();

        return common.sendData(res, archivesHand);
    } catch(error) {
        return common.sendFault(res, error);
    }
}