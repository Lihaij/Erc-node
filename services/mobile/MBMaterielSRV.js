/**
 * Created by Szane on 17/7/4.
 */
const common = require('../../util/CommonUtil');
const GLBConfig = require('../../util/GLBConfig');
const logger = require('../../util/Logger').createLogger('MBMaterielSRV');
const model = require('../../model');
const Sequence = require('../../util/Sequence');

const sequelize = model.sequelize;
const tb_orderroom = model.erc_orderroom;

exports.MBMaterielResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};
let initAct = async(req, res) => {
    try {
        let returnData = {
            materielType: GLBConfig.MATERIELTYPE
        };
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
let searchAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body),
            returnData = [];

        let rooms = await tb_orderroom.findAll({
            where: {
                order_id: doc.order_id
            }
        });

        for (let r of rooms) {
            let rowData = {}
            rowData.room_id = r.room_id
            rowData.room_name = r.room_name
            let queryStr = `select m.*,om.*,ic.total_count from tbl_erc_ordermateriel om
            left join tbl_erc_materiel m 
            on m.materiel_id = om.materiel_id
            left join (select sum(account_operate_amount) as total_count,materiel_id from tbl_erc_inventoryaccount where order_id=? and account_operate_type = 1 group by materiel_id) as ic
            on (m.materiel_id = ic.materiel_id)
            where m.state = ? and om.state = ? and om.room_id = ? and om.order_id = ? and om.change_flag = 0 `;
            let replacements = [doc.order_id, GLBConfig.ENABLE, GLBConfig.ENABLE, r.room_id, doc.order_id];
            let result = await common.simpleSelect(sequelize, queryStr, replacements);
            rowData.materiel = result
            returnData.push(rowData)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
