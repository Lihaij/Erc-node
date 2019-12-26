/**
 * Created by shuang.liu on 18/9/27.
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCArchivesBaseControlSRV');
const model = require('../../../model');

const sequelize = model.sequelize;
const tb_user = model.user;
const tb_archivesbase = model.erc_archives_base;

exports.ERCArchivesBaseControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};


        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//获取积分类型
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements = [];
        let queryStr = 'select tbl_erc_archives_base.*, tbl_common_user.name as company_keeper_name, dep_keeper.name as dep_keeper_name' +
            ' from tbl_erc_archives_base' +
            ' left join tbl_common_user on tbl_common_user.user_id = tbl_erc_archives_base.company_user_id' +
            ' left join tbl_common_user dep_keeper on keeper.user_id = tbl_erc_archives_base.keeper' +
            ' where tbl_erc_archives_base.state = 1 and tbl_erc_archives_base.domain_id = ?' +
            ' ';

        replacements.push(user.domain_id);





        queryStr += ' order by tbl_erc_archives_base.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = result.data;

        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//修改档案基本信息
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modArchivesBase = await tb_archivesbase.findOne({
            where: {
                archivesbase_id: doc.old.archivesbase_id
            }
        });
        if (modArchivesBase) {
            modArchivesBase.dep_keeper_id = doc.new.dep_keeper_id;
            modArchivesBase.compay_kepper_id = doc.new.compay_kepper_id;
            modArchivesBase.build_time = doc.new.build_time;
            modArchivesBase.manage_time = doc.new.manage_time;
            await modArchivesBase.save();
            common.sendData(res, modArchivesBase);
        } else {
            common.sendError(res, 'archivesbase_01');
            return
        }
    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}


