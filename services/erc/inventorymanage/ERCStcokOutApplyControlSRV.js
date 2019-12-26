const fs = require('fs');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCStcokOutApplyControlSRV');
const Sequence = require('../../../util/Sequence');
const { CODE_NAME, genBizCode } = require('../../../util/BizCodeUtil');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const model = require('../../../model');
const moment = require('moment');
const task = require('../baseconfig/ERCTaskListControlSRV');
const {
    recordInventoryTotal,
    getCorrespondingUnit
} = require('../service/ERCInventoryService');

const sequelize = model.sequelize;
const tb_user = model.common_user;
const tb_stockoutapply = model.erc_stockoutapply;
const tb_stockoutapplydetail = model.erc_stockoutapplydetail;
const tb_stockitem = model.erc_stockitem;//安全库存明细
const tb_stockmap = model.erc_stockmap;
const tb_materiel = model.erc_materiel;
const tb_warehouse = model.erc_warehouse;
const tb_warehousezone = model.erc_warehousezone;
const tb_stockotherapplyout = model.erc_stockotherapplyout;
const tb_inventoryaccount = model.erc_inventoryaccount;
const tb_inventoryorder = model.erc_inventoryorder;
const tb_otherstockout = model.erc_otherstockout;
const tb_financerecorditem = model.erc_financerecorditem;
const tb_custorgstructure = model.erc_custorgstructure;
const tb_department = model.erc_department;

exports.ERCStcokOutApplyControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'initApply') {
        initApply(req, res)
    } else if (method === 'initOtherApply') {
        initOtherApply(req, res)
    } else if (method === 'getStockOutApply') {
        getStockOutApply(req, res)
    } else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'searchTable') {
        searchTable(req, res)
    } else if (method === 'search_mtable') {
        search_mTable(req, res)
    } else if (method === 'add') {
        addAct(req, res);
    } else if (method === 'add_apply_order') {
        addApplyOrder(req, res)
    } else if (method === 'modify') {
        modify_mTable(req, res);
    } else if (method === 'delete') {
        delete_mTable(req, res)
    } else if (method === 'setTask') {
        setTask(req, res)
    } else if (method === 'searchOutMateriel') {
        searchOutMateriel(req, res)
    } else if (method === 'modifyWaitApply') {
        modifyWaitApply(req, res);
    } else if (method === 'getWarehouseZone') {
        getWarehouseZone(req, res);
    } else if (method === 'getOtherStockOut') {
        getOtherStockOut(req, res);
    } else if (method === 'searchOtherApplyOtherOut') {
        searchOtherApplyOtherOut(req, res)
    } else if (method === 'initOtherApplyOtherOut') {
        initOtherApplyOtherOut(req, res)
    } else if (method === 'modifyOtherApplyOtherOut') {
        modifyOtherApplyOtherOut(req, res);
    } else if (method === 'stockOtherOut') {
        stockOtherOut(req, res);
    } else if (method === 'assignUserForInvoice') {
        assignUserForInvoice(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};
//初始化数据
async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body), user = req.user;
        let returnData = {
            stockoutapplyState: GLBConfig.STOCKOUTAPPLYSTATE,//申请单状态
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

        common.sendData(res, returnData);
    } catch (error) {
        common.sendError(res, error)
    }
}
//初始化申请数据
async function initApply(req, res) {
    try {

        let doc = common.docTrim(req.body), user = req.user;
        let returnData = {
            stockModelInfo: GLBConfig.MATERIELMANAGE, //库存管理模式
            stockoutapplyState: GLBConfig.STOCKOUTAPPLYSTATE,//申请单状态
            unitInfo: await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'),//单位
            materielStateManagement: GLBConfig.MATERIELSTATEMANAGEMENT
        };
        returnData.staffInfo = await tb_user.findAll({
            where: {
                user_type: '01',
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id
            },
            attributes: [['user_id', 'id'], ['name', 'text']]
        });

        common.sendData(res, returnData);
    } catch (error) {
        common.sendError(res, error)
    }
}
//出库申请列表
async function getStockOutApply(req, res) {
    try {
        let doc = common.docTrim(req.body), user = req.user, replacements = [], returnData = [];
        let queryStr=`select a.*,
             ap.name as apply_applicant,av.name as apply_approver
             from tbl_erc_stockoutapply a
             left join tbl_common_user ap on (a.user_id=ap.user_id and ap.state=1)
             left join tbl_common_user av on (a.performer_user_id=av.user_id and av.state=1)
             where a.state=1 `;
        if (doc.stockoutapply_id) {
            queryStr += ' and a.stockoutapply_id=?';
            replacements.push(doc.stockoutapply_id)
        }
        let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        for (let r of result) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at.Format("yyyy-MM-dd");
            returnData.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
    common.sendError(res, error)
    }
}
//获取出库申请列表
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {},
            replacements = [];
        let queryStr = 'select * from tbl_erc_stockoutapply where state = 1 and domain_id'+ await FDomain.getDomainListStr(req);
        if (doc.search_text) {
            queryStr += ' and stockoutapply_id like ?';
            replacements.push('%' + doc.search_text + '%');
        }

        queryStr+=' order by created_at desc'
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
}

