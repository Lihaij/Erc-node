const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('UserDepartmentSRV');
const model = require('../../../model');
const moment = require('moment');


const sequelize = model.sequelize;
const tb_department = model.erc_department;
const tb_user = model.common_user;
const tb_usergroup = model.common_usergroup;

exports.UserDepartmentSRVResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search_g') {
        searchGroupAct(req, res)
    } else if (method === 'search_user') {
        searchUserGroupAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        returnData.userInfo = req.user;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//获取用户机构树
async function searchGroupAct(req, res) {
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
        groups[0].children = JSON.parse(JSON.stringify(await genUserGroup(user.domain_id, groups[0].department_id)));
        common.sendData(res, groups);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//获取用户岗位信息
async function genUserGroup(domain_id, parentId) {
    let return_list = [];
    let groups = await tb_department.findAll({
        where: {
            domain_id: domain_id,
            p_department_id: parentId,
            department_state: 1
        }
    });
    for (let g of groups) {
        let sub_group = [];

        sub_group = await genUserGroup(domain_id, g.department_id);
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
//获取组织机构树
async function searchUserGroupAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = [];

        let userGroup = await tb_department.findAll({
            where: {
                domain_id: user.domain_id,
                department_id: doc.department_id
            }
        });

        for (let u of userGroup) {
            let rj = JSON.parse(JSON.stringify(u))
            rj.position = genPosition(rj.department_id, userGroup).substring(1)
            returnData.push(rj)
        }
        common.sendData(res,returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//获取岗位名称
function genPosition(department_id, usergroups) {
    let positionName = '',
        parent_id;

    function isEqual(element, index, array) {
        if (element.department_id === department_id) {
            positionName = element.department_name
            parent_id = element.p_department_id
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