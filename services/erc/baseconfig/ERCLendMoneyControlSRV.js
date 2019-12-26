const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const model = require('../../../model');
const TaskListControlSRV = require('./ERCTaskListControlSRV');
const sequelize = model.sequelize;
const tb_lendmoney = model.erc_lendmoney;
const tb_lendmoneyrepayset = model.erc_lendmoneyrepayset;

exports.ERCLendMoneyControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'add') {
        addAct(req, res);
    } else if (method === 'delete') {
        deleteAct(req, res);
    } else if (method === 'modify') {
        modifyAct(req, res);
    } else if (method === 'searchConfirm') {
        searchConfirmAct(req, res);
    } else if (method === 'confirm') {
        confirmAct(req, res);
    } else if (method === 'refuse') {
        refuseAct(req, res);
    } else if (method === 'searchRepay') {
        searchRepayAct(req, res);
    } else if (method === 'addRepay') {
        addRepayAct(req, res);
    } else if (method === 'deleteRepay') {
        deleteRepayAct(req, res);
    } else {
        return common.sendError(res, 'common_01');
    }
}

async function initAct(req, res) {
    try {
        let returnData = {};

        returnData.LENDMONEYCOMPANYTYPE = GLBConfig.LENDMONEYCOMPANYTYPE;
        returnData.LENDMONEYSTATE = GLBConfig.LENDMONEYSTATE;

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

async function searchConfirmAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        let result = await getData(req, res, false, {cashier_id: user.user_id});
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

        let lendmoney_id = await save(req, res, doc, false);
        let returnData = await getData(req, res, true, {lendmoney_id: lendmoney_id});

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let lendmoney = await tb_lendmoney.findOne({
            where: {
                domain_id: user.domain_id,
                lendmoney_id: doc.lendmoney_id,
                state: GLBConfig.ENABLE
            }
        });
        if (!lendmoney) {
            return common.sendError(res, 'common_api_02');
        }

        lendmoney.state = GLBConfig.DISABLE;
        await lendmoney.save();

        return common.sendData(res, lendmoney);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body).new;
        let user = req.user;

        let check = await tb_lendmoney.findOne({
            where: {
                domain_id: user.domain_id,
                lendmoney_id: doc.lendmoney_id,
                state: GLBConfig.ENABLE
            }
        });
        if (!check) {
            return common.sendError(res, 'common_api_02');
        }
        let lendmoney_id = await save(req, res, doc, true);
        let returnData = await getData(req, res, true, {lendmoney_id: lendmoney_id});

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
}


async function save(req, res, doc, is_update) {
    let user = req.user;
    let lendmoney = {};
    let data = {};
    let returnData = {};
    let lendmoney_id = '';

    data.domain_id = user.domain_id;
    data.company_type = doc.company_type;
    data.company_id = doc.company_id;
    data.money = doc.money;
    data.expire_date = doc.expire_date;
    data.interest_date = doc.interest_date;
    data.interest_rate = doc.interest_rate;
    data.operator_id = user.user_id;
    data.cashier_id = doc.cashier_id;
    data.is_repay = 0;

    if (is_update == false) {
        data.lendmoney_number = 'LM' + new Date().Format('yyyyMMdd') + Math.ceil(Math.random() * 100000);
        data.lendmoney_state = 1;
        lendmoney = await tb_lendmoney.create(data);
        lendmoney_id = lendmoney.lendmoney_id;
    } else {
        await tb_lendmoney.update(data, {
            where: {
                lendmoney_id: doc.lendmoney_id
            }
        })
        lendmoney_id = doc.lendmoney_id;
    }

    return lendmoney_id;

}

