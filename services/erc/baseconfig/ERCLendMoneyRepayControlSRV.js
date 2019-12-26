const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const model = require('../../../model');
const TaskListControlSRV = require('./ERCTaskListControlSRV');
const LendMoney = require('./ERCLendMoneyControlSRV');
const sequelize = model.sequelize;
const tb_lendmoney = model.erc_lendmoney;
const tb_lendmoneyrepayset = model.erc_lendmoneyrepayset;
const tb_lendmoneyrepay = model.erc_lendmoneyrepay;
const tb_common_user = model.common_user;

exports.ERCLendMoneyRepayControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'add') {
        addAct(req,res);
    } else if (method === 'delete') {
        deleteAct(req, res);
    } else if (method === 'getLendMoney') {
        getLendMoney(req, res);
    } else if (method === 'stat') {
        statAct(req, res);
    } else {
        return common.sendError(res, 'common_01');
    }
}

async function initAct(req, res) {
     try {
         let returnData = {}

         returnData.LENDMONEYCOMPANYTYPE = GLBConfig.LENDMONEYCOMPANYTYPE;
         returnData.LENDMONEYREPAYSTATE = GLBConfig.LENDMONEYREPAYSTATE;

         return common.sendData(res, returnData);

     } catch (error) {
         return common.sendFault(res, error);
     }
}

async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};

        let result = await getData(req, res, false, doc);
        returnData.total = result.count;
        returnData.rows = result.data;

        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

        let lendmoneyrepay_id = await save(req, res, doc, false);
        let returnData = await getData(req, res, true, {lendmoneyrepay_id: lendmoneyrepay_id});

        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let lendmoneyrepay = await tb_lendmoneyrepay.findOne({
            where: {
                domain_id: user.domain_id,
                lendmoneyrepay_id: doc.lendmoneyrepay_id,
                state: GLBConfig.ENABLE
            }
        });
        if (!lendmoneyrepay) {
            return common.sendError(res, 'common_api_02');
        }

        lendmoneyrepay.state = GLBConfig.DISABLE;
        await lendmoneyrepay.save();

        return common.sendData(res, lendmoneyrepay);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function save(req, res, doc, is_update) {
    let user = req.user;
    let lendmoneyrepay = {};
    let data = {};
    let returnData = {};
    let lendmoneyrepay_id = '';

    data.domain_id = user.domain_id;
    data.operator_id = user.user_id;
    data.lendmoney_id = doc.lendmoney_id;
    data.repay_money = doc.repay_money;
    data.repay_interest = doc.repay_interest;
    data.lendmoneyrepay_state = 1;

    if (is_update == false) {

        lendmoneyrepay = await tb_lendmoneyrepay.create(data);
        lendmoneyrepay_id = lendmoneyrepay.lendmoneyrepay_id;
    } else {
        await tb_lendmoneyrepay.update(data, {
            where: {
                lendmoneyrepay_id: doc.lendmoneyrepay_id
            }
        })
        lendmoneyrepay_id = doc.lendmoneyrepay_id;
    }

    let groupID = common.getUUIDByTime(30);
    await TaskListControlSRV.createTask(user, '利息支付申请确认', '214','', lendmoneyrepay_id, '利息支付申请确认', '', groupID);

    return lendmoneyrepay_id;

}

async function getData(req, res, is_single, doc) {
    let user = req.user;
    let replacements = [];

    let queryStr = 'select l.*, lr.repay_money as lr_repay_money, lr.repay_interest as lr_repay_interest, lr.lendmoneyrepay_state, operator.name as operator_name, lr.created_at as lr_created_at, case when l.company_type = 1 then c.corporateclients_name when l.company_type = 2 then s.supplier_name when l.company_type = 3 then u.name when l.company_type = 4 then o.other_main_name end as company_name' +
        ' from tbl_erc_lendmoneyrepay lr' +
        ' left join tbl_erc_lendmoney l on l.lendmoney_id = lr.lendmoney_id' +
        ' left join tbl_common_user operator on operator.user_id = lr.operator_id' +
        ' left join tbl_erc_corporateclients c on c.corporateclients_id = l.company_id' +
        ' left join tbl_erc_supplier s on s.supplier_id = l.company_id' +
        ' left join tbl_common_user u on u.user_id = l.company_id' +
        ' left join tbl_erc_othermain o on o.other_main_id = l.company_id' +
        ' where lr.state = 1 and lr.domain_id = ?';
    replacements.push(user.domain_id);

    if (doc.lendmoneyrepay_id) {
        queryStr += ' and lr.lendmoneyrepay_id = ?';
        replacements.push(doc.lendmoneyrepay_id);
    }
    if (doc.search_type == 1) {
        queryStr += ' and l.operator_id = ?';
        replacements.push(user.user_id);
    }

    queryStr += ' order by lr.created_at desc';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.expire_date = r.expire_date ? r.expire_date.Format('yyyy-MM-dd') : null;
        r.interest_date = r.interest_date ? r.interest_date.Format('yyyy-MM-dd') : null;
        r.lr_created_at = r.lr_created_at ? r.lr_created_at.Format('yyyy-MM-dd') : null;
    }

    if (is_single == true) {
        return result.data[0];
    } else {
        return result;
    }
}

