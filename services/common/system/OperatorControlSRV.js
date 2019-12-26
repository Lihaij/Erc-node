const fs = require('fs');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('GroupControlSRV');
const model = require('../../../model');
const RedisClient = require('../../../util/RedisClient');

const sequelize = model.sequelize
const tb_usergroup = model.common_usergroup;
const tb_user = model.common_user;

let groups = []

exports.OperatorControlResource = (req, res) => {
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
    } else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    try {
        let returnData = {}
        let user = req.user;

        groups = []
        await genUserGroup(user.domain_id, '0', 0)
        returnData.groupInfo = groups

        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {}

        let queryStr = 'select * from tbl_common_user where domain_id = ? and state = "1" and user_type = "01"'
        let replacements = [user.domain_id]

        if (doc.search_text) {
            queryStr += ' and (username like ? or email like ? or phone like ? or name like ? or address like ?)'
            let search_text = '%' + doc.search_text + '%'
            replacements.push(search_text)
            replacements.push(search_text)
            replacements.push(search_text)
            replacements.push(search_text)
            replacements.push(search_text)
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements)

        returnData.total = result.count
        returnData.rows = []

        for (let ap of result.data) {
            let d = JSON.parse(JSON.stringify(ap))
            delete d.pwaaword
            returnData.rows.push(d)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user

        let usergroup = await tb_usergroup.findOne({
            where: {
                usergroup_id: doc.usergroup_id
            }
        });

        if (usergroup) {
            let adduser = await tb_user.findOne({
                where: {
                    phone: doc.phone
                }
            });
            if (adduser) {
                return common.sendError(res, 'operator_02');
            }
            adduser = await tb_user.findOne({
                where: {
                    username: doc.username
                }
            });
            if (adduser) {
                return common.sendError(res, 'operator_02');
            }
            adduser = await tb_user.create({
                user_id: await Sequence.genUserID(),
                domain_id: user.domain_id,
                usergroup_id: doc.usergroup_id,
                username: doc.username,
                email: doc.email,
                phone: doc.phone,
                password: GLBConfig.INITPASSWORD,
                name: doc.name,
                gender: doc.gender,
                address: doc.address,
                city: doc.city,
                zipcode: doc.zipcode,
                user_type: usergroup.usergroup_type
            });
            delete adduser.password
            common.sendData(res, adduser)
        } else {
            common.sendError(res, 'operator_01')
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}

async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user

        let modiuser = await tb_user.findOne({
            where: {
                domain_id: user.domain_id,
                user_id: doc.old.user_id,
                state: GLBConfig.ENABLE
            }
        });
        let usergroup = await tb_usergroup.findOne({
            where: {
                usergroup_id: doc.new.usergroup_id
            }
        });
        if (modiuser) {
            modiuser.email = doc.new.email;
            modiuser.phone = doc.new.phone;
            modiuser.name = doc.new.name;
            modiuser.gender = doc.new.gender
            modiuser.avatar = doc.new.avatar;
            modiuser.address = doc.new.address;
            modiuser.state = doc.new.state;
            modiuser.city = doc.new.city;
            modiuser.zipcode = doc.new.zipcode;
            modiuser.usergroup_id = doc.new.usergroup_id;
            modiuser.user_type = usergroup.usergroup_type;
            await modiuser.save();
            delete modiuser.password;
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

async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user

        let deluser = await tb_user.findOne({
            where: {
                domain_id: user.domain_id,
                user_id: doc.user_id,
                state: GLBConfig.ENABLE
            }
        });

        if (deluser) {
            // 有未完成订单
            let queryStr = `select DISTINCT(a.order_id) from
            tbl_erc_staff a, tbl_erc_order b
            where a.order_id = b.order_id
            and a.user_id = ?
            and a.staff_state = '1'
            and b.state = '1'
            and b.order_state not in ('FINISHI','CANCELLED')`
            let queryResult = await sequelize.query(queryStr, {
                replacements: [deluser.user_id],
                type: sequelize.QueryTypes.SELECT
            })

            if (queryResult.length > 0) {
                return common.sendError(res, 'operator_04')
            }

            deluser.state = GLBConfig.DISABLE
            await deluser.save()
            RedisClient.removeItem(GLBConfig.REDISKEY.AUTH + 'WEB' + doc.user_id);
            RedisClient.removeItem(GLBConfig.REDISKEY.AUTH + 'MOBILE' + doc.user_id);
            common.sendData(res)
        } else {
            return common.sendError(res, 'operator_03')

        }
    } catch (error) {
        return common.sendFault(res, error)
    }
}

async function genUserGroup(domain_id, parentId, lev) {
    let actgroups = await tb_usergroup.findAll({
        where: {
            domain_id: domain_id,
            parent_id: parentId,
            usergroup_type: GLBConfig.TYPE_OPERATOR
        }
    });
    for (let g of actgroups) {
        if (g.node_type === GLBConfig.MTYPE_ROOT) {
            groups.push({
                id: g.usergroup_id,
                text: '--'.repeat(lev) + g.usergroup_name,
                disabled: true
            });
            await genUserGroup(domain_id, g.usergroup_id, lev + 1);
        } else {
            groups.push({
                id: g.usergroup_id,
                text: '--'.repeat(lev) + g.usergroup_name
            });
        }
    }
}
