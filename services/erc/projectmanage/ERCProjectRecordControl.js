//推动分析
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCProjectRecordControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');

const tb_project_info = model.erc_project_info;//项目信息model
const tb_analysis_record = model.erc_project_analysis_record;//项目推动分析


// 项目推动分析增删改查接口
exports.ERCProjectRecordControlResource = (req, res) => {
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
    } else if (method === 'getWorkUsers') {
        getWorkUsers(req, res)
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
            // associatedInfo: []
            PROJECTNAME:''
        };
        if(doc.project_info_id){
            let project_info=await tb_project_info.findOne({
                where:{
                    project_info_id:doc.project_info_id
                }
            })
            returnData.PROJECTNAME=project_info?project_info.project_name:'';
        }

        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
// 增加项目信息
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [];
        let project_analysis_record = await tb_analysis_record.create({
            domain_id: user.domain_id,
            project_info_id: doc.project_info_id,
            record_date: doc.record_date,
            active_descried: doc.active_descried,
            active_reflection: doc.active_reflection,
            shortage: doc.shortage,
            next_step: doc.next_step,
        });
        common.sendData(res, project_analysis_record);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
};
//修改项目信息
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let project_analysis_record = await tb_analysis_record.findOne({
            where: {
                project_analysis_record_id: doc.project_analysis_record_id
            }
        });
        if (project_analysis_record) {
            project_analysis_record.record_date= doc.record_date,
            project_analysis_record.active_descried= doc.active_descried,
            project_analysis_record.active_reflection= doc.active_reflection,
            project_analysis_record.shortage= doc.shortage,
            project_analysis_record.next_step= doc.next_step,
            await project_analysis_record.save();
            common.sendData(res, project_analysis_record)
        } else {
            common.sendError(res, 'project_analysis_record_02');
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};
//删除项目信息
async function deleteAct(req, res) {
    try {
        const { body } = req;
        const { project_analysis_record_id } = body;

        const result = await tb_analysis_record.findOne({
            where: {
                project_analysis_record_id
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
//查询获取项目信息
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
//获取项目信息
async function getData(req, res, is_single, doc) {
    const { body, user } = req;
    const { project_info_id } = body;
    let replacements = [];

    let queryStr = 'select t.*,pi.project_name from tbl_erc_project_analysis_record t ' +
        ' right join tbl_erc_project_info pi on t.project_info_id=pi.project_info_id' +
        ' where t.state = 1 and pi.state=1 and pi.project_info_id= ? and t.domain_id = ?';
    replacements.push(project_info_id);  
    replacements.push(user.domain_id);
    if (doc.shortage) {
        queryStr += ' and t.shortage like ?';
        replacements.push('%' + doc.shortage + '%');
    }
    if(doc.record_date){
        queryStr += ' and t.record_date like ?';
        replacements.push('%' + doc.record_date + '%');
    }
    queryStr += ' order by t.created_at desc';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.check_date = r.check_date ? r.check_date.Format('yyyy-MM-dd') : null;
        r.record_date = r.record_date ? r.record_date.Format('yyyy-MM-dd') : null;
    }

    if (is_single == true) {
        return result.data[0];
    } else {
        return result;
    }
};
