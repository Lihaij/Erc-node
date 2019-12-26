const common = require('../../../util/CommonUtil');
const logger = require('../../../util/Logger').createLogger('ERCSupplierStatementControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const { CODE_NAME, genBizCode } = require('../../../util/BizCodeUtil');
const GLBConfig = require('../../../util/GLBConfig');
const TaskListControlSRV = require('../baseconfig/ERCTaskListControlSRV');

const moment = require('moment');
const sequelize = model.sequelize;

const tb_supplierpayment = model.erc_supplierpayment;
const tb_paymentconfirm = model.erc_paymentconfirm;
const tb_supplier = model.erc_supplier;

exports.ERCSupplierPaymentControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'initSupplierPayment') {
        await initSupplierPayment(req, res);
    } else if (method === 'addSupplierPayment') {
        await addSupplierPayment(req, res);
    } else if (method === 'getSupplierPaymentList') {
        await getSupplierPaymentList(req, res);
    } else if (method === 'modifySupplierPayment') {
        await modifySupplierPayment(req, res);
    } else if (method === 'deleteSupplierPayment') {
        await deleteSupplierPayment(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

async function initSupplierPayment(req, res) {
    const { user } = req;
    const { domain_id } = user;
    const returnData = {};

    try {
        returnData.taskState = GLBConfig.CHANGESTATE;
        returnData.paymentState = GLBConfig.PAYMENTCONFIRMSTATE;
        returnData.supplierInfo = await tb_supplier.findAll({
            where: {
                domain_id
            },
            attributes: [['supplier_id', 'id'], ['supplier_name', 'text']]
        });
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function addSupplierPaymentTask(title, type, user, product_id, user_id) {
    const taskName = title;
    const taskType = type;
    const taskPerformer = user_id;
    const taskReviewCode = product_id;
    const taskDescription = title;
    const groupId = common.getUUIDByTime(30);
    await TaskListControlSRV.createTask(user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, '', groupId);
}

async function addSupplierPayment(req, res) {
    const { body, user } = req;

    try {
        const { supplier_id, payment_price, payment_note } = body;
        const { user_id, domain_id } = user;
        const supplierpayment_code = await Sequence.genSupplierPaymentCID();
        const apply_state = GLBConfig.CHANGESTATE[1].value;
        const payment_state = GLBConfig.PAYMENTCONFIRMSTATE[0].value;

        const result = await tb_supplierpayment.create({
            supplierpayment_code,
            supplier_id,
            payment_price,
            payment_note,
            user_id,
            domain_id,
            apply_state,
            payment_state,
            biz_code: await genBizCode(CODE_NAME.GYSFKSQ, domain_id, 6)
        });

        if (result) {
            await addSupplierPaymentTask('供应商付款任务', '82', user, result.supplierpayment_id, user_id);
        }

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getSupplierPaymentList(req, res) {
    const { body, user } = req;
    const returnData = {};

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
                and slp.state = ?
                and slp.domain_id = ?
                order by slp.supplierpayment_code`;

        const replacements = [GLBConfig.ENABLE, user.domain_id];

        if (body.search_text) {
            queryStr += ` and slp.supplierpayment_code = ?`;
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

async function modifySupplierPayment(req, res) {
    const { body, user } = req;

    try {
        const { supplierpayment_id, supplierpayment_code, supplier_id, payment_price, payment_note } = body;
        const { user_id, domain_id } = user;

        const result = await tb_supplierpayment.findOne({
            where: {
                supplierpayment_id
            }
        });

        if (result) {
            result.state = GLBConfig.DISABLE;
            await result.save();

            const apply_state = GLBConfig.CHANGESTATE[1].value;
            const payment_state = GLBConfig.PAYMENTCONFIRMSTATE[0].value;

            const newSupplierPayment = await tb_supplierpayment.create({
                supplierpayment_code,
                supplier_id,
                payment_price,
                payment_note,
                user_id,
                domain_id,
                apply_state,
                payment_state
            });

            if (newSupplierPayment) {
                await addSupplierPaymentTask('供应商付款任务', '82', user, newSupplierPayment.supplierpayment_id, user_id);
            }
        }
        common.sendData(res, result);
    } catch (error) {
        logger.error(error.message);
    }
}

async function deleteSupplierPayment(req, res) {
    const { body } = req;

    try {
        const { supplierpayment_id } = body;
        const result = await tb_supplierpayment.destroy({
            where: {
                supplierpayment_id
            }
        });
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

exports.modifySupplierPaymentApplyState = async (applyState, description, supplierpayment_id, applyApprover) => {
    try {
        const result = await tb_supplierpayment.findOne({
            where: {
                supplierpayment_id
            }
        });

        if (result) {
            const { domain_id, supplierpayment_id, supplierpayment_code, payment_price, user_id } = result;

            if (applyState === '2') {
                const paymentConfirm = await tb_paymentconfirm.create({
                    domain_id,
                    paymentconfirm_name: GLBConfig.PAYMENTCONFIRMTYPE[3].value,
                    paymentconfirm_source_code: supplierpayment_code,
                    paymentconfirm_money: payment_price,
                    paymentconfirm_expend_user: user_id,
                    paymentconfirm_declarant: user_id,
                    paymentconfirm_declarant_time: new Date(),
                    paymentconfirm_state: GLBConfig.PAYMENTCONFIRMSTATE[0].value,
                    s_expense_type_id: supplierpayment_id
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
