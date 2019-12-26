/**
 * Created by shuang.liu on 18/9/27.
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCPointTypeControlSRV');
const model = require('../../../model');

const sequelize = model.sequelize;
const tb_user = model.user;
const tb_pointtype = model.erc_pointtype;

exports.ERCPointTypeControlResource = (req, res) => {
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
        let returnData = {};
        let replacements =[];
        let queryStr='select t.* from tbl_erc_pointtype t where t.state=1';
        if (doc.search_text){
            queryStr += ' and t.customerpoint_name like ? ';
            let search_text = '%'+doc.search_text+'%';
            replacements.push(search_text);
        }
        queryStr += ' order by t.pointtype_id';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//修改积分类型
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modPointType = await tb_pointtype.findOne({
            where: {
                pointtype_id: doc.old.pointtype_id
            }
        });
        if (modPointType) {
            modPointType.base_point = doc.new.base_point;
            modPointType.pointtype_remarks = doc.new.pointtype_remarks;

            await modPointType.save();
            common.sendData(res, modPointType);
        } else {
            common.sendError(res, 'point_01');
            return
        }
    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}


