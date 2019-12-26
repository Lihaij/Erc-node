const fs = require('fs');
const path = require('path');
const iconvLite = require('iconv-lite');

const config = require('../../../config');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCBaseDataControlSRV');
const model = require('../../../model');
const validator = require('validator');
const { CODE_NAME, genBizCode } = require('../../../util/BizCodeUtil');

const XLSX = require('xlsx-style');
const sequelize = model.sequelize;
const tb_materiel = model.erc_materiel;
const tb_warehouse = model.erc_warehouse;
const tb_warehousezone = model.erc_warehousezone;
const tb_stockmap = model.erc_stockmap;
const tb_amortize = model.erc_amortize;
const tb_fixedassetscheckdetail = model.erc_fixedassetscheckdetail;
const tb_fixedassetscheck = model.erc_fixedassetscheck;
const tb_consumables = model.erc_consumables;//低值易耗品列表
const tb_consumablesdetail = model.erc_consumablesdetail;//低值易耗品详情
const tb_department = model.erc_department;//部门
const tb_position = model.erc_position;//岗位
const tb_common_usergroup = model.common_usergroup;//角色
const tb_user = model.common_user;
const tb_customer = model.erc_customer;
const tb_user_contract = model.erc_customercontract;
const tb_custorgstructure = model.erc_corporateclients;
const tb_supplier = model.erc_supplier;
const tb_suppliermateriel = model.erc_suppliermateriel;
const tb_purchaseorder = model.erc_purchaseorder;
const tb_purchasedetail = model.erc_purchasedetail;
const tb_meetingroom = model.erc_meetingroom;
const tb_producepricetemplate = model.erc_producepricetemplate;
const tb_basetypedetail = model.erc_basetypedetail;
const tb_ordermateriel = model.erc_ordermateriel;
const tb_order = model.erc_order;
const tb_productdevice = model.erc_productdevice;
const tb_productionprocedure = model.erc_productionprocedure;
const tb_cg = model.erc_custorgstructure;
const tb_reimburserank = model.erc_reimburserank;
const tb_customerworkexperience = model.erc_customerworkexperience;
const tb_accountdetail = model.erc_accountingdetail;
const tb_productproceduredevice = model.erc_productproceduredevice;
const tb_erc_stockitem = model.erc_stockitem;


// 基础数据管理接口
exports.ERCBaseDataControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'upload') {
        await upload(req, res)
    } else if (method==='importData'){
        await importData(req,res)
    }else {
        common.sendError(res, 'common_01')
    }
};

//获得类型ID
function getId(ConfigArr,text){
    if(text){
        for(let u of ConfigArr){
            if(u.text == text){
                return u.id
            }
        }
    }else {
        return null
    }
}
//上传文件
async function upload(req, res) {
    try {
        let uploadurl = await common.fileSave(req);
        common.sendData(res, {uploadurl: uploadurl})
    } catch (error) {
        common.sendFault(res, error);
    }
}
//导入基础数据
async function importData(req, res){
    try {
        const { type } = req.body;
        switch (type) {
            case 5:
                await importDepartment(req, res);//部门基本资料
                break;

            case 7:
                await importPosition(req, res);//岗位基本资料
                break;

            case 11:
                await importEmployee(req, res);//员工基本信息
                break;
            case 12:
                await importEmployeeHandsOnbackground(req, res);//员工工作经验信息
                break;
            case 13:
                await importMateriel(req, res);//物料基本信息
                break;
            case 16:
                await importCorporate(req, res);//企业客户信息
                break;
            case 17:
                await importProductDevice(req, res);//生产设备
                break;
            case 18:
                await importProductNode(req, res);//生产工序
                break;
            case 19:
                await importSupplier(req, res);//供应商信息
                break;
            case 20:
                await importSupplierDetail(req, res);//供应商后续管理信息
                break;
            case 21:
                await importSupplierPurchaseOrder(req, res);//供应商采购订单信息
                break;
            case 23:
                await importFixed(req, res);//外购固定资产明细信息
                break;

            case 26:
                await importAmortize(req, res);//待摊资产明细信息
                break;

            case 31:
                await importConsumable(req,res);//低值易耗品明细信息
                break;
            case 35:
                await importMeetRoom(req,res);//会议室
                break;

            case 38:
                await importWearHouse(req, res);//仓库信息
                break;

            case 39:
                await importWearHouseZone(req, res);//仓区信息
                break;

            case 40:
                await importStockMap(req, res);//实时库存信息
                break;
            case 50:
                await importOrder(req, res);//销售订单信息
                break;
        }
        common.sendData(res, '');
    } catch (error) {
        common.sendFault(res, error);
    }
}

// 13 导入物料
async function importMateriel(req,res) {
    try {
        let user = req.user;
        let doc = common.docTrim(req.body);

        let worksheet = trimJson(await common.exceltojson(doc.uploadurl));
        let xlsxJson = XLSX.utils.sheet_to_json(worksheet);
        // const unitInfo = await getBaseType('JLDW', user.domain_id);
        //取出所有物料编码，查看是否有重复的编码
        let materielCodeArray = [];
        for(let i=2;i<=xlsxJson.length+1;i++){
            const materiel_code = worksheet['A'+i]?worksheet['A'+i].v:null;
            materielCodeArray.push(materiel_code);
        }
        const result = common.isRepeat(materielCodeArray);
        if (result.isRepeat) {
            return common.sendError(res, '',`上传表格中，存在2个或以上物料编码为"${result.repeatString}"的物料`);
        }

        const unitInfo = await global.getBaseTypeInfo(user.domain_id, 'JLDW');

        for(let i=2;i<=xlsxJson.length+1;i++){

            const materiel_code = worksheet['A'+i]?worksheet['A'+i].v:null;
            const materiel_unit = worksheet['D'+i]?worksheet['D'+i].v:null;
            const materiel_unit_bk = worksheet['E'+i]?worksheet['E'+i].v:null;
            const materiel_state_management = worksheet['F'+i]?worksheet['F'+i].v:null;
            const materiel_manage = worksheet['G'+i]?worksheet['G'+i].v:null;
            const materiel_source = worksheet['H'+i]?worksheet['H'+i].v:null;
            const materiel_safe_standard = worksheet['I'+i]?worksheet['I'+i].v:0;
            const materiel_system_standard = worksheet['J'+i]?worksheet['J'+i].v:0;
            const materiel_check_ratio = worksheet['K'+i]?worksheet['K'+i].v:0;
            const materiel_accounting = worksheet['L'+i] ? worksheet['L'+i].v : null;
            const review_materiel_cost = worksheet['O'+i]?worksheet['O'+i].v:0;
            const materiel_foreign_sale = worksheet['P'+i]?worksheet['P'+i].v:0;
            const materiel_min_purchase_num = worksheet['Q'+i]?worksheet['Q'+i].v:0;
            const materiel_sale = worksheet['S'+i] ? worksheet['S'+i].v : 0;
            const materiel= await tb_materiel.findOne({
                where: {
                    materiel_code: materiel_code,
                    state: GLBConfig.ENABLE,
                    domain_id: user.domain_id
                }
            });

            if (materiel) {
                return common.sendError(res, '',`第${i}行,物料编码"${materiel_code}"在系统中已存在`);
            }

            if (materiel_unit) {
                const isExist = unitInfo.some(item => (item.text === materiel_unit));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,计算单位'${materiel_unit}'不存在`);
            }
            if (materiel_unit_bk) {
                const isExist = unitInfo.some(item => (item.text === materiel_unit_bk));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,备用计算单位'${materiel_unit_bk}'不存在`);
            }
            if (materiel_state_management) {
                const isExist = GLBConfig.MATERIELSTATEMANAGEMENT.some(item => (item.text === materiel_state_management));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,状态分类'${materiel_state_management}'不存在`);
            }
            if (materiel_manage) {
                const isExist = GLBConfig.MATERIELMANAGE.some(item => (item.text === materiel_manage));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,管理模式'${materiel_manage}'不存在`);
            }
            if (materiel_source) {
                const isExist = GLBConfig.MATERIELSOURCE.some(item => (item.text === materiel_source));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,物料来源'${materiel_source}'不存在`);
            }
            if (materiel_safe_standard) {
                if(!validator.isInt(`${materiel_safe_standard}`))
                    return common.sendError(res, '',`第${i}行,人工设置安全库存标准${materiel_safe_standard}必须为整数`);
            }
            if (materiel_system_standard) {
                if(!validator.isInt(`${materiel_system_standard}`))
                    return common.sendError(res, '',`第${i}行,系统自算的安全库存标准${materiel_system_standard}必须为整数`);
            }
            if (materiel_check_ratio) {
                if(!validator.isFloat(`${materiel_check_ratio}`))
                    return common.sendError(res, '',`第${i}行,抽检比例${materiel_check_ratio}必须为数字`);
            }
            if (!materiel_accounting) {
                return common.sendError(res, '',`第${i}行,适用的会计科目不能为空`);
            } else {
                const isExist = GLBConfig.MATERIELACCOUNTING.some(item => (item.text === materiel_accounting));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,适用的会计科目'${materiel_source}'不存在`);
            }
            if (review_materiel_cost) {
                if(!validator.isFloat(`${review_materiel_cost}`))
                    return common.sendError(res, '',`第${i}行,采购预算价${review_materiel_cost}必须为数字`);
            }
            if (materiel_foreign_sale) {
                if(!validator.isFloat(`${materiel_foreign_sale}`))
                    return common.sendError(res, '',`第${i}行,外币预算价${materiel_foreign_sale}必须为数字`);
            }
            if (materiel_min_purchase_num) {
                if(!validator.isInt(`${materiel_min_purchase_num}`))
                    return common.sendError(res, '',`第${i}行,最低采购数量${materiel_min_purchase_num}必须为整数`);
            }
            if (materiel_sale) {
                if(!validator.isFloat(`${materiel_sale}`))
                    return common.sendError(res, '',`第${i}行,销售指导价${materiel_min_purchase_num}必须为数字`);
            } else {
                return common.sendError(res, '',`第${i}行,销售指导价不能为空`);
            }
        }

        await common.transaction(async function (t) {
            for(let i=2;i<=xlsxJson.length+1;i++){
                await tb_materiel.create({
                    domain_id: user.domain_id,
                    materiel_code: worksheet['A'+i] ? worksheet['A'+i].v : null,
                    materiel_name: worksheet['B'+i] ? worksheet['B'+i].v : null,
                    materiel_format:worksheet['C'+i] ? worksheet['C'+i].v : null,//规格型号
                    materiel_unit: getId(unitInfo,worksheet['D'+i] ? worksheet['D'+i].v : null),//计算单位
                    materiel_unit_bk: getId(unitInfo,worksheet['E'+i] ? worksheet['E'+i].v : null),//备用计算单位
                    materiel_state_management: getId(GLBConfig.MATERIELSTATEMANAGEMENT,worksheet['F'+i] ? worksheet['F'+i].v : null),//状态分类
                    materiel_manage: getId(GLBConfig.MATERIELMANAGE,worksheet['G'+i] ? worksheet['G'+i].v : null),//管理模式
                    materiel_source: getId(GLBConfig.MATERIELSOURCE,worksheet['H'+i] ? worksheet['H'+i].v : null),//物料来源
                    materiel_safe_standard:worksheet['I'+i] ? (worksheet['I'+i].v * 1) : 0,//人工设置安全库存标准
                    materiel_system_standard:worksheet['J'+i] ? (worksheet['J'+i].v * 1):0,//系统自算的安全库存标准
                    materiel_check_ratio:worksheet['K'+i] ? (worksheet['K'+i].v * 1):0,//抽检比例
                    materiel_accounting:getId(GLBConfig.MATERIELACCOUNTING,worksheet['L'+i] ? worksheet['L'+i].v : null),//适用的会计科目
                    materiel_iid_code:worksheet['M'+i] ? worksheet['M'+i].v : null,//配件识别码
                    materiel_cs_code:worksheet['N'+i] ? worksheet['N'+i].v : null,//客供识别码
                    materiel_cost:worksheet['O'+i] ? (worksheet['O'+i].v * 1) : 0,//采购预算价
                    materiel_foreign_sale:worksheet['P'+i] ? (worksheet['P'+i].v * 1) : 0,//外币预算价
                    materiel_min_purchase_num:worksheet['Q'+i] ? (worksheet['Q'+i].v * 1) : 0,//最低采购数量
                    materiel_describe: worksheet['R'+i] ? worksheet['R'+i].v : null,//描述
                    materiel_sale:worksheet['S'+i] ? worksheet['S'+i].v : 0,
                    materiel_review_state: '1',
                },{
                    transaction: t
                });
            }
        });

        common.sendData(res, '导入成功！');
    } catch (error) {
        common.sendError(res, '', error.message);
    }
}

//仓库信息
async function importWearHouse(req, res) {
    try {
        const { user, body } = req;
        const worksheet = await common.exceltojson(body.uploadurl);
        const excelJsonArray = trim(XLSX.utils.sheet_to_json(worksheet));
        let successNumber = 0;
        let errorNumber = 0;
        for (const itemData of excelJsonArray) {
            const [code, name, type, address, status, contact, phone, fax] = Object.entries(itemData);
            if (code[0] === 'NO' && code[1]) {
                const wareHouseResult = await tb_warehouse.findOne({
                    where: {
                        warehouse_code: code[1],
                        domain_id: user.domain_id
                    }
                });

                if (!wareHouseResult) {
                    console.dir({code, name, type, address, status, contact, phone, fax});
                    await tb_warehouse.create({
                        domain_id: user.domain_id,
                        warehouse_code: code[1],
                        warehouse_name: name[1],
                        warehouse_type: type[1],
                        warehouse_state: status[1],
                        warehouse_address: address[1],
                        warehouse_contact: contact[1],
                        warehouse_phone: phone[1],
                        warehouse_fax: fax[1]
                    });
                    successNumber++;
                } else {
                    errorNumber++;
                }
            } else {
                errorNumber++;
                console.dir(code);
            }
        }
        common.sendData(res, {successNumber, errorNumber});
    } catch (error) {
        common.sendError(res, '', error.message);
    }
}
//仓区信息
async function importWearHouseZone(req, res) {
    try {
        const { user, body } = req;
        const worksheet = await common.exceltojson(body.uploadurl);
        const excelJsonArray = trim(XLSX.utils.sheet_to_json(worksheet));
        let successNumber = 0;
        let errorNumber = 0;
        for (const itemData of excelJsonArray) {
            const [code, name, remark] = Object.entries(itemData);
            const wareHouseResult = await tb_warehouse.findOne({
                where: {
                    warehouse_id: code[1],
                    domain_id: user.domain_id
                }
            });

            if (wareHouseResult) {
                const zoneResult = await tb_warehousezone.findOne({
                    where: {
                        warehouse_id: code[1],
                        zone_name: name[1]
                    }
                });

                if (!zoneResult) {
                    console.dir({code, name, remark});
                    await tb_warehousezone.create({
                        warehouse_id: code[1],
                        zone_name: name[1],
                        zone_remark: remark[1]
                    });
                    successNumber++;
                } else {
                    errorNumber++;
                }
            } else {
                errorNumber++;
            }
        }
        common.sendData(res, {successNumber, errorNumber});
    } catch (error) {
        common.sendError(res, '', error.message);
    }
}

