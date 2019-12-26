
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCDevelopControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const moment = require('moment');
const sequelize = model.sequelize;

const task = require('../baseconfig/ERCTaskListControlSRV');
const tb_department = model.erc_department;
const tb_develop = model.erc_develop;
const tb_task = model.erc_task;
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;
const tb_user = model.common_user;

//研发项目接口
exports.ERCDevelopControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'getManagerInfo') {
        getManagerInfo(req, res);
    } else if (method === 'search'){
        searchAct(req,res)
    } else if (method === 'delete'){
        deleteAct(req,res)
    } else if (method==='add'){
        addAct(req,res)
    } else if (method==='modify'){
        modifyAct(req,res)
    } else if (method==='sendDevelopTask'){
        sendDevelopTask(req,res)
    } else if (method === 'changeDepartment') {
        changeDepartmentAct(req, res)
    } else if (method === 'changeGroup') {
        changeGroupAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};
// 初始化基础数据
async function initAct(req,res){
    try {
        let user = req.user;

        let returnData = {
            departmentInfo:[],//归属部门
            projectState:GLBConfig.DEVELOPPROJECTSTATE,//项目状态
            checkState:GLBConfig.DEVELOPCHECKSTATE,//验收状态
            userInfo: req.user
        };

        let userGroup = await tb_department.findAll({
            where: {
                domain_id: user.domain_id,
            }
        });
        for(let u of userGroup){
            returnData.departmentInfo.push({
                id:u.department_id,
                value:u.department_name,
                text:u.department_name
            })
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 查询研发项目责任人
async function getManagerInfo(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        let queryStr = 'select t.*,ct.user_form,ct.entry_date,ct.departure_date,ct.departure_reason,' +
            'ct.departure_remark,ut1.usergroup_name p_usergroup_name,ut2.usergroup_name,dt.department_name,pt.position_name ' +
            'from tbl_common_user t ' +
            'left join tbl_erc_customer ct on t.user_id = ct.user_id ' +
            'left join tbl_common_usergroup ut1 on t.p_usergroup_id = ut1.usergroup_id ' +
            'left join tbl_common_usergroup ut2 on t.usergroup_id = ut2.usergroup_id ' +
            'left join tbl_erc_custorgstructure ot on t.user_id = ot.user_id and ot.state=1 ' +
            'left join tbl_erc_department dt on ot.department_id = dt.department_id and dt.state=1 ' +
            'left join tbl_erc_position pt on ot.position_id = pt.position_id and pt.state=1 ' +
            'where t.domain_id = ? and t.user_type = ?';
        let replacements = [user.domain_id];
        replacements.push(GLBConfig.TYPE_OPERATOR);
        if(doc.departmant_id){
            queryStr += ' and dt.department_id = ?';
            replacements.push(doc.departmant_id);
        }
        let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        returnData.marangerInfo = [];

        for (let ap of result) {
            returnData.marangerInfo.push({
                id:ap.user_id,
                value:ap.username,
                text:ap.username
            })
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }

}
// 查询研发项目列表
async function searchAct(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];

        let queryStr = `select a.*,d.department_name,
            u2.name as develop_creator,u3.name as develop_acceptor,u4.name as develop_examine   
            from tbl_erc_develop a 
            left join tbl_erc_department d on (a.develop_departmant_id = d.department_id and d.state = 1) 
            left join tbl_common_user u2 on (a.develop_creator = u2.user_id and u2.state=1)
            left join tbl_common_user u3 on (a.develop_acceptor = u3.user_id and u3.state=1) 
            left join tbl_common_user u4 on (a.develop_examine = u4.user_id and u4.state=1)
            where a.domain_id = ? and a.state = 1 `;
        replacements.push(user.domain_id);
        if (doc.search_text) {
            queryStr += ` and (a.develop_code like ? or a.develop_name like ?) `;
            let search_text = `%${doc.search_text}%`;
            replacements.push(search_text);
            replacements.push(search_text);
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let ap of result.data) {
            let d = JSON.parse(JSON.stringify(ap));
            delete d.pwaaword;
            d.created_at = ap.created_at ? moment(ap.created_at).format("YYYY-MM-DD") : null;
            d.updated_at = ap.updated_at ? moment(ap.updated_at).format("YYYY-MM-DD") : null;
            d.develop_examine_time = ap.develop_examine_time ? moment(ap.develop_examine_time).format("YYYY-MM-DD") : null;
            d.develop_acceptor_time = ap.develop_acceptor_time ? moment(ap.develop_acceptor_time).format("YYYY-MM-DD") : null;

            returnData.rows.push(d)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 删除研发项目
async function deleteAct(req,res){
    try {
        let doc = common.docTrim(req.body);
        let develop = await tb_develop.findOne({
            where: {
                develop_id: doc.develop_id
            }
        });
        if (develop) {
            develop.state = GLBConfig.DISABLE;
            await develop.save();
        } else {
            common.sendError(res, 'develop_01');
            return
        }
        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
// 增加研发项目
async function addAct(req,res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'研发项目新增审核任务'
            }
        });
        let taskallotuser = await tb_taskallotuser.findOne({
            where:{
                state:GLBConfig.ENABLE,
                domain_id: user.domain_id,
                taskallot_id:taskallot.taskallot_id
            }
        });

        if (!taskallotuser) {
            return common.sendError(res, 'develop_32');
        }else{

            let addDevelop = await tb_develop.create({
                develop_code: await Sequence.genDevelopID(user),
                domain_id: user.domain_id,
                develop_name: doc.develop_name,
                develop_budget: 0,
                develop_departmant_id:doc.develop_departmant_id,
                develop_manager: doc.develop_manager,
                develop_agelimit: doc.develop_agelimit,
                develop_way: doc.develop_way,
                develop_creator: user.user_id,
                develop_project_state: 1,
                develop_check_state: 0,
                develop_examine:'',
                develop_acceptor:'',
                develop_remark:doc.develop_remark,
                develop_format:doc.develop_format,
                develop_unit:doc.develop_unit
            });

            let taskName = '研发项目新增审核任务';
            let taskDescription = addDevelop.develop_name ;
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user,taskName,50,taskallotuser.user_id,addDevelop.develop_id,taskDescription,'',groupId);
            if(!taskResult){
                return common.sendError(res, 'task_01');
            }else {
                common.sendData(res, addDevelop);
            }
        }

    } catch (error) {
        common.sendFault(res, error);
    }
}
// 修改研发项目
async function modifyAct(req,res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let develop = await tb_develop.findOne({
            where: {
                develop_id: doc.develop_id
            }
        });

        if (develop) {
            develop.develop_name = doc.develop_name;
            develop.develop_departmant_id = doc.develop_departmant_id;
            develop.develop_manager = doc.develop_manager;
            develop.develop_agelimit = doc.develop_agelimit;
            develop.develop_way = doc.develop_way;
            develop.develop_remark = doc.develop_remark;
            develop.develop_format = doc.develop_format;
            develop.develop_unit = doc.develop_unit;
            await develop.save();
            common.sendData(res, develop);
        } else {
            common.sendError(res, 'develop_01')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}
// 发送审核任务
async function sendDevelopTask(req,res){
    try{
        //再次提交
        let doc = common.docTrim(req.body), user = req.user;
        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'待摊资产项目新增审核任务'
            }
        });
        let taskallotuser = await tb_taskallotuser.findOne({
            where:{
                state:GLBConfig.ENABLE,
                domain_id: user.domain_id,
                taskallot_id:taskallot.taskallot_id
            }
        });

        if (!taskallotuser) {
            return common.sendError(res, 'develop_32');
        }else{
            let taskName = '研发项目新增审核任务';
            let taskDescription = doc.develop_name + '  研发项目新增审核任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user,taskName,50,taskallotuser.user_id,doc.develop_id,taskDescription,'',groupId);
            if(!taskResult){
                return common.sendError(res, 'task_01');
            }else {
                await tb_develop.update({
                    develop_project_state:1
                }, {
                    where: {
                        develop_id:doc.develop_id
                    }
                });
                common.sendData(res,taskResult);
            }
        }
    }catch (error){
        common.sendFault(res, error);
    }
}

// 修改所属部门
async function changeDepartmentAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        if (doc.users[0]) {
            let u =doc.users[0]
            let userGroup = await tb_department.findOne({
                where: {
                    domain_id: user.domain_id,
                    department_id: u.department_id
                }
            });

            returnData.userDepartmentId=userGroup.department_id;
            returnData.userDepartmentName=userGroup.department_name;

        } else {
            returnData.userDepartmentId=null;
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

// 修改管理责任人
async function changeGroupAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        let u =doc.users[0]

        let meeting = await tb_user.findOne({
            where: {
                domain_id: u.domain_id,
                user_id: u.user_id
            }
        });
        returnData.meetingId=meeting.user_id;
        returnData.meetingName=meeting.name;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

// 修改研发项目审核状态
async function modifyDevelopState(applyState,description,develop_id,applyApprover){
    await tb_develop.update({
        develop_project_state:applyState,
        develop_examine_time:new Date(),
        develop_examine:applyApprover,
        develop_refuse_remark:description
    }, {
        where: {
            develop_id:develop_id
        }
    });
}

exports.modifyDevelopState = modifyDevelopState;