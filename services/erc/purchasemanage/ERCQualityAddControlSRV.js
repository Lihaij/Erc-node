/**
 * Created by shuang.liu on 18/3/16.
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCQualityAddControlSRV');
const model = require('../../../model');
const task = require('../baseconfig/ERCTaskListControlSRV');
const { CODE_NAME, genBizCode } = require('../../../util/BizCodeUtil');

const sequelize = model.sequelize;
const tb_user = model.user;
const tb_qualitycheck = model.erc_qualitycheck;
const tb_qualitycheckdetail = model.erc_qualitycheckdetail;
const tb_purchasedetail = model.erc_purchasedetail;
const tb_purchaseorder = model.erc_purchaseorder;
const tb_return = model.erc_return;
const tb_returndetail = model.erc_returndetail;
const tb_task = model.erc_task;
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;
const tb_receiptitem = model.erc_receiptitem;
const tb_receipt = model.erc_receipt;


exports.ERCQualityAddControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'search_d') {
        searchDetailAct(req, res)
    } else if (method === 'submit') {
        submitAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
}
//初始化单位和状态
async function initAct(req, res) {
    try {
        let returnData = {};
        returnData.checkInfo = GLBConfig.CHECKSTATE;
        returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW');

        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//查看品质录入的数据
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let replacements=[];
        let returnData={};
        let queryStr=`select r.*, s.supplier_name 
                      from tbl_erc_receipt r 
                      left join tbl_erc_supplier s on (r.supplier_id = s.supplier_id and s.state=1)
                      left join tbl_erc_purchaseorder p on (p.purchaseorder_id = r.purchaseorder_id) 
                      where r.domain_id = ? `;
        replacements.push(user.domain_id);

        if(doc.search_text){
            queryStr+=' and (r.receipt_id like ? or r.purchaseorder_id like ? or s.supplier_name like ?)';
            replacements.push('%'+doc.search_text+'%');
            replacements.push('%'+doc.search_text+'%');
            replacements.push('%'+doc.search_text+'%');
        }
        if (doc.created_at) {
            queryStr += ' and r.created_at >= ? and r.created_at <= ?';
            replacements.push(doc.created_at + ` 00:00:00`);
            replacements.push(doc.created_at + ` 23:59:59`);
        }
        queryStr += ' order by r.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for(let r of result.data){
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at.Format("yyyy-MM-dd hh:mm:ss");
            returnData.rows.push(result)
        }

        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
//查看品质录入的详情数据
async function searchDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let replacements=[];
        let returnData={};
        let queryStr=`select ri.*, ri.receipt_item_number-ri.qualified_number as check_num, 
                      mt.materiel_code, mt.materiel_id, mt.materiel_name, mt.materiel_format, mt.materiel_unit, 
                      pd.order_ids 
                      from tbl_erc_receiptitem ri 
                      left join tbl_erc_materiel mt on (ri.materiel_id = mt.materiel_id and mt.state = 1)
                      left join tbl_erc_purchasedetail pd on (ri.purchasedetail_id = pd.purchasedetail_id and pd.state = 1)
                      where ri.receipt_id = ? `;

        replacements.push(doc.receipt_id);

        if(doc.search_text){
            queryStr+=' and (mt.materiel_code like ? or mt.materiel_name like ?)';
            replacements.push('%'+doc.search_text+'%');
            replacements.push('%'+doc.search_text+'%');
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
//提交品质录入详情的数据
async function submitAct(req, res) {
    let doc = common.docTrim(req.body);
    let user = req.user;

    let idArray = []
    try {
        if(doc.checkDetail==null || doc.checkDetail.length==0){
            common.sendError(res, 'quality_01');
            return;
        }
        for (let i = 0; i < doc.checkDetail.length; i++) {
            idArray.push(doc.checkDetail[i])
        }
        for (let file of idArray) {
            if (file.unqualified_number == null && file.qualified_number == null) {
                common.sendError(res, 'stock_03');
                return;
            }
        }

        //校验是否分配退货任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where:{
                state:GLBConfig.ENABLE,
                taskallot_name:'退货任务'
            }
        });
        let taskallotuser = await tb_taskallotuser.findOne({
            where:{
                state:GLBConfig.ENABLE,
                domain_id: user.domain_id,
                taskallot_id:taskallot.taskallot_id
            }
        });
        if (!taskallotuser) {
            return common.sendError(res, 'returntask_01');
        }

        //质检总单
        let create;

        //不合格品次数量
        let unQualifiedCount=0;
        //退货单总单记录
        let returnTotal;

        let nullCnt=0;
        for(let i=0;i<doc.checkDetail.length;i++){
            var detailInfo = doc.checkDetail[i];
            if(detailInfo.qualified_number==null && detailInfo.unqualified_number==null){
                nullCnt++;
            }
            if(detailInfo.qualified_number==null){
                detailInfo.qualified_number=0;
            }
            if(detailInfo.unqualified_number==null){
                detailInfo.unqualified_number=0;
            }
            if(detailInfo.check_num<(Number(detailInfo.qualified_number)+Number(detailInfo.unqualified_number))){
                return common.sendError(res, 'quality_02');

            }
        }
        if(nullCnt==doc.checkDetail.length){
            return common.sendError(res, 'quality_03');
        }else{
            //新增质检单
            if(!doc.supplier_id){
                doc.supplier_id=0;
            }
            const qualitycheck_code = await Sequence.genQualityCheckCID();
            create = await tb_qualitycheck.create({
                qualitycheck_code,
                purchaseorder_id: doc.purchaseorder_id,
                user_id:user.user_id,
                domain_id:user.domain_id,
                supplier_id: doc.supplier_id,
                biz_code: await genBizCode(CODE_NAME.PZJYD, user.domain_id, 6)
            });
        }

        for(let i=0;i<doc.checkDetail.length;i++){
            const detailInfo = doc.checkDetail[i];
            if(detailInfo.check_num<(Number(detailInfo.qualified_number)+Number(detailInfo.unqualified_number))){
                return common.sendError(res, 'quality_02');

            }
            if(detailInfo.qualified_number==null && detailInfo.unqualified_number==null){

            } else {
                if(detailInfo.qualified_number==null){
                    detailInfo.qualified_number=0;
                }
                if(detailInfo.unqualified_number==null){
                    detailInfo.unqualified_number=0;
                }

                //增加质检详情
                let createDetail = await tb_qualitycheckdetail.create({
                    qualitycheck_id: create.qualitycheck_id,
                    materiel_id: detailInfo.materiel_id,
                    purchasedetail_id: detailInfo.purchasedetail_id,
                    qualified_number: detailInfo.qualified_number,
                    unqualified_number: detailInfo.unqualified_number,
                    remark: detailInfo.remark,
                    order_id: detailInfo.order_ids
                });

                //更新收货单明细中物料的合格数量
                await tb_receiptitem.increment(
                    ['qualified_number'],
                    {
                        by: Number(detailInfo.qualified_number),
                        where: {
                            receiptitem_id: detailInfo.receiptitem_id
                        }
                    }
                );

                if(detailInfo.unqualified_number>0){
                    //首次发现不合格品，生成一条退货单
                    if(unQualifiedCount==0){
                        returnTotal = await tb_return.create({
                            qualitycheck_id: create.qualitycheck_id,
                            purchaseorder_id:doc.purchaseorder_id,
                            domain_id:user.domain_id
                        });

                        //生成一条退货任务
                        if (taskallotuser) {
                            let taskName = '退货任务';
                            let taskDescription = returnTotal.return_id + '  退货任务';
                            let groupId = common.getUUIDByTime(30);
                            // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
                            let taskResult = await task.createTask(user,taskName,16,taskallotuser.user_id,returnTotal.return_id,taskDescription,'',groupId);
                            if(!taskResult){
                                return common.sendError(res, 'task_01');
                            }else{
                                if(returnTotal){
                                    returnTotal.return_state=1;
                                    await returnTotal.save()
                                }
                                // common.sendData(res, {})
                            }
                        }else {
                            return common.sendError(res, 'returntask_01');
                        }
                    }
                    unQualifiedCount++;
                    //存在不合格品，生成退货单详情
                    let returnDetail = await tb_returndetail.create({
                        return_id: returnTotal.return_id,
                        materiel_id:detailInfo.materiel_id,
                        return_number:detailInfo.unqualified_number,
                        return_remark:detailInfo.remark
                    });
                }
            }

            //更新tbl_erc_receipt表品质检验状态
            let replacements=[];
            let queryStr = 'select count(1) count from tbl_erc_receiptitem ri ' +
                'where ri.qualified_number != ri.receipt_item_number and ri.receipt_id=?';
            replacements.push(doc.receipt_id);

            let queryRst = await sequelize.query(queryStr, {
                replacements: replacements,
                type: sequelize.QueryTypes.SELECT,
                state: GLBConfig.ENABLE
            });

            //品质检验状态，0待审核，1部分检验，2全部检验
            let check_state;
            if(queryRst[0].count==0){
                check_state=2;
            }else{
                check_state=1;
            }
            await tb_receipt.update({
                check_state: check_state
            }, {
                where: {
                    receipt_id:doc.receipt_id
                }
            });
        }
        common.sendData(res, create);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//品质退货单数据的更改
async function modifyReturnState(applyState,description,returnId,applyApprover){

    await tb_return.update({
        return_state:applyState,
        return_check_date:new Date(),
        return_checker_id:applyApprover,
        return_refuse_remark:description
    }, {
        where: {
            return_id:returnId
        }
    });
}
exports.modifyReturnState = modifyReturnState;