//实时库存信息
async function importStockMap(req, res) {
    try {
        const { user, body } = req;
        // const worksheet = trimJson(await common.exceltojson(body.uploadurl));
        // const excelJsonArray = XLSX.utils.sheet_to_json(worksheet);
        const excelJsonArray = common.excelToJson(body.uploadurl);

        await sequelize.transaction(async transaction => {
            //插入数据
            for (let i = 1; i <= excelJsonArray.length - 1; i++) {
                // const materielCode = worksheet['A'+i] ? worksheet['A'+i].v : null;
                // const materielName = worksheet['B'+i] ? worksheet['B'+i].v : null;
                // const materielMode = worksheet['C'+i] ? worksheet['C'+i].v : null;
                // const materielUnit = worksheet['D'+i] ? worksheet['D'+i].v : null;
                // const store_number = worksheet['E'+i] ? worksheet['E'+i].v : null;
                // const unit_price = worksheet['F'+i] ? worksheet['F'+i].v : null;
                // const price_amount = worksheet['G'+i] ? worksheet['G'+i].v : null;
                // const orderId = worksheet['H'+i] ? worksheet['H'+i].v : null;
                // const warehouseName = worksheet['I'+i] ? worksheet['I'+i].v : null;
                // const zoneName = worksheet['J'+i] ? worksheet['J'+i].v : null;
                // const idle_store = worksheet['K'+i] ? worksheet['K'+i].v : null;
                const [
                    materielCode, materielName, materielMode, materielUnit,
                    store_number, unit_price, price_amount, orderId,
                    warehouseName, zoneName, idle_store
                ] = excelJsonArray[i];

                if (store_number) {
                    if (!validator.isInt(`${store_number}`)) {
                        return common.sendError(res, '',`第${i}行,数量${store_number}必须为整数`);
                    }
                }
                if (unit_price) {
                    if (!validator.isFloat(`${unit_price}`)) {
                        return common.sendError(res, '',`第${i}行,单价${unit_price}必须为数字`);
                    }
                }
                if (price_amount) {
                    if (!validator.isFloat(`${price_amount}`)) {
                        return common.sendError(res, '',`第${i}行,金额${price_amount}必须为数字`);
                    }
                }
                if (idle_store && idle_store !== 0 && idle_store !== 1) {
                    return common.sendError(res, '',`第${i}行,是否是闲置库存您输入的是${idle_store}只能输入0或1`);
                }

                const wareHouseResult = await tb_warehouse.findOne({
                    where: {
                        warehouse_name: warehouseName,
                        domain_id: user.domain_id
                    }
                });

                if (!wareHouseResult) {
                    return common.sendError(res, '',`第${i}行, 仓库：${warehouseName}不存在`);
                }

                const zoneResult = await tb_warehousezone.findOne({
                    where: {
                        warehouse_id: wareHouseResult.warehouse_id,
                        zone_name: zoneName
                    }
                });

                if (!zoneResult) {
                    return common.sendError(res, '',`第${i}行, 仓区：${zoneName}不存在`);
                }

                const materielResult = await tb_materiel.findOne({
                    where: {
                        materiel_code: materielCode,
                        domain_id: user.domain_id,
                        state: GLBConfig.ENABLE
                    }
                });

                if (!materielResult) {
                    return common.sendError(res, '', `第${i}行, 物料${materielCode}不存在`);
                }

                const { materiel_id, materiel_name, materiel_format, materiel_unit } = materielResult;
                if (materielName !== materiel_name) {
                    return common.sendError(res, '', `第${i}行, 物料${materielCode}名称不匹配`);
                }
                if (materielMode !== materiel_format) {
                    return common.sendError(res, '', `第${i}行, 物料${materielCode}规格型号不匹配`);
                }
                const unitInfo = await getBaseTypeInfo(user.domain_id, 'JLDW');
                const unitResult = unitInfo.find(item => item.text === materielUnit);
                if (!unitResult) {
                    return common.sendError(res, '', `第${i}行, 物料${materielCode}单位无效`);
                }
                if (parseInt(unitResult.id) !== parseInt(materiel_unit)) {
                    return common.sendError(res, '', `第${i}行, 物料${materielCode}单位不匹配`);
                }

                const int_price_amount = parseFloat(price_amount);
                const int_store_number = parseInt(store_number);
                const int_idle_store = parseInt(idle_store);
                const storage_type = !!int_idle_store ? 3 : parseInt(materielResult.materiel_manage);
                const stockMap = await tb_stockmap.findOne({
                    where: {
                        domain_id: user.domain_id,
                        warehouse_id: wareHouseResult.warehouse_id,
                        warehouse_zone_id: zoneResult.warehouse_zone_id,
                        materiel_id,
                        order_id: orderId,
                        storage_type,
                        state: GLBConfig.ENABLE
                    }
                });

                if (stockMap) {
                    stockMap.current_amount += int_store_number;
                    stockMap.price_amount += int_price_amount;
                    stockMap.store_price = await getPrecisionPrice(user.domain_id, stockMap.price_amount / stockMap.current_amount);
                    await stockMap.save({ transaction });
                } else {
                    const int_unit_price = await getPrecisionPrice(user.domain_id, Number(unit_price));
                    await tb_stockmap.create({
                        domain_id: user.domain_id,
                        warehouse_id: wareHouseResult.warehouse_id,
                        warehouse_zone_id: zoneResult.warehouse_zone_id,
                        materiel_id,
                        current_amount: int_store_number,
                        price_amount: int_price_amount,
                        storage_type,
                        store_price: int_unit_price,
                        order_id: orderId,
                    }, {
                        transaction
                    });
                }
            }
        });

        common.sendData(res, '导入成功！');
    } catch (error) {
        common.sendError(res, '', error.message);
    }
}

//销售订单信息
async function importOrder(req, res) {
    try {
        const {user, body} = req;
        const worksheet = trimJson(await common.exceltojson(body.uploadurl));
        const excelJsonArray = XLSX.utils.sheet_to_json(worksheet);

        for (let i=2; i<=excelJsonArray.length+1; i++) {

            // const itemData = excelJsonArray[i];
            // const [order_id, corporateclients_no, name, materiel_code, materiel_name, materiel_specification, materiel_unit,materiel_count, materiel_price, order_delivery_date] = Object.entries(itemData);

            const order_id = worksheet['A'+i] ? worksheet['A'+i].v : null;
            const corporateclients_no = worksheet['B'+i] ? worksheet['B'+i].v : null;
            const name = worksheet['C'+i] ? worksheet['C'+i].v : null;
            const materiel_code = worksheet['D'+i] ? worksheet['D'+i].v : null;
            const materiel_name = worksheet['E'+i] ? worksheet['E'+i].v : null;
            const materiel_specification = worksheet['F'+i] ? worksheet['F'+i].v : null;
            const materiel_unit = worksheet['G'+i] ? worksheet['G'+i].v : null;
            const materiel_count = worksheet['H'+i] ? worksheet['H'+i].v : null;
            const materiel_price = worksheet['I'+i] ? worksheet['I'+i].v : null;
            const order_delivery_date = worksheet['J'+i] ? worksheet['J'+i].w : null;

            if (order_delivery_date) {
                if(!common.checkDate(order_delivery_date))
                    return common.sendError(res, '',`第${i}行,交货日期${order_delivery_date}格式不正确,请输入YYYY-MM-DD格式`);
            }
            if (!corporateclients_no) {
                return common.sendError(res, '',`第${i}行,客户不允许为空`);
            } else {
                let corporateclient = await tb_custorgstructure.findOne({
                    where:{
                        corporateclients_no: corporateclients_no,
                        domain_id: user.domain_id
                    }
                });
                if (!corporateclient)
                    return common.sendError(res, '',`第${i}行,客户${corporateclients_no}不存在`);
            }
            if (!order_id) {
                return common.sendError(res, '',`第${i}行,订单不允许为空！`);
            }
            if (!materiel_code) {
                return common.sendError(res, '',`第${i}行,产品编号不允许为空！`);
            } else {
                let materiel = await tb_materiel.findOne({
                    where: {
                        materiel_code: materiel_code,
                        state: 1,
                        domain_id: user.domain_id
                    }
                });
                if (!materiel) {
                    return common.sendError(res, '',`第${i}行,产品${materiel_code}不存在`);
                }
            }
            if (!materiel_count) {
                return common.sendError(res, '',`第${i}行,数量不允许为空！`);
            } else {
                if(!validator.isInt(`${materiel_count}`))
                    return common.sendError(res, '',`第${i}行,数量${materiel_count}必须为整数`);
            }
            if (!materiel_price) {
                return common.sendError(res, '',`单价不允许为空！`);
            } else {
                if(!validator.isFloat(`${materiel_price}`))
                    return common.sendError(res, '',`第${i}行,销售单价${materiel_price}必须为数字`);
            }
        }

        let insertObj = {};
        await common.transaction(async function (t) {
            for (let i=2; i<=excelJsonArray.length+1; i++) {

                // const [order_id, corporateclients_no, name, materiel_code, materiel_name, materiel_specification, materiel_unit,materiel_amount,materiel_price, order_delivery_date] = Object.entries(itemData);
                const order_id = worksheet['A'+i] ? worksheet['A'+i].v : null;
                const corporateclients_no = worksheet['B'+i] ? worksheet['B'+i].v : null;
                const name = worksheet['C'+i] ? worksheet['C'+i].v : null;
                const materiel_code = worksheet['D'+i] ? worksheet['D'+i].v : null;
                const materiel_name = worksheet['E'+i] ? worksheet['E'+i].v : null;
                const materiel_specification = worksheet['F'+i] ? worksheet['F'+i].v : null;
                const materiel_unit = worksheet['G'+i] ? worksheet['G'+i].v : null;
                const materiel_amount = worksheet['H'+i] ? worksheet['H'+i].v : null;
                const materiel_price = worksheet['I'+i] ? worksheet['I'+i].v : null;
                const order_delivery_date = worksheet['J'+i] ? worksheet['J'+i].w : null;

                if (!insertObj[order_id]) {

                    //查找这个部门是否已经存在这个订单
                    const order = await tb_order.findOne({
                        where: {
                            biz_code: order_id,
                            domain_id: user.domain_id
                        }
                    });
                    if (order) {
                        insertObj[order_id] = order.order_id;
                    } else {
                        let corporateclient = await tb_custorgstructure.findOne({
                            where:{
                                corporateclients_no: corporateclients_no,
                                domain_id: user.domain_id
                            }
                        });
                        let id = await Sequence.genSalesOrderID(user.domain_id);
                        //销售单
                        await tb_order.create({
                            order_id: id,                      //销售单号
                            biz_code: order_id,
                            domain_id: user.domain_id,                  //销售方
                            purchase_order_id: '',                      //采购单号
                            purchase_domain_id: 0,                      //采购方
                            order_type: 8,                              //订单类型，8采购订单，OTYPEINFO
                            order_state:'FINISHI',
                            purchaser_type:3,                           //采购方类型 1机构，2个人 3企业
                            purchaser_corporateclients_id:corporateclient.corporateclients_id,    //企业ID
                            sales_data_source:2,                         //标识该采购单来源 1mrp运算，2手动添加
                            sap_order_state:1,                           //标识该销售单sap状态'
                            order_review_state:2,                        //订单评审标志  0未提交 1已提交2 2通过 3拒绝
                            order_delivery_date:order_delivery_date || null   //交货日期
                        },{
                            transaction: t
                        });
                        insertObj[order_id] = id;
                    }
                }

                let materiel = await tb_materiel.findOne({
                    where: {
                        materiel_code: materiel_code,
                        state: 1,
                        domain_id: user.domain_id
                    }
                });
                //添加订单物料
                await tb_ordermateriel.create({
                    order_id: insertObj[order_id],
                    materiel_id: materiel.materiel_id,
                    materiel_amount: materiel_amount * 1,
                    sale_price: materiel_price * 1
                },{
                    transaction: t
                });
            }

        });

        common.sendData(res, '导入成功！');
    } catch (error) {
        common.sendError(res, '', error.message);
    }
}

