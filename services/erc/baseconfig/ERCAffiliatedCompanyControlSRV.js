const fs = require('fs');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('GroupControlSRV');
const model = require('../../../model');

const FDomain = require('../../../bl/common/FunctionDomainBL');
// tables
const sequelize = model.sequelize;
const tb_common_domain = model.common_domain;
const tb_common_apidomain = model.common_apidomain;
const tb_affiliated_company = model.erc_affiliated_company;

exports.ERCAffiliatedCompanyControlSRVResource = async (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        await initAct(req, res);
    } else if (method === 'search') {
        await searchAct(req, res)
    } else if (method === 'addCompany') {
        await addCompany(req, res)
    } else if (method === 'modifyCompany') {
        await modifyCompany(req, res)
    } else if (method === 'deleteCompany') {
        await deleteCompany(req, res)
    } else if (method === 'close') {
        await close(req, res)
    } else if (method === 'open') {
        await open(req, res)
    } else {
        common.sendError(res, 'common_01');
    }
};

async function initAct(req, res) {
    let returnData = {},
        user = req.user;

    await FDomain.getDomainListInit(req, returnData);
    returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'); //单位

    common.sendData(res, returnData)
}
//查询附属公司列表
async function searchAct(req, res) {
    try {
        const { body, user } = req;
        const { domain_id } = user;
        const replacements = [domain_id];

        let queryStr =
            `select * from tbl_erc_affiliated_company where domain_id = ?`;

        if (body.search_text) {
            queryStr += ` and (organizational_code like ? or company_name like ? or corporate_representative like ?)`;
            replacements.push(`%${body.search_text}%`);
            replacements.push(`%${body.search_text}%`);
            replacements.push(`%${body.search_text}%`);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        common.sendData(res, {total: result.count, rows: result.data});
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function addCompany(req, res) {
    try {
        const { body, user } = req;
        const { domain_id } = user;
        const { organizational_code, company_name, company_address, corporate_representative } = body;

        const result = await tb_affiliated_company.create({
            domain_id,
            organizational_code,
            company_name,
            company_address,
            corporate_representative
        });
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function modifyCompany(req, res) {
    try {
        const { body } = req;
        const { affiliated_company_id, organizational_code, company_name, company_address, corporate_representative } = body.new;

        const result = await tb_affiliated_company.findOne({
            where: {
                affiliated_company_id
            }
        });

        if (result) {
            result.organizational_code = organizational_code;
            result.company_name = company_name;
            result.company_address = company_address;
            result.corporate_representative = corporate_representative;
            await result.save();
        }

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function deleteCompany(req, res) {
    try {
        const { body } = req;
        const { affiliated_company_id } = body;

        const result = await tb_affiliated_company.findOne({
            where: {
                affiliated_company_id
            }
        });

        if (result) {
            result.state = GLBConfig.DISABLE;
            await result.save();
        }

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//关闭附属公司
async function close(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user
        let supplier = await tb_common_apidomain.findOne({
            where: {
                domain_id: doc.domain_id,
                follow_domain_id: doc.follow_domain_id,
            }
        })
        if (supplier) {
            supplier.state = GLBConfig.DISABLE
            await supplier.save();
            common.sendData(res, supplier)
        } else {
            common.sendError(res, 'group_02')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}
//开启附属公司
async function open(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user
        let supplier = await tb_common_apidomain.findOne({
            where: {
                domain_id: doc.domain_id,
                follow_domain_id: doc.follow_domain_id,
            }
        })
        if (supplier) {
            supplier.state = GLBConfig.ENABLE
            await supplier.save();
            common.sendData(res, supplier)
        } else {
            common.sendError(res, 'group_02')
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}


