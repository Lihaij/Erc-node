/**
 * Created by Zhang Jizhe on 2018/4/19.
 */
const logger = require('../../../util/Logger').createLogger('ERCCmsSRV');
const moment = require('moment');
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

const model = require('../../../model');
const tb_usercollection = model.erc_usercollection;



exports.ERCCmsResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'add_t') {
        addCmsType(req, res);
    } else if (method === 'update_t') {
        updateCmsType(req, res)
    } else if (method === 'get_t') {
        getCmsType(req, res)
    } else if (method === 'add_c') {
        addCmsContent(req, res)
    } else if (method === 'update_c') {
        updateCmsContent(req, res)
    } else if (method === 'get_c') {
        getCmsContent(req, res)
    } else if (method === 'update_cbyt') {
        updateCmsContentByType(req, res);
    } else if (method === 'upload_f') {
        uploadFile(req, res)
    } else if (method === 'get_f') {
        getFile(req, res)
    } else if (method==='updateCmsHits'){
        updateCmsHits(req,res)
    } else {
        common.sendError(res, 'common_01')
    }
};
async function initAct(req, res) {
    try {

        let returnData = {};
        returnData.content_location_one = GLBConfig.CONTENT_LOCATION_ONE;//一级位置
        returnData.content_location_two = GLBConfig.CONTENT_LOCATION_TWO;//二级位置
        returnData.room_type = GLBConfig.ROOMTYPE;//空间类型

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//增加内容类型
let addCmsType = async(req, res) => {
    try {
        let params = common.docTrim(req.body);
        let typeObj = new typeModel({
            name: params.name,
            type: params.type,
            pt: params.pt,
            active: params.active || 1,
            status: params.status || 1,
            seq: params.seq || 0,
            pid: params.pid,
            updated_on: Date.now(),
            created_on: Date.now()
        });
        typeObj.save(function (error, result) {
            if (error) {
                logger.error(error);
                common.sendFault(res, error);
            }
            common.sendData(res, result);
        })
    } catch (error) {
        logger.error(error);
        common.sendFault(res, error);
    }

};
//更新内容管理类型
let updateCmsType = async(req, res)=> {
    try {
        let params = common.docTrim(req.body);
        typeModel.findByIdAndUpdate(params.typeId, {$set: params.typeInfo}, function (error, result) {
            if (error) {
                logger.error(error);
                common.sendFault(res, error);
            }
            common.sendData(res, result);
        })
    } catch (error) {
        logger.error(error);
        common.sendFault(res, error);
    }
};
//获得内容管理类型
let getCmsType = async(req, res)=> {
    try {
        let params = common.docTrim(req.body);
        let query = typeModel.find({}).select('_id name type active seq pid  pt status  updated_on created_on');
        query.where('status').equals(1);
        if (params.typeId) {
            query.where('_id').equals(params.typeId)
        }
        if (params.type) {
            query.where('type').equals(params.type)
        }
        if (params.pt) {
            query.where('pt').equals(params.pt)
        }
        if (params.active) {
            query.where('active').equals(params.active);
        }
        if (params.pid) {
            query.where('pid').equals(params.pid);
        }
        if (params.startDate) {
            query.where('created_on').gte(params.startDate);
        }
        if (params.endDate) {
            query.where('created_on').lte(params.endDate);
        }
        if (params.start && params.size) {
            query.skip(parseInt(params.start)).limit(parseInt(params.size));
        }
        let queryC = typeModel.find({}).select('_id name type active seq pid  pt status  updated_on created_on');
        queryC.where('status').equals(1);
        if (params.typeId) {
            queryC.where('_id').equals(params.typeId)
        }
        if (params.type) {
            queryC.where('type').equals(params.type)
        }
        if (params.pt) {
            queryC.where('pt').equals(params.pt)
        }
        if (params.active) {
            queryC.where('active').equals(params.active);
        }
        if (params.pid) {
            queryC.where('pid').equals(params.pid);
        }
        if (params.startDate) {
            queryC.where('created_on').gte(params.startDate);
        }
        if (params.endDate) {
            queryC.where('created_on').lte(params.endDate);
        }
        queryC.sort('-seq').count().exec(function (error, c) {
            if (error) {
                logger.error(error);
                return common.sendFault(res, error);
            }
            query.sort('-seq').exec(function (error, result) {
                if (error) {
                    logger.error(error);
                    common.sendFault(res, error);
                }
                common.sendData(res, {rows: result, total: c});
            });
        });
    } catch (error) {
        logger.error(error);
        common.sendFault(res, error);
    }
};

//增加内容管理信息
let addCmsContent = async(req, res)=> {
    try {
        let params = common.docTrim(req.body);
        let contentObj = new contentModel({
            type: params.type,
            title: params.title,
            content: params.content,
            biz_id: params.bizId,
            ip_info: params.ipInfo,
            abstract: params.abstract,
            author: params.author,
            addons: params.addons || [],
            icon: params.icon,
            pt: params.pt,
            ext1: params.ext1,
            seq: params.seq,
            top: params.top || 0,
            turn: params.turn || 0,
            parent_id:params.parentId,
            active: params.active || 1,
            status: params.status || 1,
            updated_on: Date.now(),
            created_on: Date.now(),
            completion_date:params.completionDate,
            roomType:params.roomType,
            jump_url:params.jump_url,
            hits:0
        });
        contentObj.save(function (error, result) {
            if (error) {
                logger.error(error);
                common.sendFault(res, error);
            }
            common.sendData(res, result);
        });
    } catch (error) {
        logger.error(error);
        common.sendFault(res, error);
    }
};
//更新内容管理信息
let updateCmsContent = async(req, res)=> {
    try {
        let params = common.docTrim(req.body);
        contentModel.findByIdAndUpdate(params.contentId, {$set: params.contentInfo}, function (error, result) {
            if (error) {
                logger.error(error);
                common.sendFault(res, error);
            }
            common.sendData(res, result);
        });
    } catch (error) {
        logger.error(error);
        common.sendFault(res, error);
    }
};

let updateCmsHits = async(req, res)=> {
    try {
        let params = common.docTrim(req.body);
        contentModel.findByIdAndUpdate(params.contentId, {$inc: {hits: 1}}, function (error, result) {
            if (error) {
                logger.error(error);
                common.sendFault(res, error);
            }
            common.sendData(res, result);
        });
    } catch (error) {
        logger.error(error);
        common.sendFault(res, error);
    }
};
///获得内容管理信息
let getCmsContent = async(req, res)=> {
    try {
        let params = common.docTrim(req.body);
        let queryC = contentModel.find({})
            .select('_id type biz_id abstract title content parent_id author icon ip_info seq ext1 addons active status top turn pt updated_on created_on completion_date roomType jump_url hits');
        queryC.where('status').equals(1);
        if (params.contentId) {
            queryC.where('_id').equals(params.contentId);
        }
        if (params.parentId) {
            queryC.where('parent_id').equals(params.parentId);
        }
        if (params.bizId != null) {
            queryC.where('biz_id').equals(params.bizId);
        }
        if (params.t1 != null) {
            queryC.elemMatch('type', {t1: params.t1});
        }
        if (params.t2 != null) {
            queryC.elemMatch('type', {t2: params.t2});
        }
        if (params.active) {
            queryC.where('active').equals(params.active);
        }
        if (params.author) {
            queryC.where({'author': new RegExp(params.author)});
        }
        if (params.abstract) {
            queryC.where({'abstract': new RegExp(params.abstract)});
        }
        if (params.title) {
            queryC.where({'title': new RegExp(params.title)});
        }
        if (params.top) {
            queryC.where('top').equals(params.top);
        }
        if (params.turn) {
            queryC.where('turn').equals(params.turn);
        }
        if (params.pt) {
            queryC.where('pt').equals(params.pt);
        }
        if (params.ext1) {
            queryC.where('ext1').equals(params.ext1);
        }

        if (params.titleKey) {
            var regString = new RegExp(params.titleKey);
            queryC.or([{title: regString}])
        }
        if (params.startDate) {
            queryC.where('created_on').gte(params.startDate);
        }
        if (params.endDate) {
            queryC.where('created_on').lte(params.endDate);
        }

        let query = contentModel.find({})
            .select('_id type biz_id abstract title content parent_id author icon ip_info seq ext1 addons active status top turn pt updated_on created_on completion_date roomType jump_url hits');
        query.where('status').equals(1);
        if (params.contentId) {
            query.where('_id').equals(params.contentId);
        }
        if (params.parentId) {
            query.where('parent_id').equals(params.parentId);
        }
        if (params.bizId != null) {
            query.where('biz_id').equals(params.bizId);
        }
        if (params.t1 != null) {
            query.elemMatch('type', {t1: params.t1});
        }
        if (params.t2 != null) {
            query.elemMatch('type', {t2: params.t2});
        }
        if (params.active) {
            query.where('active').equals(params.active);
        }
        if (params.top) {
            query.where('top').equals(params.top);
        }
        if (params.author) {
            query.where({'author': new RegExp(params.author)});
        }
        if (params.abstract) {
            query.where({'abstract': new RegExp(params.abstract)});
        }
        if (params.title) {
            query.where({'title': new RegExp(params.title)});
        }
        if (params.turn) {
            query.where('turn').equals(params.turn);
        }
        if (params.pt) {
            query.where('pt').equals(params.pt);
        }
        if (params.ext1) {
            query.where('ext1').equals(params.ext1);
        }
        if (params.titleKey) {
            query.or([{title: new RegExp(params.titleKey)}])
        }
        if (params.startDate) {
            query.where('created_on').gte(params.startDate);
        }
        if (params.endDate) {
            query.where('created_on').lte(params.endDate);
        }
        if (params.caseKeyWord) {
            query.or({'title': new RegExp(params.caseKeyWord)});
            query.or({'author': new RegExp(params.caseKeyWord)});
        }
        if (params.diaryKeyWord) {
            query.or({'title': new RegExp(params.diaryKeyWord)});
            query.or({'author': new RegExp(params.diaryKeyWord)});
            query.or({'abstract': new RegExp(params.diaryKeyWord)});
        }

        // if (params.offset && params.limit) {
            query.skip(parseInt(params.offset || 0)).limit(parseInt(params.limit || 100));
        // }
        queryC.count().exec(function (error, c) {
            if (error) {
                logger.error(error);
                return common.sendFault(res, error);
            }
            query.sort({top: -1, seq: -1, updated_on: -1, created_on: -1}).exec(async function (error, result) {
                if (error) {
                    logger.error(error);
                    common.sendFault(res, error);
                }
                let returnData = [];
                for (let r of result) {
                    let resultTemp = JSON.parse(JSON.stringify(r));
                    if (r.pt == 17) {
                        let collections = await tb_usercollection.findAll({
                            where: {
                                decorate_id: resultTemp._id,
                                state: '1'
                            }
                        })
                        resultTemp.collection_count = collections?collections.length:0;
                    }
                    resultTemp.completion_date = r.completion_date?moment(r.completion_date).format('YYYY-MM-DD'):'';
                    resultTemp.completion_format_date = r.completion_date?moment(r.completion_date).format('YYYY年MM月DD日'):'';
                    resultTemp.updated_on = moment(r.updated_on).format('YYYY-MM-DD');

                    //查看是否搜藏
                    if (params.user_id) {
                        let collection = await tb_usercollection.findOne({
                            where:{
                                decorate_id: resultTemp._id,
                                user_id: params.user_id,
                                state: '1',
                            }
                        })
                        if (collection) {
                            resultTemp.isCollection = true
                        } else {
                            resultTemp.isCollection = false
                        }
                    }

                    returnData.push(resultTemp)
                }
                common.sendData(res, {rows: returnData, total: c});
            });
        });

    } catch (error) {
        logger.error(error);
        common.sendFault(res, error);
    }
};


/**
 * 事务方法
 * @param options
 * @param autoCallback
 * @returns {*}
 */


//通过id获得内容管理
let getCmsContentById = async(_id)=> {

    return new Promise(function(resolve, reject) {

        try {
            let query = contentModel.find({})
                .select('_id type biz_id abstract title content parent_id author icon ip_info seq ext1 addons active status top turn pt updated_on created_on completion_date roomType jump_url hits');
            query.where('status').equals(1);
            if (_id) {
                query.where('_id').equals(_id);
            }
            query.sort({top: -1, seq: -1, updated_on: -1, created_on: -1}).exec(function (error, result) {
                if (error) {
                    logger.error(error);
                    reject(error)
                }
                let returnData = [];
                for (let r of result) {
                    let result = JSON.parse(JSON.stringify(r));
                    result.completion_date = r.completion_date?moment(r.completion_date).format('YYYY-MM-DD'):'';
                    result.completion_format_date = r.completion_date?moment(r.completion_date).format('YYYY年MM月DD日'):'';
                    result.updated_on = moment(r.updated_on).format('YYYY-MM-DD');
                    returnData.push(result);
                }
                resolve(returnData)

                // return Promise.all([
                //     callback(returnData)
                // ]);
                // return returnData;
            });
        } catch (error) {
            reject(error)
        }


    })



};




//更新内容管理类型
let updateCmsContentByType = async(req, res)=> {
    try {
        let params = common.docTrim(req.body);
        let subParams = {};
        if (params.originType.t1) {
            subParams.t1 = params.originType.t1;
        }
        if (params.originType.n1) {
            subParams.n1 = params.originType.n1;
        }
        if (params.originType.t2) {
            subParams.t2 = params.originType.t2;
        }
        if (params.originType.n2) {
            subParams.n2 = params.originType.n2;
        }
        var query = {type: {'$elemMatch': subParams}};
        contentModel.update(query, {type: [params.newType]}, {multi: true}, function (error, result) {
            if (error) {
                logger.error(error);
                common.sendFault(res, error);
            }
            common.sendData(res, result);
        })
    } catch (error) {
        logger.error(error);
        common.sendFault(res, error);
    }
};

//上传文件
let uploadFile = async(req, res) => {
    try {
        let fileObj = await _doUploadFile(req);
        common.sendData(res, fileObj);
    } catch (error) {
        logger.error(error);
        common.sendFault(res, error);
    }
};

//上传文件方法
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
    let params = req.body;
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

//获得文件方法
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

exports.getCmsContentById = getCmsContentById;
