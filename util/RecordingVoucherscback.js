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
const AccountConst = require('./AccountConst');

async function createRecordingVoucherSC(type, user, option, transaction) {
    try {
        if (type === 'CGRK') { //采购入库单
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
            //记账凭证列表
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 98, //区分   0资金支出，1客户收款，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '采购入库单',
                recordingvouchersc_wms_organization: supplier.supplier_name,
                biz_code: biz_code
            }, {
                transaction
            })
            //记账凭证明细
            await CGRK(addRecordingCoucherSC, user, {
                supplier,
                materiel,
                amount: option.amount,
                transaction
            })
        } else if (type === 'XSCK') {
            let corporateclients = await tb_corporateclients.findOne({
                where: {
                    state: 1,
                    corporateclients_id: option.corporateclients_id
                }
            })
            //记账凭证列表
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 98, //区分   0资金支出，1客户收款，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '销售出库单',
                recordingvouchersc_wms_organization: corporateclients.corporateclients_name,
                biz_code: biz_code
            }, {
                transaction
            })
            await XSCK(addRecordingCoucherSC, user, {
                corporateclients,
                amount: option.amount,
                transaction
            })
        } else if (type === 'QTRK') {
            let materiel = await tb_materiel.findOne({
                where: {
                    state: 1,
                    materiel_id: option.materiel_id
                }
            })
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 98, //区分   0资金支出，1客户收款，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '其他入库单',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            }, {
                transaction
            })
            await QTRK(addRecordingCoucherSC, user, {
                materiel,
                amount: option.amount,
                transaction
            })
        } else if (type === 'WWRKD_1') {
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
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 98, //区分   0资金支出，1客户收款，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '委外入库单',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            }, {
                transaction
            })
            await WWRKD_1(addRecordingCoucherSC, user, {
                materiel,
                productivetask,
                amount: option.amount,
                transaction
            })
        } else if (type === 'WWRKD_2') {
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
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 98, //区分   0资金支出，1客户收款，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '委外入库单',
                recordingvouchersc_wms_organization: supplier.supplier_name,
                biz_code: biz_code
            }, {
                transaction
            })
            await WWRKD_2(addRecordingCoucherSC, user, {
                productivetask,
                supplier,
                amount: option.amount,
                transaction
            })
        } else if (type === 'WWRKD_3_1') {
            let materiel = await tb_materiel.findOne({
                where: {
                    state: 1,
                    materiel_id: option.materiel_id
                }
            })
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 98, //区分   0资金支出，1客户收款，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '委外入库单',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            }, {
                transaction
            })
            await WWRKD_3_1(addRecordingCoucherSC, user, {
                materiel,
                amount: option.amount,
                transaction
            })
        } else if (type === 'WWRKD_3_2') {
            let supplier = await tb_supplier.findOne({
                where: {
                    state: 1,
                    supplier_id: option.supplier_id
                }
            })
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 98, //区分   0资金支出，1客户收款，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '委外入库单',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            }, {
                transaction
            })
            await WWRKD_3_2(addRecordingCoucherSC, user, {
                supplier,
                amount: option.amount,
                transaction
            })
        } else if (type === 'WWRKD_5') {

            let materiel = await tb_materiel.findOne({
                state: 1,
                materiel_id: option.materiel_id
            })

            let productivetask = await tb_productivetask.findOne({
                state: 1,
                productivetask_id: option.productivetask_id
            })
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 98, //区分   0资金支出，1客户收款，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '委外入库单',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            }, {
                transaction
            })
            await WWRKD_5(addRecordingCoucherSC, user, {
                materiel,
                productivetask,
                amount: option.amount,
                transaction
            })
        } else if (type === 'WWRKD_6') {

            let materiel = await tb_materiel.findOne({
                state: 1,
                materiel_id: option.materiel_id
            })

            let supplier = await tb_supplier.findOne({
                state: 1,
                supplier_id: option.supplier_id
            })
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 98, //区分   0资金支出，1客户收款，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '委外入库单',
                recordingvouchersc_wms_organization: supplier.supplier_name,
                biz_code: biz_code
            }, {
                transaction
            })
            await WWRKD_6(addRecordingCoucherSC, user, {
                materiel,
                supplier,
                amount: option.amount,
                transaction
            })
        } else if (type === 'CPRKD_2') {
            let productivetask = await tb_productivetask.findOne({
                where: {
                    state: 1,
                    productivetask_id: option.productivetask_id
                }
            })
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 98, //区分   0资金支出，1客户收款，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '产品入库单',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            }, {
                transaction
            })
            await CPRKD_2(addRecordingCoucherSC, user, {
                productivetask,
                amount: option.amount,
                transaction
            })
        } else if (type === 'CPRKD_3') {
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
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 98, //区分   0资金支出，1客户收款，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '产品入库单',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code

            }, {
                transaction
            })
            await CPRKD_3(addRecordingCoucherSC, user, {
                materiel,
                productivetask,
                amount: option.amount,
                transaction
            })
        } else if (type === 'CPRKD_4') {
            let productivetask = await tb_productivetask.findOne({
                where: {
                    state: 1,
                    productivetask_id: option.productivetask_id
                }
            })
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 98, //区分   0资金支出，1客户收款，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '产品入库单',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            }, {
                transaction
            })
            await CPRKD_4(addRecordingCoucherSC, user, {
                productivetask,
                amount: option.amount,
                transaction
            })
        } else if (type === 'CPRKD_4_1') {
            let productivetask = await tb_productivetask.findOne({
                where: {
                    state: 1,
                    productivetask_id: option.productivetask_id
                }
            })
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 98, //区分   0资金支出，1客户收款，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '产品入库单',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            }, {
                transaction
            })
            await CPRKD_4_1(addRecordingCoucherSC, user, {
                productivetask,
                amount: option.amount,
                transaction
            })
        } else if (type === 'CPRKD_5') {

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
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 98, //区分   0资金支出，1客户收款，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '产品入库单',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            }, {
                transaction
            })
            await CPRKD_5(addRecordingCoucherSC, user, {
                productivetask,
                materiel,
                amount: option.amount,
                transaction
            })
        } else if (type === 'CPRKD_6') {
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
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 98, //区分   0资金支出，1客户收款，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '产品入库单',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            }, {
                transaction
            })
            await CPRKD_6(addRecordingCoucherSC, user, {
                productivetask,
                materiel,
                amount: option.amount,
                transaction
            })
        } else if (type === 'CPRKD_7') {
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
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 98, //区分   0资金支出，1客户收款，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '产品入库单',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            }, {
                transaction
            })
            await CPRKD_7(addRecordingCoucherSC, user, {
                productivetask,
                materiel,
                amount: option.amount,
                transaction
            })
        } else if (type === 'CPRKD_3_1') {
            let materiel = await tb_materiel.findOne({
                where: {
                    state: 1,
                    materiel_id: option.materiel_id
                }
            })
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 98, //区分   0资金支出，1客户收款，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '产品入库单',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            }, {
                transaction
            })
            await CPRKD_3_1(addRecordingCoucherSC, user, {
                materiel,
                amount: option.amount,
                transaction
            })
        } else if (type === 'CPRKD_3_2') {
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 98, //区分   0资金支出，1客户收款，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '产品入库单',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            }, {
                transaction
            })
            await CPRKD_3_2(addRecordingCoucherSC, user, {
                amount: option.amount,
                transaction
            })
        } else if (type === 'CPRKD_3_3') {
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 98, //区分   0资金支出，1客户收款，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '产品入库单',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            }, {
                transaction
            })
            await CPRKD_3_3(addRecordingCoucherSC, user, {
                amount: option.amount,
                transaction
            })

            return addRecordingCoucherSC;
        } else if (type === 'QTSK_0') {
            let othercollection = await tb_othercollection.findOne({
                where: {
                    state: 1,
                    othercollection_id: option.othercollection_id
                }
            })
            //记账凭证列表
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 97, //区分   0资金支出，1客户收款，97其他收款,98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            }, {
                transaction
            })
            await QTSK_0(addRecordingCoucherSC, user, {
                othercollection,
                amount: option.amount,
                transaction
            })
        } else if (type === 'QTSK_1') {
            let othercollection = await tb_othercollection.findOne({
                where: {
                    state: 1,
                    othercollection_id: option.othercollection_id
                }
            })
            //记账凭证列表
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 97, //区分   0资金支出，1客户收款，97其他收款,98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            }, {
                transaction
            })
            await QTSK_1(addRecordingCoucherSC, user, {
                othercollection,
                amount: option.amount,
                transaction
            })
        } else if (type === 'QTSK_2') {
            let othercollection = await tb_othercollection.findOne({
                where: {
                    state: 1,
                    othercollection_id: option.othercollection_id
                }
            })
            //记账凭证列表
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 97, //区分   0资金支出，1客户收款，97其他收款,98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            }, {
                transaction
            })
            await QTSK_2(addRecordingCoucherSC, user, {
                othercollection,
                amount: option.amount,
                transaction
            })
        } else if (type === 'QTSK_3') {
            let othercollection = await tb_othercollection.findOne({
                where: {
                    state: 1,
                    othercollection_id: option.othercollection_id
                }
            })
            //记账凭证列表
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 97, //区分   0资金支出，1客户收款，97其他收款,98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            }, {
                transaction
            })
            await QTSK_3(addRecordingCoucherSC, user, {
                othercollection,
                amount: option.amount,
                transaction
            })
        } else if (type === 'QTSK_4') {
            let othercollection = await tb_othercollection.findOne({
                where: {
                    state: 1,
                    othercollection_id: option.othercollection_id
                }
            })
            //记账凭证列表
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 97, //区分   0资金支出，1客户收款，97其他收款,98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            }, {
                transaction
            })
            await QTSK_4(addRecordingCoucherSC, user, {
                othercollection,
                amount: option.amount,
                transaction
            })
        } else if (type === 'QTSK_9') {
            let othercollection = await tb_othercollection.findOne({
                where: {
                    state: 1,
                    othercollection_id: option.othercollection_id
                }
            })
            //记账凭证列表
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 97, //区分   0资金支出，1客户收款，97其他收款,98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            }, {
                transaction
            })
            await QTSK_9(addRecordingCoucherSC, user, {
                othercollection,
                amount: option.amount,
                transaction
            })
        } else if (type === 'ZJZHTZ') {
            //记账凭证列表
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 100, //区分   0资金支出，1客户收款，97其他收款,98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            }, {
                transaction
            })
            await ZJZHTZ(addRecordingCoucherSC, user, {
                capitalaccountchang_out: option.capitalaccountchang_out,
                capitalaccountchang_into: option.capitalaccountchang_into,
                amount: option.capitalaccountchang_money,
                transaction
            })
        }
    } catch (error) {
        throw error
    }
}
async function createRecordingVoucherSCJT(type, user, option) {
    try {
        //记账凭证明细
        if (type === 'FZJT') {
            //记账凭证列表
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
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 97, //区分   0资金支出，1客户收款，97计提，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '房租计提',
                recordingvouchersc_wms_organization: othermain.other_main_name,
                biz_code: biz_code
            })
            await FZJT(addRecordingCoucherSC, user, {
                department,
                othermain,
                amount: option.amount
            })
        } else if (type === 'SDFJT') {
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
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 97, //区分   0资金支出，1客户收款，97计提，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '水电费计提',
                recordingvouchersc_wms_organization: othermain.other_main_name,
                biz_code: biz_code
            })
            await SDFJT(addRecordingCoucherSC, user, {
                department,
                othermain,
                amount: option.amount,
                amount_type: option.amount_type

            })
        } else if (type === 'STJT') {
            let department = await tb_department.findOne({
                where: {
                    state: 1,
                    department_id: option.department_id
                }
            })
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 97, //区分   0资金支出，1客户收款，97计提，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '食堂计提',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            })
            await STJT(addRecordingCoucherSC, user, {
                department,
                amount: option.amount
            })
        } else if (type === 'GDZCZJ') {
            let department = await tb_department.findOne({
                where: {
                    state: 1,
                    department_id: option.department_id
                }
            })
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 97, //区分   0资金支出，1客户收款，97计提，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '固定资产折旧计提',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            })
            await GDZCZJ(addRecordingCoucherSC, user, {
                department,
                amount: option.amount
            })
        } else if (type === 'CQDTZCTX') {
            let department = await tb_department.findOne({
                where: {
                    state: 1,
                    department_id: option.department_id
                }
            })
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 97, //区分   0资金支出，1客户收款，97计提，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '长期待摊资产摊销',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            })
            await CQDTZCTX(addRecordingCoucherSC, user, {
                department,
                amount: option.amount
            })
        } else if (type === 'GZJT_2') {

            let department = await tb_department.findOne({
                where: {
                    state: 1,
                    department_id: option.department_id
                }
            })
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 97, //区分   0资金支出，1客户收款，97计提，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '工资计提',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            })
            await GZJT_2(addRecordingCoucherSC, user, {
                department,
                amount: option.amount
            })
        } else if (type === 'GZJT_3') {
            let department = await tb_department.findOne({
                where: {
                    state: 1,
                    department_id: option.department_id
                }
            })
            let recordingvouchersc_code = await Sequence.genRecordingVoucherSGID(user.user_id);
            let biz_code = await genBizCode(CODE_NAME.JZPZ, user.domain_id, 6);
            let addRecordingCoucherSC = await tb_recordingvouchersc.create({
                recordingvouchersc_code: recordingvouchersc_code, //记账凭证单号
                domain_id: user.domain_id, //机构id
                recordingvouchersc_time: moment().format('YYYY-MM-DD'), //业务日期
                recordingvouchersc_count: 2, //对应明细数
                recordingvouchersc_type: 97, //区分   0资金支出，1客户收款，97计提，98物料收发，99手工记账凭证，100银行账号资金调整
                recordingvouchersc_user_id: user.user_id, //创建人
                recordingvouchersc_state: 2, //项目状态   0待提交 1审核中 2通过 3拒绝
                recordingvouchersc_examine_time: new Date(), //审批时间
                recordingvouchersc_wms_type: '工资计提',
                recordingvouchersc_wms_organization: '',
                biz_code: biz_code
            })
            await GZJT_3(addRecordingCoucherSC, user, {
                department,
                amount: option.amount
            })
        }

        return addRecordingCoucherSC
    } catch (error) {
        throw error
    }
}
async function createRecordingVoucherDetailSC(params) {
    const {
        domain_id,
        recordingvouchersc_id, //记账凭证id
        recordingvoucherdetailsc_accsum, //总账科目text
        recordingvoucherdetailsc_activeAccount, //明细科目text
        recordingvoucherdetailsc_accsum_code, //总账科目code
        recordingvoucherdetailsc_activeAccount_code, //明细科目code
        recordingvoucherdetailsc_credit, //贷方金额
        recordingvoucherdetailsc_debite, //借方金额
        recordingvoucherdetailsc_type, // 0贷，1借, 2平
        recordingvoucherdetailsc_GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        transaction
    } = params
    addRecordingvoucherdetailsc = await tb_recordingvoucherdetailsc.create({
        domain_id: domain_id,
        recordingvouchersc_id: recordingvouchersc_id, //记账凭证id
        recordingvoucherdetailsc_accsum: recordingvoucherdetailsc_accsum ? recordingvoucherdetailsc_accsum : '', //总账科目text
        recordingvoucherdetailsc_activeAccount: recordingvoucherdetailsc_activeAccount ? recordingvoucherdetailsc_activeAccount : '', //明细科目text
        recordingvoucherdetailsc_accsum_code: recordingvoucherdetailsc_accsum_code ? recordingvoucherdetailsc_accsum_code : '', //总账科目code
        recordingvoucherdetailsc_activeAccount_code: recordingvoucherdetailsc_activeAccount_code ? recordingvoucherdetailsc_activeAccount_code : '', //明细科目code
        recordingvoucherdetailsc_debite: recordingvoucherdetailsc_debite ? recordingvoucherdetailsc_debite : 0, //借方金额
        recordingvoucherdetailsc_credit: recordingvoucherdetailsc_credit ? recordingvoucherdetailsc_credit : 0, //贷方金额
        recordingvoucherdetailsc_type: recordingvoucherdetailsc_type, // 0贷，1借, 2平
        recordingvoucherdetailsc_GLtype: recordingvoucherdetailsc_GLtype // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
    }, {
        transaction
    })
}


