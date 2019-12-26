//项目关联人及亲友
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCProjectRelativesControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');
// const task = require('../baseconfig/ERCTaskListControlSRV');

// const tb_project_customer = model.erc_project_customer;//项目客户信息
// const tb_project_workleaders = model.erc_project_workleaders;//项目-工作责任人关联
// const tb_project_workleaders = model.erc_project_workleaders;//项目-工作责任人关联
const tb_project_info = model.erc_project_info;//项目信息model
const tb_associated_person = model.erc_associated_person;//项目关联人信息model
const tb_associated_relatives = model.erc_associated_relatives;//项目关联人亲友


// 项目关联人增删改查接口
exports.ERCProjectRelativesControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'searchAssociate') {
        searchAssociateAct(req, res)

    } else if (method === 'searchRelatives') {
        searchRelativesAct(req, res)
    } else if (method === 'addAssociate') {//增加关联人
        addAssociateAct(req, res)
    } else if (method === 'addRelatives') {//增加亲友
        addRelativesAct(req, res)
    } else if (method === 'deleteAssociate') {//删除关联人
        deleteAssociateAct(req, res)
    } else if (method === 'deleteRelatives') {//删除亲友
        deleteRelativesAct(req, res)
    } else if (method === 'modifyAssociate') {//修改关联人
        modifyAssociateAct(req, res)
    } else if (method === 'modifyRelatives') {//修改亲友
        modifyRelativesAct(req, res)
    } else if (method === 'getAssociatesByprojetInfoId') {//获取某个项目的所有关联人
        getAssociatesByprojetInfoId(req, res)
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
            PROJECTNAME:'',
            ASSOCIATE:'',
        };
        if(doc.project_info_id){
            let project_info=await tb_project_info.findOne({
                where:{
                    project_info_id:doc.project_info_id
                }
            })
            returnData.PROJECTNAME=project_info?project_info.project_name:'';
        }
        if(doc.project_info_id&&doc.associated_person_id){
            let associated_person=await tb_associated_person.findOne({
                where:{
                    project_info_id:doc.project_info_id,
                    associated_person_id:doc.associated_person_id
                }
            })
            returnData.ASSOCIATE=associated_person?associated_person.associated_name:'';
        }
        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
