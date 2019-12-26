const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCWorkerPriceControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const moment = require('moment');

const sequelize = model.sequelize;
const tb_domain = model.common_domain;
const tb_user = model.common_user;
const tb_workerprice = model.erc_workerprice;

exports.ERCWorkerPriceControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'add') {
        addAct(req, res);
    } else if (method === 'modify') {
        modifyAct(req, res);
    } else if (method === 'delete') {
        deleteAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

async function initAct(req, res) {
    try {
        let returnData = {};
        await FDomain.getDomainListInit(req, returnData);
        returnData.userInfo = req.user;
        common.sendData(res, returnData)
    } catch (error) {
        return common.sendFault(res, error);
    }
}
//获取人工价格列表
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};

        let queryStr='select * from tbl_erc_workerprice where domain_id = ? and state = 1'
            replacements.push(user.domain_id);

        if (doc.search_text) {
            queryStr += ' and worker_name like ?';
            replacements.push('%'+doc.search_text+'%');
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        // returnData.rows = result.data;
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

//新增人工价格
async function addAct(req,res){
    try {
        let doc = common.docTrim(req.body),user = req.user;
        let workerprice = await tb_workerprice.findOne({
            where: {
                worker_name: doc.worker_name,
                domain_id: user.domain_id,
                state: 1
            }
        })
    if (workerprice) {
        return common.sendError(res, 'worker_01')
    } else {
        let workerprice = await tb_workerprice.create({
            worker_name: doc.worker_name,
            domain_id: user.domain_id,
            worker_unit: doc.worker_unit,
            worker_cost: doc.worker_cost
        });
    }
        common.sendData(res, workerprice);
    }catch (error) {
        common.sendFault(res, error);
        return
    }
}
//修改人工价格信息
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user

        let workerprice = await tb_workerprice.findOne({
            where: {
                worker_id:doc.old.worker_id,
                domain_id:user.domain_id
            }
        });
        if (workerprice) {
            workerprice.worker_unit = doc.new.worker_unit,
            workerprice.worker_cost = doc.new.worker_cost
            await workerprice.save()
        }
        common.sendData(res)
    } catch (error) {
        common.sendFault(res, error)
    }
}
//删除人工价格信息
async function deleteAct(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        let workerprice = await tb_workerprice.findOne({
            where: {
                worker_id:doc.worker_id,
                domain_id:user.domain_id
            }
        });
        if (workerprice) {
            workerprice.state =  GLBConfig.DISABLE;
            await workerprice.save()
        } else {
            common.sendError(res, 'worker_02');
            return
        }
        common.sendData(res, workerprice);

    } catch (error) {
        return common.sendFault(res, error);
    }
}
