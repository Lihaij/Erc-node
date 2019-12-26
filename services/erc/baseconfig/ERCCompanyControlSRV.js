const fs = require('fs');
const path = require('path');
const iconvLite = require('iconv-lite');

const config = require('../../../config');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCEstateControlSRV');
const model = require('../../../model');
const ERCAccountingControlSRV = require('../cashiermanage/ERCAccountingControlSRV');

const sequelize = model.sequelize;
const tb_company = model.erc_company
const tb_companybankno = model.erc_companybankno
const tb_recordingvoucherdetailsc = model.erc_recordingvoucherdetailsc;
const tb_adjustdetail = model.erc_adjustdetail;
const tb_custorgstructure = model.erc_custorgstructure;
const tb_recordingvouchersc = model.erc_recordingvouchersc;



exports.ERCCompanyControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'addCompany') {
        addCompany(req, res)
    } else if (method === 'delCompany') {
        delCompany(req, res)
    } else if (method === 'modifyCompany') {
        modifyCompany(req, res)
    } else if (method === 'getCompany') {
        getCompany(req, res)
    } else if (method === 'addBankNo') {
        addBankNo(req, res)
    } else if (method === 'deleteBankNo') {
        deleteBankNo(req, res)
    } else if (method === 'getCompanyBankNo') {
        getCompanyBankNo(req, res)
    } else if (method === 'modifyCompanyBankNo') {
        modifyCompanyBankNo(req, res)
    } else if (method === 'adjust_bank_no') {
        AdjustBankNo(req, res)
    } else if (method === 'get_adjust_detail') {
        getAdjustDetail(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};

async function getProcedureType(domain_id, code) {
    let queryStr =
        `select
            t.basetypedetail_id as id, t.typedetail_name as text
            from tbl_erc_basetypedetail t
            left join tbl_erc_basetype rt
            on t.basetype_id = rt.basetype_id
            where t.state = 1
            and t.domain_id = ?
            and basetype_code = ?`;

    const replacements = [domain_id, code];
    queryStr += ' order by t.created_at desc';
    return await common.simpleSelect(sequelize, queryStr, replacements);
}

async function getBaseType(code) {
    try {
        let returnData = [],
            replacements = []
        let queryStr = `select d.*, t.basetype_code from tbl_erc_basetypedetail d,tbl_erc_basetype t
             where d.basetype_id=t.basetype_id and t.basetype_code=?`;
        replacements.push(code)
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        for (let r of result) {
            returnData.push({
                id: r.basetypedetail_id,
                value: r.basetypedetail_id,
                text: r.typedetail_name,
            })
        }
        return returnData
    } catch (error) {
        throw error
    }
}
async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {}
        returnData.WB = await getBaseType('HBLX');
        returnData.JZBWB = await getBaseType('HBLX');
        returnData.BANKNOTYPE = await getBaseType('YHZHFL');
        returnData.SALETAXRATE = await getProcedureType(req.user.domain_id, 'XSSYSL');

        let bankInfo = await tb_companybankno.findAll({
            where: {
                state: 1,
                company_id: doc.company_id
            }
        });
        returnData.bankInfo = [];
        for (const b of bankInfo) {
            returnData.bankInfo.push({
                id: b.companybankno_id,
                value: b.companybankno_id,
                text: b.companybankno_bank_no
            });
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
async function addCompany(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let addCompany = await tb_company.create({
            domain_id: user.domain_id,
            company_code: doc.company_code,
            company_name: doc.company_name,
            company_business_scope: doc.company_business_scope,
            company_main_business: doc.company_main_business,
            company_legal: doc.company_legal,
            company_legal_no: doc.company_legal_no,
            company_agency_phone: doc.company_agency_phone,
            company_ERC_name: doc.company_ERC_name,
            company_ERC_phone: doc.company_ERC_phone,
            company_ERC_QQ: doc.company_ERC_QQ,
            company_province: doc.company_province,
            company_city: doc.company_city,
            company_area: doc.company_area,
            company_adress: doc.company_adress,
            company_recording_currency: doc.company_recording_currency,
            company_foreign: doc.company_foreign,
            company_precision: doc.company_precision,
            company_profit_pursuit: doc.company_profit_pursuit,
            company_advance_date: doc.company_advance_date,
            company_recognition_criteria: doc.company_recognition_criteria,
            company_service_purchase_criteria: doc.company_service_purchase_criteria,
            company_property_purchase_criteria: doc.company_property_purchase_criteria,
            company_complex_supplier_number: doc.company_complex_supplier_number,
            company_piece_amount: doc.company_piece_amount,
            company_dayoff_type: doc.company_dayoff_type,
            receiver_id:doc.receiver_id
        });
        common.sendData(res, addCompany);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function delCompany(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let delCompany = await tb_company.findOne({
            where: {
                company_id: doc.company_id,
                state: GLBConfig.ENABLE
            }
        });

        if (delCompany) {
            delCompany.state = GLBConfig.DISABLE;
            await delCompany.save();
            common.sendData(res);
            return
        } else {
            common.sendError(res, 'estate_01');
            return
        }
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function modifyCompany(req, res) {
    try {
        let doc = common.docTrim(req.body)

        let modCompany = await tb_company.findOne({
            where: {
                company_id: doc.old.company_id
            }
        });

        if (modCompany) {
            modCompany.company_code = doc.new.company_code;
            modCompany.company_name = doc.new.company_name;
            modCompany.company_business_scope = doc.new.company_business_scope;
            modCompany.company_main_business = doc.new.company_main_business;
            modCompany.company_legal = doc.new.company_legal;
            modCompany.company_legal_no = doc.new.company_legal_no;
            modCompany.company_agency_phone = doc.new.company_agency_phone;
            modCompany.company_ERC_name = doc.new.company_ERC_name;
            modCompany.company_ERC_phone = doc.new.company_ERC_phone;
            modCompany.company_ERC_QQ = doc.new.company_ERC_QQ;
            modCompany.company_province = doc.new.company_province;
            modCompany.company_city = doc.new.company_city;
            modCompany.company_area = doc.new.company_area;
            modCompany.company_adress = doc.new.company_adress;
            modCompany.company_recording_currency = doc.new.company_recording_currency;
            modCompany.company_foreign = doc.new.company_foreign;
            modCompany.company_precision = doc.new.company_precision;
            modCompany.company_profit_pursuit = doc.new.company_profit_pursuit;
            modCompany.company_advance_date = doc.new.company_advance_date;
            modCompany.company_recognition_criteria = doc.new.company_recognition_criteria;
            modCompany.company_service_purchase_criteria = doc.new.company_service_purchase_criteria;
            modCompany.company_property_purchase_criteria = doc.new.company_property_purchase_criteria;
            modCompany.company_complex_supplier_number = doc.new.company_complex_supplier_number;
            modCompany.company_piece_amount = doc.new.company_piece_amount;
            modCompany.company_dayoff_type = doc.new.company_dayoff_type;
            modCompany.sale_goods_tax_rate = doc.new.sale_goods_tax_rate || 0;
            modCompany.provide_labor_tax_rate = doc.new.provide_labor_tax_rate || 0;
            modCompany.receiver_id = doc.new.receiver_id;
            await modCompany.save()
        } else {
            return common.sendError(res, '公司不存在');
        }
        common.sendData(res, modCompany);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function getCompany(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};git
        let replacements = [];
        let user = req.user;

        let queryStr ='SELECT t.*,ifnull(u.name,"") AS receiver_name ' +
            'from tbl_erc_company t LEFT JOIN tbl_common_user u ON t.receiver_id=u.user_id  where t.domain_id=?';
        replacements.push(user.domain_id)
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.created_at.Format("yyyy-MM-dd");
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function addBankNo(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let addBankNo = await tb_companybankno.create({
            company_id: doc.company_id,
            companybankno_name: doc.companybankno_name,
            companybankno_open: doc.companybankno_open,
            companybankno_bank_no: doc.companybankno_bank_no,
            companybankno_type: doc.companybankno_type
        })

        //添加会计科目明细详情
        await ERCAccountingControlSRV.addAccountingDetail(1002, addBankNo.companybankno_id, user.domain_id);
        await ERCAccountingControlSRV.addAccountingDetail(2001, addBankNo.companybankno_id, user.domain_id);


        common.sendData(res, addBankNo);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function deleteBankNo(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let delCompanyBanlkNo = await tb_companybankno.findOne({
            where: {
                companybankno_id: doc.companybankno_id,
                state: GLBConfig.ENABLE
            }
        });

        if (delCompanyBanlkNo) {
            delCompanyBanlkNo.state = GLBConfig.DISABLE;
            await delCompanyBanlkNo.save();
            common.sendData(res);
            return
        } else {
            common.sendError(res, 'estate_01');
            return
        }
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function getCompanyBankNo(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let replacements = [];
        let user = req.user;

        let queryStr = `select * from tbl_erc_companybankno where state=1 and company_id=?`
        replacements.push(doc.company_id)
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {

            //计算结存金额
            const records = await tb_recordingvoucherdetailsc.findAll({
                where: {
                    recordingvoucherdetailsc_activeAccount : r.companybankno_bank_no,
                    domain_id: user.domain_id
                }
            });
            let total = 0;
            for (const r of records) {
                total += (r.recordingvoucherdetailsc_debite - r.recordingvoucherdetailsc_credit);
            }


            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.created_at.Format("yyyy-MM-dd");
            result.total_price = Math.abs(total);
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function modifyCompanyBankNo(req, res) {
    try {
        let doc = common.docTrim(req.body)

        let modCompanybankno = await tb_companybankno.findOne({
            where: {
                companybankno_id: doc.old.companybankno_id
            }
        });

        if (modCompanybankno) {
            modCompanybankno.companybankno_name = doc.new.companybankno_name;
            modCompanybankno.companybankno_open = doc.new.companybankno_open;
            modCompanybankno.companybankno_bank_no = doc.new.companybankno_bank_no;
            modCompanybankno.companybankno_type = doc.new.companybankno_type;
            modCompanybankno.sale_goods_tax_rate = doc.new.sale_goods_tax_rate;
            modCompanybankno.provide_labor_tax_rate = doc.new.provide_labor_tax_rate;
            await modCompanybankno.save()
        } else {
            return common.sendError(res, '银行账号不存在');
        }
        common.sendData(res, modCompanybankno);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//添加转账log 添加明细分类帐
async function AdjustBankNo(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        //获取部门
        const department = await tb_custorgstructure.findOne({
            where: {
                user_id: user.user_id
            }
        });

        //获取银行账号
        const import_bank = await tb_companybankno.findOne({
            where: {
                companybankno_id: doc.import_bank_no
            }
        });
        const export_bank = await tb_companybankno.findOne({
            where: {
                companybankno_id: doc.export_bank_no
            }
        });

        //获取当前时间 字符串类型 因为老聂存时间为字符串类型，所以我很难受
        const year =new Date().getFullYear();//获取完整的年份(4位,1970-????)
        let month = new Date().getMonth() + 1;//获取当前月份(0-11,0代表1月)
        let day = new Date().getDate();//获取当前日(1-31)
        if (month < 10) {
            month ="0" + month;
        }
        if (day < 10) {
            day ="0" + day;
        }
        const time = `${year}-${month}-${day}`;


        await common.transaction(async function (t) {
            //生成记账凭证
            let genRecordingVoucherSID = await Sequence.genRecordingVoucherSID(user);
            const addRecordingvouchersc = await tb_recordingvouchersc.create({
                recordingvouchersc_code:genRecordingVoucherSID,
                domain_id:user.domain_id,
                recordingvouchersc_depart_id:department.department_id,
                recordingvouchersc_time:time,
                recordingvouchersc_count:2,
                recordingvouchersc_type:100,//银行账号金额调整
                recordingvouchersc_user_id:user.user_id
            });

            // ****************（贷）****************
            await tb_recordingvoucherdetailsc.create({
                domain_id:user.domain_id,
                recordingvouchersc_id:addRecordingvouchersc.recordingvouchersc_id,
                recordingvoucherdetailsc_digest:'银行账号金额调整',//  摘要
                recordingvoucherdetailsc_accsum:'银行存款',//   总账科目
                recordingvoucherdetailsc_activeAccount: import_bank.companybankno_bank_no,//  科目明细
                recordingvoucherdetailsc_debite:`${(doc.adjust_money || 0)}`,//借方金额
                recordingvoucherdetailsc_credit:0,//贷方金额
                recordingvoucherdetailsc_type:'1',//0贷，1借
                recordingvoucherdetailsc_GLtype:0,   // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                recordingvoucherdetailsc_depart_id:department.department_id//部门
            },{
                transaction: t
            });

            // ****************（借）****************
            await tb_recordingvoucherdetailsc.create({
                domain_id:user.domain_id,
                recordingvouchersc_id:addRecordingvouchersc.recordingvouchersc_id,
                recordingvoucherdetailsc_digest:'银行账号金额调整',//  摘要
                recordingvoucherdetailsc_accsum:'银行存款',//   总账科目
                recordingvoucherdetailsc_activeAccount:export_bank.companybankno_bank_no,//  科目明细
                recordingvoucherdetailsc_debite: '0',//借方金额
                recordingvoucherdetailsc_credit: `${doc.adjust_money || 0}`,
                recordingvoucherdetailsc_type:'0',//0贷，1借
                recordingvoucherdetailsc_GLtype:0,   // 0资产类科目总账，1负债类，2权益类，3收入类，4费用类
                recordingvoucherdetailsc_depart_id:department.department_id//部门
            },{
                transaction: t
            });

            //添加转账log
            await tb_adjustdetail.create({
                domain_id: user.domain_id,
                export_bank_no: doc.export_bank_no,
                import_bank_no: doc.import_bank_no,
                adjust_money: (doc.adjust_money || 0) * 100,
                operator_id: user.user_id
            },{
                transaction: t
            });
        });

        common.sendData(res, '修改成功！');
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function getAdjustDetail(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let replacements = [], returnData = {};

        let queryStr = `select ad.*, u.name, cb1.companybankno_bank_no as export_bank_no, cb2.companybankno_bank_no as import_bank_no
            from tbl_erc_adjustdetail  ad 
            left join tbl_common_user u on ad.operator_id = u.user_id
            left join tbl_erc_companybankno cb1 on ad.export_bank_no = cb1.companybankno_id
            left join tbl_erc_companybankno cb2 on ad.import_bank_no = cb2.companybankno_id
            where ad.domain_id = ?`
        replacements.push(user.domain_id);
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at.Format("yyyy-MM-dd");
            result.adjust_money = (result.adjust_money || 0) / 100;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
