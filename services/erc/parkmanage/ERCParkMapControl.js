//园区地图、园区信息
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCParkMapControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');

const tb_park_supplier = model.erc_park_supplier;//园区供应商
const tb_park_map = model.erc_park_map;//园区地图
const tb_park_info = model.erc_park_info;//园区信息
const tb_uploadfile = model.erc_uploadfile;

// 园区地图增删改查接口
exports.ERCParkMapControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
        // } else if (method === 'uploadFirstFile') {//上传第一张地图
        //       uploadFirstFile(req, res)
        // } else if (method === 'uploadSecondFile') {//上传第二张地图
        //       uploadSecondFile(req, res)
    } else if (method === 'uploadFiles') {//上传二张地图-确定
        uploadFiles(req, res)
    } else if (method === 'upload') {//上传j记录文件
        uploadAct(req, res)
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'addInfo') {//保存园区信息
        addInfo(req, res)
    } else if (method === 'searchInfo') {//查询园区信息
        searchInfo(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};
//初始化参数
async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let api_name = common.getApiName(req.path);
        let returnData = {
            ENABLEL: GLBConfig.ENABLE,
            FILES: []
        };
        let maps = await tb_uploadfile.findAll({
            where: {
                api_name: api_name,
                srv_type: '411',
                state: GLBConfig.ENABLE
            },
            order: [
                ['srv_id', 'ASC']
            ]
        })
        returnData.FILES = maps;

        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
//查询获取地图
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let api_name = common.getApiName(req.path);

        let retData = {};
        retData.files = [];
        let map1 = await tb_uploadfile.findOne({
            where: {
                api_name: api_name,
                srv_id: 1,
                srv_type: '411',
                state: GLBConfig.ENABLE
            }
        })
        let map2 = await tb_uploadfile.findOne({
            where: {
                api_name: api_name,
                srv_id: 2,
                srv_type: '411',
                state: GLBConfig.ENABLE
            }
        })
        retData.files.push(map1)
        retData.files.push(map2)
        return common.sendData(res, retData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
//获取地图
async function getData(req, res, is_single, doc) {
    const { body, user } = req;
    const { park_map_id } = body;
    let replacements = [];

    let queryStr = 'select t.* from tbl_erc_park_map t ' +
        ' where t.state = 1';
    //   +' and t.domain_id= ?'
    queryStr += ' order by t.created_at desc';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
    }

    if (is_single == true) {
        return result.data[0];
    } else {
        return result;
    }
};
//上传地图保存信息
async function uploadAct(req, res) {
    try {
        let fileInfo = await common.fileSave(req);
        //     let fileUrl = await common.fileMove(fileInfo.url, 'upload');
        //   fileInfo.url = fileUrl;
        common.sendData(res, fileInfo)
    } catch (error) {
        return common.sendFault(res, error);
    }
};
//地图上传至mongoDB，并将路径等信息保存tbl_erc_uploadfile
async function uploadFiles(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        // let map = await tb_park_map.findOne({
        //     where: {
        //         park_map_id: doc.park_map_id
        //     }
        // });
        if (!doc.files) {
            return common.sendError(res, 'document_01');
        }

        let api_name = common.getApiName(req.path);
        let map1 = await tb_uploadfile.findOne({
            where: {
                api_name: api_name,
                srv_id: 1,
                srv_type: '411',
                state: GLBConfig.ENABLE
            }
        });
        let map2 = await tb_uploadfile.findOne({
            where: {
                api_name: api_name,
                srv_id: 2,
                srv_type: '411',
                state: GLBConfig.ENABLE
            }
        });
        if (doc.files.length > 0) {
            let m = doc.files[0];
            if (m.url) {
                let fileUrl = await common.fileMove(m.url, 'upload');
                if (map1) {
                    map1.file_name = m.name,
                        map1.file_url = fileUrl,
                        map1.file_type = m.type,
                        map1.file_creator = user.name
                    await map1.save();
                } else {
                    let addFile = await tb_uploadfile.create({
                        api_name: api_name,
                        file_name: m.name,
                        file_url: fileUrl,
                        file_type: m.type,
                        srv_id: 1,
                        srv_type: '411',
                        file_creator: user.name
                    })
                }
            }
        }
        if (doc.files.length > 1) {
            let m = doc.files[1];
            if (m.url) {
                let fileUrl = await common.fileMove(m.url, 'upload');
                if (map2) {
                    map2.file_name = m.name,
                        map2.file_url = fileUrl,
                        map2.file_type = m.type,
                        map2.file_creator = user.name
                    await map2.save();
                } else {
                    let addFile = await tb_uploadfile.create({
                        api_name: api_name,
                        file_name: m.name,
                        file_url: fileUrl,
                        file_type: m.type,
                        srv_id: 2,
                        srv_type: '411',
                        file_creator: user.name
                    })
                }
            }
        }

        let retData = {};
        let maps = await tb_uploadfile.findAll({
            where: {
                api_name: api_name,
                srv_type: '411',
                state: GLBConfig.ENABLE
            },
            order: [
                ['srv_id', 'ASC']
            ]
        })
        retData.files = maps;
        return common.sendData(res, retData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function addInfo(req, res) {
    let doc = common.docTrim(req.body);
    let user = req.user;
    let _info = await searchInfo();
    if (_info) {
        _info.park_name = doc.park_name,
            _info.park_location = doc.park_location,
            _info.park_createdate = doc.park_createdate,
            _info.park_field1 = doc.park_field1,
            _info.park_field2 = doc.park_field2,
            await _info.save();
        return common.sendData(res, _info);
    } else {
        let info = await tb_park_info.create({
            domain_id: user ? user.domain_id : '',
            park_name: doc.park_name,
            park_location: doc.park_location,
            park_createdate: doc.park_createdate,
            park_field1: doc.park_field1,
            park_field2: doc.park_field2
        })
    }

};

async function searchInfo(req, res) {
    let r = false;
    const result = await tb_park_info.findOne({
        where: {
            state: GLBConfig.ENABLE
        }
    });
    r = result;
    return r;
};

