const fs = require('fs');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCSupplierMaterielControl');
const model = require('../../../model');
const moment = require('moment');
const { calcTotalReplacePrice } = require('../service/ERCInventoryService');
const { createRecordingVoucherSC } = require('../../../util/RecordingVouchersc');

// tables
const sequelize = model.sequelize;
const tb_user = model.common_user;
const tb_materiel = model.erc_materiel;
const tb_suppliermateriel = model.erc_suppliermateriel;
const tb_suppliermateriel_ot = model.erc_suppliermateriel_ot;
const tb_supplier = model.erc_supplier;
const tb_inventory_replace_info = model.erc_inventory_replace_info;

exports.ERCSupplierMaterielControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'search_mat') {
        searchMat(req, res)
    } else if (method === 'SupplierMaterielControlSRV_add') {
        addMat(req, res)
    } else if (method === 'SupplierMaterielControlSRV_addOT') {
        addMatOT(req, res)
    } else if (method === 'delete') {
        deleteAct(req, res)
    } else if (method === 'deleteOT') {
        deleteOT(req, res)
    } else if (method === 'getPuchareOrder') {
        getPuchareOrder(req, res)
    } else if (method === 'getGathering') {
        getGathering(req, res)
    } else if (method === 'getPuchaseOrderDetail') {
        getPuchaseOrderDetail(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'modifyOT') {
        modifyOT(req, res)
    } else if (method === 'getOutSourcingMateriel') {
        getOutSourcingMateriel(req, res)
    } else {
        common.sendError(res, 'common_01');
    }
};

async function initAct(req, res) {
    try {
        const {
            domain_id
        } = req.user;
        const doc = req.body
        let returnData = {};
        returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'); //物料单位
        returnData.priceEffective = GLBConfig.PRICEEFFECTIVE; //价格生效依据
        returnData.taskState = GLBConfig.CHANGESTATE;
        returnData.paymentState = GLBConfig.PAYMENTCONFIRMSTATE;
        returnData.supplierInfo = await tb_supplier.findAll({
            where: {
                domain_id
            },
            attributes: [
                ['supplier_id', 'id'],
                ['supplier_name', 'text']
            ]
        });

        returnData.suppplier_tax = await getSupplierTax(doc.supplier_id)
        common.sendData(res, returnData);
    } catch (error) {
        common.sendError(res, error)
    }
}

