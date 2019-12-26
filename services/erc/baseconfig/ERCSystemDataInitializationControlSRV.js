const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCSystemDataInitializationControlSRV');
const model = require('../../../model');
const moment = require('moment');
const ERCAccountingControlSRV = require('../cashiermanage/ERCAccountingControlSRV')

const sequelize = model.sequelize;
const tb_user = model.common_user;
const tb_basetype = model.erc_basetype;
const tb_basetypedetail = model.erc_basetypedetail;

exports.ERCSystemDataInitializationControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'delete') {
        deleteAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let replacements = [];
        let user = req.user;

        let queryStr = 'select t.basetype_code as id,t.basetype_code as value,t.basetype_name as text' +
            ' from tbl_erc_basetype t where state=1 and basetype_id >= 100';

        let queryRst = await sequelize.query(queryStr, {
            replacements: [],
            type: sequelize.QueryTypes.SELECT,
            state: GLBConfig.ENABLE
        });

        returnData.baseTypeName = queryRst;


        queryStr = `select d.basetypedetail_id as id,d.basetypedetail_id as value,d.typedetail_name as text
             from tbl_erc_basetype t,tbl_erc_basetypedetail d 
             where t.state=1 and d.state=1 and 
             t.basetype_id=d.basetype_id
             and t.basetype_id = 39`;

        let FYLKMLX = await sequelize.query(queryStr, {
            replacements: [],
            type: sequelize.QueryTypes.SELECT,
            state: GLBConfig.ENABLE
        });
        returnData.FYLKMLX = FYLKMLX;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//查询基础数据类型
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements = [user.domain_id];
        /*let queryStr='select t.*,rt.basetype_code,rt.basetype_name from tbl_erc_basetypedetail t ' +
            'left join tbl_erc_basetype rt on t.basetype_id = rt.basetype_id ' +
            'where t.state=1 and t.domain_id=? ';*/
        let queryStr =
            `select t.*, rt.basetype_code, rt.basetype_name
                from tbl_erc_basetypedetail t
                left join tbl_erc_basetype rt
                on t.basetype_id = rt.basetype_id
                where t.state = 1 and t.domain_id = ? and rt.basetype_id>=100`;
        if (doc.search_text) {
            queryStr += ' and rt.basetype_name like ? ';
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
        }
        if (doc.basetype_code) {
            queryStr += ' and rt.basetype_code like ? ';
            let basetype_code = '%' + doc.basetype_code + '%';
            replacements.push(basetype_code);
        }

        queryStr += ' order by rt.basetype_code ';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//新增基础数据类型
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let basetype = await tb_basetype.findOne({
            where: {
                basetype_code: doc.basetype_code,
                state: 1
            }
        });

        if (basetype) {
            let basetypedetail = await tb_basetypedetail.findOne({
                where: {
                    basetype_id: basetype.basetype_id,
                    typedetail_name: doc.typedetail_name,
                    domain_id: user.domain_id,
                    state: 1
                }
            });
            let typedetailNo = await tb_basetypedetail.findOne({
                where: {
                    basetype_id: basetype.basetype_id,
                    domain_id: user.domain_id,
                    typedetail_no: doc.typedetail_no,
                    state: 1
                }
            });
            if (!basetypedetail) {
                if (!typedetailNo) {
                    let basetypedetail = await tb_basetypedetail.create({
                        basetype_id: basetype.basetype_id,
                        typedetail_no: doc.typedetail_no,
                        domain_id: user.domain_id,
                        typedetail_code: basetype.basetype_code + ':' + doc.typedetail_name,
                        typedetail_name: doc.typedetail_name,
                        other_type: doc.other_type

                    });

                    common.sendData(res, basetypedetail)
                } else {
                    common.sendError(res, 'base_04');
                    return
                }
            } else {
                common.sendError(res, 'base_01');
                return
            }
        } else {
            common.sendError(res, 'base_02');
            return
        }

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//修改基础数据类型
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let basetype = await tb_basetype.findOne({
            where: {
                basetype_code: doc.old.basetype_code,
                state: 1
            }
        });

        if (basetype) {
            let basetypedetail = await tb_basetypedetail.findOne({
                where: {
                    basetypedetail_id: doc.old.basetypedetail_id,
                    domain_id: user.domain_id,
                    state: 1
                }
            });
            if (basetypedetail) {
                basetypedetail.typedetail_no = doc.new.typedetail_no;
                basetypedetail.typedetail_name = doc.new.typedetail_name;
                basetypedetail.typedetail_code = basetype.basetype_code + ':' + doc.new.typedetail_name;
                basetypedetail.other_type = doc.new.other_type;

                await basetypedetail.save();

                common.sendData(res, basetypedetail);
            } else {
                common.sendError(res, 'base_01');
                return
            }
        } else {
            common.sendError(res, 'base_02');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}
//删除基础数据类型
async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let basetypedetail = await tb_basetypedetail.findOne({
            where: {
                basetypedetail_id: doc.basetypedetail_id,
                domain_id: user.domain_id,
                state: 1
            }
        });
        if (basetypedetail) {
            basetypedetail.state = GLBConfig.DISABLE;
            await basetypedetail.save();

            common.sendData(res, basetypedetail);
        } else {
            common.sendError(res, 'base_03');
            return
        }
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}