//增加出库物料库存
let searchTable = async (req, res) => {
    try {
        const { body, user } = req;
        const { matNameOrCodeOrFormat } = body;
        const { domain_id } = user;
        const returnData = {};

        let queryStr =
            `select
                s.materiel_id
                , mat.materiel_code, mat.materiel_name, mat.materiel_format, mat.materiel_unit, mat.materiel_manage, mat.materiel_state_management
                from tbl_erc_stockmap s
                left join tbl_erc_materiel mat
                on (s.materiel_id = mat.materiel_id and mat.domain_id=?)
                where mat.state = 1 and s.domain_id = ?`;

        const replacements = [ domain_id,domain_id ];

        if (matNameOrCodeOrFormat) {
            queryStr += ' and (mat.materiel_code like ? or mat.materiel_name like ?)';
            replacements.push('%' + matNameOrCodeOrFormat + '%');
            replacements.push('%' + matNameOrCodeOrFormat + '%');
        }
        queryStr += ' group by s.materiel_id';

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//获取物料列表
let search_mTable = async (req, res) => {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};
        let queryStr = `select ino.*,m.materiel_id,m.materiel_code, m.materiel_name,m.materiel_format,m.materiel_unit,m.materiel_manage,m.materiel_state_management 
                from tbl_erc_stockoutapplydetail ino
                left join tbl_erc_materiel m on (ino.materiel_id = m.materiel_id and m.state = 1)
                where ino.state = 1`
        let replacements = [];

        if (doc.stockoutapply_id) {
            queryStr += ' and ino.stockoutapply_id=?';
            replacements.push(doc.stockoutapply_id)
        }

        if (doc.search_text) {
            queryStr += ' and (m.materiel_code like ? or m.materiel_name like ?)';
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//创建出库申请
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let addOM = await tb_stockoutapply.create({
            stockoutapply_id: await Sequence.genStockOutApplyId(user.domain),
            domain_id: user.domain_id,
            user_id: user.user_id,
            stockoutapply_state: '0'
        });
        let retData = JSON.parse(JSON.stringify(addOM));
        common.sendData(res, retData);

    } catch (error) {
        common.sendFault(res, error);
    }
};
//创建出库申请
async function addApplyOrder(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let addorder = await tb_stockoutapplydetail.findOne({
            where: {
                //stockmap_id: doc.stockmap_id,
                materiel_id: doc.materiel_id,
                //warehouse_id: doc.warehouse_id,
                stockoutapply_id: doc.stockoutapply_id,
                state: GLBConfig.ENABLE
            }
        });
        if(addorder){
            common.sendError(res, 'invalidateApplyorder_02');
            return
        }

        let addOM = await tb_stockoutapplydetail.create({
            stockoutapply_id: doc.stockoutapply_id,
            materiel_id: doc.materiel_id,
            stockoutapplydetail_amount: 0,
            stockoutapplydetail_type: doc.materiel_manage
        });
        let retData = JSON.parse(JSON.stringify(addOM));
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

//修改物料
let modify_mTable = async (req, res) => {
    try {

        let doc = common.docTrim(req.body),
            user = req.user;

        let modifyLand = await tb_stockoutapplydetail.findOne({
            where: {
                stockoutapplydetail_id: doc.old.stockoutapplydetail_id
            }
        });

        if (modifyLand) {
            modifyLand.stockoutapplydetail_amount=doc.new.stockoutapplydetail_amount;
            modifyLand.stockoutapplydetail_remark=doc.new.stockoutapplydetail_remark;
            await modifyLand.save()
        } else {
            common.sendError(res, 'landagent_01');
            return
        }

        common.sendData(res, modifyLand);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
//删除物料
let delete_mTable = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let delTemp = await tb_stockoutapplydetail.findOne({
            where: {
                stockoutapplydetail_id: doc.stockoutapplydetail_id,
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
//处理申请任务
async function setTask(req,res){  //报废单号提交
    try{// user, taskName, taskType  4, taskPerformer, taskReviewCode, taskDescription
        let user=req.user;
        let doc = req.body;
        // 申请状态 1待提交，2待审批，3未通过,4已报废
        let purchaseapply = await tb_stockoutapply.findOne({
            where:{
                state:GLBConfig.ENABLE,
                stockoutapply_id:doc.stockoutapply_id
            }
        });
        let applyorder = await tb_stockoutapplydetail.findOne({
            where:{
                state:GLBConfig.ENABLE,
                stockoutapply_id:doc.stockoutapply_id,
                stockoutapplydetail_amount: 0
            }
        });
        if(applyorder){
            return common.sendError(res, 'stockoutapplydetail_03');
        }


        let taskName = '出库申请';
        let taskDescription = doc.stockoutapply_id + '  出库申请';
        let groupId = common.getUUIDByTime(30);
        // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
        let taskResult = await task.createTask(user,taskName,11,'',doc.stockoutapply_id,taskDescription,'',groupId);
        if(!taskResult){
            return common.sendError(res, 'task_02');
        }else{
            if(purchaseapply){
                purchaseapply.stockoutapply_state= '1';
                await purchaseapply.save()
            }
            common.sendData(res, purchaseapply)
        }
    }catch (error){
        common.sendFault(res, error);
    }
}

//物料列表
async function searchOutMateriel(req, res) {
    try {
        const { body, user } = req;
        let returnData = {};

        let queryStr =
            `select
                sa.stockoutapplydetail_id, sa.stockoutapply_id, sa.stockoutapplydetail_amount, sa.already_amount, sa.stockoutapplydetail_type
                , mat.materiel_id, mat.materiel_code, mat.materiel_name, mat.materiel_format, mat.materiel_unit, mat.materiel_state_management
                from tbl_erc_stockoutapplydetail sa
                left join tbl_erc_materiel mat
                on sa.materiel_id = mat.materiel_id
                where true`;

        const replacements = [];

        if (body.stockoutapply_id) {
            queryStr += ' and sa.stockoutapply_id = ?';
            replacements.push(body.stockoutapply_id)
        }

        if (body.search_text) {
            queryStr += ' and (mat.materiel_code like ? or mat.materiel_name like ?)';
            replacements.push(`%${body.search_text}%`);
            replacements.push(`%${body.search_text}%`);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//修改申请
let modifyWaitApply = async (req, res) => {
    try {

        let doc = common.docTrim(req.body),
            user = req.user;

        let modifyLand = await tb_stockoutapplydetail.findOne({
            where: {
                stockoutapplydetail_id: doc.old.stockoutapplydetail_id
            }
        });

        if (modifyLand) {
            modifyLand.waitoutapply_amount=doc.new.waitoutapply_amount
            await modifyLand.save()
        } else {
            common.sendError(res, 'landagent_01');
            return
        }

        common.sendData(res, modifyLand);

    } catch (error) {
        return common.sendFault(res, error);
    }
};

//初始化订单申请
async function initOtherApply(req, res) {
    try {

        let doc = common.docTrim(req.body),
            user = req.user;
        let returnData = {
            stockModelInfo: GLBConfig.MATERIELMANAGE, //库存管理模式
            stockoutapplyState: GLBConfig.STOCKOUTAPPLYSTATE,//申请单状态
            unitInfo: await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'),//单位
            materielStateManagement: GLBConfig.MATERIELSTATEMANAGEMENT,
            staffInfo: [],//团队人员
        };
        returnData.warehouseId = [];

        let warehouseI = await tb_warehouse.findAll({
            where: {
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id
            }
        });

        for (let land of warehouseI) {
            let elem = {};
            elem.id = land.warehouse_id;
            elem.value = land.warehouse_id;
            elem.text = land.warehouse_name;
            returnData.warehouseId.push(elem)
        }

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

//获取仓区
async function getWarehouseZone(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let replacements = [];
        let queryStr = 'select * from tbl_erc_warehousezone where state=1 and warehouse_id=?';
        replacements.push(doc.warehouse_id);
        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        let returnData = [];
        for (let i = 0; i < queryRst.length; i++) {
            let elem = {};
            elem.id = queryRst[i].warehouse_zone_id;
            elem.value = queryRst[i].warehouse_zone_id;
            elem.text = queryRst[i].zone_name;
            returnData.push(elem)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }

}

//获取其他出库
async function getOtherStockOut(req, res) {
    try {
        const { body, user } = req;

        const result = await tb_stockotherapplyout.create({
            stockoutapplydetail_id: body.stockoutapplydetail_id,
            stockoutapply_id: body.stockoutapply_id,
            materiel_id: body.materiel_id,
            warehouse_id: body.warehouse_id,
            warehouse_zone_id: body.warehouse_zone_id,
            stockotherapplyout_amount: body.stockoutapplydetail_amount,
            stockotherapplyout_type: body.stockoutapplydetail_type,
        });
        common.sendData(res, result);

        /*let stockOtherApplyOut = await tb_stockotherapplyout.findOne({
            where: {
                stockoutapplydetail_id: doc.stockoutapplydetail_id,
                stockoutapply_id: doc.stockoutapply_id,
                materiel_id: doc.materiel_id,
                warehouse_id: doc.warehouse_id,
                warehouse_zone_id: doc.warehouse_zone_id
            }
        });

        if (!stockOtherApplyOut) {
            stockOtherApplyOut = await tb_stockotherapplyout.create({
                stockoutapplydetail_id: doc.stockoutapplydetail_id,
                stockoutapply_id: doc.stockoutapply_id,
                materiel_id: doc.materiel_id,
                warehouse_id: doc.warehouse_id,
                warehouse_zone_id: doc.warehouse_zone_id,
                stockotherapplyout_amount: doc.stockoutapplydetail_amount,
                stockotherapplyout_type: doc.stockoutapplydetail_type,
            });
        }

        common.sendData(res, stockOtherApplyOut);*/
    } catch (error) {
        common.sendFault(res, error);
    }
};
//初始化其他出库数据
async function initOtherApplyOtherOut(req, res) {
    try {

        let doc = common.docTrim(req.body),
            user = req.user;
        const returnData = {};
        returnData.stockModelInfo = GLBConfig.MATERIELMANAGE; //库存管理模式
        returnData.unitInfo = await getBaseTypeInfo(user.domain_id, 'JLDW');//单位
        returnData.materielStateManagement = GLBConfig.MATERIELSTATEMANAGEMENT;
        returnData.correspondingInfo = await getCorrespondingUnit(user.domain_id);

        common.sendData(res, returnData);
    } catch (error) {
        common.sendError(res, error)
    }
}

//其他出库申请
async function searchOtherApplyOtherOut(req, res) {
    try {
        const { body, user } = req;
        const { warehouse_id, warehouse_zone_id, stockoutapply_id, materielIds, search_text } = body;
        let returnData = {};

        let queryStr =
            `select
                sa.stockoutapplydetail_id, sa.stockoutapply_id, sa.stockoutapplydetail_amount, sa.already_amount
                , sa.stockoutapplydetail_type, sa.stockoutapplydetail_remark
                , mat.materiel_id, mat.materiel_code, mat.materiel_name, mat.materiel_format, mat.materiel_unit, mat.materiel_state_management
                , stm.current_amount, (stm.price_amount / stm.current_amount) as store_price
                , 0 as stock_operate_amount
                from tbl_erc_stockoutapplydetail sa
                left join tbl_erc_materiel mat
                on sa.materiel_id = mat.materiel_id
                left join tbl_erc_stockmap stm
                on if (mat.materiel_manage = 1,
                stm.materiel_id = sa.materiel_id and stm.warehouse_id = ? and stm.warehouse_zone_id = ?,
                stm.materiel_id = sa.materiel_id and stm.order_id = sa.stockoutapplydetail_remark and stm.warehouse_id = ? and stm.warehouse_zone_id = ?)
                where true
                and sa.already_amount < sa.stockoutapplydetail_amount`;

        const replacements = [ warehouse_id, warehouse_zone_id, warehouse_id, warehouse_zone_id ];

        if (stockoutapply_id) {
            queryStr += ' and sa.stockoutapply_id = ?';
            replacements.push(stockoutapply_id)
        }

        if (materielIds) {
            queryStr += ` and mat.materiel_id in (${materielIds})`;
        }

        if (search_text) {
            queryStr += ' and (mat.materiel_code like ? or mat.materiel_name like ?)';
            replacements.push(`%${search_text}%`);
            replacements.push(`%${search_text}%`);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//修改其他出库
let modifyOtherApplyOtherOut = async (req, res) => {
    try {

        let doc = common.docTrim(req.body),
            user = req.user;
        if(doc.old.stockotherapplyout_type == '2'){
            let sale = await tb_stockmap.findOne({
                where:{
                    materiel_id:doc.old.materiel_id,
                    warehouse_id:doc.old.warehouse_id,
                    warehouse_zone_id: doc.old.warehouse_zone_id,
                    state: 1,
                    order_id: {
                        $eq: null
                    },
                    domain_id:user.domain_id
                }
            });
            if (doc.new.already_amount > doc.new.stockotherapplyout_amount) {
                return common.sendError(res, 'stockoutapplydetail_04');
            }
            if(doc.new.waitoutapply_amount > sale.current_amount){
                common.sendError(res, 'stockoutapplydetail_02');
                return
            }
        }else{
            let saleId = await tb_stockmap.findOne({
                where:{
                    materiel_id:doc.old.materiel_id,
                    domain_id:user.domain_id
                }
            });
            let safe = await tb_stockitem.findOne({
                where:{
                    stockmap_id:saleId.stockmap_id,
                    warehouse_zone_id:doc.old.warehouse_zone_id,
                    warehouse_id:doc.old.warehouse_id
                }
            });
            let stockitemAmount = safe ? Number(safe.item_amount):0
            if(doc.new.waitoutapply_amount>stockitemAmount){
                common.sendError(res, 'stockoutapplydetail_02');
                return
            }
        }
        let modifyLand = await tb_stockotherapplyout.findOne({
            where: {
                stockotherapplyout_id: doc.old.stockotherapplyout_id,
            }
        });
        if (modifyLand) {
            modifyLand.warehouse_zone_id=doc.new.warehouse_zone_id
            modifyLand.waitoutapply_amount=doc.new.waitoutapply_amount
            if(doc.new.warehouse_zone_id != doc.old.warehouse_zone_id){
                modifyLand.waitoutapply_amount = 0
            }
            await modifyLand.save()
        } else {
            common.sendError(res, 'landagent_01');
            return
        }
        common.sendData(res, modifyLand);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
//其他出库提交
const stockOtherOut = async(req, res) => {
    try {
        const { body, user } = req;
        const { stockoutapply_id, warehouse_id, warehouse_zone_id, materiels, company_name } = body;

        const returnData = await sequelize.transaction(async transaction => {
            const bill_code = await genBizCode(CODE_NAME.QTCK, user.domain_id, 6, transaction);

            if (materiels.length > 0) {
                for (const outputItem of materiels) {
                    const { materiel_id, stockoutapplydetail_id, stock_operate_amount, stockoutapplydetail_amount, stockoutapplydetail_remark } = outputItem;
                    const int_stock_operate_amount = parseInt(stock_operate_amount);
                    const materiel = await tb_materiel.findOne({
                        where: {
                            materiel_id,
                            state: GLBConfig.ENABLE
                        },
                        transaction
                    });

                    if (!materiel) {
                        throw new Error('未找到要入库物料');
                    }

                    const queryParams = {
                        materiel_id,
                        state: GLBConfig.ENABLE,
                        warehouse_id,
                        warehouse_zone_id,
                    };
                    if (parseInt(materiel.materiel_manage) === 2) { //销售订单管理
                        queryParams.storage_type = 2;
                        if (!stockoutapplydetail_remark) {
                            throw new Error('销售订单号管理的物料的备注缺少订单号');
                        }
                        queryParams.order_id = stockoutapplydetail_remark;
                    } else {
                        queryParams.storage_type = 1;
                    }

                    const stockMap = await tb_stockmap.findOne({
                        where: {
                            ...queryParams
                        },
                        transaction
                    });

                    if (!stockMap) {
                        throw new Error(`${materiel.materiel_code}缺少库存信息`);
                    }

                    stockMap.price_amount -= (stockMap.price_amount / stockMap.current_amount) * int_stock_operate_amount;
                    stockMap.current_amount -= int_stock_operate_amount;
                    if (stockMap.current_amount < 0) {
                        throw new Error('出库数量不能大于库存数量');
                    }
                    await stockMap.save({ transaction });

                    const stockOutApply = await tb_stockoutapply.findOne({
                        where: {
                            stockoutapply_id
                        },
                        transaction
                    });

                    if (!stockOutApply) {
                        throw new Error('缺少其他出库申请单号信息');
                    }

                    /*const custorgStructure = await tb_custorgstructure.findOne({
                        where: {
                            user_id: stockOutApply.user_id
                        }
                    });

                    if (!custorgStructure) {
                        throw new Error('缺少组织架构信息');
                    }

                    const department = await tb_department.findOne({
                        where: {
                            department_id: custorgStructure.department_id
                        }
                    });*/

                    await tb_financerecorditem.create({
                        domain_id: user.domain_id,
                        materiel_id,
                        wms_type: 2,
                        manage_type: 3,
                        organization: company_name,
                        // org_type: department.department_type,
                        store_amount: int_stock_operate_amount,
                        store_price: stockMap.store_price
                    }, { transaction });

                    //收发存明细
                    await tb_inventoryaccount.create({
                        domain_id: user.domain_id,
                        bill_code,
                        order_id: queryParams.order_id || stockoutapply_id,
                        p_order_id: stockoutapply_id,
                        warehouse_id,
                        warehouse_zone_id,
                        materiel_id,
                        inventory_price: stockMap.store_price,
                        account_operate_amount: int_stock_operate_amount,
                        account_operate_type: 4,
                        company_name
                    }, { transaction });

                    const relationOptions = {
                        domain_id: user.domain_id,
                        relation_id: stockoutapply_id,
                        total_count: stockoutapplydetail_amount,
                        actual_count: int_stock_operate_amount,
                        inventory_type: 4
                    };
                    await recordInventoryTotal(relationOptions, transaction);

                    const stockOutApplyDetail = await tb_stockoutapplydetail.findOne({
                        where: {
                            stockoutapplydetail_id
                        },
                        transaction
                    });

                    if (!stockOutApplyDetail) {
                        throw new Error('缺少其他出库申请明细');
                    }

                    stockOutApplyDetail.already_amount += int_stock_operate_amount;
                    await stockOutApplyDetail.save({ transaction });
                }

                const otherStockOut = await tb_otherstockout.findOne({
                    where: {
                        stockoutapply_id
                    }
                });

                if (!otherStockOut) {
                    throw new Error('找不到其它出库单信息');
                }

                const totalAmount = await tb_stockoutapplydetail.sum('stockoutapplydetail_amount', {
                    where: {
                        stockoutapply_id
                    },
                    transaction
                }) || 0;

                const alreadyAmount = await tb_stockoutapplydetail.sum('already_amount', {
                    where: {
                        stockoutapply_id
                    },
                    transaction
                }) || 0;

                if (otherStockOut) {
                    otherStockOut.otherstockout_state = alreadyAmount < totalAmount ? 2 : 3;
                    await otherStockOut.save({ transaction });
                }

                return await tb_inventoryorder.create({
                    domain_id: user.domain_id,
                    bill_code,
                    bs_order_id: stockoutapply_id,
                    warehouse_id,
                    account_operate_type: 4
                }, { transaction });
            } else {
                throw new Error('请填写数量');
            }
        });

        common.sendData(res, returnData);
    } catch (error) {
        common.sendErcError(res, error);
    }
};

async function assignUserForInvoice(req, res) {
    const { body, user } = req;
    const { task_type, user_id, bill_code } = body;

    try {
        const groupId = common.getUUIDByTime(30);
        const taskName = GLBConfig.PRINT_INVOICE[task_type];
        const result = await task.createTask(user, taskName, task_type, user_id, bill_code, taskName, '', groupId);
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