async function getSupplierTax(supplier_id) {
    try {
        let queryStr = `select d.typedetail_name from tbl_erc_supplier s,tbl_erc_basetypedetail d
            where s.state=1 and d.state=1 and s.supplier_tax_rate = d.basetypedetail_id 
            and s.supplier_id = ?`
        let supplierRes = await sequelize.query(queryStr, {
            replacements: [supplier_id],
            type: sequelize.QueryTypes.SELECT
        });
        return supplierRes
    } catch (error) {

    }
}
//获取供应商物料信息
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        let replacements = [];

        let queryStr =
            `select sm.suppliermateriel_id,sm.suppliermateriel_purchasepricetax,sm.supplier_id,
            sm.suppliermateriel_effectivedata,sm.suppliermateriel_expirydate,sm.materiel_id,
            sm.suppliermateriel_mincount,sm.suppliermateriel_purchaseprice,sm.suppliermateriel_deliveryday,
            sm.suppliermateriel_tax,sm.suppliermateriel_priceeffective, sm.guarantee_quality_time
            ,m.materiel_id,m.materiel_code, m.materiel_format,m.materiel_name,m.materiel_unit,m.materiel_type
            ,sm.suppliermateriel_currency_price, sm.suppliermateriel_shortest_days
            from tbl_erc_suppliermateriel sm
            left join tbl_erc_materiel m on sm.materiel_id = m.materiel_id
            where m.state = 1 and sm.state = 1`;

        if (doc.supplier_id) {
            queryStr += ' and sm.supplier_id = ?';
            replacements.push(doc.supplier_id);
        }

        if (doc.search_text) {
            queryStr += ' and (m.materiel_code like ? or m.materiel_name like ? or m.materiel_format like ?)'
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        //returnData.rows = result.data;

        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.suppliermateriel_tax = r.suppliermateriel_tax * 100 + '%';
            result.suppliermateriel_purchaseprice = r.suppliermateriel_purchaseprice ? r.suppliermateriel_purchaseprice : 0;
            result.suppliermateriel_purchasepricetax = r.suppliermateriel_purchasepricetax ? r.suppliermateriel_purchasepricetax : 0;
            result.suppliermateriel_effectivedata = r.suppliermateriel_effectivedata ? moment(r.suppliermateriel_effectivedata).format("YYYY-MM-DD") : null;
            result.suppliermateriel_expirydate = r.suppliermateriel_expirydate ? moment(r.suppliermateriel_expirydate).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

//修改供应商物料信息
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user

        if (parseFloat(doc.new.suppliermateriel_purchasepricetax) <= 0) {
            return common.sendError(res, '', '价格必须大于0');
        }

        let supplierMateriel = await tb_suppliermateriel.findOne({
            where: {
                suppliermateriel_id: doc.old.suppliermateriel_id
            }
        })
        if (supplierMateriel) {
            supplierMateriel.suppliermateriel_mincount = doc.new.suppliermateriel_mincount
            supplierMateriel.suppliermateriel_purchaseprice = doc.new.suppliermateriel_purchaseprice
            supplierMateriel.suppliermateriel_purchasepricetax = doc.new.suppliermateriel_purchasepricetax
            supplierMateriel.suppliermateriel_deliveryday = doc.new.suppliermateriel_deliveryday
            supplierMateriel.suppliermateriel_effectivedata = doc.new.suppliermateriel_effectivedata
            supplierMateriel.suppliermateriel_expirydate = doc.new.suppliermateriel_expirydate
            supplierMateriel.suppliermateriel_priceeffective = doc.new.suppliermateriel_priceeffective
            supplierMateriel.suppliermateriel_currency_price = doc.new.suppliermateriel_currency_price
            supplierMateriel.suppliermateriel_begin_time = doc.new.suppliermateriel_begin_time
            supplierMateriel.suppliermateriel_shortest_days = doc.new.suppliermateriel_shortest_days
            supplierMateriel.guarantee_quality_time = doc.new.guarantee_quality_time
            await supplierMateriel.save();

            if (parseFloat(doc.new.suppliermateriel_purchasepricetax) !== parseFloat(doc.old.suppliermateriel_purchasepricetax)) {
                await tb_inventory_replace_info.update({
                    confirm_price: doc.new.suppliermateriel_purchasepricetax,
                    replace_state: 2
                }, {
                    where: {
                        domain_id: user.domain_id,
                        supplier_id: doc.new.supplier_id,
                        materiel_id: doc.new.materiel_id,
                        inventory_type: 1,
                        replace_state: 1
                    }
                });

                //计算总差额
                const totalPrice = await calcTotalReplacePrice(user.domain_id,  doc.new.supplier_id,  doc.new.materiel_id, 1, 2);
                if (totalPrice) {
                    //采购入库记账凭证
                    const options = {
                        materiel_id: doc.new.materiel_id,
                        supplier_id: doc.new.supplier_id,
                        amount: totalPrice
                    };
                    await createRecordingVoucherSC('CGRK', user, options);

                    await tb_inventory_replace_info.update({
                        replace_state: 3
                    }, {
                        where: {
                            domain_id: user.domain_id,
                            supplier_id: doc.new.supplier_id,
                            materiel_id: doc.new.materiel_id,
                            inventory_type: 1,
                            replace_state: 2
                        }
                    });
                }
            }

            common.sendData(res, supplierMateriel)
        } else {
            common.sendError(res, 'group_02')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}

async function modifyOT(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user

        if (parseFloat(doc.new.suppliermateriel_cost) <= 0) {
            return common.sendError(res, '', '价格必须大于0');
        }

        let supplierMateriel = await tb_suppliermateriel_ot.findOne({
            where: {
                suppliermateriel_ot_id: doc.old.suppliermateriel_ot_id
            }
        })
        if (supplierMateriel) {
            supplierMateriel.suppliermateriel_mincount = doc.new.suppliermateriel_mincount
            supplierMateriel.suppliermateriel_cost = doc.new.suppliermateriel_cost
            supplierMateriel.suppliermateriel_deliveryday = doc.new.suppliermateriel_deliveryday
            supplierMateriel.suppliermateriel_effectivedata = doc.new.suppliermateriel_effectivedata
            supplierMateriel.suppliermateriel_expirydate = doc.new.suppliermateriel_expirydate
            supplierMateriel.suppliermateriel_priceeffective = doc.new.suppliermateriel_priceeffective
            supplierMateriel.suppliermateriel_begin_time = doc.new.suppliermateriel_begin_time
            supplierMateriel.suppliermateriel_shortest_days = doc.new.suppliermateriel_shortest_days
            supplierMateriel.guarantee_quality_time = doc.new.guarantee_quality_time
            await supplierMateriel.save();

            common.sendData(res, supplierMateriel)
        } else {
            common.sendError(res, 'group_02')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}

//获取物料信息
async function searchMat(req, res) {
    try {
        const {
            user,
            body
        } = req;
        const {
            domain_id
        } = user;
        const returnData = {};

        // let queryStr = 'select * from tbl_erc_materiel where materiel_source in (2,3) and state = 1 and domain_id' + await FDomain.getDomainListStr(req);
        let queryStr =
            `select *
             from tbl_erc_materiel mat
             where mat.materiel_source in (2,3)
             and mat.state = 1 and mat.domain_id = ?`;
        const replacements = [domain_id];

        if (body.search_textM) {
            queryStr += ' and (mat.materiel_name like ? or mat.materiel_code like ? or mat.materiel_format like ?)';
            replacements.push('%' + body.search_textM + '%');
            replacements.push('%' + body.search_textM + '%');
            replacements.push('%' + body.search_textM + '%');
        }
        queryStr += ' order by mat.materiel_id';
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = result.data;
        /*for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.suppliermateriel_effectivedata = r.suppliermateriel_effectivedata ? moment(r.suppliermateriel_effectivedata).format("YYYY-MM-DD") : null;
            result.suppliermateriel_expirydate = r.suppliermateriel_expirydate ? moment(r.suppliermateriel_expirydate).format("YYYY-MM-DD") : null;

            returnData.rows.push(result)
        }*/

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

/**订单中的物料列表，信息由模板、订单、物料三者关联而来，关联关系由【生成物料单】操作建立
 * 用户也可在模板的物料单之外添加物料，所添加的物料应从系统已有的物料列表中选择
 **/
async function addMat(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        logger.info(doc.suppliermateriel_mincount)
        logger.info(doc.suppliermateriel_purchaseprice)
        let material = await tb_suppliermateriel.findOne({
            where: {
                materiel_id: doc.materiel_id,
                supplier_id: doc.supplier_id,
                state: GLBConfig.ENABLE
            }
        });

        if (material) {
            common.sendError(res, 'materiel_02');
        } else {
            let supplier = await tb_supplier.findOne({
                where: {
                    supplier_id: doc.supplier_id
                }
            });
            // const supplier_tax_rate = supplier.supplier_tax_rate ? supplier.supplier_tax_rate : 0; //采购税率

            let addOM = await tb_suppliermateriel.create({
                supplier_id: doc.supplier_id,
                materiel_id: doc.materiel_id,
                suppliermateriel_deliveryday: doc.suppliermateriel_deliveryday,
                suppliermateriel_effectivedata: doc.suppliermateriel_effectivedata,
                suppliermateriel_expirydate: doc.suppliermateriel_expirydate,
                suppliermateriel_mincount: doc.suppliermateriel_mincount,
                suppliermateriel_purchaseprice: doc.suppliermateriel_purchaseprice,
                suppliermateriel_purchasepricetax: doc.suppliermateriel_purchasepricetax,
                suppliermateriel_priceeffective: doc.suppliermateriel_priceeffective,
                suppliermateriel_currency_price: doc.suppliermateriel_currency_price,
                suppliermateriel_shortest_days: doc.suppliermateriel_shortest_days,
                guarantee_quality_time: doc.guarantee_quality_time,
            });

            if (parseFloat(addOM.suppliermateriel_purchasepricetax) > 0) {
                await tb_inventory_replace_info.update({
                    confirm_price: addOM.suppliermateriel_purchasepricetax,
                    replace_state: 2
                }, {
                    where: {
                        domain_id: user.domain_id,
                        third_id: doc.supplier_id,
                        materiel_id: doc.materiel_id,
                        inventory_type: 1,
                        replace_state: 1
                    }
                });

                //计算总差额
                const totalPrice = await calcTotalReplacePrice(user.domain_id, doc.supplier_id, doc.materiel_id, 1, 2);
                if (totalPrice) {
                    //采购入库记账凭证
                    const options = {
                        materiel_id: doc.materiel_id,
                        supplier_id: doc.supplier_id,
                        amount: totalPrice
                    };
                    await createRecordingVoucherSC('CGRK', user, options);

                    await tb_inventory_replace_info.update({
                        replace_state: 3
                    }, {
                        where: {
                            domain_id: user.domain_id,
                            third_id: doc.supplier_id,
                            materiel_id: doc.materiel_id,
                            inventory_type: 1,
                            replace_state: 2
                        }
                    });
                }
            }

            common.sendData(res, addOM);
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function addMatOT(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        logger.info(doc.suppliermateriel_mincount)
        logger.info(doc.suppliermateriel_cost)
        let material = await tb_suppliermateriel_ot.findOne({
            where: {
                materiel_id: doc.materiel_id,
                supplier_id: doc.supplier_id,
                state: GLBConfig.ENABLE
            }
        });

        if (material) {
            common.sendError(res, 'materiel_02');
        } else {
            let supplier = await tb_supplier.findOne({
                where: {
                    supplier_id: doc.supplier_id
                }
            });
            // const supplier_tax_rate = supplier.supplier_tax_rate ? supplier.supplier_tax_rate : 0; //采购税率

            let addOM = await tb_suppliermateriel_ot.create({
                supplier_id: doc.supplier_id,
                materiel_id: doc.materiel_id,
                suppliermateriel_deliveryday: doc.suppliermateriel_deliveryday,
                suppliermateriel_effectivedata: doc.suppliermateriel_effectivedata,
                suppliermateriel_expirydate: doc.suppliermateriel_expirydate,
                suppliermateriel_mincount: doc.suppliermateriel_mincount,
                suppliermateriel_cost: doc.suppliermateriel_cost,
                suppliermateriel_priceeffective: doc.suppliermateriel_priceeffective,
                suppliermateriel_shortest_days: doc.suppliermateriel_shortest_days,
                guarantee_quality_time: doc.guarantee_quality_time,
            });

            common.sendData(res, addOM);
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}

/**
 * 删除供应商物料信息
 */
let deleteAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let delTemp = await tb_suppliermateriel.findOne({
            where: {
                suppliermateriel_id: doc.suppliermateriel_id,
                state: GLBConfig.ENABLE
            }
        });

        if (delTemp) {
            delTemp.state = GLBConfig.DISABLE;
            delTemp.materiel_id = GLBConfig.DISABLE;
            await delTemp.save();

            return common.sendData(res);
        } else {
            return common.sendError(res, 'templateConstruction_01');

        }
    } catch (error) {
        return common.sendFault(res, error);
    }
};

let deleteOT = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let delTemp = await tb_suppliermateriel_ot.findOne({
            where: {
                suppliermateriel_ot_id: doc.suppliermateriel_ot_id,
                state: GLBConfig.ENABLE
            }
        });

        if (delTemp) {
            delTemp.state = GLBConfig.DISABLE;
            delTemp.materiel_id = GLBConfig.DISABLE;
            await delTemp.save();

            return common.sendData(res);
        } else {
            return common.sendError(res, 'templateConstruction_01');

        }
    } catch (error) {
        return common.sendFault(res, error);
    }
};

async function getPuchareOrder(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user,
            replacements = [],
            returnData = {};
        let queryStr = `select po.* from tbl_erc_purchaseorder po 
            left join tbl_erc_supplier s on (po.supplier_id = s.supplier_id and s.state=1)
            where po.state=1 and po.order_domain_id=? and po.supplier_id = ?`
        replacements.push(user.domain_id);
        replacements.push(doc.supplier_id);
        if (doc.search_text) {
            queryStr += ' and po.biz_code like ?';
            replacements.push('%' + body.search_text + '%');
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function getGathering(req, res) {
    let doc = common.docTrim(req.body);
    let user = req.user,
        returnData = {};

    try {
        let queryStr =
            `select
                slp.supplierpayment_id, slp.supplierpayment_code, slp.supplier_id, slp.payment_price, slp.payment_note
                , slp.paymentconfirm_id, slp.apply_state, slp.payment_state, slp.reject_caused
                , date(slp.approval_date) as approval_date, date(slp.created_at) as created_at
                , usr.name
                from tbl_erc_supplierpayment slp
                left join tbl_common_user usr
                on slp.user_id = usr.user_id
                where true
                and slp.state = 1
                and slp.domain_id = ?
                and slp.supplier_id = ?
                order by slp.supplierpayment_code`;

        const replacements = [user.domain_id, doc.supplier_id];
        if (doc.search_text) {
            queryStr += ' and slp.supplierpayment_code like ?';
            replacements.push('%' + body.search_text + '%');
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getPuchaseOrderDetail(req, res) {
    let doc = common.docTrim(req.body);
    let user = req.user,
        returnData = {};

    try {
        let queryStr =
            `select m.materiel_code,m.materiel_name,m.materiel_format,m.materiel_unit,
                pd.purchase_number,pd.purchase_price,pd.purchase_number*pd.purchase_price as purchase_mopney 
                from tbl_erc_purchasedetail pd 
                left join tbl_erc_materiel m on (pd.materiel_id=m.materiel_id and m.state=1 )
                and pd.purchase_id=?`;

        const replacements = [doc.purchaseorder_id];
        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getOutSourcingMateriel(req, res) {
    try {
        const { body, user } = req;
        const returnData = {};
        const replacements = [];

        let queryStr =
            `select
                sm.suppliermateriel_ot_id, sm.materiel_id, sm.supplier_id
                , date(sm.suppliermateriel_effectivedata) as suppliermateriel_effectivedata
                , date(sm.suppliermateriel_expirydate) as suppliermateriel_expirydate
                , sm.suppliermateriel_mincount, sm.suppliermateriel_deliveryday
                , sm.suppliermateriel_priceeffective, sm.guarantee_quality_time
                , sm.suppliermateriel_shortest_days, sm.suppliermateriel_cost
                , m.materiel_code, m.materiel_format, m.materiel_name, m.materiel_unit, m.materiel_type
                from tbl_erc_suppliermateriel_ot sm
                left join tbl_erc_materiel m
                on sm.materiel_id = m.materiel_id
                where m.state = 1 and sm.state = 1`;

        if (body.supplier_id) {
            queryStr += ' and sm.supplier_id = ?';
            replacements.push(body.supplier_id);
        }

        if (body.search_text) {
            queryStr += ' and (m.materiel_code like ? or m.materiel_name like ? or m.materiel_format like ?)';
            replacements.push(`%${body.search_text}%`);
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