//待摊资产明细信息
async function importAmortize(req, res) {
    try {
        const { user, body } = req;
        const worksheet = trimJson(await common.exceltojson(body.uploadurl));
        const excelJsonArray = XLSX.utils.sheet_to_json(worksheet);

        for (let i=2; i<=excelJsonArray.length+1; i++) {

            // const itemData = excelJsonArray[i];
            // const [
            //     amortize_name,amortize_money,amortize_agelimit,amortize_ratio,amortize_way,amortize_already_mos,amortize_already_money,
            //     amortize_surplus_mos,amortize_departmant_id,depart_name,amortize_manager,amortize_acceptor_time,amortize_property,scrap_flag
            // ] = Object.entries(itemData);

            const amortize_name = worksheet['A'+i] ? worksheet['A'+i].v : null;
            const amortize_money = worksheet['B'+i] ? worksheet['B'+i].v : null;
            const amortize_agelimit = worksheet['C'+i] ? worksheet['C'+i].v : null;
            const amortize_ratio = worksheet['D'+i] ? worksheet['D'+i].v : null;
            const amortize_way = worksheet['E'+i] ? worksheet['E'+i].v : null;
            const amortize_already_mos = worksheet['F'+i] ? worksheet['F'+i].v : null;
            const amortize_already_money = worksheet['G'+i] ? worksheet['G'+i].v : null;
            const amortize_surplus_mos = worksheet['H'+i] ? worksheet['H'+i].v : null;
            const department_name = worksheet['I'+i] ? worksheet['I'+i].v : null;
            const amortize_manager = worksheet['J'+i] ? worksheet['J'+i].v : null;
            const amortize_acceptor_time = worksheet['K'+i] ? worksheet['K'+i].w : null;
            const amortize_property = worksheet['L'+i] ? worksheet['L'+i].v : null;
            const scrap_flag = worksheet['M'+i] ? worksheet['M'+i].v : null;

            if (!amortize_name) {
                return common.sendError(res, '',`第${i}行,长期待摊资产名称不允许为空`);
            }
            if (amortize_money) {
                if(!validator.isFloat(`${amortize_money}`))
                    return common.sendError(res, '',`第${i}行,金额${amortize_money}必须为数字`);
            }
            if (!amortize_agelimit) {
                return common.sendError(res, '',`第${i}行,长期待摊资产预计使用年限不允许为空`);
            } else {
                if(!validator.isInt(`${amortize_agelimit}`))
                    return common.sendError(res, '',`第${i}行,长期待摊资产预计使用年限${amortize_agelimit}必须为整数`);
            }
            if (amortize_ratio) {
                if(!validator.isFloat(`${amortize_ratio}`))
                    return common.sendError(res, '',`第${i}行,预计净残值率${amortize_ratio}必须为数字`);
            }
            if (!amortize_way) {
                return common.sendError(res, '',`第${i}行,摊销方法不允许为空`);
            } else {
                const isExist = GLBConfig.AMORTIZED.some(item => (item.text === amortize_way));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,摊销方法'${amortize_way}'不存在`);
            }
            if (amortize_already_mos) {
                if(!validator.isInt(`${amortize_already_mos}`))
                    return common.sendError(res, '',`第${i}行,已计提摊销月数${amortize_already_mos}必须为整数`);
            }
            if (amortize_already_money) {
                if(!validator.isFloat(`${amortize_already_money}`))
                    return common.sendError(res, '',`第${i}行,已累计计提的摊销金额${amortize_already_money}必须为数字`);
            }
            if (amortize_surplus_mos) {
                if(!validator.isInt(`${amortize_surplus_mos}`))
                    return common.sendError(res, '',`第${i}行,剩余摊销月数${amortize_surplus_mos}必须为整数`);
            }
            if (!department_name) {
                return common.sendError(res, '',`第${i}行,资产归属部门名称不允许为空`);
            } else {
                const department = await tb_department.findOne({
                    where: {
                        department_name,
                        domain_id: user.domain_id,
                        state: 1
                    }
                });
                if (!department)
                    return common.sendError(res, '',`第${i}行,资产归属部门名称'${department_name}'不存在`);
            }
            if (!amortize_manager) {
                return common.sendError(res, '',`第${i}行,管理责任人编号不允许为空`);
            } else {
                const fixUser = await tb_user.findOne({
                    where: {
                        user_id: amortize_manager,
                        state: 1,
                        domain_id: user.domain_id
                    }
                })
                if (!fixUser)
                    return common.sendError(res, '',`第${i}行,管理责任人编号'${amortize_manager}'不存在`);
            }
            if (!amortize_acceptor_time) {
                return common.sendError(res, '',`第${i}行,资产验收时间不允许为空`);
            } else {
                if(!common.checkDate(amortize_acceptor_time))
                    return common.sendError(res, '',`第${i}行,资产验收时间'${amortize_acceptor_time}'格式不正确,请输入YYYY-MM-DD格式`);
            }
            if (!amortize_property) {
                return common.sendError(res, '',`第${i}行,长期资产形式分类不允许为空`);
            } else {
                const isExist = GLBConfig.FIXEDASSETS.some(item => (item.text === amortize_property));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,长期资产形式分类'${amortize_property}'不存在`);
            }
            if (scrap_flag && (scrap_flag != 0 && scrap_flag != 1)) {
                return common.sendError(res, '',`第${i}行,报废标志您输入的是${scrap_flag}只能输入0或1`);
            }
        }
        await common.transaction(async function (t) {
            for (let i=2; i<=excelJsonArray.length+1; i++) {
                // const [
                //     amortize_name,amortize_money,amortize_agelimit,amortize_ratio,amortize_way,amortize_already_mos,amortize_already_money,
                //     amortize_surplus_mos,amortize_departmant_id,depart_name,amortize_manager,amortize_acceptor_time,amortize_property,scrap_flag
                // ] = Object.entries(itemData);

                const amortize_name = worksheet['A'+i] ? worksheet['A'+i].v : null;
                const amortize_money = worksheet['B'+i] ? worksheet['B'+i].v : null;
                const amortize_agelimit = worksheet['C'+i] ? worksheet['C'+i].v : null;
                const amortize_ratio = worksheet['D'+i] ? worksheet['D'+i].v : null;
                const amortize_way = worksheet['E'+i] ? worksheet['E'+i].v : null;
                const amortize_already_mos = worksheet['F'+i] ? worksheet['F'+i].v : null;
                const amortize_already_money = worksheet['G'+i] ? worksheet['G'+i].v : null;
                const amortize_surplus_mos = worksheet['H'+i] ? worksheet['H'+i].v : null;
                const department_name = worksheet['I'+i] ? worksheet['I'+i].v : null;
                const amortize_manager = worksheet['J'+i] ? worksheet['J'+i].v : null;
                const amortize_acceptor_time = worksheet['K'+i] ? worksheet['K'+i].w : null;
                const amortize_property = worksheet['L'+i] ? worksheet['L'+i].v : null;
                const scrap_flag = worksheet['M'+i] ? worksheet['M'+i].v : null;

                const department = await tb_department.findOne({
                    where: {
                        department_name,
                        domain_id: user.domain_id,
                        state: 1
                    }
                });

                let amortize_code = await Sequence.genAmortizedID(user);
                await tb_amortize.create({
                    domain_id: user.domain_id,
                    amortize_code: amortize_code,
                    amortize_name:amortize_name,
                    amortize_money: amortize_money * 1,
                    amortize_agelimit: amortize_agelimit * 1,
                    amortize_ratio: amortize_ratio * 100,
                    amortize_way: getId(GLBConfig.AMORTIZED,amortize_way),
                    amortize_already_mos: amortize_already_mos * 1,
                    amortize_already_money: amortize_already_money * 1,
                    amortize_surplus_mos: amortize_surplus_mos * 1,
                    amortize_departmant_id: department.department_id,
                    amortize_manager: amortize_manager,
                    amortize_acceptor_time: amortize_acceptor_time,
                    amortize_property: getId(GLBConfig.FIXEDASSETS,amortize_property),
                    scrap_flag: scrap_flag,
                    amortize_creator:user.user_id,
                    amortize_project_state:2,
                    amortize_check_state:2,
                    take_stock_flag:1,
                },{
                    transaction: t
                });
            }
        });
        common.sendData(res, '导入成功！');
    } catch (error) {
        common.sendError(res, '', error.message);
    }
}
//外购固定资产
async function importFixed(req, res) {
    try {
        const { user, body } = req;
        const worksheet = trimJson(await common.exceltojson(body.uploadurl));
        const excelJsonArray = XLSX.utils.sheet_to_json(worksheet);

        for (let i=2; i<=excelJsonArray.length+1; i++) {
            // const itemData = excelJsonArray[i];
            // const [
            //     fixedassets_name,fixedassets_model,fixedassets_unit,original_value,use_time_limit,residual_value_rate,
            //     depreciation_category,deprecition_month,deprecition_price,residual_deprecition_month,department_id,department_name,
            //     name,created_at,fixedassets_category,fixedassets_type,scrap_flag
            // ] = Object.entries(itemData);
            const fixedassets_name = worksheet['A'+i] ? worksheet['A'+i].v : null;
            const fixedassets_model = worksheet['B'+i] ? worksheet['B'+i].v : null;
            const fixedassets_unit = worksheet['C'+i] ? worksheet['C'+i].v : null;
            const original_value = worksheet['D'+i] ? worksheet['D'+i].v : null;
            const use_time_limit = worksheet['E'+i] ? worksheet['E'+i].v : null;
            const residual_value_rate = worksheet['F'+i] ? worksheet['F'+i].v : null;
            const depreciation_category = worksheet['G'+i] ? worksheet['G'+i].v : null;
            const deprecition_month = worksheet['H'+i] ? worksheet['H'+i].v : null;
            const deprecition_price = worksheet['I'+i] ? worksheet['I'+i].v : null;
            const residual_deprecition_month = worksheet['J'+i] ? worksheet['J'+i].v : null;
            // const department_id = worksheet['K'+i] ? worksheet['K'+i].v : null;
            const department_name = worksheet['K'+i] ? worksheet['K'+i].v : null;
            const user_id = worksheet['L'+i] ? worksheet['L'+i].v : null;
            const created_at = worksheet['M'+i] ? worksheet['M'+i].w : null;
            const fixedassets_category = worksheet['N'+i] ? worksheet['N'+i].v : null;
            const fixedassets_type = worksheet['O'+i] ? worksheet['O'+i].v : null;
            const scrap_flag = worksheet['P'+i] ? worksheet['P'+i].v : null;
            const fixedassets_no = worksheet['Q'+i] ? worksheet['Q'+i].v : null;

            if (!fixedassets_name) {
                return common.sendError(res, '',`第${i}行,固定资产名称不允许为空`);
            }
            if (!fixedassets_model) {
                return common.sendError(res, '',`第${i}行,规格型号不允许为空`);
            }
            if (!fixedassets_unit) {
                return common.sendError(res, '',`第${i}行,计量单位不允许为空`);
            }
            if (!original_value) {
                return common.sendError(res, '',`第${i}行,固定资产原值不允许为空`);
            } else {
                if(!validator.isFloat(`${original_value}`))
                    return common.sendError(res, '',`第${i}行,固定资产原值${original_value}必须为数字`);
            }
            if (use_time_limit) {
                if(!validator.isInt(`${use_time_limit}`))
                    return common.sendError(res, '',`第${i}行,预计使用年限${use_time_limit}必须为整数`);
            }
            if (residual_value_rate) {
                if(!validator.isFloat(`${residual_value_rate}`))
                    return common.sendError(res, '',`第${i}行,预计净残值率${residual_value_rate}必须为数字`);
            }
            if (!depreciation_category) {
                return common.sendError(res, '',`第${i}行,折旧方法不允许为空`);
            } else {
                const isExist = GLBConfig.DEPRECIATIONMETHOD.some(item => (item.text === depreciation_category));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,折旧方法'${depreciation_category}'不存在`);
            }
            if (!deprecition_month) {
                return common.sendError(res, '',`第${i}行,已计提折旧月数不允许为空`);
            } else {
                if(!validator.isInt(`${deprecition_month}`))
                    return common.sendError(res, '',`第${i}行,已计提折旧月数${deprecition_month}必须为整数`);
            }
            if (!deprecition_price) {
                return common.sendError(res, '',`第${i}行,已计提折旧金额不允许为空`);
            } else {
                if(!validator.isFloat(`${deprecition_price}`))
                    return common.sendError(res, '',`第${i}行,已计提折旧金额${deprecition_price}必须为数字`);
            }
            if (!residual_deprecition_month) {
                return common.sendError(res, '',`第${i}行,剩余折旧月数不允许为空`);
            } else {
                if(!validator.isInt(`${residual_deprecition_month}`))
                    return common.sendError(res, '',`第${i}行,剩余折旧月数${residual_deprecition_month}必须为整数`);
            }
            if (!department_name) {
                return common.sendError(res, '',`第${i}行,资产归属部门名称不允许为空`);
            } else {
                const department = await tb_department.findOne({
                   where: {
                       department_name,
                       domain_id: user.domain_id,
                       state: 1
                   }
                });
                if (!department)
                    return common.sendError(res, '',`第${i}行,资产归属部门名称'${department_name}'不存在`);
            }
            if (!user_id) {
                return common.sendError(res, '',`第${i}行,管理负责人编号不允许为空`);
            } else {
                const fixUser = await tb_user.findOne({
                    where: {
                        user_id: user_id,
                        state: 1,
                        domain_id: user.domain_id
                    }
                })
                if (!fixUser)
                    return common.sendError(res, '',`第${i}行,管理负责人编号'${user_id}'不存在`);
            }
            if (created_at) {
                if(!common.checkDate(created_at))
                    return common.sendError(res, '',`第${i}行,资产购入验收时间'${created_at}'格式不正确,请输入YYYY-MM-DD格式`);
            }
            if (!fixedassets_category) {
                return common.sendError(res, '',`第${i}行,长期资产形式分类不允许为空`);
            } else {
                const isExist = GLBConfig.FIXEDASSETS.some(item => (item.text === fixedassets_category));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,长期资产形式分类'${fixedassets_category}'不存在`);
            }
            if (fixedassets_type) {
                const isExist = GLBConfig.LONGASSETSTYPE.some(item => (item.text === fixedassets_type));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,长期资产性质分类'${fixedassets_type}'不存在`);
            }
            if (scrap_flag && (scrap_flag != 0 && scrap_flag != 1)) {
                return common.sendError(res, '',`第${i}行,报废标志您输入的是${scrap_flag}只能输入0或1`);
            }
        }

        await common.transaction(async function (t) {
            for (let i=2; i<=excelJsonArray.length+1; i++) {
                // const [
                //     fixedassets_name, fixedassets_model, fixedassets_unit, original_value, use_time_limit, residual_value_rate,
                //     depreciation_category, deprecition_month, deprecition_price, residual_deprecition_month, department_id, department_name,
                //     name,created_at, fixedassets_category, fixedassets_type, scrap_flag
                // ] = Object.entries(itemData);
                const fixedassets_name = worksheet['A'+i] ? worksheet['A'+i].v : null;
                const fixedassets_model = worksheet['B'+i] ? worksheet['B'+i].v : null;
                const fixedassets_unit = worksheet['C'+i] ? worksheet['C'+i].v : null;
                const original_value = worksheet['D'+i] ? worksheet['D'+i].v : null;
                const use_time_limit = worksheet['E'+i] ? worksheet['E'+i].v : null;
                const residual_value_rate = worksheet['F'+i] ? worksheet['F'+i].v : null;
                const depreciation_category = worksheet['G'+i] ? worksheet['G'+i].v : null;
                const deprecition_month = worksheet['H'+i] ? worksheet['H'+i].v : null;
                const deprecition_price = worksheet['I'+i] ? worksheet['I'+i].v : null;
                const residual_deprecition_month = worksheet['J'+i] ? worksheet['J'+i].v : null;
                // const department_id = worksheet['K'+i] ? worksheet['K'+i].v : null;
                const department_name = worksheet['K'+i] ? worksheet['K'+i].v : null;
                const user_id = worksheet['L'+i] ? worksheet['L'+i].v : null;
                const created_at = worksheet['M'+i] ? worksheet['M'+i].w : null;
                const fixedassets_category = worksheet['N'+i] ? worksheet['N'+i].v : null;
                const fixedassets_type = worksheet['O'+i] ? worksheet['O'+i].v : null;
                const scrap_flag = worksheet['P'+i] ? worksheet['P'+i].v : null;
                const fixedassets_no = worksheet['Q'+i] ? worksheet['Q'+i].v : null;

                const department = await tb_department.findOne({
                    where: {
                        department_name,
                        domain_id: user.domain_id,
                        state: 1
                    }
                });

                let fixedassetscheck_no = await Sequence.genfixedAssetsCheckNo();
                let addFixed = await tb_fixedassetscheck.create({
                    fixedassetscheck_no: fixedassetscheck_no,
                    domain_id: user.domain_id,
                    check_state:3
                },{
                    transaction: t
                });

                // let fixedassets_no = await Sequence.genfixedAssetsNo();
                const fixedassetscheckdetail = await tb_fixedassetscheckdetail.create({
                    fixedassetscheck_id: addFixed.fixedassetscheck_id,
                    fixedassets_no: fixedassets_no,//固定资产编号
                    fixedassets_name: fixedassets_name,//固定资产名称
                    fixedassets_model: fixedassets_model,//规格型号
                    fixedassets_unit: fixedassets_unit,//计量单位,
                    original_value: original_value * 1,//固定资产原值
                    use_time_limit: use_time_limit * 1,//预计使用年限
                    residual_value_rate: residual_value_rate * 100,//预计净残值率
                    depreciation_category: getId(GLBConfig.DEPRECIATIONMETHOD,depreciation_category),//折旧方法
                    deprecition_month: deprecition_month * 1,//已计提折旧月数
                    deprecition_price: deprecition_price * 100,//已累计计提的折旧金额
                    residual_deprecition_month: residual_deprecition_month * 1,//剩余折旧月数
                    department_id: department.department_id,//资产归属部门编号
                    fixedassets_category: getId( GLBConfig.FIXEDASSETS,fixedassets_category),//长期资产形式分类
                    fixedassets_type: getId(GLBConfig.LONGASSETSTYPE,fixedassets_type),//长期资产性质分类
                    scrap_flag: scrap_flag,//报废标志（0:是，1:否
                    user_id: user_id, //管理负责人
                    created_at: created_at || new Date()//资产购入验收时间
                },{
                    transaction: t
                });

                // //添加会计科目明细
                // await addAccountingDetail(1601,fixedassetscheckdetail.fixedassetscheckdetail_id,user.domain_id, t);
            }
        });

        common.sendData(res, '导入成功！');
    } catch (error) {
        common.sendError(res, '', error.message);
    }
}

//31 低值易耗品明细信息
async function importConsumable(req,res){
    try{
        const {user,body} = req;
        const worksheet = trimJson(await common.exceltojson(body.uploadurl));
        const excelJsonArray = XLSX.utils.sheet_to_json(worksheet);

        for(let i=2; i<=excelJsonArray.length+1; i++){
            // const itemData = excelJsonArray[i];
            // const [consumables_name,consumables_specifications,consumables_unit,consumables_number,consumables_price,
            //     money,department_id,name,consumables_acceptance_type_text,scrap_flag] = Object.entries(itemData);
            const consumables_name = worksheet['A'+i] ? worksheet['A'+i].v : null;
            const consumables_specifications = worksheet['B'+i] ? worksheet['B'+i].v : null;
            const consumables_unit = worksheet['C'+i] ? worksheet['C'+i].v : null;
            const consumables_number = worksheet['D'+i] ? worksheet['D'+i].v : null;
            const consumables_price = worksheet['E'+i] ? worksheet['E'+i].v : null;
            const money = worksheet['F'+i] ? worksheet['F'+i].v : null;
            const department_name = worksheet['G'+i] ? worksheet['G'+i].v : null;
            const name = worksheet['H'+i] ? worksheet['H'+i].v : null;
            const consumables_acceptance_type_text = worksheet['I'+i] ? worksheet['I'+i].v : null;
            const scrap_flag = worksheet['J'+i] ? worksheet['J'+i].v : null;


            if (!consumables_name) {
                return common.sendError(res, '',`第${i}行,低值易耗品名称不允许为空`);
            }
            if (!consumables_specifications) {
                return common.sendError(res, '',`第${i}行,低值易耗品规格型号不允许为空`);
            }
            if (!consumables_unit) {
                return common.sendError(res, '',`第${i}行,计量单位不允许为空`);
            }
            if (!consumables_number) {
                return common.sendError(res, '',`第${i}行,数量不允许为空`);
            } else {
                if(!validator.isFloat(`${consumables_number}`))
                    return common.sendError(res, '',`第${i}行,数量${consumables_number}必须为数字`);
            }
            if (!consumables_price) {
                return common.sendError(res, '',`第${i}行,价格不允许为空`);
            } else {
                if(!validator.isFloat(`${consumables_price}`))
                    return common.sendError(res, '',`第${i}行,价格${consumables_price}必须为数字`);
            }
            if (!department_name) {
                return common.sendError(res, '',`第${i}行,资产归属部门名称不允许为空`);
            } else {
                const department = await tb_department.findOne({
                    where: {
                        department_name,
                        domain_id: user.domain_id,
                        state: 1
                    }
                });
                if (!department)
                    return common.sendError(res, '',`第${i}行,资产归属部门名称'${department_name}'不存在`);
            }
            if (!name) {
                return common.sendError(res, '',`第${i}行,管理负责人不允许为空`);
            } else {
                const fixUser = await tb_user.findOne({
                    where: {
                        user_id: name,
                        state: 1,
                        domain_id: user.domain_id
                    }
                })
                if (!fixUser)
                    return common.sendError(res, '',`第${i}行,管理负责人'${name}'不存在`);
            }
            if (!consumables_acceptance_type_text) {
                return common.sendError(res, '',`第${i}行,验收类型不允许为空`);
            } else {
                const isExist = GLBConfig.LOW_VALUE_ACCEPTANCE_TYPE.some(item => (item.text === consumables_acceptance_type_text));
                if (!isExist) {
                    return common.sendError(res, '',`第${i}行,验收类型${consumables_acceptance_type_text}不存在`);
                }
            }
            if (scrap_flag && (scrap_flag != 0 && scrap_flag != 1)) {
                return common.sendError(res, '',`第${i}行,报废标志您输入的是${scrap_flag}只能输入0或1`);
            }
        }

        await common.transaction(async function (t) {
            for(let i=2; i<=excelJsonArray.length+1; i++) {
                // const [consumables_name, consumables_specifications, consumables_unit, consumables_number, consumables_price,
                //     money, department_id, name, consumables_acceptance_type_text, scrap_flag] = Object.entries(itemData);
                const consumables_name = worksheet['A'+i] ? worksheet['A'+i].v : null;
                const consumables_specifications = worksheet['B'+i] ? worksheet['B'+i].v : null;
                const consumables_unit = worksheet['C'+i] ? worksheet['C'+i].v : null;
                const consumables_number = worksheet['D'+i] ? worksheet['D'+i].v : null;
                const consumables_price = worksheet['E'+i] ? worksheet['E'+i].v : null;
                const money = worksheet['F'+i] ? worksheet['F'+i].v : null;
                const department_name = worksheet['G'+i] ? worksheet['G'+i].v : null;
                const name = worksheet['H'+i] ? worksheet['H'+i].v : null;
                const consumables_acceptance_type_text = worksheet['I'+i] ? worksheet['I'+i].v : null;
                const scrap_flag = worksheet['J'+i] ? worksheet['J'+i].v : null;

                const department = await tb_department.findOne({
                    where: {
                        department_name,
                        domain_id: user.domain_id,
                        state: 1
                    }
                });

                let consumables_code = await Sequence.getConsumablesAcceptanceID();
                await tb_consumables.create({
                    consumables_code: consumables_code,
                    domain_id: user.domain_id,
                    consumables_creator_id:name,
                    consumables_creator_name: user.name,
                    consumables_type_id:GLBConfig.LOW_VALUE_TYPE[1].value,
                    consumables_status: GLBConfig.LOW_VALUE_STATUS[3].value
                },{
                    transaction: t
                })

                let consumables_detail_code = await Sequence.getConsumablesDetailID();
                await tb_consumablesdetail.create({
                    domain_id:user.domain_id,
                    consumables_parent_code:consumables_code,
                    consumables_detail_code: consumables_detail_code,//code
                    consumables_detail_creator_id: name,//创建人ID
                    consumables_detail_creator_name: user.name,//创建人名字
                    consumables_detail_type_id: GLBConfig.LOW_VALUE_TYPE[1].value,//类型 1资产申购单 2验收单
                    consumables_name: consumables_name,//易耗品名字
                    consumables_specifications: consumables_specifications,//规格型号
                    consumables_unit: consumables_unit,//计量单位
                    consumables_administrator_id: name,//管理人
                    department_id: department.department_id,//部门
                    consumables_acceptance_type_id: getId(GLBConfig.LOW_VALUE_ACCEPTANCE_TYPE,consumables_acceptance_type_text),//验收类型ID
                    consumables_price: consumables_price * 1,//单价
                    consumables_number:consumables_number * 1,//数量
                    consumables_detail_status: GLBConfig.LOW_VALUE_STATUS[3].value,//审核状态
                    take_stock_flag:1,//盈亏状态 0：盈亏 1：正常
                    scrap_flag:scrap_flag,//报废标志 0：已报废 1：未报废
                },{
                    transaction: t
                })
            }
        });


        common.sendData(res, '导入成功！');
    }catch(error){
        common.sendError(res, '', error.message);
    }
}

//部门基本资料
async function importDepartmentOld(req, res) {
    try {
        const { user, body } = req;
        const worksheet = trimJson(await common.exceltojson(body.uploadurl));
        const excelJsonArray = XLSX.utils.sheet_to_json(worksheet);
        for (let i=2; i<=excelJsonArray.length+1; i++) {
            // const itemData = excelJsonArray[i];
            // const [department_name,department_type_text,p_department_id,p_department_name,department_plan_num,
            //     department_level] = Object.entries(itemData);
            const department_name = worksheet['A'+i] ? worksheet['A'+i].v : null;
            const department_type_text = worksheet['B'+i] ? worksheet['B'+i].v : null;
            // const p_department_id = worksheet['C'+i] ? worksheet['C'+i].v : null;
            const p_department_name = worksheet['C'+i] ? worksheet['C'+i].v : null;
            const department_plan_num = worksheet['D'+i] ? worksheet['D'+i].v : null;
            const department_level = worksheet['E'+i] ? worksheet['E'+i].v : null;


            if (!department_name) {
                return common.sendError(res, '',`第${i}行,部门名称不允许为空`);
            }
            if (!department_type_text) {
                return common.sendError(res, '',`第${i}行,部门类型不允许为空`);
            } else {
                const isExist = GLBConfig.DEPARTTYPE.some(item => (item.text === department_type_text));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,部门类型${department_type_text}不存在`);
            }
            if (p_department_name) {
                let department = await tb_department.findOne({
                    where: {
                        domain_id: user.domain_id,
                        department_name: p_department_name,
                        state: 1
                    }
                });
                if (!department)
                    return common.sendError(res, '',`第${i}行,上级部门名称${p_department_name}不存在`);
            }
            if (department_plan_num) {
                if(!validator.isInt(`${department_plan_num}`))
                    return common.sendError(res, '',`第${i}行,部门编制${department_plan_num}必须为整数`);
            }
            if (department_level) {
                if(!validator.isInt(`${department_level}`))
                    return common.sendError(res, '',`第${i}行,所属管理架构层级${department_level}必须为整数`);
            } else {
                return common.sendError(res, '',`第${i}行,所属管理架构层级不能为空`);
            }

        }

        await common.transaction(async function (t) {
            for (let i=2; i<=excelJsonArray.length+1; i++) {
                // const [department_name,department_type_text,p_department_id,p_department_name,department_plan_num,
                //     department_level] = Object.entries(itemData);
                const department_name = worksheet['A'+i] ? worksheet['A'+i].v : null;
                const department_type_text = worksheet['B'+i] ? worksheet['B'+i].v : null;
                // const p_department_id = worksheet['C'+i] ? worksheet['C'+i].v : null;
                const p_department_name = worksheet['C'+i] ? worksheet['C'+i].v : null;
                const department_plan_num = worksheet['D'+i] ? worksheet['D'+i].v : null;
                const department_level = worksheet['E'+i] ? worksheet['E'+i].v : null;
                let department_no = await Sequence.genDepartmentID();

                const department = await tb_department.findOne({
                    where: {
                        domain_id: user.domain_id,
                        department_name: p_department_name,
                        state: 1
                    }
                });

                await tb_department.create({
                    department_id: department_no,
                    domain_id: user.domain_id,
                    department_name:department_name,
                    p_department_id: department ? department.department_id : null,
                    department_level: department_level * 1,
                    department_state: 1,
                    department_plan_num: department_plan_num * 1,
                    department_type:getId(GLBConfig.DEPARTTYPE,department_type_text)
                },{
                    transaction: t
                });
            }
        });

        common.sendData(res, '导入成功！');
    } catch (error) {
        common.sendError(res, '', error.message);
    }
}

