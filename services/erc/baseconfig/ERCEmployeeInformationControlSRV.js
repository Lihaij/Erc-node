/**
 * Created by shuang.liu on 18/3/9.
 */
const fs = require('fs');
const path = require('path');
const iconvLite = require('iconv-lite');
const config = require('../../../config');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCEmployeeInformationControlSRV');
const model = require('../../../model');
const moment = require('moment');
const KujialeSRV = require('../../openapi/KujialeSRV');
const ERCAccountingControlSRV = require('../cashiermanage/ERCAccountingControlSRV');
const task = require('../baseconfig/ERCTaskListControlSRV');
const RecordingVouchersc = require('../../../util/RecordingVouchersc');


const sequelize = model.sequelize;
const tb_usergroup = model.common_usergroup;
const tb_user = model.common_user;
const tb_customer = model.erc_customer;
const tb_user_contract = model.erc_customercontract;
const tb_user_work_experience = model.erc_customerworkexperience;
const tb_uploadfile = model.erc_uploadfile;
const tb_custorgstructure = model.erc_custorgstructure;
const tb_department = model.erc_department;
const tb_position = model.erc_position;
const tb_operator = model.erc_operator;
const tb_task = model.erc_task;
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;
const tb_procedure = model.erc_productionprocedure
const tb_userprocedure = model.erc_userprocedure
//人力资源管理->员工信息列表
exports.ERCEmployeeInformationControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'add_c') {
        addContractAct(req, res)
    } else if (method === 'add_e') {
        addExperienceAct(req, res)
    } else if (method === 'modify_c') {
        modifyContractAct(req, res)
    } else if (method === 'modify_e') {
        modifyExperienceAct(req, res)
    } else if (method === 'usergroup') {
        //岗位联动列表
        getUserGroupAct(req, res)
    } else if (method === 'search_d') {
        searchDetailAct(req, res)
    } else if (method === 'departure') {
        departureAct(req, res)
    } else if (method === 'upload') {
        upload(req, res)
    } else if (method === 'importUser') {
        importUser(req, res)
    }  else if (method === 'uploadimg') {
        uploadImgAct(req, res)
    } else if (method === 'search_files') {
        searchFilesAct(req, res);
    } else if (method==='upload_t'){
        uploadTitleAct(req,res)
    } else if (method === 'add_i') {
        addImgAct(req, res)
    }  else if (method === 'search_di') {
        searchDetailImgAct(req, res)
    } else if (method === 'downloadEmployee') {
        downloadEmployee(req, res)
    } else if (method === 'search_g') {
        searchGroupAct(req, res)
    } else if (method === 'search_user') {
        searchUserGroupAct(req, res)
    } else if (method === 'changeGroup') {
        changeGroupAct(req, res)
    } else if (method === 'upload_dr') {
        uploadDRAct(req, res)
    } else if (method === 'change_group') {
        newChangeGroupAct(req, res)
    } else if (method === 'search_k') {
        searchKuAct(req, res)
    } else if (method === 'add_k') {
        addKuAct(req, res)
    }  else if (method === 'set_user_state') {
        setUserStateAct(req, res)
    } else if (method === 'delete_experience') {
        deleteExperienceAct(req, res);
    } else if (method==='get_complete_degree_task'){
        searchTaskCompleteAct(req,res);
    } else if (method==='get_subordinate_employee'){
        getSubordinateEmployeeAct(req,res);
    } else if (method==='leave_office'){
        leaveOfficeAct(req,res);
    } else if (method==='calculate_day'){//非计件员工按天计提
        calculateDayAct(req,res);
    } else if (method==='calculate_month'){//计件员工月计提
        calculateMonthAct(req,res);
    } else if (method==='calculate_by_day'){//计件员工天计提
        calculateByDayAct(req,res);
    } else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    let doc = req.body
    let returnData = {
        staffInfo: []
    };
    let replacements = [];
    let replacements1 = [];
    let replacements2 = [];
    let replacements3 = [];
    let user = req.user;
    try{
        // let queryStr = 'select * from tbl_common_usergroup t ' +
        //     'where t.domain_id=? and t.usergroup_type=01 and t.parent_id=0'
        let queryStr = 'select t.department_id as id,t.department_name as text from tbl_erc_department t ' +
            'where t.domain_id=? and state=1';
        replacements.push(user.domain_id);

        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT,
            state: GLBConfig.ENABLE
        });

        let staff = await tb_user.findAll({
            where: {
                user_type: '01',
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id
            }
        });
        for (let s of staff) {
            returnData.staffInfo.push({
                id: (s.user_id).toString(),
                value: (s.user_id).toString(),
                text: s.name
            });
        }

        let groupSql = 'select group_concat(pt.usergroup_id) usergroup from tbl_common_usergroup pt ' +
            'where pt.domain_id=? and pt.parent_id!=0 and pt.usergroup_type=01';
        replacements1.push(user.domain_id);
        let groupStrResult = await sequelize.query(groupSql, {
            replacements: replacements1,
            type: sequelize.QueryTypes.SELECT,
            state: GLBConfig.ENABLE
        });
        let groupStr=null;
        if(groupStrResult && groupStrResult.length>0){
            groupStr=groupStrResult[0].usergroup;
        }

        let queryStr2 = 'select 0 as id,dt.domain_name as text,0 parent_id from tbl_common_domain dt where dt.domain_id=? UNION ALL ' +
            'select t.usergroup_id as id,t.usergroup_name as text,t.parent_id from tbl_common_usergroup t ' +
            'where t.domain_id=? and t.parent_id!=0 and t.usergroup_type=01';
        replacements2.push(user.domain_id);
        replacements2.push(user.domain_id);
        if (groupStr){
            queryStr2 += ' and not FIND_IN_SET (t.parent_id,?)';
            replacements2.push(groupStr)
        }
        let queryRst2 = await sequelize.query(queryStr2, {
            replacements: replacements2,
            type: sequelize.QueryTypes.SELECT,
            state: GLBConfig.ENABLE
        });

        let queryStr3 = 'select b.reimburserank_id as id,b.reimburserank_name as text from tbl_common_domain a left join tbl_erc_reimburserank b on a.domain_id = b.domain_id' +
            ' where b.domain_id = ? and b.state = 1 ';
        replacements3.push(user.domain_id);

        let queryRst3 = await sequelize.query(queryStr3, {
            replacements: replacements3,
            type: sequelize.QueryTypes.SELECT,
            state: GLBConfig.ENABLE
        });


        returnData.roleList=queryRst2;
        returnData.pGroupList=queryRst;
        returnData.reimbursList=queryRst3;
        returnData.userInfo = req.user;
        returnData.genderInfo = GLBConfig.GENDERTYPE;//性别
        returnData.contractInfo = GLBConfig.SALARYTYPE;//薪资类型
        returnData.userStation = GLBConfig.USERSTATION;//用户状态
        returnData.departureReason = GLBConfig.DEPARTUREREASON;//离职原因
        returnData.registerCategory = GLBConfig.REGISTERCATEGORY;//户口类型
        returnData.educationInfo = GLBConfig.EDUCATION;//学位
        returnData.maritalStatus = GLBConfig.MARITALSTATUS;//婚姻状态
        returnData.contractState = GLBConfig.CONTRACTSTATE;//签约状态
        returnData.nationalInfo = GLBConfig.NATIONAL;//民族
        returnData.acceptanceInfo = GLBConfig.ACCEPTANCETYPE;//照片
        returnData.sortingInfo = GLBConfig.SORTINGWAY;//排序方式
        returnData.procedure = await getProcedure(req, res)
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
async function getProcedure(req, res) {
    try {
        let user = req.user;
        let procedure = await tb_procedure.findAll({
            where: {
                state: 1,
                domain_id: user.domain_id
            }
        })

        let returnData = []
        for (let p of procedure) {
            returnData.push({
                id: p.procedure_id,
                value: p.procedure_id,
                text: p.procedure_name
            })
        }
        return returnData
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//岗位联动列表
async function getUserGroupAct(req, res) {

    let doc = req.body
    let returnData = {};
    let replacements = [];
    let user = req.user;

    try{
        let queryStr = 'select t.usergroup_id as id,t.usergroup_name as text from tbl_common_usergroup t ' +
            'where t.parent_id=?'
        replacements.push(doc.p_usergroup_id);

        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT,
            state: GLBConfig.ENABLE
        });
        returnData.groupList=queryRst;

        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return
    }

}