//进销存
async function CGRK(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            materiel,
            supplier,
            amount,
            transaction
        } = option
        //-----------------借方-----------------
        //     总账科目：库存商品/半成品/原材料
        //     明细科目：无

        if (materiel.materiel_accounting == 0) {
            accsum = '库存商品'
        } else if (materiel.materiel_accounting == 1) {
            accsum = '半成品'
        } else {
            accsum = '原材料'
        }

        // accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        activeAccount = ''
        activeAccount_code = ''
        // GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        const { accounting_subject_code, accounting_subject_type_code } = await getAccountingSubject({ name: accsum });
        accsum_code = accounting_subject_code;
        GLtype = accounting_subject_type_code;

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：应付帐款
        //     明细科目：供应商

        accsum = '应付帐款'
        accsum_code = '2202'
        activeAccount = supplier.supplier_name
        activeAccount_code = supplier.supplier_id
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function XSCK(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            corporateclients,
            amount,
            transaction
        } = option
        //-----------------借方-----------------
        //     总账科目：应收账款
        //     明细科目：客户
        accsum = '应收帐款'
        accsum_code = '1122'
        activeAccount = corporateclients.corporateclients_name
        activeAccount_code = corporateclients_id
        GLtype = 0 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：主营业务收入
        //     明细科目：无

        accsum = '主营业务收入'
        accsum_code = '6001'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 3 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function QTRK(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            materiel,
            amount,
            transaction
        } = option
        //-----------------借方-----------------
        //     总账科目：原材料
        //     明细科目：无
        if (materiel.materiel_accounting == 0) {
            accsum = '库存商品'
        } else if (materiel.materiel_accounting == 1) {
            accsum = '半成品'
        } else {
            accsum = '原材料'
        }
        // accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        activeAccount = ''
        activeAccount_code = ''
        // GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        const { accounting_subject_code, accounting_subject_type_code } = await getAccountingSubject({ name: accsum });
        accsum_code = accounting_subject_code;
        GLtype = accounting_subject_type_code;

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：应付账款
        //     明细科目：无

        accsum = '应付帐款'
        accsum_code = '2202'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function WWRKD_1(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            materiel,
            productivetask,
            amount,
            transaction
        } = option


        //-----------------借方-----------------
        //     总账科目：委托加工物资
        //     明细科目：materiel_name+（生产任务单biz_code）
        accsum = '委托加工物资'
        accsum_code = '1411'
        activeAccount = materiel.materiel_name + '(' + productivetask.biz_code + ')'
        activeAccount_code = materiel.materiel_id
        GLtype = 0 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：原材料（或半成品）
        //     明细科目：无

        if (materiel.materiel_accounting == 0) {
            accsum = '库存商品'
        } else if (materiel.materiel_accounting == 1) {
            accsum = '半成品'
        } else {
            accsum = '原材料'
        }
        // accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        activeAccount = ''
        activeAccount_code = ''
        // GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        const { accounting_subject_code, accounting_subject_type_code } = await getAccountingSubject({ name: accsum });
        accsum_code = accounting_subject_code;
        GLtype = accounting_subject_type_code;

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function WWRKD_2(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            supplier,
            productivetask,
            amount,
            transaction
        } = option


        //-----------------借方-----------------
        //     总账科目：委托加工物资
        //     明细科目：加工费+（生产任务单biz_code）
        accsum = '委托加工物资'
        accsum_code = '1411'
        activeAccount = '加工费(' + productivetask.biz_code + ')'
        activeAccount_code = productivetask.biz_code
        GLtype = 0 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：应付账款
        //     明细科目：供应商全称
        accsum = '应付帐款'
        accsum_code = '2202'
        activeAccount = supplier.supplier_name
        activeAccount_code = supplier.supplier_id
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function WWRKD_3_1(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            materiel,
            amount,
            transaction
        } = option

        //-----------------借方-----------------
        //     总账科目：主营业务成本
        //     明细科目：无

        accsum = '主营业务成本'
        accsum_code = '6401'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 4 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：原材料/半成品/库存商品
        //     明细科目：无
        if (materiel.materiel_accounting == 0) {
            accsum = '库存商品'
        } else if (materiel.materiel_accounting == 1) {
            accsum = '半成品'
        } else {
            accsum = '原材料'
        }
        // accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        activeAccount = ''
        activeAccount_code = ''
        // GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        const { accounting_subject_code, accounting_subject_type_code } = await getAccountingSubject({ name: accsum });
        accsum_code = accounting_subject_code;
        GLtype = accounting_subject_type_code;

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function WWRKD_3_2(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            supplier,
            amount,
            transaction
        } = option

        //-----------------借方-----------------
        //     总账科目：主营业务成本
        //     明细科目：无

        accsum = '主营业务成本'
        accsum_code = '6401'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 4 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：应付帐款
        //     明细科目：无

        accsum = '应付帐款'
        accsum_code = '2202'
        activeAccount = supplier.supplier_name
        activeAccount_code = supplier.supplier_id
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function WWRKD_5(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            materiel,
            productivetask,
            amount,
            transaction
        } = option

        //-----------------借方-----------------
        //     总账科目：库存商品/半成品
        //     明细科目：无
        if (materiel.materiel_accounting == 0) {
            accsum = '库存商品'
        } else if (materiel.materiel_accounting == 1) {
            accsum = '半成品'
        } else {
            accsum = '原材料'
        }
        // accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        activeAccount = ''
        activeAccount_code = ''
        // GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        const { accounting_subject_code, accounting_subject_type_code } = await getAccountingSubject({ name: accsum });
        accsum_code = accounting_subject_code;
        GLtype = accounting_subject_type_code;

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：委托加工物资
        //     明细科目：materiel_name(生产任务单biz_code)
        accsum = '委托加工物资'
        accsum_code = '1411'
        activeAccount = materiel.materiel_name + '(' + productivetask.biz_code + ')'
        activeAccount_code = materiel.materiel_id
        GLtype = 0 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function WWRKD_6(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            materiel,
            supplier,
            amount,
            transaction
        } = option

        //-----------------借方-----------------
        //     总账科目：库存商品/半成品
        //     明细科目：无
        if (materiel.materiel_accounting == 0) {
            accsum = '库存商品'
        } else if (materiel.materiel_accounting == 1) {
            accsum = '半成品'
        } else {
            accsum = '原材料'
        }
        // accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        activeAccount = ''
        activeAccount_code = ''
        // GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        const { accounting_subject_code, accounting_subject_type_code } = await getAccountingSubject({ name: accsum });
        accsum_code = accounting_subject_code;
        GLtype = accounting_subject_type_code;

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：应付帐款
        //     明细科目：供应商全称
        accsum = '应付帐款'
        accsum_code = '2202'
        activeAccount = supplier.supplier_name
        activeAccount_code = supplier.supplier_id
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function CPRKD_2(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            productivetask,
            amount,
            transaction
        } = option


        //-----------------借方-----------------
        //     总账科目：生产成本
        //     明细科目：人工(生产任务单号)
        accsum = '生产成本'
        accsum_code = '5001'
        activeAccount = '人工(' + productivetask.biz_code + ')'
        activeAccount_code
        GLtype = 5 // 0资产类，1负债类，2权益类，3收入类，4费用类，5成本类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：应付职工薪酬
        //     明细科目：工资

        accsum = '应付职工薪酬'
        accsum_code = '2211'
        activeAccount = '工资'
        activeAccount_code = ''
        GLtype = 1 // 0资产类，1负债类，2权益类，3收入类，4费用类，5成本类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function CPRKD_3(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            materiel,
            productivetask,
            amount,
            transaction
        } = option

        //-----------------借方-----------------
        //     总账科目：生成成本
        //     明细科目：materiel_name+（生产任务单biz_code）
        accsum = '生成成本'
        accsum_code = '5001'
        activeAccount = materiel.materiel_name + '(' + productivetask.biz_code + ')'
        activeAccount_code = materiel.materiel_id;
        GLtype = 4 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：原材料（或半成品）
        //     明细科目：无

        if (materiel.materiel_accounting == 0) {
            accsum = '库存商品'
        } else if (materiel.materiel_accounting == 1) {
            accsum = '半成品'
        } else {
            accsum = '原材料'
        }
        // accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        activeAccount = ''
        activeAccount_code = ''
        // GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        const { accounting_subject_code, accounting_subject_type_code } = await getAccountingSubject({ name: accsum });
        accsum_code = accounting_subject_code;
        GLtype = accounting_subject_type_code;

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function CPRKD_3_1(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            materiel,
            amount,
            transaction
        } = option

        //-----------------借方-----------------
        //     总账科目：主营业务成本
        //     明细科目：无

        accsum = '主营业务成本'
        accsum_code = '6401'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 4 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：原材料/半成品/库存商品
        //     明细科目：无
        if (materiel.materiel_accounting == 0) {
            accsum = '库存商品'
        } else if (materiel.materiel_accounting == 1) {
            accsum = '半成品'
        } else {
            accsum = '原材料'
        }
        // accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        activeAccount = ''
        activeAccount_code = ''
        // GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        const { accounting_subject_code, accounting_subject_type_code } = await getAccountingSubject({ name: accsum });
        accsum_code = accounting_subject_code;
        GLtype = accounting_subject_type_code;

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function CPRKD_3_2(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            materiel,
            amount,
            transaction
        } = option

        //-----------------借方-----------------
        //     总账科目：主营业务成本
        //     明细科目：无

        accsum = '主营业务成本'
        accsum_code = '6401'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 4 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：应付职工薪酬
        //     明细科目：无
        accsum = '应付职工薪酬'
        accsum_code = '2211'
        activeAccount = '工资'
        activeAccount_code = ''
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function CPRKD_3_3(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            materiel,
            amount,
            transaction
        } = option

        //-----------------借方-----------------
        //     总账科目：主营业务成本
        //     明细科目：无

        accsum = '主营业务成本'
        accsum_code = '6401'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 4 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：制造费用
        //     明细科目：无
        accsum = '制造费用'
        accsum_code = '5101'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 5 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function CPRKD_4(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            productivetask,
            amount,
            transaction
        } = option


        //-----------------借方-----------------
        //     总账科目：生产成本
        //     明细科目：人工(生产任务单号)
        accsum = '生产成本'
        accsum_code = '5001'
        activeAccount = '人工(' + productivetask.biz_code + ')'
        activeAccount_code = productivetask.productivetask_id
        GLtype = 5 // 0资产类，1负债类，2权益类，3收入类，4费用类，5成本类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：应付职工薪酬
        //     明细科目：工资

        accsum = '应付职工薪酬'
        accsum_code = '2211'
        activeAccount = '工资'
        activeAccount_code = ''
        GLtype = 1 // 0资产类，1负债类，2权益类，3收入类，4费用类，5成本类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function CPRKD_4_1(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            productivetask,
            amount,
            transaction
        } = option


        //-----------------借方-----------------
        //     总账科目：生产成本
        //     明细科目：制造费用(生产任务单号)
        accsum = '生产成本'
        accsum_code = '5001'
        activeAccount = '制造费用(' + productivetask.biz_code + ')'
        activeAccount_code = productivetask.productivetask_id
        GLtype = 5 // 0资产类，1负债类，2权益类，3收入类，4费用类，5成本类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：应付职工薪酬
        //     明细科目：工资

        accsum = '制造费用'
        accsum_code = '5101'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 5 // 0资产类，1负债类，2权益类，3收入类，4费用类，5成本类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function CPRKD_5(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            materiel,
            productivetask,
            amount,
            transaction
        } = option

        //-----------------借方-----------------
        //     总账科目：库存商品/半成品/原材料
        //     明细科目：无

        if (materiel.materiel_accounting == 0) {
            accsum = '库存商品'
        } else if (materiel.materiel_accounting == 1) {
            accsum = '半成品'
        } else {
            accsum = '原材料'
        }
        // accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        activeAccount = ''
        activeAccount_code = ''
        // GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        const { accounting_subject_code, accounting_subject_type_code } = await getAccountingSubject({ name: accsum });
        accsum_code = accounting_subject_code;
        GLtype = accounting_subject_type_code;

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：生产成本
        //     明细科目：materiel_name+(productivetask.biz_ocde)

        accsum = '生产成本'
        accsum_code = '5001'
        activeAccount = materiel.materiel_name + '(' + productivetask.biz_ocde + ')'
        activeAccount_code = materiel.materiel_id
        GLtype = 5 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类，5成本类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function CPRKD_6(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            materiel,
            productivetask,
            amount,
            transaction
        } = option


        //-----------------借方-----------------
        //     总账科目：库存商品/半成品/原材料
        //     明细科目：无

        if (materiel.materiel_accounting == 0) {
            accsum = '库存商品'
        } else if (materiel.materiel_accounting == 1) {
            accsum = '半成品'
        } else {
            accsum = '原材料'
        }
        // accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        activeAccount = ''
        activeAccount_code = ''
        // GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        const { accounting_subject_code, accounting_subject_type_code } = await getAccountingSubject({ name: accsum });
        accsum_code = accounting_subject_code;
        GLtype = accounting_subject_type_code;

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：生产成本
        //     明细科目：人工(productivetask.biz_ocde)

        accsum = '生产成本'
        accsum_code = '5001'
        activeAccount = '人工(' + productivetask.biz_code + ')'
        activeAccount_code = productivetask.productivetask_id
        GLtype = 5 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类，5成本类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function CPRKD_7(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            materiel,
            productivetask,
            amount,
            transaction
        } = option

        //-----------------借方-----------------
        //     总账科目：库存商品/半成品/原材料
        //     明细科目：无

        if (materiel.materiel_accounting == 0) {
            accsum = '库存商品'
        } else if (materiel.materiel_accounting == 1) {
            accsum = '半成品'
        } else {
            accsum = '原材料'
        }
        accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        activeAccount = ''
        activeAccount_code = ''
        GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：生产成本
        //     明细科目：制造费用

        accsum = '生产成本'
        accsum_code = '5001'
        activeAccount = '制造费用'
        activeAccount_code = '5101'
        GLtype = 5 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类，5成本类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function ZJZHTZ(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = ''
        let {
            amount,
            capitalaccountchang_out,
            capitalaccountchang_into,
            transaction
        } = option

        //-----------------借方-----------------
        //     总账科目：银行存款
        //     明细科目：银行账号


        accsum = '银行存款'
        accsum_code = '1002'
        activeAccount = capitalaccountchang_out
        activeAccount_code = ''
        GLtype = 0 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：银行存款
        //     明细科目：银行账号

        accsum = '银行存款'
        accsum_code = '1002'
        activeAccount = capitalaccountchang_into
        activeAccount_code = ''
        GLtype = 0 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类，5成本类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}

