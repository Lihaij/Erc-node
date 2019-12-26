/**
 * 收货管理
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const { CODE_NAME, genBizCode } = require('../../../util/BizCodeUtil');
const logger = require('../../../util/Logger').createLogger('ERCCollectGoodsControlSRV');
const model = require('../../../model');
const task = require('../baseconfig/ERCTaskListControlSRV');

const sequelize = model.sequelize;

const tb_purchasedetail = model.erc_purchasedetail;
const tb_purchaseorder = model.erc_purchaseorder;
const tb_task = model.erc_task;
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;
const tb_receipt = model.erc_receipt;
const tb_receiptitem = model.erc_receiptitem;

exports.ERCCollectGoodsControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search_collects') { //收货列表
        searchCollectsAct(req, res)
    } else if (method === 'search_collects_detail') { //收货明细
        searchCollectsDetailAct(req, res)
    } else if (method === 'submit_collects') { //提交收货
        submitCollectsAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};
//初始化数据
async function initAct(req, res) {
    try {
        let returnData = {};
        returnData.collectGoodsInfo = GLBConfig.COLLECTGOODSSTATE;
        returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'); //物料单位
        returnData.materielStateManagement = GLBConfig.MATERIELSTATEMANAGEMENT;
        common.sendData(res, returnData)
    } catch (error) {
        return common.sendFault(res, error);
    }
}
//收货列表
async function searchCollectsAct(req, res) {
    try {
        let doc = common.docTrim(req.body), user = req.user,replacements=[],returnData={};
        let queryStr =
            `select
                po.purchaseorder_id, po.biz_code, s.supplier_name, s.supplier_id
                , date(po.created_at) as created_at, po.collect_state 
                from tbl_erc_purchaseorder po
                left join tbl_erc_supplier s
                on (po.supplier_id = s.supplier_id and s.state = 1)
                where po.state=1
                and po.purchaseorder_domain_id=?`;

        replacements.push(user.domain_id);

        if (doc.search_text) {
            queryStr+=' and (po.purchaseorder_id like ? or s.supplier_name like ?)';
            replacements.push('%'+doc.search_text+'%');
            replacements.push('%'+doc.search_text+'%');
        }
        if (doc.created_at) {
            queryStr += ' and po.created_at >= ? and po.created_at <= ?';
            replacements.push(doc.created_at + ` 00:00:00`);
            replacements.push(doc.created_at + ` 23:59:59`);
        }
        queryStr += ' order by po.created_at desc';

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
//收货详情
async function searchCollectsDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body), user = req.user,replacements=[],returnData={};
        let queryStr=`select pd.purchasedetail_id, po.purchaseorder_id, po.supplier_id, pd.purchase_number, pd.collect_number,
                      m.materiel_id, m.materiel_code, m.materiel_name, m.materiel_format, m.materiel_unit, m.materiel_state_management
                      from tbl_erc_purchasedetail pd 
                      left join tbl_erc_materiel m on (pd.materiel_id = m.materiel_id and m.state = 1)
                      left join tbl_erc_purchaseorder po on (pd.purchase_id = po.purchaseorder_id)
                      where pd.purchase_id = ?`;
        replacements.push(doc.purchase_id);
        if(doc.search_text){
            queryStr+=' and (m.materiel_code like ? or m.materiel_name like ?)';
            replacements.push('%'+doc.search_text+'%');
            replacements.push('%'+doc.search_text+'%');
        }
        queryStr += ' order by m.materiel_id';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
//提交收货
async function submitCollectsAct (req, res) {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData={};
        let collects = doc.collects;
        let purchaseId = doc.purchaseId;
        let supplierId = doc.supplierId;

        //创建收货单
        let receipt =  await tb_receipt.create({
            receipt_id: await Sequence.genReceiptID(user.domain_id),
            purchaseorder_id: purchaseId,
            domain_id: user.domain_id,
            supplier_id: supplierId,
            biz_code: await genBizCode(CODE_NAME.RT, user.domain_id, 6)
        });

        for (let c of collects) {
            await tb_purchasedetail.increment(
                ['collect_number'],
                {
                    by: Number(c.will_collect_number),
                    where: {
                        purchasedetail_id: c.purchasedetail_id
                    }
                }
            );
            //创建收货单明细
            await tb_receiptitem.create({
                receipt_id: receipt.receipt_id,
                materiel_id: c.materiel_id,
                purchasedetail_id: c.purchasedetail_id,
                receipt_item_number: c.will_collect_number
            });
        }
        //更改采购单收货状态
        let replacements=[];
        let queryStr = `select * from tbl_erc_purchasedetail 
                        where purchase_number != collect_number and purchase_id = ? `;
        replacements.push(purchaseId);
        let complete = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT,
            state: GLBConfig.ENABLE
        });

        let state = (complete.length <= 0 ? 2 : 1);
        await tb_purchaseorder.update({
            collect_state: state
        }, {
            where: {
                purchaseorder_id:purchaseId
            }
        });

        let result = await tb_purchasedetail.findAll({
            where: {
                purchase_id: purchaseId
            }
        });

        //创建质检任务
        let groupId = common.getUUIDByTime(30);
        let taskDescription = receipt.receipt_id + '  收货单质检任务';
        let taskResult = await task.createTask(user,'品质检验任务',58,'',receipt.receipt_id,taskDescription,'',groupId);
        // if(!taskResult){
            // return common.sendError(res, 'task_02');
        // }
        common.sendData(res, result);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
