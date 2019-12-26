const moment = require('moment');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCLandAgentControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');

const FDomain = require('../../../bl/common/FunctionDomainBL');

const sequelize = model.sequelize;
const tb_landagent = model.erc_landagent;

const tb_domainmenu = model.common_domainmenu;
const tb_usergroup = model.common_usergroup;
const tb_usergroupmenu = model.common_usergroupmenu;
const tb_user = model.common_user;
const tb_thirdsignuser = model.erc_thirdsignuser;

// 地产商接口
exports.ERCLandAgentControlResource = (req, res) => {
    let method = req.query.method;
    if (method==='init'){
        initAct(req,res)
    }else if(method==='add'){
        addAct(req,res)
    } else if (method === 'getUserForLandAgent') {
        getUserForLandAgent(req, res)
    } else if (method === 'getSignUser') {
        getSignUser(req, res)
    } else if (method === 'signUserForLandAgent') {
        signUserForLandAgent(req, res)
    } else if (method === 'removeSignUser') {
        removeSignUser(req, res)
    }else if(method==='addWithUser'){
        addWithUser(req,res)
    }else if (method==='delete'){
        deleteAct(req,res)
    }else if (method==='modify'){
        modifyAct(req,res)
    }else if (method==='search'){
        searchAct(req,res)
    }else{
        common.sendError(res, 'common_01');
    }
};

// 增加地产商
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user

        let landagent = await tb_landagent.findOne({
            where: {
                domain_id: user.domain_id,
                landagent_name: doc.landagent_name,
                state:GLBConfig.ENABLE
            }
        });

        if (landagent) {
            common.sendError(res, 'landagent_02');
            return
        }
        let addLandagent = await tb_landagent.create({
            domain_id: user.domain_id,
            landagent_name: doc.landagent_name,
            landagent_address: doc.landagent_address,
            landagent_phone: doc.landagent_phone,
            landagent_contact: doc.landagent_contact
        });
        common.sendData(res, addLandagent);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
