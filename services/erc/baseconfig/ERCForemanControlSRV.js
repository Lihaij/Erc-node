const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCForemanControl');
const model = require('../../../model');

const sequelize = model.sequelize
const tb_usergroup = model.common_usergroup;
const tb_user = model.common_user;
const tb_domainsignworker = model.erc_domainsignworker
const tb_order = model.erc_order

let groups = []

//运营数据管理->签约工长维护
exports.ERCForemanControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'searchDomainForeman') {
        searchDomainForeman(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'editSignDate') {
        editSignDate(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'delete') {
        deleteAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    let returnData = {}
    let user = req.user;

    groups = []
    await genUserGroup(user.domain_id, '0', 0)
    returnData.groupInfo = groups

    common.sendData(res, returnData)
}
//查询工人搜索数据
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        let queryStr = `select
                        *
                        from tbl_common_user
                        where state = 1
                        and user_type = ?`;
        let replacements = [];
        replacements.push(GLBConfig.TYPE_WORKER);

        if (doc.search_text) {
            queryStr += ` and (username like ? or email like ? or phone like ? or name like ? or address like ?)`;
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];

        for (let ap of result.data) {
            delete ap.password;
            returnData.rows.push(ap)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//查询签约工长列表
async function searchDomainForeman(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        let queryStr = `select
                        a.user_id, a.usergroup_id, a.username, a.name, a.phone
                        , b.domain_id, b.domainsignworker_id, b.domainsign_date, b.domainsign_deposit, b.domainsign_remark
                        from tbl_common_user a
                        left join tbl_erc_domainsignworker b
                        on a.user_id = b.user_id
                        where b.state = 1
                        and a.user_type = ?
                        and b.domain_id = ?`;
        let replacements = [];
        replacements.push(GLBConfig.TYPE_WORKER);
        replacements.push(user.domain_id);

        if (doc.search_text) {
            queryStr += ` and (username like ? or email like ? or phone like ? or name like ? or address like ?)`;
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];

        for (let ap of result.data) {
            delete ap.password;
            returnData.rows.push(ap)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//新增签约工长
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let foremanUser = await tb_domainsignworker.findOne({
            where: {
                domain_id: user.domain_id,
                user_id: doc.user_id
            }
        });
        logger.debug('find:', foremanUser);

        if (foremanUser) {
            if (foremanUser.state > 0) {
                return common.sendError(res, 'foreman_03', '该工人已签约');
            } else {
                foremanUser.state = 1;
                foremanUser.domainsign_date = doc.domainsign_date;
                foremanUser.domainsign_deposit = doc.domainsign_deposit;
                foremanUser.domainsign_remark = doc.domainsign_remark;
                await foremanUser.save();
                common.sendData(res, foremanUser);
            }
        } else {
            doc.domain_id = user.domain_id;
            let addSignWorker = await tb_domainsignworker.create(doc);
            common.sendData(res, addSignWorker);
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}
//修改签约日期
async function editSignDate(req, res) {
    try {
        let doc = req.body;
        let user = req.user;
        logger.debug('doc:', doc);

        let foremanUser = await tb_domainsignworker.findOne({
            where: {
                domain_id: user.domain_id,
                user_id: doc.user_id,
                state: GLBConfig.ENABLE
            }
        });
        logger.debug('find:', foremanUser);

        if (foremanUser) {
            foremanUser.domainsign_date = doc.domainsign_date;
            await foremanUser.save();
            common.sendData(res, foremanUser);
        } else {
            common.sendError(res, 'foreman_03')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}
//修改工长信息
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        logger.debug('doc:', doc);
        logger.debug('user:', user);

        let foremanUser = await tb_domainsignworker.findOne({
            where: {
                domain_id: user.domain_id,
                user_id: doc.old.user_id,
                state: GLBConfig.ENABLE
            }
        });
        logger.debug('find:', foremanUser);

        if (foremanUser) {
            let date = new Date(doc.new.domainsign_date);
            foremanUser.domainsign_date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
            foremanUser.domainsign_deposit = doc.new.domainsign_deposit;
            foremanUser.domainsign_remark = doc.new.domainsign_remark;
            await foremanUser.save();
            common.sendData(res, foremanUser);
        } else {
            common.sendError(res, 'foreman_03')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}
//删除工长信息
async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let order = await tb_order.findOne({
            where: {
                order_foreman: doc.user_id,
                state: GLBConfig.ENABLE,
                order_state: {
                    $notIn: ['FINISHI','CANCELLED']
                }
            }
        });
        if(order){
            return common.sendError(res, 'foreman_01');
        }

        let foremanUser = await tb_domainsignworker.findOne({
            where: {
                domain_id: user.domain_id,
                user_id: doc.user_id,
                state: GLBConfig.ENABLE
            }
        });
        logger.debug('find:', foremanUser);

        if (foremanUser) {
            foremanUser.state = 0;
            await foremanUser.save();
            common.sendData(res, foremanUser);
        } else {
            common.sendError(res, 'foreman_03')
        }
    } catch (error) {
        return common.sendFault(res, error)
    }
}
//获得用户机构
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
            groups.concat(await genUserGroup(domain_id, g.usergroup_id, lev + 1));
        } else {
            groups.push({
                id: g.usergroup_id,
                text: '--'.repeat(lev) + g.usergroup_name
            });
        }
    }
}
