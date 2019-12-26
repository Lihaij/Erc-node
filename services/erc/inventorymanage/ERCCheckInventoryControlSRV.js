
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCCheckInventoryControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const config = require('../../../config');
const fs = require('fs');
const path = require('path');
const iconvLite = require('iconv-lite');
const moment = require('moment');

const sequelize = model.sequelize;
const tb_warehouse = model.erc_warehouse;
const tb_domain = model.common_domain;
const tb_warehousezone = model.erc_warehousezone;
const tb_checkinventory = model.erc_checkinventory;
const tb_checkitem = model.erc_checkitem;
const tb_materiel = model.erc_materiel;

exports.ERCCheckInventoryControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'search_d') {
        searchDetailAct(req, res);
    } else if (method === 'getWarehouseZone') {
        getWarehouseZoneAct(req, res);
    } else if (method === 'add') {
        addAct(req, res);
    } else if (method === 'import_check_inventory') {
        importCheckInventoryAct(req, res);
    } else if (method === 'export_check_inventory') {
        exportCheckInventoryAct(req, res);
    } else if (method === 'upload') {
        upload(req, res)
    } else if (method === 'check_review') {
        checkReviewAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};
//初始化数据
let initAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let returnData = {
            warehousesInfo: [], //仓库列表
            stateInfo: GLBConfig.INVENTORYCHECKSTATE,
            unitInfo: await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'),//单位
            materielStateManagement: GLBConfig.MATERIELSTATEMANAGEMENT,
        };

        let warehouses = await tb_warehouse.findAll({
            where: {
                domain_id: user.domain_id,
                state: GLBConfig.ENABLE,
                warehouse_state: GLBConfig.ENABLE
            }
        });
        for (let w of warehouses) {
            returnData.warehousesInfo.push({
                id: (w.warehouse_id).toString(),
                value: (w.warehouse_id).toString(),
                text: w.warehouse_name
            });
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//创建盘点
let addAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};
        let find = await tb_checkinventory.findOne({
            where: {
                domain_id: user.domain_id,
                warehouse_id: doc.warehouse_id,
                warehouse_zone_id: doc.warehouse_zone_id,
                checkInventory_state: '1'
            }
        });
        if (find) {
            return common.sendError(res, 'check_inventory_01');
        }
        let CIID = await Sequence.genCheckInventoryID(user.domain_id);
        let check = await tb_checkinventory.create({
            checkinventory_id: CIID,
            domain_id: user.domain_id,
            warehouse_id: doc.warehouse_id,
            warehouse_zone_id: doc.warehouse_zone_id,
            check_plan_date: doc.check_plan_date,
            check_checker: doc.check_checker,
            checkInventory_state: 1
        });

        let queryStr = `select sm.materiel_id,sum(sm.current_amount) as invertory from tbl_erc_stockmap sm
         left join tbl_erc_checkinventory ci on sm.domain_id = ci.domain_id
         where sm.warehouse_id = ? and sm.warehouse_zone_id = ? and ci.checkinventory_id = ?
         GROUP BY sm.materiel_id`;

        let replacements = [check.warehouse_id,check.warehouse_zone_id,check.checkinventory_id];
        let result = await common.simpleSelect(sequelize, queryStr, replacements);
        for(let item of result){
            await tb_checkitem.create({
                checkinventory_id: check.checkinventory_id,
                materiel_id: item.materiel_id,
                check_stock_amount: item.invertory
            })
        }
        //safe material
        let queryStr1 = `select * from tbl_erc_stockmap sm where sm.warehouse_id = ? and sm.warehouse_zone_id = ?`;
        let replacements1 = [doc.warehouse_id, doc.warehouse_zone_id];
        let result1 = await common.simpleSelect(sequelize, queryStr1, replacements1);
        for(let item of result1){
            await tb_checkitem.create({
                checkinventory_id: check.checkinventory_id,
                materiel_id: item.materiel_id,
                check_stock_amount: item.current_amount
            })
        }
        common.sendData(res, check);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//盘点列表
let searchAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};
        let queryStr = `select ci.*,w.warehouse_name from tbl_erc_checkinventory ci
         left join tbl_erc_warehouse w on (ci.warehouse_id = w.warehouse_id and w.state = 1) 
         where ci.state = 1 and ci.domain_id = ?`;
        let replacements = [user.domain_id];
        if (doc.checkinventory_id) {
            queryStr += ` and ci.checkinventory_id = ? `;
            replacements.push(doc.checkinventory_id);
        }
        if (doc.created_at_start) {
            queryStr += ` and ci.created_at >= ? `;
            replacements.push(doc.created_at_start + ` 00:00:00`);
        }
        if (doc.created_at_end) {
            queryStr += ` and ci.created_at <= ? `;
            replacements.push(doc.created_at_end + ` 23:59:59`);
        }
        if (doc.checkInventory_state) {
            queryStr += ` and ci.checkInventory_state = ? `;
            replacements.push(doc.checkInventory_state);
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];

        for (let r of result.data) {
            let rj = JSON.parse(JSON.stringify(r));
            rj.check_plan_date = r.check_plan_date ? moment(r.check_plan_date).format("YYYY-MM-DD"): null;
            rj.check_actual_date = r.check_actual_date ? moment(r.check_actual_date).format("YYYY-MM-DD HH:mm"): null;
            rj.check_review_date = r.check_review_date ? moment(r.check_review_date).format("YYYY-MM-DD HH:mm"): null;
            returnData.rows.push(rj);
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//字符串格式化
function iGetInnerText(testStr) {
    var resultStr;
    resultStr = testStr.replace(/\ +/g, ""); //去掉空格
    resultStr = testStr.replace(/[ ]/g, "");    //去掉空格
    resultStr = testStr.replace(/[\r\n]/g, ""); //去掉回车换行
    return resultStr;
}
//导入盘点数据
let importCheckInventoryAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), user = req.user;
        let dataRow, warehouseName, warehouseZoneName, materialName, materialCode,
            materilalFormat, materialUnit, actualAmount;
        let inventoryArray = await common.csvtojsonByUrl(doc.uploadurl);

        for (let i = 1; i < inventoryArray.length; i++) {
            dataRow = inventoryArray[i].split(',');

            if (dataRow[0] && dataRow[1] && dataRow[2] &&
                dataRow[3] && dataRow[4] && dataRow[5] && dataRow[6]) {

                warehouseName = iGetInnerText(dataRow[0]);
                warehouseZoneName = iGetInnerText(dataRow[1]);
                materialCode = iGetInnerText(dataRow[2]);
                materialName = iGetInnerText(dataRow[3]);
                materilalFormat = iGetInnerText(dataRow[4]);
                materialUnit = iGetInnerText(dataRow[5]);
                actualAmount = iGetInnerText(dataRow[6]);

                let materiel = await tb_materiel.findOne({
                    where: {
                        materiel_code: materialCode
                    }
                });
                if (materiel) {
                    let checkItem = await tb_checkitem.findOne({
                        where: {
                            checkinventory_id: doc.checkinventory_id,
                            materiel_id: materiel.materiel_id
                        }
                    });
                    if (checkItem) {
                        checkItem.check_actual_amount = actualAmount;
                        let profit = parseInt(checkItem.check_actual_amount) - parseInt(checkItem.check_stock_amount);
                        checkItem.check_profit = profit > 0 ? '+'+profit : profit
                        await checkItem.save();
                    }
                }
            }
        }
        let checkInventory = await tb_checkinventory.findOne({
            where: {
                checkinventory_id: doc.checkinventory_id
            }
        });
        if (checkInventory) {
            checkInventory.checkInventory_state = 2;
            checkInventory.check_checker = user.name;
            checkInventory.check_actual_date = new Date();
            await checkInventory.save();
        }
        common.sendData(res, checkInventory);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
};
//导出盘点数据
let exportCheckInventoryAct = async(req, res) => {
    try {
        let str = '仓库名称,仓区名称,物料编码,物料名称,规格型号,单位,盘点数量';

        let filename = 'inventory_' + common.getUUIDByTime(32) + '.csv';
        let tempfile = path.join(__dirname, '../../../' + config.uploadOptions.uploadDir + '/' + filename);
        let csvBuffer = iconvLite.encode(str, 'gb2312');
        fs.writeFile(tempfile, csvBuffer, function(err) {
            if (err) throw err;
            common.sendData(res, config.tmpUrlBase + filename);
        });
    } catch (error) {
        common.sendFault(res, error);
    }
};
//上传盘点
let upload = async(req, res) => {
    try {
        let uploadurl = await common.fileSave(req);
        common.sendData(res, {
            uploadurl: uploadurl
        })
    } catch (error) {
        common.sendFault(res, error);
        return
    }
};
//盘点详情
let searchDetailAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        let queryStr = `select * from tbl_erc_checkitem ci 
        left join tbl_erc_materiel m on ci.materiel_id = m.materiel_id 
        where ci.checkinventory_id = ? `;

        let replacements = [doc.checkinventory_id];

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//获取仓区
let getWarehouseZoneAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), returnData = {};
        let zones = await tb_warehousezone.findAll({
            where: {
                warehouse_id: doc.warehouse_id,
                state: GLBConfig.ENABLE
            }
        });
        let zoneInfo = [];
        for (let z of zones) {
            zoneInfo.push({
                id: (z.warehouse_zone_id).toString(),
                value: (z.warehouse_zone_id).toString(),
                text: z.zone_name
            });
        }
        common.sendData(res, zoneInfo);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//盘点审核
let checkReviewAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let checkItems = await tb_checkitem.findAll({
            where: {
                checkinventory_id: doc.checkinventory_id
            }
        });
        for(let item of checkItems){
            item.check_stock_amount = item.check_actual_amount;
            await item.save();
        }

        let checkInventory = await tb_checkinventory.findOne({
            where: {
                domain_id: user.domain_id,
                checkinventory_id: doc.checkinventory_id
            }
        });

        if (checkInventory){
            checkInventory.checkInventory_state = '3';
            checkInventory.check_review_date = new Date();
            checkInventory.check_reviewer = user.name;
            await checkInventory.save()
        }
        common.sendData(res, checkInventory);
    } catch (error) {
        common.sendFault(res, error)
    }
};
