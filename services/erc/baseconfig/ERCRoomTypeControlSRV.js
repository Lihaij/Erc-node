const fs = require('fs');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCRoomTypeControlSRV');
const model = require('../../../model');
const kujialeSRV = require('../../openapi/KujialeSRV');

const sequelize = model.sequelize;
const tb_roomtype = model.erc_roomtype;
const tb_estate = model.erc_estate;

exports.ERCRoomTypeControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initMat(req, res)
    } else if (method === 'search') {
        searchRoomType(req, res);
    } else if (method === 'add') {
        addRoomType(req, res)
    } else if (method === 'delete') {
        deleteroomType(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'sync') {
        syncAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};
async function initMat(req, res) {
    let returnData = {};
    returnData.roomType = GLBConfig.HTYPEINFO; //户型
    common.sendData(res, returnData)
}
//查询户型信息
async function searchRoomType(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let replacements = [];

        let queryStr = 'select * from tbl_erc_roomtype where state=1';
        if (doc.estateId) {
            queryStr += ' and estate_id=?';
            replacements.push(doc.estateId)
        }

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
//新增户型信息
async function addRoomType(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let replacements = [];


        let roomType = await tb_roomtype.findOne({
            where: {
                estate_id: doc.estate_id,
                roomtype_name: doc.roomtype_name
            }
        });

        if (roomType) {
            common.sendError(res, 'roomtype_01');
            return
        }

        let addRoomType = await tb_roomtype.create({
            estate_id: doc.estate_id,
            roomtype_name: doc.roomtype_name,
            roomtype_spec_name: doc.roomtype_spec_name,
            roomtype_srcage: doc.roomtype_srcage,
            roomtype_area: doc.roomtype_area,
            roomtype_plan_pic: doc.roomtype_plan_pic,
            roomtype_room_count: doc.roomtype_room_count,
        });

        common.sendData(res, addRoomType);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//删除户型信息
async function deleteroomType(req, res) {
    try {
        let doc = common.docTrim(req.body);

        let delRoomType = await tb_roomtype.findOne({
            where: {
                roomtype_id: doc.roomtype_id,
                state: GLBConfig.ENABLE
            }
        });

        if (delRoomType) {
            delRoomType.state = GLBConfig.DISABLE;
            await delRoomType.save();
            common.sendData(res);
            return
        } else {
            common.sendError(res, 'roomtype_02');
            return
        }
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//修改户型信息
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            replacements = [];

        let roomTypeAdd = await tb_roomtype.findOne({
            where: {
                roomtype_id: doc.roomtype_id
            }
        });

        if (roomTypeAdd) {
            roomTypeAdd.roomtype_name = doc.roomtype_name;
            roomTypeAdd.roomtype_spec_name = doc.roomtype_spec_name;
            roomTypeAdd.roomtype_srcage = doc.roomtype_srcage;
            roomTypeAdd.roomtype_area = doc.roomtype_area;
            roomTypeAdd.roomtype_room_count = doc.roomtype_room_count;

            await roomTypeAdd.save()
        } else {
            return common.sendError(res, 'materiel_01');

        }
        common.sendData(res, roomTypeAdd);
    } catch (error) {
        return common.sendFault(res, error);
    }
}

//酷家乐同步信息
async function syncAct(req, res) {
    try {
        let doc = common.docTrim(req.body)

        let estate = await tb_estate.findOne({
            where: {
                estate_id: doc.estate_id
            }
        });

        let rooms = await tb_roomtype.findAll({
            where: {
                estate_id: doc.estate_id
            }
        });

        let standards = await kujialeSRV.getStandards(estate.province, estate.city, estate.estate_name)
        for (let s of standards) {
            let addFlag = true
            for (let r of rooms) {
                if (s.planId === r.roomtype_kjl_planid) {
                    addFlag = false
                    break
                }
            }
            if (addFlag) {
                await tb_roomtype.create({
                    estate_id: estate.estate_id,
                    roomtype_name: s.name,
                    roomtype_spec_name: s.specName,
                    roomtype_srcage: s.srcArea,
                    roomtype_area: s.area,
                    roomtype_plan_pic: s.planPic,
                    roomtype_room_count: s.room_count,
                    roomtype_kjl_planid: s.planId
                });
            }
        }

        common.sendData(res);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
