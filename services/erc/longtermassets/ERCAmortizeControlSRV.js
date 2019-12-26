
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCAmortizeControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const moment = require('moment');
const sequelize = model.sequelize;

const task = require('../baseconfig/ERCTaskListControlSRV');
const tb_department = model.erc_department;
const tb_amortize = model.erc_amortize;
const tb_task = model.erc_task;
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;
const tb_user = model.common_user;

// 待摊资产接口
exports.ERCAmortizeControlResource = (req, res) => {
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
    } else if (method==='sendAmortizeTask'){
        sendAmortizeTask(req,res)
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
            amortizedInfo: GLBConfig.AMORTIZED,//摊销方法
            departmentInfo:[],//归属部门
            projectState:GLBConfig.AMORTIZEPROJECTSTATE,//项目状态
            checkState:GLBConfig.AMORTIZECHECKSTATE,//验收状态
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
// 查询待摊资产管理责任人
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
        if(doc.department_id){
            queryStr += ' and dt.department_id = ?';
            replacements.push(doc.department_id);
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
// 查询待摊资产列表
async function searchAct(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {},replacements=[];

        let queryStr = `select a.*,d.department_name,
            u1.name as amortize_manager,u2.name as amortize_creator,u3.name as amortize_acceptor,u4.name as amortize_examine   
            from tbl_erc_amortize a 
            left join tbl_erc_department d on (a.amortize_departmant_id = d.department_id and d.state = 1) 
            left join tbl_common_user u1 on (a.amortize_manager = u1.user_id and u1.state=1) 
            left join tbl_common_user u2 on (a.amortize_creator = u2.user_id and u2.state=1)
            left join tbl_common_user u3 on (a.amortize_acceptor = u3.user_id and u3.state=1) 
            left join tbl_common_user u4 on (a.amortize_examine = u4.user_id and u4.state=1)
            where a.domain_id = ? and a.state = 1 `;
        replacements.push(user.domain_id);
        if (doc.search_text) {
            queryStr += ` and (a.amortize_code like ? or a.amortize_name like ?) `;
            let search_text = `%${doc.search_text}%`;
            replacements.push(search_text);
            replacements.push(search_text);
        }
        if (doc.amortize_id) {
            queryStr += ` and a.amortize_id=? `;
            replacements.push(doc.amortize_id);
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements)

        returnData.total = result.count
        returnData.rows = []
        for (let ap of result.data) {
            let d = JSON.parse(JSON.stringify(ap))
            delete d.pwaaword;
            d.created_at = ap.created_at ? moment(ap.created_at).format("YYYY-MM-DD") : null;
            d.updated_at = ap.updated_at ? moment(ap.updated_at).format("YYYY-MM-DD") : null;
            d.amortize_examine_time = ap.amortize_examine_time ? moment(ap.amortize_examine_time).format("YYYY-MM-DD") : null;
            d.amortize_acceptor_time = ap.amortize_acceptor_time ? moment(ap.amortize_acceptor_time).format("YYYY-MM-DD") : null;

            returnData.rows.push(d)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 删除待摊资产
async function deleteAct(req,res){
    try {
        let doc = common.docTrim(req.body);
        let amortize = await tb_amortize.findOne({
            where: {
                amortize_id: doc.amortize_id
            }
        });
        if (amortize) {
            amortize.state = GLBConfig.DISABLE;
            await amortize.save();
        } else {
            common.sendError(res, 'amortize_01');
            return
        }
        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
// 新增待摊资产，并且发送审核
async function addAct(req,res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

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
            return common.sendError(res, 'amortize_32');
        }else{

            let addAmortize = await tb_amortize.create({
                amortize_code: await Sequence.genAmortizedID(user),
                domain_id: user.domain_id,
                amortize_name: doc.amortize_name,
                amortize_budget: 0,
                amortize_departmant_id:doc.amortize_departmant_id,
                amortize_manager: doc.amortize_manager,
                amortize_agelimit: doc.amortize_agelimit,
                amortize_way: doc.amortize_way,
                amortize_creator: user.user_id,
                amortize_project_state: 1,
                amortize_check_state: 0,
                amortize_examine:'',
                amortize_acceptor:'',
                amortize_remark:doc.amortize_remark
            });

            let taskName = '待摊资产项目新增审核任务';
            let taskDescription = addAmortize.amortize_name + '  固定资产申购审批任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user,taskName,32,taskallotuser.user_id,addAmortize.amortize_id,taskDescription,'',groupId);
            if(!taskResult){
                return common.sendError(res, 'task_01');
            }else {
                common.sendData(res, addAmortize);
            }
        }

    } catch (error) {
        common.sendFault(res, error);
    }
}
// 修改待摊资产，必须在审核拒绝或者为发送审核状态
async function modifyAct(req,res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let amortize = await tb_amortize.findOne({
            where: {
                amortize_id: doc.amortize_id
            }
        });

        if (amortize) {
            amortize.amortize_name = doc.amortize_name;
            amortize.amortize_departmant_id = doc.amortize_departmant_id;
            amortize.amortize_manager = doc.amortize_manager;
            amortize.amortize_agelimit = doc.amortize_agelimit;
            amortize.amortize_way = doc.amortize_way;
            amortize.amortize_remark = doc.amortize_remark;
            await amortize.save();
            common.sendData(res, amortize);
        } else {
            common.sendError(res, 'amortize_01')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}
// 该function废弃
async function sendAmortizeTask(req,res){
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
            return common.sendError(res, 'amortize_32');
        }else{
            let taskName = '待摊资产项目新增审核任务';
            let taskDescription = doc.amortize_name + '  待摊资产项目新增审核任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user,taskName,32,taskallotuser.user_id,doc.amortize_id,taskDescription,'',groupId);
            if(!taskResult){
                return common.sendError(res, 'task_01');
            }else {
                await tb_amortize.update({
                    amortize_project_state:1
                }, {
                    where: {
                        amortize_id:doc.amortize_id
                    }
                });
                common.sendData(res,taskResult);
            }
        }
    }catch (error){
        common.sendFault(res, error);
    }
}
// 修改待摊资产归属部门
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
// 修改待摊资产责任管理人
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
// 待摊资产任务审核后，修改状态{
// 'value': '1', 'text': '待审核'
// 'value': '2', 'text': '已通过'
// 'value': '3', 'text': '已驳回'
async function modifyAmortizeState(applyState,description,amortize_id,applyApprover){
    await tb_amortize.update({
        amortize_project_state:applyState,
        amortize_examine_time:new Date(),
        amortize_examine:applyApprover,
        amortize_refuse_remark:description
    }, {
        where: {
            amortize_id:amortize_id
        }
    });
}

exports.modifyAmortizeState = modifyAmortizeState;