// 查询地产商用户
async function getUserForLandAgent(req, res) {
    try {
        let user = req.user;
        let returnData = {};

        let queryStr = `select
             a.user_id, a.usergroup_id, a.username, a.name, a.phone, a.email
             from tbl_common_user a
             left join tbl_erc_thirdsignuser b
             on a.user_id = b.user_id
             where true
             and a.state = ?
             and a.user_type = ?
             and b.user_id is null`;
        let replacements = [];
        replacements.push(GLBConfig.ENABLE);
        replacements.push(GLBConfig.TYPE_OPERATOR);

        if (user.domain_id) {
            queryStr += ` and a.domain_id = ?`;
            replacements.push(user.domain_id);
        }

        let result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 查询登录用户
async function getSignUser(req, res) {
    try {
        let body = req.body;
        let user = req.user;
        let returnData = {};

        let queryStr = `select
             a.thirdsignuser_id, a.user_id, b.usergroup_id, b.username, b.name, b.phone, b.email
             from tbl_erc_thirdsignuser a
             left join tbl_common_user b
             on a.user_id = b.user_id
             where true
             and a.third_sign_type = 2`;
        let replacements = [];

        if (user.domain_id) {
            queryStr += ` and a.domain_id = ?`;
            replacements.push(user.domain_id);
        }
        if (body.landagent_id) {
            queryStr += ` and a.supplier_id = ?`;
            replacements.push(body.landagent_id);
        }
        if (body.search_text) {
            queryStr += ' and (b.username like ? or b.name like ? or b.phone like ? or b.email like ?)';
            let search_text = '%' + body.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
        }

        let result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 地产商用户登录
async function signUserForLandAgent(req, res) {
    try {
        logger.debug('signUserForLandAgent:', req.body);
        let body = req.body;
        let user = req.user;

        let userGroup = await tb_usergroup.findOne({
            where: {
                domain_id: user.domain_id,
                node_type: '11'
            }
        });

        let menuResult = await tb_domainmenu.findAll({
            where: {
                domain_id: user.domain_id,
                api_function: {
                    $in: [
                        'ERCESTATECONTROL',
                        'ERCROOMTYPECONTROL',
                        'ERCLANDAGENTESTATECONTROL',
                        'ERCLANDAGENTORDERCONTROL',
                        'USERSETTING',
                        'RESETPASSWORD']
                }
            }
        });
        if (menuResult.length < 4) {
            return common.sendError(res, '请先添加当前机构所需的权限');
        }

        if (!userGroup) {
            userGroup = await tb_usergroup.create({
                domain_id: user.domain_id,
                usergroup_name: '地产商管理员',
                usergroup_type: GLBConfig.TYPE_OPERATOR,
                node_type: '11',
                parent_id: 0
            });

            let menuArray = [];
            for (let i = 0; i < menuResult.length; i++) {
                let domainmenu_id = menuResult[i].domainmenu_id;
                menuArray.push({
                    usergroup_id: userGroup.usergroup_id,
                    domainmenu_id: domainmenu_id
                });
            }

            let groupMenu = await tb_usergroupmenu.bulkCreate(menuArray);
            if (!groupMenu) {
                return common.sendError(res, 'domain_01', '无法分配权限');
            }
        }

        let signUserArray = await tb_user.findAll({
            where: {
                domain_id: user.domain_id,
                user_id: {
                    $in: body.userArray
                }
            }
        });

        for (let i = 0; i < signUserArray.length; i++) {
            await tb_user.update({usergroup_id: userGroup.usergroup_id}, {
                where: {
                    user_id: signUserArray[i].user_id
                }
            });
        }

        let landAgentUserArray = [];
        for (let i = 0; i < body.userArray.length; i++) {
            let item = body.userArray[i];
            landAgentUserArray.push({
                domain_id: user.domain_id,
                supplier_id: body.landAgentId,
                user_id: item,
                third_sign_type: 2
            });
        }

        let result = await tb_thirdsignuser.bulkCreate(landAgentUserArray);

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 删除第三方登录用户
async function removeSignUser(req, res) {
    try {
        let body = req.body;
        let user = req.user;

        let result = await tb_thirdsignuser.destroy({
            where: {
                thirdsignuser_id: body.thirdsignuser_id,
                domain_id: user.domain_id
            }
        });

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

// 增加地产商管理员
async function addWithUser(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;

        let landagent = await tb_landagent.findOne({
            where: {
                domain_id: user.domain_id,
                landagent_name: doc.landagent_name,
                state:GLBConfig.ENABLE
            }
        });

        if (landagent) {
            common.sendError(res, 'landagent_02');
            return
        }
        let addLandagent = await tb_landagent.create({
            domain_id: user.domain_id,
            landagent_name: doc.landagent_name,
            landagent_address: doc.landagent_address,
            landagent_phone: doc.landagent_phone,
            landagent_contact: doc.landagent_contact
        });

        let userGroup = await tb_usergroup.findOne({
            where: {
                domain_id: user.domain_id,
                node_type: '11'
            }
        });

        let parentResult = await tb_domainmenu.findOne({
            where: {
                domain_id: user.domain_id,
                domainmenu_name: '运营数据管理',
                parent_id: 0
            }
        });

        let childResult = await tb_domainmenu.findAll({
            where: {
                domain_id: user.domain_id,
                parent_id: parentResult.domainmenu_id,
                api_function: {
                    $in: ['ERCESTATECONTROL']
                }
            }
        });
        childResult.unshift(parentResult);

        if (!userGroup) {
            userGroup = await tb_usergroup.create({
                domain_id: user.domain_id,
                usergroup_name: '地产商管理员',
                usergroup_type: GLBConfig.TYPE_OPERATOR,
                node_type: '11',
                parent_id: 0
            });

            let menuArray = [];
            for (let i = 0; i < childResult.length; i++) {
                let domainmenu_id = childResult[i].domainmenu_id;
                menuArray.push({
                    usergroup_id: userGroup.usergroup_id,
                    domainmenu_id: domainmenu_id
                });
            }

            let groupMenu = await tb_usergroupmenu.bulkCreate(menuArray);
            if (!groupMenu) {
                return common.sendError(res, 'domain_01', '无法分配权限');
            }
        }

        let adduser = await tb_user.findOne({
            where: {
                username: doc.landagent_name,
                usergroup_id: userGroup.usergroup_id,
                state: GLBConfig.ENABLE
            }
        });
        if (adduser) {
            return common.sendError(res, 'operator_02', '用户已存在');
        }

        adduser = await tb_user.create({
            user_id: await Sequence.genUserID(),
            domain_id: user.domain_id,
            usergroup_id: userGroup.usergroup_id,
            username: doc.landagent_name,
            phone: doc.landagent_phone,
            password: GLBConfig.INITPASSWORD,
            name: doc.landagent_name,
            address: doc.landagent_address,
            user_type: GLBConfig.TYPE_OPERATOR
        });

        if (!adduser) {
            return common.sendError(res, 'operator_02', '用户创建失败');
        }

        common.sendData(res, addLandagent);
    } catch (error) {
        common.sendFault(res, error);
    }
}

// 删除地产商
async function deleteAct(req,res){
    try {

        let doc = common.docTrim(req.body),
            user = req.user;

        let deleteLand = await tb_landagent.findOne({
            where: {
                domain_id: user.domain_id,
                landagent_id: doc.landagent_id
            }
        });

        if (deleteLand) {
            deleteLand.state =  GLBConfig.DISABLE;
            await deleteLand.save()
        } else {
            common.sendError(res, 'landagent_01');
            return
        }

        await tb_thirdsignuser.destroy({
            where: {
                supplier_id: doc.landagent_id
            },
            force: false
        });

        common.sendData(res, deleteLand);

    } catch (error) {
        return common.sendFault(res, error);
    }
}
// 修改地产商
async function modifyAct(req, res) {
    try {

        let doc = common.docTrim(req.body),
            user = req.user;

        let modifyLand = await tb_landagent.findOne({
            where: {
                landagent_id: doc.old.landagent_id
            }
        });

        if (modifyLand) {
            modifyLand.landagent_name=doc.new.landagent_name,
            modifyLand.landagent_address=doc.new.landagent_address,
            modifyLand.landagent_phone=doc.new.landagent_phone,
            modifyLand.landagent_contact=doc.new.landagent_contact
            await modifyLand.save()
        } else {
            common.sendError(res, 'landagent_01');
            return
        }

        common.sendData(res, modifyLand);

    } catch (error) {
        return common.sendFault(res, error);
    }
}
// 查询地产商
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};

        let queryStr = `select l.*,d.domain_name from tbl_erc_landagent l
            left join tbl_common_domain d on (l.domain_id=d.domain_id and d.state=1)
            where l.state=1 and l.domain_id `+ await FDomain.getDomainListStr(req);
        if(doc.search_text){
            queryStr+=' and l.landagent_name like ?';
            replacements.push('%' + doc.search_text + '%')
        }
        queryStr += ' order by l.landagent_id';
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.created_at.Format("yyyy-MM-dd");
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

// 初始化基础数据
async function initAct(req, res) {
    let returnData = {};
    await FDomain.getDomainListInit(req, returnData);
    returnData.userGroup = await tb_usergroup.findAll({
        where: {
            domain_id: req.user.domain_id
        },
        attributes: [['usergroup_id', 'id'], ['usergroup_name', 'text']]
    });
    common.sendData(res, returnData)
}