/* 计提*/
async function FZJT(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            department,
            othermain,
            amount
        } = option


        //-----------------借方-----------------
        //     总账科目：XX费用
        //     明细科目：房租支出
        if (department.department_type == 0) {
            accsum = '制造费用'
        } else if (department.department_type == 0) {
            accsum = '销售费用'
        } else {
            accsum = '管理费用'
        }
        accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        activeAccount = '房租支出'
        activeAccount_code = ''
        GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        })
        //-----------------贷方-----------------
        //     总账科目：其他应付款
        //     明细科目：其他相关主题
        accsum = '其他应付款'
        accsum_code = '2241'
        activeAccount = othermain.other_main_name
        activeAccount_code = othermain.other_main_code
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类，5成本类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        })
    } catch (error) {
        throw error
    }
}
async function SDFJT(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            amount_type, //1水费，2电费
            department,
            othermain,
            amount
        } = option


        //-----------------借方-----------------
        //     总账科目：XX费用
        //     明细科目：水/电费支出
        if (department.department_type == 0) {
            accsum = '制造费用'
        } else if (department.department_type == 0) {
            accsum = '销售费用'
        } else {
            accsum = '管理费用'
        }
        accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        if (amount_type == 1) {
            activeAccount = '水费支出'
        } else {
            activeAccount = '电费支出'
        }
        activeAccount_code = ''
        GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        })
        //-----------------贷方-----------------
        //     总账科目：其他应付款
        //     明细科目：其他相关主题
        accsum = '其他应付款'
        accsum_code = '2241'
        activeAccount = othermain.other_main_name
        activeAccount_code = othermain.other_main_code
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类，5成本类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        })
    } catch (error) {
        throw error
    }
}
async function STJT(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            department,
            // other_main_id,
            amount
        } = option


        // let othermain = await tb_othermain.findOne({
        //     where: {
        //         state: 1,
        //         other_main_id: other_main_id
        //     }
        // })
        //-----------------借方-----------------
        //     总账科目：XX费用
        //     明细科目：食堂费用
        if (department.department_type == 0) {
            accsum = '制造费用'
        } else if (department.department_type == 0) {
            accsum = '销售费用'
        } else {
            accsum = '管理费用'
        }
        accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        activeAccount = '食堂费用'
        activeAccount_code = ''
        GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        })
        //-----------------贷方-----------------
        //     总账科目：其他应付款
        //     明细科目：其他相关主题
        accsum = '其他应付款'
        accsum_code = '2241'
        activeAccount = '计提伙食费'
        activeAccount_code = ''
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类，5成本类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        })
    } catch (error) {
        throw error
    }
}
async function GDZCZJ(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            department,
            amount
        } = option


        //-----------------借方-----------------
        //     总账科目：XX费用
        //     明细科目：资产折旧
        if (department.department_type == 0) {
            accsum = '制造费用'
        } else if (department.department_type == 0) {
            accsum = '销售费用'
        } else {
            accsum = '管理费用'
        }
        accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        activeAccount = '资产折旧'
        activeAccount_code = ''
        GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        })
        //-----------------贷方-----------------
        //     总账科目：累计折旧
        //     明细科目：无
        accsum = '累计折旧'
        accsum_code = '1602'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 0 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类，5成本类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        })
    } catch (error) {
        throw error
    }
}
async function CQDTZCTX(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            department_id,
            amount
        } = option



        //-----------------借方-----------------
        //     总账科目：XX费用
        //     明细科目：资产折旧
        if (department.department_type == 0) {
            accsum = '制造费用'
        } else if (department.department_type == 0) {
            accsum = '销售费用'
        } else {
            accsum = '管理费用'
        }
        accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        activeAccount = '资产折旧'
        activeAccount_code = ''
        GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        })
        //-----------------贷方-----------------
        //     总账科目：累计摊销
        //     明细科目：无
        accsum = '累计摊销'
        accsum_code = '1702'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 0 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类，5成本类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        })
    } catch (error) {
        throw error
    }
}
async function GZJT_2(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            department,
            amount
        } = option

        //-----------------借方-----------------
        //     总账科目：XX费用
        //     明细科目：工资支出
        if (department.department_type == 0) {
            accsum = '制造费用'
        } else if (department.department_type == 0) {
            accsum = '销售费用'
        } else {
            accsum = '管理费用'
        }
        accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        activeAccount = '工资支出'
        activeAccount_code = ''
        GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        })
        //-----------------贷方-----------------
        //     总账科目：应付职工薪酬
        //     明细科目：其他相关主题
        accsum = '应付职工薪酬'
        accsum_code = '2211'
        activeAccount = '工资'
        activeAccount_code = ''
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类，5成本类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        })
    } catch (error) {
        throw error
    }
}
async function GZJT_3(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            department,
            amount
        } = option


        //-----------------借方-----------------
        //     总账科目：XX费用
        //     明细科目：工资支出
        if (department.department_type == 0) {
            accsum = '制造费用'
        } else if (department.department_type == 0) {
            accsum = '销售费用'
        } else {
            accsum = '管理费用'
        }
        accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        activeAccount = '工资支出'
        activeAccount_code = ''
        GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        })
        //-----------------贷方-----------------
        //     总账科目：应付职工薪酬
        //     明细科目：其他相关主题
        accsum = '应付职工薪酬'
        accsum_code = '2211'
        activeAccount = '工资'
        activeAccount_code = ''
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类，5成本类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
        })
    } catch (error) {
        throw error
    }
}

