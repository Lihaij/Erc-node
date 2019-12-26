/**
 * Created by shuang.liu on 18/4/8.
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCVehicleManageControlSRV');
const model = require('../../../model');

const sequelize = model.sequelize;
const tb_user = model.common_user;
const tb_vehicle = model.erc_vehicle;
const tb_fixedassetscheckdetail = model.erc_fixedassetscheckdetail;

exports.ERCVehicleManageControlResource = (req, res) => {
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
    } else if (method === 'changeGroup') {
        changeGroupAct(req, res)
    } else if (method === 'getFixedAssetsCheckDetail') {
        getFixedAssetsCheckDetail(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        returnData.vehicleStatus = GLBConfig.VEHICLESTATUS; //使用状态
        returnData.vehicleType = GLBConfig.VEHICLETYPE;
        returnData.userInfo = req.user;
        returnData.vehicleStatusFlag = GLBConfig.VEHICLESTATUSFLAG; //状态变更类型
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//查询车辆信息
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements = [user.domain_id];
        let queryStr = 'select t.* , ut.name as admin_user_name,fd.fixedassets_name,fd.fixedassets_no from tbl_erc_vehicle t ' +
            'left join tbl_common_user ut on t.admin_user_id = ut.user_id ' +
            'left join tbl_erc_fixedassetscheckdetail fd on (t.fixedassetscheckdetail_id = fd.fixedassetscheckdetail_id and fd.state=1)' +
            'where t.state=1 and t.domain_id=?';
        if (doc.search_text) {
            queryStr += ' and (t.license_plate_num like ? or t.vehicle_brand like ? )';
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text)
        }
        if (doc.vehicle_type) {
            queryStr += ' and t.vehicle_type = ? ';
            replacements.push(doc.vehicle_type);
        }
        if (doc.vehicle_status) {
            queryStr += ' and t.vehicle_status = ? ';
            replacements.push(doc.vehicle_status);
        }
        queryStr += ' order by t.created_at';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = result.data;


        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//新增车辆
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let addVehicle = await tb_vehicle.create({
            domain_id: user.domain_id,
            license_plate_num: doc.license_plate_num,
            vehicle_brand: doc.vehicle_brand,
            vehicle_type: doc.vehicle_type,
            admin_user_id: doc.admin_user_id,
            fixedassetscheckdetail_id:doc.fixedassetscheckdetail_id
        });

        common.sendData(res, addVehicle)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//修改车辆
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modVehicle = await tb_vehicle.findOne({
            where: {
                vehicle_id: doc.vehicle_id
            }
        });
        if (modVehicle) {
            modVehicle.license_plate_num = doc.license_plate_num;
            modVehicle.vehicle_brand = doc.vehicle_brand;
            modVehicle.vehicle_type = doc.vehicle_type;
            modVehicle.vehicle_status = doc.vehicle_status;
            modVehicle.vehicle_status_flage = GLBConfig.VEHICLESTATUSFLAG[0].value;
            modVehicle.admin_user_id = doc.admin_user_id;
            await modVehicle.save();

            common.sendData(res, modVehicle);
        } else {
            common.sendError(res, 'vehicle_01');
            return
        }
    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}
//删除车辆
async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modVehicle = await tb_vehicle.findOne({
            where: {
                vehicle_id: doc.vehicle_id
            }
        });
        if (modVehicle) {
            let useVehicle = await tb_vehicle.findOne({
                where: {
                    vehicle_status: 0
                }
            });
            if (useVehicle) {
                modVehicle.state = GLBConfig.DISABLE;
                await modVehicle.save();

                common.sendData(res, modVehicle);
            } else {
                common.sendError(res, 'vehicle_02');
            }

        } else {
            common.sendError(res, 'vehicle_01');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}

async function changeGroupAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};
        let u = doc.users[0]

        let meeting = await tb_user.findOne({
            where: {
                domain_id: u.domain_id,
                user_id: u.user_id
            }
        });

        returnData.meetingId = meeting.user_id;
        returnData.meetingName = meeting.name;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function getFixedAssetsCheckDetail(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        let queryStr = `select d.* from tbl_erc_fixedassetscheckdetail d
            left join tbl_erc_fixedassetscheck c on (d.fixedassetscheck_id = c.fixedassetscheck_id and c.state=1 )
            where c.domain_id = ? and d.fixedassets_category in (2,4)`
        let result = await sequelize.query(queryStr, {
            replacements: [user.domain_id],
            type: sequelize.QueryTypes.SELECT
        });
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}