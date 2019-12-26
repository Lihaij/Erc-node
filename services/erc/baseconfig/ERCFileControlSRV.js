const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const model = require('../../../model');

const tb_uploadfile = model.erc_uploadfile;

exports.ERCFileControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'upload') {
        uploadAct(req, res);
    } else if (method === 'delete') {
        deleteFileAct(req, res);
    } else {
        common.sendError(res, 'common_01');
    }
}

//上传
async function uploadAct(req, res) {
    try {
        let fileInfo = await common.fileSave(req);
        common.sendData(res, fileInfo)
    } catch (error) {
        common.sendFault(res, error);
    }
}

//删除
async function deleteFileAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

        let uploadFile = await tb_uploadfile.findOne({
            where: {
                file_id: doc.file_id,
                state: GLBConfig.ENABLE
            }
        });

        uploadFile.state = GLBConfig.DISABLE;
        await uploadFile.save();

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
}