async function getLendMoney(req, res) {
    try {

        let returnData = {};

        let params = {};
        params.search_type = 1;
        params.repay = 1;

        let result = await LendMoney.getData(req, res, false, params);
        let numberList = [];

        numberList.push({id: '', value: '', text: ''});

        for (let r of result.data) {
            numberList.push({id: r.lendmoney_number, value: r.lendmoney_number, text: r.lendmoney_number});

            switch (r.company_type) {
                case 1: r.company_type_name = '客户'; break;
                case 2: r.company_type_name = '供应商'; break;
                case 3: r.company_type_name = '员工'; break;
                case 4: r.company_type_name = '其他相关主体'; break;
            }

        }

        returnData.repayList = result.data;
        returnData.numberList = numberList;

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function modifyState(applyState, description, lendmoneyrepay_id, applyApprover) {
    try {
        let lendMoneyRepay = await tb_lendmoneyrepay.findOne({
            where: {
                lendmoneyrepay_id: lendmoneyrepay_id
            }
        });
        if (lendMoneyRepay && lendMoneyRepay.lendmoneyrepay_state == 1) {
            await tb_lendmoneyrepay.update({
                lendmoneyrepay_state: applyState,
                checker_id: applyApprover,
                check_date: new Date()
            }, {
                where: {
                    lendmoneyrepay_id: lendmoneyrepay_id
                }
            });

            if (applyState == 2) {
                let lendmoney = await tb_lendmoney.findOne({
                    where: {
                        lendmoney_id: lendMoneyRepay.lendmoney_id
                    }
                });
                let arrive_money = lendmoney.arrive_money;

                let repay_money = await tb_lendmoneyrepay.sum('repay_money', {
                    where: {
                        state: GLBConfig.ENABLE,
                        lendmoneyrepay_state: 2,
                        lendmoney_id: lendMoneyRepay.lendmoney_id
                    }
                });
                if (parseFloat(repay_money) >= parseFloat(arrive_money)) {
                    await tb_lendmoney.update({
                        is_repay: 1
                    },{
                        where: {
                            lendmoney_id: lendMoneyRepay.lendmoney_id
                        }
                    })
                }
            }
        }
    } catch (error) {
        throw error
    }
}

async function statAct(req, res) {
    try {

        let user = req.user;
        let returnData = {};
        let replacements = [];

        let queryStr = 'select l.*, case when l.company_type = 1 then c.corporateclients_name when l.company_type = 2 then s.supplier_name when l.company_type = 3 then u.name when l.company_type = 4 then o.other_main_name end as company_name, ifnull(sum(r.repay_interest),0) as interest_total, ifnull(sum(r.repay_money),0) as money_repay' +
            ' from tbl_erc_lendmoney l' +
            ' left join tbl_erc_corporateclients c on c.corporateclients_id = l.company_id' +
            ' left join tbl_erc_supplier s on s.supplier_id = l.company_id' +
            ' left join tbl_common_user u on u.user_id = l.company_id' +
            ' left join tbl_erc_othermain o on o.other_main_id = l.company_id' +
            ' left join tbl_erc_lendmoneyrepay r on r.lendmoney_id = l.lendmoney_id and r.state = 1 and r.lendmoneyrepay_state = 2' +
            ' where l.state = 1 and l.lendmoney_state = 2 and l.domain_id = ?';
        replacements.push(user.domain_id);

        queryStr += ' group by l.lendmoney_id';
        queryStr += ' order by l.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        for (let r of result.data) {
            r.expire_date = r.expire_date ? r.expire_date.Format('yyyy-MM-dd') : null;
            r.interest_date = r.interest_date ? r.interest_date.Format('yyyy-MM-dd') : null;
            r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
            r.arrive_date = r.arrive_date ? r.arrive_date.Format('yyyy-MM-dd') : null;
            r.money_no_repay = parseFloat(r.arrive_money) - parseFloat(r.money_repay);
        }

        returnData.total = result.count;
        returnData.rows = result.data;

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

exports.modifyState = modifyState;