//查询员工信息列表
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        let queryStr = 'select t.*,ct.user_form,ct.entry_date,ct.departure_date,ct.departure_reason,' +
            'ct.departure_remark,ut1.usergroup_name p_usergroup_name,ut2.usergroup_name,dt.department_name,pt.position_name ' +
            'from tbl_common_user t ' +
            'left join tbl_erc_customer ct on t.user_id = ct.user_id '+
            'left join tbl_common_usergroup ut1 on t.p_usergroup_id = ut1.usergroup_id ' +
            'left join tbl_common_usergroup ut2 on t.usergroup_id = ut2.usergroup_id ' +
            'left join tbl_erc_custorgstructure ot on t.user_id = ot.user_id and ot.state=1 ' +
            'left join tbl_erc_department dt on ot.department_id = dt.department_id and dt.state=1 ' +
            'left join tbl_erc_position pt on ot.position_id = pt.position_id and pt.state=1 ' +

            'where t.domain_id = ? and t.user_type = ?';
        let replacements = [user.domain_id];
        replacements.push(GLBConfig.TYPE_OPERATOR);
        if (doc.state) {
            queryStr += ' and t.state = ?';
            replacements.push(doc.state);
        }
        if(doc.user_id){
            queryStr += ' and t.user_id = ?';
            replacements.push(doc.user_id);
        }
        if(doc.department_id){
            queryStr += ' and dt.department_id = ?';
            replacements.push(doc.department_id);
        }
        if(doc.gender){
            queryStr += ' and t.gender = ?';
            replacements.push(doc.gender);
        }
        if (doc.search_text) {
            queryStr += ' and (t.name like ? or t.user_id like ? )';
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text)
        }
        if(doc.createdBTime){
            queryStr+= ' and ct.entry_date>=?';
            replacements.push(doc.createdBTime + ` 00:00:00`)
        }
        if(doc.createdETime){
            queryStr+= ' and ct.entry_date<=?';
            replacements.push(doc.createdETime + ` 23:59:59`)
        }
        if (doc.user_mark === 1) {
            //离职或在职
            queryStr += ' and (ct.user_state <> 0 or ct.user_state is null)';
        } else if (doc.user_mark === 0) {
            //候选人
            queryStr += ' and (ct.user_state = 0 and ct.user_state is not null)';
        }
        // if (doc.entry_date) {
        //     queryStr += ` and ct.entry_date >= ? and ct.entry_date <= ? `;
        //     replacements.push(doc.entry_date + ` 00:00:00`);
        //     replacements.push(doc.entry_date + ` 23:59:59`);
        // }
        if(doc.type==1){
            //按工号排序
            queryStr += ' order by t.user_id';
        }else if(doc.type==2){
            //按入职时间排序
            queryStr += ' order by ct.entry_date';
        }else{
            queryStr += ' order by t.created_at desc';
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements)

        returnData.total = result.count
        returnData.rows = []

        for (let ap of result.data) {
            let d = JSON.parse(JSON.stringify(ap))
            delete d.pwaaword;
            d.entry_date = ap.entry_date ? moment(ap.entry_date).format("YYYY-MM-DD") : null;
            d.departure_date = ap.departure_date ? moment(ap.departure_date).format("YYYY-MM-DD") : null;
            d.evaluate_score = d.evaluate_score / 10;
            returnData.rows.push(d)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//非计件员工按天计提
async function calculateDayAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        let queryStr = `select t.*, c.*, ct.user_form, ot.department_id from tbl_common_user t
        left join tbl_erc_customer ct on t.user_id = ct.user_id
        left join tbl_erc_custorgstructure ot on t.user_id = ot.user_id and ot.state=1
        left join tbl_erc_customercontract c on c.user_id = t.user_id
        where t.domain_id = ? and t.user_type = ? and ct.user_state = 1 and ct.user_form <> 3`;
        let replacements = [user.domain_id,GLBConfig.TYPE_OPERATOR];
        let result = await common.queryPure(sequelize, req, queryStr, replacements);

        for (const r of result.data) {
            //获取当月天数
            const month_days = moment().daysInMonth();
            //一年天数
            let year_days = 365;
            if (moment().isDST()) {//闰年
                year_days = 366;
            }
            let total_money = 0;
            if (r.user_form == '0' || r.user_form == '1') {//月薪制 月薪加提成制
                total_money += (r.total_salary / 100)/month_days
            } else if (r.user_form == '2') {//年薪制
                total_money += (r.total_salary / 100)/year_days
            }

            if (total_money !== 0) {
                await RecordingVouchersc.createRecordingVoucherSCJT('GZJT_3', user, {department_id: r.department_id,amount: total_money});
            }
        }
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//计件员工按月计提，只有达不到基本工资数，才会生成记账凭证
async function calculateMonthAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        const monthFistDay = moment().startOf('month').format('YYYY-MM-DD 00:00:00');
        const monthLastDay = moment().endOf('month').format('YYYY-MM-DD 23:59:59');

        let queryStr = `select t.*, c.*, ct.user_form, ot.department_id from tbl_common_user t
        left join tbl_erc_customer ct on t.user_id = ct.user_id
        left join tbl_erc_custorgstructure ot on t.user_id = ot.user_id and ot.state=1
        left join tbl_erc_customercontract c on c.user_id = t.user_id
        where t.domain_id = ? and t.user_type = ? and ct.user_state = 1 and ct.user_form = '3'`;
        let replacements = [user.domain_id,GLBConfig.TYPE_OPERATOR];
        let result = await common.queryPure(sequelize, req, queryStr, replacements);

        for (const r of result.data) {
            //查询日计划工资
            let sql1 = `select
            sum(p.ppmaster_produce_number  * pp.procedure_cost) as sum_ppmaster_produce_money
            from tbl_erc_ppmaster p
            left join tbl_erc_productionprocedure pp on (p.ppmaster_procedure_id = pp.procedure_id and pp.state = 1)
            where p.state=1 and p.ppmaster_date between '${monthFistDay}' and '${monthLastDay}' and p.ppmaster_user_id = '${r.user_id}'`;
            let result1 = await common.queryPure(sequelize, req, sql1, []);
            let total_money1 = 0;
            if (result1.data.length > 0) total_money1 = result1.data[0].sum_ppmaster_produce_money;

            //查询派工单的工资
           let sql2 =` select 
            sum(p.productdesignate_number  * pp.procedure_cost) as sum_ppmaster_produce_money
            from tbl_erc_productdesignate p
            left join tbl_erc_productionprocedure pp on (p.productdesignate_procedure_id = pp.procedure_id and pp.state = 1)
            where p.state=1 and p.productdesignate_date between '${monthFistDay}' and '${monthLastDay}' and p.productdesignate_user_id='${r.user_id}'`
           let result2 = await common.queryPure(sequelize, req, sql2, []);
           let total_money2 = 0
           if (result2.data.length > 0) total_money2 = result2.data[0].sum_ppmaster_produce_money;

            const total_money = total_money1 + total_money2;
            //如果工资没有达到基本工资，则生成记账凭证
            if (total_money < (r.base_salary / 100)) {
                const money = total_money - (r.base_salary / 100);
                await RecordingVouchersc.createRecordingVoucherSCJT('GZJT_2', user, {department_id: r.department_id,amount: money});
            }
        }
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//计件员工按天计提
async function calculateByDayAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        const nowDay = (new Date).format('YYYY-MM-DD');

        let queryStr = `select t.*, c.*, ct.user_form, ot.department_id from tbl_common_user t
        left join tbl_erc_customer ct on t.user_id = ct.user_id
        left join tbl_erc_custorgstructure ot on t.user_id = ot.user_id and ot.state=1
        left join tbl_erc_customercontract c on c.user_id = t.user_id
        where t.domain_id = ? and t.user_type = ? and ct.user_state = 1 and ct.user_form = '3'`;
        let replacements = [user.domain_id,GLBConfig.TYPE_OPERATOR];
        let result = await common.queryPure(sequelize, req, queryStr, replacements);

        for (const r of result.data) {
            //查询日计划工资
            let sql1 = `select
            sum(p.ppmaster_produce_number  * pp.procedure_cost) as sum_ppmaster_produce_money
            from tbl_erc_ppmaster p
            left join tbl_erc_productionprocedure pp on (p.ppmaster_procedure_id = pp.procedure_id and pp.state = 1)
            where p.state=1 and p.ppmaster_date = '${nowDay}' and p.ppmaster_user_id = '${r.user_id}'`;
            let result1 = await common.queryPure(sequelize, req, sql1, []);
            let total_money1 = 0;
            for (const r1 of result1.data) {
                total_money1 += r1.sum_ppmaster_produce_money;
            }

            //查询派工单的工资
           let sql2 =` select 
            sum(p.productdesignate_number  * pp.procedure_cost) as sum_ppmaster_produce_money
            from tbl_erc_productdesignate p
            left join tbl_erc_productionprocedure pp on (p.productdesignate_procedure_id = pp.procedure_id and pp.state = 1)
            where p.state=1 and p.productdesignate_date = '${nowDay}' and p.productdesignate_user_id='${r.user_id}'`
            let result2 = await common.queryPure(sequelize, req, sql2, []);
            let total_money2 = 0;
            for (const r2 of result2.data) {
                total_money2 += r2.sum_ppmaster_produce_money;
            }

            const total_money = total_money1 + total_money1;
            //如果工资没有达到基本工资，则生成记账凭证
            if (total_money < (r.base_salary / 100)) {
                const money = total_money - (r.base_salary / 100);
                await RecordingVouchersc.createRecordingVoucherSCJT('GZJT_1', user, {department_id: r.department_id,amount: money});
            }
        }
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//查询自己及下级员工
async function getSubordinateEmployeeAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        //查询上级岗位
        const structure = await tb_custorgstructure.findOne({
            where: {
                user_id: user.user_id
            }
        });

        let queryStr = `select t.*,ct.entry_date,dt.department_name,pt.position_name, ct.submit_state, ct.departure_date, ct.departure_reason, ct.departure_remark, ct.task_description
            from tbl_common_user t 
            left join tbl_erc_customer ct on t.user_id = ct.user_id
            left join tbl_erc_custorgstructure ot on t.user_id = ot.user_id and ot.state=1 
            left join tbl_erc_department dt on ot.department_id = dt.department_id and dt.state=1
            left join tbl_erc_position pt on ot.position_id = pt.position_id and pt.state=1
            where t.domain_id = ? and t.user_type = ? and t.state = 1 and (ct.user_state = 1 or ct.user_state is null) 
            and dt.department_id = '${structure.department_id}' and (pt.p_position_id = '${structure.position_id}' or t.user_id = '${user.user_id}')`;
        let replacements = [user.domain_id,GLBConfig.TYPE_OPERATOR];
        if (doc.search_text) {
            queryStr += ' and (t.name like ? or t.user_id like ? )';
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text)
        }


        let result = await common.queryWithCount(sequelize, req, queryStr, replacements)

        returnData.total = result.count
        returnData.rows = []

        for (let ap of result.data) {
            let d = JSON.parse(JSON.stringify(ap))
            delete d.pwaaword;
            d.entry_date = ap.entry_date ? moment(ap.entry_date).format("YYYY-MM-DD") : null;
            d.departure_date = ap.departure_date ? moment(ap.departure_date).format("YYYY-MM-DD") : null;
            returnData.rows.push(d)
        }

        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//离职 走审批流
