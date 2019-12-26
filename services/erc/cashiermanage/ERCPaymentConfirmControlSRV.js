const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCPaymentConfirmControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const RecordingVouchersc = require('../../../util/RecordingVouchersc');

const moment = require('moment');
const sequelize = model.sequelize;

const task = require('../baseconfig/ERCTaskListControlSRV');
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;
const tb_paymentconfirm = model.erc_paymentconfirm;
const tb_user = model.common_user;
const tbl_corporateclients = model.erc_corporateclients;
const tb_taxpayment = model.erc_taxpayment;
const tb_supplierpayment = model.erc_supplierpayment;
const tb_amortize_payment = model.erc_amortize_payment;

exports.ERCPaymentConfirmControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'modifyPayment') {
        modifyPayment(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};

async function initAct(req, res) {
    try {
        let returnData = {};
        returnData.payment_confirm_type = GLBConfig.PAYMENTCONFIRMTYPE;
        returnData.payment_confirm_state = GLBConfig.PAYMENTCONFIRMSTATE;
        returnData.PAYMENTMETHOD = GLBConfig.PAYMENTMETHOD;
        returnData.MONETARYFUNDTYPE = await getMonetaryFundType(req, res)
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
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
//查询待摊资产列表
async function searchAct(req, res) {
    let doc = common.docTrim(req.body),
        user = req.user,
        returnData = {},
        replacements = [];
    let queryStr = `select * from (select p.*,u2.name as declarant_name,u3.name as examine_name,
        case p.paymentconfirm_expend_user_type
        when 0 then u1.username
        when 1 then c.corporateclients_name
        when 2 then s.supplier_name
        else o.other_main_name end as expend_name   
        from tbl_erc_paymentconfirm p 
        left join tbl_common_user u1 on (p.paymentconfirm_expend_user = u1.user_id and u1.state=1) 
        left join tbl_erc_corporateclients c on (p.paymentconfirm_expend_user = c.corporateclients_id and c.state=1 )
        left join tbl_erc_supplier s on (p.paymentconfirm_expend_user = s.supplier_id and s.state=1)
        left join tbl_erc_othermain o on (p.paymentconfirm_expend_user = o.other_main_id and o.state=1)
        left join tbl_common_user u2 on (p.paymentconfirm_declarant = u2.user_id and u2.state=1) 
        left join tbl_common_user u3 on (p.paymentconfirm_examine = u3.user_id and u3.state=1) 
        where p.state=1 and p.domain_id=?) as a where true`;
    replacements.push(user.domain_id);
    if (doc.search_text) {
        queryStr += ` and u1.name like ? `;
        let search_text = `%${doc.search_text}%`;
        replacements.push(search_text);
    }
    if (doc.paymentconfirm_name) {
        queryStr += ` and p.paymentconfirm_name = ? `;
        replacements.push(doc.paymentconfirm_name);
    }
    if (doc.paymentconfirm_id) {
        queryStr += ` and p.paymentconfirm_id = ? `;
        replacements.push(doc.paymentconfirm_id);
    }

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    returnData.total = result.count;
    returnData.rows = [];
    for (let ap of result.data) {
        let d = JSON.parse(JSON.stringify(ap));
        d.created_at = ap.created_at ? moment(ap.created_at).format("YYYY-MM-DD") : null;
        d.updated_at = ap.updated_at ? moment(ap.updated_at).format("YYYY-MM-DD") : null;
        d.paymentconfirm_examine_time = ap.paymentconfirm_examine_time ? moment(ap.paymentconfirm_examine_time).format("YYYY-MM-DD") : null;
        d.paymentconfirm_declarant_time = ap.paymentconfirm_declarant_time ? moment(ap.paymentconfirm_declarant_time).format("YYYY-MM-DD") : null;
        returnData.rows.push(d)
    }
    common.sendData(res, returnData);
}

async function modifyPayment(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user
        await tb_paymentconfirm.update({
            payment_method: doc.payment_method,
            monetary_fund_type: doc.monetary_fund_type,
            bank_account: doc.bank_account,
            paymentconfirm_state: 2,
            paymentconfirm_examine: user.user_id,
            paymentconfirm_examine_time: new Date()
        }, {
            where: {
                paymentconfirm_id: doc.paymentconfirm_id
            }
        });

        if (doc.paymentconfirm_name === GLBConfig.PAYMENTCONFIRMTYPE[2].value) {
            const taxPayment = await tb_taxpayment.findOne({
                where: {
                    paymentconfirm_id: doc.paymentconfirm_id
                }
            });

            if (taxPayment) {
                taxPayment.payment_state = GLBConfig.PAYMENTCONFIRMSTATE[1].value;
                await taxPayment.save();
            }
        } else if (doc.paymentconfirm_name === GLBConfig.PAYMENTCONFIRMTYPE[3].value) {
            const supplierPayment = await tb_supplierpayment.findOne({
                where: {
                    paymentconfirm_id: doc.paymentconfirm_id
                }
            });

            if (supplierPayment) {
                supplierPayment.payment_state = GLBConfig.PAYMENTCONFIRMSTATE[1].value;
                await supplierPayment.save();
            }
        } else if (doc.paymentconfirm_name === GLBConfig.PAYMENTCONFIRMTYPE[4].value) {
            const amortizePayment = await tb_amortize_payment.findOne({
                where: {
                    paymentconfirm_id: doc.paymentconfirm_id
                }
            });

            if (amortizePayment) {
                amortizePayment.payment_state = GLBConfig.PAYMENTCONFIRMSTATE[1].value;
                await amortizePayment.save();
            }
        } else if (doc.paymentconfirm_name === GLBConfig.PAYMENTCONFIRMTYPE[5].value) {
            //todo 记账凭证
            await RecordingVouchersc.createRecordingVoucherSC('JKSQD', user, {
                paymentconfirm_id: body.paymentconfirm_id
            })
        }

        common.sendData(res, {});
    } catch (error) {
        common.sendFault(res, error);
    }


}