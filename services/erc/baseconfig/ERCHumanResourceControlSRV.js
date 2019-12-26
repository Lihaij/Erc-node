/**
 * Created by shuang.liu on 18/3/6.
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCHumanResourceControlSRV');
const model = require('../../../model');
const moment = require('moment');
const task = require('../baseconfig/ERCTaskListControlSRV');

const sequelize = model.sequelize;
const tb_user = model.common_user;
const tb_humanresource = model.erc_humanresource;
const tb_task = model.erc_task;
const tb_usergroup = model.common_usergroup;
const tb_department = model.erc_department;
const tb_position = model.erc_position;
//人力资源管理->人力需求列表
exports.ERCHumanResourceControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'search_d') {
        searchDetailAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'delete') {
        deleteAct(req, res)
    } else if (method === 'search_g') {
        searchGroupAct(req, res)
    } else if (method === 'search_user') {
        searchUserGroupAct(req, res)
    } else if (method === 'changeGroup') {
        changeGroupAct(req, res)
    } else if (method === 'newsearch_g') {
        newSearchGroupAct(req, res)
    } else if (method === 'newsearch_user') {
        newSearchUserGroupAct(req, res)
    } else if (method === 'change_group') {
        newChangeGroupAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {
            staffInfo: []
        };
        let replacements = [];
        let user = req.user;

        let queryStr = 'select t.usergroup_id as id,t.usergroup_name as text from tbl_common_usergroup t ' +
            'where t.domain_id=? and t.parent_id=0 and t.usergroup_type=01';
        replacements.push(user.domain_id);

        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT,
            state: GLBConfig.ENABLE
        });

        let queryStr2 = 'select t.usergroup_id as id,t.usergroup_name as text from tbl_common_usergroup t ' +
            'where t.domain_id=? and t.usergroup_type=01 and t.node_type = 01 and t.parent_id != 0';
        replacements.push(user.domain_id);

        let queryRst2 = await sequelize.query(queryStr2, {
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

        returnData.roleList=queryRst;
        returnData.roleList2=queryRst2;
        returnData.stateInfo=GLBConfig.HRSTATE;
        returnData.userInfo = req.user;
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
    }

}
//查询人力需求列表
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements =[user.domain_id];

        let queryStr =
            `select
                t.*,ut.username,gt.usergroup_name,dt.department_name,pt.position_name
                from tbl_erc_humanresource t
                left join tbl_common_user ut
                on t.hr_checker_id = ut.user_id and ut.state=1
                left join tbl_erc_department dt
                on t.department_id = dt.department_id and dt.state=1
                left join tbl_erc_position pt
                on t.position_id = pt.position_id and pt.state=1
                left join tbl_common_usergroup gt
                on t.department_id = gt.usergroup_id and gt.state=1
                where true
                and t.domain_id = ?
                and t.state = 1`;

        queryStr += ' and t.user_id = ?';
        replacements.push(user.user_id);

        if (doc.post_title){
            queryStr += ' and pt.position_name like ?';
            let post_title = '%'+doc.post_title+'%';
            replacements.push(post_title)
        }
        if (doc.created_at != null) {
            queryStr += ` and t.created_at >= ? and t.created_at <= ? `;
            replacements.push(doc.created_at + ` 00:00:00`);
            replacements.push(doc.created_at + ` 23:59:59`);
        }
        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//查询人力需求详情
async function searchDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements =[doc.hr_id];

        let queryStr='select t.*,ut.username,gt.usergroup_name,dt.department_name,pt.position_name from tbl_erc_humanresource t ' +
            'left join tbl_common_user ut on t.user_id = ut.user_id ' +
            'left join tbl_erc_department dt on t.department_id = dt.department_id and dt.state=1 ' +
            'left join tbl_erc_position pt on t.position_id = pt.position_id and pt.state=1 ' +
            'left join tbl_common_usergroup gt on t.department_id = gt.usergroup_id ' +
            'where t.state=1 and t.hr_id=?';
        let resultDetail = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        let queryRst=[];

        for (let r of resultDetail) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            queryRst.push(result)
        }

        //详情
        returnData.hrDetail=queryRst;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//新增人力需求
async function addAct(req, res) {
    try {
        let user = req.user;
        let doc = common.docTrim(req.body);

        let create = await tb_humanresource.create({
            domain_id: user.domain_id,
            user_id: user.user_id,
            hr_checker_id: doc.hr_checker_id,
            department_id: doc.department_id,
            position_id: doc.position_id,
            hr_remark: doc.hr_remark,
            hr_state: '1'
        });

        //发布招录任务
        let hr = await tb_humanresource.findOne({
            where:{
                state:GLBConfig.ENABLE,
                hr_id:create.hr_id
            }
        });

        let taskId = await Sequence.genTaskID(user.domain_id);
        let addT = await tb_task.create({
            task_id: taskId,
            domain_id: user.domain_id,
            task_name: '招录任务',
            task_type: '15',
            task_priority: '1',
            task_publisher: user.user_id,
            task_performer: doc.hr_checker_id,
            task_state: '1',
            task_description: doc.hr_remark,
            task_review_code: create.hr_id,
            task_classify: 2
        });

        //给执行人发推送消息
        common.pushNotification('','您收到一条新的任务',{msgFlag: '1'},doc.hr_checker_id);

        let retData = JSON.parse(JSON.stringify(create));
        common.sendData(res, retData);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//删除人力需求
async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let delHr = await tb_humanresource.findOne({
            where: {
                hr_id: doc.hr_id,
                state: GLBConfig.ENABLE
            }
        });
        if (delHr) {
            delHr.state = GLBConfig.DISABLE;
            await delHr.save();
            return common.sendData(res);
        } else {
            return common.sendError(res, 'hr_01');
        }

    } catch (error) {
        common.sendFault(res, error)
    }
}
//选择角色
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
        groups[0].children = JSON.parse(JSON.stringify(await genUserGroup(user.domain_id, groups[0].usergroup_id)));
        common.sendData(res, groups);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//将选择的角色里的信息查询出来
async function genUserGroup(domain_id, parentId) {
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
            sub_group = await genUserGroup(domain_id, g.usergroup_id);
            return_list.push({
                usergroup_id: g.usergroup_id,
                node_type: g.node_type,
                usergroup_type: g.usergroup_type,
                name: g.usergroup_name,
                isParent: true,
                parent_id: g.parent_id,
                children: sub_group
            });
        }
    }
    return return_list;
}
//查询用户机构
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
                node_type: GLBConfig.TYPE_ADMINISTRATOR
            }
        });

        // returnData.userGroup = userGroup
        // returnData.group = group
        for (let u of userGroup) {
            let rj = JSON.parse(JSON.stringify(u))
            rj.position = genPosition(rj.usergroup_id, userGroup).substring(1)
            returnData.push(rj)
        }
        common.sendData(res,returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//查询根位置的用户
function genPosition(usergroup_id, usergroups) {
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
        positionName = genPosition(parent_id, usergroups) + '>' + positionName
    }
    return positionName
}
//查询选择用户id和name
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
            common.sendError(res, 'user_06');
            return
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//查询总机构
async function newSearchGroupAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};
        let groups = []
        if (doc.department_id) {
            let userGroup = await tb_department.findOne({
                where: {
                    domain_id: user.domain_id,
                    department_id: doc.department_id
                }
            });
            if (userGroup) {
                groups.push({
                    department_id: userGroup.department_id,
                    name: '总机构',
                    isParent: true,
                    children: []
                })
            } else {
                common.sendData(res, groups);
            }
        } else {
            groups.push({
                department_id: null,
                name: '总机构',
                isParent: true,
                children: []
            })
        }
        groups[0].children = JSON.parse(JSON.stringify(await newGenUserGroup(user.domain_id, groups[0].department_id)));
        common.sendData(res, groups);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//查询用户角色信息
async function newGenUserGroup(domain_id, parentId) {
    let return_list = [];
    let groups = await tb_department.findAll({
        where: {
            domain_id: domain_id,
            p_department_id: parentId
        }
    });
    for (let g of groups) {
        let sub_group = [];

        sub_group = await newGenUserGroup(domain_id, g.department_id);
        return_list.push({
            department_id: g.department_id,
            name: g.department_name,
            department_level: g.department_level,
            department_plan_num: g.department_plan_num,
            isParent: true,
            p_department_id: g.p_department_id,
            children: sub_group
        });
    }
    return return_list;
}
//查询用户机构
async function newSearchUserGroupAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = [];

        let userGroup = await tb_position.findAll({
            where: {
                domain_id: user.domain_id,
                department_id: doc.department_id
            }
        });

        for (let u of userGroup) {
            let rj = JSON.parse(JSON.stringify(u))
            rj.position = newEmployeePosition(rj.department_id, userGroup).substring(1)
            returnData.push(rj)
        }
        common.sendData(res,returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//查询根位置的用户
function newEmployeePosition(department_id, usergroups) {
    let positionName = '',
        parent_id;

    function isEqual(element, index, array) {
        if (element.department_id === department_id) {
            positionName = element.position_name
            parent_id = element.usergroup_id
            return true
        } else {
            return false
        }
    }

    if (usergroups.some(isEqual)) {
        positionName = newEmployeePosition(parent_id, usergroups) + '>' + positionName
    }
    return positionName
}
//根据选择的角色查询用户信息
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

async function modifyHRState(applyState,description,hrId,applyApprover){

    await tb_humanresource.update({
        hr_state:applyState,
        hr_check_date:new Date(),
        hr_checker_id:applyApprover,
        description:description
    }, {
        where: {
            hr_id:hrId
        }
    });
}
exports.modifyHRState = modifyHRState;
