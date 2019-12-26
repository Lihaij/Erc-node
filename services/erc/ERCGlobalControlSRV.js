const model = require('../../model');
const common = require('../../util/CommonUtil');

const sequelize = model.sequelize;
const tb_company = model.erc_company;
const tb_accounting_subject = model.erc_accounting_subject;

global.getBaseTypeInfo = async (domain_id, code) => {
    let queryStr =
        `select btd.basetypedetail_id as id, btd.typedetail_name as text,btd.typedetail_no 
         from tbl_erc_basetypedetail btd
         left join tbl_erc_basetype bt
         on btd.basetype_id = bt.basetype_id
         where true
         and btd.state = 1
         and bt.basetype_code = ?`;
    const replacements = [code];
    if (domain_id) {
        queryStr += ` and btd.domain_id = ?`;
        replacements.push(domain_id)
    }
    return await common.simpleSelect(sequelize, queryStr, replacements);
};

global.getCompanyPrecision = async (domain_id) => {
    const result = await tb_company.findOne({
        where: {
            domain_id
        },
        attributes: ['company_precision']
    });

    const { company_precision } = result;
    return company_precision;
};

global.getPrecisionPrice = async (domain_id, value) => {
    const result = await tb_company.findOne({
        where: {
            domain_id
        },
        attributes: ['company_precision']
    });

    if (!result.company_precision) {
        result.company_precision = 2;
        await result.save();
    }

    const { company_precision } = result;
    return Number(value.toFixed(company_precision));
};

global.getAccountingSubject = async ({ code, name, detail, typeName, typeCode } = {}) => {
    try{
        let replacements = []
        let queryStr = `select * from tbl_erc_accounting_subject where state = 1`
        if(code){
            queryStr += ` and accounting_subject_code = ?`
            replacements.push(code)
        }
        if(name){
            queryStr += ` and accounting_subject_name = ?`
            replacements.push(name)
        }
        if(detail){
            queryStr += ` and accounting_subject_detail = ?`
            replacements.push(detail)
        }
        if(typeName){
            queryStr += ` and accounting_subject_type_name = ?`
            replacements.push(typeName)
        }
        if(typeCode){
            queryStr += ` and accounting_subject_type_code = ?`
            replacements.push(typeCode)
        }
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        return result
    }catch(error){
        throw new Error(error)
    }


    // return await tb_accounting_subject.findOne({
    //     where: {
    //         accounting_subject_code: code,
    //         accounting_subject_name: name,
    //         accounting_subject_detail: detail,
    //         accounting_subject_type_name: typeName,
    //         accounting_subject_type_code: typeCode,
    //     }
    // });
};
global.stockmapSafeTemp = []