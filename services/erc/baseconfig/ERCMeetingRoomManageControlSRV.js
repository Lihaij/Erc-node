/**
 * Created by shuang.liu on 18/4/4.
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCMeetingRoomManageControlSRV');
const model = require('../../../model');

const sequelize = model.sequelize;
const tb_user = model.common_user;
const tb_meetingroom = model.erc_meetingroom;
const tb_meetingroomequipment = model.erc_meetingroomequipment;
const tb_common_apidomain = model.common_apidomain

//行政办公管理->会议室数据列表
exports.ERCMeetingRoomManageControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search_r') {
        searchRoomAct(req, res)
    } else if (method === 'add_r') {
        addRoomAct(req, res)
    } else if (method === 'modify_r') {
        modifyRoomAct(req, res)
    } else if (method === 'delete_r') {
        deleteRoomAct(req, res)
    } else if (method === 'search_e') {
        searchEquipmentAct(req, res)
    } else if (method === 'add_e') {
        addEquipmentAct(req, res)
    } else if (method === 'delete_e') {
        deleteEquipmentAct(req, res)
    } else if (method === 'changeGroup') {
        changeGroupAct(req, res)
    } else if (method==='getMeeting'){
        getMeetingAct(req,res)
    } else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};

        returnData.userInfo = req.user;
        returnData.AssetsClassification = GLBConfig.ASSETSCLASSIFICATION;
            common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//查询会议室数据列表
async function searchRoomAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements =[user.domain_id];
        let queryStr='select t.* , ut.name as meetinguser_name,ut2.name as equipmentuser_name from tbl_erc_meetingroom t ' +
            'left join tbl_common_user ut on t.meetinguser_id = ut.user_id ' +
            'left join tbl_common_user ut2 on t.equipmentuser_id = ut2.user_id ' +
            'where t.state=1 and t.domain_id=?';
        if (doc.search_text) {
            queryStr += ' and (t.meetingroom_id like ? or t.meetingroom_name like ? )';
            let search_text = '%' + doc.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text)
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
//新增会议室
async function addRoomAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let ARoom = await tb_meetingroom.findOne({
            where: {
                domain_id: user.domain_id,
                meetingroom_name: doc.meetingroom_name,
                state: 1
            }
        });
        if (ARoom) {
            common.sendError(res, 'meetingroom_02');
            return
        } else {
            let meetingroom_id = await Sequence.genMeetingRoomID();
            let addRoom = await tb_meetingroom.create({
                meetingroom_id: meetingroom_id,
                domain_id: user.domain_id,
                meetingroom_name:doc.meetingroom_name,
                meetinguser_id: doc.meetinguser_id,
                equipmentuser_id: doc.equipmentuser_id
            });
            common.sendData(res, addRoom)
        }
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//修改会议室
async function modifyRoomAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modRoom = await tb_meetingroom.findOne({
            where: {
                meetingroom_id: doc.meetingroom_id
            }
        });
        if (modRoom) {
            modRoom.meetingroom_name = doc.meetingroom_name;
            modRoom.meetinguser_id = doc.meetinguser_id;
            modRoom.equipmentuser_id = doc.equipmentuser_id;
            await modRoom.save();

            common.sendData(res, modRoom);
        } else {
            common.sendError(res, 'meetingroom_01');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}
//删除会议室
async function deleteRoomAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modRoom = await tb_meetingroom.findOne({
            where: {
                meetingroom_id: doc.meetingroom_id
            }
        });
        if (modRoom) {
            modRoom.state = GLBConfig.DISABLE;
            await modRoom.save();

            common.sendData(res, modRoom);
        } else {
            common.sendError(res, 'meetingroom_01');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//查询设备
async function searchEquipmentAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let replacements =[doc.meetingroom_id];
        let queryStr='select t.* from tbl_erc_meetingroomequipment t ' +
            'where t.state=1 and t.meetingroom_id=?';

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
//新增设备
async function addEquipmentAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        for(let d of doc){
            let roomInfo = await tb_meetingroom.findOne({
                where: {
                    meetingroom_id: d.meetingroom_id
                }
            });

            if(roomInfo){
                let meetingroomequipment = await tb_meetingroomequipment.findOne({
                    where: {
                        // meetingroom_id: d.meetingroom_id,
                        equipment_name: d.equipment_name,
                        assets_id:d.assets_id,
                        domain_id:user.domain_id,
                        state: 1
                    }
                });
                if (meetingroomequipment) {
                    common.sendError(res, 'meetingEquipment_02');
                    return
                } else {
                    meetingroomequipment = await tb_meetingroomequipment.create({
                        meetingroom_id: d.meetingroom_id,
                        equipment_name: d.equipment_name,
                        equipment_unit:d.equipment_unit,
                        assets_id:d.assets_id,
                        domain_id:user.domain_id,
                        equipment_num: 0
                    });
                }
                common.sendData(res, meetingroomequipment)
            }else{
                common.sendError(res, 'meetingroom_01');
                return
            }

        }

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//删除设备
async function deleteEquipmentAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modEquipment = await tb_meetingroomequipment.findOne({
            where: {
                meetingroomequipment_id: doc.meetingroomequipment_id
            }
        });
        if (modEquipment) {
            modEquipment.state = GLBConfig.DISABLE;
            await modEquipment.save();

            common.sendData(res, modEquipment);
        } else {
            common.sendError(res, 'meetingEquipment_01');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//获得用户组信息
async function changeGroupAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

            let u =doc.users[0]

            let meeting = await tb_user.findOne({
                where: {
                    domain_id: u.domain_id,
                    user_id: u.user_id
                }
            });
            returnData.meetingId=meeting.user_id;
            returnData.meetingName=meeting.name;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//获得会议室详情
async function getMeetingAct(req,res){
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};
        let replacements =[user.domain_id];
        let queryStr='';

        if(doc.assets_type==1){
            //固定资产
            queryStr=`select * from tbl_erc_fixedassetscheckdetail t,tbl_erc_fixedassetscheck tt 
            where t.fixedassetscheck_id = tt.fixedassetscheck_id and tt.check_state=3 and tt.state=1 
            and t.state=1 and t.scrap_flag=1 and tt.domain_id = ? `;
            // queryStr += ' order by t.created_at';
            if (doc.searchMeetingName) {
                queryStr += ' and (t.fixedassets_no like ? or t.fixedassets_name like ?)';
                replacements.push('%' + doc.searchMeetingName + '%');
                replacements.push('%' + doc.searchMeetingName + '%');
            }
        }else {
            //低值易耗品
            queryStr=`select * from tbl_erc_consumablesdetail c 
            where c.state=1 and c.scrap_flag=1 and c.consumables_detail_type_id = 2 
            and c.consumables_detail_status = 3 and c.domain_id = ? `;
            // queryStr += ' order by t.created_at';
            if (doc.searchMeetingName) {
                queryStr += ' and (c.consumables_detail_code like ? or c.consumables_name like ?)';
                replacements.push('%' + doc.searchMeetingName + '%');
                replacements.push('%' + doc.searchMeetingName + '%');
            }
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    }catch (error){
        common.sendFault(res, error);
        return;
    }
}