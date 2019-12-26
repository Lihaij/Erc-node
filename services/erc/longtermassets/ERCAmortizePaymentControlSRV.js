
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCAmortizeControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const { CODE_NAME, genBizCode } = require('../../../util/BizCodeUtil');
const moment = require('moment');
const sequelize = model.sequelize;
const TaskListControlSRV = require('../baseconfig/ERCTaskListControlSRV');

const tb_amortize = model.erc_amortize;
const tb_amortize_payment = model.erc_amortize_payment;
const tb_paymentconfirm = model.erc_paymentconfirm;

// 待摊资产接口
exports.ERCAmortizePaymentControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'initAmortizePayment') {
        await initAmortizePayment(req, res);
    } else if (method === 'getAmortizePayment') {
        await getAmortizePayment(req, res);
    } else if (method === 'addAmortizePayment'){
        await addAmortizePayment(req,res)
    } else if (method === 'modifyAmortizePayment'){
        await modifyAmortizePayment(req, res)
    } else if (method === 'deleteAmortizePayment'){
        await deleteAmortizePayment(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};

// 初始化基础数据
async function initAmortizePayment(req,res) {
    const { user } = req;
    const { domain_id } = user;
    const returnData = {};

    try {
        returnData.taskState = GLBConfig.CHANGESTATE;
        returnData.paymentState = GLBConfig.PAYMENTCONFIRMSTATE;
        returnData.paymentType = GLBConfig.AMORTIZE_PAYMENT_TYPE;
        returnData.amortizeInfo = await tb_amortize.findAll({
            where: {
                domain_id
            },
            attributes: [['amortize_id', 'id'], ['amortize_name', 'text']]
        });
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getAmortizePayment(req, res) {
    const { body, user } = req;
    const returnData = {};

    try {
        const { domain_id } = user;
        const { search_text } = body;

        let queryStr =
            `select
                amp.amortize_payment_id, amp.amortize_payment_code, amp.payment_type, amp.payment_price, amp.payment_note
                , amp.paymentconfirm_id, amp.apply_state, amp.payment_state, amp.reject_caused
                , date(amp.approval_date) as approval_date, date(amp.created_at) as created_at
                , am.amortize_id, am.amortize_code, am.amortize_name
                , usr.name
                from tbl_erc_amortize_payment amp
                left join tbl_erc_amortize am
                on amp.amortize_id = am.amortize_id
                left join tbl_common_user usr
                on amp.user_id = usr.user_id
                where true
                and amp.state = ?
                and amp.domain_id = ?
                order by amp.amortize_payment_code`;

        const replacements = [GLBConfig.ENABLE, domain_id];

        if (search_text) {
            queryStr += ` and amp.amortize_payment_code like ?`;
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

async function addAmortizePaymentTask(title, type, user, product_id, user_id) {
    const taskName = title;
    const taskType = type;
    const taskPerformer = user_id;
    const taskReviewCode = product_id;
    const taskDescription = title;
    const groupId = common.getUUIDByTime(30);
    await TaskListControlSRV.createTask(user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, '', groupId);
}

async function addAmortizePayment(req, res) {
    const { body, user } = req;

    try {
        const { user_id, domain_id } = user;
        const { amortize_id, payment_type, payment_price, payment_note } = body;

        const apply_state = GLBConfig.CHANGESTATE[1].value;
        const payment_state = GLBConfig.PAYMENTCONFIRMSTATE[0].value;
        const amortize_payment_code = await Sequence.genAmortizePaymentCID();

        const result = await tb_amortize_payment.create({
            amortize_payment_code,
            amortize_id,
            payment_type,
            payment_price,
            payment_note,
            user_id,
            apply_state,
            payment_state,
            domain_id,
            biz_code: await genBizCode(CODE_NAME.CQZC, domain_id, 6)
        });

        if (result) {
            await addAmortizePaymentTask('长期资产付款任务', '83', user, result.amortize_payment_id, user_id);
        }

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function modifyAmortizePayment(req, res) {
    const { body, user } = req;

    try {
        const { amortize_payment_id, amortize_payment_code, amortize_id, payment_type, payment_price, payment_note } = body;
        const { user_id, domain_id } = user;

        const result = await tb_amortize_payment.findOne({
            where: {
                amortize_payment_id
            }
        });

        if (result) {
            result.state = GLBConfig.DISABLE;
            await result.save();

            const apply_state = GLBConfig.CHANGESTATE[1].value;
            const payment_state = GLBConfig.PAYMENTCONFIRMSTATE[0].value;

            const newAmortizePayment = await tb_amortize_payment.create({
                amortize_payment_code,
                amortize_id,
                payment_type,
                payment_price,
                payment_note,
                user_id,
                domain_id,
                apply_state,
                payment_state
            });

            if (newAmortizePayment) {
                await addAmortizePaymentTask('长期资产付款任务', '83', user, newAmortizePayment.amortize_payment_id, user_id);
            }
        }
        common.sendData(res, {});
    } catch (error) {
        common.sendFault(res, error);
    }
}
async function deleteAmortizePayment(req, res) {
    const { body } = req;

    try {
        const { amortize_payment_id } = body;
        const result = await tb_amortize_payment.destroy({
            where: {
                amortize_payment_id
            }
        });
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

exports.modifyAmortizePaymentApplyState = async (applyState, description, amortize_payment_id, applyApprover) => {
    try {
        const result = await tb_amortize_payment.findOne({
            where: {
                amortize_payment_id
            }
        });

        if (result) {
            const { domain_id, amortize_payment_id, amortize_payment_code, payment_price, user_id } = result;

            if (applyState === '2') {
                const paymentConfirm = await tb_paymentconfirm.create({
                    domain_id,
                    paymentconfirm_name: GLBConfig.PAYMENTCONFIRMTYPE[4].value,
                    paymentconfirm_source_code: amortize_payment_code,
                    paymentconfirm_money: payment_price,
                    paymentconfirm_expend_user: user_id,
                    paymentconfirm_declarant: user_id,
                    paymentconfirm_declarant_time: new Date(),
                    paymentconfirm_state: GLBConfig.PAYMENTCONFIRMSTATE[0].value,
                    s_expense_type_id: amortize_payment_id
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
