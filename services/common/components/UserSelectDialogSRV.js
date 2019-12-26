const fs = require('fs');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('GroupControlSRV');
const model = require('../../../model');

// tables
const sequelize = model.sequelize
const tb_usergroup = model.common_usergroup;
const tb_user = model.common_user;
const tb_department = model.erc_department;
const tb_position = model.erc_position;

exports.UserSelectDialogResource = (req, res) => {
    let method = req.query.method;
    if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'searchUser') {
        searchUserAct(req, res)
    } else if (method === 'getUserStructure') {
        getUserStructure(req, res)
    } else if (method === 'getUserList') {
        getUserList(req, res)
    } else if (method === 'getDepartmentList') {
        getDepartmentList(req, res)
    } else if (method === 'getPositionList') {
        getPositionList(req, res)
    } else {
        common.sendError(res, 'common_01');
    }
};

async function searchAct(req, res) {
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

async function searchUserAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = [];

        let users = await tb_user.findAll({
            where: {
                domain_id: user.domain_id,
                usergroup_id: doc.usergroup_id,
                state: GLBConfig.ENABLE
            }
        });

        let usergroups = await tb_usergroup.findAll({
            where: {
                domain_id: user.domain_id
            }
        });

        for (let u of users) {
            let rj = JSON.parse(JSON.stringify(u))
            delete rj.pwaaword
            rj.position = genPosition(rj.usergroup_id, usergroups).substring(1)
            returnData.push(rj)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

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

async function getUserStructure(req, res) {
    try {
        const { user } = req;
        const { domain_id } = user;

        const state = GLBConfig.ENABLE;
        const structureArray = [];
        let departmentResult = await tb_department.findAll({
            where: {
                domain_id,
                state
            },
            attributes: ['department_id', 'department_name', ['department_name', 'name']]
        });

        departmentResult = departmentResult.map(item => {
            return {
                ...item.dataValues,
                isParent: true,
                node_type: 0
            }
        });

        for (const departmentItem of departmentResult) {
            const { department_id, department_name } = departmentItem;
            let positionResult = await tb_position.findAll({
                where: {
                    domain_id,
                    state,
                    department_id
                },
                attributes: ['position_id', ['position_name', 'name']]
            });

            positionResult = positionResult.map(item => {
                return {
                    ...item.dataValues,
                    isParent: false,
                    parent_id: department_id,
                    parent_name: department_name,
                    node_type: 1
                }
            });

            structureArray.push({
                ...departmentItem,
                children: positionResult
            });
        }

        common.sendData(res, structureArray);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getUserList(req, res) {
    try {
        const { user, body } = req;
        const { domain_id } = user;
        const { parent_id, position_id } = body;

        const state = GLBConfig.ENABLE;
        const queryStr =
            `select
                usr.user_id, usr.name, usr.phone, pst.position_name
                from tbl_erc_custorgstructure ctt
                left join tbl_common_user usr
                on ctt.user_id = usr.user_id
                left join tbl_erc_customer ctm
                on usr.user_id = ctm.user_id
                left join tbl_erc_position pst
                on ctt.position_id = pst.position_id
                where true
                and ctt.department_id = ?
                and ctt.position_id = ?
                and usr.domain_id = ?
                and usr.state = ?
                and ctm.user_state > 0`;

        const replacements = [parent_id, position_id, domain_id, state];
        const result = await common.simpleSelect(sequelize, queryStr, replacements);

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getDepartmentList(req, res) {
    try {
        const { user } = req;
        const { domain_id } = user;
        const state = GLBConfig.ENABLE;

        let departmentResult = await tb_department.findAll({
            where: {
                domain_id,
                state
            },
            attributes: ['department_id', ['department_name', 'name']]
        });

        departmentResult = departmentResult.map(item => {
            return {
                ...item.dataValues,
                isParent: false,
                node_type: 0
            }
        });

        common.sendData(res, departmentResult);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getPositionList(req, res) {
    try {
        const { body } = req;
        const { department_id } = body;
        const state = GLBConfig.ENABLE;

        let positionResult = await tb_position.findAll({
            where: {
                department_id,
                state
            },
            attributes: ['position_id', 'position_name']
        });

        positionResult = positionResult.map(item => {
            return {
                ...item.dataValues
            }
        });

        common.sendData(res, positionResult);
    } catch (error) {
        common.sendFault(res, error);
    }
}
