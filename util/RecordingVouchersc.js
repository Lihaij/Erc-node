const fs = require('fs');
const moment = require('moment');
const common = require('./CommonUtil');
const GLBConfig = require('./GLBConfig');
const Sequence = require('./Sequence');
const logger = require('./Logger').createLogger('RecordingVoucherSC');
const model = require('../model');
const {
    CODE_NAME,
    genBizCode
} = require('./BizCodeUtil');

const sequelize = model.sequelize;
const tb_recordingvouchersc = model.erc_recordingvouchersc;
const tb_recordingvoucherdetailsc = model.erc_recordingvoucherdetailsc;
const tb_materiel = model.erc_materiel;
const tb_supplier = model.erc_supplier;
const tb_corporateclients = model.erc_corporateclients
const tb_productivetask = model.erc_productivetask
const tb_department = model.erc_department
const tb_othermain = model.erc_othermain
const tb_othercollection = model.erc_othercollection
const tb_companybankno = model.erc_companybankno
const tb_paymentconfirm = model.erc_paymentconfirm
const AccountConst = require('./AccountConst');

async function createVoucherDao(option) {
    try {
        const {
            user,
            recordingvouchersc_type,
            recordingvouchersc_wms_type,
            recordingvouchersc_wms_organization,
            transaction
        } = option

        let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id)
        let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6)
        let addRecordingCoucherSC = await tb_recordingvouchersc.create({
            recordingvouchersc_code, //记账凭证单号
            biz_code,
            recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
            recordingvouchersc_examine_time: new Date(), //审批时间
            recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
            recordingvouchersc_count: 2, //对应明细数
            //--------必传------------
            domain_id: user.domain_id, //机构id
            recordingvouchersc_user_id: user.user_id, //创建人
            recordingvouchersc_type, //区分   0资金支出，1客户收款，95申请借款，96计提，97其他收款，98物料收发，99手工记账凭证，100银行账号资金调整
            //--------可选------------
            recordingvouchersc_wms_type: recordingvouchersc_wms_type ? recordingvouchersc_wms_type : '',
            recordingvouchersc_wms_organization: recordingvouchersc_wms_organization ? recordingvouchersc_wms_organization : ''
        }, {
            transaction
        })
        return addRecordingCoucherSC
    } catch (error) {
        throw new Error(error);
    }
}
async function createVoucherDetailDao(recordingvouchersc_id, option) {
    try {
        logger.info(12345)
        const {
            user,
            recordingvoucherdetailsc_accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit, //贷方金额
            recordingvoucherdetailsc_debite, //借方金额
            recordingvoucherdetailsc_type, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        } = option
        let addRecordingvoucherdetailsc = await tb_recordingvoucherdetailsc.create({
            domain_id: user.domain_id,
            recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite, //借方金额
            recordingvoucherdetailsc_credit, //贷方金额
            recordingvoucherdetailsc_type, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        }, {
            transaction
        })
    } catch (error) {
        throw new Error(error)
    }

}
async function createVoucherService(type, user, option, transaction) {
    try {
        let result = {}
        switch (type) {
            case 'CGRK': //采购入库单
                result = await getParams_CGRK(user, option, transaction)
                break
            case 'XSCK':
                result = await getParams_XSCK(user, option, transaction)
                break
            case 'QTRK':
                result = await getParams_QTRK(user, option, transaction)
                break
            case 'WWRKD_1':
                result = await getParams_WWRKD_1(user, option, transaction)
                break
            case 'WWRKD_2':
                result = await getParams_WWRKD_2(user, option, transaction)
                break
            case 'WWRKD_3_1':
                result = await getParams_WWRKD_3_1(user, option, transaction)
                break
            case 'WWRKD_3_2':
                result = await getParams_WWRKD_3_2(user, option, transaction)
                break
            case 'WWRKD_5':
                result = await getParams_WWRKD_5(user, option, transaction)
                break
            case 'WWRKD_6':
                result = await getParams_WWRKD_6(user, option, transaction)
                break
            case 'CPRKD_2':
                result = await getParams_CPRKD_2(user, option, transaction)
                break
            case 'CPRKD_3':
                result = await getParams_CPRKD_3(user, option, transaction)
                break
            case 'CPRKD_3_1':
                result = await getParams_CPRKD_3_1(user, option, transaction)
                break
            case 'CPRKD_3_2':
                result = await getParams_CPRKD_3_2(user, option, transaction)
                break
            case 'CPRKD_3_3':
                result = await getParams_CPRKD_3_3(user, option, transaction)
                break
            case 'CPRKD_4':
                result = await getParams_CPRKD_4(user, option, transaction)
                break
            case 'CPRKD_4_1':
                result = await getParams_CPRKD_4_1(user, option, transaction)
                break
            case 'CPRKD_5':
                result = await getParams_CPRKD_5(user, option, transaction)
                break
            case 'CPRKD_6':
                result = await getParams_CPRKD_6(user, option, transaction)
                break
            case 'CPRKD_7':
                result = await getParams_CPRKD_7(user, option, transaction)
                break
            case 'QTSK_0':
                result = await getParams_QTSK_0(user, option, transaction)
                break
            case 'QTSK_1':
                result = await getParams_QTSK_1(user, option, transaction)
                break
            case 'QTSK_2':
                result = await getParams_QTSK_2(user, option, transaction)
                break
            case 'QTSK_3':
                result = await getParams_QTSK_3(user, option, transaction)
                break
            case 'QTSK_4':
                result = await getParams_QTSK_4(user, option, transaction)
                break
            case 'QTSK_9':
                result = await getParams_QTSK_9(user, option, transaction)
                break
            case 'ZJZHTZ':
                result = await getParams_ZJZHTZ(user, option, transaction)
                break
            case 'FZJT':
                result = await getParams_FZJT(user, option, transaction)
                break
            case 'SDFJT':
                result = await getParams_SDFJT(user, option, transaction)
                break
            case 'STJT':
                result = await getParams_STJT(user, option, transaction)
                break
            case 'GDZCZJ':
                result = await getParams_GDZCZJ(user, option, transaction)
                break
            case 'CQDTZCTX':
                result = await getParams_CQDTZCTX(user, option, transaction)
                break
            case 'GZJT_2':
                result = await getParams_GZJT_2(user, option, transaction)
                break
            case 'GZJT_3':
                result = await getParams_GZJT_3(user, option, transaction)
                break
            case 'JKSQD':
                result = await getParams_JKSQD(user, option, transaction)
                break
            default:
                return
        }
        let recordingvouchersc = await createVoucherDao(result.voucher_params)
        await createVoucherDetailDao(recordingvouchersc.recordingvouchersc_id, result.voucherdetail_d_params)
        await createVoucherDetailDao(recordingvouchersc.recordingvouchersc_id, result.voucherdetail_c_params)

    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_CGRK(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''

        let supplier = await tb_supplier.findOne({
            where: {
                state: 1,
                supplier_id: option.supplier_id
            }
        })
        let materiel = await tb_materiel.findOne({
            where: {
                state: 1,
                materiel_id: option.materiel_id
            }
        })

        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 98,
            recordingvouchersc_wms_type: '采购入库单',
            recordingvouchersc_wms_organization: supplier.supplier_name,
            transaction
        }
        /**
         * ------------借方科目------------
         */
        if (materiel.materiel_accounting == 0) {
            accsum = '库存商品'
        } else if (materiel.materiel_accounting == 1) {
            accsum = '半成品'
        } else {
            accsum = '原材料'
        }
        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];
        accsum_code = accounting_subject_code
        activeAccount = ''
        activeAccount_code = ''
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类


        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '应付帐款'
        accsum_code = '2202'
        activeAccount = supplier.supplier_name
        activeAccount_code = supplier.supplier_id
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }

        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }

}
async function getParams_XSCK(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''

        let corporateclients = await tb_corporateclients.findOne({
            where: {
                state: 1,
                corporateclients_id: option.corporateclients_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 98,
            recordingvouchersc_wms_type: '销售出库单',
            recordingvouchersc_wms_organization: corporateclients.corporateclients_name,
            transaction
        }
        /**
         * ------------借方科目------------
         */
        accsum = '应收帐款'
        accsum_code = '1122'
        activeAccount = corporateclients.corporateclients_name
        activeAccount_code = corporateclients.corporateclients_id
        GLtype = 0 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '主营业务收入'
        accsum_code = '6001'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 3 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_QTRK(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''

        let materiel = await tb_materiel.findOne({
            where: {
                state: 1,
                materiel_id: option.materiel_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 98,
            recordingvouchersc_wms_type: '其他入库单',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        if (materiel.materiel_accounting == 0) {
            accsum = '库存商品'
        } else if (materiel.materiel_accounting == 1) {
            accsum = '半成品'
        } else {
            accsum = '原材料'
        }
        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];

        accsum_code = accounting_subject_code
        activeAccount = ''
        activeAccount_code = ''
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '应付帐款'
        accsum_code = '2202'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_WWRKD_1(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let materiel = await tb_materiel.findOne({
            where: {
                state: 1,
                materiel_id: option.materiel_id
            }
        })
        let productivetask = await tb_productivetask.findOne({
            where: {
                state: 1,
                productivetask_id: option.productivetask_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 98,
            recordingvouchersc_wms_type: '委外入库单',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        accsum = '委托加工物资'
        accsum_code = '1411'
        activeAccount = materiel.materiel_name + '(' + productivetask.biz_code + ')'
        activeAccount_code = materiel.materiel_id
        GLtype = 0 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        if (materiel.materiel_accounting == 0) {
            accsum = '库存商品'
        } else if (materiel.materiel_accounting == 1) {
            accsum = '半成品'
        } else {
            accsum = '原材料'
        }
        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];
        accsum_code = accounting_subject_code
        activeAccount = ''
        activeAccount_code = ''
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_WWRKD_2(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let productivetask = await tb_productivetask.findOne({
            where: {
                state: 1,
                productivetask_id: option.productivetask_id
            }
        })
        let supplier = await tb_supplier.findOne({
            where: {
                state: 1,
                supplier_id: option.supplier_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 98,
            recordingvouchersc_wms_type: '委外入库单',
            recordingvouchersc_wms_organization: supplier.supplier_name,
            transaction
        }
        /**
         * ------------借方科目------------
         */
        accsum = '委托加工物资'
        accsum_code = '1411'
        activeAccount = '加工费(' + productivetask.biz_code + ')'
        activeAccount_code = productivetask.biz_code
        GLtype = 0 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '应付帐款'
        accsum_code = '2202'
        activeAccount = supplier.supplier_name
        activeAccount_code = supplier.supplier_id
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_WWRKD_3_1(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let materiel = await tb_materiel.findOne({
            where: {
                state: 1,
                materiel_id: option.materiel_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 98,
            recordingvouchersc_wms_type: '委外入库单',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        accsum = '主营业务成本'
        accsum_code = '6401'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 4 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        if (materiel.materiel_accounting == 0) {
            accsum = '库存商品'
        } else if (materiel.materiel_accounting == 1) {
            accsum = '半成品'
        } else {
            accsum = '原材料'
        }
        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];
        accsum_code = accounting_subject_code
        activeAccount = ''
        activeAccount_code = ''
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_WWRKD_3_2(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let supplier = await tb_supplier.findOne({
            where: {
                state: 1,
                supplier_id: option.supplier_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 98,
            recordingvouchersc_wms_type: '委外入库单',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        accsum = '主营业务成本'
        accsum_code = '6401'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 4 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '应付帐款'
        accsum_code = '2202'
        activeAccount = supplier.supplier_name
        activeAccount_code = supplier.supplier_id
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_WWRKD_5(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let materiel = await tb_materiel.findOne({
            state: 1,
            materiel_id: option.materiel_id
        })
        let productivetask = await tb_productivetask.findOne({
            state: 1,
            productivetask_id: option.productivetask_id
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 98,
            recordingvouchersc_wms_type: '委外入库单',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        if (materiel.materiel_accounting == 0) {
            accsum = '库存商品'
        } else if (materiel.materiel_accounting == 1) {
            accsum = '半成品'
        } else {
            accsum = '原材料'
        }
        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];
        accsum_code = accounting_subject_code
        activeAccount = ''
        activeAccount_code = ''
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '委托加工物资'
        accsum_code = '1411'
        activeAccount = materiel.materiel_name + '(' + productivetask.biz_code + ')'
        activeAccount_code = materiel.materiel_id
        GLtype = 0 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_WWRKD_6(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let materiel = await tb_materiel.findOne({
            state: 1,
            materiel_id: option.materiel_id
        })

        let supplier = await tb_supplier.findOne({
            state: 1,
            supplier_id: option.supplier_id
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 98,
            recordingvouchersc_wms_type: '委外入库单',
            recordingvouchersc_wms_organization: supplier.supplier_name,
            transaction
        }
        /**
         * ------------借方科目------------
         */
        if (materiel.materiel_accounting == 0) {
            accsum = '库存商品'
        } else if (materiel.materiel_accounting == 1) {
            accsum = '半成品'
        } else {
            accsum = '原材料'
        }
        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];
        accsum_code = accounting_subject_code
        activeAccount = ''
        activeAccount_code = ''
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '应付帐款'
        accsum_code = '2202'
        activeAccount = supplier.supplier_name
        activeAccount_code = supplier.supplier_id
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_CPRKD_2(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let productivetask = await tb_productivetask.findOne({
            where: {
                state: 1,
                productivetask_id: option.productivetask_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 98,
            recordingvouchersc_wms_type: '产品入库单',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        accsum = '生产成本'
        accsum_code = '5001'
        activeAccount = '人工(' + productivetask.biz_code + ')'
        activeAccount_code
        GLtype = 5 // 0资产类，1负债类，2权益类，3收入类，4费用类，5成本类

        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '应付职工薪酬'
        accsum_code = '2211'
        activeAccount = '工资'
        activeAccount_code = ''
        GLtype = 1 // 0资产类，1负债类，2权益类，3收入类，4费用类，5成本类

        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_CPRKD_3(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let materiel = await tb_materiel.findOne({
            where: {
                state: 1,
                materiel_id: option.materiel_id
            }
        })
        let productivetask = await tb_productivetask.findOne({
            where: {
                state: 1,
                productivetask_id: option.productivetask_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 98,
            recordingvouchersc_wms_type: '产品入库单',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        accsum = '生成成本'
        accsum_code = '5001'
        activeAccount = materiel.materiel_name + '(' + productivetask.biz_code + ')'
        activeAccount_code = materiel.materiel_id;
        GLtype = 4 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        if (materiel.materiel_accounting == 0) {
            accsum = '库存商品'
        } else if (materiel.materiel_accounting == 1) {
            accsum = '半成品'
        } else {
            accsum = '原材料'
        }
        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];
        accsum_code = accounting_subject_code
        activeAccount = ''
        activeAccount_code = ''
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_CPRKD_3_1(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let materiel = await tb_materiel.findOne({
            where: {
                state: 1,
                materiel_id: option.materiel_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 98,
            recordingvouchersc_wms_type: '产品入库单',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        accsum = '主营业务成本'
        accsum_code = '6401'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 4 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        if (materiel.materiel_accounting == 0) {
            accsum = '库存商品'
        } else if (materiel.materiel_accounting == 1) {
            accsum = '半成品'
        } else {
            accsum = '原材料'
        }
        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];
        accsum_code = accounting_subject_code
        activeAccount = ''
        activeAccount_code = ''
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_CPRKD_3_2(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''

        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 98,
            recordingvouchersc_wms_type: '产品入库单',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        accsum = '主营业务成本'
        accsum_code = '6401'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 4 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '应付职工薪酬'
        accsum_code = '2211'
        activeAccount = '工资'
        activeAccount_code = ''
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_CPRKD_3_3(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''

        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 98,
            recordingvouchersc_wms_type: '产品入库单',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        accsum = '主营业务成本'
        accsum_code = '6401'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 4 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '制造费用'
        accsum_code = '5101'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 5 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_CPRKD_4(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let productivetask = await tb_productivetask.findOne({
            where: {
                state: 1,
                productivetask_id: option.productivetask_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 98,
            recordingvouchersc_wms_type: '产品入库单',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        accsum = '生产成本'
        accsum_code = '5001'
        activeAccount = '人工(' + productivetask.biz_code + ')'
        activeAccount_code = productivetask.productivetask_id
        GLtype = 5 // 0资产类，1负债类，2权益类，3收入类，4费用类，5成本类
        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '应付职工薪酬'
        accsum_code = '2211'
        activeAccount = '工资'
        activeAccount_code = ''
        GLtype = 1 // 0资产类，1负债类，2权益类，3收入类，4费用类，5成本类
        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_CPRKD_4_1(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let productivetask = await tb_productivetask.findOne({
            where: {
                state: 1,
                productivetask_id: option.productivetask_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 98,
            recordingvouchersc_wms_type: '产品入库单',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        accsum = '生产成本'
        accsum_code = '5001'
        activeAccount = '制造费用(' + productivetask.biz_code + ')'
        activeAccount_code = productivetask.productivetask_id
        GLtype = 5 // 0资产类，1负债类，2权益类，3收入类，4费用类，5成本类
        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '制造费用'
        accsum_code = '5101'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 5 // 0资产类，1负债类，2权益类，3收入类，4费用类，5成本类
        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_CPRKD_5(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let productivetask = await tb_productivetask.findOne({
            where: {
                state: 1,
                productivetask_id: option.productivetask_id
            }
        })
        let materiel = await tb_materiel.findOne({
            where: {
                state: 1,
                materiel_id: option.materiel_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 98,
            recordingvouchersc_wms_type: '产品入库单',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        if (materiel.materiel_accounting == 0) {
            accsum = '库存商品'
        } else if (materiel.materiel_accounting == 1) {
            accsum = '半成品'
        } else {
            accsum = '原材料'
        }
        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];
        accsum_code = accounting_subject_code
        activeAccount = ''
        activeAccount_code = ''
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '生产成本'
        accsum_code = '5001'
        activeAccount = materiel.materiel_name + '(' + productivetask.biz_ocde + ')'
        activeAccount_code = materiel.materiel_id
        GLtype = 5 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类，5成本类

        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_CPRKD_6(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let productivetask = await tb_productivetask.findOne({
            where: {
                state: 1,
                productivetask_id: option.productivetask_id
            }
        })
        let materiel = await tb_materiel.findOne({
            where: {
                state: 1,
                materiel_id: option.materiel_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 98,
            recordingvouchersc_wms_type: '产品入库单',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        if (materiel.materiel_accounting == 0) {
            accsum = '库存商品'
        } else if (materiel.materiel_accounting == 1) {
            accsum = '半成品'
        } else {
            accsum = '原材料'
        }
        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];
        accsum_code = accounting_subject_code
        activeAccount = ''
        activeAccount_code = ''
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '生产成本'
        accsum_code = '5001'
        activeAccount = '人工(' + productivetask.biz_code + ')'
        activeAccount_code = productivetask.productivetask_id
        GLtype = 5 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类，5成本类

        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_CPRKD_7(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let materiel = await tb_materiel.findOne({
            where: {
                state: 1,
                materiel_id: option.materiel_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 98,
            recordingvouchersc_wms_type: '产品入库单',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        if (materiel.materiel_accounting == 0) {
            accsum = '库存商品'
        } else if (materiel.materiel_accounting == 1) {
            accsum = '半成品'
        } else {
            accsum = '原材料'
        }
        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];
        accsum_code = accounting_subject_code
        activeAccount = ''
        activeAccount_code = ''
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '生产成本'
        accsum_code = '5001'
        activeAccount = '制造费用'
        activeAccount_code = '5101'
        GLtype = 5 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类，5成本类

        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_QTSK_0(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let othercollection = await tb_othercollection.findOne({
            where: {
                state: 1,
                othercollection_id: option.othercollection_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 97,
            recordingvouchersc_wms_type: '',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        let paymentMethod = GLBConfig.PAYMENTMETHOD.filter(item => {
            return othercollection.othercollection_way === item.id
        })
        accsum = paymentMethod.text

        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];
        accsum_code = accounting_subject_code
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        if (paymentMethod == 1) {
            let companyBankNO = await tb_companybankno.findOne({
                where: {
                    state: 1,
                    companybankno_id: othercollection.othercollection_bank_no
                }
            })
            activeAccount = companyBankNO.companybankno_bank_no
            activeAccount_code = othercollection.othercollection_bank_no ? othercollection.othercollection_bank_no : ''
        } else {
            activeAccount = ''
            activeAccount_code = ''
        }
        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '营业外收入'
        accsum_code = '6301'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 3 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_QTSK_1(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let othercollection = await tb_othercollection.findOne({
            where: {
                state: 1,
                othercollection_id: option.othercollection_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 97,
            recordingvouchersc_wms_type: '',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        let paymentMethod = GLBConfig.PAYMENTMETHOD.filter(item => {
            return othercollection.othercollection_way === item.id
        })

        accsum = paymentMethod.text
        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];
        accsum_code = accounting_subject_code
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        if (paymentMethod == 1) {
            let companyBankNO = await tb_companybankno.findOne({
                where: {
                    state: 1,
                    companybankno_id: othercollection.othercollection_bank_no
                }
            })
            activeAccount = companyBankNO.companybankno_bank_no
            activeAccount_code = othercollection.othercollection_bank_no ? othercollection.othercollection_bank_no : ''
        } else {
            activeAccount = ''
            activeAccount_code = ''
        }
        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '其他应收款'
        accsum_code = '1133'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 0 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_QTSK_2(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let othercollection = await tb_othercollection.findOne({
            where: {
                state: 1,
                othercollection_id: option.othercollection_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 97,
            recordingvouchersc_wms_type: '',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        let paymentMethod = GLBConfig.PAYMENTMETHOD.filter(item => {
            return othercollection.othercollection_way === item.id
        })

        accsum = paymentMethod.text
        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];
        accsum_code = accounting_subject_code
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        if (paymentMethod == 1) {
            let companyBankNO = await tb_companybankno.findOne({
                where: {
                    state: 1,
                    companybankno_id: othercollection.othercollection_bank_no
                }
            })
            activeAccount = companyBankNO.companybankno_bank_no
            activeAccount_code = othercollection.othercollection_bank_no ? othercollection.othercollection_bank_no : ''
        } else {
            activeAccount = ''
            activeAccount_code = ''
        }
        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */

        accsum = '营业外收入'
        accsum_code = '6301'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 3 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_QTSK_3(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let othercollection = await tb_othercollection.findOne({
            where: {
                state: 1,
                othercollection_id: option.othercollection_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 97,
            recordingvouchersc_wms_type: '',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        let paymentMethod = GLBConfig.PAYMENTMETHOD.filter(item => {
            return othercollection.othercollection_way === item.id
        })

        accsum = paymentMethod.text
        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];
        accsum_code = accounting_subject_code
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        if (paymentMethod == 1) {
            let companyBankNO = await tb_companybankno.findOne({
                where: {
                    state: 1,
                    companybankno_id: othercollection.othercollection_bank_no
                }
            })
            activeAccount = companyBankNO.companybankno_bank_no
            activeAccount_code = othercollection.othercollection_bank_no ? othercollection.othercollection_bank_no : ''
        } else {
            activeAccount = ''
            activeAccount_code = ''
        }
        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '应付账款'
        accsum_code = '2121'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_QTSK_4(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let othercollection = await tb_othercollection.findOne({
            where: {
                state: 1,
                othercollection_id: option.othercollection_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 97,
            recordingvouchersc_wms_type: '',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        let paymentMethod = GLBConfig.PAYMENTMETHOD.filter(item => {
            return othercollection.othercollection_way === item.id
        })

        accsum = paymentMethod.text
        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];
        accsum_code = accounting_subject_code
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        if (paymentMethod == 1) {
            let companyBankNO = await tb_companybankno.findOne({
                where: {
                    state: 1,
                    companybankno_id: othercollection.othercollection_bank_no
                }
            })
            activeAccount = companyBankNO.companybankno_bank_no
            activeAccount_code = othercollection.othercollection_bank_no ? othercollection.othercollection_bank_no : ''
        } else {
            activeAccount = ''
            activeAccount_code = ''
        }
        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '其他应收款'
        accsum_code = '1133'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 0 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_QTSK_9(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let othercollection = await tb_othercollection.findOne({
            where: {
                state: 1,
                othercollection_id: option.othercollection_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 97,
            recordingvouchersc_wms_type: '',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        let paymentMethod = GLBConfig.PAYMENTMETHOD.filter(item => {
            return othercollection.othercollection_way === item.id
        })

        accsum = paymentMethod.text

        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];
        accsum_code = accounting_subject_code
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        if (paymentMethod == 1) {
            let companyBankNO = await tb_companybankno.findOne({
                where: {
                    state: 1,
                    companybankno_id: othercollection.othercollection_bank_no
                }
            })
            activeAccount = companyBankNO.companybankno_bank_no
            activeAccount_code = othercollection.othercollection_bank_no ? othercollection.othercollection_bank_no : ''
        } else {
            activeAccount = ''
            activeAccount_code = ''
        }
        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '实收资本'
        accsum_code = '4001'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 2 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_ZJZHTZ(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''

        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 100,
            recordingvouchersc_wms_type: '',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        accsum = '银行存款'
        accsum_code = '1002'
        activeAccount = option.capitalaccountchang_out
        activeAccount_code = ''
        GLtype = 0 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '银行存款'
        accsum_code = '1002'
        activeAccount = option.capitalaccountchang_into
        activeAccount_code = ''
        GLtype = 0 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类，5成本类
        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_FZJT(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let department = await tb_department.findOne({
            where: {
                state: 1,
                department_id: option.department_id
            }
        })
        let othermain = await tb_othermain.findOne({
            where: {
                state: 1,
                other_main_id: option.other_main_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 96,
            recordingvouchersc_wms_type: '房租计提',
            recordingvouchersc_wms_organization: othermain.other_main_name,
            transaction
        }
        /**
         * ------------借方科目------------
         */
        if (department.department_type == 0) {
            accsum = '制造费用'
        } else if (department.department_type == 0) {
            accsum = '销售费用'
        } else {
            accsum = '管理费用'
        }
        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];
        accsum_code = accounting_subject_code
        if (option.amount_type == 1) {
            activeAccount = '水费支出'
        } else {
            activeAccount = '电费支出'
        }
        activeAccount_code = ''
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '其他应付款'
        accsum_code = '2241'
        activeAccount = othermain.other_main_name
        activeAccount_code = othermain.other_main_code
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类，5成本类
        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_SDFJT(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let department = await tb_department.findOne({
            where: {
                state: 1,
                department_id: option.department_id
            }
        })
        let othermain = await tb_othermain.findOne({
            where: {
                state: 1,
                other_main_id: option.other_main_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 96,
            recordingvouchersc_wms_type: '水电费计提',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        if (department.department_type == 0) {
            accsum = '制造费用'
        } else if (department.department_type == 0) {
            accsum = '销售费用'
        } else {
            accsum = '管理费用'
        }
        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];
        accsum_code = accounting_subject_code
        if (option.amount_type == 1) {
            activeAccount = '水费支出'
        } else {
            activeAccount = '电费支出'
        }
        activeAccount_code = ''
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '其他应付款'
        accsum_code = '2241'
        activeAccount = othermain.other_main_name
        activeAccount_code = othermain.other_main_code
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类，5成本类
        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_STJT(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let department = await tb_department.findOne({
            where: {
                state: 1,
                department_id: option.department_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 96,
            recordingvouchersc_wms_type: '食堂计提',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        if (department.department_type == 0) {
            accsum = '制造费用'
        } else if (department.department_type == 0) {
            accsum = '销售费用'
        } else {
            accsum = '管理费用'
        }
        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];
        accsum_code = accounting_subject_code
        activeAccount = '食堂费用'
        activeAccount_code = ''
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '其他应付款'
        accsum_code = '2241'
        activeAccount = '计提伙食费'
        activeAccount_code = ''
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类，5成本类
        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_GDZCZJ(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let department = await tb_department.findOne({
            where: {
                state: 1,
                department_id: option.department_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 96,
            recordingvouchersc_wms_type: '固定资产折旧计提',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        if (department.department_type == 0) {
            accsum = '制造费用'
        } else if (department.department_type == 0) {
            accsum = '销售费用'
        } else {
            accsum = '管理费用'
        }
        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];
        accsum_code = accounting_subject_code
        activeAccount = '资产折旧'
        activeAccount_code = ''
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '累计折旧'
        accsum_code = '1602'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 0 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类，5成本类
        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_CQDTZCTX(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let department = await tb_department.findOne({
            where: {
                state: 1,
                department_id: option.department_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 96,
            recordingvouchersc_wms_type: '长期待摊资产摊销',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        if (department.department_type == 0) {
            accsum = '制造费用'
        } else if (department.department_type == 0) {
            accsum = '销售费用'
        } else {
            accsum = '管理费用'
        }
        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];
        accsum_code = accounting_subject_code
        activeAccount = '资产折旧'
        activeAccount_code = ''
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '累计摊销'
        accsum_code = '1702'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 0 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类，5成本类
        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_GZJT_2(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let department = await tb_department.findOne({
            where: {
                state: 1,
                department_id: option.department_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 96,
            recordingvouchersc_wms_type: '工资计提',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        if (department.department_type == 0) {
            accsum = '制造费用'
        } else if (department.department_type == 0) {
            accsum = '销售费用'
        } else {
            accsum = '管理费用'
        }
        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];
        accsum_code = accounting_subject_code
        activeAccount = '工资支出'
        activeAccount_code = ''
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '应付职工薪酬'
        accsum_code = '2211'
        activeAccount = '工资'
        activeAccount_code = ''
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类，5成本类
        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_GZJT_3(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let department = await tb_department.findOne({
            where: {
                state: 1,
                department_id: option.department_id
            }
        })
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 96,
            recordingvouchersc_wms_type: '工资计提',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */
        if (department.department_type == 0) {
            accsum = '制造费用'
        } else if (department.department_type == 0) {
            accsum = '销售费用'
        } else {
            accsum = '管理费用'
        }
        let subject = await getAccountingSubject({
            name: accsum
        })
        const {
            accounting_subject_code,
            accounting_subject_type_code
        } = subject[0];
        accsum_code = accounting_subject_code
        activeAccount = '工资支出'
        activeAccount_code = ''
        GLtype = accounting_subject_type_code // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '应付职工薪酬'
        accsum_code = '2211'
        activeAccount = '工资'
        activeAccount_code = ''
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类，5成本类
        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getParams_JKSQD(user, option, transaction) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''

        let paymentconfirm = await tb_paymentconfirm.findOne({
            where: {
                state: 1,
                paymentconfirm_id: option.paymentconfirm_id
            }
        })

        let queryStr = `SELECT
                CASE b.borrowapply_gathertype
                WHEN 0 THEN u.username
                WHEN 1 THEN c.corporateclients_name
                WHEN 2 THEN s.supplier_name
                ELSE o.other_main_name END as borrowapply_gathersubject_name,
                b.*
                FROM tbl_erc_borrowapply b
                LEFT JOIN tbl_common_user u ON (b.borrowapply_gathersubject = u.user_id and u.state=1)
                LEFT JOIN tbl_erc_corporateclients c ON (b.borrowapply_gathersubject = c.corporateclients_id and c.state=1 )
                LEFT JOIN tbl_erc_supplier s ON (b.borrowapply_gathersubject = s.supplier_id and s.state=1)
                LEFT JOIN tbl_erc_othermain o ON (b.borrowapply_gathersubject = o.other_main_id and o.state=1)
                where b.state=1 and b.borrowapply_id='${paymentconfirm.s_expense_type_id}'`

        let result = await sequelize.query(queryStr, {
            replacements: [],
            type: sequelize.QueryTypes.SELECT
        });
        /**
         * ------------记账凭证列表------------
         */
        let voucher_params = {
            user,
            recordingvouchersc_type: 95,
            recordingvouchersc_wms_type: '借款申请',
            recordingvouchersc_wms_organization: '',
            transaction
        }
        /**
         * ------------借方科目------------
         */

        accsum = '其他应收款'
        accsum_code = '1133'
        activeAccount = result[0].borrowapply_gathersubject_name
        activeAccount_code = ''
        GLtype = 0 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        let voucherdetail_d_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: Number(result[0].borrowapply_money) / 100, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        /**
         * ------------贷方科目------------
         */
        accsum = '银行存款'
        accsum_code = '1002'
        activeAccount = result[0].borrowapply_bankno
        activeAccount_code = ''
        GLtype = 0 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类，5成本类
        let voucherdetail_c_params = {
            user,
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: option.amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        }
        return {
            voucher_params,
            voucherdetail_d_params, //借方
            voucherdetail_c_params //贷方
        }
    } catch (error) {
        throw new Error(error)
    }
}
async function getSalary(productivetask_id, putin_number) {
    try {
        let returnDate = {},
            queryStr = ''
        let productivetask = await tb_productivetask.findOne({
            where: {
                state: 1,
                productivetask_id: productivetask_id
            }
        })
        let pro = Number(putin_number) / Number(productivetask.taskdesign_number)

        queryStr =
            `select 
                sum(p.ppmaster_produce_number * ${pro} * pp.procedure_cost) as sum_ppmaster_produce_money
            from tbl_erc_ppmaster p
            left join tbl_erc_productionprocedure pp on (p.ppmaster_procedure_id = pp.procedure_id and pp.state = 1)
            left join tbl_erc_productivetask pt on (p.productivetask_code = pt.productivetask_code and pt.state=1)
            where p.state=1 and pt.productivetask_id = ${productivetask_id}`
        let ppmaster1 = await sequelize.query(queryStr, {
            replacements: [],
            type: sequelize.QueryTypes.SELECT
        });
        queryStr =
            `select 
                sum(p.ppmaster_produce_number * ${pro} * pp.procedure_cost * pp.procedure_coefficient) as sum_ppmaster_produce_money
            from tbl_erc_ppmaster p
            left join tbl_erc_productionprocedure pp on (p.ppmaster_procedure_id = pp.procedure_id and pp.state = 1)
            left join tbl_erc_productivetask pt on (p.productivetask_code = pt.productivetask_code and pt.state=1)
            where p.state=1 and pt.productivetask_id = ${productivetask_id}`
        let ppmaster2 = await sequelize.query(queryStr, {
            replacements: [],
            type: sequelize.QueryTypes.SELECT
        });
        returnDate.money_n_coefficient = ppmaster1[0] ? ppmaster1[0].sum_ppmaster_produce_money : 0
        returnDate.money_y_coefficient = ppmaster2[0] ? ppmaster2[0].sum_ppmaster_produce_money : 0
        return returnDate
    } catch (error) {
        throw error
    }
}
async function createRecordingVoucherSC(type, user, option, transaction) {
    await createVoucherService(type, user, option, transaction)
}
async function createRecordingVoucherSCJT(type, user, option, transaction) {
    await createVoucherService(type, user, option, transaction)
}
module.exports = {
    createRecordingVoucherSC,
    createRecordingVoucherSCJT,
    getSalary
}