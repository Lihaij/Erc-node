//项目里程碑管理
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCProjectMilestoneControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');
// const task = require('../baseconfig/ERCTaskListControlSRV');

const tb_project_contract = model.erc_project_contract;//项目合同
const tb_project_info = model.erc_project_info;//项目信息
const tb_project_milestone =model.erc_project_milestone;//项目里程碑
const tb_project_participants=model.erc_project_milestone_participants;//里程碑-参与人员关联

// 项目里程碑增删改查接口
exports.ERCProjectMilestoneControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'delete') {
        deleteAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'setAcceptanceStatus') {//验收
        setAcceptanceStatus(req, res)
    } else if (method === 'upload') {
        uploadAct(req, res)
    } else if (method === 'getParticipantByMilestoneId') {
        getParticipantByMilestoneId(req, res)
    } else if (method === 'getParticipantByProjectId') {//获取项目的设定参与人
        getParticipantByProjectId(req, res)
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
// 增加项目里程碑
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [];
        console.log(doc);
        let milestone = await tb_project_milestone.create({
            domain_id: user.domain_id,
            project_info_id: doc.project_info_id,
            milestone_date: doc.milestone_date,
            milestone_name: doc.milestone_name,
            achievement: doc.achievement,
            participants: doc.participants,
            acceptance_status: doc.acceptance_status,
            acceptancetime: doc.acceptancetime,
        });
        if (milestone&&doc.user_ids) {
            let userIdsArr = doc.user_ids.split(",");
            for (let userId of userIdsArr) {
                let addProjectInfo_User = await tb_project_participants.create({
                    domain_id: user.domain_id,
                    project_info_id: milestone.project_info_id,
                    project_milestone_id: milestone.project_milestone_id,
                    user_id: userId
                });
            }
        }

        common.sendData(res, milestone);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
};
//里程碑验收
async function setAcceptanceStatus(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        console.log('customer_id',user.user_id);
        if(doc.customer_id!=user.userid){
            return common.sendError(res,'acceptance_01');
        }
        let milestone = await tb_project_milestone.findOne({
            where: {
                project_milestone_id: doc.project_milestone_id
            }
        });
        if (milestone) {
            milestone.acceptance_status= doc.acceptance_status,
            milestone.acceptancetime=doc.acceptancetime;
            await milestone.save();
            
            common.sendData(res, milestone)
        } else {
            common.sendError(res, 'project_milestone_02');
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};
//修改项目里程碑
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let milestone = await tb_project_milestone.findOne({
            where: {
                project_milestone_id: doc.project_milestone_id
            }
        });
        if (milestone) {
            milestone.project_info_id= doc.project_info_id,
            milestone.milestone_date= doc.milestone_date,
            milestone.milestone_name= doc.milestone_name,
            milestone.achievement= doc.achievement,
            milestone.participants= doc.participants,
            milestone.acceptance_status= doc.acceptance_status,
            milestone.acceptancetime= doc.acceptancetime,
            await milestone.save();
            if (doc.user_ids) {
                const deleteResult = await tb_project_participants.destroy({
                    where: {
                        project_milestone_id: milestone.project_milestone_id
                    }
                });
                let userIdsArr = doc.user_ids.split(",");
                for (let userId of userIdsArr) {
                    let project_workleaders = await tb_project_participants.create({
                        domain_id: user.domain_id,
                        project_info_id: milestone.project_info_id,
                        project_milestone_id: milestone.project_milestone_id,
                        user_id: userId
                    });
                }
            }
            common.sendData(res, milestone)
        } else {
            common.sendError(res, 'project_milestone_02');
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};
//删除项目里程碑
async function deleteAct(req, res) {
    try {
        const { body } = req;
        const { project_milestone_id } = body;

        const result = await tb_project_milestone.findOne({
            where: {
                project_milestone_id
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
                srv_type: '301'//标记项目里程碑的扫描件代码
            })
        }
    }

};
//删除附件
let removeFile = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let fileIds=doc.remove_fileIds;
        let uploadfiles = await tb_uploadfile.findAll({
            where: {
                // file_id: doc.file_id,
                file_id: {
                    $in: fileIds
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
        logger.error('ERCConsumablesControlResource-removeFileAct:' + error);
        common.sendFault(res, error);
        return
    }
};

//查询获取项目里程碑
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
//获取项目里程碑
async function getData(req, res, is_single, doc) {
    let user = req.user;
    let replacements = [];
    let queryStr = 'select t.*,cu.name as manage_name,pi.project_name,pi.customer_id,pi.project_state,GROUP_CONCAT(mcu.name) as participant'+
        ' from tbl_erc_project_milestone t' +
        ' right join tbl_erc_project_info pi on pi.project_info_id=t.project_info_id'+
        ' left join tbl_common_user cu on cu.user_id = pi.customer_id' +
        ' left join tbl_erc_project_milestone_participants pmp on pmp.project_milestone_id = t.project_milestone_id' +
        ' left join tbl_common_user mcu on mcu.user_id = pmp.user_id' +
        // ' left join tbl_erc_project_contract pc on pi.project_info_id=pc.project_info_id' +
        // ' left join tbl_common_user cu on cu.user_id = t.customer_id' +
        // ' left join tbl_erc_project_customer c on t.project_customer_id=c.project_customer_id' +
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
    if (doc.milestone_name) {
        queryStr += ' and t.milestone_name like ?';
        replacements.push('%' + doc.milestone_name + '%');
    }
    
    queryStr += ' group by t.project_milestone_id';
    queryStr += ' order by pi.project_name,t.acceptance_status,t.created_at desc';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.check_date = r.check_date ? r.check_date.Format('yyyy-MM-dd') : null;
        r.milestone_date = r.milestone_date ? r.milestone_date.Format('yyyy-MM-dd') : null;
        r.acceptancetime = r.acceptancetime ? r.acceptancetime.Format('yyyy-MM-dd') : null;
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
async function getParticipantByMilestoneId(req, res) {
    const { body, user } = req;
    try {
        const { project_milestone_id } = body;
        const { domain_id } = user;
        let replacements = [];
        let queryStr = 'select cu.user_id, cu.name, cu.phone, pst.position_name from tbl_erc_project_milestone t' +
            ' left join tbl_erc_project_milestone_participants pw on t.project_milestone_id=pw.project_milestone_id' +
            ' left join tbl_common_user cu on pw.user_id=cu.user_id' +
            ' left join tbl_erc_custorgstructure ctt on ctt.user_id = cu.user_id' +
            ' left join tbl_erc_position pst on ctt.position_id = pst.position_id' +
            ' where t.project_milestone_id=? and t.state=1 and cu.user_id is not null and t.domain_id=?';
        replacements.push(project_milestone_id);
        replacements.push(domain_id);
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        common.sendData(res, result);
    } catch (e) {
        common.sendFault(res, e);
    }
};
async function getParticipantByProjectId(req, res) {
    const { body, user } = req;
    try {
        const { project_info_id } = body;
        const { domain_id } = user;
        let replacements1 = [];
        let replacements = [];
        let queryStr1 = 'select cu.user_id, cu.name, cu.phone,ced.department_name,pst.position_name from tbl_erc_project_info t' +
            ' left join tbl_common_user cu on cu.user_id=t.customer_id' +
            ' left join tbl_erc_custorgstructure ctt on ctt.user_id = cu.user_id' +
            ' left join tbl_erc_department ced on ctt.department_id = ced.department_id' +
            ' left join tbl_erc_position pst on ctt.position_id = pst.position_id' +       //职位
            ' where t.project_info_id=? and t.state=1 and cu.user_id is not null and t.domain_id=?';
        replacements1.push(project_info_id);
        replacements1.push(domain_id);
        let result1 = await common.queryWithCount(sequelize, req, queryStr1, replacements1);
        let queryStr = 'select cu.user_id, cu.name, cu.phone,ced.department_name,pst.position_name from tbl_erc_project_workleaders t' +
            ' left join tbl_common_user cu on t.user_id=cu.user_id' +
            ' left join tbl_erc_custorgstructure ctt on ctt.user_id = cu.user_id' +
            ' left join tbl_erc_department ced on ctt.department_id = ced.department_id' +
            ' left join tbl_erc_position pst on ctt.position_id = pst.position_id' +       //职位
            ' where t.project_info_id=? and t.state=1 and cu.user_id is not null and t.domain_id=?';
        replacements.push(project_info_id);
        replacements.push(domain_id);
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        if(result1.data&&result1.data.length>0){
            if(!result.data.some(item=>{
                if(item.user_id==result1.data[0].user_id){
                return true
                }
                })){
                result.data.unshift(result1.data[0]);
            }
        }
        let returnData = {};
        returnData.total = result.data?result.data.length:'0';
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (e) {
        common.sendFault(res, e);
    }
};