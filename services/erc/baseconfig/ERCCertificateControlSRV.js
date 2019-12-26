const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const model = require('../../../model');
const TaskListControlSRV = require('./ERCTaskListControlSRV');

const sequelize = model.sequelize;
const tb_certificate = model.erc_certificate;
const tb_certificate_use = model.erc_certificate_use;
const tb_uploadfile = model.erc_uploadfile;


exports.ERCCertificateControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'add') {
        addAct(req, res);
    } else if (method === 'delete') {
        deleteAct(req, res);
    } else if (method === 'modify') {
        modifyAct(req, res);
    } else if (method === 'upload') {
        uploadAct(req, res);
    } else if (method === 'update_file') {
        updateFileAct(req, res);
    } else if (method === 'delete_file') {
        deleteFileAct(req, res);
    } else if (method === 'removeFile') {
        removeFileAct(req, res);
    } else {
        return common.sendError(res, 'common_01');
    }
}

async function  initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        returnData.certificateType = GLBConfig.CERTIFICATETYPE;
        returnData.certificateState = GLBConfig.CERTIFICATESTATE;
        returnData.certificateIsPublic = GLBConfig.CERTIFICATEISPUBLIC;
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

        let certificate_id = await save(req, res, doc, false);
        let returnData = await getData(req, res, true, {certificate_id: certificate_id});

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let certificate = await tb_certificate.findOne({
            where: {
                domain_id: user.domain_id,
                certificate_id: doc.certificate_id,
                state: GLBConfig.ENABLE
            }
        });

        if (!certificate) {
            return common.sendError(res, 'certificate_01');
        }
        if (certificate.certificate_state == 2) {
            return common.sendError(res, 'certificate_02');
        }
        
        certificate.state = GLBConfig.DISABLE;
        await certificate.save();
        
        return common.sendData(res, certificate);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body).new;
        let user = req.user;

        let check = await tb_certificate.findOne({
            where: {
                domain_id: user.domain_id,
                certificate_id: doc.certificate_id,
                state: GLBConfig.ENABLE
            }
        });

        if (!check) {
            return common.sendError(res, 'certificate_01');
        }

        let certificate_id = await save(req, res, doc, true);
        let returnData = await getData(req, res, true, {certificate_id: certificate_id});

        return common.sendData(res, returnData)


    } catch (error) {
        return common.sendData(res, error);
    }
}

async function save(req, res, doc, is_update) {
    let user = req.user;
    let certificate = {};
    let data = {};
    let returnData = {};
    let certificate_id = '';

    data.domain_id = user.domain_id;
    data.user_id = user.user_id;
    data.certificate_number = doc.certificate_number;
    data.certificate_name = doc.certificate_name;
    data.certificate_type = doc.certificate_type;
    data.organization = doc.organization;
    data.validity_start = doc.validity_start;
    data.validity_end = doc.validity_end;
    data.inspect_date = doc.inspect_date;
    data.attachment = doc.attachment;
    data.keeper = doc.keeper;
    data.ground_acreage = doc.ground_acreage;
    data.build_acreage = doc.build_acreage;
    data.is_public = doc.is_public;

    if (is_update == false) {
        data.certificate_state = 1;

        certificate = await tb_certificate.create(data);
        certificate_id = certificate.certificate_id;
    } else {
        await tb_certificate.update(data,{
            where: {
                certificate_id: doc.certificate_id
            }});
        certificate_id = doc.certificate_id;
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
                srv_id: certificate_id,
                file_creator: user.name,
                srv_type: '202'
            })
        }
    }

    return certificate_id;


}

//上传附件
async function uploadAct(req, res) {
    try {
        let fileInfo = await common.fileSave(req);
        let fileUrl = await common.fileMove(fileInfo.url, 'upload');
        fileInfo.url = fileUrl;
        common.sendData(res, fileInfo)
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}

async function getData(req, res, is_single, doc) {
    let user = req.user;
    let replacements = [];

    let queryStr = 'select c.*, k.name as keeper_name, c.certificate_id as id, c.certificate_id as value, c.certificate_name as text' +
        ' from tbl_erc_certificate c' +
        ' left join tbl_common_user k on k.user_id = c.keeper' +
        ' where c.state = 1 and c.domain_id = ?';

    replacements.push(user.domain_id);

    if (doc.certificate_id) {
        queryStr += ' and c.certificate_id = ?';
        replacements.push(doc.certificate_id);
    }
    if (doc.search_type == 1) {
        queryStr += ' and c.user_id = ?';
        replacements.push(user.user_id);
    }
    if (doc.search_text) {
        queryStr += ' and (c.certificate_number like ? or c.certificate_name like ?)';
        replacements.push('%' + doc.search_text + '%');
        replacements.push('%' + doc.search_text + '%');
    }
    queryStr += ' order by c.created_at';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.validity_start = r.validity_start ? r.validity_start.Format('yyyy-MM-dd') : null;
        r.validity_end = r.validity_end ? r.validity_end.Format('yyyy-MM-dd') : null;
        r.inspect_date = r.inspect_date ? r.inspect_date.Format('yyyy-MM-dd') : null;

        r.files = await tb_uploadfile.findAll({
            where: {
                api_name: common.getApiName(req.path),
                srv_id: r.certificate_id,
                srv_type: '202',
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