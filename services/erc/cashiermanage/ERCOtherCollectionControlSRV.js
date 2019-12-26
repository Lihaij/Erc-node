const common = require('../../../util/CommonUtil');
const AccountConst = require('../../../util/AccountConst');
const logger = require('../../../util/Logger').createLogger('ERCAccountingControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const GLBConfig = require('../../../util/GLBConfig');
const RecordingVouchersc = require('../../../util/RecordingVouchersc');

const moment = require('moment');
const sequelize = model.sequelize;
const tb_corporateclients = model.erc_corporateclients
const tb_supplier = model.erc_supplier
const tb_othermain = model.erc_othermain
const tb_othercollection = model.erc_othercollection
const tb_companybankno = model.erc_companybankno
const tb_basetypedetail = model.erc_basetypedetail
exports.ERCOtherCollectionControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        await init(req, res);
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'delete') {
        deleteAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'search') {
        searchAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};

async function init(req, res) {
    try {
        const returnData = {};

        let aaa = await global.getBaseTypeInfo('', 'SKLX');
        returnData.OTHERCOLLECTIONTYPE = aaa.filter(item => {
            return item.typedetail_no == 0 || item.typedetail_no == 1 ||
                item.typedetail_no == 2 || item.typedetail_no == 4 ||
                item.typedetail_no == 9
        }); //收款类型      othercollection_type
        // returnData.OTHERCOLLECTIONTYPE = await global.getBaseTypeInfo('', 'SKLX').filter(item => {
        //     return item.id == 0 || item.id == 1 || item.id == 2 || item.id == 4 || item.id == 9
        // }); //收款类型      othercollection_type

        returnData.OTHERCOLLECTIONMONEYTYPE = await global.getBaseTypeInfo(req.user.domain_id, 'HBLX'); //货币资金类型  othercollection_mnoey_type
        returnData.OTHERCOLLECTIONWAY = GLBConfig.PAYMENTMETHOD //收款方式      othercollection_way

        //银行账号
        let queryStr = `select * from tbl_erc_companybankno b 
            left join tbl_erc_company c on (b.company_id = c.company_id and c.state = 1)
            where b.state = 1 and c.domain_id=?`
        let result = await sequelize.query(queryStr, {
            replacements: [req.user.domain_id],
            type: sequelize.QueryTypes.SELECT
        });
        returnData.COMPANYBANKNO = result.map(item => {
            return {
                id: item.companybankno_id,
                text: item.companybankno_bank_no,
                value: item.companybankno_id
            }
        })


        let CORPORATECLIENTS = await tb_corporateclients.findAll({ //othercollection_source_name
            where: {
                state: 1,
                domain_id: req.user.domain_id
            }
        }).map(item => {
            return {
                id: item.corporateclients_id,
                text: item.corporateclients_name,
                value: item.corporateclients_id
            }
        })

        let SUPPLIER = await tb_supplier.findAll({ //供应商
            where: {
                state: 1,
                domain_id: req.user.domain_id
            }
        }).map(item => {
            return {
                id: item.supplier,
                text: item.supplier_name,
                value: item.supplier
            }
        })

        let OTHERMAIN = await tb_othermain.findAll({ //其他相关主体
            where: {
                state: 1,
                domain_id: req.user.domain_id
            }
        }).map(item => {
            return {
                id: item.other_main_id,
                text: item.other_main_name,
                value: item.other_main_id
            }
        })
        returnData.OTHERCOLLECTIONSOURCENAME = [
            ...CORPORATECLIENTS,
            ...SUPPLIER,
            ...OTHERMAIN
        ]
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function addAct(req, res) {
    try {
        let {
            body,
            user
        } = req

        let result = await tb_othercollection.create({
            domain_id: user.domain_id,
            othercollection_type: body.othercollection_type,
            othercollection_source_name: body.othercollection_source_name,
            othercollection_money: Number(body.othercollection_money) * 100,
            othercollection_mnoey_type: body.othercollection_mnoey_type,
            othercollection_time: body.othercollection_time,
            othercollection_way: body.othercollection_way,
            othercollection_bank_no: body.othercollection_bank_no,
            othercollection_remark: body.othercollection_remark,
            othercollection_creator: body.othercollection_creator
        });

        let basetypedetail = await tb_basetypedetail.findOne({
            where: {
                state: 1,
                basetypedetail_id: body.othercollection_type
            }
        })

        if (basetypedetail.typedetail_no == 0) { //政府补助
            await RecordingVouchersc.createRecordingVoucherSC('QTSK_0', user, {
                othercollection_id: result.othercollection_id,
                amount: body.othercollection_money
            })
        } else if (basetypedetail.typedetail_no == 1) { //退税款
            await RecordingVouchersc.createRecordingVoucherSC('QTSK_1', user, {
                othercollection_id: result.othercollection_id,
                amount: body.othercollection_money
            })
        } else if (basetypedetail.typedetail_no == 2) { //捐赠款
            await RecordingVouchersc.createRecordingVoucherSC('QTSK_2', user, {
                othercollection_id: result.othercollection_id,
                amount: body.othercollection_money
            })
        } else if (basetypedetail.typedetail_no == 3) { //供应商退款
            await RecordingVouchersc.createRecordingVoucherSC('QTSK_3', user, {
                othercollection_id: result.othercollection_id,
                amount: body.othercollection_money
            })
        } else if (basetypedetail.typedetail_no == 4) { //借款
            await RecordingVouchersc.createRecordingVoucherSC('QTSK_4', user, {
                othercollection_id: result.othercollection_id,
                amount: body.othercollection_money
            })
        } else if (basetypedetail.typedetail_no == 9) { //投资者的投资款
            await RecordingVouchersc.createRecordingVoucherSC('QTSK_9', user, {
                othercollection_id: result.othercollection_id,
                amount: body.othercollection_money
            })
        }

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}
async function searchAct(req, res) {
    try {
        let {
            body,
            user
        } = req
        let returnData = {}

        let queryStr = `select c.*,
            u.username as othercollection_creator,b.companybankno_bank_no as othercollection_bank_no 
            from tbl_erc_othercollection c 
            left join tbl_common_user u on (c.othercollection_creator = u.user_id and u.state = 1)
            left join tbl_erc_companybankno b on (c.othercollection_bank_no = b.companybankno_id and b.state = 1)
            where c.state=1 and c.domain_id = ?`
        let replacements = [user.domain_id];
        if (body.searchText) {
            queryStr += ` and othercollection_source_name like ?`
            replacements.push('%' + body.searchText + '%')
        }
        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.othercollection_time = result.othercollection_time ? moment(result.othercollection_time).format("YYYY-MM-DD") : null;
            result.created_at = result.created_at ? moment(result.created_at).format("YYYY-MM-DD") : null;
            result.othercollection_money = Number(result.othercollection_money) / 100
            returnData.rows.push(result)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}