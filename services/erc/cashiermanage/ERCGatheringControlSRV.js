const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCAmortizeDetailControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');

const moment = require('moment');
const sequelize = model.sequelize;

const task = require('../baseconfig/ERCTaskListControlSRV');
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;
const tb_cashiergathering = model.erc_cashiergathering;
const tb_user = model.common_user;
const tb_corporateclients = model.erc_corporateclients;
const tb_creditlinedetail = model.erc_creditlinedetail
const tb_domain = model.common_domain;
const sms = require('../../../util/SMSUtil.js');
exports.ERCGatheringControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};

async function initAct(req, res) {
    try {
        let returnData = {};
        returnData.gathering_type = GLBConfig.GATHERINGTYPE;
        returnData.cashiergathering_state = GLBConfig.CASHIERGATHERINGSTATE;
        returnData.PAYMENTMETHOD = GLBConfig.PAYMENTMETHOD;
        returnData.MONETARYFUNDTYPE = await getMonetaryFundType(req, res)
        returnData.corporateclients = [];
        returnData.storeList = [];
        returnData.bankNo = await getBankNo(req.user);
        returnData.orderId = await getOrderId(req.user);
        let corporateclients = await tb_corporateclients.findAll({
            where: {
                state: GLBConfig.ENABLE,
                domain_id: req.user.domain_id
            }
        });
        for (let c of corporateclients) {
            returnData.corporateclients.push({
                id: c.corporateclients_id,
                value: c.corporateclients_id,
                text: c.corporateclients_name
            })
        }
        let domains = await tb_domain.findAll({
            where: {
                state: GLBConfig.ENABLE
            }
        });
        for (let d of domains) {
            returnData.storeList.push({
                id: d.domain_id,
                value: d.domain_id,
                text: d.domain_name
            });
        }


        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getBankNo(user) {
    try {
        let replacements = [],
            returnData = []
        let queryStr = "select b.* from tbl_erc_companybankno b,tbl_erc_company c " +
            "where b.state=1 and c.state=1 and b.company_id=c.company_id " +
            "and c.domain_id=?";
        replacements.push(user.domain_id);
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        for (let i of result) {
            returnData.push({
                id: i.companybankno_id,
                value: i.companybankno_id,
                text: i.companybankno_bank_no
            })
        }
        return returnData
    } catch (error) {
        throw error
    }
}
async function getOrderId(user) {
    try {
        let replacements = [],
            returnData = []
        let queryStr = `select order_id from tbl_erc_order where state=1 and domain_id=?`;
        replacements.push(user.domain_id);
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        for (let i of result) {
            returnData.push({
                id: i.order_id,
                value: i.order_id,
                text: i.order_id
            })
        }
        return returnData
    } catch (error) {
        throw error
    }
}
let getMonetaryFundType = async (req, res) => {
    try {
        let returnData = [];

        let queryStr = "select d.* from tbl_erc_basetypedetail d,tbl_erc_basetype t" +
            " where d.basetype_id=t.basetype_id and t.basetype_code='HBZJLX'";
        let result = await sequelize.query(queryStr, {
            replacements: [],
            type: sequelize.QueryTypes.SELECT
        });
        for (let i of result) {
            returnData.push({
                id: i.basetypedetail_id,
                value: i.typedetail_name,
                text: i.typedetail_name
            })
        }

        return returnData
    } catch (error) {
        throw error

    }
}
//获取构建预算列表
async function searchAct(req, res) {
    let doc = common.docTrim(req.body),
        user = req.user,
        returnData = {},
        replacements = [];
    let queryStr = `select c.*,u1.name as cashier_name,u2.name as declarant_name,d.corporateclients_name   
            from tbl_erc_cashiergathering c 
            left join tbl_common_user u1 on (c.cashiergathering_cashier = u1.user_id and u1.state=1) 
            left join tbl_common_user u2 on (c.cashiergathering_declarant = u2.user_id and u2.state=1) 
            left join tbl_erc_corporateclients d on (c.cashiergathering_customer_code = d.corporateclients_id and d.state=1)
            where c.state=1 and c.domain_id=?`;
    replacements.push(user.domain_id);
    if (doc.search_text) {
        queryStr += ` and (c.cashiergathering_name like ? or c.cashiergathering_source_name like ?) `;
        let search_text = `%${doc.search_text}%`;
        replacements.push(search_text);
        replacements.push(search_text);
    }
    if (doc.cashiergathering_id) {
        queryStr += ` and c.cashiergathering_id = ? `;
        replacements.push(doc.cashiergathering_id);
    }
    if (doc.cashiergathering_code) {
        queryStr += ` and c.cashiergathering_code like ?  `;
        replacements.push(`%${doc.cashiergathering_code}%`);
    }
    if (doc.cashiergathering_type) {
        queryStr += ` and c.cashiergathering_type = ? `;
        replacements.push(doc.cashiergathering_type);
    }
    if (doc.cashier_btime) {
        queryStr += ` and c.cashiergathering_cashier_time >= ? `;
        replacements.push(doc.cashier_btime);
    }
    if (doc.cashier_etime) {
        queryStr += ` and c.cashiergathering_cashier_time <= ? `;
        replacements.push(doc.cashier_etime);
    }

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    returnData.total = result.count;
    returnData.rows = [];
    for (let ap of result.data) {
        let d = JSON.parse(JSON.stringify(ap));
        d.created_at = ap.created_at ? moment(ap.created_at).format("YYYY-MM-DD") : null;
        d.updated_at = ap.updated_at ? moment(ap.updated_at).format("YYYY-MM-DD") : null;
        d.cashiergathering_cashier_time = ap.cashiergathering_cashier_time ? moment(ap.cashiergathering_cashier_time).format("YYYY-MM-DD") : null;
        returnData.rows.push(d)
    }
    common.sendData(res, returnData);
}

//新增收款申报记录
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let queryStr, result, cashiergathering_order_balance = 0

        //校验是否分配任务处理人员
        let taskallot = await tb_taskallot.findOne({
            where: {
                state: GLBConfig.ENABLE,
                taskallot_name: '出纳管理新增收款申报任务'
            }
        });
        let taskallotuser = await tb_taskallotuser.findOne({
            where: {
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id,
                taskallot_id: taskallot.taskallot_id
            }
        });

        if (!taskallotuser) {
            return common.sendError(res, 'cashier_01');
        } else {

            if (doc.cashiergathering_order_id) { //记录收款时order的实时欠款
                let replacements = [doc.cashiergathering_order_id]
                queryStr = `select sum(materiel_amount*sale_price) as businessMoney
                    from tbl_erc_ordermateriel 
                    where state=1 and order_id=?`
                result = await sequelize.query(queryStr, {
                    replacements: replacements,
                    type: sequelize.QueryTypes.SELECT
                })
                let businessMoney = result[0].businessMoney

                queryStr = `select sum(cashiergathering_gathering_money) as haveMoney
                    from tbl_erc_cashiergathering 
                    where state=1 and cashiergathering_order_id=?`
                result = await sequelize.query(queryStr, {
                    replacements: replacements,
                    type: sequelize.QueryTypes.SELECT
                })
                let haveMoney = result[0].haveMoney

                cashiergathering_order_balance = Number(doc.cashiergathering_gathering_money) + Number(haveMoney) - Number(businessMoney)

                console.log('cashiergathering_order_balance', cashiergathering_order_balance)
            }

            let cashiergathering = await tb_cashiergathering.create({
                domain_id: user.domain_id,
                cashiergathering_code: await Sequence.genCashierID(user),
                cashiergathering_name: doc.cashiergathering_name,
                cashiergathering_customer_code: doc.cashiergathering_customer_code,
                cashiergathering_source_name: doc.cashiergathering_source_name,
                cashiergathering_gathering_money: doc.cashiergathering_gathering_money,
                cashiergathering_order_balance: cashiergathering_order_balance,
                cashiergathering_phone: doc.cashiergathering_phone,
                cashiergathering_cashier: doc.cashiergathering_cashier,
                cashiergathering_cashier_time: doc.cashiergathering_cashier_time,
                cashiergathering_remark: doc.cashiergathering_remark,
                cashiergathering_declarant: user.user_id,
                cashiergathering_state: 1,
                payment_method: doc.payment_method,
                monetary_fund_type: doc.monetary_fund_type,
                bank_account: doc.bank_account,
                cashiergathering_order_id: doc.cashiergathering_order_id
            });

            let taskName = '销售管理新增客户收款申报任务';
            let taskDescription = cashiergathering.cashiergathering_name + '  销售管理新增客户收款申报任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user, taskName, 45, taskallotuser.user_id, cashiergathering.cashiergathering_id, taskDescription, '', groupId);
            if (!taskResult) {
                return common.sendError(res, 'task_01');
            } else {
                common.sendData(res, cashiergathering);
            }
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function modifyCashiergatheringState(req, cashiergathering_id) {
    try {
        let user = req.user
        let addCreditlinedetail = {}
        let cashiergathering = await tb_cashiergathering.findOne({
            where: {
                state: GLBConfig.ENABLE,
                cashiergathering_id: cashiergathering_id,
            }
        });

        if (cashiergathering) {
            let corporateclientsId = cashiergathering.cashiergathering_customer_code
            let gatheringMoney = Number(cashiergathering.cashiergathering_gathering_money) //本次收款金额
            let businessId = cashiergathering.cashiergathering_code
            //客户信息
            let corporateclients = await tb_corporateclients.findOne({
                where: {
                    corporateclients_id: corporateclientsId,
                    state: GLBConfig.ENABLE
                }
            });
            let creditline = Number(corporateclients.corporateclients_creditline)
            //可用余额
            let creditlinedetail = await tb_creditlinedetail.findAll({
                where: {
                    corporateclients_id: corporateclientsId,
                    state: GLBConfig.ENABLE
                }
            });

            let currentSumCreditline = 0, //当前信用额度余额
                currentSumAdvance = 0, //当前预付款余额
                addCreditline = 0, //实际增加信用额度
                addAdvance = 0, //实际增加预付款金额
                diffCreditline = 0 //信用额度差额。需要增加的信用额度
            for (let c of creditlinedetail) {
                if (c.creditlinedetail_detail_type == 0) {
                    if (c.creditlinedetail_type == 1) {
                        currentSumCreditline += Number(c.creditlinedetail_money)
                    } else {
                        currentSumCreditline -= Number(c.creditlinedetail_money)
                    }
                } else {
                    if (c.creditlinedetail_type == 1) {
                        currentSumAdvance += Number(c.creditlinedetail_money)
                    } else {
                        currentSumAdvance -= Number(c.creditlinedetail_money)
                    }
                }
            }

            if (creditline > 0) {
                if (currentSumCreditline + gatheringMoney <= creditline) {
                    addCreditlinedetail = await tb_creditlinedetail.create({
                        corporateclients_id: corporateclientsId, //企业客户id
                        creditlinedetail_type: '1', //类型  1增加2减少
                        creditlinedetail_businessid: businessId, //业务单号
                        creditlinedetail_money: gatheringMoney, //金额  本次收款或支出的金额
                        creditlinedetail_surplus_creditline: currentSumCreditline + gatheringMoney, //结余信用额度
                        creditlinedetail_surplus_advance: currentSumAdvance, //结余预付款金额
                        creditlinedetail_detail_type: 0 //0信用，1预付款
                    });
                }else{
                    addCreditlinedetail = await tb_creditlinedetail.create({
                        corporateclients_id: corporateclientsId, //企业客户id
                        creditlinedetail_type: '1', //类型  1增加2减少
                        creditlinedetail_businessid: businessId, //业务单号
                        creditlinedetail_money: creditline - currentSumCreditline, //金额  本次收款或支出的金额
                        creditlinedetail_surplus_creditline: creditline, //结余信用额度
                        creditlinedetail_surplus_advance: currentSumAdvance, //结余预付款金额
                        creditlinedetail_detail_type: 0 //0信用，1预付款
                    });
                    addCreditlinedetail = await tb_creditlinedetail.create({
                        corporateclients_id: corporateclientsId, //企业客户id
                        creditlinedetail_type: '1', //类型  1增加2减少
                        creditlinedetail_businessid: businessId, //业务单号
                        creditlinedetail_money: currentSumCreditline + gatheringMoney - creditline, //金额  本次收款或支出的金额
                        creditlinedetail_surplus_creditline: creditline, //结余信用额度
                        creditlinedetail_surplus_advance: currentSumAdvance + (currentSumCreditline + gatheringMoney - creditline), //结余预付款金额
                        creditlinedetail_detail_type: 1 //0信用，1预付款
                    });
                }
            } else {
                let addCreditlinedetail = await tb_creditlinedetail.create({
                    corporateclients_id: corporateclientsId, //企业客户id
                    creditlinedetail_type: '1', //类型  1增加2减少
                    creditlinedetail_businessid: businessId, //业务单号
                    creditlinedetail_money: gatheringMoney, //金额  本次收款或支出的金额
                    creditlinedetail_surplus_creditline: currentSumCreditline, //结余信用额度
                    creditlinedetail_surplus_advance: currentSumAdvance + gatheringMoney, //结余预付款金额
                    creditlinedetail_detail_type: 1 //0信用，1预付款
                });
            }
            // 修改收款单状态
            cashiergathering.cashiergathering_examine = user.user_id;
            cashiergathering.cashiergathering_examine_time = new Date();
            cashiergathering.cashiergathering_state = '2';
            await cashiergathering.save();

            //短信通知申报人
            let userDeclarant = await tb_user.findOne({
                where: {
                    state: GLBConfig.ENABLE,
                    user_id: cashiergathering.cashiergathering_declarant
                }
            });
            if (userDeclarant) {
                if (userDeclarant.phone) {
                    sms.sedDataMsg(userDeclarant.phone, 'gather', [cashiergathering.cashiergathering_code, user.name, moment().format("YYYY-MM-DD HH:mm")]) //给申请人发送确认短信
                }
            }
        }

    } catch (error) {
        throw error
    }
}

exports.modifyCashiergatheringState = modifyCashiergatheringState;