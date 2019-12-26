const common = require('../../../util/CommonUtil');
const logger = require('../../../util/Logger').createLogger('ERCTaxStatementControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const GLBConfig = require('../../../util/GLBConfig');
const TaskListControlSRV = require('../baseconfig/ERCTaskListControlSRV');

const moment = require('moment');
const sequelize = model.sequelize;

const tb_taxpayment = model.erc_taxpayment;
const tb_paymentconfirm = model.erc_paymentconfirm;
const tb_taxinvoice = model.erc_taxinvoice;
const tb_taxinvoicemateriel = model.erc_taxinvoicmateriel;
const tb_saleinvoice = model.erc_saleinvoice;
const tb_supplierinvoice = model.erc_supplierinvoice;

exports.ERCInvoiceControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'initInvoice') {
        await initInvoice(req, res);
    } else if (method === 'addTaxInvoice') {
        await addTaxInvoice(req, res);
    } else if (method === 'getInvoiceAlreadyList') {
        await getInvoiceAlreadyList(req, res);
    } else if (method === 'getInvoiceAlreadyDetail') {
        await getInvoiceAlreadyDetail(req, res);
    } else if (method === 'modifyTaxInvoiceDetail') {
        await modifyTaxInvoiceDetail(req, res);
    } else if (method === 'deleteTaxInvoiceDetail') {
        await deleteTaxInvoiceDetail(req, res);
    } else if (method === 'getSaleInvoiceList') {
        await getSaleInvoiceList(req, res);
    } else if (method === 'getSaleInvoiceDetail') {
        await getSaleInvoiceDetail(req, res);
    } else if (method === 'addSaleInvoice') {
        await addSaleInvoice(req, res);
    } else if (method === 'getPurchaseInvoiceList') {
        await getPurchaseInvoiceList(req, res);
    } else if (method === 'getPurchaseInvoiceDetail') {
        await getPurchaseInvoiceDetail(req, res);
    } else if (method === 'addPurchaseInvoice') {
        await addPurchaseInvoice(req, res);
    } else if (method === 'modifyPurchaseInvoice') {
        await modifyPurchaseInvoice(req, res);
    } else if (method === 'addTaxInvoiceMateriel') {
        await addTaxInvoiceMateriel(req, res)
    } else if (method === 'getTaxInvoicMateriel') {
        await getTaxInvoicMateriel(req, res)
    } else if (method === 'deleteInvoiceMateriel') {
        await deleteInvoiceMateriel(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};

async function initInvoice(req, res) {
    const returnData = {};

    try {
        returnData.taxInvoiceType = GLBConfig.TAX_INVOICE_TYPE;
        returnData.saleInvoiceType = GLBConfig.SALE_INVOICE_TYPE;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function addTaxInvoice(req, res) {
    const {
        body,
        user
    } = req;

    try {
        const {
            corporateclients_id,
            invoice_code,
            invoice_type,
            materiel_code,
            materiel_name,
            materiel_format,
            materiel_unit,
            materiel_amount,
            materiel_tax_price,
            materiel_tax,
            materiel_price
        } = body;
        const {
            domain_id
        } = user;

        const result = await tb_taxinvoicemateriel.create({
            corporateclients_id,
            invoice_code,
            invoice_type,
            // materiel_code,
            // materiel_name,
            // materiel_format,
            // materiel_unit,
            // materiel_amount,
            // materiel_tax_price,
            // materiel_tax,
            // materiel_price,
            domain_id
        });

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}
async function addTaxInvoiceMateriel(req, res) {
    const {
        body
    } = req;

    try {
        const result = await tb_taxinvoicemateriel.create({
            invoice_id: body.invoice_id,
            materiel_code: body.materiel_code,
            materiel_name: body.materiel_name,
            materiel_format: body.materiel_format,
            materiel_unit: body.materiel_unit,
            materiel_amount: body.materiel_amount,
            materiel_tax_price: body.materiel_tax_price,
            materiel_tax: body.materiel_tax,
            materiel_price: body.materiel_price
        });
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}
async function getInvoiceAlreadyList(req, res) {
    const {
        body,
        user
    } = req;
    const {
        domain_id
    } = user;
    const returnData = {};

    try {
        let queryStr =
            `select
                ccs.corporateclients_id, ccs.corporateclients_no, ccs.corporateclients_name, usr.name
                from tbl_erc_corporateclients ccs
                left join tbl_common_user usr
                on ccs.resp_user_id = usr.user_id
                where ccs.state = ?
                and ccs.domain_id = ?`;

        const replacements = [GLBConfig.ENABLE, domain_id];

        if (body.search_text) {
            queryStr += ` and (ccs.corporateclients_no like ? or ccs.corporateclients_name like ?)`;
            replacements.push(body.search_text);
            replacements.push(body.search_text);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;

        for (const item of result.data) {
            const {
                corporateclients_id
            } = item;
            const orderPriceStr =
                `select
                    sum(ia.account_operate_amount) * sum(sm.store_price) as total_price
                    from tbl_erc_corporateclients ccs
                    left join tbl_erc_order ord
                    on ccs.corporateclients_id = ord.purchaser_corporateclients_id
                    left join tbl_erc_inventoryaccount ia
                    on (ord.order_id = ia.order_id and ia.account_operate_type = 2)
                    left join tbl_erc_stockmap sm
                    on ia.materiel_id = sm.materiel_id
                    where true
                    and ccs.corporateclients_id = ?
                    group by ccs.corporateclients_id`;

            const orderPriceResult = await common.simpleSelect(sequelize, orderPriceStr, [corporateclients_id]);
            let total_price = 0;
            orderPriceResult.forEach(subItem => {
                total_price += subItem.total_price;
            });
            item.total_price = total_price;

            const invoiceTypeStr =
                `select i.invoice_type, sum(m.materiel_price) as total_materiel_price 
                    from tbl_erc_taxinvoice i 
                    left join tbl_erc_taxinvoicmateriel m on (i.invoice_id = m.invoice_id and m.state=1)
                    where true
                    and i.corporateclients_id = ?
                    group by i.invoice_type`

            // `select
            //         invoice_type, sum(materiel_price) as total_materiel_price
            //         from tbl_erc_taxinvoice
            //         where true
            //         and corporateclients_id = ?
            //         group by invoice_type`;

            const invoiceTypeResult = await common.simpleSelect(sequelize, invoiceTypeStr, [corporateclients_id]);
            let total_invoice_price = 0;
            invoiceTypeResult.forEach(invoiceTypeItem => {
                const {
                    invoice_type,
                    total_materiel_price
                } = invoiceTypeItem;
                switch (invoice_type) {
                    case GLBConfig.TAX_INVOICE_TYPE[0].value:
                        item.total_price_a = total_materiel_price;
                        total_invoice_price += total_materiel_price;
                        break;

                    case GLBConfig.TAX_INVOICE_TYPE[1].value:
                        item.total_price_b = total_materiel_price;
                        total_invoice_price += total_materiel_price;
                        break;

                    case GLBConfig.TAX_INVOICE_TYPE[2].value:
                        item.total_price_c = total_materiel_price;
                        total_invoice_price += total_materiel_price;
                        break;

                    case GLBConfig.TAX_INVOICE_TYPE[3].value:
                        item.total_price_d = total_materiel_price;
                        total_invoice_price += total_materiel_price;
                        break;
                }
            });
            item.total_invoice_price = total_invoice_price;
            item.no_invoice_price = total_price - total_invoice_price;
        }

        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getInvoiceAlreadyDetail(req, res) {
    const {
        body,
        user
    } = req;
    const {
        corporateclients_id
    } = body;
    const {
        domain_id
    } = user;
    const returnData = {};

    try {
        let queryStr =
            `select
                ti.*
                from tbl_erc_taxinvoice ti
                where ti.state = ?
                and ti.corporateclients_id = ?
                and ti.domain_id = ?`;

        const replacements = [GLBConfig.ENABLE, corporateclients_id, domain_id];

        if (body.search_text) {
            queryStr += ` and (ti.materiel_code = ? or ti.materiel_name = ?)`;
            replacements.push(body.search_text);
            replacements.push(body.search_text);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function modifyTaxInvoiceDetail(req, res) {
    const {
        body
    } = req;

    try {
        const {
            invoice_id,
            invoice_code,
            invoice_type,
            materiel_code,
            materiel_name,
            materiel_format,
            materiel_unit,
            materiel_amount,
            materiel_tax_price,
            materiel_tax,
        } = body.new;

        const result = await tb_taxinvoice.findOne({
            where: {
                invoice_id
            }
        });

        if (result) {
            result.invoice_code = invoice_code;
            result.invoice_type = invoice_type;
            // result.materiel_code = materiel_code;
            // result.materiel_name = materiel_name;
            // result.materiel_format = materiel_format;
            // result.materiel_unit = materiel_unit;
            // result.materiel_amount = parseInt(materiel_amount);
            // result.materiel_tax_price = parseInt(materiel_tax_price);
            // result.materiel_tax = parseInt(materiel_tax);
            // result.materiel_price = (result.materiel_amount * result.materiel_tax_price) - result.materiel_tax;
            await result.save();
        }

        common.sendData(res, result);
    } catch (error) {
        logger.error(error.message);
    }
}


async function deleteTaxInvoiceDetail(req, res) {
    const {
        body
    } = req;

    try {
        const {
            invoice_id
        } = body;
        const result = await tb_taxinvoice.destroy({
            where: {
                invoice_id
            }
        });
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getSaleInvoiceList(req, res) {
    const {
        user
    } = req;
    const {
        domain_id
    } = user;
    const returnData = {};

    try {
        const dataList = [];
        GLBConfig.SALE_INVOICE_TYPE.forEach(({
            value
        }) => {
            dataList.push({
                invoice_type: value,
                buy_amount: 0,
                cancel_amount: 0,
                destroy_amount: 0,
                out_amount: 0
            });
        });

        const saleInvoiceQueryStr =
            `select
                si.invoice_type, si.invoice_amount, si.manage_type
                from tbl_erc_saleinvoice si
                where true
                and si.domain_id = ?`;

        const saleInvoiceResult = await common.simpleSelect(sequelize, saleInvoiceQueryStr, [domain_id]);
        for (const saleInvoiceItem of saleInvoiceResult) {
            const {
                invoice_type,
                invoice_amount,
                manage_type
            } = saleInvoiceItem;
            if (invoice_type === GLBConfig.SALE_INVOICE_TYPE[0].value) {
                if (manage_type === GLBConfig.INVOICE_MANAGE_TYPE[0].value) {
                    dataList[0].buy_amount += invoice_amount;
                } else if (manage_type === GLBConfig.INVOICE_MANAGE_TYPE[1].value) {
                    dataList[0].cancel_amount += invoice_amount;
                } else if (manage_type === GLBConfig.INVOICE_MANAGE_TYPE[2].value) {
                    dataList[0].destroy_amount += invoice_amount;
                }
            } else if (invoice_type === GLBConfig.SALE_INVOICE_TYPE[1].value) {
                if (manage_type === GLBConfig.INVOICE_MANAGE_TYPE[0].value) {
                    dataList[1].buy_amount += invoice_amount;
                } else if (manage_type === GLBConfig.INVOICE_MANAGE_TYPE[1].value) {
                    dataList[1].cancel_amount += invoice_amount;
                } else if (manage_type === GLBConfig.INVOICE_MANAGE_TYPE[2].value) {
                    dataList[1].destroy_amount += invoice_amount;
                }
            } else if (invoice_type === GLBConfig.SALE_INVOICE_TYPE[2].value) {
                if (manage_type === GLBConfig.INVOICE_MANAGE_TYPE[0].value) {
                    dataList[2].buy_amount += invoice_amount;
                } else if (manage_type === GLBConfig.INVOICE_MANAGE_TYPE[1].value) {
                    dataList[2].cancel_amount += invoice_amount;
                } else if (manage_type === GLBConfig.INVOICE_MANAGE_TYPE[2].value) {
                    dataList[2].destroy_amount += invoice_amount;
                }
            } else if (invoice_type === GLBConfig.SALE_INVOICE_TYPE[3].value) {
                if (manage_type === GLBConfig.INVOICE_MANAGE_TYPE[0].value) {
                    dataList[3].buy_amount += invoice_amount;
                } else if (manage_type === GLBConfig.INVOICE_MANAGE_TYPE[1].value) {
                    dataList[3].cancel_amount += invoice_amount;
                } else if (manage_type === GLBConfig.INVOICE_MANAGE_TYPE[2].value) {
                    dataList[3].destroy_amount += invoice_amount;
                }
            }
        }

        const taxInvoiceQueryStr =
            `select
                invoice_type, count(*) as out_amount
                from tbl_erc_taxinvoice
                where true
                and domain_id = ?
                group by invoice_type`;

        const taxInvoiceResult = await common.simpleSelect(sequelize, taxInvoiceQueryStr, [domain_id]);
        for (const taxInvoiceItem of taxInvoiceResult) {
            const {
                invoice_type,
                out_amount
            } = taxInvoiceItem;
            if (invoice_type === GLBConfig.SALE_INVOICE_TYPE[0].value) {
                dataList[0].out_amount = out_amount;
            } else if (invoice_type === GLBConfig.SALE_INVOICE_TYPE[1].value) {
                dataList[1].out_amount = out_amount;
            } else if (invoice_type === GLBConfig.SALE_INVOICE_TYPE[2].value) {
                dataList[2].out_amount = out_amount;
            } else if (invoice_type === GLBConfig.SALE_INVOICE_TYPE[3].value) {
                dataList[3].out_amount = out_amount;
            }
        }

        returnData.total = dataList.length;
        returnData.rows = dataList.map(item => {
            const {
                buy_amount,
                out_amount,
                cancel_amount,
                destroy_amount
            } = item;
            return {
                ...item,
                blank_amount: buy_amount - out_amount - cancel_amount - destroy_amount
            }
        });

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getSaleInvoiceDetail(req, res) {
    const {
        body,
        user
    } = req;
    const {
        domain_id
    } = user;
    const returnData = {};

    try {
        const {
            manage_type
        } = body;

        const queryStr =
            `select
                si.invoice_type, si.start_invoice_code, si.end_invoice_code, si.invoice_amount
                from tbl_erc_saleinvoice si
                where true
                and si.domain_id = ?
                and si.manage_type = ?`;

        const replacements = [domain_id, manage_type];
        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function addSaleInvoice(req, res) {
    const {
        body,
        user
    } = req;
    const {
        domain_id
    } = user;

    try {
        const {
            start_invoice_code,
            end_invoice_code,
            invoice_type,
            invoice_amount,
            manage_type
        } = body;

        const result = await tb_saleinvoice.create({
            start_invoice_code,
            end_invoice_code,
            invoice_type,
            invoice_amount,
            manage_type,
            domain_id
        });

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getPurchaseInvoiceList(req, res) {
    const {
        user
    } = req;
    const {
        domain_id
    } = user;
    const returnData = {};

    try {
        const queryStr =
            `select
                spl.supplier_id, spl.supplier, spl.supplier_name, gsi.out_price, gsi.invoice_count
                from tbl_erc_supplier spl
                left join (
                select
                spi.supplier_id
                , sum(spi.materiel_price) + sum(spi.materiel_tax) as out_price
                , count(*) as invoice_count
                from tbl_erc_supplierinvoice spi
                where true
                group by spi.supplier_id) gsi
                on spl.supplier_id = gsi.supplier_id
                where true
                and spl.domain_id = ?`;

        const replacements = [domain_id];
        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;

        for (const subItem of result.data) {
            const {
                supplier_id,
                out_price
            } = subItem;
            const itemQueryStr =
                `select
                    ia.account_operate_amount * pd.purchase_price as total_price
                    , sp.supplier_id, sp.supplier_name
                    from tbl_erc_inventoryaccount ia
                    left join tbl_erc_inventoryorder io
                    on ia.bill_code = io.bill_code
                    left join tbl_erc_purchasedetail pd
                    on ia.order_id = pd.order_ids
                    left join tbl_erc_supplier sp
                    on io.supplier_code = sp.supplier
                    where true
                    and sp.supplier_id = ?
                    and ia.account_operate_type = 1`;

            const subResult = await common.simpleSelect(sequelize, itemQueryStr, [supplier_id]);
            let total_price = 0;
            subResult.forEach(item => {
                total_price += item.total_price;
            });

            subItem.total_price = total_price;
            subItem.remain_price = total_price - out_price;
        }

        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getPurchaseInvoiceDetail(req, res) {
    const {
        body,
        user
    } = req;
    const {
        domain_id
    } = user;
    const returnData = {};

    try {
        const {
            supplier_id,
            search_text
        } = body;

        let queryStr =
            `select
                spi.*
                from tbl_erc_supplierinvoice spi
                where true
                and spi.domain_id = ?
                and spi.supplier_id = ?`;

        const replacements = [domain_id, supplier_id];

        if (search_text) {
            queryStr += ` and (spi.materiel_code like ? or spi.materiel_name like ?)`;
            replacements.push(search_text);
            replacements.push(search_text);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function addPurchaseInvoice(req, res) {
    const {
        body,
        user
    } = req;

    try {
        const {
            supplier_id,
            invoice_code,
            materiel_code,
            materiel_name,
            materiel_format,
            materiel_unit,
            materiel_amount,
            materiel_tax_price,
            materiel_tax,
            materiel_price
        } = body;
        const {
            domain_id
        } = user;

        const result = await tb_supplierinvoice.create({
            supplier_id,
            invoice_code,
            materiel_code,
            materiel_name,
            materiel_format,
            materiel_unit,
            materiel_amount,
            materiel_tax_price,
            materiel_tax,
            materiel_price,
            domain_id
        });

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function modifyPurchaseInvoice(req, res) {
    const {
        body
    } = req;

    try {
        const {
            invoice_id,
            invoice_code,
            materiel_code,
            materiel_name,
            materiel_format,
            materiel_unit,
            materiel_amount,
            materiel_tax_price,
            materiel_tax,
        } = body.new;

        const result = await tb_supplierinvoice.findOne({
            where: {
                invoice_id
            }
        });

        if (result) {
            result.invoice_code = invoice_code;
            result.materiel_code = materiel_code;
            result.materiel_name = materiel_name;
            result.materiel_format = materiel_format;
            result.materiel_unit = materiel_unit;
            result.materiel_amount = parseInt(materiel_amount);
            result.materiel_tax_price = parseInt(materiel_tax_price);
            result.materiel_tax = parseInt(materiel_tax);
            result.materiel_price = (result.materiel_amount * result.materiel_tax_price) - result.materiel_tax;
            await result.save();
        }

        common.sendData(res, result);
    } catch (error) {
        logger.error(error.message);
    }
}

async function getTaxInvoicMateriel(req, res) {
    const {
        body
    } = req
    const returnData = {}
    try {
        let queryStr = `select * from tbl_erc_taxinvoicmateriel where state=1 and invoice_id=?`;
        const replacements = [body.invoice_id];
        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function deleteInvoiceMateriel(req, res) {
    const {
        body
    } = req
    try {
        await tb_taxinvoicemateriel.update({
            state: 0,
        }, {
            where: {
                taxinvoicmateriel_id: body.taxinvoicmateriel_id
            }
        })
        common.sendData(res, {});
    } catch (error) {
        common.sendFault(res, error);
    }
}