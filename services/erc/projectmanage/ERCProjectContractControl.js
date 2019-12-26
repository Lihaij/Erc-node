//项目合同管理
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCProjectContractControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');
// const task = require('../baseconfig/ERCTaskListControlSRV');

const tb_project_contract = model.erc_project_contract;//项目合同信息model
const tb_project_info = model.erc_project_info;//项目信息
const tb_uploadfile = model.erc_uploadfile;//附件文件表

// 项目合同增删改查接口
exports.ERCProjectContractControlResource = (req, res) => {
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
            INVOICESTATE: GLBConfig.PROJECTINVOICESTATE,//是否需要合同
        };
        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
// 增加项目合同
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [];
        console.log(doc);
        let project_contract = await tb_project_contract.create({
            domain_id: user.domain_id,
            project_info_id: doc.project_info_id,
            contract_amount: doc.contract_amount,
            payment_method: doc.payment_method,
            invoice_state: doc.invoice_state,
            contract_date: doc.contract_date,
            contract_scan: doc.contract_scan,
            project_photo: doc.project_photo,
        });
        //增加扫描件
        let uploadfiles = await saveFile(project_contract.project_contract_id, doc.files,req);
        common.sendData(res, project_contract);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
};
//修改项目合同
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let files=[];
        if(doc.files&&doc.files.length>0){
            for(let d of doc.files){
                if(!d.file_id){
                    files.push(d);
                }
            }
        }
        let user = req.user;
        let project_contract = await tb_project_contract.findOne({
            where: {
                project_contract_id: doc.project_contract_id
            }
        });
        if (project_contract) {
            project_contract.contract_amount= doc.contract_amount,
            project_contract.payment_method= doc.payment_method,
            project_contract.invoice_state= doc.invoice_state,
            project_contract.contract_date= doc.contract_date,
            project_contract.contract_scan= doc.contract_scan,
            project_contract.project_photo= doc.project_photo
            await project_contract.save();
            //修改的话要增加原先没有的，删除被删掉的。这是点击保存后的操作
            
            let uploadfiles = await saveFile(doc.project_contract_id, files,req);
            let removefiles = await removeFile(req, res);
            common.sendData(res, project_contract)
        } else {
            common.sendError(res, 'project_contract_02');
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};
//删除项目合同
async function deleteAct(req, res) {
    try {
        const { body } = req;
        const { project_contract_id } = body;

        const result = await tb_project_contract.findOne({
            where: {
                project_contract_id
            }
        });
        if (result) {
            result.state = GLBConfig.DISABLE;
            let uploadfiles = await tb_uploadfile.findAll({
                where: {
                    api_name:common.getApiName(req.path),
                    srv_id: result.project_contract_id,
                    srv_type: '301',
                    state: GLBConfig.ENABLE
                }
            });
            for (let file of uploadfiles) {
                file.state = GLBConfig.DISABLE
                await file.save();
            }
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
                srv_type: '301'//标记项目合同的扫描件代码
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
        logger.error('ERCContractControlResource-removeFile:' + error);
        common.sendFault(res, error);
        return
    }
};

//查询获取项目合同
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
//获取项目合同
async function getData(req, res, is_single, doc) {
    let user = req.user;
    let replacements = [];
    console.log('path',req.path);

    let queryStr = 'select t.project_info_id,t.domain_id,t.project_name,t.project_number,t.project_address,t.project_state,'+
        'pc.project_contract_id,pc.contract_amount,pc.payment_method,pc.invoice_state,pc.contract_date,pc.contract_scan,pc.project_photo,'+
        'cu.name as manage_name,c.full_name from tbl_erc_project_info t' +
        ' left join tbl_erc_project_contract pc on t.project_info_id=pc.project_info_id' +
        ' left join tbl_common_user cu on cu.user_id = t.customer_id' +
        ' left join tbl_erc_project_customer c on t.project_customer_id=c.project_customer_id' +
        ' where t.state = 1 and t.domain_id = ?';
    replacements.push(user.domain_id);

    if (doc.project_number) {
        queryStr += ' and t.project_number like ?';
        replacements.push('%' + doc.project_number + '%');
    }
    if (doc.project_name) {
        queryStr += ' and t.project_name like ?';
        replacements.push('%' + doc.project_name + '%');
    }
    if (doc.project_leadername) {
        queryStr += ' and cu.name like ?';
        replacements.push('%' + doc.project_leadername + '%');
    }
    // queryStr += ' group by t.project_contract_id';
    queryStr += ' order by t.project_state desc,t.created_at desc';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.check_date = r.check_date ? r.check_date.Format('yyyy-MM-dd') : null;
        r.contract_date = r.contract_date ? r.contract_date.Format('yyyy-MM-dd') : null;

        r.files = await tb_uploadfile.findAll({
            where: {
                api_name: common.getApiName(req.path),
                srv_id: r.project_contract_id,
                srv_type: '301',
                state: GLBConfig.ENABLE
            }
        });

    }
    // console.log('result',result);
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
}