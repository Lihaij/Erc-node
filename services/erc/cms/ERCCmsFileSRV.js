/**
 * Created by Zhang Jizhe on 2018/4/27.
 */
const logger = require('../../../util/Logger').createLogger('ERCCmsSRV');
const GLBConfig = require('../../../util/GLBConfig');
let Promise = require('bluebird');
let mongoose = require('./ERCCmsModels').getMongo();
const common = require('../../../util/CommonUtil');
let fs = require('fs');
let Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
let conn = mongoose.connection;
let gfs = null;
let multiparty = require('multiparty');
conn.once('open', function () {
    gfs = Grid(conn.db);
});
let typeEntity = require('./ERCCmsModels').TypeEntity;
let typeModel = mongoose.model('cms_type', typeEntity);
let contentEntity = require('./ERCCmsModels').ContentEntity;
let contentModel = mongoose.model('cms_content', contentEntity);


exports.ERCCmsFileResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    }
    else if (method === 'upload_f') {
        uploadFile(req, res)
    } else if (method === 'get_f') {
        getFile(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};
async function initAct(req, res) {
    try {

        let returnData = {};
        returnData.content_type_one = GLBConfig.CONTENT_TYPE_ONE;//一级类别

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//更新文件
let uploadFile = async(req, res) => {
    try {
        let fileObj = await _doUploadFile(req);
        common.sendData(res, fileObj);
    } catch (error) {
        logger.error(error);
        common.sendFault(res, error);
    }
};
//更新文件方法
let _doUploadFile = async(req)=> {
    return new Promise(function (resolve, reject) {
        let form = new multiparty.Form();
        form.parse(req, function (err, fields, files) {
            if (err) {
                logger.error(err);
                throw new Error(err);
            }
            let file = files.file[0];
            let params = req.body;
            createFile(file, params).then(function (result) {
                resolve(result);
            }).catch(function (error) {
                logger.error(error);
                return reject(error);
            });
        });
    });
};
//获得文件
let getFile = async(req, res)=> {
    let params = req.query;
    let fileInfo = await getFileInfo(params);
    let fileStream = await readFile(params);
    res.set('content-type', fileInfo.contentType);
    res.set('etag', fileInfo.md5);
    res.set('content-length', fileInfo.length);
    res.set('Content-Disposition', 'attachment; filename=' + encodeURI(fileInfo.filename));
    res.writeHead(200);
    fileStream.pipe(res);
    fileStream.on('error', function (error) {
        logger.error(error);
        return common.sendFault(res, error);
    });
    fileStream.on('close', function () {
        logger.info(' getFile ' + params.fileId + ' success');
        return;
    });
};
//创建文件
let createFile = (file, metaData)=> {
    return new Promise(function (resolve, reject) {
        var writeOptions = {
            filename: file.name,
            content_type: file.type
        };
        if (metaData != null && metaData != {}) {
            writeOptions.metadata = metaData;
        }
        var writestream = gfs.createWriteStream(writeOptions);
        var errorFlag = false;
        var readStream = fs.createReadStream(file.path);
        readStream.pipe(writestream);
        readStream.on('error', function (err) {
            errorFlag = true;
            logger.error(err);
            reject(err);
        });
        readStream.on('close', function (error) {
            logger.debug('createFile read stream close');
            if (!errorFlag) fs.unlink(file.path);
        });
        writestream.on('close', function (file) {
            logger.debug('createFile write stream close');
            resolve(file)
        });
    });
};
//获取文件信息
let getFileInfo = (params)=> {
    return new Promise(function (resolve, reject) {
        logger.debug(params.fileId);
        gfs.findOne({_id: params.fileId.toString()}, function (err, file) {
            logger.debug('getFileInfo');
            if (err) return reject(err);
            resolve(file);
        });
    });
};
//读取文件
let readFile = (params)=> {
    return new Promise(function (resolve, reject) {
        var readStream = gfs.createReadStream({
            _id: params.fileId
        });
        resolve(readStream);
    });
};