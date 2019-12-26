//关联人反馈
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCProjectRelativesFeedbackControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');
// const task = require('../baseconfig/ERCTaskListControlSRV');

const tb_project_info = model.erc_project_info;//项目信息model
const tb_associated_person = model.erc_associated_person;//项目关联人信息model
const tb_associated_feedback = model.erc_associated_feedback;//项目关联人反馈


// 项目关联人反馈增删改查接口
exports.ERCProjectRelativesFeedbackControlResource = (req, res) => {
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
            associatedInfo: [],
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
        // let associated_person = await tb_associated_person.findAll({
        //     where: {
        //         domain_id: req.user.domain_id,
        //         state: GLBConfig.ENABLE,
        //         project_info_id:doc.project_info_id
        //     }
        // });
        // for (let l of associated_person) {
        //     returnData.associatedInfo.push({
        //         id: l.associated_person_id,
        //         value: l.associated_person_id,
        //         text: l.associated_name
        //     });
        // }

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
        let associated_feedback = await tb_associated_feedback.create({
            domain_id: user.domain_id,
            associated_person_id: doc.associated_person_id,
            feedback_date: doc.feedback_date,
            feedback_content: doc.feedback_content,
            feedback_note: doc.feedback_note,
        });
        common.sendData(res, associated_feedback);

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
        let associated_feedback = await tb_associated_feedback.findOne({
            where: {
                associated_feedback_id: doc.associated_feedback_id
            }
        });
        if (associated_feedback) {
            associated_feedback.associated_person_id= doc.associated_person_id,
            associated_feedback.feedback_date= doc.feedback_date,
            associated_feedback.feedback_content= doc.feedback_content,
            associated_feedback.feedback_note= doc.feedback_note,
            await associated_feedback.save();
            common.sendData(res, associated_feedback)
        } else {
            common.sendError(res, 'associated_feedback_02');
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};
//删除项目信息
async function deleteAct(req, res) {
    try {
        const { body } = req;
        const { associated_feedback_id } = body;

        const result = await tb_associated_feedback.findOne({
            where: {
                associated_feedback_id
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

    let queryStr = 'select t.*,pi.project_name,ap.associated_person_id,ap.associated_name from tbl_erc_associated_feedback t ' +
        ' right join tbl_erc_associated_person ap on ap.associated_person_id = t.associated_person_id' +
        ' right join tbl_erc_project_info pi on ap.project_info_id=pi.project_info_id' +
        ' where t.state = 1 and pi.state=1 and pi.project_info_id= ? and t.domain_id = ?';
    replacements.push(project_info_id);
    replacements.push(user.domain_id);
    // if (doc.project_leadername) {
    //     queryStr += ' and cu.name like ?';
    //     replacements.push('%' + doc.project_leadername + '%');
    // }
    if (doc.associated_name) {
        queryStr += ' and ap.associated_name like ?';
        replacements.push('%' + doc.associated_name + '%');
    }
    if(doc.feedback_date){
        queryStr += ' and t.feedback_date like ?';
        replacements.push('%' + doc.feedback_date + '%');
    }
    queryStr += ' order by t.created_at desc';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.check_date = r.check_date ? r.check_date.Format('yyyy-MM-dd') : null;
        r.feedback_date = r.feedback_date ? r.feedback_date.Format('yyyy-MM-dd') : null;
    }

    if (is_single == true) {
        return result.data[0];
    } else {
        return result;
    }
};