async function importDepartment(req, res) {
    try {
        const { user, body } = req;
        const { domain_id } = user;
        const worksheet = trimJson(await common.exceltojson(body.uploadurl));
        const excelJsonArray = XLSX.utils.sheet_to_json(worksheet);
        const departmentArray = [];
        for (let i = 2; i <= excelJsonArray.length + 1; i++) {
            const department_name = worksheet['A'+i] ? worksheet['A'+i].v : null;
            const department_type_text = worksheet['B'+i] ? worksheet['B'+i].v : null;
            const p_department_name = worksheet['C'+i] ? worksheet['C'+i].v : null;
            let department_plan_num = worksheet['D'+i] ? worksheet['D'+i].v : null;
            let department_level = worksheet['E'+i] ? worksheet['E'+i].v : null;

            department_plan_num = parseInt(department_plan_num);
            department_level = parseInt(department_level);

            if (!department_name) {
                return common.sendError(res, '',`第${i}行,部门名称不允许为空`);
            }
            if (!department_type_text) {
                return common.sendError(res, '',`第${i}行,部门类型不允许为空`);
            } else {
                const isExist = GLBConfig.DEPARTTYPE.some(item => (item.text === department_type_text));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,部门类型${department_type_text}不存在`);
            }
            if (department_level) {
                if(!validator.isInt(`${department_level}`))
                    return common.sendError(res, '',`第${i}行,所属管理架构层级${department_level}必须为整数`);
            } else {
                return common.sendError(res, '',`第${i}行,所属管理架构层级不能为空`);
            }
            if (department_plan_num) {
                if(!validator.isInt(`${department_plan_num}`))
                    return common.sendError(res, '',`第${i}行,部门编制${department_plan_num}必须为整数`);
            }

            departmentArray.push({
                excelLine: i - 1,
                department_name,
                department_type_text,
                p_department_name,
                department_plan_num: isNaN(department_plan_num) ? null : department_plan_num,
                department_level: parseInt(department_level)
            });
        }

        const levelSet = new Set(departmentArray.map(item => item.department_level));
        //遍历部门级别
        for (const dptLevel of levelSet.values()) {
            //筛选当前级别的部门
            const filterDptArray = departmentArray.filter(item => item.department_level === dptLevel);
            console.log(filterDptArray);

            await sequelize.transaction(async transaction => {
                try {
                    for (const dptData of filterDptArray) {
                        await transactionImportDepartment(transaction, domain_id, dptLevel, dptData);
                    }
                } catch (error) {
                    throw error
                }
            });
        }

        common.sendData(res, '导入成功！');
    } catch (error) {
        common.sendError(res, '', error.message);
    }
}

async function transactionImportDepartment(transaction, domain_id, dptLevel, dptData) {
    let parentDepartment = null;
    const {
        excelLine, department_name, department_type_text, p_department_name, department_plan_num, department_level
    } = dptData;

    if (dptLevel > 1) {
        //如果不是一级部门
        if (p_department_name) {
            //如果表中有上级部门
            parentDepartment = await tb_department.findOne({
                where: {
                    domain_id,
                    department_name: p_department_name,
                    state: 1
                }
            });

            if (!parentDepartment) {
                throw new Error(`第${excelLine}行, 【${department_level}】部门【${department_name}】的上级部门名称【${p_department_name}】未找到`);
            }
        } else {
            throw new Error(`第${excelLine}行, ${department_level}】部门【${department_name}】的上级部门名称不允许为空`);
        }
    }

    //如果数据库中有上级部门，则创建部门
    const department = await tb_department.findOne({
        where: {
            domain_id,
            department_name,
            state: 1
        }
    });

    if (department) {
        throw new Error(`第${excelLine}行, 【${department_name}】已存在`);
    } else {
        const department_id = await Sequence.genDepartmentID();
        let p_department_id = null;
        if (parentDepartment && dptLevel > 1) {
            p_department_id = parentDepartment.department_id;
        }

        await tb_department.create({
            department_id,
            domain_id,
            department_name,
            department_level,
            department_state: 1,
            department_plan_num,
            department_type: getId(GLBConfig.DEPARTTYPE, department_type_text),
            p_department_id
        }, {
            transaction
        });
    }
}

//岗位基本资料
async function importPosition(req, res) {
    try {
        const { user, body } = req;
        const worksheet = trimJson(await common.exceltojson(body.uploadurl));
        const excelJsonArray = XLSX.utils.sheet_to_json(worksheet);
        for(let i=2; i<=excelJsonArray.length+1; i++){
            // const itemData = excelJsonArray[i];
            // const [position_name,department_id,department_name,department_plan_num,position_require,salary_type,base_salary,
            //     capacity_salary,performance_salary,actual_salary,department_actual_num,usergroup_name] = Object.entries(itemData);

            const position_name = worksheet['A'+i] ? worksheet['A'+i].v : null;
            // const department_id = worksheet['B'+i] ? worksheet['B'+i].v : null;
            const department_name = worksheet['B'+i] ? worksheet['B'+i].v : null;
            const department_plan_num = worksheet['C'+i] ? worksheet['C'+i].v : null;
            const position_require = worksheet['D'+i] ? worksheet['D'+i].v : null;
            const salary_type = worksheet['E'+i] ? worksheet['E'+i].v : null;
            const base_salary = worksheet['F'+i] ? worksheet['F'+i].v : null;
            const capacity_salary = worksheet['G'+i] ? worksheet['G'+i].v : null;
            const performance_salary = worksheet['H'+i] ? worksheet['H'+i].v : null;
            const actual_salary = worksheet['I'+i] ? worksheet['I'+i].v : null;
            const department_actual_num = worksheet['J'+i] ? worksheet['J'+i].v : null;
            const usergroup_name = worksheet['K'+i] ? worksheet['K'+i].v : null;

            if (!position_name) {
                return common.sendError(res, '',`第${i}行,岗位名称不允许为空`);
            }
            if (!department_name) {
                return common.sendError(res, '',`第${i}行,所属部门名称不允许为空`);
            } else {
                const department = await tb_department.findOne({
                    where: {
                        department_name,
                        domain_id: user.domain_id,
                        state: 1
                    }
                });
                if (!department)
                    return common.sendError(res, '',`第${i}行,所属部门名称'${department_name}'不存在`);
            }
            if (department_plan_num) {
                if(!validator.isInt(`${department_plan_num}`))
                    return common.sendError(res, '',`第${i}行,岗位编制${department_plan_num}必须为整数`);
            }
            if (salary_type) {
                const isExist = GLBConfig.SALARYTYPE.some(item => (item.text === salary_type));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,计薪方式${salary_type}不存在`);
            }
            if (base_salary) {
                if(!validator.isFloat(`${base_salary}`))
                    return common.sendError(res, '',`第${i}行,岗位基本工资标准${base_salary}必须为数字`);
            }
            if (capacity_salary) {
                if(!validator.isFloat(`${capacity_salary}`))
                    return common.sendError(res, '',`第${i}行,岗位能力工资标准${capacity_salary}必须为数字`);
            }
            if (performance_salary) {
                if(!validator.isFloat(`${performance_salary}`))
                    return common.sendError(res, '',`第${i}行,岗位绩效工资标准${performance_salary}必须为数字`);
            }
            if (department_actual_num) {
                if(!validator.isInt(`${department_actual_num}`))
                    return common.sendError(res, '',`第${i}行,岗位实有人数${department_actual_num}必须为整数`);
            }
            if (!usergroup_name) {
                return common.sendError(res, '',`第${i}行,对应角色不允许为空`);
            } else {
                const groupmenus = await tb_common_usergroup.findOne({
                    where: {
                        domain_id: user.domain_id,
                        usergroup_name: usergroup_name,
                        state: 1
                    }
                });
                if (!groupmenus)
                    return common.sendError(res, '', `第${i}行,对应角色${usergroup_name}不存在`);
            }
        }

        await common.transaction(async function (t) {
            for(let i=2; i<=excelJsonArray.length+1; i++){
                // const [position_name,department_id,department_name,department_plan_num,position_require,salary_type,base_salary,
                //     capacity_salary,performance_salary,actual_salary,department_actual_num,usergroup_name] = Object.entries(itemData);
                const position_name = worksheet['A'+i] ? worksheet['A'+i].v : null;
                // const department_id = worksheet['B'+i] ? worksheet['B'+i].v : null;
                const department_name = worksheet['B'+i] ? worksheet['B'+i].v : null;
                const department_plan_num = worksheet['C'+i] ? worksheet['C'+i].v : null;
                const position_require = worksheet['D'+i] ? worksheet['D'+i].v : null;
                const salary_type = worksheet['E'+i] ? worksheet['E'+i].v : null;
                const base_salary = worksheet['F'+i] ? worksheet['F'+i].v : null;
                const capacity_salary = worksheet['G'+i] ? worksheet['G'+i].v : null;
                const performance_salary = worksheet['H'+i] ? worksheet['H'+i].v : null;
                const actual_salary = worksheet['I'+i] ? worksheet['I'+i].v : null;
                const department_actual_num = worksheet['J'+i] ? worksheet['J'+i].v : null;
                const usergroup_name = worksheet['K'+i] ? worksheet['K'+i].v : null;

                const department = await tb_department.findOne({
                    where: {
                        domain_id: user.domain_id,
                        state: 1,
                        department_name
                    }
                });

                const groupmenus = await tb_common_usergroup.findOne({
                    where: {
                        domain_id: user.domain_id,
                        usergroup_name: usergroup_name,
                        state: 1
                    }
                });
                const position_id = await Sequence.genPositionID();
                await tb_position.create({
                    position_id: position_id,
                    domain_id: user.domain_id,
                    usergroup_id:groupmenus.usergroup_id,//角色id
                    department_id: department.department_id,//所属部门
                    position_name: position_name,//岗位名称
                    department_plan_num: department_plan_num * 1,//岗位编制
                    position_require: position_require,//岗位能力要求
                    salary_type: getId(GLBConfig.SALETYPE,salary_type),//计薪方式
                    base_salary: base_salary * 100,//岗位基本工资标准
                    capacity_salary: capacity_salary * 100,//岗位能力工资标准
                    performance_salary: performance_salary * 100,//岗位绩效工资标准
                    actual_salary: base_salary * 100 + capacity_salary * 100 + performance_salary * 100, //岗位工资标准
                    department_actual_num: department_actual_num * 1,//岗位实有人数
                },{
                    transaction: t
                });
            }
        });

        common.sendData(res, '导入成功');
    } catch (error) {
        common.sendError(res, '', error.message);
    }
}

