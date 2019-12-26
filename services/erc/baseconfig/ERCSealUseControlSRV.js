const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCDepartmentControlSRV');
const model = require('../../../model');
const moment = require('moment');
const TaskListControlSRV = require('./ERCTaskListControlSRV');



const tb_uploadfile = model.erc_uploadfile;
const sequelize = model.sequelize;
const tb_sealuse = model.erc_sealuse;
const tb_user = model.common_user;
const tb_usergroup = model.common_usergroup;
const tb_position = model.erc_position;
const tb_sealcreate = model.erc_sealcreate;
const tb_sealdiscard = model.erc_sealdiscard;

exports.ERCSealUseControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    }  else if (method === 'delete') {
        deleteAct(req, res)
    } else if (method === 'update_file') {
        updateFileAct(req, res);
    } else if (method === 'revert') {
        revertAct(req, res);
    } else if (method === 'upload') {
        uploadFileAct(req, res);
    } else if (method === 'delete_file') {
        deleteFileAct(req, res);
    } else {
        return common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        returnData.sealUseState = GLBConfig.SEALUSESTATE;
        returnData.sealUseIsBorrow = GLBConfig.SEALUSEISBORROW;
        returnData.sealUseRevertState = GLBConfig.SEALUSEREVERTSTATE;
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

        let sealcreate = await tb_sealcreate.findOne({
            where: {
                sealcreate_id: doc.sealcreate_id
            }
        });
        if (sealcreate.is_borrow == 1) {
            return common.sendError(res, 'sealuse_03');
        }

        if (sealcreate.is_discard == 1) {
            return common.sendError(res, 'sealuse_06');
        }

        let sealDiscardCheck = await tb_sealdiscard.findOne({
            where: {
                sealcreate_id: doc.sealcreate_id,
                sealdiscard_state: 1,
                state: GLBConfig.ENABLE
            }
        });
        if (sealDiscardCheck) {
            return common.sendError(res, 'sealuse_07');
        }

        let addSealUse = await tb_sealuse.create({
            domain_id: user.domain_id,
            sealcreate_id: doc.sealcreate_id,
            user_id: user.user_id,
            purpose: doc.purpose,
            use_date: doc.use_date,
            is_borrow: doc.is_borrow,
            borrow_start: doc.borrow_start,
            borrow_end: doc.borrow_end,
            sealuse_state: '1',
            revert_state: '1'
        });

        //保存图片
        if (doc.files != null && doc.files.length > 0) {
            for (let file of doc.files) {
                let addFile = await tb_uploadfile.create({
                    api_name: common.getApiName(req.path),
                    file_name: file.file_name,
                    file_url: file.file_url,
                    file_type: file.file_type,
                    file_visible: '1',
                    state: GLBConfig.ENABLE,
                    srv_id: addSealUse.sealuse_id,
                    file_creator: user.name,
                    srv_type: '203'
                })
            }
        }

        let groupID = common.getUUIDByTime(30);
        let description = user.name + '申请使用印章' + sealcreate.sealcreate_name;
        await TaskListControlSRV.createTask(user, '用章审核', '202', sealcreate.keeper, addSealUse.sealuse_id, description, '', groupID);

        let returnData = await getData(req, res, true, {sealuse_id: doc.sealuse_id});

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modSealUse = await tb_sealuse.findOne({
            where: {
                sealuse_id: doc.sealuse_id
            }
        });
        if (!modSealUse) {
            return common.sendError(res, 'sealuse_01');
        }
        if (modSealUse.sealuse_state != 1) {
            return common.sendError(res, 'sealuse_02');
        }
        modSealUse.state = GLBConfig.DISABLE;
        await modSealUse.save();

        return common.sendData(res, modSealUse);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function modifyUseState(applyState, description, sealuse_id, applyApprover) {
    try {
        let modSealUse = await tb_sealuse.findOne({
            where: {
                sealuse_id: sealuse_id
            }
        })
        if (modSealUse && modSealUse.sealuse_state == 1) {
            await tb_sealuse.update({
                sealuse_state: applyState,
                checker_id: applyApprover,
                check_date: new Date(),
                refuse_remark: description
            }, {
                where: {
                    sealuse_id:sealuse_id
                }
            });

            if (modSealUse.is_borrow == 1 && applyState == 2) {
                await tb_sealcreate.update({
                    is_borrow: 1
                },{
                    where: {
                        sealcreate_id: modSealUse.sealcreate_id
                    }
                })
                await tb_sealuse.update({
                    revert_state: 1
                },{
                    where: {
                        sealuse_id: sealuse_id
                    }
                })
            }


        }
    } catch (error) {
        throw error
    }
}

//印章外借归位
async function revertAct(req, res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let sealUse = await tb_sealuse.findOne({
            where: {
                sealuse_id: doc.sealuse_id,
                state: GLBConfig.ENABLE
            }
        });

        let sealCreate = await tb_sealcreate.findOne({
            where: {
                sealcreate_id: sealUse.sealcreate_id
            }
        });

        if (sealUse.revert_state != 1) {
            return common.sendError(res, 'sealuse_04');
        }
        if (sealUse.is_borrow == 0) {
            return common.sendError(res, 'sealuse_05');
        }

        sealUse.revert_state = 2;
        await sealUse.save();

        let groupID = common.getUUIDByTime(30);
        let description = '审批' + user.name + '归还的印章' + sealCreate.sealcreate_name;
        await TaskListControlSRV.createTask(user, '印章归还审核', '203', sealCreate.keeper, sealUse.sealuse_id, description, '', groupID);

        return common.sendData(res, sealUse);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function revertComplete(req, res, sealuse_id){
    try {
        let sealUse = await tb_sealuse.findOne({
            where: {
                sealuse_id: sealuse_id
            }
        });
        if (sealUse.revert_state == 2) {
            sealUse.revert_state = 3;
            sealUse.revert_date = new Date();
            sealUse.save();

            let sealCreate = await tb_sealcreate.findOne({
                where: {
                    sealcreate_id: sealUse.sealcreate_id
                }
            });
            sealCreate.is_borrow = 0;
            sealCreate.save();
        }
    } catch (error) {
        throw error
    }
}

//上传图片
async function uploadFileAct(req, res) {
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

        let uploadfiles = await tb_uploadfile.findAll({
            where: {
                file_id: {
                    $in: doc.fileIds
                },
                state: GLBConfig.ENABLE
            }
        });

        for (let file of uploadfiles) {
            file.state = GLBConfig.DISABLE
            await file.save();
        }

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
}

// 文件上传至mongoDB，并将路径等信息保存tbl_erc_uploadfile
async function updateFileAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let sealuse = await tb_sealuse.findOne({
            where: {
                sealuse_id: doc.new.sealuse_id
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
                    srv_id: sealuse.sealuse_id,
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
                srv_id: retData.sealuse_id,
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

async function getData(req, res, is_single, doc) {
    let user = req.user;
    let replacements = [];

    let queryStr = 'select tbl_erc_sealuse.*, tbl_common_user.name as user_name, tbl_common_usergroup.usergroup_name as usergroup_name, tbl_erc_sealcreate.sealcreate_name, checker.name as checker_name' +
        ' from tbl_erc_sealuse' +
        ' inner join tbl_common_user on tbl_common_user.user_id = tbl_erc_sealuse.user_id' +
        ' inner join tbl_common_usergroup on tbl_common_usergroup.usergroup_id = tbl_common_user.usergroup_id' +
        ' inner join tbl_erc_sealcreate on tbl_erc_sealcreate.sealcreate_id = tbl_erc_sealuse.sealcreate_id' +
        ' left join tbl_common_user checker on checker.user_id = tbl_erc_sealuse.checker_id' +
        ' where tbl_erc_sealuse.state = 1 and tbl_erc_sealuse.domain_id = ?';

    replacements.push(user.domain_id);

    if (doc.sealuse_id) {
        queryStr += ' and tbl_erc_sealuse.sealuse_id = ?';
        replacements.push(doc.sealuse_id);
    }
    if (doc.search_type == 1) {
        queryStr += ' and tbl_erc_sealuse.user_id = ?';
        replacements.push(user.user_id);
    } else if (doc.search_type == 2) {

    }
    if (doc.search_text) {
        queryStr += ' and (tbl_erc_sealcreate.sealcreate_name like ? or tbl_common_user.name like ? or tbl_erc_sealuse.purpose like ?)';
        replacements.push('%' + doc.search_text + '%');
        replacements.push('%' + doc.search_text + '%');
        replacements.push('%' + doc.search_text + '%');
    }
    queryStr += ' order by tbl_erc_sealuse.created_at';
    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

    let api_name = common.getApiName(req.path);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.use_date = r.use_date ? r.use_date.Format('yyyy-MM-dd') : null;
        r.borrow_start = r.borrow_start ? r.borrow_start.Format('yyyy-MM-dd') : null;
        r.borrow_end = r.borrow_end ? r.borrow_end.Format('yyyy-MM-dd') : null;
        r.check_date = r.check_date ? r.check_date.Format('yyyy-MM-dd') : null;
        r.revert_date = r.revert_date ? r.revert_date.Format('yyyy-MM-dd') : null;

        //用章图片
        r.files = await tb_uploadfile.findAll({
            where: {
                api_name: api_name,
                srv_id: r.sealuse_id,
                srv_type: '201',
                state: GLBConfig.ENABLE
            }
        });

        //用章前图片
        r.files_before = await tb_uploadfile.findAll({
            where: {
                api_name: api_name,
                srv_id: r.sealuse_id,
                srv_type: '203',
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


exports.modifyUseState = modifyUseState;
exports.revertComplete = revertComplete;


