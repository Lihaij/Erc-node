/**
 * Created by Cici on 2018/4/26.
 */
/**
 * 总分类账
 */
const fs = require('fs');
const moment = require('moment');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCTransReceptionSRV');
const model = require('../../../model');
// const AccountConst = require('../../../util/AccountConst');

// tables
const sequelize = model.sequelize;
const tb_specialexpensesum = model.erc_specialexpensesum;
const tb_cashiergatheringsum = model.erc_cashiergatheringsum;
const tb_department = model.erc_department;
const tb_recordingvouchersc = model.erc_recordingvouchersc;
const tb_recordingvoucherdetailsc = model.erc_recordingvoucherdetailsc;
const tb_domain = model.common_domain;

exports.ERCGeneralLedgerControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'getGeneralLedgerList') {
        getGeneralLedgerList(req, res)
    } else if (method === 'getGeneralLedgeDetail') {
        getGeneralLedgeDetail(req, res)
    } else if (method === 'getGeneralLedgeInit') {
        getGeneralLedgeInit(req, res)
    } else if (method === 'autoCarryOver') {
        autoCarryOver(req, res)
    } else {
        common.sendError(res, 'common_01')
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
                rvd.recordingvoucherdetailsc_accsum
                from tbl_erc_recordingvoucherdetailsc rvd
                where true
                and rvd.domain_id = ?
                and rvd.recordingvoucherdetailsc_GLtype = ?
                group by rvd.recordingvoucherdetailsc_accsum) rlt`;

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
                and rvd.recordingvoucherdetailsc_GLtype = ? `;
        const result = await sequelize.query(queryStr, {
            replacements: [user.domain_id, body.glType],
            type: sequelize.QueryTypes.SELECT
        });

        const detailList = [];
        result.forEach(item => {
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
                    debite: recordingvoucherdetailsc_debite,
                    credit: recordingvoucherdetailsc_credit
                };

                if (recordingvoucherdetailsc_type > 0) {
                    newData.price = Number(recordingvoucherdetailsc_debite);
                } else {
                    newData.price = 0 - recordingvoucherdetailsc_credit;
                }

                detailList.push(newData);
            } else {
                const findData = detailList[dataIndex];
                findData.debite += Number(findData.debite) + Number(recordingvoucherdetailsc_debite)
                findData.credit += Number(findData.credit) + Number(recordingvoucherdetailsc_credit)

                if (recordingvoucherdetailsc_type > 0) {
                    findData.price += Number(recordingvoucherdetailsc_debite);
                } else {
                    findData.price -= Number(recordingvoucherdetailsc_credit);
                }
            }
        });

        for (let d of detailList) {
            if (d.debite > d.credit) {
                d.type = 1
            } else if (d.debite < d.credit) {
                d.type = 0
            } else {
                d.type = 2
            }
        }
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
            `SELECT
                rvd.recordingvoucherdetailsc_digest ,
                sum(rvd.recordingvoucherdetailsc_debite) as sumrDebite,
                sum(rvd.recordingvoucherdetailsc_credit) as sumCredit,
                date(rvd.created_at) AS datetime ,
                rvs.recordingvouchersc_code ,
                rvd.recordingvoucherdetailsc_type
            FROM
                tbl_erc_recordingvoucherdetailsc rvd
            LEFT JOIN tbl_erc_recordingvouchersc rvs ON rvd.recordingvouchersc_id = rvs.recordingvouchersc_id
            WHERE
                TRUE
            AND rvs.domain_id = ? 
            `
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
        queryStr += ` group by rvd.recordingvoucherdetailsc_digest ,date(rvd.created_at),rvs.recordingvouchersc_code ,rvd.recordingvoucherdetailsc_type`
        const result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        let itemTotalPrice = 0;

        let totalDebite = 0,
            totalCredit = 0;
        returnData.rows = result.data.map(item => {
            totalDebite += item.sumrDebite;
            totalCredit += item.sumCredit;
            if (totalDebite > totalCredit) {
                item.recordingvoucherdetailsc_type = 1
            } else if (totalDebite < totalCredit) {
                item.recordingvoucherdetailsc_type = 0
            } else {
                item.recordingvoucherdetailsc_type = 2
            }
            if (item.recordingvoucherdetailsc_type > 0) {
                itemTotalPrice += Number(item.sumrDebite);
            } else {
                itemTotalPrice -= Number(item.sumCredit);
            }

            item.total_price = itemTotalPrice;


            return item;
        });
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
async function getGeneralLedgeInit(req, res) {
    try {
        const returnData = {};
        returnData.CAPITALCOSTTYLE = GLBConfig.CAPITALCOSTTYLE;
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function autoCarryOver(req, res) {
    try {
        let index = '',
            params = {},
            detailList = [],
            addRestle = {},
            list = {};

        let domain = await tb_domain.findAll({
            where: {
                state: GLBConfig.ENABLE
            }
        });
        for (let d of domain) {
            //*************汇总记账凭证*************
            let result = await tb_recordingvoucherdetailsc.findAll({
                where: {
                    domain_id: d.domain_id,
                    recordingvoucherdetailsc_carryover_state: 0
                }
            })

            detailList = [];
            result.forEach(item => {
                const {
                    recordingvoucherdetailsc_accsum_code,
                    recordingvoucherdetailsc_accsum,
                    recordingvoucherdetailsc_type,
                    recordingvoucherdetailsc_debite,
                    recordingvoucherdetailsc_credit
                } = item;

                const dataIndex = detailList.findIndex(data => {
                    return data.code === recordingvoucherdetailsc_accsum_code;
                });

                if (dataIndex < 0) {
                    const newData = {
                        code: recordingvoucherdetailsc_accsum_code,
                        title: recordingvoucherdetailsc_accsum,
                        debite: recordingvoucherdetailsc_debite,
                        credit: recordingvoucherdetailsc_credit
                    };

                    if (recordingvoucherdetailsc_type > 0) {
                        newData.price = Number(recordingvoucherdetailsc_debite);
                    } else {
                        newData.price = 0 - recordingvoucherdetailsc_credit;
                    }

                    detailList.push(newData);
                } else {
                    const findData = detailList[dataIndex];
                    findData.debite += Number(findData.debite) + Number(recordingvoucherdetailsc_debite)
                    findData.credit += Number(findData.credit) + Number(recordingvoucherdetailsc_credit)

                    if (recordingvoucherdetailsc_type > 0) {
                        findData.price += Number(recordingvoucherdetailsc_debite);
                    } else {
                        findData.price -= Number(recordingvoucherdetailsc_credit);
                    }
                }
            });

            logger.info(detailList)
            if (detailList.length > 0) {
                //*************生成记账凭证*************
                let genRecordingVoucherSGID = await Sequence.genRecordingVoucherSGID();
                let addRecordingvouchersc = await tb_recordingvouchersc.create({
                    recordingvouchersc_code: genRecordingVoucherSGID,
                    domain_id: d.domain_id,
                    recordingvouchersc_time: moment().format("YYYY-MM-DD"),
                    recordingvouchersc_count: 0,
                    recordingvouchersc_type: 99, //0资金支出，1客户收款    99手工记账凭证
                    recordingvouchersc_state: 2
                })

                for (let i = 0; i < 10; i++) {
                    switch (i) {
                        case 0:
                            // 1	6001	主营业务收入	收入类	借：主营业务收入（6001）	贷：利润分配（4104）
                            list = detailList.find(function (e) {
                                if (e.code == '6001') {
                                    return e
                                }
                            });
                            if (list) {
                                // 借
                                // index = AccountConst.codeArray.indexOf('6001')
                                let accountingSubject = await getAccountingSubject({ code: 6001 });
                                addRestle = await tb_recordingvoucherdetailsc.create({
                                    domain_id: d.domain_id,
                                    recordingvouchersc_id: addRecordingvouchersc.recordingvouchersc_id,
                                    recordingvoucherdetailsc_accsum: accountingSubject.accounting_subject_name, //   总账科目
                                    recordingvoucherdetailsc_accsum_code: "6001", //总账科目code
                                    recordingvoucherdetailsc_debite: list.price, //借方金额
                                    recordingvoucherdetailsc_type: '1', //0贷，1借
                                    recordingvoucherdetailsc_GLtype: accountingSubject.accounting_subject_type_code, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                                })
                                // 贷
                                // index = AccountConst.codeArray.indexOf('4104')
                                accountingSubject = await getAccountingSubject({ code: 4104 });
                                addRestle = await tb_recordingvoucherdetailsc.create({
                                    domain_id: d.domain_id,
                                    recordingvouchersc_id: addRecordingvouchersc.recordingvouchersc_id,
                                    recordingvoucherdetailsc_accsum: accountingSubject.accounting_subject_name, //   总账科目
                                    recordingvoucherdetailsc_accsum_code: "4104", //总账科目code
                                    recordingvoucherdetailsc_credit: list.money, //贷方金额
                                    recordingvoucherdetailsc_type: '0', //0贷，1借
                                    recordingvoucherdetailsc_GLtype: accountingSubject.accounting_subject_type_code, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                                })
                            }
                            break;
                        case 1:
                            // 2	6051	其他业务收入	收入类	借：其他业务收入（6051）	贷：利润分配（4104）
                            list = detailList.find(function (e) {
                                if (e.code == '6051') {
                                    return e
                                }
                            });
                            if (list) {
                                // 借
                                // index = AccountConst.codeArray.indexOf('6051')
                                let accountingSubject = await getAccountingSubject({ code: 6051 });
                                addRestle = await tb_recordingvoucherdetailsc.create({
                                    domain_id: d.domain_id,
                                    recordingvouchersc_id: addRecordingvouchersc.recordingvouchersc_id,
                                    recordingvoucherdetailsc_accsum: accountingSubject.accounting_subject_name, //   总账科目
                                    recordingvoucherdetailsc_accsum_code: "6051", //总账科目code
                                    recordingvoucherdetailsc_debite: list.price, //借方金额
                                    recordingvoucherdetailsc_type: '1', //0贷，1借
                                    recordingvoucherdetailsc_GLtype: accountingSubject.accounting_subject_type_code, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                                })
                                // 贷
                                // index = AccountConst.codeArray.indexOf('4104')
                                accountingSubject = await getAccountingSubject({ code: 4104 });
                                addRestle = await tb_recordingvoucherdetailsc.create({
                                    domain_id: d.domain_id,
                                    recordingvouchersc_id: addRecordingvouchersc.recordingvouchersc_id,
                                    recordingvoucherdetailsc_accsum: accountingSubject.accounting_subject_name, //   总账科目
                                    recordingvoucherdetailsc_accsum_code: "4104", //总账科目code
                                    recordingvoucherdetailsc_credit: list.money, //贷方金额
                                    recordingvoucherdetailsc_type: '0', //0贷，1借
                                    recordingvoucherdetailsc_GLtype: accountingSubject.accounting_subject_type_code, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                                })
                            }
                            break;
                        case 2:
                            // 3	6301	营业外收入	收入类	借：营业外收入（6301）	贷：利润分配（4104）
                            list = detailList.find(function (e) {
                                if (e.code == '6301') {
                                    return e
                                }
                            });
                            if (list) {
                                // 借
                                // index = AccountConst.codeArray.indexOf('6301')
                                let accountingSubject = await getAccountingSubject({ code: 6301 });
                                addRestle = await tb_recordingvoucherdetailsc.create({
                                    domain_id: d.domain_id,
                                    recordingvouchersc_id: addRecordingvouchersc.recordingvouchersc_id,
                                    recordingvoucherdetailsc_accsum: accountingSubject.accounting_subject_name, //   总账科目
                                    recordingvoucherdetailsc_accsum_code: "6301", //总账科目code
                                    recordingvoucherdetailsc_debite: list.price, //借方金额
                                    recordingvoucherdetailsc_type: '1', //0贷，1借
                                    recordingvoucherdetailsc_GLtype: accountingSubject.accounting_subject_type_code, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                                })
                                // 贷
                                // index = AccountConst.codeArray.indexOf('4104')
                                accountingSubject = await getAccountingSubject({ code: 4104 });
                                addRestle = await tb_recordingvoucherdetailsc.create({
                                    domain_id: d.domain_id,
                                    recordingvouchersc_id: addRecordingvouchersc.recordingvouchersc_id,
                                    recordingvoucherdetailsc_accsum: accountingSubject.accounting_subject_name, //   总账科目
                                    recordingvoucherdetailsc_accsum_code: "4104", //总账科目code
                                    recordingvoucherdetailsc_credit: list.money, //贷方金额
                                    recordingvoucherdetailsc_type: '0', //0贷，1借
                                    recordingvoucherdetailsc_GLtype: accountingSubject.accounting_subject_type_code, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                                })
                            }
                            break;
                        case 3:
                            // 4	6401	主营业务成本	成本费用类	借：利润分配（4104）	贷：主营业务成本（6401）
                            list = detailList.find(function (e) {
                                if (e.code == '6401') {
                                    return e
                                }
                            });
                            if (list) {
                                // 借
                                // index = AccountConst.codeArray.indexOf('4104')
                                let accountingSubject = await getAccountingSubject({ code: 4104 });
                                addRestle = await tb_recordingvoucherdetailsc.create({
                                    domain_id: d.domain_id,
                                    recordingvouchersc_id: addRecordingvouchersc.recordingvouchersc_id,
                                    recordingvoucherdetailsc_accsum: accountingSubject.accounting_subject_name, //   总账科目
                                    recordingvoucherdetailsc_accsum_code: "4104", //总账科目code
                                    recordingvoucherdetailsc_debite: list.price, //借方金额
                                    recordingvoucherdetailsc_type: '1', //0贷，1借
                                    recordingvoucherdetailsc_GLtype: accountingSubject.accounting_subject_type_code, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                                })
                                // 贷
                                // index = AccountConst.codeArray.indexOf('6401')
                                accountingSubject = await getAccountingSubject({ code: 6401 });
                                addRestle = await tb_recordingvoucherdetailsc.create({
                                    domain_id: d.domain_id,
                                    recordingvouchersc_id: addRecordingvouchersc.recordingvouchersc_id,
                                    recordingvoucherdetailsc_accsum: accountingSubject.accounting_subject_name, //   总账科目
                                    recordingvoucherdetailsc_accsum_code: "6401", //总账科目code
                                    recordingvoucherdetailsc_credit: list.money, //贷方金额
                                    recordingvoucherdetailsc_type: '0', //0贷，1借
                                    recordingvoucherdetailsc_GLtype: accountingSubject.accounting_subject_type_code, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                                })
                            }
                            break;
                        case 4:
                            // 5	6402	其它业务成本	成本费用类	借：利润分配（4104）	贷：其他业务成本（6402）


                            list = detailList.find(function (e) {
                                if (e.code == '6402') {
                                    return e
                                }
                            });
                            if (list) {
                                // 借
                                // index = AccountConst.codeArray.indexOf('4104')
                                let accountingSubject = await getAccountingSubject({ code: 4104 });
                                addRestle = await tb_recordingvoucherdetailsc.create({
                                    domain_id: d.domain_id,
                                    recordingvouchersc_id: addRecordingvouchersc.recordingvouchersc_id,
                                    recordingvoucherdetailsc_accsum: accountingSubject.accounting_subject_name, //   总账科目
                                    recordingvoucherdetailsc_accsum_code: "4104", //总账科目code
                                    recordingvoucherdetailsc_debite: list.price, //借方金额
                                    recordingvoucherdetailsc_type: '1', //0贷，1借
                                    recordingvoucherdetailsc_GLtype: accountingSubject.accounting_subject_type_code, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                                })
                                // 贷
                                // index = AccountConst.codeArray.indexOf('6402')
                                accountingSubject = await getAccountingSubject({ code: 6402 });
                                addRestle = await tb_recordingvoucherdetailsc.create({
                                    domain_id: d.domain_id,
                                    recordingvouchersc_id: addRecordingvouchersc.recordingvouchersc_id,
                                    recordingvoucherdetailsc_accsum: accountingSubject.accounting_subject_name, //   总账科目
                                    recordingvoucherdetailsc_accsum_code: "6402", //总账科目code
                                    recordingvoucherdetailsc_credit: list.money, //贷方金额
                                    recordingvoucherdetailsc_type: '0', //0贷，1借
                                    recordingvoucherdetailsc_GLtype: accountingSubject.accounting_subject_type_code, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                                })
                            }
                            break;
                        case 5:
                            // 6	6405	营业税金及附加	成本费用类	借：利润分配（4104）	贷：营业税金及附加（6405）
                            list = detailList.find(function (e) {
                                if (e.code == '6405') {
                                    return e
                                }
                            });
                            if (list) {
                                // 借
                                // index = AccountConst.codeArray.indexOf('4104')
                                let accountingSubject = await getAccountingSubject({ code: 4104 });
                                addRestle = await tb_recordingvoucherdetailsc.create({
                                    domain_id: d.domain_id,
                                    recordingvouchersc_id: addRecordingvouchersc.recordingvouchersc_id,
                                    recordingvoucherdetailsc_accsum: accountingSubject.accounting_subject_name, //   总账科目
                                    recordingvoucherdetailsc_accsum_code: "4104", //总账科目code
                                    recordingvoucherdetailsc_debite: list.price, //借方金额
                                    recordingvoucherdetailsc_type: '1', //0贷，1借
                                    recordingvoucherdetailsc_GLtype: accountingSubject.accounting_subject_type_code, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                                })
                                // 贷
                                // index = AccountConst.codeArray.indexOf('6405')
                                accountingSubject = await getAccountingSubject({ code: 6405 });
                                addRestle = await tb_recordingvoucherdetailsc.create({
                                    domain_id: d.domain_id,
                                    recordingvouchersc_id: addRecordingvouchersc.recordingvouchersc_id,
                                    recordingvoucherdetailsc_accsum: accountingSubject.accounting_subject_name, //   总账科目
                                    recordingvoucherdetailsc_accsum_code: "6405", //总账科目code
                                    recordingvoucherdetailsc_credit: list.money, //贷方金额
                                    recordingvoucherdetailsc_type: '0', //0贷，1借
                                    recordingvoucherdetailsc_GLtype: accountingSubject.accounting_subject_type_code, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                                })
                            }
                            break;
                        case 6:
                            // 7	6601	销售费用	成本费用类	借：利润分配（4104）	贷：销售费用（6601）
                            list = detailList.find(function (e) {
                                if (e.code == '6601') {
                                    return e
                                }
                            });
                            if (list) {
                                // 借
                                // index = AccountConst.codeArray.indexOf('4104')
                                let accountingSubject = await getAccountingSubject({ code: 4104 });
                                addRestle = await tb_recordingvoucherdetailsc.create({
                                    domain_id: d.domain_id,
                                    recordingvouchersc_id: addRecordingvouchersc.recordingvouchersc_id,
                                    recordingvoucherdetailsc_accsum: accountingSubject.accounting_subject_name, //   总账科目
                                    recordingvoucherdetailsc_accsum_code: "4104", //总账科目code
                                    recordingvoucherdetailsc_debite: list.price, //借方金额
                                    recordingvoucherdetailsc_type: '1', //0贷，1借
                                    recordingvoucherdetailsc_GLtype: accountingSubject.accounting_subject_type_code, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                                })
                                // 贷
                                // index = AccountConst.codeArray.indexOf('6601')
                                accountingSubject = await getAccountingSubject({ code: 6601 });
                                addRestle = await tb_recordingvoucherdetailsc.create({
                                    domain_id: d.domain_id,
                                    recordingvouchersc_id: addRecordingvouchersc.recordingvouchersc_id,
                                    recordingvoucherdetailsc_accsum: accountingSubject.accounting_subject_name, //   总账科目
                                    recordingvoucherdetailsc_accsum_code: "6601", //总账科目code
                                    recordingvoucherdetailsc_credit: list.money, //贷方金额
                                    recordingvoucherdetailsc_type: '0', //0贷，1借
                                    recordingvoucherdetailsc_GLtype: accountingSubject.accounting_subject_type_code, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                                })
                            }
                            break;
                        case 7:
                            // 8	6602	管理费用	成本费用类	借：利润分配（4104）	贷：财务费用（6602）
                            list = detailList.find(function (e) {
                                if (e.code == '6602') {
                                    return e
                                }
                            });
                            if (list) {
                                // 借
                                // index = AccountConst.codeArray.indexOf('4104')
                                let accountingSubject = await getAccountingSubject({ code: 4104 });
                                addRestle = await tb_recordingvoucherdetailsc.create({
                                    domain_id: d.domain_id,
                                    recordingvouchersc_id: addRecordingvouchersc.recordingvouchersc_id,
                                    recordingvoucherdetailsc_accsum: accountingSubject.accounting_subject_name, //   总账科目
                                    recordingvoucherdetailsc_accsum_code: "4104", //总账科目code
                                    recordingvoucherdetailsc_debite: list.price, //借方金额
                                    recordingvoucherdetailsc_type: '1', //0贷，1借
                                    recordingvoucherdetailsc_GLtype: accountingSubject.accounting_subject_type_code, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                                })
                                // 贷
                                // index = AccountConst.codeArray.indexOf('6602')
                                accountingSubject = await getAccountingSubject({ code: 6602 });
                                addRestle = await tb_recordingvoucherdetailsc.create({
                                    domain_id: d.domain_id,
                                    recordingvouchersc_id: addRecordingvouchersc.recordingvouchersc_id,
                                    recordingvoucherdetailsc_accsum: accountingSubject.accounting_subject_name, //   总账科目
                                    recordingvoucherdetailsc_accsum_code: "6602", //总账科目code
                                    recordingvoucherdetailsc_credit: list.money, //贷方金额
                                    recordingvoucherdetailsc_type: '0', //0贷，1借
                                    recordingvoucherdetailsc_GLtype: accountingSubject.accounting_subject_type_code, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                                })
                            }
                            break;
                        case 8:
                            // 9	6603	财务费用	成本费用类	借：利润分配（4104）	贷：财务费用（6603）
                            list = detailList.find(function (e) {
                                if (e.code == '6603') {
                                    return e
                                }
                            });
                            if (list) {
                                // 借
                                // index = AccountConst.codeArray.indexOf('4104')
                                let accountingSubject = await getAccountingSubject({ code: 4104 });
                                addRestle = await tb_recordingvoucherdetailsc.create({
                                    domain_id: d.domain_id,
                                    recordingvouchersc_id: addRecordingvouchersc.recordingvouchersc_id,
                                    recordingvoucherdetailsc_accsum: accountingSubject.accounting_subject_name, //   总账科目
                                    recordingvoucherdetailsc_accsum_code: "4104", //总账科目code
                                    recordingvoucherdetailsc_debite: list.price, //借方金额
                                    recordingvoucherdetailsc_type: '1', //0贷，1借
                                    recordingvoucherdetailsc_GLtype: accountingSubject.accounting_subject_type_code, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                                })
                                // 贷
                                // index = AccountConst.codeArray.indexOf('6603')
                                accountingSubject = await getAccountingSubject({ code: 6603 });
                                addRestle = await tb_recordingvoucherdetailsc.create({
                                    domain_id: d.domain_id,
                                    recordingvouchersc_id: addRecordingvouchersc.recordingvouchersc_id,
                                    recordingvoucherdetailsc_accsum: accountingSubject.accounting_subject_name, //   总账科目
                                    recordingvoucherdetailsc_accsum_code: "6603", //总账科目code
                                    recordingvoucherdetailsc_credit: list.money, //贷方金额
                                    recordingvoucherdetailsc_type: '0', //0贷，1借
                                    recordingvoucherdetailsc_GLtype: accountingSubject.accounting_subject_type_code, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                                })
                            }
                            break;
                        case 9:
                            // 10	6711	营业外支出	成本费用类	借：利润分配（4104）	贷：营业外支出（6711）
                            list = detailList.find(function (e) {
                                if (e.code == '6711') {
                                    return e
                                }
                            });
                            if (list) {
                                // 借
                                // index = AccountConst.codeArray.indexOf('4104')
                                let accountingSubject = await getAccountingSubject({ code: 4104 });
                                addRestle = await tb_recordingvoucherdetailsc.create({
                                    domain_id: d.domain_id,
                                    recordingvouchersc_id: addRecordingvouchersc.recordingvouchersc_id,
                                    recordingvoucherdetailsc_accsum: accountingSubject.accounting_subject_name, //   总账科目
                                    recordingvoucherdetailsc_accsum_code: "4104", //总账科目code
                                    recordingvoucherdetailsc_debite: list.price, //借方金额
                                    recordingvoucherdetailsc_type: '1', //0贷，1借
                                    recordingvoucherdetailsc_GLtype: accountingSubject.accounting_subject_type_code, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                                })
                                // 贷
                                // index = AccountConst.codeArray.indexOf('6711')
                                accountingSubject = await getAccountingSubject({ code: 6711 });
                                addRestle = await tb_recordingvoucherdetailsc.create({
                                    domain_id: d.domain_id,
                                    recordingvouchersc_id: addRecordingvouchersc.recordingvouchersc_id,
                                    recordingvoucherdetailsc_accsum: accountingSubject.accounting_subject_name, //   总账科目
                                    recordingvoucherdetailsc_accsum_code: "6711", //总账科目code
                                    recordingvoucherdetailsc_credit: list.money, //贷方金额
                                    recordingvoucherdetailsc_type: '0', //0贷，1借
                                    recordingvoucherdetailsc_GLtype: accountingSubject.accounting_subject_type_code, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                                })
                            }
                            break;
                        case 10:
                            // 11 6801 所得税 成本费用类 借： 利润分配（4104） 贷： 所得税 （6801）
                            list = detailList.find(function (e) {
                                if (e.code == '6801') {
                                    return e
                                }
                            });
                            if (list) {
                                // 借
                                // index = AccountConst.codeArray.indexOf('4104')
                                let accountingSubject = await getAccountingSubject({ code: 4104 });
                                addRestle = await tb_recordingvoucherdetailsc.create({
                                    domain_id: d.domain_id,
                                    recordingvouchersc_id: addRecordingvouchersc.recordingvouchersc_id,
                                    recordingvoucherdetailsc_accsum: accountingSubject.accounting_subject_name, //   总账科目
                                    recordingvoucherdetailsc_accsum_code: "4104", //总账科目code
                                    recordingvoucherdetailsc_debite: list.price, //借方金额
                                    recordingvoucherdetailsc_type: '1', //0贷，1借
                                    recordingvoucherdetailsc_GLtype: accountingSubject.accounting_subject_type_code, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                                })
                                // 贷
                                // index = AccountConst.codeArray.indexOf('6801')
                                accountingSubject = await getAccountingSubject({ code: 6801 });
                                addRestle = await tb_recordingvoucherdetailsc.create({
                                    domain_id: d.domain_id,
                                    recordingvouchersc_id: addRecordingvouchersc.recordingvouchersc_id,
                                    recordingvoucherdetailsc_accsum: accountingSubject.accounting_subject_name, //   总账科目
                                    recordingvoucherdetailsc_accsum_code: "6801", //总账科目code
                                    recordingvoucherdetailsc_credit: list.money, //贷方金额
                                    recordingvoucherdetailsc_type: '0', //0贷，1借
                                    recordingvoucherdetailsc_GLtype: accountingSubject.accounting_subject_type_code, // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                                })
                            }
                            break;
                        default:
                            // 默认代码块
                    }
                }
            }
            await tb_recordingvoucherdetailsc.update({
                recordingvoucherdetailsc_carryover_state: 1,
            }, {
                where: {
                    domain_id: d.domain_id,
                    recordingvoucherdetailsc_carryover_state: 0
                }
            });
        }
        common.sendData(res, {})
    } catch (error) {
        common.sendFault(res, error);
    }
}
