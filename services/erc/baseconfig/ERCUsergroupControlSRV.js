/**
 * Created by shuang.liu on 18/5/5.
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCUsergroupControlSRV');
const model = require('../../../model');

const sequelize = model.sequelize;
const tb_position = model.erc_position;
const tb_usergroup = model.common_usergroup;
const tb_user = model.common_user;
const tb_department = model.erc_department;
const tb_custorgstructure = model.erc_custorgstructure;

exports.ERCUsergroupControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'delete') {
        deleteAct(req, res)
    } else if (method === 'changeGroup') {
        changeGroupAct(req, res)
    } else if (method === 'changeDepartment') {
        changeDepartmentAct(req, res)
    } else if (method === 'changeUserGroup') {
        changeUserGroupAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};

        returnData.userInfo = req.user;
        returnData.salaryType = GLBConfig.SALARYTYPE;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//查询用户岗位信息
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements =[user.domain_id];
        let queryStr='select t.*,dt.department_id,dt.department_name,pt.position_name as p_position_name,gt.usergroup_name ' +
            'from tbl_erc_position t ' +
            'left join tbl_erc_position pt on t.p_position_id=pt.position_id ' +
            'left join tbl_erc_department dt on t.department_id=dt.department_id ' +
            'left join tbl_common_usergroup gt on t.usergroup_id = gt.usergroup_id and gt.state=1 ' +
            'where t.state=1 and t.domain_id=? ';
        if (doc.search_text){
            queryStr += ' and (t.position_id like ? or t.position_name like ?) ';
            let search_text = '%'+doc.search_text+'%';
            replacements.push(search_text);
            replacements.push(search_text);
        }
        if(doc.type==1){
            //按工号排序
            queryStr += ' order by t.position_id';
        }else {
            queryStr += ' order by t.created_at desc';

        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            if (r.base_salary > 0)
                r.base_salary = r.base_salary / 100;
            if (r.capacity_salary > 0)
                r.capacity_salary = r.capacity_salary / 100;
            if (r.performance_salary > 0)
                r.performance_salary = r.performance_salary / 100;
            if (r.actual_salary > 0)
                r.actual_salary = r.actual_salary / 100;
        }

        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//新增岗位
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let aPosition = await tb_position.findOne({
            where: {
                domain_id: user.domain_id,
                position_name: doc.position_name,
                state: 1
            }
        });
        if (aPosition) {
            common.sendError(res, 'position_02');
            return
        } else {
            let position_id = await Sequence.genPositionID();
            let addPosition = await tb_position.create({
                position_id: position_id,
                domain_id: user.domain_id,
                usergroup_id:doc.usergroup_id,
                department_id: doc.department_id,
                position_name: doc.position_name,
                p_position_id: doc.p_position_id,
                department_plan_num: doc.department_plan_num,
                base_salary: (doc.base_salary || 0) * 100,
                capacity_salary: (doc.capacity_salary || 0) * 100,
                performance_salary: (doc.performance_salary || 0) * 100,
                actual_salary: (doc.base_salary || 0) * 100 + (doc.capacity_salary || 0) * 100 + (doc.performance_salary || 0) * 100,
                department_actual_num: doc.department_actual_num || 0,
                salary_type: doc.salary_type,
                position_require: doc.position_require
            });
            common.sendData(res, addPosition)
        }


    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//修改岗位信息
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let modPosition = await tb_position.findOne({
            where: {
                position_id: doc.old.position_id
            }
        });
        //判断修改的岗位信息是否存在
        if (modPosition) {

            let modPosition2 = await tb_position.findOne({
                where: {
                    domain_id: user.domain_id,
                    position_id: doc.new.p_position_id,
                    state:1
                }
            });

            if (modPosition2 != null) {
                if (doc.new.p_position_id == modPosition.position_id || modPosition.position_id ==modPosition2.p_position_id) {
                    common.sendError(res, 'position_05');
                    return
                }
            } else {
                if (doc.new.p_position_id == modPosition.position_id) {
                    common.sendError(res, 'position_05');
                    return
                }
            }


            let aPosition = await tb_position.findOne({
                where: {
                    domain_id: user.domain_id,
                    position_name: doc.new.position_name,
                    state: 1
                }
            });
            if(doc.new.position_name && doc.old.position_name != doc.new.position_name && aPosition){
                common.sendError(res, 'position_02');
                return
            }else{
                modPosition.usergroup_id = doc.new.usergroup_id;
                modPosition.department_id = doc.new.department_id;
                modPosition.position_name = doc.new.position_name;
                modPosition.p_position_id = doc.new.p_position_id;
                modPosition.department_plan_num = doc.new.department_plan_num;
                modPosition.base_salary = doc.new.base_salary * 100;
                modPosition.capacity_salary = doc.new.capacity_salary * 100;
                modPosition.performance_salary = doc.new.performance_salary * 100;
                modPosition.actual_salary = doc.new.base_salary * 100 +  doc.new.capacity_salary * 100 + doc.new.performance_salary * 100;
                modPosition.department_actual_num = doc.new.department_actual_num;
                modPosition.salary_type = doc.new.salary_type;
                modPosition.position_require = doc.new.position_require;
                await modPosition.save();

                let custorgstructure = await tb_custorgstructure.findAll({
                    where: {
                        department_id: doc.old.department_id,
                        position_id: doc.old.position_id,
                        state: GLBConfig.ENABLE
                    }
                });
                let usergroup = await tb_usergroup.findOne({
                    where: {
                        usergroup_id: doc.new.usergroup_id
                    }
                });

                for(let users of custorgstructure){
                    await tb_user.update({
                        usergroup_id: doc.new.usergroup_id,
                        user_type: usergroup.usergroup_type
                    }, {
                        where: {
                            domain_id: user.domain_id,
                            state: GLBConfig.ENABLE,
                            user_id:users.user_id
                        }
                    });
                }
                common.sendData(res, modPosition);
            }
        } else {
            common.sendError(res, 'position_01');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}
//删除岗位
async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modPosition = await tb_position.findOne({
            where: {
                position_id: doc.old.position_id
            }
        });
        if (modPosition) {
            modPosition.state = GLBConfig.DISABLE;
            await modPosition.save();

            common.sendData(res, modPosition);
        } else {
            common.sendError(res, 'position_01');
            return
        }
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}

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

            returnData.userGroupId=userGroup.usergroup_id;
            returnData.userGroupName=userGroup.usergroup_name;
        } else {
            returnData.userGroupId=null;
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

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

async function changeUserGroupAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        if (doc.users[0]) {
            let u =doc.users[0]
            let userGroup = await tb_position.findOne({
                where: {
                    domain_id: user.domain_id,
                    position_id: u.position_id
                }
            });

            returnData.userNewGroupId=userGroup.position_id;
            returnData.userNewGroupName=userGroup.position_name;

        } else {
            returnData.userNewGroupId=null;
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}