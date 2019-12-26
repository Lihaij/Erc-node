const fs = require('fs');
const path = require('path');
const common = require('../util/CommonUtil.js');
const logger = require('../util/Logger').createLogger('UserBL.js');
const config = require('../config');
const GLBConfig = require('../util/GLBConfig');
const model = require('../model');

const sequelize = model.sequelize;
const tb_user = model.common_user;
const tb_usergroup = model.common_usergroup;
const tb_usergroupmenu = model.common_usergroupmenu;
const tb_menu = model.common_menu;
const tb_staff = model.nca_staff;
const tb_estateteam = model.nca_estateteam;

// 根据用户的附加组类型获取用户
exports.getSpecialGroupUser = async (domain_id, usergroup_type) => {
    try {
        let queryStr = `select a.usergroup_id as usergroup_id from tbl_common_usergroup a, tbl_common_usergroupmenu b, tbl_common_domainmenu c, tbl_common_api d
        where a.usergroup_id = b.usergroup_id
        and b.domainmenu_id = c.domainmenu_id
        and c.api_id = d.api_id
        and d.sys_usergroup_type = ?`;

        let replacements = [usergroup_type];

        if (usergroup_type === GLBConfig.TYPE_SUPERVISION) {
            queryStr += ` and a.domain_id = ? `;
            replacements.push(domain_id);
        }

        let usergroup_ids = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        })

        let ids = []
        for (let uid of usergroup_ids) {
            ids.push(uid.usergroup_id)
        }

        let users = await tb_user.findAll({
            where: {
                usergroup_id: {
                    $in: ids
                },
                state: GLBConfig.ENABLE
            }
        });

        return users

    } catch (error) {
        logger.error(error);
        return [];
    }
}

// 根据用户的附加组类型获取团体订单下的用户
exports.getEstateSpecialGroupUser = async (domain_id, usergroup_type, estate_id) => {
    try {
        let queryStr = `select a.usergroup_id as usergroup_id from tbl_common_usergroup a, tbl_common_usergroupmenu b, tbl_common_domainmenu c, tbl_common_api d
        where a.usergroup_id = b.usergroup_id
        and b.domainmenu_id = c.domainmenu_id
        and c.api_id = d.api_id
        and d.sys_usergroup_type = ?`;

        let replacements = [usergroup_type];

        if (usergroup_type === GLBConfig.TYPE_SUPERVISION) {
            queryStr += ` and a.domain_id = ? `;
            replacements.push(domain_id);
        }

        let usergroup_ids = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        })

        let ids = []
        for (let uid of usergroup_ids) {
            ids.push(uid.usergroup_id)
        }

        let eusers = await tb_estateteam.findAll({
            where: {
                estate_id: estate_id
            }
        })
        let uids = []
        for (let eu of eusers) {
            uids.push(eu.user_id)
        }

        let users = await tb_user.findAll({
            where: {
                usergroup_id: {
                    $in: ids
                },
                user_id: uids,
                state: GLBConfig.ENABLE
            }
        });

        return users

    } catch (error) {
        logger.error(error);
        return [];
    }
}

exports.getTypeUser = async (domain_id, usergroup_type) => {
    try {
        let users = await tb_user.findAll({
            where: {
                user_type: usergroup_type,
                state: GLBConfig.ENABLE
            }
        });

        return users
    } catch (error) {
        logger.error(error);
        return [];
    }
}

// 根据用户的附加组类型获取用户
exports.getOrderRelaUser = async (order_id, staff_type) => {
    try {
        let staffUsers = await tb_staff.findAll({
            where: {
                order_id: order_id,
                staff_type: staff_type,
                state: GLBConfig.ENABLE
            }
        });

        let ids = []
        for (let s of staffUsers) {
            ids.push(s.user_id)
        }

        let users = await tb_user.findAll({
            attributes: ['user_id', 'domain_id', 'usergroup_id', 'username', 'email', 'phone', 'name', 'gender', 'avatar', 'address', 'country', 'city', 'zipcode', 'user_type'],
            where: {
                user_id: ids,
                state: GLBConfig.ENABLE
            }
        });

        return users

    } catch (error) {
        logger.error(error);
        return [];
    }
}
