//项目验收管理
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCProjectAcceptanceControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');
// const task = require('../baseconfig/ERCTaskListControlSRV');

const tb_project_contract = model.erc_project_contract;//项目合同
const tb_project_info = model.erc_project_info;//项目信息
const tb_project_milestone =model.erc_project_milestone;//项目里程碑
const tb_project_acceptance=model.erc_project_acceptance;//项目验收表
const tb_uploadfile = model.erc_uploadfile;//附件文件表

// 项目验收增删改查接口
exports.ERCProjectAcceptanceControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add') {//验收
        addAct(req, res)
    } else if (method === 'delete') {
        deleteAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'setAcceptanceStatus') {
        setAcceptanceStatus(req, res)
    } else if (method === 'upload') {
        uploadAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};
//初始化参数
async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {
            ENABLEL: GLBConfig.ENABLE,
            PROJECTSTATE: GLBConfig.PROJECTFLLOWUPSTATE,//项目状态
            ACCEPTANCESTATUS: GLBConfig.ACCEPTANCESTATUS,//验收状态
            USERINFO:{id:user.user_id,value:user.user_id,text:user.name},
            PROJECTINFO:[],
        };
        let project_infos = await tb_project_info.findAll({
            where: {
                domain_id: req.user.domain_id,
                state: GLBConfig.ENABLE,
            }
        });
        for (let l of project_infos) {
            returnData.PROJECTINFO.push({
                id: l.project_info_id,
                value: l.project_info_id,
                text: l.project_name
            });
        }
        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
// 增加项目验收
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [];
            let acceptance = await tb_project_acceptance.findOne({
                where: {
                    project_info_id:doc.project_info_id,
                    state:GLBConfig.ENABLE
                }
            });
            if(acceptance){
                return common.sendError(res, 'project_accptance_03');
            }
            // if(user.user_id!=doc.customer_id){
            //     return common.sendError(res, 'project_accptance_01');
            // }
            let project_info = await tb_project_info.findOne({
                where:{
                    project_info_id:doc.project_info_id
                }
            });
            if(project_info){
                project_info.project_state='3';
                await project_info.save();
            }else{
                return common.sendError(res, 'project_info_02');
            }
        let milestone = await tb_project_acceptance.create({
            domain_id: user.domain_id,
            project_info_id: doc.project_info_id,
            acceptance_date: doc.acceptance_date,
            acceptor: user.user_id,
            acceptance_assess: doc.acceptance_assess,
            acceptance_photo: doc.acceptance_photo
        });
        //增加扫描件
        let uploadfiles = await saveFile(milestone.project_acceptance_id, doc.files,req);
        common.sendData(res, milestone);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
};
//验收
async function setAcceptanceStatus(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let milestone = await tb_project_acceptance.findOne({
            where: {
                project_acceptance_id: doc.project_acceptance_id
            }
        });
        if (milestone) {
            // milestone.project_info_id= doc.project_info_id,
            milestone.acceptance_date= doc.acceptance_date,
            acceptor= user.user_id,
            milestone.acceptance_assess= doc.acceptance_assess,
            milestone.acceptance_photo= doc.acceptance_photo
            await milestone.save();
            
            common.sendData(res, milestone)
        } else {
            common.sendError(res, 'project_accptance_02');
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};
//修改项目验收
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let milestone = await tb_project_acceptance.findOne({
            where: {
                project_acceptance_id: doc.project_acceptance_id
            }
        });
        if (milestone) {
            // milestone.project_info_id= doc.project_info_id,
            milestone.acceptance_date= doc.acceptance_date,
            acceptor= user.user_id,
            milestone.acceptance_assess= doc.acceptance_assess,
            milestone.acceptance_photo= doc.acceptance_photo
            await milestone.save();
            
            //修改的话要增加原先没有的，删除被删掉的。这是点击保存后的操作
            let removefiles = await removeFile(req,milestone.project_acceptance_id,res);
            let uploadfiles = await saveFile(milestone.project_acceptance_id, doc.files,req);
            common.sendData(res, milestone)
        } else {
            common.sendError(res, 'project_milestone_02');
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};
//删除项目验收
async function deleteAct(req, res) {
    try {
        const { body } = req;
        const { project_acceptance_id } = body;

        const result = await tb_project_acceptance.findOne({
            where: {
                project_acceptance_id
            }
        });
        if (result) {
            result.state = GLBConfig.DISABLE;
            await result.save();
        }

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//查询获取项目验收
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
};
//获取项目验收
async function getData(req, res, is_single, doc) {
    let user = req.user;
    let replacements = [];
    let queryStr = 'select t.*,pi.project_name,pi.customer_id,pi.project_state,cu.name as manage_name,ccu.name as acceptor_name'+
        ' from tbl_erc_project_acceptance t' +
        ' right join tbl_erc_project_info pi on pi.project_info_id=t.project_info_id'+
        ' left join tbl_common_user cu on cu.user_id = pi.customer_id' +
        ' left join tbl_common_user ccu on ccu.user_id = t.acceptor' +
        ' where t.state = 1 and pi.state=1 and t.domain_id = ?';
    replacements.push(user.domain_id);

    if (doc.project_name) {
        queryStr += ' and pi.project_name like ?';
        replacements.push('%' + doc.project_name + '%');
    }
    if (doc.project_info_id) {
        queryStr += ' and pi.project_info_id=?';
        replacements.push(doc.project_info_id );
    }
    if (doc.acceptor_name) {
        queryStr += ' and ccu.name like ?';
        replacements.push('%' + doc.acceptor_name + '%');
    }
    if (doc.acceptance_assess) {
        queryStr += ' and t.acceptance_assess like ?';
        replacements.push('%' + doc.acceptance_assess + '%');
    }
    
    // queryStr += ' group by t.project_contract_id';
    queryStr += ' order by pi.project_name,t.acceptance_date,t.created_at desc';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.acceptance_date = r.acceptance_date ? r.acceptance_date.Format('yyyy-MM-dd') : null;
        r.file = await tb_uploadfile.findOne({
            where: {
                api_name: common.getApiName(req.path),
                srv_id: r.project_acceptance_id,
                srv_type: '302',
                state: GLBConfig.ENABLE
            }
        });
        r.file_url=r.file.file_url;

    }
    if (is_single == true) {
        return result.data[0];
    } else {
        return result;
    }
};
async function uploadAct(req, res) {
    try {
        let fileInfo = await common.fileSave(req);
        let fileUrl = await common.fileMove(fileInfo.url, 'upload');
        fileInfo.url = fileUrl;
        common.sendData(res, fileInfo)
    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function saveFile(project_contract_id, files,req) {//增加附件、扫描件等文件
    let user = req.user;
    let returnData = {};
    if (files && files.length > 0) {
        for (let file of files) {
            
            let addFile = await tb_uploadfile.create({
                api_name: common.getApiName(req.path),
                file_name: file.file_name,
                file_url: file.file_url,
                file_type: file.file_type,
                file_visible: '1',
                state: GLBConfig.ENABLE,
                srv_id: project_contract_id,
                file_creator: user.name,
                srv_type: '302'//标记项目验收的扫描件代码
            })
        }
    }

};
//删除附件
let removeFile = async (req,project_acceptance_id,res) => {
    try {
        let doc = common.docTrim(req.body);
        let uploadfiles = await tb_uploadfile.findAll({
            where: {
                srv_type: '302',
                api_name: common.getApiName(req.path),
                srv_id:project_acceptance_id,
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
