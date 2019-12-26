const common = require('../../../util/CommonUtil');
const logger = require('../../../util/Logger').createLogger('ERCTaxStatementControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const { CODE_NAME, genBizCode } = require('../../../util/BizCodeUtil');
const TaskListControlSRV = require('../baseconfig/ERCTaskListControlSRV');

const moment = require('moment');
const sequelize = model.sequelize;

const tb_taxstatement = model.erc_taxstatement;

exports.ERCTaxStatementControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'initTaxStatement') {
        await initTaxStatement(req, res);
    } else if (method === 'createTaxStatement') {
        await createTaxStatement(req, res);
    } else if (method === 'getTaxStatementList') {
        await getTaxStatementList(req, res);
    } else if (method === 'getTaxStatementInfo') {
        await getTaxStatementInfo(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

async function initTaxStatement(req, res) {
    const body = req.body;
    const user = req.user;
    const returnData = {};

    try {
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function addTaxStatementTask(title, type, user, product_id, user_id) {
    const taskName = title;
    const taskType = type;
    const taskPerformer = user_id;
    const taskReviewCode = product_id;
    const taskDescription = title;
    const groupId = common.getUUIDByTime(30);
    await TaskListControlSRV.createTask(user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, '', groupId);
}

async function createTaxStatement(req, res) {
    const body = req.body;
    const user = req.user;

    try {
        const createBody = {
            tax_type: body.tax_type,
            tax_sub_type: body.tax_sub_type,
            value_length: body.value_length,
            tax_value: body.tax_value,
            start_date: body.start_date,
            end_date: body.end_date,
            verify_user: user.name,
            verify_state: 1,
            domain_id: user.domain_id
        };

        if (body.tax_type === 1) {
            if (body.tax_sub_type === 1) {
                createBody.taxstatement_code = await Sequence.genTaxStatementA1CID();
            } else if (body.tax_sub_type === 2) {
                createBody.taxstatement_code = await Sequence.genTaxStatementA2CID();
            } else if (body.tax_sub_type === 3) {
                createBody.taxstatement_code = await Sequence.genTaxStatementA3CID();
            }
        } else if (body.tax_type === 2) {
            if (body.tax_sub_type === 1) {
                createBody.taxstatement_code = await Sequence.genTaxStatementA1CID();
            } else if (body.tax_sub_type === 2) {
                createBody.taxstatement_code = await Sequence.genTaxStatementA2CID();
            } else if (body.tax_sub_type === 3) {
                createBody.taxstatement_code = await Sequence.genTaxStatementA3CID();
            } else if (body.tax_sub_type === 4) {
                createBody.taxstatement_code = await Sequence.genTaxStatementB4CID();
            }
        } else if (body.tax_type === 3) {
            if (body.tax_sub_type === 1) {
                createBody.taxstatement_code = await Sequence.genTaxStatementC1CID();
            } else if (body.tax_sub_type === 2) {
                createBody.taxstatement_code = await Sequence.genTaxStatementA2CID();
            } else if (body.tax_sub_type === 3) {
                createBody.taxstatement_code = await Sequence.genTaxStatementA3CID();
            }
        }

        const result = await tb_taxstatement.create(createBody);

        if (result) {
            await addTaxStatementTask('税务申报表任务', '80', user, result.taxstatement_id, user.user_id);
        }

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getTaxStatementList(req, res) {
    const body = req.body;
    const user = req.user;
    const returnData = {};

    try {
        let queryStr =
            `select
                tst.taxstatement_id, tst.taxstatement_code, tst.tax_type, tst.tax_sub_type, tst.value_length, tst.tax_value
                , tst.biz_code
                , date(tst.start_date) as start_date, date(tst.end_date) as end_date, tst.verify_state, tst.verify_user
                , date(tst.created_at) as created_at
                from tbl_erc_taxstatement tst
                where true
                and tst.domain_id = ?`;

        const replacements = [user.domain_id];

        if (body.tax_type) {
            queryStr += ` and tst.tax_type = ?`;
            replacements.push(body.tax_type);
        }
        if (body.tax_sub_type) {
            queryStr += ` and tst.tax_sub_type = ?`;
            replacements.push(body.tax_sub_type);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getTaxStatementInfo(req, res) {
    const body = req.body;

    try {
        const result = await tb_taxstatement.findOne({
            where: {
                taxstatement_id: body.taxstatement_id
            }
        });
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

exports.modifyTaxStatementInfo = async (applyState, description, taxstatement_id, applyApprover) => {
    try {
        const result = await tb_taxstatement.findOne({
            where: {
                taxstatement_id
            }
        });

        if (result) {
            result.verify_state = applyState;

            if (parseInt(applyState) === 2) {
                if (result.tax_type === 1) {
                    if (result.tax_sub_type === 1) {
                        result.biz_code = await genBizCode(CODE_NAME.ZZSSBB, result.domain_id, 6);
                    } else if (result.tax_sub_type === 2) {
                        result.biz_code = await genBizCode(CODE_NAME.JDSSBB, result.domain_id, 6);
                    } else if (result.tax_sub_type === 3) {
                        result.biz_code = await genBizCode(CODE_NAME.NDSSBB, result.domain_id, 6);
                    }
                } else if (result.tax_type === 2) {
                    if (result.tax_sub_type === 1) {
                        result.biz_code = await genBizCode(CODE_NAME.ZZSSBB, result.domain_id, 6);
                    } else if (result.tax_sub_type === 2) {
                        result.biz_code = await genBizCode(CODE_NAME.JDSSBB, result.domain_id, 6);
                    } else if (result.tax_sub_type === 3) {
                        result.biz_code = await genBizCode(CODE_NAME.NDSSBB, result.domain_id, 6);
                    } else if (result.tax_sub_type === 4) {
                        result.biz_code = await genBizCode(CODE_NAME.MDSSBB, result.domain_id, 6);
                    }
                } else if (result.tax_type === 3) {
                    if (result.tax_sub_type === 1) {
                        result.biz_code = await genBizCode(CODE_NAME.ZZSSBB, result.domain_id, 6);
                    } else if (result.tax_sub_type === 2) {
                        result.biz_code = await genBizCode(CODE_NAME.JDSSBB, result.domain_id, 6);
                    } else if (result.tax_sub_type === 3) {
                        result.biz_code = await genBizCode(CODE_NAME.NDSSBB, result.domain_id, 6);
                    }
                }
            }

            await result.save();
        }
    } catch (error) {
        logger.error(error.message);
    }
};
