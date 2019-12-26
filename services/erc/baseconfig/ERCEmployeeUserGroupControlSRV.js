const fs = require('fs');
const path = require('path');
const iconvLite = require('iconv-lite');
const config = require('../../../config');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCEmployeeUserGroupControlSRV');
const model = require('../../../model');
const moment = require('moment');

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

exports.ERCEmployeeUserGroupControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search_g') {
        searchGroupAct(req, res)
    } else if (method === 'search_user') {
        searchUserGroupAct(req, res)
    }else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    let doc = req.body
    let returnData = {};
    let user = req.user;
    try{
        returnData.userInfo = req.user;

        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//查询机构树状结构
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
//查询用户岗位联动列表
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

//查询根位置的用户
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