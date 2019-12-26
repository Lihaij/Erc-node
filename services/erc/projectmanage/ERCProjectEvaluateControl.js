//项目评价管理
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCProjectEvaluateControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');
// const task = require('../baseconfig/ERCTaskListControlSRV');

const tb_project_contract = model.erc_project_contract;//项目合同
const tb_project_info = model.erc_project_info;//项目信息
const tb_project_milestone =model.erc_project_milestone;//项目里程碑
const tb_project_evaluate=model.erc_project_evaluate;//项目评价表
const tb_uploadfile = model.erc_uploadfile;//附件文件表

// 项目评价增删改查接口
exports.ERCProjectEvaluateControlResource = (req, res) => {
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
            PROJECTINFO:[],
            USERINFO:{id:user.user_id,value:user.user_id,text:user.name}
        };
         let project_infos = await tb_project_info.findAll({
            where: {
                domain_id: req.user.domain_id,
                state: GLBConfig.ENABLE,
                project_state:'3'
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
// 增加项目评价
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [];
        let evaluate = await tb_project_evaluate.create({
            domain_id: user.domain_id,
            project_info_id: doc.project_info_id,
            evaluate_date: doc.evaluate_date,
            evaluator: user.user_id,
            evaluate_content: doc.evaluate_content,
        });
        // //增加扫描件
        // let uploadfiles = await saveFile(evaluate.project_evaluate_id, doc.files,req);
        common.sendData(res, evaluate);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
};
//修改项目评价
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let evaluate = await tb_project_evaluate.findOne({
            where: {
                project_evaluate_id: doc.project_evaluate_id
            }
        });
        if (evaluate) {
            // evaluate.project_info_id= doc.project_info_id,
            evaluate.evaluate_date= doc.evaluate_date,
            evaluate.evaluator= user.user_id,
            evaluate.evaluate_content= doc.evaluate_content,
            await evaluate.save();
            
            //修改的话要增加原先没有的，删除被删掉的。这是点击保存后的操作
            // let removefiles = await removeFile(req,evaluate.project_evaluate_id,res);
            // let uploadfiles = await saveFile(evaluate.project_evaluate_id, doc.files,req);
            common.sendData(res, evaluate)
        } else {
            common.sendError(res, 'project_evaluate_02');
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};
//删除项目评价
async function deleteAct(req, res) {
    try {
        const { body } = req;
        const { project_evaluate_id } = body;

        const result = await tb_project_evaluate.findOne({
            where: {
                project_evaluate_id
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
//查询获取项目评价
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
//获取项目评价
async function getData(req, res, is_single, doc) {
    let user = req.user;
    let replacements = [];
    let queryStr = 'select t.*,pi.project_name,pi.customer_id,pi.project_state,cu.name as manage_name,ccu.name as evaluate_name'+
        ' from tbl_erc_project_evaluate t' +
        ' right join tbl_erc_project_info pi on pi.project_info_id=t.project_info_id'+
        ' left join tbl_common_user cu on cu.user_id = pi.customer_id' +
        ' left join tbl_common_user ccu on ccu.user_id = t.evaluator' +
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
    if (doc.evaluate_name) {
        queryStr += ' and ccu.name like ?';
        replacements.push('%' + doc.evaluate_name + '%');
    }
    if (doc.evaluate_content) {
        queryStr += ' and t.evaluate_content like ?';
        replacements.push('%' + doc.evaluate_content + '%');
    }
    
    // queryStr += ' group by t.project_contract_id';
    queryStr += ' order by pi.project_name,t.evaluate_date';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.evaluate_date = r.evaluate_date ? r.evaluate_date.Format('yyyy-MM-dd') : null;
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
                srv_type: '302'//标记项目评价的扫描件代码
            })
        }
    }

};
//删除附件
let removeFile = async (req,project_evaluate_id,res) => {
    try {
        let doc = common.docTrim(req.body);
        let uploadfiles = await tb_uploadfile.findAll({
            where: {
                srv_type: '302',
                api_name: common.getApiName(req.path),
                srv_id:project_evaluate_id,
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
