const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCProjectInfoControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');
// const task = require('../baseconfig/ERCTaskListControlSRV');

const tb_project_info = model.erc_project_info;//项目信息model
const tb_project_customer = model.erc_project_customer;//项目客户信息
const tb_project_workleaders = model.erc_project_workleaders;//项目-工作责任人关联
const tb_project_contract = model.erc_project_contract;//项目合同信息model
const tb_project_milestone =model.erc_project_milestone;//项目里程碑
const tb_project_milestone_problem =model.erc_project_milestone_problem;//项目里程碑问题
const tb_analysis_record = model.erc_project_analysis_record;//项目推动分析
const tb_associated_person = model.erc_associated_person;//项目关联人信息model
const tb_associated_active = model.erc_associated_active;//项目关联人活动
const tb_associated_relatives = model.erc_associated_relatives;//项目关联人亲友
const tb_associated_feedback = model.erc_associated_feedback;//项目关联人反馈


// 项目信息增删改查接口
exports.ERCProjectInfoControlResource = (req, res) => {
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
    } else if (method === 'getProjectInfoList') {//获取未结束的项目
        getProjectInfoList(req, res)
    } else if (method === 'getAllProjectInfoList') {//获取所有的项目
        getAllProjectInfoList(req, res)
    } else if (method === 'getProjectForAcceptance') {//获取项目用于验收：里程碑全部验收的项目
        getProjectForAcceptance(req, res)
    } else if (method === 'getProjectForEvaluate') {//获取项目用于评价
        getProjectForEvaluate(req, res)
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
            // customerInfo: []
        };
        // let project_customers = await tb_project_customer.findAll({
        //     where: {
        //         domain_id: req.user.domain_id,
        //         state: GLBConfig.ENABLE
        //     }
        // });
        // for (let l of project_customers) {
        //     returnData.customerInfo.push({
        //         id: l.project_customer_id,
        //         value: l.project_customer_id,
        //         text: l.full_name
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
        console.log(doc);
        let addPeojectInfo = await tb_project_info.create({
            domain_id: user.domain_id,
            project_number: doc.project_number,
            project_name: doc.project_name,
            project_address: doc.project_address,
            project_customer_id: doc.project_customer_id,
            customer_id: doc.customer_id,
            project_state: doc.project_state,
        });
        //增加项目-工作责任人关联表记录
        if (addPeojectInfo&&doc.user_ids) {
            let userIdsArr = doc.user_ids.split(",");
            for (let userId of userIdsArr) {
                let addProjectInfo_User = await tb_project_workleaders.create({
                    domain_id: user.domain_id,
                    project_info_id: addPeojectInfo.project_info_id,
                    user_id: userId
                });
            }

        }

        common.sendData(res, addPeojectInfo);

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
        let project_info = await tb_project_info.findOne({
            where: {
                project_info_id: doc.project_info_id
            }
        });
        if (project_info) {
            project_info.project_number = doc.project_number,
                project_info.project_name = doc.project_name,
                project_info.project_address = doc.project_address,
                project_info.project_customer_id = doc.project_customer_id,
                project_info.customer_id = doc.customer_id,
                project_info.project_state = doc.project_state,
                await project_info.save();
            if (doc.user_ids) {
                const deleteResult = await tb_project_workleaders.destroy({
                    where: {
                        project_info_id: doc.project_info_id
                    }
                });
                let userIdsArr = doc.user_ids.split(",");
                console.log(userIdsArr);
                for (let userId of userIdsArr) {
                    let project_workleaders = await tb_project_workleaders.create({
                        domain_id: user.domain_id,
                        project_info_id: doc.project_info_id,
                        user_id: userId
                    });
                }
            }
            common.sendData(res, project_info)
        } else {
            common.sendError(res, 'project_info_02');
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};
//删除项目信息
async function deleteAct(req, res) {
    try {
        const { body } = req;
        const { project_info_id } = body;

        const result = await tb_project_info.findOne({
            where: {
                project_info_id
            }
        });
        //结束的项目才允许删除
        // let projectCount = await tb_project.count({
        //     where: {
        //         project_info_id: project_info_id
        //     }
        // });

        if (result) {
            result.state = GLBConfig.DISABLE;
            await result.save();
            // await tb_project_workleaders.update({
            //     state : GLBConfig.DISABLE
            // }, {
            //     where: {
            //         project_info_id: result.project_info_id
            //     }
            // });
           
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
async function getWorkUsers(req, res) {
    const { body, user } = req;
    try {
        const { project_info_id } = body;
        const { domain_id } = user;
        let replacements = [];
        let queryStr = 'select cu.user_id, cu.name, cu.phone, pst.position_name from tbl_erc_project_info t' +
            ' left join tbl_erc_project_workleaders pw on t.project_info_id=pw.project_info_id' +
            ' left join tbl_common_user cu on pw.user_id=cu.user_id' +
            ' left join tbl_erc_custorgstructure ctt on ctt.user_id = cu.user_id' +
            ' left join tbl_erc_position pst on ctt.position_id = pst.position_id' +
            ' where t.project_info_id=? and t.state=1 and cu.user_id is not null and t.domain_id=?';
        replacements.push(project_info_id);
        replacements.push(domain_id);
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        common.sendData(res, result);
    } catch (e) {
        common.sendFault(res, e);
    }
};
//获取项目信息
async function getData(req, res, is_single, doc) {
    let user = req.user;
    let replacements = [];

    // let queryStr = 'select t.*,cu.name as manage_name,pc.full_name,\'\' as owner_names from tbl_erc_project_info t' +
        let queryStr = 'select t.*,cu.name as manage_name,pc.full_name,GROUP_CONCAT(pcu.name) as owner_names,pa.project_acceptance_id from tbl_erc_project_info t'+
        ' left join tbl_common_user cu on cu.user_id = t.customer_id' +
        ' left join tbl_erc_project_customer pc on t.project_customer_id=pc.project_customer_id' +
        ' left join tbl_erc_project_acceptance pa on t.project_info_id=pa.project_info_id' +
        ' left join tbl_erc_project_workleaders pw on t.project_info_id=pw.project_info_id'+
        ' left join tbl_common_user pcu on pw.user_id=pcu.user_id'+
        ' where t.state = 1 and t.domain_id = ?';
    replacements.push(user.domain_id);

    if (doc.project_name) {
        queryStr += ' and t.project_name like ?';
        replacements.push('%' + doc.project_name + '%');
    }
    if (doc.project_number) {
        queryStr += ' and t.project_number like ?';
        replacements.push('%' + doc.project_number + '%');
    }
    if (doc.project_leadername) {
        queryStr += ' and cu.name like ?';
        replacements.push('%' + doc.project_leadername + '%');
    }
    queryStr += ' group by t.project_info_id';
    queryStr += ' order by t.created_at desc';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.check_date = r.check_date ? r.check_date.Format('yyyy-MM-dd') : null;
        // let queryStr1 = 'select GROUP_CONCAT(pcu.name) owner_names from tbl_erc_project_info t' +
        //     ' left join tbl_erc_project_workleaders pw on t.project_info_id=pw.project_info_id' +
        //     ' left join tbl_common_user pcu on pw.user_id=pcu.user_id' +
        //     ' where t.project_info_id= ? group by t.project_info_id';
        // let replacements1 = [r.project_info_id];

        // let queryRst1 = await sequelize.query(queryStr1, {
        //     replacements: replacements1,
        //     type: sequelize.QueryTypes.SELECT,
        //     state: GLBConfig.ENABLE
        // });
        // if (queryRst1) {
        //     r.owner_names = queryRst1[0].owner_names;
        // }
    }

    // console.log(result);
    if (is_single == true) {
        return result.data[0];
    } else {
        return result;
    }
};
//获取未验收结束的项目信息列表
async function getProjectInfoList(req, res) {
    try {
        const { body, user } = req;
        let replacements = [];
    let queryStr = 'select t.*,u.name as manage_name from tbl_erc_project_info t ' +
            ' left join tbl_erc_project_acceptance pa on pa.project_info_id=t.project_info_id'+
            ' left join tbl_common_user u on u.user_id=t.customer_id'+
            ' where t.state=1  and t.domain_id=? and pa.project_acceptance_id is null';
        queryStr += ' order by t.project_info_id,t.customer_id,t.created_at desc';
        replacements.push(user.domain_id);
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
        }
        return common.sendData(res, result.data);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function getAllProjectInfoList(req, res) {
    try {
        const { body, user } = req;
        let replacements = [];
    let queryStr = 'select t.*,u.name as manage_name from tbl_erc_project_info t ' +
            ' left join tbl_common_user u on u.user_id=t.customer_id'+
            ' where t.state=1  and t.domain_id=?';
        queryStr += ' order by t.project_info_id,t.customer_id,t.created_at desc';
        replacements.push(user.domain_id);
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
        }
        return common.sendData(res, result.data);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function getProjectForAcceptance(req, res) {
    try {
        const { body, user } = req;
        // const { purchase_id, purchase_type_id } = body;
        let replacements = [];

    let queryStr = 'select t.* from (select tp.*,u.name as manage_name,avg(pm.acceptance_status) as sta from tbl_erc_project_info tp ' +
            ' left join tbl_erc_project_milestone pm on pm.project_info_id=tp.project_info_id'+
            ' left join tbl_common_user u on u.user_id=tp.customer_id'+
            ' where tp.state=1 and tp.domain_id=? group by tp.project_info_id) t'+
            ' where t.sta=1 or t.sta is null';
        queryStr += ' order by t.project_info_id,t.customer_id,t.created_at desc';
        replacements.push(user.domain_id);
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
        }
        return common.sendData(res, result.data);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
async function getProjectForEvaluate(req, res) {
    try {
        const { body, user } = req;
        // const { purchase_id, purchase_type_id } = body;
        let replacements = [];

    let queryStr = 'select t.*,u.name as manage_name from tbl_erc_project_info t ' +
            ' left join tbl_common_user u on u.user_id=t.customer_id'+
            ' inner join tbl_erc_project_acceptance pa on pa.project_info_id=t.project_info_id'+
            ' where t.state=1 and t.project_state=3 and t.domain_id=?';
        queryStr += ' order by t.project_info_id,t.customer_id,t.created_at desc';
        replacements.push(user.domain_id);
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.updated_at = r.updated_at ? r.updated_at.Format('yyyy-MM-dd') : null;
        }
        return common.sendData(res, result.data);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