async function  leaveOfficeAct(req, res) {
    let doc = common.docTrim(req.body);
    let user = req.user;
    try {
        //查看是否分配任务审核人员
        let taskallot = await tb_taskallot.findOne({
            where: {
                state: GLBConfig.ENABLE,
                taskallot_name: '离职审核'
            }
        });

        let taskallotuser = await tb_taskallotuser.findOne({
            where: {
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id,
                taskallot_id: taskallot.taskallot_id
            }
        });

        if (!taskallotuser) {
            return common.sendError(res, 'task_02');
        }


        let customer = await tb_customer.findOne({
            where: {
                user_id: doc.user_id
            }
        });

        if (customer) {
            customer.departure_date = doc.departure_date;
            customer.departure_reason = doc.departure_reason;
            customer.departure_remark = doc.departure_remark;
            customer.submit_state = '1';//状态改为已提交离职
            await customer.save();
            common.sendData(res, customer)
        }else{
            common.sendError(res, 'operator_03')
        }

        const taskName = '离职审核';
        const groupId = common.getUUIDByTime(30);
        // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
        await task.createTask(user, taskName, 86, taskallotuser.user_id, doc.user_id, '', '', groupId);
        common.sendData(res, '审核已提交');
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//离职
exports.modifyLeaveOffice = async (state, user_id, task_description) => {
    let userInfo = await tb_user.findOne({
        where: {
            user_id: user_id
        }
    });
    if (state === '2') {
        if (userInfo) {
            userInfo.state = 0;
            await userInfo.save();
            delete userInfo.password;
        }
    }

    let customer = await tb_customer.findOne({
        where: {
            user_id: user_id
        }
    });
    if (customer) {
        if (state === '2') {
            customer.state = 0;
            customer.submit_state = state;
            customer.task_description = task_description;
            await customer.save();
        } else {
            customer.submit_state = state;
            customer.task_description = task_description;
            await customer.save();
        }
    }
}

//增加员工
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let usergroup = await tb_usergroup.findOne({
            where: {
                usergroup_id: doc.usergroup_id
            }
        });

        if (usergroup) {
            //添加用户
            let user_id = await Sequence.genUserID()
            let adduser = await tb_user.create({
                user_id: user_id,
                domain_id: user.domain_id,
                p_usergroup_id:doc.p_usergroup_id,
                usergroup_id: doc.usergroup_id,
                username: user_id,
                email: doc.email,
                phone: doc.phone,
                password: GLBConfig.INITPASSWORD,
                name: doc.name,
                gender: doc.gender,
                user_type: usergroup.usergroup_type,
            });

            //正式员工添加会计科目详情
            if (doc.user_state !== '0') {
                //添加会计科目详情
                await ERCAccountingControlSRV.addAccountingDetail(1231,user_id,user.domain_id, '3');
                await ERCAccountingControlSRV.addAccountingDetail(2241,user_id,user.domain_id, '3');
            }

            if(adduser){
                //添加员工
                let addCustomer = await tb_customer.create({
                    user_id: adduser.user_id,
                    entry_date:doc.entry_date,//入职时间
                    user_form:doc.user_form,//聘用形式
                    idcarde_no: doc.idcarde_no,//身份证号
                    birth_date: doc.birth_date,//出生日期
                    age: doc.age,//年龄
                    marital_status: doc.marital_status,//婚姻状况
                    education: doc.education,//毕业院校
                    graduate_institution: doc.graduate_institution,
                    graduate_date: doc.graduate_date,//毕业日期
                    ethnicity: doc.ethnicity,//民族
                    native_place: doc.native_place,//籍贯
                    register_category: doc.register_category,//户口类型
                    living_place: doc.living_place,//现居住地
                    emergency_contact_person: doc.emergency_contact_person,//紧急联系人
                    emergency_contact_phone: doc.emergency_contact_phone,//联系电话
                    user_state: doc.user_state, //员工状态 0候选人 1正式员工
                });

                await tb_user.update({
                    username: adduser.user_id,
                }, {
                    where: {
                        user_id:adduser.user_id
                    }
                });

                //人事合同
                let usercontract = await tb_user_contract.create({
                    user_id: adduser.user_id,
                    contract_name:'',
                    contract_state:1
                });

                //员工组织架构
                let userorgstru = await tb_custorgstructure.create({
                    user_id: adduser.user_id,
                    department_id:doc.department_id,
                    position_id:doc.position_id
                });

                delete adduser.password
                common.sendData(res, adduser)
            }else {
                common.sendError(res, 'operator_01')
                return
            }

        } else {
            common.sendError(res, 'operator_01')
            return
        }

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//新建用户人事合同表记录
async function addContractAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

        let addContract = await tb_user.findOne({
            where: {
                user_id: doc.user_id
            }
        });

        let start_date = null;
        if(doc.start_date !=''){
            start_date = doc.start_date
        }
        let end_date = null;
        if(doc.end_date !=''){
            end_date = doc.end_date
        }
        let probation_end_date = null;
        if(doc.probation_end_date !=''){
            probation_end_date = doc.probation_end_date
        }
        let official_date = null;
        if(doc.official_date !=''){
            official_date = doc.official_date
        }

        if (addContract) {
            addContract = await tb_user_contract.create({
                user_id: doc.user_id,
                contract_name:doc.contract_name,
                sign_name: doc.sign_name,
                contract_no: doc.contract_no,
                start_date: start_date,
                end_date: end_date,
                probation_end_date: probation_end_date,
                official_date: official_date,
                base_salary: doc.base_salary*100,
                capacity_salary: doc.capacity_salary*100,
                performance_salary:doc.performance_salary*100,
                total_salary:doc.total_salary*100,
                deposit_bank: doc.deposit_bank,
                bank_account: doc.bank_account,
                contract_state: doc.contract_state

            });

            if(doc.files!=null && doc.files.length>0){
                for (let file of doc.files){
                    let addFile = await tb_uploadfile.create({
                        api_name: common.getApiName(req.path),
                        file_name: file.file_name,
                        file_url: file.file_url,
                        file_type: file.file_type,
                        file_visible: '1',
                        state: GLBConfig.ENABLE,
                        srv_id: addContract.user_contract_id
                    });
                }
            }
            common.sendData(res, addContract)

        }else{
            return common.sendError(res, 'operator_03');
        }
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//增加工作经历详情
async function addExperienceAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

        let addExperience = await tb_user.findOne({
            where: {
                user_id: doc.user_id
            }
        });

        let experience_start_date = null;
        if(doc.experience_start_date !=''){
            experience_start_date = doc.experience_start_date
        }
        let experience_end_date = null;
        if(doc.experience_end_date !=''){
            experience_end_date = doc.experience_end_date
        }

        if (addExperience) {
            addExperience = await tb_user_work_experience.create({
                user_id: doc.user_id,
                experience_start_date:experience_start_date,
                experience_end_date: experience_end_date,
                position_name: doc.position_name,
                witness: doc.witness,
                witness_phone: doc.witness_phone,
                experience_remark: doc.experience_remark

            });
            common.sendData(res, addExperience)

        }else{
            return common.sendError(res, 'operator_03');
        }
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//修改员工信息
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user;
        let csrq = doc.birth_date;
        let age = '';
        let d = new Date();
        let year = d.getFullYear();
        let month = d.getMonth() + 1;
        let day = d.getDate();

        let modiuser = await tb_customer.findOne({
            where: {
                user_id: doc.user_id,
                state: GLBConfig.ENABLE
            }
        });
        let modiuserbase = await tb_user.findOne({
            where: {
                user_id: doc.user_id,
                state: GLBConfig.ENABLE
            }
        });
        let usercontract = await tb_user_contract.findOne({
            where: {
                user_id: doc.user_id
            }
        });
        if (modiuser) {
            //离职
            modiuser.departure_date = doc.departure_date;
            modiuser.departure_reason = doc.departure_reason;
            modiuser.departure_remark = doc.departure_remark;
            modiuser.state = doc.state;
            //基本信息
            if (doc.info == '1') {
                if ( doc.p_usergroup_id == doc.parttime_usergroup_id ) {
                    return common.sendError(res, 'user_04')
                } else {
                    modiuserbase.name = doc.username;
                    modiuserbase.email = doc.email;
                    modiuserbase.phone = doc.phone;
                    modiuserbase.gender = doc.gender;
                    modiuserbase.state = doc.state;
                    modiuser.state = doc.state;
                    modiuser.entry_date = doc.entry_date;
                    modiuserbase.p_usergroup_id = doc.p_usergroup_id;
                    if(doc.parttime_usergroup_id){
                        modiuser.parttime_usergroup_id = doc.parttime_usergroup_id;
                    }
                    if( doc.usergroup_id){
                        modiuserbase.usergroup_id = doc.usergroup_id;
                    }
                    modiuser.job_level = doc.job_level;
                    modiuser.direct_leadership = doc.direct_leadership;
                    modiuser.qq_no = doc.qq_no;
                    modiuser.wechat_no = doc.wechat_no;
                    if(doc.customer_reimburserank_id) {
                        modiuser.customer_reimburserank_id = doc.customer_reimburserank_id;
                    }
                    if(doc.department_id || doc.position_id){
                        //修改部门和岗位信息
                        let orgstru = await tb_custorgstructure.findOne({
                            where: {
                                user_id: doc.user_id,
                                state: GLBConfig.ENABLE
                            }
                        });

                        orgstru.department_id = doc.department_id;
                        orgstru.position_id = doc.position_id;

                        await orgstru.save();
                    }
                    if (usercontract && doc.state == 0 ) {
                        usercontract.contract_state=3;
                        await usercontract.save();
                    }
                }

            } else if (doc.info == '2') {
            //个人信息
                modiuser.idcarde_no = doc.idcarde_no;
                if( doc.birth_date ){
                    modiuser.birth_date = doc.birth_date;
                    if (month < 10) {
                        month = '0'+month;
                    }
                    if(day < 10){
                        day = '0'+day;
                    }
                    let now = year+'-'+month+'-'+day;
                    if (now.substring(0,4) >= csrq.substring(0,4) && now.substring(5,7) >=csrq.substring(5,7)
                        && now.substring(8,10)>=csrq.substring(8,10)) {
                        age = year - parseInt(csrq.substring(0,4));
                    }else{
                        age = year - parseInt(csrq.substring(0,4)) - 1;
                    }
                }
                modiuser.age = age;
                modiuser.marital_status = doc.marital_status;
                modiuser.education = doc.education;
                modiuser.graduate_institution = doc.graduate_institution;
                if( doc.graduate_date ){
                    modiuser.graduate_date = doc.graduate_date;
                }
                modiuser.native_place = doc.native_place;
                modiuser.ethnicity= doc.ethnicity;
                modiuser.register_category = doc.register_category;
                modiuser.living_place = doc.living_place;
                modiuser.service_length = doc.service_length;
                modiuser.working_age = doc.working_age;
                modiuser.emergency_contact_person = doc.emergency_contact_person;
                modiuser.emergency_contact_phone = doc.emergency_contact_phone;
                modiuser.emergency_contact_qq = doc.emergency_contact_qq;
                if( doc.avatar ){
                    modiuser.standard_img = await common.fileMove(doc.avatar, 'avatar')
                }
            }

            await modiuser.save();
            await modiuserbase.save();

            if(doc.customer_procedure_id){
                tb_userprocedure.destroy({
                    where: {
                        user_id: doc.user_id
                    }
                })

                for(let p of doc.customer_procedure_id){
                    let userprocedure = await tb_userprocedure.create({
                        user_id:doc.user_id,
                        procedure_id:p
                    })
                }
            }

            common.sendData(res, modiuser);
            return
        } else {
            common.sendError(res, 'operator_03')
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}
//修改用户人事合同表记录
async function modifyContractAct(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user

        let modiContract = await tb_user_contract.findOne({
            where: {
                user_contract_id: doc.user_contract_id,
                state: GLBConfig.ENABLE
            }
        });
        let customer = await tb_customer.findOne({
            where: {
                user_id: doc.user_id,
                state: GLBConfig.ENABLE
            }
        });
        if (customer) {
            customer.user_form = doc.user_form;
            await customer.save();
        }
        let start_date = null
        if(doc.start_date !=''){
            start_date = doc.start_date
        }
        let end_date = null
        if(doc.end_date !=''){
            end_date = doc.end_date
        }
        let probation_end_date = null
        if(doc.probation_end_date !=''){
            probation_end_date = doc.probation_end_date
        }
        let official_date = null
        if(doc.official_date !=''){
            official_date = doc.official_date
        }

        if (modiContract) {
            modiContract.contract_name = doc.contract_name;
            modiContract.sign_name = doc.sign_name;
            modiContract.contract_no = doc.contract_no;
            modiContract.start_date = start_date;
            modiContract.end_date = end_date;
            modiContract.probation_end_date = probation_end_date;
            modiContract.official_date = official_date;
            modiContract.base_salary = doc.base_salary*100;
            modiContract.capacity_salary = doc.capacity_salary*100;
            modiContract.performance_salary = doc.performance_salary*100;
            modiContract.total_salary = doc.total_salary*100;
            modiContract.deposit_bank = doc.deposit_bank;
            modiContract.bank_account = doc.bank_account;
            modiContract.contract_state = doc.contract_state;
            await modiContract.save();

            if(doc.files!=null && doc.files.length>0){
                for (let file of doc.files){
                    let addFile = await tb_uploadfile.create({
                        api_name: common.getApiName(req.path),
                        file_name: file.file_name,
                        file_url: file.file_url,
                        file_type: file.file_type,
                        file_visible: '1',
                        state: GLBConfig.ENABLE,
                        srv_id: modiContract.user_contract_id
                    });
                }
            }
            common.sendData(res, modiContract);
            return
        } else {
            common.sendError(res, 'contract_02')
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}
//修改工作经历信息
async function modifyExperienceAct(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user

        let modiExperience = await tb_user_work_experience.findOne({
            where: {
                work_experience_id: doc.old.work_experience_id,
                state: GLBConfig.ENABLE
            }
        });
        if (modiExperience) {
            modiExperience.experience_start_date = doc.new.experience_start_date;
            modiExperience.experience_end_date = doc.new.experience_end_date;
            modiExperience.position_name = doc.new.position_name;
            modiExperience.witness = doc.new.witness;
            modiExperience.witness_phone = doc.new.witness_phone;
            modiExperience.experience_remark = doc.new.experience_remark;

            await modiExperience.save();
            common.sendData(res, modiExperience);
            return
        } else {
            common.sendError(res, 'contract_02')
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}
//查询用户详情信息
async function searchDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let replacements =[doc.user_id];
        let replacements1 =[doc.user_id];
        let replacements2 =[doc.user_id];

        let queryStr = 'select t.* ,ct.customer_reimburserank_id,ct.user_form,ct.entry_date,ct.departure_date,ct.departure_reason, ' +
            'ct.departure_remark,ct.parttime_usergroup_id,ct.job_level,ct.direct_leadership,' +
            'ct.qq_no,ct.wechat_no,ct.idcarde_no,ct.birth_date,ct.age,ct.marital_status,ct.education,' +
            'ct.graduate_institution,ct.graduate_date,ct.native_place,ct.ethnicity,ct.register_category,' +
            'ct.living_place,ct.service_length,ct.working_age,ct.emergency_contact_person,' +
            'ct.emergency_contact_phone,ct.emergency_contact_qq,ct.standard_img,ct.photo_title,' +
            'ct.goupload_format,ut1.usergroup_name p_usergroup_name,ut2.usergroup_name,ut3.usergroup_name parttime_usergroup_name, ' +
            'dt.department_name,pt.position_name,ot.department_id,ot.position_id ' +
            'from tbl_common_user t ' +
            'left join tbl_erc_customer ct on t.user_id = ct.user_id ' +
            'left join tbl_common_usergroup ut1 on t.p_usergroup_id = ut1.usergroup_id ' +
            'left join tbl_common_usergroup ut3 on ct.parttime_usergroup_id = ut3.usergroup_id ' +
            'left join tbl_common_usergroup ut2 on t.usergroup_id = ut2.usergroup_id ' +
            'left join tbl_erc_custorgstructure ot on t.user_id = ot.user_id and ot.state=1 ' +
            'left join tbl_erc_department dt on ot.department_id = dt.department_id and dt.state=1 ' +
            'left join tbl_erc_position pt on ot.position_id = pt.position_id and pt.state=1 ' +
            'where t.user_id = ?';

        let resultDetail = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        let queryRst=[];

        for (let r of resultDetail) {
            let result = JSON.parse(JSON.stringify(r));
            result.entry_date = r.entry_date ? moment(r.entry_date).format("YYYY-MM-DD") : null;
            result.departure_date = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            result.created_at = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            result.birth_date = r.birth_date ? moment(r.birth_date).format("YYYY-MM-DD") : null;
            result.graduate_date = r.graduate_date ? moment(r.graduate_date).format("YYYY-MM-DD") : null;
            queryRst.push(result)
        }

        //详情
        returnData.userDetail=queryRst;

        let queryStr1 = 'select * from tbl_erc_customercontract t where t.user_id=? ' +
            'order by t.created_at desc LIMIT 0,1';

        let resultContract = await sequelize.query(queryStr1, {
            replacements: replacements1,
            type: sequelize.QueryTypes.SELECT
        });

        let queryRst1=[];

        for (let r of resultContract) {
            let result = JSON.parse(JSON.stringify(r));
            result.start_date = r.start_date ? moment(r.start_date).format("YYYY-MM-DD") : null;
            result.end_date = r.end_date ? moment(r.end_date).format("YYYY-MM-DD") : null;
            result.probation_end_date = r.probation_end_date ? moment(r.probation_end_date).format("YYYY-MM-DD") : null;
            result.official_date = r.official_date ? moment(r.official_date).format("YYYY-MM-DD") : null;
            result.created_at = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            result.base_salary = (r.base_salary/100);
            result.capacity_salary = (r.capacity_salary/100);
            result.performance_salary = (r.performance_salary/100);
            result.total_salary = (r.total_salary/100);
            queryRst1.push(result)
        }

        //人事合同
        returnData.userContract=queryRst1;


        let queryStr2 = 'select * from tbl_erc_customerworkexperience t ' +
            'where t.user_id = ? and t.state = 1 order by t.created_at';

        let result = await common.queryWithCount(sequelize, req, queryStr2, replacements2)

        returnData.total = result.count;
        returnData.rows = [];

        for (let ap of result.data) {
            let d = JSON.parse(JSON.stringify(ap))
            d.experience_start_date = ap.experience_start_date ? moment(ap.experience_start_date).format("YYYY-MM-DD") : null;
            d.experience_end_date = ap.experience_end_date ? moment(ap.experience_end_date).format("YYYY-MM-DD") : null;
            returnData.rows.push(d)
        }

        //附件
        let sFiles = await tb_uploadfile.findAll({
            where: {
                api_name: common.getApiName(req.path),
                srv_id: doc.user_contract_id,
                state: GLBConfig.ENABLE
            }
        }) || [{}];

        returnData.sFiles = [];
        for (let r of sFiles) {
            let result = JSON.parse(JSON.stringify(r));
            result.file_url = doc.host + r.file_url;
            returnData.sFiles.push(result)
        }


        returnData.userprocedure=[]
        let queryStr4 = `select pp.procedure_name,pp.procedure_id from tbl_erc_userprocedure up
            left join tbl_erc_productionprocedure pp on (up.procedure_id = pp.procedure_id and pp.state=1)
            where up.state=1 and up.user_id=?`
        let resultProcedure = await sequelize.query(queryStr4, {
            replacements: [doc.user_id],
            type: sequelize.QueryTypes.SELECT
        });
        for(let rp of resultProcedure){
            returnData.userprocedure.push(rp.procedure_id)
        }

        common.sendData(res, returnData);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//离职操作
async function departureAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let userInfo = await tb_user.findOne({
            where: {
                user_id: doc.user_id
            }
        });

        if (userInfo) {
            userInfo.state = doc.state;
            await userInfo.save();
            delete userInfo.password
        }else{
            common.sendError(res, 'operator_03')
            return;
        }

        let departure = await tb_customer.findOne({
            where: {
                user_id: doc.user_id
            }
        });

        if (departure) {
            departure.departure_date = doc.departure_date;
            departure.departure_reason = doc.departure_reason;
            departure.departure_remark = doc.departure_remark;
            departure.state = doc.state;
            await departure.save();
            delete departure.password
            common.sendData(res, departure)
        }else{
            common.sendError(res, 'operator_03')
            return;
        }

        let usercontract = await tb_user_contract.findOne({
            where: {
                user_id: doc.user_id
            }
        });
        if (usercontract) {
            usercontract.contract_state=3;
            await usercontract.save();
        }else{
            common.sendError(res, 'operator_03')
            return;
        }

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//上传文件
async function upload(req, res) {
    try {
        let uploadurl = await common.fileSave(req);
        let fileUrl = await common.fileMove(uploadurl.url, 'upload');
        uploadurl.url = fileUrl;
        common.sendData(res, {
            uploadurl: uploadurl
        })
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//上传.csv文件
async function uploadDRAct(req, res) {
    try {
        let uploadurl = await common.fileSave(req);
        common.sendData(res, {
            uploadurl: uploadurl
        })
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//去掉空格换行符
function iGetInnerText(testStr) {
    var resultStr;
    resultStr = testStr.replace(/\ +/g, ""); //去掉空格
    resultStr = testStr.replace(/[ ]/g, ""); //去掉空格
    resultStr = testStr.replace(/[\r\n]/g, ""); //去掉回车换行
    return resultStr;
}
//导入员工
async function importUser(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let replacements = [],
            result, userArrTemp,other,gother,guother;
        let user_id, name, gender, department_id, position_id,entry_date,user_form,pType,uType,uuType;
        let userArrfile = await common.csvtojsonByUrl(doc.uploadurl);
        let user2 = req.user;
        let userArr=[];

        for (let i = 1; i < userArrfile.length; i++) {
            userArrTemp = userArrfile[i].split(',');
            if (userArrTemp[0] && userArrTemp[1] && userArrTemp[2] && userArrTemp[3] && userArrTemp[4] && userArrTemp[5]) {

                name = iGetInnerText(userArrTemp[0]);
                gender = iGetInnerText(userArrTemp[1]);
                department_id = iGetInnerText(userArrTemp[2]);
                position_id = iGetInnerText(userArrTemp[3]);
                entry_date = iGetInnerText(userArrTemp[4]);
                user_form = iGetInnerText(userArrTemp[5]);

                if(gender.length==0){
                    return common.sendError(res, 'user_02');
                }
                if(department_id.length==0){
                    return common.sendError(res, 'user_03');
                }
                gother = await tb_department.findOne({
                    where: {
                        domain_id: user2.domain_id,
                        department_name: department_id
                    }
                });
                guother = await tb_position.findOne({
                    where: {
                        domain_id: user2.domain_id,
                        position_name: position_id
                    }
                });

                if (gother==null||guother==null){
                    common.sendError(res, 'position_04')
                    return
                }
            }
        }

        for (let i = 1; i < userArrfile.length; i++) {
            userArrTemp = userArrfile[i].split(',');
            if (userArrTemp[0] && userArrTemp[1] && userArrTemp[2] && userArrTemp[3] && userArrTemp[4] && userArrTemp[5]) {
                name = iGetInnerText(userArrTemp[0]);
                gender = iGetInnerText(userArrTemp[1]);
                department_id = iGetInnerText(userArrTemp[2]);
                position_id = iGetInnerText(userArrTemp[3]);
                entry_date = iGetInnerText(userArrTemp[4]);
                user_form = iGetInnerText(userArrTemp[5]);

                gother = await tb_department.findOne({
                    where: {
                        domain_id: user2.domain_id,
                        department_name: department_id
                    }
                });
                guother = await tb_position.findOne({
                    where: {
                        domain_id: user2.domain_id,
                        position_name: position_id
                    }
                });
                pType = gother.department_id;
                uType = guother.position_id;
                uuType = guother.usergroup_id;

                if (gender == '男') {
                    gender =1
                } else {
                    gender =2
                }
                if (user_form == '合同制') {
                    user_form =1
                } else if (user_form == '劳务制') {
                    user_form =2
                } else {
                    user_form = 3
                }

                let user_id = await Sequence.genUserID();
                let user = await tb_user.create({
                        user_id: user_id,
                        domain_id: user2.domain_id,
                        username: user_id,
                        name: name,
                        gender: gender,
                        // p_usergroup_id: pType,
                        usergroup_id: uuType,
                        state: 1,
                        password: GLBConfig.INITPASSWORD,
                        user_type: '01'
                    });
                userArr.push(user);

                let usercontract = await tb_user_contract.create({
                    user_id: user.user_id,
                    contract_name:'',
                    contract_state:1
                });
                let addCustomer = await tb_customer.create({
                    user_id: user.user_id,
                    entry_date:entry_date,
                    user_form:user_form

                });
                let userorgstru = await tb_custorgstructure.create({
                    user_id: user.user_id,
                    department_id:pType,
                    position_id:uType
                });

            }
        }
        common.sendData(res, userArr);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//上传图片
async function uploadImgAct(req, res) {
    try {
        let uploadurl = await common.fileSave(req)
        common.sendData(res, {
            uploadurl: uploadurl
        })
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//查询文件
async function searchFilesAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

        let queryStr = `select t.*,ut.username from tbl_erc_customercontract t 
        inner join tbl_common_user ut on t.user_id = ut.user_id  where t.state=1 and t.user_contract_id=?`;

        let replacements = [doc.user_contract_id];
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        let resultData = {
            designs: []
        };
        let api_name = common.getApiName(req.path)
        for (let r of result) {
            let row = JSON.parse(JSON.stringify(r));
            row.files = []
            let ufs = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
                    srv_id: doc.user_contract_id,
                    state: GLBConfig.ENABLE,
                    user_id: null
                }
            })

            for (let f of ufs) {
                row.files.push(f)
            }
            resultData.designs.push(row)
        }
        common.sendData(res, resultData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//上传标题文件
async function uploadTitleAct (req, res){
    try {
        let fileInfo = await common.fileSave(req);
        let fileUrl = await common.fileMove(fileInfo.url, 'upload');
        fileInfo.url = fileUrl;
        common.sendData(res, fileInfo)
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//增加图片
let addImgAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let user = await tb_customer.findOne({
            where: {
                user_id: doc.user_id,
                state: GLBConfig.ENABLE
            }
        });
        if(user){
            user.photo_title = doc.photo_title,
            user.goupload_format = doc.goupload_format

            await user.save();
        }

        for (let image of doc.images){
            let addFile = await tb_uploadfile.create({
                api_name: common.getApiName(req.path),
                file_name: image.file_name,
                file_url: image.file_url,
                file_type: image.file_type,
                file_visible: '1',
                state: GLBConfig.ENABLE,
                user_id: doc.user_id
            });
        }
        let retData = JSON.parse(JSON.stringify(user));
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//查询详情图片
async function searchDetailImgAct(req, res) {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};

        let queryStr = `select * from tbl_common_user t left join tbl_erc_customer ct on t.user_id=ct.user_id where ct.photo_title='生活照' and t.user_id=?`;

        let replacements = [doc.user_id];

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;

        let acceptances = [];
        let api_name = common.getApiName(req.path);
        for (let a of result.data) {
            let aj = JSON.parse(JSON.stringify(a));
            aj.images = [];
            let ifs = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
                    state: GLBConfig.ENABLE,
                    user_id: doc.user_id,

                }
            });
            for (let i of ifs) {
                aj.images.push(i)
            }
            acceptances.push(aj)
        }
        returnData.rows = acceptances;
        common.sendData(res, returnData);

        // let result = await sequelize.query(queryStr, {
        //     replacements: replacements,
        //     type: sequelize.QueryTypes.SELECT
        // });
        // let resultData = {
        //     designs: []
        // };
        // let api_name = common.getApiName(req.path)
        // for (let r of result) {
        //     let row = JSON.parse(JSON.stringify(r));
        //     row.files = []
        //     let ufs = await tb_uploadfile.findAll({
        //         where: {
        //             api_name: api_name,
        //             srv_id: doc.user_id,
        //             state: GLBConfig.ENABLE
        //         }
        //     })
        //
        //     for (let f of ufs) {
        //         row.files.push(f)
        //     }
        //     resultData.designs.push(row)
        // }
        // common.sendData(res, resultData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//下载模板
async function downloadEmployee(req, res) {
    try {
        let str = '姓名,性别,部门,岗位,入职时间,聘用形式\r小红,女,运营部,运营,2018/1/1,合同制\r聘用形式为合同制、劳务制、临时工三个选项\r部门与岗位需填写当机构已设置好的部门与岗位';

        // let filename = 'download_' + common.getUUIDByTime(32) + '.csv';
        let filename = '乐宜嘉人力资源数据导入模板.csv';
        let tempfile = path.join(__dirname, '../../../' + config.uploadOptions.uploadDir + '/' + filename);
        let csvBuffer = iconvLite.encode(str, 'gb2312');
        fs.writeFile(tempfile, csvBuffer, function(err) {
            if (err) throw err;
            common.sendData(res, config.tmpUrlBase + filename);
        });
    } catch (error) {
        common.sendFault(res, error);
    }
}
//查询机构
async function searchGroupAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};
        let groups = []
        if (doc.usergroup_id) {
            let userGroup = await tb_usergroup.findOne({
                where: {
                    domain_id: user.domain_id,
                    usergroup_id: doc.usergroup_id,
                    usergroup_type: GLBConfig.TYPE_OPERATOR
                }
            });
            if (userGroup) {
                groups.push({
                    usergroup_id: userGroup.usergroup_id,
                    name: '总机构',
                    isParent: true,
                    node_type: userGroup.node_type,
                    children: []
                })
            } else {
                common.sendData(res, groups);
            }
        } else {
            groups.push({
                usergroup_id: 0,
                name: '总机构',
                isParent: true,
                node_type: GLBConfig.MTYPE_ROOT,
                children: []
            })
        }
        groups[0].children = JSON.parse(JSON.stringify(await employeeUserGroup(user.domain_id, groups[0].usergroup_id)));
        common.sendData(res, groups);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//查询员工机构
async function employeeUserGroup(domain_id, parentId) {
    let return_list = [];
    let groups = await tb_usergroup.findAll({
        where: {
            domain_id: domain_id,
            parent_id: parentId,
            usergroup_type: GLBConfig.TYPE_OPERATOR
        }
    });
    for (let g of groups) {
        let sub_group = [];
        if (g.node_type === GLBConfig.MTYPE_ROOT) {
            sub_group = await employeeUserGroup(domain_id, g.usergroup_id);
            return_list.push({
                usergroup_id: g.usergroup_id,
                node_type: g.node_type,
                usergroup_type: g.usergroup_type,
                name: g.usergroup_name,
                isParent: true,
                parent_id: g.parent_id,
                children: sub_group
            });
        } else {
            return_list.push({
                usergroup_id: g.usergroup_id,
                node_type: g.node_type,
                usergroup_type: g.usergroup_type,
                name: g.usergroup_name,
                isParent: false,
                parent_id: g.parent_id,
            });
        }
    }
    return return_list;
}
// 查询岗位联动列表
async function searchUserGroupAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = [];

        let userGroup = await tb_usergroup.findAll({
            where: {
                domain_id: user.domain_id,
                usergroup_id: doc.usergroup_id,
                usergroup_type: GLBConfig.TYPE_OPERATOR,
                node_type: GLBConfig.TYPE_OPERATOR
            }
        });

        let group = await tb_usergroup.findOne({
            where: {
                domain_id: user.domain_id,
                usergroup_id: userGroup.parent_id,
                usergroup_type: GLBConfig.TYPE_OPERATOR,
                node_type: GLBConfig.TYPE_ADMINISTRATOR
            }
        });
        // returnData.userGroup = userGroup
        // returnData.group = group
        for (let u of userGroup) {
            let rj = JSON.parse(JSON.stringify(u))
            rj.position = employeePosition(rj.usergroup_id, userGroup).substring(1)
            returnData.push(rj)
        }
        common.sendData(res,returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

function employeePosition(usergroup_id, usergroups) {
    let positionName = '',
        parent_id;

    function isEqual(element, index, array) {
        if (element.usergroup_id === usergroup_id) {
            positionName = element.usergroup_name
            parent_id = element.parent_id
            return true
        } else {
            return false
        }
    }

    if (usergroups.some(isEqual)) {
        positionName = employeePosition(parent_id, usergroups) + '>' + positionName
    }
    return positionName
}
//修改机构
async function changeGroupAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        if (doc.users[0]) {
            let u =doc.users[0]
            let userGroup = await tb_usergroup.findOne({
                where: {
                    domain_id: user.domain_id,
                    usergroup_id: u.usergroup_id,
                    usergroup_type: u.usergroup_type,
                    node_type: u.node_type
                }
            });
            if(userGroup.parent_id == 0) {
                return common.sendError(res, 'user_05')
            } else {
                let group = await tb_usergroup.findOne({
                    where: {
                        domain_id: u.domain_id,
                        usergroup_id: userGroup.parent_id,
                        usergroup_type: GLBConfig.TYPE_OPERATOR,
                        node_type: GLBConfig.TYPE_ADMINISTRATOR
                    }
                });
                returnData.userGroupId=userGroup.usergroup_id;
                returnData.userGroupName=userGroup.usergroup_name;
                returnData.groupId=group.usergroup_id;
                returnData.groupName=group.usergroup_name;
            }
        } else {
            return common.sendError(res, 'user_06')
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//新建机构
async function newChangeGroupAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        let u =doc.users[0]
        if (u != null){
            let userPosition = await tb_position.findOne({
                where: {
                    domain_id: user.domain_id,
                    position_id: u.position_id
                }
            });

            let userDepartment = await tb_department.findOne({
                where: {
                    domain_id: user.domain_id,
                    department_id: userPosition.department_id
                }
            });

            returnData.userDepartmentId=userPosition.department_id;
            returnData.userPositionName=userPosition.position_name;
            returnData.userPositionId=userPosition.position_id;
            returnData.userDepartmentName=userDepartment.department_name;
            returnData.userGroupId=userPosition.usergroup_id;

            common.sendData(res, returnData);
        } else {
            common.sendError(res, 'user_06');
            return
        }
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//查询酷家乐员工
async function searchKuAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        let operator = await tb_operator.findOne({
            where: {
                user_id: doc.user_id,
                state: '1'
            }
        });

       common.sendData(res, operator);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//增加酷家乐账号信息
async function addKuAct(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user

        let users = await tb_user.findOne({
            where: {
                user_id: doc.user_id,
                state: '1'
            }
        });

        if (!users) {
            return common.sendError(res, 'user_07');
        }
        let emailResult = await KujialeSRV.getEmail(users.username,doc.kujiale_appuid,doc.user_id);
        if (emailResult.dataValues == null) {
            let emailExample = RegExp(/user has already been bind to email/);
            let emailExample2 = RegExp(/user not registered/)
            let emailExample3 = RegExp(/user not exist with email/)
            let emailExample4 = RegExp(/ has been bind to an other user/)
            if (emailExample.test(emailResult)) {
                return common.sendError(res, 'kujiale_06');
            } else if (emailExample2.test(emailResult)) {
                return common.sendError(res, 'kujiale_07');
            } else if (emailExample3.test(emailResult)) {
                return common.sendError(res, 'kujiale_08');
            } else if (emailExample4.test(emailResult)) {
                return common.sendError(res, 'kujiale_09');
            } else {
                return common.sendError(res, 'kujiale_10');
            }
            // return emailResult
        } else {
            common.sendData(res, {})
        }
    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}

//设置用户状态 0候选人 1入职或离职
async function setUserStateAct(req, res) {
    try {
        const doc = common.docTrim(req.body);
        const user = req.user;

        let customer = await tb_customer.findOne({
            where: {
                user_id: doc.user_id,
            }
        });

        if (!customer) {
            return common.sendError(res, 'user_07');
        } else {
            customer.user_state = doc.user_state;
            customer.entry_date = new Date();
            await customer.save();
            //入职添加会计科目详情
            if (doc.user_state === '1') {
                await ERCAccountingControlSRV.addAccountingDetail(1231,customer.user_id,user.domain_id, '3');
                await ERCAccountingControlSRV.addAccountingDetail(2241,customer.user_id,user.domain_id, '3');
            }
        }
        common.sendData(res, user);
    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}

//删除工作经验
async function deleteExperienceAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

        const work = await tb_user_work_experience.findOne({
            where: {
                work_experience_id: doc.work_experience_id
            }
        });

        if (!work) {
            return common.sendError(res, 'user_07');
        } else {
            work.state = 0;
            await work.save();
        }
        common.sendData(res, work);
    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}

//获取岗位任务完成情况
async function searchTaskCompleteAct(req, res) {
    try {
        const doc = common.docTrim(req.body);
        const user = req.user;
        let returnData = {};

        let sql = `select u.*, d.department_name, p.position_name from tbl_erc_customer cu
          left join  tbl_common_user u on u.user_id = cu.user_id
          left join tbl_erc_custorgstructure cs on u.user_id = cs.user_id and cs.state=1 
          left join tbl_erc_department d on cs.department_id = d.department_id and d.state=1 
          left join tbl_erc_position p on cs.position_id = p.position_id and p.state=1 
          where u.domain_id = ? and u.user_type = ? and u.state = ? and (cu.user_state <> 0 or cu.user_state is null)`;
        let replacements = [user.domain_id, GLBConfig.TYPE_OPERATOR, GLBConfig.ENABLE];
        if(doc.department_id){
            sql += ' and cs .department_id = ?';
            replacements.push(doc.department_id);
        }
        if (doc.position_id) {
            sql += ' and cs.position_id = ?';
            replacements.push(doc.position_id);
        }
        if (doc.search_text) {
            sql += ` and (u.name like ? or u.user_id like ?) `;
            replacements.push(`%${doc.search_text}%`);
            replacements.push(`%${doc.search_text}%`);
        }
        sql += ` order by cs.created_at`;
        let result = await common.queryWithCount(sequelize, req, sql, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let d = JSON.parse(JSON.stringify(r));
            //所有任务
            const allTasks = await tb_task.findAll({
                where: {
                    task_performer: d.user_id,
                    domain_id: user.domain_id,
                }
            });
            //完成任务
            const completedTasks = await tb_task.findAll({
                where: {
                    task_performer: d.user_id,
                    domain_id: user.domain_id,
                    task_state: {
                        $in:['2','4']
                    },
                }
            });
            //未完成任务
            const incompleteTasks = await tb_task.findAll({
                where: {
                    task_performer: d.user_id,
                    domain_id: user.domain_id,
                    task_state: 1
                }
            });
            //计算平均完成任务时间
            let totalHours = 0;
            for (const task of completedTasks ) {
                const start_date = moment(task.created_at,"YYYY-MM-DD HH:mm:ss");
                const end_date = moment(task.task_complete_date,"YYYY-MM-DD HH:mm:ss");
                totalHours += (end_date.diff(start_date,"seconds") / 3600);
            }
            const avgHours = completedTasks.length === 0 ? 0 : (totalHours / completedTasks.length).toFixed(2);
            d.task_total_count = allTasks.length;//任务总数量
            d.task_incomplete_count = incompleteTasks.length;//未完成任务数量
            d.task_completed_count = completedTasks.length;//完成任务数量
            d.complete_degree = allTasks.length === 0 ? 0 : (completedTasks.length / allTasks.length).toFixed(2);//任务完成率
            d.avg_complete_hours = avgHours;//平均任务完成时间
            delete d.pwaaword;
            returnData.rows.push(d);
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

exports.initAct = initAct;
exports.getSubordinateEmployeeAct = getSubordinateEmployeeAct;
exports.leaveOfficeAct = leaveOfficeAct;