//其他收款
async function QTSK_0(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            othercollection,
            amount,
            transaction
        } = option
        //-----------------借方-----------------
        //     总账科目：库存现金/银行存款/其它货币资金
        //     明细科目：现金无明细，银行存款为账号

        let paymentMethod = GLBConfig.PAYMENTMETHOD.filter(item => {
            return othercollection.othercollection_way === item.id
        })

        accsum = paymentMethod.text
        accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

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


        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：营业外收入
        //     明细科目：无

        accsum = '营业外收入'
        accsum_code = '6301'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 3 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function QTSK_1(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            othercollection,
            amount,
            transaction
        } = option
        //-----------------借方-----------------
        //     总账科目：库存现金/银行存款/其它货币资金
        //     明细科目：现金无明细，银行存款为账号

        let paymentMethod = GLBConfig.PAYMENTMETHOD.filter(item => {
            return othercollection.othercollection_way === item.id
        })

        accsum = paymentMethod.text
        accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

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

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：其他应收款
        //     明细科目：其他相关单位

        accsum = '其他应收款'
        accsum_code = '1133'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 0 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function QTSK_2(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            othercollection,
            amount,
            transaction
        } = option
        //-----------------借方-----------------
        //     总账科目：库存现金/银行存款/其它货币资金
        //     明细科目：现金无明细，银行存款为账号

        let paymentMethod = GLBConfig.PAYMENTMETHOD.filter(item => {
            return othercollection.othercollection_way === item.id
        })

        accsum = paymentMethod.text
        accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

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

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：营业外收入
        //     明细科目：无

        accsum = '营业外收入'
        accsum_code = '6301'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 3 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function QTSK_3(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            othercollection,
            amount,
            transaction
        } = option
        //-----------------借方-----------------
        //     总账科目：库存现金/银行存款/其它货币资金
        //     明细科目：现金无明细，银行存款为账号

        let paymentMethod = GLBConfig.PAYMENTMETHOD.filter(item => {
            return othercollection.othercollection_way === item.id
        })

        accsum = paymentMethod.text
        accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

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

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：应付账款
        //     明细科目：供应商全称

        accsum = '应付账款'
        accsum_code = '2121'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 1 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function QTSK_4(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            othercollection,
            amount,
            transaction
        } = option
        //-----------------借方-----------------
        //     总账科目：库存现金/银行存款/其它货币资金
        //     明细科目：现金无明细，银行存款为账号

        let paymentMethod = GLBConfig.PAYMENTMETHOD.filter(item => {
            return othercollection.othercollection_way === item.id
        })

        accsum = paymentMethod.text
        accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

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

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：其他应收款
        //     明细科目：其他相关单位或个人、客户、供应商

        accsum = '其他应收款'
        accsum_code = '1133'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 0 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
    }
}
async function QTSK_9(addRecordingCoucherSC, user, option) {
    try {
        let accsum = '',
            accsum_code = '',
            activeAccount = '',
            activeAccount_code = '',
            GLtype = '',
            addRecordingvoucherdetailsc = {};
        let {
            othercollection,
            amount,
            transaction
        } = option
        //-----------------借方-----------------
        //     总账科目：库存现金/银行存款/其它货币资金
        //     明细科目：现金无明细，银行存款为账号

        let paymentMethod = GLBConfig.PAYMENTMETHOD.filter(item => {
            return othercollection.othercollection_way === item.id
        })

        accsum = paymentMethod.text
        accsum_code = AccountConst.codeArray[AccountConst.nameArray.indexOf(accsum)]
        GLtype = AccountConst.typeCodeArray[AccountConst.nameArray.indexOf(accsum)] // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

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

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_debite: amount, //借方金额
            recordingvoucherdetailsc_type: 2, // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
        //-----------------贷方-----------------
        //     总账科目：实收资本
        //     明细科目：供应商全称

        accsum = '实收资本'
        accsum_code = '4001'
        activeAccount = ''
        activeAccount_code = ''
        GLtype = 2 // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类

        await createRecordingVoucherDetailSC({
            domain_id: user.domain_id,
            recordingvouchersc_id: addRecordingCoucherSC.recordingvouchersc_id, //记账凭证id
            recordingvoucherdetailsc_accsum: accsum, //总账科目text
            recordingvoucherdetailsc_activeAccount: activeAccount, //明细科目text
            recordingvoucherdetailsc_accsum_code: accsum_code, //总账科目code
            recordingvoucherdetailsc_activeAccount_code: activeAccount_code, //明细科目code
            recordingvoucherdetailsc_credit: amount, //贷方金额
            recordingvoucherdetailsc_type: '2', // 0贷，1借, 2平
            recordingvoucherdetailsc_GLtype: GLtype, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
            transaction
        })
    } catch (error) {
        throw error
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
module.exports = {
    createRecordingVoucherSC,
    createRecordingVoucherSCJT,
    getSalary
}
