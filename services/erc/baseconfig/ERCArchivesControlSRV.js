const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCDepartmentControlSRV');
const model = require('../../../model');
const moment = require('moment');
const TaskListControlSRV = require('./ERCTaskListControlSRV');
const tb_uploadfile = model.erc_uploadfile;
const sequelize = model.sequelize;
const tb_archives = model.erc_archives;
const tb_user = model.common_user;
const tb_usergroup = model.common_usergroup;
const tb_position = model.erc_position;
const tb_archiveshand = model.erc_archiveshand;

exports.ERCArchivesControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    }  else if (method === 'delete') {
        deleteAct(req, res)
    } else if (method === 'upload') {
        uploadAct(req, res);
   // } else if (method === 'upload') {
    //    uploadFileAct(req, res)
    }  else if (method === 'moveTo') {
        moveToAct(req, res);
    } else {
        return common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        returnData.archivesType = await global.getBaseTypeInfo(user.domain_id, 'DALX');
        returnData.archivesHand = await tb_archiveshand.findAll({
            attributes: [['archiveshand_id', 'id'], ['archiveshand_id', 'value'], ['archiveshand_name', 'text']],
            where: {
                domain_id: user.domain_id,
                state: GLBConfig.ENABLE,
                archiveshand_state: 1
            }
        })
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
        let replacements =[];
        let queryStr = 'select tbl_erc_archives.*, tbl_erc_department.department_name, ' +
            'tbl_erc_archives.archives_id as id, tbl_erc_archives.archives_id as value, tbl_erc_archives.archives_name as text' +
            ' from tbl_erc_archives' +
            ' inner join tbl_erc_department on tbl_erc_archives.department_id = tbl_erc_department.department_id' +
            ' where tbl_erc_archives.state = 1 and tbl_erc_archives.domain_id = ? ' +
            ' ';

        replacements.push(user.domain_id);


        if (doc.search_text) {
            queryStr += ' and ((tbl_erc_archives.archives_name like ?)';
            replacements.push('%' + doc.search_text + '%');
            queryStr += ' or (tbl_erc_archives.archives_no like ?))';
            replacements.push('%' + doc.search_text + '%')
        }
        if (doc.search_type == 1) {
            queryStr += ' and tbl_erc_archives.user_id = ?';
            replacements.push(user.user_id);
        }

        queryStr += ' order by tbl_erc_archives.created_at';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        let path = common.getApiName(req.path);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;

            r.keep_begin_date = r.keep_begin_date ? r.keep_begin_date.Format('yyyy-MM-dd') : null;
            r.keep_end_date = r.keep_end_date ? r.keep_end_date.Format('yyyy-MM-dd') : null;
            r.files = await tb_uploadfile.findAll({
                where: {
                    api_name:path ,
                    srv_id: r.archives_id,
                    srv_type: '210',
                    state: GLBConfig.ENABLE
                }
            });
        }
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

        let archives = await tb_archives.findOne({
            where: {
                archives_id: doc.archives_id
            }
        });

        let addArchives = await tb_archives.create({
            domain_id: user.domain_id,
            archives_type:doc.archives_type,
            archives_name:doc.archives_name,
            archives_no:doc.archives_no,
            archives_id: doc.archives_id,
            department_id: doc.department_id,
            keep_time: doc.keep_time,
            keep_begin_date: doc.keep_begin_date,
            keep_end_date: doc.keep_end_date,
            instruction: doc.instruction,
            archives_state: '1',
            predepartment_id: doc.department_id,
            prekeep_date: doc.keep_begin_date,
            keeper: doc.keeper,
            user_id: user.user_id
        });
        //附件
        if (doc.files != null && doc.files.length > 0) {
            for (let file of doc.files) {
                let addFile = await tb_uploadfile.create({
                    api_name: common.getApiName(req.path),
                    file_name: file.file_name,
                    file_url: file.file_url,
                    file_type: file.file_type,
                    file_visible: '1',
                    state: GLBConfig.ENABLE,
                    srv_type: '210',
                    srv_id: addArchives.archives_id
                });
            }
        }

        //应交档案更新状态
        if (doc.archiveshand_id) {
            await tb_archiveshand.update({
                    archiveshand_state: 2
                }, {
                where: {
                    archiveshand_id: doc.archiveshand_id
                }
            })
        }
        return common.sendData(res, addArchives);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modArchivesUse = await tb_archives.findOne({
            where: {
                archives_id: doc.archives_id
            }
        });
        if (!modArchivesUse) {
            return common.sendError(res, 'archives_01');
        }
        if (modArchivesUse.archives_state != 1) {
            return common.sendError(res, 'archives_02');
        }
        modArchivesUse.state = GLBConfig.DISABLE;
        await modArchivesUse.save();

        return common.sendData(res, modArchivesUse);
    } catch (error) {
        return common.sendFault(res, error);
    }
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

// 文件上传至mongoDB，并将路径等信息保存tbl_erc_uploadfile
async function uploadFileAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let archives = await tb_archives.findOne({
            where: {
                archives_id: doc.archives_id
            }
        });

        let api_name = common.getApiName(req.path);
        for (let m of doc.new.files) {
            if (m.url) {
                let fileUrl = await common.fileMove(m.url, 'upload');
                let addFile = await tb_uploadfile.create({
                    api_name: api_name,
                    file_name: m.name,
                    file_url: fileUrl,
                    file_type: m.type,
                    srv_id: archives.archives_id,
                    srv_type: '210',
                    file_creator: user.name
                })
            }
        }

        let retData = JSON.parse(JSON.stringify(doc.new));
        retData.files = [];
        let ufs = await tb_uploadfile.findAll({
            where: {
                api_name: api_name,
                srv_id: retData.archives_id,
                srv_type: '210',
                state: GLBConfig.ENABLE
            }
        })

        for (let f of ufs) {
            retData.files.push(f)
        }
        return common.sendData(res, retData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}


// 转交
async function moveToAct(req, res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let archives = await tb_archives.findOne({
            where: {
                archives_id: doc.archives_id
            }
        });
        let date = new Date();
        await tb_archives.update({
            predepartment_id : archives.department_id,
        prekeep_date : archives.keep_begin_date,
        department_id:doc.department_id,
         keep_begin_date : date
        },{
            where:{
            archives_id: doc.archives_id
        }});

       // console.log(archives);
      //  await archives.save();
        return common.sendData(res, archives);

    } catch (error) {
        return common.sendFault(res, error);
    }
}


