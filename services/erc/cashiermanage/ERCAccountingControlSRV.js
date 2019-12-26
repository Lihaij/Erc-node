const common = require('../../../util/CommonUtil');
// const AccountConst = require('../../../util/AccountConst');
const logger = require('../../../util/Logger').createLogger('ERCAccountingControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const ERCRecord = require('./ERCRecordingVoucherCustomControlSRV');
const GLBConfig = require('../../../util/GLBConfig');
const ERCTaskListControlSRV = require('../baseconfig/ERCTaskListControlSRV')
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;

const {
    CODE_NAME,
    genBizCode
} = require('../../../util/BizCodeUtil');

const moment = require('moment');
const sequelize = model.sequelize;
const tb_accountdetail = model.erc_accountingdetail;
const tb_accounting = model.erc_accounting;
const tb_basetypedetail = model.erc_basetypedetail;
const tb_recordingvoucherdetailsc = model.erc_recordingvoucherdetailsc;
const tb_recordingvouchersc = model.erc_recordingvouchersc
exports.ERCAccountingControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'getAccountingList') {
        getAccountingList(req, res);
    } else if (method === 'getDetail') {
        getDetailAct(req, res);
    } else if (method === 'modifyDetail') {
        modifyDetailAct(req, res);
    } else if (method === 'submitDetail') {
        submitDetailAct(req, res);
    } else if (method === 'modifyAccount') {
        modifyAccountAct(req, res);
    } else if (method === 'submitAccount') {
        submitAccountingAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

async function getAccountingList(req, res) {
    try {
        /*const accountingList = [];
            return {
                code: item,
                name: AccountConst.nameArray[index],
                detail: AccountConst.detailArray[index],
                type: AccountConst.typeArray[index],
            };
        });

        let arr = []
        for (let a of accountingList) {
            let accounting = await tb_accounting.findOne({
                where: {
                    accounting_code: a.code,
                    domain_id: req.user.domain_id
                }
            });
            if (!accounting) {
                arr.push(a)
            } else {
                console.log(a)
                arr.push({
                    // ...a,
                    code: a.code,
                    name: a.name,
                    detail: a.detail,
                    type: a.type,
                    total_borrow_balance: accounting.total_borrow_balance / 100,
                    total_loan_balance: accounting.total_loan_balance / 100,
                    total_init_before_borrow_money: accounting.total_init_before_borrow_money / 100,
                    total_init_before_loan_money: accounting.total_init_before_loan_money / 100,
                    total_init_borrow_money: accounting.total_init_borrow_money / 100,
                    total_init_loan_money: accounting.total_init_loan_money / 100,
                    approval_state: accounting.approval_state
                })
            }

        }*/

        const queryStr =
            `select
                ats.accounting_subject_code as code
                , ats.accounting_subject_name as name
                , ats.accounting_subject_detail as detail
                , ats.accounting_subject_type_code as type
                , act.approval_state
                , act.total_borrow_balance / 100 as total_borrow_balance
                , act.total_loan_balance / 100 as total_loan_balance
                , act.total_init_before_borrow_money / 100 as total_init_before_borrow_money
                , act.total_init_before_loan_money / 100 as total_init_before_loan_money
                , act.total_init_borrow_money / 100 as total_init_borrow_money
                , act.total_init_loan_money / 100 as total_init_loan_money
                from tbl_erc_accounting act
                left join tbl_erc_accounting_subject ats
                on ats.accounting_subject_code = act.accounting_code
                where domain_id = ?`;
        const replacement = [ req.user.domain_id ];
        const result = await common.simpleSelect(sequelize, queryStr, replacement);

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//添加会计科目总金额
async function addAccounting(domainId, transaction) {
    /*AccountConst.codeArray.forEach(async (item, index) => {
        await tb_accounting.create({
            accounting_code: item,
            domain_id: domainId
        },{
            transaction: t
        });
    });*/

    let accountingArray = await getAccountingSubject();
    accountingArray = accountingArray.map(item => ({ accounting_code: item.accounting_subject_code, domain_id: domainId }));
    await tb_accounting.bulkCreate(accountingArray, { transaction });
}

//添加会计科目详情 仅包含写死在系统中的详情
async function addFinanceAccountingDetail(domainId, t) {

    //其他货币资金
    let replacements4 = []
    let queryStr4 = `select a.*
                    from tbl_erc_basetype m left join tbl_erc_basetypedetail a 
                    on m.basetype_id = a.basetype_id
                    where m.basetype_code='HBZJLX'`;
    let result4 = await sequelize.query(queryStr4, {
        replacements: replacements4,
        type: sequelize.QueryTypes.SELECT
    });
    for (let r of result4) {
        await tb_accountdetail.create({
            accounting_code: 1015,
            other_id: r.basetypedetail_id,
            domain_id: domainId,
        },{
            transaction: t
        });
    }

    //营业税金及附加
    let replacements3 = []
    let queryStr3 = `select a.*
                    from tbl_erc_basetype m left join tbl_erc_basetypedetail a 
                    on m.basetype_id = a.basetype_id
                    where m.basetype_code='YYSJJFJ'`;
    let result3 = await sequelize.query(queryStr3, {
        replacements: replacements3,
        type: sequelize.QueryTypes.SELECT
    });
    for (let r of result3) {
        await tb_accountdetail.create({
            accounting_code: 6405,
            other_id: r.basetypedetail_id,
            domain_id: domainId,
        },{
            transaction: t
        });
    }

    //应交税费
    let replacements2 = []
    let queryStr2 = `select a.*
                    from tbl_erc_basetype m left join tbl_erc_basetypedetail a 
                    on m.basetype_id = a.basetype_id
                    where m.basetype_code='YJSF'`;
    let result2 = await sequelize.query(queryStr2, {
        replacements: replacements2,
        type: sequelize.QueryTypes.SELECT
    });
    for (let r of result2) {
        await tb_accountdetail.create({
            accounting_code: 2221,
            other_id: r.basetypedetail_id,
            domain_id: domainId,
        },{
            transaction: t
        });
    }

    //应付职工薪酬
    let replacements1 = []
    let queryStr1 = `select a.*
                    from tbl_erc_basetype m left join tbl_erc_basetypedetail a 
                    on m.basetype_id = a.basetype_id
                    where m.basetype_code='YFZGXC'`;
    let result1 = await sequelize.query(queryStr1, {
        replacements: replacements1,
        type: sequelize.QueryTypes.SELECT
    });
    for (let r of result1) {
        await tb_accountdetail.create({
            accounting_code: 2211,
            other_id: r.basetypedetail_id,
            domain_id: domainId,
        },{
            transaction: t
        });
    }

    //财务费用
    let replacements = []
    let queryStr = `select a.*
                    from tbl_erc_basetype m left join tbl_erc_basetypedetail a 
                    on m.basetype_id = a.basetype_id
                    where m.basetype_code='CWFY'`;
    let result = await sequelize.query(queryStr, {
        replacements: replacements,
        type: sequelize.QueryTypes.SELECT
    });

    for (let r of result) {
        await tb_accountdetail.create({
            accounting_code: 6603,
            other_id: r.basetypedetail_id,
            domain_id: domainId,
        },{
            transaction: t
        });
    }
}

//添加无明细科目详情
async function addNoDetailAccountingDetail(domainId, t) {
    const arr = [1001, 1403, 1404, 1406, 1411, 1601, 1602, 1801, 5101, 6001, 6051, 6301, 6401, 6402, 6601, 6602, 6711, 6801, 4104, 1702]
    for (let item of arr) {
        await tb_accountdetail.create({
            accounting_code: item,
            domain_id: domainId
        },{
            transaction: t
        });
    }
}

//添加会计科目详情
async function addAccountingDetail(accountCode, otherId, domainId, accountingType) {
    if (!accountCode || !otherId || !domainId) {
        return;
    }
    await tb_accountdetail.create({
        accounting_code: accountCode,
        other_id: otherId,
        domain_id: domainId,
        accounting_type: accountingType
    });
}

function transformData(result) {
    for (let r of result) {
        r.borrow_balance = r.borrow_balance ? r.borrow_balance / 100 : null;
        r.loan_balance = r.loan_balance ? r.loan_balance / 100 : null;
        r.init_before_borrow_money = r.init_before_borrow_money ? r.init_before_borrow_money / 100 : null;
        r.init_before_loan_money = r.init_before_loan_money ? r.init_before_loan_money / 100 : null;
        r.init_borrow_money = r.init_borrow_money / 100;
        r.init_loan_money = r.init_loan_money / 100;
    }
    return result
}

//获取物料会计详情
async function getMateriel(user, accountingCode) {
    try {
        let replacements = [],
            returnData = []
        let queryStr = `select a.*, m.materiel_name as accounting_detail_name
                        from tbl_erc_materiel m left join tbl_erc_accountingdetail a 
                        on m.materiel_code = a.other_id
                        where m.state=1 and m.domain_id=? and a.accounting_code = ?`;
        replacements.push(user.domain_id, accountingCode);
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        return transformData(result)
    } catch (error) {
        throw error
    }
}

//按账号获取会计科目详情
async function getBankNo(user, accountingCode) {
    try {
        let replacements = [];
        let queryStr = `select a.* , b.companybankno_bank_no as accounting_detail_name
                        from tbl_erc_accountingdetail a left join tbl_erc_companybankno b
                        on a.other_id = b.companybankno_id
                        where b.state=1 and a.domain_id = ? and a.accounting_code = ?`;
        replacements.push(user.domain_id, accountingCode);
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        return transformData(result);
    } catch (error) {
        throw error
    }
}

//获取无明细科目详情
async function getNoDetail(user, accountingCode) {
    try {
        //一个公司下，不同accountingCode的明细科目只有一条
        let noDetails = await tb_accountdetail.findAll({
            where: {
                domain_id: user.domain_id,
                accounting_code: accountingCode
            }
        });
        return transformData(noDetails);
    } catch (error) {
        throw error
    }
}

async function getBaseTypeDetail(user, accountingCode) {
    try {
        let replacements = [];
        let queryStr = `select a.* , b.typedetail_name as accounting_detail_name
                        from tbl_erc_accountingdetail a left join tbl_erc_basetypedetail b
                        on a.other_id = b.basetypedetail_id
                        where b.state=1 and a.domain_id = ? and a.accounting_code = ?`;
        replacements.push(user.domain_id, accountingCode);
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        return transformData(result);
    } catch (error) {
        throw error
    }
}

//按客户
async function getCorporateclients(user, accountingCode, accountingType) {
    try {
        let replacements = []
        let queryStr = `select a.* , b.corporateclients_name as accounting_detail_name
                        from tbl_erc_accountingdetail a left join tbl_erc_corporateclients b
                        on a.other_id = b.corporateclients_id
                        where b.state=1 and a.domain_id=? and a.accounting_code = ? and a.accounting_type = ?`;
        replacements.push(user.domain_id, accountingCode, accountingType);
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        return transformData(result)
    } catch (error) {
        throw error
    }
}

//固定资产
async function getFixedassetscheckdetail(user, accountingCode) {
    try {
        let replacements = [];
        let queryStr = `select a.* , b.fixedassets_name as accounting_detail_name
                        from tbl_erc_accountingdetail a left join tbl_erc_fixedassetscheckdetail b
                        on a.other_id = b.fixedassetscheckdetail_id
                        where b.state=1 and a.domain_id=? and a.accounting_code = ?`;
        replacements.push(user.domain_id, accountingCode);
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        return transformData(result);
    } catch (error) {
        throw error
    }
}

//长期带滩资产
async function getAmortize(user, accountingCode) {
    try {
        let replacements = [];
        let queryStr = `select a.* , b.amortize_name as accounting_detail_name
                        from tbl_erc_accountingdetail a left join tbl_erc_amortize b
                        on a.other_id = b.amortize_id
                        where b.state=1 and a.domain_id=? and a.accounting_code = ?`;
        replacements.push(user.domain_id, accountingCode);

        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        return transformData(result);
    } catch (error) {
        throw error
    }
}

//按供应商
async function getSupplier(user, accountingCode, accountingType) {
    try {
        let replacements = [];
        let queryStr = `select a.* , b.supplier_name as accounting_detail_name
                        from tbl_erc_accountingdetail a left join tbl_erc_supplier b
                        on a.other_id = b.supplier_id
                        where b.state=1 and a.domain_id=? and a.accounting_code = ? and a.accounting_type = ?`;
        replacements.push(user.domain_id, accountingCode, accountingType);
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        return transformData(result);
    } catch (error) {
        throw error
    }
}

//按订单
async function getOrder(user, accountingCode) {
    try {
        let replacements = [];
        let queryStr = `select a.* , b.order_id as accounting_detail_name
                        from tbl_erc_accountingdetail a left join tbl_erc_order b
                        on a.other_id = b.order_id
                        where b.state=1 and a.domain_id=? and a.accounting_code = ?`;
        replacements.push(user.domain_id, accountingCode);
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        return transformData(result);
    } catch (error) {
        throw error
    }
}

//按其他相关主体
async function getOtherDetail(user, accountingCode, accountingType) {
    try {
        let replacements = [];
        let queryStr = `select a.* , b.other_main_name as accounting_detail_name
                        from tbl_erc_accountingdetail a left join tbl_erc_othermain b
                        on a.other_id = b.other_main_id
                        where b.state=1 and a.domain_id=? and a.accounting_code = ? and a.accounting_type = ?`;
        replacements.push(user.domain_id, accountingCode, accountingType);
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        return transformData(result);
    } catch (error) {
        throw error
    }
}

//按员工
async function getEmployeeDetail(user, accountingCode) {
    try {
        let replacements = [];
        let queryStr = `select a.* , b.name as accounting_detail_name
                        from tbl_erc_accountingdetail a left join tbl_common_user b
                        on a.other_id = b.user_id
                        where b.state=1 and a.domain_id=? and a.accounting_code = ?`;
        replacements.push(user.domain_id, accountingCode);
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        return transformData(result);
    } catch (error) {
        throw error
    }
}

async function getDetailAct(req, res) {
    try {


        // let baseType = await ERCRecord.getBaseType();
        // let HBZJLX = baseType.filter(item => item.basetype_code === 'HBZJLX' );//货币资金类型
        // let QTYSK = baseType.filter(item => item.basetype_code === 'QTYSK' );//其他应收款
        // let QTYFK = baseType.filter(item => item.basetype_code === 'QTYFK' );//其他应付款
        // let YFZGXC = baseType.filter(item => item.basetype_code === 'YFZGXC' );//应付职工薪酬
        // let YJSF = baseType.filter(item => item.basetype_code === 'YJSF' );//应交税费
        // let LRFP = baseType.filter(item => item.basetype_code === 'LRFP' );//利润分配
        // let QTYWSR = baseType.filter(item => item.basetype_code === 'QTYWSR' );//其他业务收入
        // let YYWSR = baseType.filter(item => item.basetype_code === 'YYWSR' );//营业外收入
        // let QTYWCB = baseType.filter(item => item.basetype_code === 'QTYWCB' );//其它业务成本
        const details = {
            1001: await getNoDetail(req.user, 1001), //库存现金,无明细科目
            1002: await getBankNo(req.user, 1002), //银行存款 按账号
            1015: await getBaseTypeDetail(req.user, 1015), //货币资金类型,写死
            1122: await getCorporateclients(req.user, 1122, '1'), //客户
            1231: [
                ...await getCorporateclients(req.user, 1231, '1'),
                ...await getSupplier(req.user, 1231, '2'),
                ...await getEmployeeDetail(req.user, 1231),
                ...await getOtherDetail(req.user, 1231, '4'),
            ], //其他应收款,客户+供应商+员工+其他相关主体
            1403: await getNoDetail(req.user, 1403), //原材料,无明细科目
            1404: await getNoDetail(req.user, 1404), //半成品,无明细科目
            1406: await getNoDetail(req.user, 1406), //库存商品,无明细科目
            1411: await getNoDetail(req.user, 1411), //委托加工物资,无明细科目
            1601: await getNoDetail(req.user, 1601), //固定资产
            1602: await getNoDetail(req.user, 1602), //累计折旧,无明细科目
            1801: await getNoDetail(req.user, 1801), //长期待摊费用
            2001: await getBankNo(req.user, 2001), //短期借款
            2202: await getSupplier(req.user, 2202, '2'), //供应商全称
            2211: await getBaseTypeDetail(req.user, 2211), //应付职工薪酬,写死
            2221: await getBaseTypeDetail(req.user, 2221), //应交税费,写死
            2241: [
                ...await getCorporateclients(req.user, 2241, '1'),
                ...await getSupplier(req.user, 2241, '2'),
                ...await getEmployeeDetail(req.user, 2241),
                ...await getOtherDetail(req.user, 2241, '4'),
            ], //其他应付款,客户+供应商+员工+其他相关主体
            4001: await getOtherDetail(req.user, 4001, '4'), //其他相关主体
            4104: await getNoDetail(req.user, 4104), //利润分配,相当于无明细科目
            5001: await getOrder(req.user, 5001), //生产成本，按订单
            5101: await getNoDetail(req.user, 5101), //制造费用,无明细科目
            6001: await getNoDetail(req.user, 6001), //主营业务收入,无明细科目
            6051: await getNoDetail(req.user, 6051), //其他业务收入,无明细科目
            6301: await getNoDetail(req.user, 6301), //营业外收入,无明细科目
            6401: await getNoDetail(req.user, 6401), //主营业务成本,无明细科目
            6402: await getNoDetail(req.user, 6402), //其它业务成本,无明细科目
            6405: await getBaseTypeDetail(req.user, 6405), //营业税金及附加,写死
            6601: await getNoDetail(req.user, 6601), //销售费用,,无明细科目
            6602: await getNoDetail(req.user, 6602), //管理费用,,无明细科目
            6603: await getBaseTypeDetail(req.user, 6603), //财务费用
            6711: await getNoDetail(req.user, 6711), //营业外支出,无明细科目
            6801: await getNoDetail(req.user, 6801), //所得税,无明细科目
            1702: await getNoDetail(req.user, 1702), //累计摊销,无明细科目
        };
        common.sendData(res, details);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function modifyDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let detail = await tb_accountdetail.findOne({
            where: {
                accounting_detail_id: doc.accounting_detail_id,
            }
        });
        if (detail) {
            //金额存是乘100，取出时在除100
            detail.borrow_balance = doc.borrow_balance * 100;
            detail.loan_balance = doc.loan_balance * 100;
            detail.init_before_borrow_money = doc.init_before_borrow_money * 100;
            detail.init_before_loan_money = doc.init_before_loan_money * 100;
            detail.init_borrow_money = doc.init_borrow_money * 100;
            detail.init_loan_money = doc.init_loan_money * 100;
            await detail.save();
        }
        common.sendData(res, detail);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function modifyAccountAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let detail = await tb_accounting.findOne({
            where: {
                accounting_code: doc.accounting_code,
                domain_id: user.domain_id
            }
        });
        if (detail) {
            //金额存是乘100，取出时在除100
            detail.total_borrow_balance = doc.total_borrow_balance * 100;
            detail.total_loan_balance = doc.total_loan_balance * 100;
            detail.total_init_before_borrow_money = doc.total_init_before_borrow_money * 100;
            detail.total_init_before_loan_money = doc.total_init_before_loan_money * 100;
            detail.total_init_borrow_money = doc.total_init_borrow_money * 100;
            detail.total_init_loan_money = doc.total_init_loan_money * 100;
            detail.approval_state = 1; //状态改为已提交
            await detail.save();
        }
        common.sendData(res, detail);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function submitDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        //判断原材料，半成品，库存商品，固定资产，累计折旧，长期待摊费用 费用是否与实际金额相等。
        let money = 0;
        if (doc.total_init_borrow_money > 0) money = (doc.total_init_borrow_money * 1);
        if (doc.total_init_loan_money > 0) money = (doc.total_init_loan_money * 1);
        const check = await checkPrice(req, doc.accounting_code, money, user);
        if (check && !check.equal) {
            if ((doc.accounting_code * 1) === 1403) return common.sendError(res, '', `输入金额与原材料的物料金额总和不相等,金额应为${check.total_price.toFixed(2)}`);
            if ((doc.accounting_code * 1) === 1404) return common.sendError(res, '', `输入金额与半成品的物料金额总和不相等,金额应为${check.total_price.toFixed(2)}`);
            if ((doc.accounting_code * 1) === 1406) return common.sendError(res, '', `输入金额与库存商品的物料金额总和不相等,金额应为${check.total_price.toFixed(2)}`);
            if ((doc.accounting_code * 1) === 1601) return common.sendError(res, '', `输入金额与外购固定资产原值总和不相等,金额应为${check.total_price.toFixed(2)}`);
            if ((doc.accounting_code * 1) === 1602) return common.sendError(res, '', `输入金额与外购固定资产已计提折旧金额总和不相等,金额应为${check.total_price.toFixed(2)}`);
            if ((doc.accounting_code * 1) === 1801) return common.sendError(res, '', `输入金额与待摊资产剩余摊销费用总和不相等,金额应为${check.total_price.toFixed(2)}`);
            if ((doc.accounting_code * 1) === 1411) return common.sendError(res, '', `输入金额与委外物资费用总和不相等,金额应为${check.total_price.toFixed(2)}`);
        }

        //修改总金额
        let accounting = await tb_accounting.findOne({
            where: {
                accounting_code: doc.accounting_code,
                domain_id: user.domain_id
            }
        });
        if (accounting) {
            //金额存是乘100，取出时在除100
            accounting.total_borrow_balance = doc.total_borrow_balance * 100;
            accounting.total_loan_balance = doc.total_loan_balance * 100;
            accounting.total_init_before_borrow_money = doc.total_init_before_borrow_money * 100;
            accounting.total_init_before_loan_money = doc.total_init_before_loan_money * 100;
            accounting.total_init_borrow_money = doc.total_init_borrow_money * 100;
            accounting.total_init_loan_money = doc.total_init_loan_money * 100;
            accounting.approval_state = 1; //状态改为已提交
            await accounting.save();
        }

        /*//修改详情状态 改为已提交
        let details = await tb_accountdetail.findAll({
            where: {
                accounting_detail_id: {
                    '$in': doc.ids,
                },
            }
        });
        //将approval_state改为 1 已提交
        for (let d of details) {
            d.approval_state = 1;
            await d.save();
        }*/

        //修改详情状态 改为已提交
        //将approval_state改为 1 已提交
        await tb_accountdetail.update({
            approval_state: 1
        }, {
            where: {
                accounting_detail_id: {
                    '$in': doc.ids,
                },
            }
        });

        await genRecordingVoucherData(user.domain_id, 1);

        common.sendData(res, '提交成功');
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function checkPrice(req, accountCode, money, user) {
    if ((accountCode * 1) === 1403 || (accountCode * 1) === 1404 || (accountCode * 1) === 1406) {
        //原材料，半成品，库存商品
        let sql = `select sum(s.price_amount) as total_price from tbl_erc_stockmap s
            left join tbl_erc_warehouse w on (s.warehouse_id = w.warehouse_id and w.state=1)
            left join tbl_erc_materiel m on (s.materiel_id = m.materiel_id and m.state = 1)
            where m.materiel_state_management = ? and w.warehouse_type <> '5' and s.domain_id = ${user.domain_id}`;
        let replacements = []
        if ((accountCode * 1) === 1403) replacements = ['4'];
        if ((accountCode * 1) === 1404) replacements = ['3'];
        if ((accountCode * 1) === 1406) replacements = ['0'];
        const [ result ] = await common.simpleSelect(sequelize, sql, replacements);
        if (!result) {
            throw new Error('无法取得库存信息');
        }

        // let totalPrice = 0;
        // for (const r of result.data) {
        //     totalPrice += (r.store_price * r.current_amount)
        // }
        if (result.total_price !== (money * 1)) {
            return {total_price: result.total_price, equal: false};
        }
    } else if ((accountCode * 1) === 1601 || (accountCode * 1) === 1602) {
        //固定资产，已计提折旧金额
        let sql = `select t.* from tbl_erc_fixedassetscheckdetail t
        inner join tbl_erc_fixedassetscheck tt on (t.fixedassetscheck_id = tt.fixedassetscheck_id and tt.check_state=3 and tt.state=1)
        where t.state=1 and tt.domain_id = ? and scrap_flag = '1'`
        const result = await common.queryPure(sequelize, sql, [user.domain_id]);
        let totalPrice = 0;
        for (const r of result.data) {
            if ((accountCode * 1) === 1601) {
                //固定资产原值总和
                totalPrice += r.original_value;
            } else {
                //已计提折旧金额总和
                totalPrice += (r.deprecition_price/100);
            }
        }
        if ((totalPrice * 1) !== (money * 1)) return {total_price: totalPrice, equal: false};
    } else if ((accountCode * 1) === 1801) {
        //长期待摊费用
        let sql = `select * from tbl_erc_amortize 
         where domain_id = ? and state = 1 and amortize_check_state = 2 and scrap_flag = '1'`;
        const result = await common.queryPure(sequelize, req, sql, [user.domain_id]);
        let totalPrice = 0;
        for (const r of result.data) {
            totalPrice += r.amortize_surplus_money;
        }
        if ((totalPrice * 1) !== (money * 1)) return {total_price: totalPrice, equal: false};
    } else if ((accountCode * 1) === 1411) {
        let sql =
            `select mat.store_price, (ptd.stock_out_number - pt.stock_in_number * ptd.design_number) as balance_number
            from tbl_erc_productivetaskdetail ptd
            left join tbl_erc_productivetask pt on pt.productivetask_id = ptd.productivetask_id
            left join tbl_erc_stockmap mat on ptd.materiel_id = mat.materiel_id
            where pt.domain_id = ${user.domain_id} and pt.outsource_sign = 3`;
        const result = await common.queryPure(sequelize, req, sql, []);
        let totalPrice = 0;
        for (const r of result.data) {
            totalPrice += r.balance_number * r.store_price;
        }
        if ((totalPrice * 1) !== (money * 1)) return {total_price: totalPrice, equal: false};
    }
    return {equal: true};
}

async function genRecordingVoucherData(domain_id, approval_state) {
    //取得会计客户列表
    const actResult = await tb_accounting.findAll({
        where: {
            domain_id,
            approval_state
        }
    });

    for (const item of actResult) {
        const {
            accounting_id,
            accounting_code,
            total_init_borrow_money,
            total_init_loan_money
        } = item;

        // const actIndex = AccountConst.codeArray.findIndex(actItem => parseInt(actItem) === accounting_code);
        // const accountName = AccountConst.nameArray[actIndex];
        // const accountDetail = AccountConst.detailArray[actIndex];
        // const accountType = AccountConst.typeArray[actIndex];
        // const accountTypeCode = AccountConst.typeCodeArray[actIndex];

        const accountingSubject = await getAccountingSubject({ code: accounting_code });
        const { accounting_subject_code, accounting_subject_name, accounting_subject_detail, accounting_subject_type_code } = accountingSubject;

        //取得会计客户列表详情
        const actDetailResult = await tb_accountdetail.findAll({
            where: {
                domain_id,
                approval_state,
                accounting_code: accounting_subject_code
            }
        });

        for (const item of actDetailResult) {
            const {
                init_borrow_money,
                init_loan_money
            } = item;

            const recordVoucherDetail = await tb_recordingvoucherdetailsc.findOne({
                where: {
                    domain_id,
                    recordingvoucherdetailsc_accsum_code: accounting_subject_code,
                    recordingvoucherdetailsc_accsum: accounting_subject_name,
                    // recordingvoucherdetailsc_activeAccount: accountDetail,
                    recordingvoucherdetailsc_GLtype: accounting_subject_type_code
                }
            });

            if (recordVoucherDetail) {
                recordVoucherDetail.recordingvoucherdetailsc_accsum = accounting_subject_name;
                recordVoucherDetail.recordingvoucherdetailsc_activeAccount = accounting_subject_detail;
                recordVoucherDetail.recordingvoucherdetailsc_accsum_code = accounting_subject_code;
                recordVoucherDetail.recordingvoucherdetailsc_GLtype = accounting_subject_type_code;

                if (init_borrow_money > init_loan_money) {
                    recordVoucherDetail.recordingvoucherdetailsc_type = 1;
                    recordVoucherDetail.recordingvoucherdetailsc_debite = init_borrow_money - init_loan_money;
                } else if (init_borrow_money < init_loan_money) {
                    recordVoucherDetail.recordingvoucherdetailsc_type = 0;
                    recordVoucherDetail.recordingvoucherdetailsc_credit = init_loan_money - init_borrow_money;
                } else {
                    recordVoucherDetail.recordingvoucherdetailsc_type = 2;
                    recordVoucherDetail.recordingvoucherdetailsc_debite = 0;
                    recordVoucherDetail.recordingvoucherdetailsc_credit = 0;
                }

                await recordVoucherDetail.save();
            } else {
                const saveData = {
                    domain_id,
                    recordingvouchersc_id: 0,
                    recordingvoucherdetailsc_digest: '会计科目初始化',
                    recordingvoucherdetailsc_accsum: accounting_subject_name,
                    recordingvoucherdetailsc_activeAccount: accounting_subject_detail,
                    recordingvoucherdetailsc_accsum_code: accounting_subject_code,
                    recordingvoucherdetailsc_GLtype: accounting_subject_type_code,
                    recordingvoucherdetailsc_debite: init_borrow_money,
                    recordingvoucherdetailsc_credit: init_loan_money
                };

                if (init_borrow_money > init_loan_money) {
                    saveData.recordingvoucherdetailsc_type = 1;
                    saveData.recordingvoucherdetailsc_debite = init_borrow_money - init_loan_money;
                } else if (init_borrow_money < init_loan_money) {
                    saveData.recordingvoucherdetailsc_type = 0;
                    saveData.recordingvoucherdetailsc_credit = init_loan_money - init_borrow_money;
                } else {
                    saveData.recordingvoucherdetailsc_type = 2;
                    saveData.recordingvoucherdetailsc_debite = 0;
                    saveData.recordingvoucherdetailsc_credit = 0;
                }

                await tb_recordingvoucherdetailsc.create(saveData);
            }
        }
    }
}

async function submitAccountingAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let accountings = await tb_accounting.findAll({
            where: {
                domain_id: user.domain_id,
                approval_state: 1
            }
        });

        //判断借的总和和贷的总和是否相等
        let total_borrow_balance = 0;
        let total_loan_balance = 0;
        let total_init_before_borrow_money = 0;
        let total_init_before_loan_money = 0;
        for (let a of accountings) {
            total_borrow_balance += a.total_borrow_balance;
            total_loan_balance += a.total_loan_balance;
            total_init_before_borrow_money += a.total_init_before_borrow_money;
            total_init_before_loan_money += a.total_init_before_loan_money;
        }

        if (total_borrow_balance !== total_loan_balance) {
            return common.sendError(res, 'accountingdetail_02')
        }

        if (total_init_before_borrow_money !== total_init_before_loan_money) {
            return common.sendError(res, 'accountingdetail_03')
        }


        // 提交后，将所有的会计科目生成一张初始的记账凭证
        let SGID = await Sequence.genRecordingVoucherSGID(user);
        let addRecordingvouchersc = await tb_recordingvouchersc.create({
            recordingvouchersc_code:SGID,
            domain_id:user.domain_id,
            recordingvouchersc_time:moment().format("YYYY-MM-DD"),
            recordingvouchersc_count:0,
            recordingvouchersc_user_id:user.user_id,
            recordingvouchersc_type:99,  //0资金支出，1客户收款    99手工记账凭证
            biz_code: await genBizCode(CODE_NAME.SGJZ, user.domain_id, 6)
        })

        //修改状态为已通过
        for (let a of accountings) {
            a.approval_state = 3;
            await a.save();

            // let actIndex = AccountConst.codeArray.findIndex(item => item == a.accounting_code);
            // let accountn_name = AccountConst.nameArray[actIndex];
            // let account_detail = AccountConst.detailArray[actIndex];
            // let account_type = AccountConst.typeCodeArray[actIndex]

            const accountingSubject = await getAccountingSubject({ code: a.accounting_code });
            const { accounting_subject_code, accounting_subject_name, accounting_subject_detail, accounting_subject_type_code } = accountingSubject;

            await createRecordingVoucher({
                user:req.user,
                account_code: accounting_subject_code,
                account_name: accounting_subject_name,
                account_detail: accounting_subject_detail,
                account_type: accounting_subject_type_code,
                recordingvouchersc_id: addRecordingvouchersc.recordingvouchersc_id
            })
        }

        common.sendData(res, '提交成功');
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function createRecordingVoucher(params){
    try{

        let result = []
        switch(params.account_code){
            case 1001:
                result = await getNoDetail(params.user, 1001);break
            case 1002:
                result = await getBankNo(params.user, 1002);break
            case 1015:
                result = await getBaseTypeDetail(params.user, 1015);break //货币资金类型,写死
            case 1122:
                result = await getCorporateclients(params.user, 1122, '1');break //客户
            case 1231:
                result = [
                        ...await getCorporateclients(params.user, 1231, '1'),
                        ...await getSupplier(params.user, 1231, '2'),
                        ...await getEmployeeDetail(params.user, 1231),
                        ...await getOtherDetail(params.user, 1231, '4'),
                    ];break//其他应收款,客户+供应商+员工+其他相关主体
            case 1403:
                result = await getNoDetail(params.user, 1403);break //原材料,无明细科目
            case 1404:
                result = await getNoDetail(params.user, 1404);break //半成品,无明细科目
            case 1406:
                result = await getNoDetail(params.user, 1406);break //库存商品,无明细科目
            case 1411:
                result = await getNoDetail(params.user, 1411);break //委托加工物资,无明细科目
            case 1601:
                result = await getNoDetail(params.user, 1601);break //固定资产
            case 1602:
                result = await getNoDetail(params.user, 1602);break //累计折旧,无明细科目
            case 1801:
                result = await getNoDetail(params.user, 1801);break //长期待摊费用
            case 2001:
                result = await getBankNo(params.user, 2001);break //短期借款
            case 2202:
                result = await getSupplier(params.user, 2202, '2');break //供应商全称
            case 2211:
                result = await getBaseTypeDetail(params.user, 2211);break //应付职工薪酬,写死
            case 2221:
                result = await getBaseTypeDetail(params.user, 2221);break //应交税费,写死
            case 2241:
                result = [
                    ...await getCorporateclients(params.user, 2241, '1'),
                    ...await getSupplier(params.user, 2241, '2'),
                    ...await getEmployeeDetail(params.user, 2241),
                    ...await getOtherDetail(params.user, 2241, '4'),
                ];break //其他应付款,客户+供应商+员工+其他相关主体
            case 4001:
                result = await getOtherDetail(params.user, 4001, '4');break //其他相关主体
            case 4104:
                result = await getNoDetail(params.user, 4104);break //利润分配,相当于无明细科目
            case 5001:
                result = await getOrder(params.user, 5001);break //生产成本，按订单
            case 5101:
                result = await getNoDetail(params.user, 5101);break //制造费用
            case 6001:
                result = await getNoDetail(params.user, 6001);break //主营业务收入,无明细科目
            case 6051:
                result = await getNoDetail(params.user, 6051);break //其他业务收入,无明细科目
            case 6301:
                result = await getNoDetail(params.user, 6301);break //营业外收入,无明细科目
            case 6401:
                result = await getNoDetail(params.user, 6401);break //主营业务成本,无明细科目
            case 6402:
                result = await getNoDetail(params.user, 6402);break //其它业务成本,无明细科目
            case 6405:
                result = await getBaseTypeDetail(params.user, 6405);break //营业税金及附加,写死
            case 6601:
                result = await getNoDetail(params.user, 6601);break //销售费用,
            case 6602:
                result = await getNoDetail(params.user, 6602);break //管理费用,
            case 6603:
                result = await getBaseTypeDetail(params.user, 6603);break //财务费用
            case 6711:
                result = await getNoDetail(params.user, 6711);break //营业外支出,无明细科目
            case 6801:
                result = await getNoDetail(params.user, 6801);break //所得税,无明细科目
            case 1702:
                result = await getNoDetail(params.user, 1702);break //累计摊销,无明细科目
            default:
                return
        }


        for(let r of result){
            let accounting_detail_name = '',accounting_detail_id = ''
            if(params.account_code == '1001' || params.account_code == '1403' || params.account_code == '1404'
                || params.account_code == '1406' || params.account_code == '1602' || params.account_code == '6001'
                || params.account_code == '6051' || params.account_code == '6301' || params.account_code == '6401'
                || params.account_code == '6402' || params.account_code == '6711' || params.account_code == '6801'){

                accounting_detail_name = ''
                accounting_detail_id = ''
            }else {
                accounting_detail_name = r.accounting_detail_name
                accounting_detail_id = r.other_id
            }

            let recordingvoucherdetailsc_type = ''
            if(Number(r.init_borrow_money) > Number(r.init_loan_money)){
                recordingvoucherdetailsc_type = 1
            }else if (Number(r.init_borrow_money) < Number(r.init_loan_money)){
                recordingvoucherdetailsc_type = 0
            }else {
                recordingvoucherdetailsc_type = 2
            }


            let addRecordingvoucherdetailsc = await tb_recordingvoucherdetailsc.create({
                recordingvouchersc_id: params.recordingvouchersc_id,//记账凭证id
                recordingvoucherdetailsc_digest: '',//摘要
                recordingvoucherdetailsc_accsum: params.account_name,//总账科目text
                recordingvoucherdetailsc_activeAccount: accounting_detail_name,//明细科目text
                recordingvoucherdetailsc_accsum_code: params.account_code,//总账科目code
                recordingvoucherdetailsc_activeAccount_code: accounting_detail_id,//明细科目code
                recordingvoucherdetailsc_debite: Number(r.init_borrow_money) ,//借方金额
                recordingvoucherdetailsc_credit: Number(r.init_loan_money) ,//贷方金额
                recordingvoucherdetailsc_type: recordingvoucherdetailsc_type,// 0贷，1借, 2平
                recordingvoucherdetailsc_GLtype: params.account_type,// 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                domain_id: params.user.domain_id,//机构id
                recordingvoucherdetailsc_depart_id: ''//部门Id
            })
        }

    }catch(error){
        throw error
    }
}
//修改会计科目状态
//state 2拒绝 3通过
async function updateState(accountCode, state, domainId) {
    try {
        //修改会计科目状态
        let accounting = await tb_accounting.findOne({
            where: {
                accounting_code: accountCode,
                approval_state: 1,
                domain_id: domainId
            }
        });
        if (accounting) {
            accounting.approval_state = state;
            await accounting.save();
        }

        //修改详情的状态
        let details = await tb_accountdetail.findAll({
            where: {
                accounting_code: accountCode,
                approval_state: 1,
                domain_id: domainId
            }
        });
        for (let d of details) {
            d.approval_state = state;
            await d.save();
        }

    } catch (error) {
        console.log('修改会计科目详情状态错误', error)
    }
}

exports.addAccountingDetail = addAccountingDetail;
exports.addFinanceAccountingDetail = addFinanceAccountingDetail;
exports.updateState = updateState;
exports.addAccounting = addAccounting;
exports.addNoDetailAccountingDetail = addNoDetailAccountingDetail;