//员工基本信息
async function importEmployee(req, res) {
    try {
        const { user, body } = req;
        const worksheet = trimJson(await common.exceltojson(body.uploadurl));
        const excelJsonArray = XLSX.utils.sheet_to_json(worksheet);

        for (let i=2; i<=excelJsonArray.length+1; i++) {
            const name = worksheet['A'+i] ? worksheet['A'+i].v : null;
            const gender = worksheet['B'+i] ? worksheet['B'+i].v : null;
            const idcarde_no = worksheet['C'+i] ? worksheet['C'+i].v : null;
            const marital_status = worksheet['D'+i] ? worksheet['D'+i].v : null;
            const phone = worksheet['E'+i] ? worksheet['E'+i].v : null;
            const qq_no = worksheet['F'+i] ? worksheet['F'+i].v : null;
            const wechat_no = worksheet['G'+i] ? worksheet['G'+i].v : null;
            const emergency_contact_person = worksheet['H'+i] ? worksheet['H'+i].v : null;
            const emergency_contact_phone = worksheet['I'+i] ? worksheet['I'+i].v : null;
            const living_place = worksheet['J'+i] ? worksheet['J'+i].v : null;
            const education = worksheet['K'+i] ? worksheet['K'+i].v : null;
            const professional_qualification = worksheet['L'+i] ? worksheet['L'+i].v : null;
            // const department_id = worksheet['M'+i] ? worksheet['M'+i].v : null;
            const department_name = worksheet['M'+i] ? worksheet['M'+i].v : null;
            const position_name = worksheet['N'+i] ? worksheet['N'+i].v : null;
            const entry_date = worksheet['O'+i] ? worksheet['O'+i].w : null;
            const user_form = worksheet['P'+i] ? worksheet['P'+i].v : null;
            const base_salary = worksheet['Q'+i] ? worksheet['Q'+i].v : null;
            const capacity_salary = worksheet['R'+i] ? worksheet['R'+i].v : null;
            const performance_salary = worksheet['S'+i] ? worksheet['S'+i].v : null;
            const total_salary = worksheet['T'+i] ? worksheet['T'+i].v : null;
            const graduate_institution = worksheet['U'+i] ? worksheet['U'+i].v : null;
            const customer_reimburserank_name = worksheet['V'+i] ? worksheet['V'+i].v : null;
            const deposit_bank = worksheet['W'+i] ? worksheet['W'+i].v : null;
            const bank_account = worksheet['X'+i] ? worksheet['X'+i].v : null;



            // const itemData = excelJsonArray[i];
            // const [
            //     name, gender,idcarde_no, marital_status, phone, qq_no, wechat_no, emergency_contact_person, emergency_contact_phone,
            //     living_place, education, professional_qualification, department_id, position_name, entry_date, user_form,base_salary,
            //     capacity_salary,performance_salary,total_salary, graduate_institution, customer_reimburserank_name, deposit_bank, bank_account
            // ] = Object.entries(itemData);

            if (!name) {
                return common.sendError(res, '',`第${i}行,员工姓名不允许为空`);
            }
            if (!gender) {
                return common.sendError(res, '',`第${i}行,员工性别不允许为空`);
            } else {
                const isExist = GLBConfig.GENDERTYPE.some(item => (item.text === gender));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,员工性别${gender}不存在`);
            }
            if (marital_status && marital_status !== '未婚' && marital_status !== '已婚') {
                return common.sendError(res, '',`第${i}行,婚姻状态您输入的是${marital_status}只能输入'已婚'或'未婚'`);
            }
            if (education) {
                const isExist = GLBConfig.EDUCATION.some(item => (item.text === education));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,学历${education}不存在`);
            }
            if(!phone) {
                return common.sendError(res, '',`第${i}行,手机号不允许为空`);
            }
            let department = null;
            if (department_name) {
                department = await tb_department.findOne({
                    where: {
                        department_name,
                        domain_id: user.domain_id,
                        state: 1
                    }
                });
                if (!department)
                    return common.sendError(res, '',`第${i}行,属部门名称'${department_name}'不存在`);
            }
            if (position_name && department) {
                const { department_id } = department;
                const position = await tb_position.findOne({
                    where: {
                        position_name,
                        department_id,
                        domain_id: user.domain_id,
                        state: 1
                    }
                });
                if (!position) {
                    return common.sendError(res, '',`第${i}行,属部门编号${department_id}下所属岗位'${position_name}'不存在`);
                }
            } else {
                return common.sendError(res, '',`第${i}行,所属岗位不允许为空`);
            }

            if (!entry_date) {
                return common.sendError(res, '',`第${i}行,入职日期不允许为空`);
            } else {
                if(!common.checkDate(entry_date))
                    return common.sendError(res, '',`第${i}行,入职日期'${entry_date}'格式不正确,请输入YYYY-MM-DD格式`);
            }
            if (!user_form) {
                return common.sendError(res, '',`第${i}行,计酬方式不允许为空`);
            } else {
                const isExist = GLBConfig.SALARYTYPE.some(item => (item.text === user_form));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,计酬方式${user_form}不存在`);
            }
            if (base_salary) {
                if(!validator.isFloat(`${base_salary}`))
                    return common.sendError(res, '',`第${i}行,岗位基本工资标准${base_salary}必须为数字`);
            }
            if (capacity_salary) {
                if(!validator.isFloat(`${capacity_salary}`))
                    return common.sendError(res, '',`第${i}行,岗位能力工资标准${capacity_salary}必须为数字`);
            }
            if (performance_salary) {
                if(!validator.isFloat(`${performance_salary}`))
                    return common.sendError(res, '',`第${i}行,岗位绩效工资标准${performance_salary}必须为数字`);
            }
            if (customer_reimburserank_name) {
                const reimburserank = await tb_reimburserank.findOne({
                    where: {
                        reimburserank_name: customer_reimburserank_name,
                        domain_id: user.domain_id,
                        state: 1
                    }
                });
                if (!reimburserank)
                    return common.sendError(res, '',`第${i}行,报销职级${customer_reimburserank_name}不存在`);
            }
        }
        //控制事物
        await common.transaction(async function (t) {
            for (let i=2; i<=excelJsonArray.length+1; i++) {

                const name = worksheet['A'+i] ? worksheet['A'+i].v : null;
                const gender = worksheet['B'+i] ? worksheet['B'+i].v : null;
                const idcarde_no = worksheet['C'+i] ? worksheet['C'+i].v : null;
                const marital_status = worksheet['D'+i] ? worksheet['D'+i].v : null;
                const phone = worksheet['E'+i] ? worksheet['E'+i].v : null;
                const qq_no = worksheet['F'+i] ? worksheet['F'+i].v : null;
                const wechat_no = worksheet['G'+i] ? worksheet['G'+i].v : null;
                const emergency_contact_person = worksheet['H'+i] ? worksheet['H'+i].v : null;
                const emergency_contact_phone = worksheet['I'+i] ? worksheet['I'+i].v : null;
                const living_place = worksheet['J'+i] ? worksheet['J'+i].v : null;
                const education = worksheet['K'+i] ? worksheet['K'+i].v : null;
                const professional_qualification = worksheet['L'+i] ? worksheet['L'+i].v : null;
                // const department_id = worksheet['M'+i] ? worksheet['M'+i].v : null;
                const department_name = worksheet['M'+i] ? worksheet['M'+i].v : null;
                const position_name = worksheet['N'+i] ? worksheet['N'+i].v : null;
                const entry_date = worksheet['O'+i] ? worksheet['O'+i].w : null;
                const user_form = worksheet['P'+i] ? worksheet['P'+i].v : null;
                const base_salary = worksheet['Q'+i] ? worksheet['Q'+i].v : null;
                const capacity_salary = worksheet['R'+i] ? worksheet['R'+i].v : null;
                const performance_salary = worksheet['S'+i] ? worksheet['S'+i].v : null;
                const total_salary = worksheet['T'+i] ? worksheet['T'+i].v : null;
                const graduate_institution = worksheet['U'+i] ? worksheet['U'+i].v : null;
                const customer_reimburserank_name = worksheet['V'+i] ? worksheet['V'+i].v : null;
                const deposit_bank = worksheet['W'+i] ? worksheet['W'+i].v : null;
                const bank_account = worksheet['X'+i] ? worksheet['X'+i].v : null;

                // const [
                //     name, gender,idcarde_no, marital_status, phone, qq_no, wechat_no, emergency_contact_person, emergency_contact_phone,
                //     living_place, education, professional_qualification, department_id, position_name, entry_date, user_form,base_salary,
                //     capacity_salary,performance_salary,total_salary, graduate_institution, customer_reimburserank_name, deposit_bank, bank_account
                // ] = Object.entries(itemData1);

                const department = await tb_department.findOne({
                    where: {
                        department_name,
                        domain_id: user.domain_id,
                        state: 1
                    }
                });

                const position = await tb_position.findOne({
                    where: {
                        position_name: position_name,
                        department_id: department.department_id,
                        domain_id: user.domain_id,
                        state: 1
                    }
                });
                const usergroup = await tb_common_usergroup.findOne({
                    where: {
                        usergroup_id: position.usergroup_id
                    }
                });
                const reimburserank = await tb_reimburserank.findOne({
                    where: {
                        reimburserank_name: customer_reimburserank_name,
                        domain_id: user.domain_id,
                        state: 1
                    }
                });

                let user_id = await Sequence.genUserID();
                let existUser = await tb_user.findOne({
                    where: {
                        user_id: user_id
                    }
                });

                let index = 0;
                while (existUser && index < 5) {
                    user_id = await Sequence.genUserID();
                    existUser = await tb_user.findOne({
                        where: {
                            user_id: user_id
                        }
                    });
                    index++
                }
                if (existUser) {
                    return common.sendError(res, '',`员工号${existUser}重复,请联系管理员！`);
                }

                await tb_user.create({
                    user_id: user_id,
                    domain_id: user.domain_id,
                    usergroup_id: position.usergroup_id,
                    username: user_id,
                    password: GLBConfig.INITPASSWORD,
                    name: name,
                    gender: getId(GLBConfig.GENDERTYPE,gender),
                    user_type: usergroup.usergroup_type,
                    phone: phone,//手机号
                }, {
                    transaction: t
                });
                await tb_customer.create({
                    user_id: user_id,
                    entry_date:entry_date,//入职日期
                    user_form:getId(GLBConfig.SALARYTYPE,user_form),//计酬方式
                    gender: getId(GLBConfig.GENDERTYPE,gender),//性别
                    idcarde_no: idcarde_no,//身份证
                    marital_status: getId(GLBConfig.MARITALSTATUS,marital_status),//婚否
                    qq_no: qq_no,//QQ
                    wechat_no: wechat_no,//微信
                    emergency_contact_person: emergency_contact_person,//紧急联系人
                    emergency_contact_phone: emergency_contact_phone,//紧急联系人手机号
                    living_place: living_place,//家庭地址
                    education: getId(GLBConfig.EDUCATION,education),//学历
                    professional_qualification: professional_qualification,//专业资质
                    graduate_institution: graduate_institution,//毕业院校
                    customer_reimburserank_id: reimburserank ? reimburserank.reimburserank_id : null,//报销职级
                }, {
                    transaction: t
                });

                //添加会计科目详情
                await addAccountingDetail(1231,user_id,user.domain_id, t, '3');
                await addAccountingDetail(2241,user_id,user.domain_id, t, '3');

                await tb_user_contract.create({
                    user_id: user_id,
                    contract_name:`${name}的合同`,
                    base_salary: base_salary * 100,//核定的基础工资
                    capacity_salary: capacity_salary * 100,//核定的能力工资
                    performance_salary: performance_salary * 100,//核定的绩效工资
                    total_salary: base_salary * 100 + capacity_salary * 100 + performance_salary * 100, //核定的工资总额
                    deposit_bank: deposit_bank,//发工资账号开户行
                    bank_account: bank_account,//发工资银行账号
                    contract_state:1
                }, {
                    transaction: t
                });
                await tb_cg.create({
                    user_id: user_id,
                    department_id:department.department_id,//所属部门编号
                    position_id:position.position_id//所属岗位
                }, {
                    transaction: t
                });
            }
        });
        common.sendData(res, '导入成功');
    } catch (error) {
        common.sendError(res, '', error.message);
    }
}



//12 导入员工工作经验
async function importEmployeeHandsOnbackground(req, res) {
    try {
        const { user, body } = req;
        const worksheet = trimJson(await common.exceltojson(body.uploadurl));
        const excelJsonArray = XLSX.utils.sheet_to_json(worksheet);
        for (let i=2; i<=excelJsonArray.length+1; i++) {
            // const itemData = excelJsonArray[i];
            // const [user_id,experience_start_date,experience_end_date, experience_remark,position_name,witness, witness_phone] = Object.entries(itemData);
            const user_id = worksheet['A'+i] ? worksheet['A'+i].v : null;
            const experience_start_date = worksheet['B'+i] ? worksheet['B'+i].w : null;
            const experience_end_date = worksheet['C'+i] ? worksheet['C'+i].w : null;
            const experience_remark = worksheet['D'+i] ? worksheet['D'+i].v : null;
            const position_name = worksheet['E'+i] ? worksheet['E'+i].v : null;
            const witness = worksheet['F'+i] ? worksheet['F'+i].v : null;
            const witness_phone = worksheet['G'+i] ? worksheet['G'+i].v : null;

            if (!user_id) {
                return common.sendError(res, '',`第${i}行,工号不允许为空`);
            } else {
                const em = await tb_customer.findOne({
                    user_id: user_id,
                    state: 1,
                    domain_id: user.domain_id
                });
                if (!em)
                    return common.sendError(res, '',`第${i}行,工号${user_id}不存在`);
            }
            if (experience_start_date) {
                if(!common.checkDate(experience_start_date))
                    return common.sendError(res, '',`第${i}行,开始时间'${experience_start_date}'格式不正确,请输入YYYY-MM-DD格式`);
            }
            if (experience_end_date) {
                if(!common.checkDate(experience_end_date))
                    return common.sendError(res, '',`第${i}行,结束时间'${experience_end_date}'格式不正确,请输入YYYY-MM-DD格式`);
            }
            if (!position_name) {
                return common.sendError(res, '',`第${i}行,工作经历岗位不允许为空`);
            }

        }
        //控制事物
        await common.transaction(async function (t) {
            for (let i=2; i<=excelJsonArray.length+1; i++) {
                // const [user_id,experience_start_date,experience_end_date, experience_remark,position_name,witness, witness_phone] = Object.entries(itemData1);
                const user_id = worksheet['A'+i] ? worksheet['A'+i].v : null;
                const experience_start_date = worksheet['B'+i] ? worksheet['B'+i].w : null;
                const experience_end_date = worksheet['C'+i] ? worksheet['C'+i].w : null;
                const experience_remark = worksheet['D'+i] ? worksheet['D'+i].v : null;
                const position_name = worksheet['E'+i] ? worksheet['E'+i].v : null;
                const witness = worksheet['F'+i] ? worksheet['F'+i].v : null;
                const witness_phone = worksheet['G'+i] ? worksheet['G'+i].v : null;

                await tb_customerworkexperience.create({
                    user_id: user_id,//工号
                    experience_start_date: experience_start_date,//开始时间
                    experience_end_date: experience_end_date,//结束时间
                    experience_remark: experience_remark,//工作经历描述
                    position_name: position_name,//工作经历岗位
                    witness: witness,//工作经历证明人
                    witness_phone: witness_phone//工作经历证明人手机
                },{
                    transaction: t
                });
            }
        });

        common.sendData(res, '导入成功！');
    } catch (error) {
        common.sendError(res, '', error.message);
    }
}

//16 导入企业客户
async function importCorporate(req, res) {

    try {
        const { user, body } = req;
        const worksheet = trimJson(await common.exceltojson(body.uploadurl));
        const excelJsonArray = XLSX.utils.sheet_to_json(worksheet);
        const  JGTX= await getPriceTemplate(req.user)
        for (let i=2; i<=excelJsonArray.length+1; i++) {
            // const itemData = excelJsonArray[i];
            // const [corporateclients_no,name,corporateclients_class, address,phone,corporateclients_type, invoice_type,lcontact,
            //     way, settlement,corporateclients_advance_ratio,corporateclients_scope,corporateclients_creditline] = Object.entries(itemData);

            const corporateclients_no = worksheet['A'+i] ? worksheet['A'+i].v : null;
            const name = worksheet['B'+i] ? worksheet['B'+i].v : null;
            const corporateclients_class = worksheet['C'+i] ? worksheet['C'+i].v : null;
            const address = worksheet['D'+i] ? worksheet['D'+i].v : null;
            const phone = worksheet['E'+i] ? worksheet['E'+i].v : null;
            const corporateclients_type = worksheet['F'+i] ? worksheet['F'+i].v : null;
            const invoice_type = worksheet['G'+i] ? worksheet['G'+i].v : null;
            const lcontact = worksheet['H'+i] ? worksheet['H'+i].v : null;
            const way = worksheet['I'+i] ? worksheet['I'+i].v : null;
            const settlement = worksheet['J'+i] ? worksheet['J'+i].v : null;
            const corporateclients_advance_ratio = worksheet['K'+i] ? worksheet['K'+i].v : null;
            const corporateclients_scope = worksheet['L'+i] ? worksheet['L'+i].v : null;
            const corporateclients_creditline = worksheet['M'+i] ? worksheet['M'+i].v : null;

            if (!corporateclients_no) {
                return common.sendError(res, '',`第${i}行,工商注册号不允许为空`);
            }
            if (!name) {
                return common.sendError(res, '',`第${i}行,客户全称不允许为空`);
            } else {
                const custorgstructure = await tb_custorgstructure.findOne({
                    where: {
                        corporateclients_name: name,
                        domain_id: user.domain_id,
                        state: 1
                    }
                });
                if (custorgstructure) {//客户已存在
                    return common.sendError(res, '',`第${i}行,客户${name}已存在`);
                }
            }
            if (!corporateclients_class) {
                return common.sendError(res, '',`第${i}行,客户类别不允许为空`);
            } else {
                const isExist = GLBConfig.CORPORATECLIENTSCLASS.some(item => (item.text === corporateclients_class));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,客户类别${corporateclients_class}不存在`);
            }
            if (invoice_type && invoice_type != 0 && invoice_type != 1) {
                return common.sendError(res, '',`第${i}行,客户适用发票类型只能是0或1`);
            }

            if(settlement){
                if(!validator.isInt(`${settlement}`))
                    return common.sendError(res, '',`第${i}行,月结天数${settlement}必须为整数`);
            }
            if(corporateclients_advance_ratio) {
                if(!validator.isFloat(`${corporateclients_advance_ratio}`))
                    return common.sendError(res, '',`第${i}行,预付比例${corporateclients_advance_ratio}必须为数字`);
            }
            if(corporateclients_creditline) {
                if(!validator.isFloat(`${corporateclients_creditline}`))
                    return common.sendError(res, '',`第${i}行,额度上限${corporateclients_creditline}必须为数字`);
            }
            if (corporateclients_scope && corporateclients_scope != 0 && corporateclients_scope != 1) {
                return common.sendError(res, '',`第${i}行,额度范围只能是0或1`);
            }

            if (corporateclients_type) {
                const isExist = JGTX.some(item => (item.text === corporateclients_type));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,价格体系级别${corporateclients_type}不存在`);
            }
            if (way) {
                let baseType = await tb_basetypedetail.findOne({
                   where: {
                       typedetail_name: way
                   }
                });
                if (!baseType) {
                    return common.sendError(res, '',`第${i}行,结算方式${way}未找到`);
                }
            }
        }

        //控制事物
        await common.transaction(async function (t) {
            for (let i=2; i<=excelJsonArray.length+1; i++) {
                // const [corporateclients_no,name,corporateclients_class, address,phone,corporateclients_type, invoice_type,
                // lcontact,way, settlement, corporateclients_advance_ratio,corporateclients_scope,corporateclients_creditline] = Object.entries(itemData1);

                const corporateclients_no = worksheet['A'+i] ? worksheet['A'+i].v : null;
                const name = worksheet['B'+i] ? worksheet['B'+i].v : null;
                const corporateclients_class = worksheet['C'+i] ? worksheet['C'+i].v : null;
                const address = worksheet['D'+i] ? worksheet['D'+i].v : null;
                const phone = worksheet['E'+i] ? worksheet['E'+i].v : null;
                const corporateclients_type = worksheet['F'+i] ? worksheet['F'+i].v : null;
                const invoice_type = worksheet['G'+i] ? worksheet['G'+i].v : null;
                const lcontact = worksheet['H'+i] ? worksheet['H'+i].v : null;
                const way = worksheet['I'+i] ? worksheet['I'+i].v : null;
                const settlement = worksheet['J'+i] ? worksheet['J'+i].v : null;
                const corporateclients_advance_ratio = worksheet['K'+i] ? worksheet['K'+i].v : null;
                const corporateclients_scope = worksheet['L'+i] ? worksheet['L'+i].v : null;
                const corporateclients_creditline = worksheet['M'+i] ? worksheet['M'+i].v : null;

                const corporateclients_type_exist = JGTX.find(item => (item.text === corporateclients_type));

                let baseType = await tb_basetypedetail.findOne({
                    where: {
                        typedetail_name: way
                    }
                });
                let settlement_way = baseType.basetypedetail_id;
                const corporateclients = await tb_custorgstructure.create({
                    corporateclients_no:corporateclients_no,//工商注册号
                    domain_id:user.domain_id,
                    corporateclients_name:name,//客户名称
                    corporateclients_class: getId(GLBConfig.CORPORATECLIENTSCLASS,corporateclients_class),//客户类型
                    corporateclients_type: corporateclients_type_exist ? corporateclients_type_exist.id : null,//价格体系
                    invoice_type: invoice_type,//发票类型
                    corporateclients_address:address,//客户地址
                    corporateclients_contact_phone:phone,//联系人电话
                    corporateclients_legal_person:lcontact,//法人姓名
                    corporateclients_number_days:settlement * 1,//月结天数
                    corporateclients_way:settlement_way,//结算方式
                    corporateclients_advance_ratio:corporateclients_advance_ratio * 1,//预付比例
                    corporateclients_scope:corporateclients_scope,//额度范围
                    corporateclients_creditline:corporateclients_creditline * 1,//额度上限
                },{
                    transaction: t
                });

                //添加会计科目详情
                await addAccountingDetail(1122, corporateclients.corporateclients_id, user.domain_id, t, '1');
                await addAccountingDetail(1231, corporateclients.corporateclients_id, user.domain_id, t, '1');
                await addAccountingDetail(2241, corporateclients.corporateclients_id ,user.domain_id, t, '1');
            }
        });

        common.sendData(res, '导入成功！');
    } catch (error) {
        common.sendError(res, '', error.message);
    }
}

//17 导入生产设备
async function importProductDevice(req, res) {
    try {
        const { user, body } = req;
        const worksheet = trimJson(await common.exceltojson(body.uploadurl));
        const excelJsonArray = XLSX.utils.sheet_to_json(worksheet);
        for (let i=2; i<=excelJsonArray.length+1; i++) {
            // const itemData = excelJsonArray[i];
            // const [fixedassetsdetail_no,name,format,unit,hour_capacity,work_time,device_level] = Object.entries(itemData);
            const fixedassetsdetail_no = worksheet['A'+i] ? worksheet['A'+i].v : null;
            const name = worksheet['B'+i] ? worksheet['B'+i].v : null;
            const format = worksheet['C'+i] ? worksheet['C'+i].v : null;
            const unit = worksheet['D'+i] ? worksheet['D'+i].v : null;
            // const hour_capacity = worksheet['E'+i] ? worksheet['E'+i].v : null;
            // const work_time = worksheet['F'+i] ? worksheet['F'+i].v : null;
            const device_level = worksheet['E'+i] ? worksheet['E'+i].v : null;

            if (!fixedassetsdetail_no) {
                return common.sendError(res, '',`第${i}行,固定资产编码不能为空！`);
            } else {
                /*const fixedassetscheckdetail = await tb_fixedassetscheckdetail.findOne({
                    where:{
                        fixedassets_no: fixedassetsdetail_no
                    }
                });*/

                const [ fixedassetscheckdetail ] = await getFixedAssetsForImportDevice({ domain_id: user.domain_id, fixedassets_no: fixedassetsdetail_no });

                if (!fixedassetscheckdetail)
                    return common.sendError(res, '',`第${i}行,固定资产编码'${fixedassetsdetail_no}'不存在！`);
            }
            /*if (!hour_capacity) {
                return common.sendError(res, '',`第${i}行,每小时产能不能为空！`);
            } else {
                if(!validator.isInt(`${hour_capacity}`))
                    return common.sendError(res, '',`第${i}行,每小时产能${hour_capacity}必须为整数`);
            }
            if (!work_time) {
                return common.sendError(res, '',`第${i}行,每天工作时间不能为空！`);
            } else {
                if(!validator.isInt(`${work_time}`))
                    return common.sendError(res, '',`第${i}行,每天工作时间${work_time}必须为整数`);
            }*/
            if (!device_level) {
                return common.sendError(res, '',`第${i}行,固定资产性质不能为空！`);
            } else {
                const isExist = GLBConfig.PRODUCTDEVICETYPE.some(item => (item.text === device_level));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,固定资产性质${device_level}不存在`);
            }
        }

        //控制事物
        await common.transaction(async function (t) {
            for (let i=2; i<=excelJsonArray.length+1; i++) {
                // const [fixedassetsdetail_no,name,format,unit,hour_capacity,work_time,device_level] = Object.entries(itemData1);
                const fixedassetsdetail_no = worksheet['A'+i] ? worksheet['A'+i].v : null;
                const name = worksheet['B'+i] ? worksheet['B'+i].v : null;
                const format = worksheet['C'+i] ? worksheet['C'+i].v : null;
                const unit = worksheet['D'+i] ? worksheet['D'+i].v : null;
                // const hour_capacity = worksheet['E'+i] ? worksheet['E'+i].v : null;
                // const work_time = worksheet['F'+i] ? worksheet['F'+i].v : null;
                const device_level = worksheet['E'+i] ? worksheet['E'+i].v : null;

                // const fixedassetscheckdetail = await tb_fixedassetscheckdetail.findOne({
                //     where:{
                //         fixedassets_no: fixedassetsdetail_no
                //     }
                // });

                const [ fixedassetscheckdetail ] = await getFixedAssetsForImportDevice({ domain_id: user.domain_id, fixedassets_no: fixedassetsdetail_no });

                await tb_productdevice.create({
                    fixedassetsdetail_id: fixedassetscheckdetail.fixedassetscheckdetail_id,
                    // hour_capacity: hour_capacity * 1,
                    // work_time: work_time * 1,
                    device_level: getId(GLBConfig.PRODUCTDEVICETYPE,device_level),
                    domain_id: user.domain_id,
                    // day_capacity: (hour_capacity * 1) * (work_time * 1)
                },{
                    transaction: t
                });
            }
        });

        common.sendData(res, '导入成功！');
    } catch (error) {
        common.sendError(res, '', error.message);
    }
}

