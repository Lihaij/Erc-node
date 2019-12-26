const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCDepartmentControlSRV');
const model = require('../../../model');
const moment = require('moment');
const TaskListControlSRV = require('./ERCTaskListControlSRV');



const tb_uploadfile = model.erc_uploadfile;
const sequelize = model.sequelize;
const tb_archivesuse = model.erc_archivesuse;
const tb_user = model.common_user;
const tb_usergroup = model.common_usergroup;
const tb_position = model.erc_position;
const tb_archives = model.erc_archives;


exports.ERCArchivesUseControlResource = (req, res) => {
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
        uploadAct(req, res)
    } else if (method === 'archivesuse_update') {
        updateAct(req, res);
    } else if (method === 'revert') {
        revertAct(req, res);
    } else {
        return common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        returnData.archivesUseState = GLBConfig.CHECKUSESTATE;

        returnData.archivesUseRevertState = GLBConfig.ARCHIVESUSEREVERTSTATE;
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
        let queryStr = 'select tbl_erc_archivesuse.*, tbl_common_user.name as user_name, ' +
            'tbl_common_usergroup.usergroup_name as usergroup_name, ' +
            'tbl_erc_archives.archives_name, checker.name as checker_name' +
            ' from tbl_erc_archivesuse' +
            ' inner join tbl_common_user on tbl_common_user.user_id = tbl_erc_archivesuse.user_id' +
            ' inner join tbl_common_usergroup on tbl_common_usergroup.usergroup_id = tbl_common_user.usergroup_id' +
            ' inner join tbl_erc_archives on tbl_erc_archives.archives_id = tbl_erc_archivesuse.archives_id' +
            ' left join tbl_common_user checker on checker.user_id = tbl_erc_archivesuse.checker_id' +
            ' where tbl_erc_archivesuse.state = 1 and tbl_erc_archivesuse.domain_id = ? and tbl_erc_archivesuse.user_id = ?' +
            ' ';

        replacements.push(user.domain_id);
        replacements.push(user.user_id);

        if (doc.search_text) {
            queryStr += ' and tbl_erc_archives.archives_name like ?';
            replacements.push('%' + doc.search_text + '%');
        }

        queryStr += ' order by tbl_erc_archivesuse.created_at';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.use_date = r.use_date ? r.use_date.Format('yyyy-MM-dd') : null;
            r.check_date = r.check_date ? r.check_date.Format('yyyy-MM-dd') : null;
            r.revert_date = r.revert_date ? r.revert_date.Format('yyyy-MM-dd') : null;
        }
        returnData.rows = result.data;

        console.log('=====data');
        console.log(result.data);

        let api_name = common.getApiName(req.path)
        for (let ap of result.data) {
            console.log(ap)
            let d = JSON.parse(JSON.stringify(ap))

            d.files = [];
            let ufs = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
                    srv_id: d.archivesuse_id,
                    srv_type: '201',
                    state: GLBConfig.ENABLE
                }
            })

            for (let f of ufs) {
                d.files.push(f)
            }
            ap.files = d.files;
            // returnData.rows.push(d)
        }

        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let archivesUse = await tb_archivesuse.findOne({
            where: {
                archivesuse_id: doc.archivesuse_id
            }
        });

        let addArchivesUse = await tb_archivesuse.create({
            domain_id: user.domain_id,
            archives_id: doc.archives_id,
            user_id: user.user_id,
            purpose: doc.purpose,
            use_date: doc.use_date,
            archivesuse_state: '1'
        });
        let groupID = common.getUUIDByTime(30);
        await TaskListControlSRV.createTask(user, '档案外借审核', '210','', addArchivesUse.archivesuse_id, '档案外借审核', '', groupID);
        return common.sendData(res, addArchivesUse);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modArchivesUse = await tb_archivesuse.findOne({
            where: {
                archivesuse_id: doc.archivesuse_id
            }
        });
        if (!modArchivesUse) {
            return common.sendError(res, 'archivesuse_01');
        }
        if (modArchivesUse.archivesuse_state != 1) {
            return common.sendError(res, 'archivesuse_02');
        }
        modArchivesUse.state = GLBConfig.DISABLE;
        await modArchivesUse.save();

        return common.sendData(res, modArchivesUse);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function modifyUseState(applyState, description, archivesuse_id, applyApprover) {
    try {
        let modArchivesUse = await tb_archivesuse.findOne({
            where: {
                archivesuse_id: archivesuse_id
            }
        })
        if (modArchivesUse && modArchivesUse.archivesuse_state == 1) {
            await tb_archivesuse.update({
                archivesuse_state: applyState,
                checker_id: applyApprover,
                check_date: new Date(),
                refuse_remark: description
            }, {
                where: {
                    archivesuse_id:archivesuse_id
                }
            });

            if ( applyState == 2) {
                await tb_archivesuse.update({
                    revert_state: 1
                },{
                    where: {
                        archivesuse_id: archivesuse_id
                    }
                })
            }


        }
    } catch (error) {
        throw error
    }
}

// 文件上传至mongoDB，并将路径等信息保存tbl_erc_uploadfile
async function updateAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let archivesuse = await tb_archivesuse.findOne({
            where: {
                archivesuse_id: doc.new.archivesuse_id
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
                    srv_id: archivesuse.archivesuse_id,
                    srv_type: '201',
                    file_creator: user.name
                })
            }
        }

        let retData = JSON.parse(JSON.stringify(doc.new));
        retData.files = [];
        let ufs = await tb_uploadfile.findAll({
            where: {
                api_name: api_name,
                srv_id: retData.archivesuse_id,
                srv_type: '201',
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

//档案外借归位
async function revertAct(req, res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let archivesUse = await tb_archivesuse.findOne({
            where: {
                archivesuse_id: doc.archivesuse_id
            }
        });

        let archivesCreate = await tb_archives.findOne({
            where: {
                archives_id: archivesUse.archives_id,
                state: GLBConfig.ENABLE
            }
        });

        if (archivesUse.revert_state != 1) {
            return common.sendError(res, 'archivesuse_04');
        }


        archivesUse.revert_state = 2;
        await archivesUse.save();

        let groupID = common.getUUIDByTime(30);
        await TaskListControlSRV.createTask(user, '档案归还审核', '211', archivesCreate.keeper, archivesUse.archivesuse_id, '档案归还确认', '', groupID);

        return common.sendData(res, archivesUse);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function revertComplete(req, res, archivesuse_id){
    try {
        let archivesUse = await tb_archivesuse.findOne({
            where: {
                archivesuse_id: archivesuse_id
            }
        });
        if (archivesUse.revert_state == 2) {
            archivesUse.revert_state = 3;
            archivesUse.revert_date = new Date();
            archivesUse.save();

            // let archivesCreate = await tb_archives.findOne({
            //     where: {
            //         archives_id: archivesUse.archives_id
            //     }
            // });
            // archivesCreate.is_borrow = 0;
            // archivesCreate.save();
        }
    } catch (error) {
        throw error
    }
}


exports.modifyUseState = modifyUseState;
exports.revertComplete = revertComplete;


