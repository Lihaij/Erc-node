const common = require('../../../util/CommonUtil');
const logger = require('../../../util/Logger').createLogger('ERCTaxStatementControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const { CODE_NAME, genBizCode } = require('../../../util/BizCodeUtil');
const GLBConfig = require('../../../util/GLBConfig');
const TaskListControlSRV = require('../baseconfig/ERCTaskListControlSRV');

const moment = require('moment');
const sequelize = model.sequelize;

const tb_taxpayment = model.erc_taxpayment;
const tb_paymentconfirm = model.erc_paymentconfirm;

exports.ERCTaxPaymentControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'initTaxPayment') {
        await initTaxPayment(req, res);
    } else if (method === 'addTaxPayment') {
        await addTaxPayment(req, res);
    } else if (method === 'getTaxPaymentList') {
        await getTaxPaymentList(req, res);
    } else if (method === 'modifyTaxPayment') {
        await modifyTaxPayment(req, res);
    } else if (method === 'deleteTaxPayment') {
        await deleteTaxPayment(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

async function initTaxPayment(req, res) {
    const returnData = {};

    try {
        returnData.taskState = GLBConfig.CHANGESTATE;
        returnData.paymentState = GLBConfig.PAYMENTCONFIRMSTATE;
        returnData.taxPaymentType = GLBConfig.TAX_PAYMENT_TYPE;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function addTaxPaymentTask(title, type, user, product_id, user_id) {
    const taskName = title;
    const taskType = type;
    const taskPerformer = user_id;
    const taskReviewCode = product_id;
    const taskDescription = title;
    const groupId = common.getUUIDByTime(30);
    await TaskListControlSRV.createTask(user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, '', groupId);
}

async function addTaxPayment(req, res) {
    const { body, user } = req;

    try {
        const { tax_type, payment_price, payment_note } = body;
        const { user_id, domain_id } = user;
        const taxpayment_code = await Sequence.genTaxPaymentCID();
        const apply_state = GLBConfig.CHANGESTATE[1].value;
        const payment_state = GLBConfig.PAYMENTCONFIRMSTATE[0].value;

        const result = await tb_taxpayment.create({
            taxpayment_code,
            tax_type,
            payment_price,
            payment_note,
            user_id,
            domain_id,
            apply_state,
            payment_state,
            biz_code: await genBizCode(CODE_NAME.YJSF, domain_id, 6)
        });

        if (result) {
            await addTaxPaymentTask('税费付款任务', '81', user, result.taxpayment_id, user_id);
        }

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getTaxPaymentList(req, res) {
    const { body, user } = req;
    const returnData = {};

    try {
        const { domain_id } = user;
        const { search_text } = body;

        let queryStr =
            `select
                txp.taxpayment_id, txp.taxpayment_code, txp.tax_type, txp.payment_price, txp.payment_note
                , txp.paymentconfirm_id, txp.apply_state, txp.payment_state, txp.reject_caused
                , date(txp.approval_date) as approval_date, date(txp.created_at) as created_at
                , usr.name
                from tbl_erc_taxpayment txp
                left join tbl_common_user usr
                on txp.user_id = usr.user_id
                where true
                and txp.state = ?
                and txp.domain_id = ?
                order by txp.taxpayment_code`;

        const replacements = [GLBConfig.ENABLE, domain_id];

        if (search_text) {
            queryStr += ` and txp.taxpayment_code like ?`;
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

async function modifyTaxPayment(req, res) {
    const { body, user } = req;

    try {
        const { taxpayment_id, taxpayment_code, tax_type, payment_price, payment_note } = body;
        const { user_id, domain_id } = user;

        const result = await tb_taxpayment.findOne({
            where: {
                taxpayment_id
            }
        });

        if (result) {
            result.state = GLBConfig.DISABLE;
            await result.save();

            const apply_state = GLBConfig.CHANGESTATE[1].value;
            const payment_state = GLBConfig.PAYMENTCONFIRMSTATE[0].value;

            const newTaxPayment = await tb_taxpayment.create({
                taxpayment_code,
                tax_type,
                payment_price,
                payment_note,
                user_id,
                domain_id,
                apply_state,
                payment_state
            });

            if (newTaxPayment) {
                await addTaxPaymentTask('税费付款任务', '81', user, newTaxPayment.taxpayment_id, user_id);
            }
        }
        common.sendData(res, result);
    } catch (error) {
        logger.error(error.message);
    }
}

async function deleteTaxPayment(req, res) {
    const { body } = req;

    try {
        const { taxpayment_id } = body;
        const result = await tb_taxpayment.destroy({
            where: {
                taxpayment_id
            }
        });
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

exports.modifyTaxPaymentApplyState = async (applyState, description, taxpayment_id, applyApprover) => {
    try {
        const result = await tb_taxpayment.findOne({
            where: {
                taxpayment_id
            }
        });

        if (result) {
            const { domain_id, taxpayment_id, taxpayment_code, payment_price, user_id } = result;

            if (applyState === '2') {
                const paymentConfirm = await tb_paymentconfirm.create({
                    domain_id,
                    paymentconfirm_name: GLBConfig.PAYMENTCONFIRMTYPE[2].value,
                    paymentconfirm_source_code: taxpayment_code,
                    paymentconfirm_money: payment_price,
                    paymentconfirm_expend_user: user_id,
                    paymentconfirm_declarant: user_id,
                    paymentconfirm_declarant_time: new Date(),
                    paymentconfirm_state: GLBConfig.PAYMENTCONFIRMSTATE[0].value,
                    s_expense_type_id: taxpayment_id
                });

                result.apply_state = applyState;
                result.payment_state = GLBConfig.PAYMENTCONFIRMSTATE[0].value;
                result.approval_date = new Date();
                result.paymentconfirm_id = paymentConfirm.paymentconfirm_id;
                await result.save();
            } else if (applyState === '3') {
                result.apply_state = applyState;
                result.approval_date = new Date();
                result.reject_caused = description;
                await result.save();
            }
        }
    } catch (error) {
        logger.error(error.message);
    }
};