async function getFixedAssets({domain_id, device_name, device_model, department_id, fixedassets_no}) {
    let queryStr =
        `select
            fad.fixedassetscheckdetail_id, fad.department_id
            from tbl_erc_productdevice pd
            left join tbl_erc_fixedassetscheckdetail fad
            on fad.fixedassetscheckdetail_id = pd.fixedassetsdetail_id
            left join tbl_erc_fixedassetscheck fac
            on fad.fixedassetscheck_id = fac.fixedassetscheck_id
            where true
            and fad.state = ?
            and fac.domain_id = ?`;

    const replacements = [ GLBConfig.ENABLE, domain_id ];

    if (device_name) {
        queryStr += ` and fad.fixedassets_name = ?`;
        replacements.push(device_name);
    }

    if (device_model) {
        queryStr += ` and fad.fixedassets_model = ?`;
        replacements.push(device_model);
    }

    if (department_id) {
        queryStr += ` and fad.department_id = ?`;
        replacements.push(department_id);
    }

    if (fixedassets_no) {
        queryStr += ` and fad.fixedassets_no = ?`;
        replacements.push(fixedassets_no);
    }

    return await common.simpleSelect(sequelize, queryStr, replacements);
}

async function getFixedAssetsForImportDevice({domain_id, department_id, fixedassets_no}) {
    let queryStr =
        `select
            fad.fixedassetscheckdetail_id, fad.department_id
            from tbl_erc_fixedassetscheckdetail fad
            left join tbl_erc_fixedassetscheck fac
            on fad.fixedassetscheck_id = fac.fixedassetscheck_id
            where true
            and fad.state = ?
            and fac.domain_id = ?`;

    const replacements = [ GLBConfig.ENABLE, domain_id ];

    if (department_id) {
        queryStr += ` and fad.department_id = ?`;
        replacements.push(department_id);
    }

    if (fixedassets_no) {
        queryStr += ` and fad.fixedassets_no = ?`;
        replacements.push(fixedassets_no);
    }

    return await common.simpleSelect(sequelize, queryStr, replacements);
}

