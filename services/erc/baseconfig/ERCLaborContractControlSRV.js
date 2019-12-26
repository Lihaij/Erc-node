const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const model = require('../../../model');
const TaskListControlSRV = require('./ERCTaskListControlSRV');

const sequelize = model.sequelize;
const tb_laborcontract = model.erc_laborcontract;
const tb_uploadfile = model.erc_uploadfile;

exports.ERCLaborContractControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'add') {
        addAct(req, res);
    } else if (method === 'modify') {
        modifyAct(req, res);
    } else if (method === 'upload') {
        uploadAct(req, res);
    } else if (method === 'delete') {
        deleteAct(req, res);
    } else if (method === 'removeFile') {
        removeFileAct(req, res);
    } else if (method === 'getDepartment') {
        getDepartment(req, res);
    } else {
        return common.sendError(res, 'common_01');
    }
}

async function initAct(req, res) {
    try {
        let returnData = {};
        let user = req.user;

        let sql = 'select t.department_id as id, t.department_name as text from tbl_erc_department t where state = 1 and domain_id = ' + user.domain_id;
        let department = await sequelize.query(sql, {
            replacements: [],
            type: sequelize.QueryTypes.SELECT,
            state: GLBConfig.ENABLE
        })

        returnData.LABORCONTRACTSTATE = GLBConfig.LABORCONTRACTSTATE;
        returnData.department = department;


        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
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

        let laborcontract_id = await save(req, res, doc, false);
        let returnData = await getData(req, res, true, {laborcontract_id: laborcontract_id});


        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body).new;
        let user = req.user;

        let check = await tb_laborcontract.findOne({
            where: {
                domain_id: user.domain_id,
                laborcontract_id: doc.laborcontract_id,
                state: GLBConfig.ENABLE
            }
        });
        if (!check) {
            return common.sendError(res, 'common_api_02')
        }

        let laborcontract_id = await save(req, res, doc, true);
        let returnData = await getData(req, res, true, {laborcontract_id: laborcontract_id});

        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function uploadAct(req, res) {
    try {
        let fileInfo = await common.fileSave(req);
        let fileUrl = await common.fileMove(fileInfo.url, 'upload');
        fileInfo.url = fileUrl;
        common.sendData(res, fileInfo)
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let laborcontract = await tb_laborcontract.findOne({
            where: {
                domain_id: user.domain_id,
                laborcontract_id: doc.laborcontract_id,
                state: GLBConfig.ENABLE
            }
        });

        if (!laborcontract) {
            return common.sendError(res, 'common_api_02')
        }

        laborcontract.state = GLBConfig.DISABLE;
        await laborcontract.save();

        return common.sendData(res, laborcontract);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function save(req, res, doc, is_update) {
    let user = req.user;
    let laborcontract = {};
    let data = {};
    let returnData = {};
    let laborcontract_id = '';

    data.domain_id = user.domain_id;
    data.user_id = doc.user_id;
    data.department_id = doc.department_id;
    data.laborcontract_number = doc.laborcontract_number;
    data.start_date = doc.start_date;
    data.end_date = doc.end_date;
    data.operator_id = user.user_id;
    data.laborcontract_state = doc.laborcontract_state;

    if (is_update == false) {

        laborcontract = await tb_laborcontract.create(data);
        laborcontract_id = laborcontract.laborcontract_id;
    } else {
        await tb_laborcontract.update(data, {
            where: {
                laborcontract_id: doc.laborcontract_id
            }
        });
        laborcontract_id = doc.laborcontract_id;
    }

    if (doc.files != null && doc.files.length > 0) {
        for (let file of doc.files) {
            let addFile = await tb_uploadfile.create({
                api_name: common.getApiName(req.path),
                file_name: file.file_name,
                file_url: file.file_url,
                file_type: file.file_type,
                file_visible: '1',
                state: GLBConfig.ENABLE,
                srv_id: laborcontract_id,
                file_creator: user.name,
                srv_type: '205'
            })
        }
    }

    return laborcontract_id;
}

async function getData(req, res, is_single, doc) {
    let user = req.user;
    let replacements = [];

    let queryStr = 'select l.*, u.name as user_name, o.name as operator_name, d.department_name' +
        ' from tbl_erc_laborcontract l' +
        ' left join tbl_common_user u on u.user_id = l.user_id' +
        ' left join tbl_common_user o on o.user_id = l.operator_id' +
        ' left join tbl_erc_department d on d.department_id = l.department_id' +
        ' where l.state = 1 and l.domain_id = ?';
    replacements.push(user.domain_id);

    if (doc.laborcontract_id) {
        queryStr += ' and l.laborcontract_id = ?';
        replacements.push(doc.laborcontract_id);
    }
    if (doc.search_type == 1) {
        queryStr += ' and l.operator_id = ?';
        replacements.push(user.user_id);
    }
    if (doc.search_text) {
        queryStr += ' and (u.user_id like ? or u.name like ?)';
        replacements.push('%' + doc.search_text + '%');
        replacements.push('%' + doc.search_text + '%');
    }
    if (doc.user_id) {
        queryStr += ' and l.user_id = ?';
        replacements.push(doc.user_id);
    }
    if (doc.department_id) {
        queryStr += ' and l.department_id = ?';
        replacements.push(doc.department_id);
    }
    queryStr += ' order by l.created_at';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.start_date = r.start_date ? r.start_date.Format('yyyy-MM-dd') : null;
        r.end_date = r.end_date ? r.end_date.Format('yyyy-MM-dd') : null;
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;

        r.files = await tb_uploadfile.findAll({
            where: {
                api_name: common.getApiName(req.path),
                srv_id: r.laborcontract_id,
                srv_type: '205',
                state: GLBConfig.ENABLE
            }
        });
    }

    if (is_single == true) {
        return result.data[0];
    } else {
        return result;
    }
}

//删除附件
let removeFileAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);

        let uploadfiles = await tb_uploadfile.findAll({
            where: {
                file_id: doc.file_id,
                state: GLBConfig.ENABLE
            }
        });
        for (let file of uploadfiles) {
            file.state = GLBConfig.DISABLE
            await file.save();
        }

        common.sendData(res);
    } catch (error) {
        logger.error('ERCConsumablesControlResource-removeFileAct:' + error);
        common.sendFault(res, error);
        return
    }
};

let getDepartment = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user_id = doc.user_id;
        let returnData = {};
        let replacements = [];

        if (!user_id) {
            return common.sendError(res, 'api_common_02');
        }

        let sql = 'select d.department_id, d.department_name' +
            ' from tbl_common_user u' +
            ' inner join tbl_erc_custorgstructure c on c.user_id = u.user_id' +
            ' inner join tbl_erc_department d on d.department_id = c.department_id' +
            ' where u.user_id = ?';
        replacements.push(user_id);

        let result = await common.queryWithCount(sequelize, req, sql, replacements);
        returnData.department_id = result.data[0].department_id;
        returnData.department_name = result.data[0].department_name;

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
}