const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCAmortizeDetailControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
// const AccountConst = require('../../../util/AccountConst');

const moment = require('moment');
const sequelize = model.sequelize;

const tb_financerecord = model.erc_financerecord;
const tb_financerecorditem = model.erc_financerecorditem;
const tb_recordingvouchersc = model.erc_recordingvouchersc;
const tb_recordingvoucherdetailsc = model.erc_recordingvoucherdetailsc;
const tb_materiel = model.erc_materiel
const tb_supplier = model.erc_supplier
const tb_department = model.erc_department
const tb_domain = model.common_domain
const tb_corporateclients = model.erc_corporateclients
const {
    CODE_NAME,
    genBizCode
} = require('../../../util/BizCodeUtil');

exports.ERCMaterielSRControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'initMaterielData') {
        await initMaterielData(req, res);
    } else if (method === 'genMaterielCollectionData') {
        await genMaterielCollectionData(req, res);
    } else if (method === 'getMaterielCollection') {
        await getMaterielCollection(req, res);
    } else if (method === 'getMaterielBillItem') {
        await getMaterielBillItem(req, res);
    } else if (method === 'getRecordingVoucherCollection') {
        await getRecordingVoucherCollection(req, res);
    } else if (method === 'getRecordingVoucherDetail') {
        await getRecordingVoucherDetail(req, res);
    } else if (method === 'getRecordingVoucher') {
        await getRecordingVoucher(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};

async function initMaterielData(req, res) {
    try {
        const returnData = {};
        returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW');
        returnData.materielInfo = GLBConfig.MATERIELTYPE;
        returnData.stateManagement = GLBConfig.MATERIELSTATEMANAGEMENT;
        returnData.departType = GLBConfig.DEPARTTYPE;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function genMaterielCollectionData(req, res) {
    const user = req.user;
    const body = req.body;

    try {
        const returnData = {};
        const queryStr =
            `select
                fri.organization, fri.org_type, fri.wms_type, fri.manage_type, fri.domain_id
                , date_format(fri.created_at, '%Y-%m-%d') as bill_date
                , sum(fri.store_price) as total_price
                , sum(fri.store_amount) as total_amount
                from tbl_erc_financerecorditem fri
                where true
                and to_days(fri.created_at) = to_days(?)
                group by date_format(fri.created_at, '%Y-%m-%d'), fri.organization, fri.org_type, fri.wms_type, fri.manage_type, fri.domain_id`;

        const replacements = [body.bill_date];
        const result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);

        const dataArray = result.data;
        for (const {
                bill_date,
                domain_id,
                organization,
                org_type,
                total_price,
                total_amount,
                wms_type,
                manage_type
            } of dataArray) {
            const financeRecord = await tb_financerecord.findOne({
                where: {
                    domain_id,
                    bill_date,
                    organization,
                    org_type,
                    wms_type,
                    manage_type
                }
            });

            if (financeRecord) {
                financeRecord.total_price = total_price;
                financeRecord.total_amount = total_amount;
                await financeRecord.save();
            } else {
                await tb_financerecord.create({
                    financerecord_code: await Sequence.genFinanceRecordMaterielID(user),
                    domain_id,
                    bill_date,
                    organization,
                    org_type,
                    wms_type,
                    manage_type,
                    total_price,
                    total_amount
                });
            }
        }
        //数据整理后保存至
        let domain = await tb_domain.findAll({
            where: {
                state: 1
            }
        })
        for (let d of domain) {
            await insertRecordingVoucher(d)
        }


        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
async function insertRecordingVoucher(domain) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            amount = 0,
            addRecordingvoucherdetailsc = {},
            recordingvouchersc_wms_organization = '',
            recordingvouchersc_wms_type = '',
            recordingvouchersc_count = '',
            finItem = [];

        let fin = await tb_financerecord.findAll({
            where: {
                state: 1,
                whether_RD: 0,
                domain_id: domain.domain_id
            }
        })
        if (!fin.length) {
            return
        }
        for (let f of fin) {
            recordingvouchersc_wms_organization = f.organization
            if (f.wms_type === 1 && f.manage_type === 1) {
                recordingvouchersc_wms_type = '采购入库单'
                finItem = await tb_financerecorditem.findAll({
                    where: {
                        state: 1,
                        domain_id: f.domain_id,
                        organization: f.organization,
                        wms_type: f.wms_type,
                        manage_type: f.manage_type,
                        whether_RD: 0
                    }
                })
                recordingvouchersc_count = finItem.length
            } else if (f.wms_type === 1 && f.manage_type === 2) {
                recordingvouchersc_wms_type = '生产入库单'
                finItem = await tb_financerecorditem.findAll({
                    where: {
                        state: 1,
                        domain_id: f.domain_id,
                        // organization: f.organization,
                        wms_type: f.wms_type,
                        manage_type: f.manage_type,
                        whether_RD: 0
                    }
                })
                recordingvouchersc_count = finItem.length
            } else if (f.wms_type === 1 && f.manage_type === 3) {
                recordingvouchersc_wms_type = '其它入库单'
                finItem = await tb_financerecorditem.findAll({
                    where: {
                        state: 1,
                        domain_id: f.domain_id,
                        organization: f.organization,
                        wms_type: f.wms_type,
                        manage_type: f.manage_type,
                        whether_RD: 0
                    }
                })
                recordingvouchersc_count = finItem.length
            } else if (f.wms_type === 2 && f.manage_type === 1) {
                recordingvouchersc_wms_type = '销售出库单'
                finItem = await tb_financerecorditem.findAll({
                    where: {
                        state: 1,
                        domain_id: f.domain_id,
                        organization: f.organization,
                        wms_type: f.wms_type,
                        manage_type: f.manage_type,
                        whether_RD: 0
                    }
                })
                recordingvouchersc_count = finItem.length
            } else if (f.wms_type === 2 && f.manage_type === 2) {
                recordingvouchersc_wms_type = '产品领料单'
                finItem = await tb_financerecorditem.findAll({
                    where: {
                        state: 1,
                        domain_id: f.domain_id,
                        // organization: f.organization,
                        wms_type: f.wms_type,
                        manage_type: f.manage_type,
                        whether_RD: 0
                    }
                })
                recordingvouchersc_count = finItem.length
            } else if (f.wms_type === 2 && f.manage_type === 3) {
                recordingvouchersc_wms_type = '其它出库单'
                finItem = await tb_financerecorditem.findAll({
                    where: {
                        state: 1,
                        domain_id: f.domain_id,
                        organization: f.organization,
                        wms_type: f.wms_type,
                        manage_type: f.manage_type,
                        whether_RD: 0
                    }
                })
                recordingvouchersc_count = finItem.length
            }
            let recordingVoucher = await createRecordingVoucher({
                domain: domain,
                recordingvouchersc_wms_type,
                recordingvouchersc_wms_organization,
                recordingvouchersc_count
            })
            let recordingvouchersc_id = recordingVoucher.recordingvouchersc_id
            if (f.wms_type === 1 && f.manage_type === 1) { //采购入库单
                // 采购入库单
                // 借：原材料/半成品/库存商品          物料名称
                // 贷：应付账款                      供应商名称
                let sumAmount = 0

                for (fi of finItem) {
                    //---借---
                    let materiel = await tb_materiel.findOne({
                        where: {
                            state: 1,
                            materiel_id: fi.materiel_id
                        }
                    })
                    if (materiel.materiel_accounting == 0) {
                        accsum = '库存商品'
                    } else if (materiel.materiel_accounting == 1) {
                        accsum = '半成品'
                    } else {
                        accsum = '原材料'
                    }

                    // accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
                    activeAccount = materiel.materiel_name
                    activeAccount_code = materiel.materiel_id
                    // GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

                    const { accounting_subject_code, accounting_subject_type_code } = await getAccountingSubject({ name: accsum });
                    accsum_code = accounting_subject_code;
                    GLtype = accounting_subject_type_code;

                    amount = Number(fi.store_amount) * Number(fi.store_price)
                    sumAmount += Number(amount)

                    await createRecordingVoucherDetail({
                        domain_id: domain.domain_id,
                        recordingvouchersc_id,
                        accsum,
                        accsum_code,
                        activeAccount,
                        activeAccount_code,
                        amount,
                        GLtype
                    }, '')

                }
                //---贷---
                if (finItem.length > 0) {
                    let supplier = await tb_supplier.findOne({
                        where: {
                            state: 1,
                            supplier_name: f.organization
                        }
                    })
                    accsum = '应付帐款'
                    accsum_code = '2202'
                    activeAccount = f.organization ? f.organization : ''
                    activeAccount_code = supplier.supplier_id ? supplier.supplier_id : ''
                    GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                    amount = sumAmount
                    await createRecordingVoucherDetail('', {
                        domain_id: domain.domain_id,
                        recordingvouchersc_id,
                        accsum,
                        accsum_code,
                        activeAccount,
                        activeAccount_code,
                        amount,
                        GLtype
                    })
                }
            } else if (f.wms_type === 1 && f.manage_type === 2) { //生产入库单
                // 产品入库单
                // 借：原材料/半成品/库存商品          物料名称
                // 贷：生产成本                      生产任务单号

                let sumAmount = 0
                for (fi of finItem) {
                    //---借---
                    let materiel = await tb_materiel.findOne({
                        where: {
                            state: 1,
                            materiel_id: fi.materiel_id
                        }
                    })
                    if (materiel.materiel_accounting == 0) {
                        accsum = '库存商品'
                    } else if (materiel.materiel_accounting == 1) {
                        accsum = '半成品'
                    } else {
                        accsum = '原材料'
                    }

                    // accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
                    activeAccount = materiel.materiel_name
                    activeAccount_code = materiel.materiel_id
                    // GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

                    const { accounting_subject_code, accounting_subject_type_code } = await getAccountingSubject({ name: accsum });
                    accsum_code = accounting_subject_code;
                    GLtype = accounting_subject_type_code;

                    amount = Number(fi.store_amount) * Number(fi.store_price)
                    sumAmount += Number(amount)

                    await createRecordingVoucherDetail({
                        domain_id: domain.domain_id,
                        recordingvouchersc_id,
                        accsum,
                        accsum_code,
                        activeAccount,
                        activeAccount_code,
                        amount,
                        GLtype
                    }, '')

                }
                //---贷---
                if (finItem.length > 0) {
                    accsum = '生产成本'
                    accsum_code = '5001'
                    activeAccount = '生产任务单号'
                    activeAccount_code = ''
                    GLtype = 5 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                    amount = sumAmount
                    await createRecordingVoucherDetail('', {
                        domain_id: domain.domain_id,
                        recordingvouchersc_id,
                        accsum,
                        accsum_code,
                        activeAccount,
                        activeAccount_code,
                        amount,
                        GLtype
                    })
                }
            } else if (f.wms_type === 1 && f.manage_type === 3) { //其它入库单
                // 其他入库单
                // 借：原材料/半成品/库存商品          物料名称
                // 贷：应付账款                      部门名称

                let sumAmount = 0
                for (fi of finItem) {
                    //---借---
                    let materiel = await tb_materiel.findOne({
                        where: {
                            state: 1,
                            materiel_id: fi.materiel_id
                        }
                    })
                    if (materiel.materiel_accounting == 0) {
                        accsum = '库存商品'
                    } else if (materiel.materiel_accounting == 1) {
                        accsum = '半成品'
                    } else {
                        accsum = '原材料'
                    }

                    // accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
                    activeAccount = materiel.materiel_name
                    activeAccount_code = materiel.materiel_id
                    // GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

                    const { accounting_subject_code, accounting_subject_type_code } = await getAccountingSubject({ name: accsum });
                    accsum_code = accounting_subject_code;
                    GLtype = accounting_subject_type_code;

                    amount = Number(fi.store_amount) * Number(fi.store_price)
                    sumAmount += Number(amount)

                    await createRecordingVoucherDetail({
                        domain_id: domain.domain_id,
                        recordingvouchersc_id,
                        accsum,
                        accsum_code,
                        activeAccount,
                        activeAccount_code,
                        amount,
                        GLtype
                    }, '')

                }
                //---贷---
                if (finItem.length > 0) {
                    let department = await tb_department.findOne({
                        where: {
                            state: 1,
                            department_name: f.organization
                        }
                    })
                    accsum = '应付帐款'
                    accsum_code = '2202'
                    activeAccount = f.organization ? f.organization : ''
                    activeAccount_code = department.department_id ? department.department_id : ''
                    GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                    amount = sumAmount
                    await createRecordingVoucherDetail('', {
                        domain_id: domain.domain_id,
                        recordingvouchersc_id,
                        accsum,
                        accsum_code,
                        activeAccount,
                        activeAccount_code,
                        amount,
                        GLtype
                    })
                }
            } else if (f.wms_type === 2 && f.manage_type === 1) { //销售出库单
                // 销售出库单
                // 借：原材料/半成品/库存商品          物料名称
                // 贷：应收账款                      客户名称

                let sumAmount = 0
                for (fi of finItem) {
                    //---借---
                    let materiel = await tb_materiel.findOne({
                        where: {
                            state: 1,
                            materiel_id: fi.materiel_id
                        }
                    })
                    if (materiel.materiel_accounting == 0) {
                        accsum = '库存商品'
                    } else if (materiel.materiel_accounting == 1) {
                        accsum = '半成品'
                    } else {
                        accsum = '原材料'
                    }

                    // accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
                    activeAccount = materiel.materiel_name
                    activeAccount_code = materiel.materiel_id
                    // GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

                    const { accounting_subject_code, accounting_subject_type_code } = await getAccountingSubject({ name: accsum });
                    accsum_code = accounting_subject_code;
                    GLtype = accounting_subject_type_code;

                    amount = Number(fi.store_amount) * Number(fi.store_price)
                    sumAmount += Number(amount)

                    await createRecordingVoucherDetail({
                        domain_id: domain.domain_id,
                        recordingvouchersc_id,
                        accsum,
                        accsum_code,
                        activeAccount,
                        activeAccount_code,
                        amount,
                        GLtype
                    }, '')

                }
                //---贷---
                if (finItem.length > 0) {
                    let corporateclients = await tb_corporateclients.findOne({
                        where: {
                            state: 1,
                            corporateclients_name: f.organization
                        }
                    })
                    accsum = '应收帐款'
                    accsum_code = '1122'
                    activeAccount = f.organization ? f.organization : ''
                    activeAccount_code = corporateclients.corporateclients_id ? corporateclients.corporateclients_id : ''
                    GLtype = 0 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                    amount = sumAmount
                    await createRecordingVoucherDetail('', {
                        domain_id: domain.domain_id,
                        recordingvouchersc_id,
                        accsum,
                        accsum_code,
                        activeAccount,
                        activeAccount_code,
                        amount,
                        GLtype
                    })
                }
            } else if (f.wms_type === 2 && f.manage_type === 2) { //产品领料单
                // 生产领料单
                // 借：原材料/半成品/库存商品          物料名称
                // 贷：生产成本                      生产任务单号

                let sumAmount = 0
                for (fi of finItem) {
                    //---借---
                    let materiel = await tb_materiel.findOne({
                        where: {
                            state: 1,
                            materiel_id: fi.materiel_id
                        }
                    })
                    if (materiel.materiel_accounting == 0) {
                        accsum = '库存商品'
                    } else if (materiel.materiel_accounting == 1) {
                        accsum = '半成品'
                    } else {
                        accsum = '原材料'
                    }

                    // accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
                    activeAccount = materiel.materiel_name
                    activeAccount_code = materiel.materiel_id
                    // GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

                    const { accounting_subject_code, accounting_subject_type_code } = await getAccountingSubject({ name: accsum });
                    accsum_code = accounting_subject_code;
                    GLtype = accounting_subject_type_code;

                    amount = Number(fi.store_amount) * Number(fi.store_price)
                    sumAmount += Number(amount)

                    await createRecordingVoucherDetail({
                        domain_id: domain.domain_id,
                        recordingvouchersc_id,
                        accsum,
                        accsum_code,
                        activeAccount,
                        activeAccount_code,
                        amount,
                        GLtype
                    }, '')

                }
                //---贷---
                if (finItem.length > 0) {
                    accsum = '生产成本'
                    accsum_code = '5001'
                    activeAccount = '生产任务单号'
                    activeAccount_code = ''
                    GLtype = 5 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                    amount = sumAmount
                    await createRecordingVoucherDetail('', {
                        domain_id: domain.domain_id,
                        recordingvouchersc_id,
                        accsum,
                        accsum_code,
                        activeAccount,
                        activeAccount_code,
                        amount,
                        GLtype
                    })
                }
            } else if (f.wms_type === 2 && f.manage_type === 3) { //其它出库单
                // 其他出库单
                // 借：制造费用/销售费用/管理费用       其他领用/外部机构全称
                // 贷：原材料/半成品/库存商品           物料名称

                let sumAmount = 0
                for (fi of finItem) {
                    let materiel = await tb_materiel.findOne({
                        where: {
                            state: 1,
                            materiel_id: fi.materiel_id
                        }
                    })
                    if (materiel.materiel_accounting == 0) {
                        accsum = '库存商品'
                    } else if (materiel.materiel_accounting == 1) {
                        accsum = '半成品'
                    } else {
                        accsum = '原材料'
                    }

                    //---贷---
                    // accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
                    activeAccount = materiel.materiel_name
                    activeAccount_code = materiel.materiel_id
                    GLtype = 5 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

                    const { accounting_subject_code } = await getAccountingSubject({ name: accsum });
                    accsum_code = accounting_subject_code;

                    amount = sumAmount
                    await createRecordingVoucherDetail('', {
                        domain_id: domain.domain_id,
                        recordingvouchersc_id,
                        accsum,
                        accsum_code,
                        activeAccount,
                        activeAccount_code,
                        amount,
                        GLtype
                    })
                }
                //---借---
                if (finItem.length > 0) {
                    let department = await tb_department.findOne({
                        where: {
                            state: 1,
                            department_name: f.organization
                        }
                    })
                    if (department.department_type == 0) {
                        accsum = '制造费用'
                    } else if (department.department_type == 0) {
                        accsum = '销售费用'
                    } else {
                        accsum = '管理费用'
                    }

                    // accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
                    activeAccount = materiel.materiel_name
                    activeAccount_code = materiel.materiel_id
                    // GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

                    const { accounting_subject_code, accounting_subject_type_code } = await getAccountingSubject({ name: accsum });
                    accsum_code = accounting_subject_code;
                    GLtype = accounting_subject_type_code;

                    amount = Number(fi.store_amount) * Number(fi.store_price)
                    sumAmount += Number(amount)

                    await createRecordingVoucherDetail({
                        domain_id: domain.domain_id,
                        recordingvouchersc_id,
                        accsum,
                        accsum_code,
                        activeAccount,
                        activeAccount_code,
                        amount,
                        GLtype
                    }, '')
                }
            }
        }

        tb_financerecord.update({
            whether_RD: 1
        }, {
            where: {
                whether_RD: 0,
                domain_id: domain.domain_id,
            }

        })
        tb_financerecorditem.update({
            whether_RD: 1
        }, {
            where: {
                whether_RD: 0,
                domain_id: domain.domain_id,
            }

        })
    } catch (error) {
        throw error
    }
}

async function createRecordingVoucher(option) {
    try {
        let {
            domain,
            recordingvouchersc_wms_type,
            recordingvouchersc_wms_organization,
            recordingvouchersc_count
        } = option
        let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID();
        let biz_code = await genBizCode(CODE_NAME.JZPZ, option.domain.domain_id, 6);
        let addRecordingCoucherSC = await tb_recordingvouchersc.create({
            recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
            domain_id: domain.domain_id, //机构id
            recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
            recordingvouchersc_count: recordingvouchersc_count, //对应明细数
            recordingvouchersc_type: 98, //区分   0资金支出，1客户收款，97计提，98物料收发，99手工记账凭证，100银行账号资金调整
            recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
            recordingvouchersc_examine_time: new Date(), //审批时间
            recordingvouchersc_wms_type: recordingvouchersc_wms_type,
            recordingvouchersc_wms_organization: recordingvouchersc_wms_organization,
            biz_code: biz_code
        })
        return addRecordingCoucherSC
    } catch (error) {
        throw error
    }
}
async function createRecordingVoucherDetail(debite, credit) {
    try {
        if (debite) {
            let addRecordingvoucherdetailsc_d = await tb_recordingvoucherdetailsc.create({
                domain_id: debite.domain_id,
                recordingvouchersc_id: debite.recordingvouchersc_id, //记账凭证id
                recordingvoucherdetailsc_accsum: debite.accsum, //总账科目text
                recordingvoucherdetailsc_activeAccount: debite.activeAccount, //明细科目text
                recordingvoucherdetailsc_accsum_code: debite.accsum_code, //总账科目code
                recordingvoucherdetailsc_activeAccount_code: debite.activeAccount_code, //明细科目code
                recordingvoucherdetailsc_debite: debite.amount.toFixed(2), //借方金额
                recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
                recordingvoucherdetailsc_GLtype: debite.GLtype // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            })
        }
        if (credit) {
            let addRecordingvoucherdetailsc_c = await tb_recordingvoucherdetailsc.create({
                domain_id: credit.domain_id,
                recordingvouchersc_id: credit.recordingvouchersc_id, //记账凭证id
                recordingvoucherdetailsc_accsum: credit.accsum, //总账科目text
                recordingvoucherdetailsc_activeAccount: credit.activeAccount, //明细科目text
                recordingvoucherdetailsc_accsum_code: credit.accsum_code, //总账科目code
                recordingvoucherdetailsc_activeAccount_code: credit.activeAccount_code, //明细科目code
                recordingvoucherdetailsc_credit: credit.amount.toFixed(2), //贷方金额
                recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
                recordingvoucherdetailsc_GLtype: credit.GLtype // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            })
        }

    } catch (error) {
        throw error
    }
}

async function getMaterielCollection(req, res) {
    const user = req.user;
    const body = req.body;

    try {
        const returnData = {};
        let queryStr =
            `select
                fr.financerecord_id, fr.financerecord_code, fr.bill_date, fr.organization, fr.org_type, fr.wms_type, fr.manage_type, fr.total_price
                from tbl_erc_financerecord fr
                where true
                and domain_id = ?`;

        const replacements = [user.domain_id];

        if (body.financerecord_code) {
            queryStr += ' and fr.financerecord_code = ?';
            replacements.push(body.financerecord_code)
        }

        if (body.wms_type) {
            queryStr += ' and fr.wms_type = ?';
            replacements.push(body.wms_type)
        }

        if (body.manage_type) {
            queryStr += ' and fr.manage_type = ?';
            replacements.push(body.manage_type)
        }

        if (body.search_text) {
            queryStr += ' and fr.financerecord_code like ?';
            replacements.push(`%${body.search_text}%`);
        }

        queryStr += ` order by bill_date asc`;

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getMaterielBillItem(req, res) {
    const user = req.user;
    const body = req.body;

    try {
        const returnData = {};
        let queryStr =
            `select
                date(fri.created_at) as bill_date, fri.organization, fri.org_type, fri.wms_type, fri.manage_type, fri.store_amount, fri.store_price
                , mat.materiel_id, mat.materiel_code, mat.materiel_name, mat.materiel_format, mat.materiel_unit
                from tbl_erc_financerecorditem fri
                left join tbl_erc_materiel mat
                on fri.materiel_id = mat.materiel_id
                where true
                and fri.domain_id = ?`;

        const replacements = [user.domain_id];

        if (body.bill_date) {
            queryStr += ' and to_days(fri.created_at) = to_days(?)';
            replacements.push(body.bill_date)
        }

        if (body.organization) {
            queryStr += ' and fri.organization = ?';
            replacements.push(body.organization)
        }

        if (body.wms_type) {
            queryStr += ' and fri.wms_type = ?';
            replacements.push(body.wms_type)
        }

        if (body.manage_type) {
            queryStr += ' and fri.manage_type = ?';
            replacements.push(body.manage_type)
        }

        if (body.search_text) {
            queryStr += ' and (fri.organization like ? or mat.materiel_code like ? or mat.materiel_name like ?)';
            replacements.push('%' + body.search_text + '%');
            replacements.push('%' + body.search_text + '%');
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

async function getRecordingVoucherCollection(req, res) {
    const user = req.user;
    const body = req.body;

    try {
        const returnData = {};
        let queryStr =
            `select
                sum(fri.store_price) as total_price
                , date_format(fri.created_at, '%Y-%m-%d') as record_date
                , fri.wms_type, fri.manage_type, fri.organization, fri.org_type, count(*) as paper_count
                from tbl_erc_financerecorditem fri
                where true
                and fri.domain_id = ?
                group by fri.wms_type, fri.manage_type, fri.organization, fri.org_type, date_format(fri.created_at, '%Y-%m-%d')`;

        queryStr += ` order by record_date desc, fri.wms_type asc, fri.manage_type asc, total_price asc`;

        const replacements = [user.domain_id];
        const result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getRecordingVoucherDetail(req, res) {
    const user = req.user;
    const body = req.body;

    try {
        // const returnData = {};
        // let queryStr =
        //     `select
        //         fri.wms_type, fri.manage_type, fri.organization, fri.org_type, fri.store_price, date(fri.created_at) as record_date
        //         , mat.materiel_id, mat.materiel_name, mat.materiel_code, mat.materiel_format, mat.materiel_unit, mat.materiel_state_management
        //         from tbl_erc_financerecorditem fri
        //         left join tbl_erc_materiel mat
        //         on fri.materiel_id = mat.materiel_id
        //         where true
        //         and fri.domain_id = ?`;

        // const replacements = [user.domain_id];

        // if (body.record_date) {
        //     queryStr += ` and to_days(fri.created_at) = to_days(?)`;
        //     replacements.push(body.record_date);
        // }

        // if (body.wms_type) {
        //     queryStr += ` and fri.wms_type = ?`;
        //     replacements.push(body.wms_type);
        // }

        // if (body.manage_type) {
        //     queryStr += ` and fri.manage_type = ?`;
        //     replacements.push(body.manage_type);
        // }

        // if (body.organization) {
        //     queryStr += ` and fri.organization = ?`;
        //     replacements.push(body.organization);
        // }

        // const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        // returnData.total = result.count;
        // returnData.rows = result.data;
        // common.sendData(res, returnData);

        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {},
            sumMoney = 0
        let queryStr = `select * from tbl_erc_recordingvoucherdetailsc where state=1 and recordingvouchersc_id = ?
            order by recordingvoucherdetailsc_type desc`;
        replacements.push(doc.recordingvouchersc_id);
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        let itemTotalPrice = 0;
        for (let d of result.data) {
            itemTotalPrice += d.recordingvoucherdetailsc_debite - 0
        }
        returnData.total_price = itemTotalPrice.toFixed(2)
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getRecordingVoucher(req, res) {
    try {
        let user = req.user,
            body = req.body,
            returnData = {},
            replacements = []

        let queryStr = `select * from tbl_erc_recordingvouchersc where state=1 and domain_id=? and recordingvouchersc_type=98`;
        replacements.push(user.domain_id)
        if (body.search_text) {
            queryStr += ` and (biz_code like ? or recordingvouchersc_wms_type like ?)`
            replacements.push(body.search_text)
            replacements.push(body.search_text)
        }
        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
