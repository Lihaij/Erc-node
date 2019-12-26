const common = require('../../util/CommonUtil');
const GLBConfig = require('../../util/GLBConfig');
const logger = require('../../util/Logger').createLogger('ERCRegisterControlSRV');
const model = require('../../model');
const Sequence = require('../../util/Sequence');
const sms = require('../../util/SMSUtil.js');

const sequelize = model.sequelize;
const tb_common_user = model.common_user;
const tb_common_usergroup = model.common_usergroup;
const tb_common_usergroupmenu = model.common_usergroupmenu;
const tb_erc_customer = model.erc_customer;
const tb_erc_worker = model.erc_worker;

const point = require('./baseconfig/ERCPointControlSRV');


/**
 * 用户注册
 * @param req
 * @param res
 * @returns {*}
 *
 * 所有用户的username 是唯一的，业主的phone 在业主角色下唯一;
 */
exports.ERCRegisterResource = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        let addUser = null,
            addCustomer = null,
            addWorker = null;

        if (!('phone' in doc)) {
            return common.sendError(res, 'reg_01');
        }
        if (!('type' in doc)) {
            return common.sendError(res, 'reg_02');
        }
        if (!('code' in doc)) {
            return common.sendError(res, 'reg_03');
        }
        if (!('password' in doc)) {
            return common.sendError(res, 'reg_04');
        }
        if (!('name' in doc)) {
            return common.sendError(res, 'reg_05');
        }

        if (doc.type == GLBConfig.TYPE_CUSTOMER) {
            addUser = await tb_common_user.findOne({
                where: {
                    username: doc.phone
                }
            });
            if (addUser) {
                addCustomer = await tb_erc_customer.findOne({
                    where: {
                        user_id: addUser.user_id
                    }
                });
                if (!addCustomer) //如果user 已存在且不是后台创建的，注册失败
                    return common.sendError(res, 'operator_02');
                if (addCustomer.customer_source === '1') //如果user 已存在且不是后台创建的，注册失败
                    return common.sendError(res, 'operator_02');
            }
        } else if (doc.type == GLBConfig.TYPE_WORKER || doc.type == GLBConfig.TYPE_FOREMAN || doc.type == GLBConfig.TYPE_SUPERVISION) {
            addUser = await tb_common_user.findOne({
                where: {
                    username: doc.phone
                }
            });
            if (addUser)
                return common.sendError(res, 'operator_02');
        }
        let userGroup = await tb_common_usergroup.findOne({
            where: {
                usergroup_type: doc.type,
                state: GLBConfig.ENABLE
            }
        });
        if (!userGroup)
            return common.sendError(res, 'group_02');
        let checkResult = await sms.certifySMSCode(doc.phone, doc.code, GLBConfig.SMSTYPE[0].value);
        common.transaction(async function(t) {
            if (checkResult) {
                if (addUser) {
                    addUser.password = doc.password;
                    if (doc.name) addUser.name = doc.name;
                    addUser.state = GLBConfig.ENABLE;
                    await addUser.save({
                        transaction: t
                    });

                    if (doc.type == GLBConfig.TYPE_CUSTOMER) {
                        addCustomer.customer_level = GLBConfig.CLEVELINFO[2].value
                        addCustomer.customer_source = GLBConfig.CUSTOMERSOURCE[0].value
                        await addCustomer.save({
                            transaction: t
                        });
                    }
                } else {
                    addUser = await tb_common_user.create({
                        user_id: await Sequence.genUserID(),
                        usergroup_id: userGroup.usergroup_id,
                        username: doc.phone,
                        phone: doc.phone,
                        password: doc.password,
                        user_type: doc.type,
                        name: doc.name
                    }, {
                        transaction: t
                    });
                    if (doc.type == GLBConfig.TYPE_CUSTOMER) {
                        let addCustomer = await tb_erc_customer.create({
                            user_id: addUser.user_id,
                            customer_level: GLBConfig.CLEVELINFO[2].value,
                            customer_source: GLBConfig.CUSTOMERSOURCE[0].value
                        }, {
                            transaction: t
                        });
                    }
                    if (doc.type == GLBConfig.TYPE_WORKER) {
                        addWorker = await tb_erc_worker.create({
                            user_id: addUser.user_id
                        }, {
                            transaction: t
                        });
                    }
                }
                let retData = JSON.parse(JSON.stringify(addUser));
                if (doc.type == GLBConfig.TYPE_CUSTOMER) {
                    //注册用户增加积分
                    await point.updateUserPoint(addUser.user_id, 1, 1, '','');
                    retData = Object.assign(JSON.parse(JSON.stringify(addUser)), JSON.parse(JSON.stringify(addCustomer)));
                }
                if (doc.type == GLBConfig.TYPE_WORKER) {
                    retData = Object.assign(JSON.parse(JSON.stringify(addUser)), JSON.parse(JSON.stringify(addWorker)));
                }

                delete retData.password
                common.sendData(res, retData);
            } else return common.sendError(res, 'auth_12');
        });
    } catch (error) {
        common.sendFault(res, error);
    }
};
