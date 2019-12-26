const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCWorkerControl');
const model = require('../../../model');
const FDomain = require('../../../bl/common/FunctionDomainBL');

const sequelize = model.sequelize
const tb_usergroup = model.common_usergroup;
const tb_user = model.common_user;
const tb_domainsignworker = model.erc_domainsignworker;
const tb_thirdsignuser = model.erc_thirdsignuser;

let groups = []

exports.ERCWorkerControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    try {
        let user = req.user;
        let returnData = {
            stateInfo: GLBConfig.USERSTATE,
            userGroup: await tb_usergroup.findAll({
                where: {
                    domain_id: req.user.domain_id
                },
                attributes: [['usergroup_id', 'id'], ['usergroup_name', 'text']]
            })
        };

        await FDomain.getDomainListInit(req, returnData);
        let result = await tb_thirdsignuser.findOne({where: {user_id: user.user_id}});
        returnData.thirdUser = !!result;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendError(res, error)
    }
}
//获取工人列表
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        let queryStr = `select
                        *
                        from tbl_common_user
                        where user_type = ? `;
        let replacements = [];
        replacements.push(GLBConfig.TYPE_WORKER);

        if (doc.search_text) {
            queryStr += ` and (phone like ? or name like ?)`;
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text);
        }

        if(doc.state){
            queryStr += ` and state=? `;
            replacements.push(doc.state);
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
//修改工人信息
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let worker = await tb_user.findOne({
            where: {
                user_id: doc.old.user_id
            }
        });

        if (worker) {
            if(worker.domain_id != user.domain_id){
                common.sendError(res, 'worker_03')
            }else{
                worker.user_remark = doc.new.user_remark;
                worker.state = doc.new.state;
                await worker.save();
                common.sendData(res, worker);
            }

        } else {
            common.sendError(res, 'operator_03')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}