//18 导入生产工序
async function importProductNode(req, res) {
    try {
        const { user, body } = req;
        const { domain_id } = user;
        const worksheet = trimJson(await common.exceltojson(body.uploadurl));
        const excelJsonArray = XLSX.utils.sheet_to_json(worksheet);
        // const procedureInfo = await getProcedureType(req, domain_id);
        const procedureInfo = await global.getBaseTypeInfo(domain_id, 'SCGXFL');

        for (let i=2; i<=excelJsonArray.length+1; i++) {
            const itemData = excelJsonArray[i];
            // const [procedure_name,procedure_type,procedure_cost] = Object.entries(itemData);
            const procedure_name = worksheet['A'+i] ? worksheet['A'+i].v : null;
            const procedure_type = worksheet['B'+i] ? worksheet['B'+i].v : null;
            const procedure_cost = worksheet['C'+i] ? worksheet['C'+i].v : null;
            const work_time = worksheet['H'+i] ? worksheet['H'+i].v : null;
            const default_capacity = worksheet['I'+i] ? worksheet['I'+i].v : 0;

            if (!procedure_name) {
                return common.sendError(res, '',`第${i}行,生产工序名称不能为空！`);
            } else {
                if (procedure_name.length > 30)
                    return common.sendError(res, '',`第${i}行,生产工序名称'${procedure_name}'不能超30字！`);
            }
            if (!procedure_cost) {
                return common.sendError(res, '',`第${i}行,生产工序工价不能为空！`);
            } else {
                if(!validator.isFloat(`${procedure_cost}`))
                    return common.sendError(res, '',`第${i}行,生产工序工价${procedure_cost}必须为数字`);
            }
            if (!procedure_type) {
                return common.sendError(res, '',`第${i}行,生产工序分类不能为空！`);
            } else {
                const isExist = procedureInfo.some(item => (item.text === procedure_type));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,生产工序分类${procedure_type}不存在`);
            }
            if (!work_time) {
                return common.sendError(res, '',`第${i}行,生产工序时长不能为空！`);
            }

            //根据工序名称创建工序
            const procedure = procedureInfo.find(item => (item.text === procedure_type));
            let productionProcedure = await tb_productionprocedure.findOne({
                where: {
                    domain_id,
                    procedure_name,
                    state: GLBConfig.ENABLE
                }
            });

            if (!productionProcedure) {
                productionProcedure = await tb_productionprocedure.create({
                    domain_id,
                    biz_code: await genBizCode(CODE_NAME.SCGX, domain_id, 6),
                    procedure_code: await Sequence.genProductionProcedureNo(),
                    procedure_name,                          //生产工序名称
                    procedure_type: procedure.id,                               //生产工序分类
                    procedure_cost: procedure_cost * 1,                        //生产工序工价
                    work_time,
                    default_capacity
                });
            } else if (i === 2) {
                productionProcedure.department_id = null;
                await productionProcedure.save();
            }

            //根据部门名称和类型查询车间
            const department_name = worksheet['D'+i] ? worksheet['D'+i].v : null;
            let department = null;
            if (department_name) {
                department = await tb_department.findOne({
                    where: {
                        domain_id,
                        department_name,
                        department_type: 0,
                        state: GLBConfig.ENABLE
                    }
                });

                //如果车间不存在则退出
                if (!department) {
                    return common.sendError(res, '',`第${i}行, 所属部门【${department_name}】不存在！`);
                }

                const { department_id } = department;

                if (productionProcedure.department_id) {
                    //如果工序中已经存入车间
                    if (productionProcedure.department_id !== department_id) {
                        //该工序的第二条记录的车间和已存入的车间不一致
                        return common.sendError(res, '',`第${i}行, 同一工序【${procedure_name}】所属部门【${department_name}】不相同`);
                    }
                } else {
                    //如果工序中没有车间然后绑定车间
                    productionProcedure.department_id = department_id;
                    await productionProcedure.save();
                }
            }

            //判断工序已经绑定正确的车间
            if (productionProcedure.department_id) {
                const device_name = worksheet['E'+i] ? worksheet['E'+i].v : null;
                const device_model = worksheet['F'+i] ? worksheet['F'+i].v : null;

                //判断设备名称和型号都存在
                if (device_name && device_model) {
                    const { department_id } = productionProcedure;
                    //根据生产设备名称、编号和部门查询固定资产数据
                    const [ fixedAssetsCheckDetail ] = await getFixedAssets({domain_id, device_name, device_model, department_id});
                    if (!fixedAssetsCheckDetail) {
                        return common.sendError(res, '',`第${i}行, 所属部门【${department_name}】的固定资产【${device_name} ${device_model}】不存在！`);
                    }

                    if (department_id !== fixedAssetsCheckDetail.department_id) {
                        const fixedAssetsDepartment = await tb_department.findOne({
                            where: {
                                department_id: fixedAssetsCheckDetail.department_id,
                                domain_id,
                                state: GLBConfig.ENABLE
                            }
                        });

                        if (fixedAssetsDepartment) {
                            return common.sendError(res, '',`第${i}行,工序所属车间【${department_name}】和固定资产所属车间${fixedAssetsDepartment.department_name}】不一致！`);
                        } else {
                            return common.sendError(res, '',`第${i}行,固定资产所属车间不存在！`);
                        }
                    }

                    const { fixedassetscheckdetail_id } = fixedAssetsCheckDetail;
                    const productDevice = await tb_productdevice.findOne({
                        where: {
                            fixedassetsdetail_id: fixedassetscheckdetail_id,
                            domain_id,
                            state: GLBConfig.ENABLE
                        }
                    });

                    if (!productDevice) {
                        return common.sendError(res, '',`第${i}行, 固定资产【${device_name} ${device_model}】不是生产设备！`);
                    }
                }
            }
        }

        await sequelize.transaction(async (trans) => {
            try {
                for (let i=2; i<=excelJsonArray.length+1; i++) {
                    // const [procedure_name,procedure_type,procedure_cost] = Object.entries(itemData1);
                    const procedure_name = worksheet['A'+i] ? worksheet['A'+i].v : null;
                    const productionProcedure = await tb_productionprocedure.findOne({
                        where: {
                            domain_id,
                            procedure_name,
                            state: GLBConfig.ENABLE
                        }
                    });

                    const department_name = worksheet['D'+i] ? worksheet['D'+i].v : null;
                    let department = null;
                    if (department_name) {
                        department = await tb_department.findOne({
                            where: {
                                domain_id,
                                department_name,
                                department_type: 0,
                                state: GLBConfig.ENABLE
                            }
                        });

                        if (!department) {
                            continue;
                        }

                        const { department_id } = department;

                        if (productionProcedure.department_id) {
                            if (productionProcedure.department_id !== department_id) {
                                continue;
                            }
                        } else {
                            productionProcedure.department_id = department_id;
                            await productionProcedure.save({
                                validate: true,
                                transaction: trans
                            });
                        }
                    }

                    if (department && productionProcedure.department_id) {
                        const device_name = worksheet['E'+i] ? worksheet['E'+i].v : null;
                        const device_model = worksheet['F'+i] ? worksheet['F'+i].v : null;

                        if (device_name && device_model) {
                            const { department_id } = productionProcedure;
                            const [ fixedAssetsCheckDetail ] = await getFixedAssets({domain_id, device_name, device_model, department_id});

                            if (!fixedAssetsCheckDetail || department_id !== fixedAssetsCheckDetail.department_id) {
                                continue;
                            }

                            const { fixedassetscheckdetail_id } = fixedAssetsCheckDetail;
                            const productDevice = await tb_productdevice.findOne({
                                where: {
                                    fixedassetsdetail_id: fixedassetscheckdetail_id,
                                    domain_id,
                                    state: GLBConfig.ENABLE
                                }
                            });

                            if (!productDevice) {
                                continue;
                            }

                            const { productdevice_id, device_level } = productDevice;
                            let hour_capacity = worksheet['G'+i] ? worksheet['G'+i].v : 0;
                            hour_capacity = parseInt(hour_capacity);
                            let work_time = worksheet['H'+i] ? worksheet['H'+i].v : 0;
                            work_time = parseInt(work_time);

                            const { procedure_id } = productionProcedure;
                            // const { work_time } = department;
                            const day_capacity = work_time * hour_capacity;

                            const productProcedureDevice = await tb_productproceduredevice.findOne({
                                where: {
                                    productprocedure_id: procedure_id,
                                    productdevice_id,
                                    domain_id,
                                    state: GLBConfig.ENABLE
                                }
                            });

                            if (productProcedureDevice) {
                                productProcedureDevice.device_level = device_level;
                                productProcedureDevice.hour_capacity = hour_capacity;
                                productProcedureDevice.day_capacity = day_capacity;
                                await productProcedureDevice.save({
                                    validate: true,
                                    transaction: trans
                                });
                            } else {
                                await tb_productproceduredevice.create({
                                    productprocedure_id: procedure_id,
                                    productdevice_id,
                                    device_level,
                                    hour_capacity,
                                    day_capacity,
                                    domain_id
                                }, {
                                    validate: true,
                                    transaction: trans
                                });
                            }
                        }
                    }
                }
            } catch (error) {
                throw error.message;
            }
        });

        common.sendData(res, '导入成功！');
    } catch (error) {
        common.sendError(res, '', error.message);
    }
}

// async function getProcedureType(req, domain_id) {
//     let queryStr =
//         `select t.*, rt.basetype_code, rt.basetype_name
//          from tbl_erc_basetypedetail t
//          left join tbl_erc_basetype rt
//          on t.basetype_id = rt.basetype_id
//          where t.state = 1
//          and t.domain_id = ? and basetype_code='SCGXFL'`;
//
//     const replacements = [domain_id];
//     queryStr += ' order by t.created_at desc';
//     const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
//     return result.data;
// }
//
// async function getBaseType(code,domainId) {
//     try {
//         let returnData = [],
//             replacements = []
//         let queryStr = `select d.*, t.basetype_code from tbl_erc_basetypedetail d,tbl_erc_basetype t
//              where d.basetype_id=t.basetype_id and t.basetype_code=?`;
//         replacements.push(code)
//         if (domainId) {
//             queryStr += `and domain_id = ${domainId}`;
//         }
//         let result = await sequelize.query(queryStr, {
//             replacements: replacements,
//             type: sequelize.QueryTypes.SELECT
//         });
//         for (let r of result) {
//             returnData.push({
//                 id: r.basetypedetail_id,
//                 value: r.basetypedetail_id,
//                 text: r.typedetail_name,
//             })
//         }
//         return returnData
//     } catch (error) {
//         throw error
//     }
// }

//19 供应商
async function importSupplier(req, res) {
    try {
        const { user, body } = req;
        const worksheet = trimJson(await common.exceltojson(body.uploadurl));
        const excelJsonArray = XLSX.utils.sheet_to_json(worksheet);
        // const supplierClass = await getBaseType('GYSLB'); //供应商类别
        // const GRSYSL = await getBaseType('GRSYSL',req.user.domain_id);
        const supplierClass = await global.getBaseTypeInfo(user.domain_id, 'GYSLB'); //供应商类别
        const GRSYSL = await global.getBaseTypeInfo(user.domain_id, 'GRSYSL');

        for (let i=2; i<=excelJsonArray.length+1; i++) {
            // const itemData = excelJsonArray[i];
            // const [supplier, supplier_name,supplier_class, supplier_address,supplier_tax_rate, supplier_contact,supplier_phone,
            //     supplier_way,supplier_number_days,supplier_bank_no,supplier_proportion,supplier_advance_ratio] = Object.entries(itemData);

            const supplier = worksheet['A'+i] ? worksheet['A'+i].v : null;
            const supplier_name = worksheet['B'+i] ? worksheet['B'+i].v : null;
            const supplier_class = worksheet['C'+i] ? worksheet['C'+i].v : null;
            const supplier_address = worksheet['D'+i] ? worksheet['D'+i].v : null;
            const supplier_tax_rate = worksheet['E'+i] ? worksheet['E'+i].v : null;
            const supplier_contact = worksheet['F'+i] ? worksheet['F'+i].v : null;
            const supplier_phone = worksheet['G'+i] ? worksheet['G'+i].v : null;
            const supplier_way = worksheet['H'+i] ? worksheet['H'+i].v : null;
            const supplier_number_days = worksheet['I'+i] ? worksheet['I'+i].v : null;
            const supplier_bank_no = worksheet['J'+i] ? worksheet['J'+i].v : null;
            const supplier_proportion = worksheet['K'+i] ? worksheet['K'+i].v : null;
            const supplier_advance_ratio = worksheet['L'+i] ? worksheet['L'+i].v : null;

            if (!supplier) {
                return common.sendError(res, '',`第${i}行,供应商工商登记证号不允许为空`);
            }
            if (!supplier_name) {
                return common.sendError(res, '',`第${i}行,供应商名称不允许为空`);
            }

            if(supplier_number_days){
                if(!validator.isInt(`${supplier_number_days}`))
                    return common.sendError(res, '',`第${i}行,月结天数${supplier_number_days}必须为整数`);
            }
            if(supplier_tax_rate) {
                const isExist = GRSYSL.some(item => (item.text === supplier_tax_rate));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,购入适用税率${supplier_tax_rate}不存在`);
            }
            if(supplier_proportion) {
                if(!validator.isFloat(`${supplier_proportion}`))
                    return common.sendError(res, '',`第${i}行,采购比率${supplier_proportion}必须为数字`);
            }
            if(supplier_advance_ratio) {
                if(!validator.isFloat(`${supplier_advance_ratio}`))
                    return common.sendError(res, '',`第${i}行,预付比例${supplier_advance_ratio}必须为数字`);
            }
            if(supplier_class){
                const isExist = supplierClass.some(item => (item.text === supplier_class));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,供应商类别${supplier_class}不存在`);
            }
            let getSupplier = await tb_supplier.findOne({
                where: {
                    supplier_name: supplier_name,
                    domain_id: user.domain_id
                }
            });
            if (getSupplier) {//客户已存在
                return common.sendError(res, '',`第${i}行,${supplier_name}已存在`);
            }
        }

        //控制事物
        await common.transaction(async function (t) {
            for(let i=2; i<=excelJsonArray.length+1; i++){
                // const [supplier, supplier_name,supplier_class, supplier_address,supplier_tax_rate, supplier_contact,supplier_phone,
                //     supplier_way,supplier_number_days,supplier_bank_no,supplier_proportion,supplier_advance_ratio] = Object.entries(itemData1);
                const supplier = worksheet['A'+i] ? worksheet['A'+i].v : null;
                const supplier_name = worksheet['B'+i] ? worksheet['B'+i].v : null;
                const supplier_class = worksheet['C'+i] ? worksheet['C'+i].v : null;
                const supplier_address = worksheet['D'+i] ? worksheet['D'+i].v : null;
                const supplier_tax_rate = worksheet['E'+i] ? worksheet['E'+i].v : null;
                const supplier_contact = worksheet['F'+i] ? worksheet['F'+i].v : null;
                const supplier_phone = worksheet['G'+i] ? worksheet['G'+i].v : null;
                const supplier_way = worksheet['H'+i] ? worksheet['H'+i].v : null;
                const supplier_number_days = worksheet['I'+i] ? worksheet['I'+i].v : null;
                const supplier_bank_no = worksheet['J'+i] ? worksheet['J'+i].v : null;
                const supplier_proportion = worksheet['K'+i] ? worksheet['K'+i].v : null;
                const supplier_advance_ratio = worksheet['L'+i] ? worksheet['L'+i].v : null;

                let supplier_class_id = null;
                for(let s of supplierClass){
                    if (s.text === supplier_class) {
                        supplier_class_id = s.id;
                        break;
                    }
                }
                let settlement_way = null;
                if (supplier_way) {
                    const baseType = await tb_basetypedetail.findOne({
                        where: {
                            typedetail_name: supplier_way
                        }
                    });
                    settlement_way = baseType.basetypedetail_id;
                }

                const supplier_tax_rate_exist = GRSYSL.find(item => (item.text === supplier_tax_rate));


                const addSupplier = await tb_supplier.create({
                    domain_id:user.domain_id,
                    supplier:supplier,                                   //供应商工商登记证号
                    supplier_name:supplier_name,                         //供应商名称
                    supplier_class: supplier_class_id,                      //供应商类别
                    supplier_address:supplier_address,                   //地址
                    supplier_tax_rate: supplier_tax_rate_exist ? supplier_tax_rate_exist.id : null,                //适用税率
                    supplier_contact:supplier_contact,                   //联系人
                    supplier_phone:supplier_phone,                       //联系方式
                    supplier_way: settlement_way,                           //结算方式 预付后款到发货  月结结算
                    supplier_number_days: supplier_number_days * 1,          //月结天数
                    supplier_bank_no: supplier_bank_no,                  //供应商银行账号
                    supplier_proportion: supplier_proportion * 1,            //采购比率
                    supplier_advance_ratio: supplier_advance_ratio * 1      //预付比例
                },{
                    transaction: t
                })

                //添加会计科目详情
                await addAccountingDetail(2202, addSupplier.supplier_id, user.domain_id, t, '2');
                await addAccountingDetail(1231, addSupplier.supplier_id, user.domain_id, t, '2');
                await addAccountingDetail(2241, addSupplier.supplier_id, user.domain_id, t, '2');
            }
        });


        common.sendData(res, '导入成功！');
    } catch (error) {
        common.sendError(res, '', error.message);
    }
}

//20 供应商后续管理信息
async function importSupplierDetail(req, res) {
    try {
        const { user, body } = req;
        const worksheet = trimJson(await common.exceltojson(body.uploadurl));
        const excelJsonArray = XLSX.utils.sheet_to_json(worksheet);
        for (let i=2; i<=excelJsonArray.length+1; i++) {
            // const itemData = excelJsonArray[i];
            // const [supplier_code, materiel_code,materiel_name, materiel_format,materiel_unit, suppliermateriel_purchasepricetax,
            //     suppliermateriel_currency_price,suppliermateriel_effectivedata,suppliermateriel_expirydate,
            //     suppliermateriel_priceeffective,suppliermateriel_shortest_days,suppliermateriel_mincount] = Object.entries(itemData);

            const supplier_code = worksheet['A'+i] ? worksheet['A'+i].v : null;
            const materiel_code = worksheet['B'+i] ? worksheet['B'+i].v : null;
            const materiel_name = worksheet['C'+i] ? worksheet['C'+i].v : null;
            const materiel_format = worksheet['D'+i] ? worksheet['D'+i].v : null;
            const materiel_unit = worksheet['E'+i] ? worksheet['E'+i].v : null;
            const suppliermateriel_purchasepricetax = worksheet['F'+i] ? worksheet['F'+i].v : null;
            const suppliermateriel_currency_price = worksheet['G'+i] ? worksheet['G'+i].v : null;
            const suppliermateriel_effectivedata = worksheet['H'+i] ? worksheet['H'+i].w : null;
            const suppliermateriel_expirydate = worksheet['I'+i] ? worksheet['I'+i].w : null;
            const suppliermateriel_priceeffective = worksheet['J'+i] ? worksheet['J'+i].v : null;
            const suppliermateriel_shortest_days = worksheet['K'+i] ? worksheet['K'+i].v : null;
            const suppliermateriel_mincount = worksheet['L'+i] ? worksheet['L'+i].v : null;

            if (!supplier_code) {
                return common.sendError(res, '',`第${i}行,供应商编号不能为空！`);
            }
            if (!materiel_code) {
                return common.sendError(res, '',`第${i}行,所供产品编号不能为空！`);
            }
            if(suppliermateriel_purchasepricetax) {
                if(!validator.isFloat(`${suppliermateriel_purchasepricetax}`))
                    return common.sendError(res, '',`第${i}行,所供产品本币价格'${suppliermateriel_purchasepricetax}'必须为数字`);
            }
            if(suppliermateriel_currency_price) {
                if(!validator.isFloat(`${suppliermateriel_currency_price}`))
                    return common.sendError(res, '',`第${i}行,所供产品外币价格'${suppliermateriel_currency_price}'必须为数字`);
            }
            if (suppliermateriel_effectivedata) {
                if(!common.checkDate(suppliermateriel_effectivedata))
                    return common.sendError(res, '',`第${i}行,所供产品批准报价有效时间'${suppliermateriel_effectivedata}'格式不正确,请输入YYYY-MM-DD格式`);
            }
            if (suppliermateriel_expirydate) {
                if(!common.checkDate(suppliermateriel_expirydate))
                    return common.sendError(res, '',`第${i}行,所供产品批准报价有效时间'${suppliermateriel_expirydate}'格式不正确,请输入YYYY-MM-DD格式`);
            }
            if(suppliermateriel_shortest_days){
                if(!validator.isInt(`${suppliermateriel_shortest_days}`))
                    return common.sendError(res, '',`第${i}行,供货周期'${suppliermateriel_shortest_days}'必须为整数`);
            }
            if(suppliermateriel_mincount){
                if(!validator.isInt(`${suppliermateriel_mincount}`))
                    return common.sendError(res, '',`第${i}行,最小供货量'${suppliermateriel_mincount}'必须为整数`);
            }
            if (suppliermateriel_priceeffective) {
                const isExist = GLBConfig.PRICEEFFECTIVE.some(item => (item.text === suppliermateriel_priceeffective));
                if (!isExist)
                    return common.sendError(res, '',`第${i}行,报价起算单据'${suppliermateriel_priceeffective}'不存在`);
            }
            const supplier = await tb_supplier.findOne({
                where: {
                    supplier: supplier_code,
                    domain_id: user.domain_id
                }
            });
            if (!supplier) {
                return common.sendError(res, '',`第${i}行,供应商编号'${supplier_code}'不存在`);
            }
            const materiel = await tb_materiel.findOne({
                where: {
                    materiel_code: materiel_code,
                    domain_id: user.domain_id,
                    state: GLBConfig.ENABLE
                }
            });
            if (!materiel) {
                return common.sendError(res, '',`第${i}行,物料编号'${materiel_code}'不存在`);
            }
        }

        //控制事物
        await common.transaction(async function (t) {
            for(let i=2; i<=excelJsonArray.length+1; i++){
                // const [supplier_code, materiel_code,materiel_name, materiel_format,materiel_unit, suppliermateriel_purchasepricetax,
                //     suppliermateriel_currency_price,suppliermateriel_effectivedata,suppliermateriel_expirydate,
                //     suppliermateriel_priceeffective,suppliermateriel_shortest_days,suppliermateriel_mincount] = Object.entries(itemData1);
                const supplier_code = worksheet['A'+i] ? worksheet['A'+i].v : null;
                const materiel_code = worksheet['B'+i] ? worksheet['B'+i].v : null;
                const materiel_name = worksheet['C'+i] ? worksheet['C'+i].v : null;
                const materiel_format = worksheet['D'+i] ? worksheet['D'+i].v : null;
                const materiel_unit = worksheet['E'+i] ? worksheet['E'+i].v : null;
                const suppliermateriel_purchasepricetax = worksheet['F'+i] ? worksheet['F'+i].v : null;
                const suppliermateriel_currency_price = worksheet['G'+i] ? worksheet['G'+i].v : null;
                const suppliermateriel_effectivedata = worksheet['H'+i] ? worksheet['H'+i].w : null;
                const suppliermateriel_expirydate = worksheet['I'+i] ? worksheet['I'+i].w : null;
                const suppliermateriel_priceeffective = worksheet['J'+i] ? worksheet['J'+i].v : null;
                const suppliermateriel_shortest_days = worksheet['K'+i] ? worksheet['K'+i].v : null;
                const suppliermateriel_mincount = worksheet['L'+i] ? worksheet['L'+i].v : null;
                const supplier = await tb_supplier.findOne({
                    where: {
                        supplier: supplier_code,
                        domain_id: user.domain_id
                    }
                });
                const materiel = await tb_materiel.findOne({
                    where: {
                        materiel_code: materiel_code,
                        domain_id: user.domain_id,
                        state: GLBConfig.ENABLE
                    }
                });
                await tb_suppliermateriel.create({
                    supplier_id:supplier.supplier_id,
                    materiel_id:materiel.materiel_id,
                    suppliermateriel_purchasepricetax: suppliermateriel_purchasepricetax * 1,//所供产品本币价格
                    suppliermateriel_currency_price: suppliermateriel_currency_price * 1,    //所供产品外币价格
                    suppliermateriel_effectivedata: suppliermateriel_effectivedata || null,      //所供产品批准报价有效时间
                    suppliermateriel_expirydate: suppliermateriel_expirydate || null,            //所供产品批准报价失效时间
                    suppliermateriel_priceeffective: getId(GLBConfig.PRICEEFFECTIVE,suppliermateriel_priceeffective),    //报价起算单据
                    suppliermateriel_shortest_days: suppliermateriel_shortest_days * 1,      //供货周期
                    suppliermateriel_mincount: suppliermateriel_mincount * 1                 //最小供货量
                },{
                    transaction: t
                });
            }
        });

        common.sendData(res, '导入成功！');
    } catch (error) {
        common.sendError(res, '', error.message);
    }
}

//21 供应商采购单
async function importSupplierPurchaseOrder(req, res) {
    try {
        const { user, body } = req;
        const worksheet = trimJson(await common.exceltojson(body.uploadurl));
        const excelJsonArray = XLSX.utils.sheet_to_json(worksheet);

        for (let i=2; i<=excelJsonArray.length+1; i++) {
            // const itemData = excelJsonArray[i];
            // const [purchaseorder_id, supplier_code,supplier_name,materiel_code,materiel_name, materiel_format,materiel_unit,
            //     purchase_number,purchase_price,delivery_date] = Object.entries(itemData);
            const purchaseorder_id = worksheet['A'+i] ? worksheet['A'+i].v : null;
            const supplier_code = worksheet['B'+i] ? worksheet['B'+i].v : null;
            const supplier_name = worksheet['C'+i] ? worksheet['C'+i].v : null;
            const materiel_code = worksheet['D'+i] ? worksheet['D'+i].v : null;
            const materiel_name = worksheet['E'+i] ? worksheet['E'+i].v : null;
            const materiel_format = worksheet['F'+i] ? worksheet['F'+i].v : null;
            const materiel_unit = worksheet['G'+i] ? worksheet['G'+i].v : null;
            const purchase_number = worksheet['H'+i] ? worksheet['H'+i].v : null;
            const purchase_price = worksheet['I'+i] ? worksheet['I'+i].v : null;
            const delivery_date = worksheet['J'+i] ? worksheet['J'+i].w : null;

            if (!purchaseorder_id) {
                return common.sendError(res, '',`第${i}行,采购订单编号不能为空！`);
            }
            if (!supplier_code) {
                return common.sendError(res, '',`第${i}行,供应商编号不能为空！`);
            }
            if (!materiel_code) {
                return common.sendError(res, '',`第${i}行,所供产品编号不能为空！`);
            }
            if(purchase_number){
                if(!validator.isInt(`${purchase_number}`))
                    return common.sendError(res, '',`第${i}行,数量'${purchase_number}'必须为整数`);
            }
            if(purchase_price) {
                if(!validator.isFloat(`${purchase_price}`))
                    return common.sendError(res, '',`第${i}行,单价'${purchase_price}'必须为数字`);
            }
            if (delivery_date) {
                if(!common.checkDate(delivery_date))
                    return common.sendError(res, '',`第${i}行,要求交货日期'${delivery_date}'格式不正确,请输入YYYY-MM-DD格式`);
            }
            const supplier = await tb_supplier.findOne({
                where: {
                    supplier: supplier_code,
                    domain_id: user.domain_id
                }
            });
            if (!supplier) {
                return common.sendError(res, '',`第${i}行,供应商编号'${supplier_code}'不存在`);
            }
            const materiel = await tb_materiel.findOne({
                where: {
                    materiel_code: materiel_code,
                    domain_id: user.domain_id,
                    state: GLBConfig.ENABLE
                }
            });
            if (!materiel) {
                return common.sendError(res, '',`第${i}行,物料编号'${materiel_code}'不存在`);
            }
        }

        //控制事物
        let insertObj = {};
        await common.transaction(async function (t) {
            for(let i=2; i<=excelJsonArray.length+1; i++){
                // const [purchaseorder_id, supplier_code,supplier_name,materiel_code,materiel_name, materiel_format,materiel_unit,
                //     purchase_number,purchase_price,delivery_date] = Object.entries(itemData1);
                const purchaseorder_biz_code = worksheet['A'+i] ? worksheet['A'+i].v : null;
                const supplier_code = worksheet['B'+i] ? worksheet['B'+i].v : null;
                const supplier_name = worksheet['C'+i] ? worksheet['C'+i].v : null;
                const materiel_code = worksheet['D'+i] ? worksheet['D'+i].v : null;
                const materiel_name = worksheet['E'+i] ? worksheet['E'+i].v : null;
                const materiel_format = worksheet['F'+i] ? worksheet['F'+i].v : null;
                const materiel_unit = worksheet['G'+i] ? worksheet['G'+i].v : null;
                const purchase_number = worksheet['H'+i] ? worksheet['H'+i].v : null;
                const purchase_price = worksheet['I'+i] ? worksheet['I'+i].v : null;
                const delivery_date = worksheet['J'+i] ? worksheet['J'+i].w : null;
                const supplier = await tb_supplier.findOne({
                    where: {
                        supplier: supplier_code,
                        domain_id: user.domain_id
                    }
                });
                const materiel = await tb_materiel.findOne({
                    where: {
                        materiel_code: materiel_code,
                        domain_id: user.domain_id,
                        state: GLBConfig.ENABLE
                    }
                });

                // const purchaseOrder = await tb_purchaseorder.findOne({
                //     where: {
                //         purchaseorder_id: purchaseorder_id,
                //     }
                // });


                //添加物料采购单
                const purchaseorder_id = await Sequence.genPurchaseOrderID(user.domain_id);
                if (!insertObj[purchaseorder_biz_code]) {
                    await tb_purchaseorder.create({
                        purchaseorder_id,
                        biz_code: purchaseorder_biz_code,
                        purchaseorder_domain_id: user.domain_id,
                        supplier_id:supplier.supplier_id,
                        delivery_data: delivery_date[0] || null    //要求交货日期
                    },{
                        transaction: t
                    });
                    insertObj[purchaseorder_biz_code] = '1';
                }
                //物料采购单下添加物料
                await tb_purchasedetail.create({
                    purchase_id: purchaseorder_id,        //采购单ID
                    materiel_id: materiel.materiel_id,
                    purchase_price: purchase_price * 1,          //单价
                    purchase_number: purchase_number * 1         //数量
                },{
                    transaction: t
                })
            }
        });

        common.sendData(res, '导入成功！');
    } catch (error) {
        common.sendError(res, '', error.message);
    }
}


//35 会议室
async function importMeetRoom(req, res) {
    try {
        const { user, body } = req;
        const worksheet = await common.exceltojson(body.uploadurl);
        const excelJsonArray = trim(XLSX.utils.sheet_to_json(worksheet));
        let successNumber = 0;
        let errorNumber = 0;

        for (const itemData1 of excelJsonArray) {
            const [meetingroom_name,meetinguser_code,equipmentuser_code] = Object.entries(itemData1);

            let getMeetRoom = await tb_meetingroom.findOne({
                where: {
                    meetingroom_name: meetingroom_name[1],
                    domain_id: user.domain_id
                }
            });

            if (getMeetRoom) {//客户已存在
                errorNumber++;
                logger.debug('meetRoom is exist');
            } else {
                let meetingroom_id = await Sequence.genMeetingRoomID();

                let meetinguserID = await tb_user.findOne({
                    where:{
                        username:meetinguser_code[1],
                        state:1
                    }
                })
                let equipmentuserID = await tb_user.findOne({
                    where:{
                        username:equipmentuser_code[1],
                        state:1
                    }
                })
                let addMeetRoom = await tb_meetingroom.create({
                    domain_id: user.domain_id,
                    meetingroom_id: meetingroom_id,
                    meetingroom_name:meetingroom_name[1],
                    meetinguser_id: meetinguserID.user_id,
                    equipmentuser_id: equipmentuserID.user_id
                })
                successNumber++
            }
        }
        common.sendData(res, {successNumber, errorNumber});
    } catch (error) {
        common.sendError(res, '', error.message);
    }
}

//去除首位空格
function trim(array) {
    for (const a of array) {
        for (const key of Object.keys(a)) {
            if (key && `${key}`.length > 0) {
                if (a[key] && `${a[key]}`.length > 0) {
                    a[key] = `${a[key]}`.replace(/(^\s*)|(\s*$)/g, "");
                }
            }
        }
    }
    return array;
}
//去除首位空格
function trimJson(json) {
    if (Object.keys(json) && Object.keys(json).length > 0) {
        for (const key of Object.keys(json)) {
            let value = json[key];
            if (typeof value === 'object') {
                if (Object.keys(value) && Object.keys(value).length > 0){
                    for (const subKey of Object.keys(value)) {
                        value[subKey] = `${value[subKey]}`.replace(/(^\s*)|(\s*$)/g, "");
                    }
                }
            }
        }
    }
    return json;
}

//添加会计科目详情
async function addAccountingDetail(accountCode, otherId, domainId, t, accountType) {
    if (!accountCode || !otherId || !domainId) {
        return;
    }
    await tb_accountdetail.create({
        accounting_code: accountCode,
        other_id: otherId,
        domain_id: domainId,
        accounting_type: accountType
    }, {
        transaction: t
    });
}

//获取价格体系
async function getPriceTemplate(user) {
    try {
        let returnData = [],
            replacements = []
        let queryStr = `select * from tbl_erc_producepricetemplate where state=1 and domain_id=?`;
        replacements.push(user.domain_id)
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        for (let r of result) {
            returnData.push({
                id: r.producepricetemplate_id,
                value: r.producepricetemplate_id,
                text: r.producepricetemplate_name,
            })
        }
        return returnData
    } catch (error) {
        throw error
    }
}
