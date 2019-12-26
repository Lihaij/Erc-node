const fs = require('fs');
const path = require('path');
const iconvLite = require('iconv-lite');
const moment = require('moment');

const config = require('../../../config');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCCustomerBControlResource');
const model = require('../../../model');
const ERCAccountingControlSRV = require('../cashiermanage/ERCAccountingControlSRV')

const sequelize = model.sequelize;
const tb_corporateclients = model.erc_corporateclients
const tb_creditlinedetail = model.erc_creditlinedetail
const tb_taxinvoice = model.erc_taxinvoice

const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

exports.ERCCustomerBControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'addCorporateclients') {
        addCorporateclients(req, res)
    } else if (method === 'delCorporateclients') {
        delCorporateclients(req, res)
    } else if (method === 'modifyCorporateclients') {
        modifyCorporateclients(req, res)
    } else if (method === 'modifyCorporateUser') {
        modifyCorporateUser(req, res)
    } else if (method === 'getCorporateclients') {
        getCorporateclients(req, res)
    } else if (method === 'getCashOrder') {
        getCashOrder(req, res)
    } else if (method === 'getOrder') {
        getOrder(req, res)
    } else if (method === 'modifyCreditLine') {
        modifyCreditLine(req, res)
    } else if (method === 'searchCreditLineDetail') {
        searchCreditLineDetail(req, res)
    } else if (method === 'modifyRespUser') {
        modifyRespUser(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};

async function getBaseType(code) {
    try {
        let returnData = [],
            replacements = []
        let queryStr = `select d.*, t.basetype_code from tbl_erc_basetypedetail d,tbl_erc_basetype t
             where d.basetype_id=t.basetype_id and t.basetype_code=?`;
        replacements.push(code)
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        for (let r of result) {
            returnData.push({
                id: r.basetypedetail_id,
                value: r.basetypedetail_id,
                text: r.typedetail_name,
            })
        }
        return returnData
    } catch (error) {
        throw error
    }
}

async function getProcedureType(domain_id, codeType) {
    let queryStr =
        `select
            t.basetypedetail_id as id, t.typedetail_name as text
            from tbl_erc_basetypedetail t
            left join tbl_erc_basetype rt
            on t.basetype_id = rt.basetype_id
            where t.state = ?
            and t.domain_id = ?
            and basetype_code = ?`;

    const replacements = [GLBConfig.ENABLE, domain_id, codeType];
    queryStr += ' order by t.created_at desc';
    return await common.simpleSelect(sequelize, queryStr, replacements);
}

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
async function initAct(req, res) {
    try {
        let returnData = {}
        returnData.JSFS = await getBaseType('JSFS');
        returnData.JGTX = await getPriceTemplate(req.user);
        returnData.CUSTOM_CATEGORY = await getProcedureType(req.user.domain_id, 'KHLB');
        returnData.ORDERCHECKSTATE = GLBConfig.ORDERCHECKSTATE;
        returnData.CASHIERGATHERINGSTATE = GLBConfig.CASHIERGATHERINGSTATE;
        returnData.CORPORATECLIENTSCLASS = GLBConfig.CORPORATECLIENTSCLASS;
        returnData.creditLineDetailType = GLBConfig.CREDITLINEDETAILTYPE;
        returnData.CORPORATECLIENTSSCOPE = GLBConfig.CORPORATECLIENTSSCOPE;
        returnData.CREDITLINEDETAILDETAILTYPE = GLBConfig.CREDITLINEDETAILDETAILTYPE;
        returnData.INVOICETYPE = [{
                id: '0',
                value: '0',
                text: '普通发票'
            },
            {
                id: '1',
                value: '1',
                text: '专用发票'
            },
        ];
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
async function addCorporateclients(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let addResult = await tb_corporateclients.create({
            corporateclients_no: doc.corporateclients_no, //工商注册号
            domain_id: user.domain_id,
            corporateclients_name: doc.corporateclients_name, //客户名称
            corporateclients_type: doc.corporateclients_type, //客户类型  从价格模板选取
            corporateclients_address: doc.corporateclients_address, //客户地址
            corporateclients_contact_phone: doc.corporateclients_contact_phone, //客户电话
            corporateclients_legal_person: doc.corporateclients_legal_person, //法人代表
            corporateclients_way: doc.corporateclients_way, //结算方式 预付后款到发货  月结结算
            corporateclients_advance_ratio: doc.corporateclients_advance_ratio ? doc.corporateclients_advance_ratio : 0, //预付比例
            corporateclients_number_days: doc.corporateclients_number_days ? doc.corporateclients_number_days : 0, //月结天数
            corporateclients_creditline: doc.corporateclients_creditline ? doc.corporateclients_creditline : 0, //信用额度
            corporateclients_creditline_use: 0, //已使用的信用额度
            corporateclients_class: doc.corporateclients_class, //0品牌体系客户  1定制体系客户
            corporateclients_category: doc.corporateclients_category,
            invoice_type: doc.invoice_type, //0普通发票 1专用发票
            resp_user_id: doc.resp_user_id
        });

        //默认增加信用额度余额，余额=信用额度上限
        if (Number(doc.corporateclients_creditline) > 0) {
            let creditlinedetail = await tb_creditlinedetail.create({
                corporateclients_id: addResult.corporateclients_id, //企业客户id
                creditlinedetail_type: '1', //类型  1增加2减少
                creditlinedetail_businessid: '', //业务单号
                creditlinedetail_money: Number(doc.corporateclients_creditline), //金额  本次收款或支出的金额
                creditlinedetail_surplus_creditline: Number(doc.corporateclients_creditline), //结余信用额度
                creditlinedetail_surplus_advance: 0, //结余预付款金额
                creditlinedetail_detail_type: 0 //0信用，1预付款
            });
        }

        //添加会计科目详情
        await ERCAccountingControlSRV.addAccountingDetail(1122, addResult.corporateclients_id, user.domain_id, '1');
        await ERCAccountingControlSRV.addAccountingDetail(1231, addResult.corporateclients_id, user.domain_id, '1');
        await ERCAccountingControlSRV.addAccountingDetail(2241, addResult.corporateclients_id, user.domain_id, '1');

        common.sendData(res, addResult);
    } catch (error) {
        common.sendFault(res, error);
    }
}
async function delCorporateclients(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let delResult = await tb_corporateclients.findOne({
            where: {
                corporateclients_id: doc.corporateclients_id,
                state: GLBConfig.ENABLE
            }
        });

        if (delResult) {
            delResult.state = GLBConfig.DISABLE;
            await delResult.save();
            common.sendData(res);
            return
        } else {
            common.sendError(res, 'estate_01');
            return
        }
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
async function modifyCorporateclients(req, res) {
    try {
        let doc = common.docTrim(req.body)

        let modCorporateclients = await tb_corporateclients.findOne({
            where: {
                corporateclients_id: doc.old.corporateclients_id
            }
        });

        if (modCorporateclients) {
            modCorporateclients.corporateclients_no = doc.new.corporateclients_no //工商注册号
            modCorporateclients.corporateclients_name = doc.new.corporateclients_name //客户名称
            modCorporateclients.corporateclients_type = doc.new.corporateclients_type //客户类型  从价格模板选取
            modCorporateclients.corporateclients_address = doc.new.corporateclients_address //客户地址
            modCorporateclients.corporateclients_contact_phone = doc.new.corporateclients_contact_phone //客户电话
            modCorporateclients.corporateclients_legal_person = doc.new.corporateclients_legal_person //法人代表
            modCorporateclients.corporateclients_way = doc.new.corporateclients_way //结算方式 预付后款到发货  月结结算
            modCorporateclients.corporateclients_advance_ratio = doc.new.corporateclients_advance_ratio //预付比例
            modCorporateclients.corporateclients_number_days = doc.new.corporateclients_number_days //月结天数
            modCorporateclients.corporateclients_creditline = Number(doc.new.corporateclients_creditline) //信用额度
            modCorporateclients.corporateclients_creditline_use = doc.new.corporateclients_creditline_use //已使用的信用额度
            modCorporateclients.corporateclients_class = doc.new.corporateclients_class //已使用的信用额度
            modCorporateclients.corporateclients_category = doc.new.corporateclients_category //已使用的信用额度
            modCorporateclients.corporateclients_scope = doc.new.corporateclients_scope //信用额度范围
            modCorporateclients.invoice_type = doc.new.invoice_type //客户适用发票类型
            await modCorporateclients.save()
        } else {
            return common.sendError(res, '客户不存在');
        }
        common.sendData(res, modCorporateclients);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function modifyCorporateUser(req, res) {
    const { body } = req;

    try {
        const { corporateclients_id, resp_user_id } = body;
        const result = await tb_corporateclients.findOne({
            where: {
                corporateclients_id
            }
        });

        if (result) {
            result.resp_user_id = resp_user_id;
            await result.save();
        }

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getCorporateclients(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let returnData = {};
        let replacements = [],
            queryStr, result;
        let user = req.user;

        queryStr =
            `select
             ccs.*, usr.name
             from tbl_erc_corporateclients ccs
             left join tbl_common_user usr
             on ccs.resp_user_id = usr.user_id
             where ccs.state=1 and ccs.domain_id=?`
        replacements.push(user.domain_id)
        if (doc.corporateclients_id) {
            queryStr += ` and ccs.corporateclients_id = ?`
            replacements.push(doc.corporateclients_id)
        }
        if(doc.search_text){
            queryStr += ` and ccs.corporateclients_name like ?`
            replacements.push('%' + doc.search_text + '%')
        }
        if(doc.corporateclients_class){
            queryStr += ` and ccs.corporateclients_class = ?`
            replacements.push(doc.corporateclients_class )
        }
        queryStr +=` order by corporateclients_id desc`
        result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        if (doc.corporateclients_id) {
            //客户的可用余额
            let creditlinedetail = await tb_creditlinedetail.findAll({
                where: {
                    corporateclients_id: doc.corporateclients_id,
                    state: GLBConfig.ENABLE
                }
            });
            let currentSumCreditline = 0, //当前信用额度余额
                currentSumAdvance = 0 //当前预付款余额
            for (let c of creditlinedetail) {
                if (c.creditlinedetail_detail_type == 0) {
                    if (c.creditlinedetail_type == 1) {
                        currentSumCreditline += Number(c.creditlinedetail_money)
                    } else {
                        currentSumCreditline -= Number(c.creditlinedetail_money)
                    }
                } else {
                    if (c.creditlinedetail_type == 1) {
                        currentSumAdvance += Number(c.creditlinedetail_money)
                    } else {
                        currentSumAdvance -= Number(c.creditlinedetail_money)
                    }
                }
            }
            returnData.rows[0].currentSumAdvance = currentSumAdvance
            returnData.rows[0].currentSumCreditline = currentSumCreditline
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}


//查询客户的销售单据
async function getOrder(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let returnData = {};

        let queryStr = `select 
            o.order_id,o.created_at,o.order_review_state,o.biz_code
            , sum(m.sale_price * m.materiel_amount) as sumMoney 
            from tbl_erc_order o
            left join tbl_erc_corporateclients c on (o.purchaser_corporateclients_id=c.corporateclients_id and c.state=1)
            left join tbl_erc_ordermateriel m on (o.order_id= m.order_id and m.state=1) 
            where o.state=1 and o.domain_id=? and corporateclients_id = ?`;
        let replacements = [user.domain_id, doc.corporateclients_id];
        if (doc.search_text) {
            queryStr += ' and (o.order_id like ? )';
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text)
        }
        queryStr += ` group by o.order_id,o.created_at,o.order_review_state order by o.created_at desc`
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
        return common.sendFault(res, error);
    }
}

async function getOrderMoney(order) {
    let queryStr = `select 
            sum(m.materiel_amount * m.sale_price) as orderMoney 
            from tbl_erc_ordermateriel m
            where m.order_id=?`
    let replacements = [order];
    let result = await sequelize.query(queryStr, {
        replacements: replacements,
        type: sequelize.QueryTypes.SELECT
    })
    return result[0].orderMoney
}
// 查询客户的付款单据
async function getCashOrder(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        let returnData = {};
        let orderArr = []

        //todo 出库增加表

        let queryStr = `select 
            created_at as created_at,
            cashiergathering_code as businessCode,
            '收款单' as businessName,
            '' as outMoney,
            cashiergathering_gathering_money as incomeMoney,
            cashiergathering_order_balance as balance,
            cashiergathering_order_id as orderId 
            from tbl_erc_cashiergathering where state=1 and domain_id=? 
            and cashiergathering_customer_code=? and cashiergathering_state=2 and cashiergathering_order_id<>''
            union all 
            select 
            s.created_at as created_at,
            pricerecord_id as businessCode,
            '销售出库单' as businessName,
            sale_price as outMoney,
            '' as incomeMoney,
            remain_price as balance,
            s.order_id as orderId 
            from tbl_erc_sopricerecord s
            left join tbl_erc_order o on (s.order_id=o.order_id and o.state=1)
            where s.state=1 and o.domain_id=? and o.purchaser_corporateclients_id=?`
        let replacements = [user.domain_id, doc.corporateclients_id, user.domain_id, doc.corporateclients_id];

        let count = await sequelize.query('select count(*) num from (' + queryStr + ') as count', {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        })
        replacements.push(doc.offset || 0)
        replacements.push(doc.limit || 100)

        let queryRst = await sequelize.query('select * from (' + queryStr + ') as a order by created_at LIMIT ?,? ', {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        })

        // let result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);

        returnData.total = count[0].num;
        returnData.rows = [];
        for (let ap of queryRst) {
            let d = JSON.parse(JSON.stringify(ap));
            // if (Buffer.isBuffer(ap.businessMoney)) {
            //     d.businessMoney = decoder.write(Buffer.from(ap.businessMoney))
            //     d.create_time = decoder.write(Buffer.from(ap.create_time))
            // }

            d.created_at = ap.created_at ? moment(ap.created_at).format("YYYY-MM-DD HH:mm") : null;
            returnData.rows.push(d)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//修改信用额度信息
async function modifyCreditLine(req, res) {
    try {
        let doc = common.docTrim(req.body);

        //客户信息
        let corporateclients = await tb_corporateclients.findOne({
            where: {
                state: 1,
                corporateclients_id: doc.corporateclients_id
            }
        })


        //客户的可用余额
        let creditlinedetail = await tb_creditlinedetail.findAll({
            where: {
                corporateclients_id: doc.corporateclients_id,
                state: GLBConfig.ENABLE
            }
        });


        let currentSumCreditline = 0, //当前信用额度余额
            currentSumAdvance = 0 //当前预付款余额
        for (let c of creditlinedetail) {
            if (c.creditlinedetail_detail_type == 0) {
                if (c.creditlinedetail_type == 1) {
                    currentSumCreditline += Number(c.creditlinedetail_money)
                } else {
                    currentSumCreditline -= Number(c.creditlinedetail_money)
                }
            } else {
                if (c.creditlinedetail_type == 1) {
                    currentSumAdvance += Number(c.creditlinedetail_money)
                } else {
                    currentSumAdvance -= Number(c.creditlinedetail_money)
                }
            }
        }

        if (Number(doc.currentSumCreditline) > Number(corporateclients.corporateclients_creditline)) {
            common.sendErrorDefined(res, `余额大于信用额度上限，请重新输入金额`)
            return
        }
        // if ((currentSumCreditline + Number(doc.addCreditline)) > Number(corporateclients.corporateclients_creditline)) {
        //     common.sendErrorDefined(res, `增加额度大于信用额度上限，请重新输入金额`)
        //     return
        // }
        // 增加信用额度
        creditlinedetail = await tb_creditlinedetail.create({
            corporateclients_id: doc.corporateclients_id, //企业客户id
            creditlinedetail_type: '1', //类型  1增加2减少
            creditlinedetail_businessid: '', //业务单号
            creditlinedetail_money: Number(doc.currentSumCreditline) - Number(currentSumCreditline), //金额  本次收款或支出的金额
            creditlinedetail_surplus_creditline: Number(doc.currentSumCreditline), //结余信用额度
            creditlinedetail_surplus_advance: currentSumAdvance, //结余预付款金额
            creditlinedetail_detail_type: 0 //0信用，1预付款
        });
        common.sendData(res, creditlinedetail);
    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}
//查询信用额度详情
async function searchCreditLineDetail(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};

        let queryStr = 'select d.*,(d.creditlinedetail_surplus_creditline+d.creditlinedetail_surplus_advance) as total_surplus_money' +
            ' from tbl_erc_creditlinedetail d where d.state = 1 and d.corporateclients_id = ?';
        replacements.push(doc.corporateclients_id);
        if (doc.search_text) {
            queryStr += ' and creditlinedetail_businessid like ?';
            replacements.push(('%' + doc.search_text + '%'));
        }
        if (doc.creditlinedetail_type) {
            queryStr += ' and creditlinedetail_type = ?';
            replacements.push(doc.creditlinedetail_type);
        }
        if (doc.createdBeginTime) {
            queryStr += ' and created_at >= ?';
            replacements.push(doc.createdBeginTime + ' 00:00:00');
        }
        if (doc.createdEndTime) {
            queryStr += ' and created_at <= ?';
            replacements.push(doc.createdEndTime + ' 23:59:59');
        }
        queryStr += ' order by d.created_at'
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at ? moment(r.created_at).format("YYYY-MM-DD HH:mm") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function modifyRespUser(req, res) {
    try {
        const {
            body
        } = req;
        const {
            corporateclients_id,
            resp_user_id
        } = body;

        const result = await tb_corporateclients.findOne({
            where: {
                corporateclients_id
            }
        });

        if (result) {
            result.resp_user_id = resp_user_id;
            await result.save();

            const taxInvoice = await tb_taxinvoice.findOne({
                where: {
                    corporateclients_id
                }
            });
            if (taxInvoice) {
                taxInvoice.resp_user_id = resp_user_id;
                await taxInvoice.save();
            }

            common.sendData(res);
        } else {
            common.sendError(res, 'estate_01');
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}