async function getData(req, res, is_single, doc) {
    let user = req.user;
    let replacements = [];

    let queryStr = 'select l.*, case when l.company_type = 1 then c.corporateclients_name when l.company_type = 2 then s.supplier_name when l.company_type = 3 then u.name when l.company_type = 4 then o.other_main_name end as company_name, operator.name as operator_name, cashier.name as cashier_name' +
        ' from tbl_erc_lendmoney l' +
        ' left join tbl_common_user operator on operator.user_id = l.operator_id' +
        ' left join tbl_common_user cashier on cashier.user_id = l.cashier_id' +
        ' left join tbl_erc_corporateclients c on c.corporateclients_id = l.company_id' +
        ' left join tbl_erc_supplier s on s.supplier_id = l.company_id' +
        ' left join tbl_common_user u on u.user_id = l.company_id' +
        ' left join tbl_erc_othermain o on o.other_main_id = l.company_id' +
        ' where l.state = 1 and l.domain_id = ?';
    replacements.push(user.domain_id);

    if (doc.lendmoney_id) {
        queryStr += ' and l.lendmoney_id = ?';
        replacements.push(doc.lendmoney_id);
    }
    if (doc.search_type == 1) {
        queryStr += ' and l.operator_id = ?';
        replacements.push(user.user_id);
    }
    if (doc.cashier_id) {
        queryStr += ' and l.cashier_id = ?';
        replacements.push(doc.cashier_id);
    }
    if (doc.repay) {
        queryStr += ' and l.is_repay = 0 and l.lendmoney_state = 2';
    }
    queryStr += ' order by l.created_at desc';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.expire_date = r.expire_date ? r.expire_date.Format('yyyy-MM-dd') : null;
        r.interest_date = r.interest_date ? r.interest_date.Format('yyyy-MM-dd') : null;
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r.arrive_date = r.arrive_date ? r.arrive_date.Format('yyyy-MM-dd') : null;
    }

    if (is_single == true) {
        return result.data[0];
    } else {
        return result;
    }
}

async function confirmAct(req, res) {
    try {
        let doc = common.docTrim(req.body).new;
        let user = req.user;

        let check = await tb_lendmoney.findOne({
            where: {
                domain_id: user.domain_id,
                lendmoney_id: doc.lendmoney_id,
                state: GLBConfig.ENABLE,
                lendmoney_state: 1
            }
        });
        if (!check) {
            return common.sendError(res, 'common_api_02');
        }

        let data = {};
        data.lendmoney_state = 2;
        data.arrive_money = doc.arrive_money;
        data.arrive_date = new Date();
        await tb_lendmoney.update(data, {
            where: {
                lendmoney_id: doc.lendmoney_id
            }
        });

        let returnData = await getData(req, res, true, {lendmoney_id: doc.lendmoney_id});

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function refuseAct(req, res) {
    try {
        let doc = common.docTrim(req.body).new;
        let user = req.user;

        let check = await tb_lendmoney.findOne({
            where: {
                domain_id: user.domain_id,
                lendmoney_id: doc.lendmoney_id,
                state: GLBConfig.ENABLE,
                lendmoney_state: 1
            }
        });
        if (!check) {
            return common.sendError(res, 'common_api_02');
        }

        let data = {};
        data.lendmoney_state = 3;
        await tb_lendmoney.update(data, {
            where: {
                lendmoney_id: doc.lendmoney_id
            }
        });

        let returnData = await getData(req, res, true, {lendmoney_id: doc.lendmoney_id});

        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function searchRepayAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};

        let check = await tb_lendmoney.findOne({
            where: {
                domain_id: user.domain_id,
                lendmoney_id: doc.lendmoney_id,
                state: GLBConfig.ENABLE
            }
        });
        if (!check) {
            return common.sendError(res, 'common_api_02');
        }

        let result = await getRepayData(req, res, doc);

        returnData.total = result.count;
        returnData.rows = result.data;

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function addRepayAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let check = await tb_lendmoney.findOne({
            where: {
                domain_id: user.domain_id,
                lendmoney_id: doc.lendmoney_id,
                state: GLBConfig.ENABLE
            }
        });
        if (!check) {
            return common.sendError(res, 'common_api_02');
        }

        let repaySet = await tb_lendmoneyrepayset.create({
            lendmoney_id: doc.lendmoney_id,
            repay_money: doc.repay_money,
            repay_date: doc.repay_date,
            domain_id: user.domain_id,
            operator_id: user.user_id
        });

        return common.sendData(res, repaySet);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function deleteRepayAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let check = await tb_lendmoneyrepayset.findOne({
            where: {
                domain_id: user.domain_id,
                lendmoneyrepayset_id: doc.lendmoneyrepayset_id,
                state: GLBConfig.ENABLE
            }
        });
        if (!check) {
            return common.sendError(res, 'common_api_02');
        }

        check.state = GLBConfig.DISABLE;
        await check.save();

        return common.sendData(res, check);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function getRepayData(req, res, doc) {
    let replacements = [];

    let queryStr = 'select *' +
        ' from tbl_erc_lendmoneyrepayset' +
        ' where state = 1 and lendmoney_id = ?';
    replacements.push(doc.lendmoney_id);

    queryStr += ' order by repay_date';
    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

    for (let r of result.data) {
        r.repay_date = r.repay_date ? r.repay_date.Format('yyyy-MM-dd') : null;
    }

    return result;
}

exports.getData = getData;