// 增加项目关联人
async function addAssociateAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [];
        console.log(doc);
        let addAssociate = await tb_associated_person.create({
            domain_id: user.domain_id,
            project_info_id: doc.project_info_id,
            associated_name: doc.associated_name,
            associated_birthday: doc.associated_birthday,
            associated_phone: doc.associated_phone,
            associated_wecat: doc.associated_wecat,
            associated_qq: doc.associated_qq,
            associated_hobby: doc.associated_hobby,
            role_descried: doc.role_descried,
        });
        common.sendData(res, addAssociate);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
};
// 增加项目关联人亲友
async function addRelativesAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [];
        console.log(doc);
        let addRelative = await tb_associated_relatives.create({
            domain_id: user.domain_id,
            associated_person_id: doc.associated_person_id,
            relative_name: doc.relative_name,
            relative_birthday: doc.relative_birthday,
            relative_phone: doc.relative_phone,
            relative_wecat: doc.relative_wecat,
            relative_qq: doc.relative_qq,
            relative_hobby: doc.relative_hobby,
            relationship: doc.relationship
        });
        common.sendData(res, addRelative);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
};
//修改项目关联人
async function modifyAssociateAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let associated_person = await tb_associated_person.findOne({
            where: {
                associated_person_id: doc.associated_person_id
            }
        });
        if (associated_person) {
            associated_person.associated_name= doc.associated_name,
            associated_person.associated_birthday= doc.associated_birthday,
            associated_person.associated_phone= doc.associated_phone,
            associated_person.associated_wecat= doc.associated_wecat,
            associated_person.associated_qq= doc.associated_qq,
            associated_person.associated_hobby= doc.associated_hobby,
            associated_person.role_descried= doc.role_descried,
            await associated_person.save();
            common.sendData(res, associated_person)
        } else {
            common.sendError(res, 'associated_person_02');
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};
//修改项目关联人亲友
async function modifyRelativesAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let associated_relatives = await tb_associated_relatives.findOne({
            where: {
                associated_relatives_id: doc.associated_relatives_id
            }
        });
        if (associated_relatives) {
            associated_relatives.relative_name= doc.relative_name,
            associated_relatives.relative_birthday= doc.relative_birthday,
            associated_relatives.relative_phone= doc.relative_phone,
            associated_relatives.relative_wecat= doc.relative_wecat,
            associated_relatives.relative_qq= doc.relative_qq,
            associated_relatives.relative_hobby= doc.relative_hobby,
            associated_relatives.relationship= doc.relationship,
            await associated_relatives.save();
            common.sendData(res, associated_relatives)
        } else {
            common.sendError(res, 'associated_relatives_02');
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};
//删除项目关联人
async function deleteAssociateAct(req, res) {
    try {
        const { body } = req;
        const { associated_person_id } = body;

        const result = await tb_associated_person.findOne({
            where: {
                associated_person_id
            }
        });
        if (result) {
            //亲友信息也要删除
            let queryStr = `update tbl_erc_associated_relatives set state = 0 where associated_person_id = ?`;
            replacements = [associated_person_ide];
            let result = await sequelize.query(queryStr, {
                replacements: replacements,
                state: GLBConfig.ENABLE
            });
            result.state = GLBConfig.DISABLE;
            await result.save();
            
        }

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//删除项目关联人亲友
async function deleteRelativesAct(req, res) {
    try {
        const { body } = req;
        const { associated_relatives_id } = body;

        const result = await tb_associated_relatives.findOne({
            where: {
                associated_relatives_id
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
//查询获取项目关联人
async function searchAssociateAct(req, res) {
    try {
        let returnData = {};
        const { body, user } = req;
        const { project_info_id,associated_name,associated_phone } = body;
        const { domain_id } = user;

        let query={
            domain_id:domain_id,
            project_info_id:project_info_id,
            state: GLBConfig.ENABLE
        };
        if(associated_name){
            query.associated_name={$like:'%'+associated_name+'%'}
        }
        if(associated_phone){
            query.associated_phone={$like:'%'+associated_phone+'%'}
        }
        const associated_person = await tb_associated_person.findAll({
            where: query
        });
        if (associated_person.length) {
            const projectInfo = await tb_project_info.findOne({
                where: {
                    domain_id,
                    project_info_id,
                    state: GLBConfig.ENABLE
                }
            });
            if (projectInfo) {
                const { project_name } = projectInfo;
                for (let ap of associated_person) {
                    ap.dataValues.associated_birthday = ap.dataValues.associated_birthday ? ap.dataValues.associated_birthday.Format('yyyy-MM-dd') : null;
                    ap.dataValues.project_name = project_name;
                }
            }
        }
        returnData.total = associated_person.length?associated_person.length:'0';
        returnData.rows = associated_person;
        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
//查询获取项目关联人亲友
async function searchRelativesAct(req, res) {
    try {
        let returnData = {};
        const { body, user } = req;
        const { associated_person_id,project_info_id,relative_name,relative_phone } = body;
        const { domain_id } = user;

        let query={
            domain_id:domain_id,
            associated_person_id:associated_person_id,
            state: GLBConfig.ENABLE
        };
        if(relative_name){
            query.relative_name={$like:'%'+relative_name+'%'}
        }
        if(relative_phone){
            query.relative_phone={$like:'%'+relative_phone+'%'}
        }
        const associated_relatives = await tb_associated_relatives.findAll({
            where:query
        });
        const associated_person = await tb_associated_person.findOne({
            where: {
                domain_id,
                associated_person_id,
                state: GLBConfig.ENABLE
            }
        });
        const { associated_name } = associated_person;
        if (associated_relatives.length) {
            const projectInfo = await tb_project_info.findOne({
                where: {
                    domain_id,
                    project_info_id,
                    state: GLBConfig.ENABLE
                }
            });
            if (projectInfo) {
                const { project_name } = projectInfo;
                for (let ap of associated_relatives) {
                    ap.dataValues.relative_birthday = ap.dataValues.relative_birthday ? ap.dataValues.relative_birthday.Format('yyyy-MM-dd') : null;
                    ap.dataValues.project_name = project_name;
                    ap.dataValues.associated_name = associated_name;
                }
            }
        }
        returnData.total = associated_relatives.length?associated_relatives.length:'0';
        returnData.rows = associated_relatives;
        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
//查询对应项目关联人列表
async function getAssociatesByprojetInfoId(req, res) {
    const { body, user } = req;
    const{project_info_id}=body;
    try {
        let associated_persons = await tb_associated_person.findAll({
            where: {
                domain_id: user.domain_id,
                project_info_id:project_info_id,
                state: GLBConfig.ENABLE
            }
        });
        for(let ap of associated_persons){
            ap.dataValues.associated_birthday = ap.dataValues.associated_birthday ? ap.dataValues.associated_birthday.Format('yyyy-MM-dd') : null;
        }
        return common.sendData(res, associated_persons);
    } catch (e) {
        common.sendFault(res, e);
    }
};