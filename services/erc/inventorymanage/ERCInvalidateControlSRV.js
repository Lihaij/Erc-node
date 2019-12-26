const fs = require('fs');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCSupplierMaterielControl');
const task = require('../baseconfig/ERCTaskListControlSRV');
const model = require('../../../model');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const moment = require('moment');
const { CODE_NAME, genBizCode } = require('../../../util/BizCodeUtil');

// tables
const sequelize = model.sequelize;
const tb_user = model.common_user;
const tb_domain = model.common_domain;
const tb_invalidateorder = model.erc_invalidateorder;
const tb_invalidateApplyorder = model.erc_invalidateApplyorder;
const tb_stockitem = model.erc_stockitem;//安全库存明细
const tb_warehouse = model.erc_warehouse;
const tb_stockmap = model.erc_stockmap;
const tb_warehousezone = model.erc_warehousezone;
const tb_materiel = model.erc_materiel;
const tb_netdemand = model.erc_netdemand;//净需求表

exports.ERCInvalidateControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'initApply') {
        initApply(req, res)
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'searchTable') {
        searchTable(req, res)
    } else if (method === 'search_mtable') {
        search_mTable(req, res)
    } else if (method === 'getInvalidateApply') {
        getInvalidateApply(req, res)
    } else if (method === 'add') {
        addMat(req, res)
    } else if (method === 'add_apply_order') {
        addApplyOrder(req, res)
    } else if (method === 'modify') {
        modify_mTable(req, res)
    } else if (method === 'delete') {
        delete_mTable(req, res)
    } else if (method === 'modifyInvalidateApplyOrder') {
        modifyInvalidateApplyOrder(req, res)
    } else if (method === 'setTask') {
        setTask(req, res)
    } else {
        common.sendError(res, 'common_01');
    }
};
//初始化数据
async function initAct(req, res) {
    try {
        const { user } = req;
        const { domain_id } = user;
        let returnData = {
            invalidateorderState: GLBConfig.INVALIDATEORDERSTATE,//报废单状态
            stockModelInfo: GLBConfig.MATERIELMANAGE,
            reasonInfo: GLBConfig.INVALIDATEORDERREASON, //报废原因
        };
        returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW');//单位
        returnData.materielStateManagement = GLBConfig.MATERIELSTATEMANAGEMENT;
        returnData.staffInfo = await tb_user.findAll({
            where: {
                user_type: '01',
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id
            },
            attributes: [['user_id', 'id'], ['name', 'text']]
        });

        returnData.wareHouseInfo = await tb_warehouse.findAll({
            where: {
                domain_id,
                warehouse_type: 5,
                state: GLBConfig.ENABLE
            }
        });

        common.sendData(res, returnData);
    } catch (error) {
        common.sendError(res, error)
    }
}
//报废品列表
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        let replacements = [];

        let queryStr = 'select * from tbl_erc_invalidateorder where state = 1 and domain_id'+ await FDomain.getDomainListStr(req);

        if (doc.search_text) {
            queryStr += ' and invalidateorder_id like ?';
            replacements.push('%' + doc.search_text + '%');
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        //returnData.rows = result.data;
        returnData.rows = [];
        for (let r of result.data) {
            let rj = JSON.parse(JSON.stringify(r));
            rj.created_at = r.created_at ? r.created_at.Format("yyyy-MM-dd") : null;
            rj.complete_date = r.complete_date ? r.complete_date.Format("yyyy-MM-dd") : null;
            returnData.rows.push(rj);
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

/**订单中的物料列表，信息由模板、订单、物料三者关联而来，关联关系由【生成物料单】操作建立
 * 用户也可在模板的物料单之外添加物料，所添加的物料应从系统已有的物料列表中选择
 **/
async function addMat(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let addOM = await tb_invalidateorder.create({
            invalidateorder_id: await Sequence.genInvalidateOrderID(user.domain),
            domain_id: user.domain_id,
            user_id: user.user_id,
            invalidateorder_state: '1'
        });
        let retData = JSON.parse(JSON.stringify(addOM));
        common.sendData(res, retData);

    } catch (error) {
        common.sendFault(res, error);
    }
};
//创建申请
async function initApply(req, res) {
    try {

        let doc = common.docTrim(req.body), user = req.user;
        let returnData = {
            invalidateorderState: GLBConfig.INVALIDATEORDERSTATE,//报废单状态
            stockModelInfo: GLBConfig.MATERIELMANAGE, //库存管理模式
            reasonInfo: GLBConfig.INVALIDATEORDERREASON, //报废原因
            unitInfo: await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'),//单位
            staffInfo: [],//团队人员
        };
        let staff = await tb_user.findAll({
            where: {
                user_type: '01',
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id
            }
        });
        for (let s of staff) {
            returnData.staffInfo.push({
                id: (s.user_id).toString(),
                value: (s.user_id).toString(),
                text: s.name
            });
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendError(res, error)
    }
}
//获取报废品申请列表
async function getInvalidateApply(req, res) {
    let doc = common.docTrim(req.body), user = req.user, replacements = [], returnData = [];
    //let queryStr=`select * from tbl_erc_invalidateorder where state=1 `;


    //let queryStr = `select a.*,b.name from tbl_erc_invalidateorder a left join tbl_common_user b on a.user_id = b.user_id where a.state=1 `;

    let queryStr=`select a.*,
         ap.name as apply_applicant,av.name as apply_approver
         from tbl_erc_invalidateorder a
         left join tbl_common_user ap on (a.user_id=ap.user_id and ap.state=1)
         left join tbl_common_user av on (a.performer_user_id=av.user_id and av.state=1)
         where a.state=1 `;

    if (doc.invalidateorder_id) {
        queryStr += ' and a.invalidateorder_id=?';
        replacements.push(doc.invalidateorder_id)
    }

    let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
    for (let r of result) {
        let result = JSON.parse(JSON.stringify(r));
        result.created_at = r.created_at.Format("yyyy-MM-dd");
        returnData.push(result)
    }
    common.sendData(res, returnData);

}

//增加报废物料库存
let searchTable = async (req, res) => {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};
        let queryStr = null;
        let replacements = [];
        if (doc.stock_model === 2) {
            queryStr = `select s.stockmap_id,s.warehouse_id,s.domain_id,s.warehouse_zone_id,s.safe_amount,s.min_purchase_amount,
        s.current_amount,s.trigger_safe_model,w.warehouse_name,wz.zone_name,m.materiel_id,
        m.materiel_code,m.materiel_name,m.materiel_format,m.materiel_unit,m.materiel_manage from tbl_erc_stockmap s
        left join tbl_erc_warehouse w on (s.warehouse_id = w.warehouse_id and w.state=1)
        left join tbl_erc_materiel m on (s.materiel_id = m.materiel_id and m.state = 1)
        left join tbl_erc_warehousezone wz on (s.warehouse_zone_id = wz.warehouse_zone_id and wz.state = 1)
        where s.state = 1 and s.current_amount>0 and m.materiel_manage = 2 and s.is_idle_stock = 1 and s.domain_id ` + await FDomain.getDomainListStr(req);
        }
        if (doc.stock_model === 1) {
            queryStr = `select s.stockmap_id,s.warehouse_id,s.warehouse_zone_id,s.domain_id,w.warehouse_name,wz.zone_name,m.materiel_id,m.materiel_code,m.materiel_name,m.materiel_format,m.materiel_unit,m.materiel_manage
	    from tbl_erc_stockmap s
        left join tbl_erc_materiel m on (s.materiel_id = m.materiel_id and m.state = 1)
        left join tbl_erc_warehouse w on (s.warehouse_id = w.warehouse_id and w.state=1)
        left join tbl_erc_warehousezone wz on (s.warehouse_zone_id = wz.warehouse_zone_id and wz.state = 1)
        where s.state = 1 and s.current_amount>0 and m.materiel_manage = 1 and s.domain_id`;
        }

        if (doc.matNameOrCodeOrFormat) {
            queryStr += ' and (m.materiel_code like ? or m.materiel_name like ? or w.warehouse_name like ? or wz.zone_name like ?)';
            replacements.push('%' + doc.matNameOrCodeOrFormat + '%');
            replacements.push('%' + doc.matNameOrCodeOrFormat + '%');
            replacements.push('%' + doc.matNameOrCodeOrFormat + '%');
            replacements.push('%' + doc.matNameOrCodeOrFormat + '%');
        }
        queryStr += ' order by s.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];

        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//创建报废申请列表
async function addApplyOrder(req, res) {
    try {
        const { body, user } = req;
        const { invalidateorder_id, invalidatemateriel_type, materielArray } = body;
        const { domain_id, user_id } = user;

        let invalidateOrder = null;

        await sequelize.transaction(async (transaction) => {
            try {
                if (invalidateorder_id) {
                    invalidateOrder = await tb_invalidateorder.findOne({
                        where: {
                            invalidateorder_id
                        }
                    });
                } else {
                    invalidateOrder = await tb_invalidateorder.create({
                        invalidateorder_id: await Sequence.genInvalidateOrderID(domain_id),
                        domain_id,
                        user_id,
                        invalidateorder_state: 1
                    }, {
                        validate: true,
                        transaction
                    });
                }

                if (invalidateOrder) {
                    for (const item of materielArray) {
                        const { stockmap_id, warehouse_id, warehouse_zone_id, materiel_id } = item;
                        const invalidateApplyOrder = await tb_invalidateApplyorder.findOne({
                            where: {
                                stockmap_id,
                                warehouse_id,
                                materiel_id,
                                invalidateorder_id: invalidateOrder.invalidateorder_id,
                                state: GLBConfig.ENABLE
                            }
                        });

                        if (!invalidateApplyOrder) {
                            await tb_invalidateApplyorder.create({
                                invalidateorder_id: invalidateOrder.invalidateorder_id,
                                stockmap_id,
                                warehouse_id,
                                warehouse_zone_id,
                                materiel_id,
                                invalidatemateriel_type,
                                invalidateapplyorder_amount: 0
                            }, {
                                validate: true,
                                transaction
                            });
                        } else {
                            common.sendError(res, '', '已存在报废物料');
                        }
                    }
                }
            } catch (error) {
                throw error;
            }
        });

        common.sendData(res, invalidateOrder);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//物料列表
let search_mTable = async (req, res) => {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};
        let queryStr =
            `select
                ino.*, w.warehouse_name as scrap_warehouse_name, wz.zone_name as scrap_zone_name
                ,m.materiel_id,m.materiel_code, m.materiel_name,m.materiel_format,m.materiel_unit,m.materiel_manage
                from tbl_erc_invalidateapplyorder ino
                left join tbl_erc_materiel m
                on (ino.materiel_id = m.materiel_id and m.state = 1)
                left join tbl_erc_warehouse w
                on (ino.scrap_warehouse_id = w.warehouse_id and w.state=1)
                left join tbl_erc_warehousezone wz
                on (ino.scrap_warehouse_zone_id = wz.warehouse_zone_id and wz.state = 1) where ino.state = 1`;

        let replacements = [];

        if (doc.invalidateorder_id) {
            queryStr += ' and ino.invalidateorder_id=?';
            replacements.push(doc.invalidateorder_id)
        } else {
            return common.sendData(res, {total: 0, rows: []});
        }

        if (doc.search_text) {
            queryStr += ' and (m.materiel_code like ? or m.materiel_name like ? or w.warehouse_name like ? or wz.zone_name like ?)';
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for(let r of result.data){
            let resultTemp = JSON.parse(JSON.stringify(r));
            resultTemp.invalidateapplyorder_amount = r.invalidateapplyorder_amount?r.invalidateapplyorder_amount:0;
            returnData.rows.push(resultTemp)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//修改物料信息
let modify_mTable = async (req, res) => {
    try {

        let doc = common.docTrim(req.body),
            user = req.user;

        if(doc.old.invalidatemateriel_type == 1){
            let safe = await tb_stockitem.findOne({
                where:{
                    stockmap_id:doc.old.stockmap_id,
                    warehouse_zone_id:doc.old.warehouse_zone_id,
                    warehouse_id:doc.old.warehouse_id
                }
            });
            if(parseInt(doc.new.invalidateapplyorder_amount) > safe.item_amount){
                common.sendError(res, 'invalidateApplyorder_01');
                return
            }
        }else{
            let sale = await tb_stockmap.findOne({
                where:{
                    stockmap_id:doc.old.stockmap_id,
                }
            });
            if(parseInt(doc.new.invalidateapplyorder_amount) > sale.current_amount){
                common.sendError(res, 'invalidateApplyorder_01');
                return
            }
        }

        let modifyLand = await tb_invalidateApplyorder.findOne({
            where: {
                invalidateapplyorder_id: doc.old.invalidateapplyorder_id
            }
        });

        if (modifyLand) {
            modifyLand.invalidateapplyorder_amount=doc.new.invalidateapplyorder_amount,
            modifyLand.invalidateorder_reason=doc.new.invalidateorder_reason
            await modifyLand.save()
        } //else {
        //     common.sendError(res, 'landagent_01');
        //     return
        // }

        common.sendData(res, modifyLand);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
//报废任务
async function setTask(req,res){  //报废单号提交
    try{// user, taskName, taskType  4, taskPerformer, taskReviewCode, taskDescription
        const { body, user } = req;
        // 申请状态 1待提交，2待审批，3未通过,4已报废

        const invalidateApplyOrderArray = await tb_invalidateApplyorder.findAll({
            where: {
                invalidateorder_id: body.invalidateorder_id
            },
            attributes: ['scrap_warehouse_id', 'invalidateapplyorder_amount']
        });

        const scrapWarehouseNotExist = invalidateApplyOrderArray.some(item => !item.scrap_warehouse_id);
        if (scrapWarehouseNotExist) {
            return common.sendError(res, '', '报废物料没有选择报废仓库');
        }

        const amountEqualZero = invalidateApplyOrderArray.some(item => item.invalidateapplyorder_amount < 1);
        if (amountEqualZero) {
            return common.sendError(res, '', '报废物料没有选择报废数量');
        }

        const purchaseapply = await tb_invalidateorder.findOne({
            where:{
                state:GLBConfig.ENABLE,
                invalidateorder_id: body.invalidateorder_id
            }
        });

        if(purchaseapply){
            purchaseapply.invalidateorder_state= '2';
            await purchaseapply.save()
        }

        let taskName = '报废申请';
        let taskDescription = body.invalidateorder_id + '  报废申请';
        let groupId = common.getUUIDByTime(30);
        // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
        let taskResult = await task.createTask(user,taskName,9,'', body.invalidateorder_id,taskDescription,'',groupId);
        if(!taskResult){
            return common.sendError(res, 'task_02');
        }

        common.sendData(res, purchaseapply);
    }catch (error){
        common.sendFault(res, error);
    }
};
//删除物料
let delete_mTable = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let delTemp = await tb_invalidateApplyorder.findOne({
            where: {
                invalidateapplyorder_id: doc.invalidateapplyorder_id,
                state: GLBConfig.ENABLE
            }
        });

        if (delTemp) {
            delTemp.state = GLBConfig.DISABLE;
            //delTemp.user_id = GLBConfig.DISABLE;
            await delTemp.save();

            return common.sendData(res);
        } else {
            return common.sendError(res, 'templateConstruction_01');

        }
    } catch (error) {
        return common.sendFault(res, error);
    }
};

async function modifyInvalidateApplyOrder(req, res) {
    const { body } = req;

    try {
        const { invalidateapplyorder_id, warehouse_id, warehouse_zone_id } = body;

        const invalidApplyOrder = await tb_invalidateApplyorder.findOne({
            where: {
                invalidateapplyorder_id
            }
        });

        if (invalidApplyOrder) {
            if (warehouse_id) {
                invalidApplyOrder.scrap_warehouse_id = warehouse_id;
            }
            if (warehouse_zone_id) {
                invalidApplyOrder.scrap_warehouse_zone_id = warehouse_zone_id;
            }
            await invalidApplyOrder.save();
        }

        return common.sendData(res, invalidApplyOrder);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

exports.applyInvalidate = async (user, state, task_review_code, task_remark) => {
    const queryStrApply = `select * from tbl_erc_invalidateapplyorder where state = 1 and invalidateorder_id = ?`;
    const replacements = [task_review_code];
    const resultApply = await common.simpleSelect(sequelize, queryStrApply, replacements);
    const { domain_id, user_id } = user;

    for (const resultItem of resultApply) {
        const {
            invalidatemateriel_type, materiel_id, stockmap_id, warehouse_id, warehouse_zone_id,
            scrap_warehouse_id, scrap_warehouse_zone_id, invalidateapplyorder_amount
        } = resultItem;

        if (invalidatemateriel_type === 1) { //安全库存管理
            const saleResult = await tb_stockmap.findOne({
                where: {
                    materiel_id,
                    domain_id
                }
            });

            const safeItem = await tb_stockitem.findOne({
                where: {
                    stockmap_id,
                    warehouse_id,
                    warehouse_zone_id
                }
            });

            if (safeItem) {
                safeItem.item_amount = safeItem.item_amount - invalidateapplyorder_amount;
                await safeItem.save()
            }

            if (saleResult) {
                saleResult.current_amount = saleResult.current_amount - invalidateapplyorder_amount;
                await saleResult.save()
            }
        } else { //销售订单管理
            const saleResult = await tb_stockmap.findOne({
                where: {
                    stockmap_id: resultItem.stockmap_id,
                }
            });

            if (saleResult) {
                saleResult.current_amount = saleResult.current_amount - resultItem.invalidateapplyorder_amount;
                await saleResult.save()
            }
        }

        //查询报废仓的当前物料
        const scrapSaleResult = await tb_stockmap.findOne({
            where: {
                materiel_id,
                warehouse_id: scrap_warehouse_id,
                warehouse_zone_id: scrap_warehouse_zone_id,
                domain_id
            }
        });

        if (scrapSaleResult) {
            //如果有报废物料则继续增加
            scrapSaleResult.current_amount += invalidateapplyorder_amount;
            await scrapSaleResult.save();
        } else {
            //如果没有报废物料则创建报废库存
            await tb_stockmap.create({
                materiel_id,
                warehouse_id: scrap_warehouse_id,
                warehouse_zone_id: scrap_warehouse_zone_id,
                current_amount: invalidateapplyorder_amount,
                domain_id
            });
        }
    }

    const invalidateOrder = await tb_invalidateorder.findOne({
        where: {
            invalidateorder_id: task_review_code,
            state: GLBConfig.ENABLE,
        }
    });

    if (invalidateOrder) {
        invalidateOrder.invalidateorder_state = state;
        invalidateOrder.performer_user_id = user_id;
        invalidateOrder.complete_date = new Date();
        invalidateOrder.rebut_reason = task_remark;
        invalidateOrder.biz_code = await genBizCode(CODE_NAME.BFDH, domain_id, 6);
        await invalidateOrder.save();
    }
};

exports.rejectInvalidate = async (user, state, task_review_code, task_remark) => {
    const invalidateOrder = await tb_invalidateorder.findOne({
        where: {
            invalidateorder_id: task_review_code,
            state: GLBConfig.ENABLE,
        }
    });

    if (invalidateOrder) {
        invalidateOrder.invalidateorder_state = state;
        invalidateOrder.performer_user_id = user.user_id;
        invalidateOrder.complete_date = new Date();
        invalidateOrder.rebut_reason = task_remark;
        await invalidateOrder.save();
    }
};
