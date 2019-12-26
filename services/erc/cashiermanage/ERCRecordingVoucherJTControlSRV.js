/**
 * Created by Cici on 2018/4/26.
 */
/**
 * 资金费用记账凭证
 */
const fs = require('fs');
const moment = require('moment');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCTransReceptionSRV');
const model = require('../../../model');


// tables
const sequelize = model.sequelize;
const tb_specialexpensesum = model.erc_specialexpensesum;
const tb_cashiergatheringsum = model.erc_cashiergatheringsum;
const tb_department = model.erc_department;

exports.ERCRecordingVoucherSCControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'getRecordingVoucherJT') {
        getRecordingVoucherJT(req, res)
    } else if (method === 'getRecordingVoucherJTDetail') {
        getRecordingVoucherJTDetail(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    try {
        let returnData = {}
        returnData.CAPITALCOSTTYLE = GLBConfig.CAPITALCOSTTYLE;
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
    }

}
async function getRecordingVoucherJT(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {}

        let queryStr = `select s.*
            from tbl_erc_recordingvouchersc s 
            where s.state=1 and s.domain_id=? and recordingvouchersc_type=97`;
        replacements.push(user.domain_id);
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let resultTemp = JSON.parse(JSON.stringify(r));
            resultTemp.recordingvouchersc_time = moment(resultTemp.recordingvouchersc_time).format('YYYY-MM-DD');
            returnData.rows.push(resultTemp)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
async function getRecordingVoucherJTDetail(req, res) {
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
    returnData.total_price = itemTotalPrice
    common.sendData(res, returnData);
}

async function getSubsidiaryLedgersInit(req, res) {
    try {
        const returnData = {};
        returnData.CAPITALCOSTTYLE = GLBConfig.CAPITALCOSTTYLE;
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
    }
}
async function getSubsidiaryLedgersList(req, res) {
    const body = req.body;
    const user = req.user;
    const returnData = {};

    try {
        if (!body.glType && body.glType !== 0) {
            return common.sendError(res, '缺少参数');
        }

        const countStr =
            `select
                count(*) as count from (
                select
                rvd.recordingvoucherdetailsc_activeAccount
                from tbl_erc_recordingvoucherdetailsc rvd
                where true
                and rvd.domain_id = ?
                and !isnull(rvd.recordingvoucherdetailsc_activeAccount)
                and length(trim(rvd.recordingvoucherdetailsc_activeAccount)) > 0
                and rvd.recordingvoucherdetailsc_GLtype = ?
                group by rvd.recordingvoucherdetailsc_activeAccount) rlt`;

        const countResult = await common.simpleSelect(sequelize, countStr, [user.domain_id, body.glType]);
        // const [countData] = countResult.data;

        let queryStr =
            `select
                rvd.recordingvoucherdetailsc_id, rvd.recordingvouchersc_id, rvd.recordingvoucherdetailsc_digest, rvd.recordingvoucherdetailsc_accsum
                , rvd.recordingvoucherdetailsc_activeAccount, rvd.recordingvoucherdetailsc_debite, rvd.recordingvoucherdetailsc_credit
                , rvd.recordingvoucherdetailsc_type, rvd.created_at
                from tbl_erc_recordingvoucherdetailsc rvd
                where true
                and rvd.domain_id = ?
                and !isnull(rvd.recordingvoucherdetailsc_activeAccount)
                and length(trim(rvd.recordingvoucherdetailsc_activeAccount)) > 0
                and rvd.recordingvoucherdetailsc_GLtype = ?`;

        // const result = await common.queryWithCount(sequelize, req, queryStr, [user.domain_id, body.glType]);
        const result = await common.simpleSelect(sequelize, queryStr, [user.domain_id, body.glType]);

        const detailList = [];
        result.forEach(item => {
            const {
                recordingvoucherdetailsc_activeAccount,
                recordingvoucherdetailsc_type,
                recordingvoucherdetailsc_debite,
                recordingvoucherdetailsc_credit
            } = item;

            const dataIndex = detailList.findIndex(data => {
                return data.title === recordingvoucherdetailsc_activeAccount;
            });

            if (dataIndex < 0) {
                const newData = {
                    title: recordingvoucherdetailsc_activeAccount,
                    type: recordingvoucherdetailsc_type
                };

                if (parseInt(recordingvoucherdetailsc_type) > 0) {
                    newData.price = parseInt(recordingvoucherdetailsc_debite);
                } else {
                    newData.price = 0 - parseInt(recordingvoucherdetailsc_credit);
                }

                detailList.push(newData);
            } else {
                const findData = detailList[dataIndex];
                findData.type = recordingvoucherdetailsc_type;
                if (parseInt(recordingvoucherdetailsc_type) > 0) {
                    findData.price += parseInt(recordingvoucherdetailsc_debite);
                } else {
                    findData.price -= parseInt(recordingvoucherdetailsc_credit);
                }
            }
        });

        returnData.total = countResult.count;
        returnData.rows = detailList;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
async function getSubsidiaryLedgersDetail(req, res) {
    const body = req.body;
    const user = req.user;
    const returnData = {};

    try {
        let queryStr =
            `select
                rvd.recordingvoucherdetailsc_id, rvd.recordingvouchersc_id, rvd.recordingvoucherdetailsc_digest, rvd.recordingvoucherdetailsc_accsum
                , rvd.recordingvoucherdetailsc_activeAccount, rvd.recordingvoucherdetailsc_debite, rvd.recordingvoucherdetailsc_credit
                , rvd.recordingvoucherdetailsc_type, date(rvd.created_at) as datetime
                , rvs.recordingvouchersc_code, rvs.recordingvouchersc_depart_id, rvs.recordingvouchersc_time, rvs.recordingvouchersc_count
                , rvs.recordingvouchersc_type, rvs.s_recordingvouchersc_type
                , dpt.department_name
                from tbl_erc_recordingvoucherdetailsc rvd
                left join tbl_erc_recordingvouchersc rvs
                on rvd.recordingvouchersc_id = rvs.recordingvouchersc_id
                left join tbl_erc_department dpt
                on rvd.recordingvoucherdetailsc_depart_id = dpt.department_id
                where true
                and rvs.domain_id = ?`;

        const replacements = [user.domain_id];

        if (body.activeAccount) {
            queryStr += ` and rvd.recordingvoucherdetailsc_activeAccount = ?`;
            replacements.push(body.activeAccount);
        }
        if (body.rvdType) {
            queryStr += ` and rvd.recordingvoucherdetailsc_type = ?`;
            replacements.push(body.rvdType);
        }

        if (body.search_text) {
            queryStr += ` and rvs.recordingvouchersc_code = ?`;
            replacements.push(body.search_text);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        let itemTotalPrice = 0;
        returnData.rows = result.data.map(item => {
            if (parseInt(item.recordingvoucherdetailsc_type) > 0) {
                itemTotalPrice += parseInt(item.recordingvoucherdetailsc_debite);
            } else {
                itemTotalPrice -= parseInt(item.recordingvoucherdetailsc_credit);
            }

            item.total_price = itemTotalPrice;
            return item;
        });
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
async function getSubsidiaryLedgersExpense(req, res) {
    const body = req.body;
    const user = req.user;
    const returnData = {};

    try {
        returnData.total = 0;
        returnData.rows = [];
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getGeneralLedgerList(req, res) {
    const body = req.body;
    const user = req.user;
    const returnData = {};

    try {
        if (!body.glType && body.glType !== 0) {
            return common.sendError(res, '缺少参数');
        }

        const countStr =
            `select
                count(*) as count from (
                select
                rvd.recordingvoucherdetailsc_activeAccount
                from tbl_erc_recordingvoucherdetailsc rvd
                where true
                and rvd.domain_id = ?
                and !isnull(rvd.recordingvoucherdetailsc_activeAccount)
                and length(trim(rvd.recordingvoucherdetailsc_activeAccount)) > 0
                and rvd.recordingvoucherdetailsc_GLtype = ?
                group by rvd.recordingvoucherdetailsc_activeAccount) rlt`;

        const countResult = await common.querySimple(sequelize, req, countStr, [user.domain_id, body.glType]);
        const [countData] = countResult.data;

        let queryStr =
            `select
                rvd.recordingvoucherdetailsc_id, rvd.recordingvouchersc_id, rvd.recordingvoucherdetailsc_digest, rvd.recordingvoucherdetailsc_accsum
                , rvd.recordingvoucherdetailsc_activeAccount, rvd.recordingvoucherdetailsc_debite, rvd.recordingvoucherdetailsc_credit
                , rvd.recordingvoucherdetailsc_type, rvd.created_at
                from tbl_erc_recordingvoucherdetailsc rvd
                where true
                and rvd.domain_id = ?
                and !isnull(rvd.recordingvoucherdetailsc_accsum)
                and length(trim(rvd.recordingvoucherdetailsc_accsum)) > 0
                and rvd.recordingvoucherdetailsc_GLtype = ?`;

        const result = await common.queryWithCount(sequelize, req, queryStr, [user.domain_id, body.glType]);

        const detailList = [];
        result.data.forEach(item => {
            const {
                recordingvoucherdetailsc_accsum,
                recordingvoucherdetailsc_type,
                recordingvoucherdetailsc_debite,
                recordingvoucherdetailsc_credit
            } = item;

            const dataIndex = detailList.findIndex(data => {
                return data.title === recordingvoucherdetailsc_accsum;
            });

            if (dataIndex < 0) {
                const newData = {
                    title: recordingvoucherdetailsc_accsum,
                    type: recordingvoucherdetailsc_type
                };

                if (recordingvoucherdetailsc_type > 0) {
                    newData.price = Number(recordingvoucherdetailsc_debite);
                } else {
                    newData.price = 0 - recordingvoucherdetailsc_credit;
                }

                detailList.push(newData);
            } else {
                const findData = detailList[dataIndex];
                findData.type = recordingvoucherdetailsc_type;
                if (recordingvoucherdetailsc_type > 0) {
                    findData.price += Number(recordingvoucherdetailsc_debite);
                } else {
                    findData.price -= Number(recordingvoucherdetailsc_credit);
                }
            }
        });

        returnData.total = countData.count;
        returnData.rows = detailList;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
async function getGeneralLedgeDetail(req, res) {
    const body = req.body;
    const user = req.user;
    const returnData = {};

    try {
        let queryStr =
            `select
                rvd.recordingvoucherdetailsc_id, rvd.recordingvouchersc_id, rvd.recordingvoucherdetailsc_digest, rvd.recordingvoucherdetailsc_accsum
                , rvd.recordingvoucherdetailsc_activeAccount, rvd.recordingvoucherdetailsc_debite, rvd.recordingvoucherdetailsc_credit
                , rvd.recordingvoucherdetailsc_type, date(rvd.created_at) as datetime
                , rvs.recordingvouchersc_code, rvs.recordingvouchersc_depart_id, rvs.recordingvouchersc_time, rvs.recordingvouchersc_count
                , rvs.recordingvouchersc_type, rvs.s_recordingvouchersc_type
                from tbl_erc_recordingvoucherdetailsc rvd
                left join tbl_erc_recordingvouchersc rvs
                on rvd.recordingvouchersc_id = rvs.recordingvouchersc_id
                where true
                and rvs.domain_id = ?`;

        const replacements = [user.domain_id];

        if (body.accsum) {
            queryStr += ` and rvd.recordingvoucherdetailsc_accsum = ?`;
            replacements.push(body.accsum);
        }
        if (body.rvdType) {
            queryStr += ` and rvd.recordingvoucherdetailsc_type = ?`;
            replacements.push(body.rvdType);
        }

        if (body.search_text) {
            queryStr += ` and rvs.recordingvouchersc_code = ?`;
            replacements.push(body.search_text);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        let itemTotalPrice = 0;
        returnData.rows = result.data.map(item => {
            if (item.recordingvoucherdetailsc_type > 0) {
                itemTotalPrice += Number(item.recordingvoucherdetailsc_debite);
            } else {
                itemTotalPrice -= Number(item.recordingvoucherdetailsc_credit);
            }

            item.total_price = itemTotalPrice;
            return item;
        });
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}