/**
 * Created by shuang.liu on 18/4/8.
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCMeetingManageControlSRV');
const model = require('../../../model');
const moment = require('moment');

const sequelize = model.sequelize;
const tb_meeting = model.erc_meeting;
const tb_meetingequipment = model.erc_meetingequipment;
const tb_meetingattendee = model.erc_meetingattendee;
const tb_task = model.erc_task;
const tb_user = model.common_user;
const tb_usergroup = model.common_usergroup;
const tb_meetingroom = model.erc_meetingroom;
const tb_meetingroomequipment = model.erc_meetingroomequipment;

//行政办公管理->会议列表
exports.ERCMeetingManageControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search_m') {
        searchMeetingAct(req, res)
    } else if (method === 'add_m') {
        addMeetingAct(req, res)
    } else if (method === 'modify_m') {
        modifyMeetingAct(req, res)
    } else if (method === 'delete_m') {
        deleteMeetingAct(req, res)
    } else if (method === 'init_e') {
        initEquipmentAct(req, res);
    } else if (method === 'search_e') {
        searchEquipmentAct(req, res)
    } else if (method === 'add_e') {
        addEquipmentAct(req, res)
    } else if (method === 'delete_e') {
        deleteEquipmentAct(req, res)
    } else if (method === 'search_a') {
        searchAttendeeAct(req, res)
    } else if (method === 'add_a') {
        addAttendeeAct(req, res)
    } else if (method === 'delete_a') {
        deleteAttendeeAct(req, res)
    } else if (method === 'submit') {
        submitAct(req, res)
    } else if (method === 'changeGroup') {
        changeGroupAct(req, res)
    } else if (method === 'search_d') {
        searchDetailAct(req, res)
    } else if (method === 'search_u') {//单位联动列表
        searchUnitAct(req, res)
    } else if (method === 'search_ds') {
        searchDetailStateAct(req, res)
    } else if (method === 'forTest') {
        forTest(req, res)
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

        let queryStr = 'select t.meetingroom_id as id,t.meetingroom_name as text' +
            ' from tbl_erc_meetingroom t where t.domain_id=? and state=1';
        replacements.push(user.domain_id);

        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT,
            state: GLBConfig.ENABLE
        });
        //会议地点
        returnData.meetingroomList=queryRst;
        returnData.userInfo = req.user;
        returnData.stateInfo = GLBConfig.PURCHASEAPPLYSTATE;
        returnData.meetingroomInfo = GLBConfig.MEETINGROOMSTATE;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//查询会议列表
async function searchMeetingAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements =[user.domain_id];
        let queryStr='select t.*,rt.meetingroom_name,ut.`name` as host_name from tbl_erc_meeting t ' +
            'left join tbl_erc_meetingroom rt on t.meetingroom_id = rt.meetingroom_id ' +
            'left join tbl_common_user ut on t.host_id = ut.user_id ' +
            'where t.state=1 and t.domain_id=? ';
        if (doc.search_text){
            queryStr += ' and (t.meeting_name like ? or rt.meetingroom_name like ?) ';
            let search_text = '%'+doc.search_text+'%';
            replacements.push(search_text);
            replacements.push(search_text);
        }
        if (doc.start_time) {
            queryStr += ` and t.start_time >= ? and t.start_time <= ? `;
            replacements.push(doc.start_time + ` 00:00:00`);
            replacements.push(doc.start_time + ` 23:59:59`);
        }
        // if(doc.meeting_state){
        //     //meeting_state:会议状态，多个用,分隔
        //     queryStr += ' and FIND_IN_SET (t.meeting_state,?) '
        // }
        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.start_time = r.start_time ? moment(r.start_time).format("YYYY-MM-DD HH:mm") : null;
            result.end_time = r.end_time ? moment(r.end_time).format("YYYY-MM-DD HH:mm") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//新增会议列表
async function addMeetingAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let Meeting = await tb_meetingroom.findOne({
            where: {
                meetingroom_id: doc.meetingroom_id,
                domain_id: user.domain_id,
                state: 1
            }
        });

        let replacements =[];
        let queryStr = 'select * from tbl_erc_meeting t where t.meetingroom_id=? ' +
            'and ((t.start_time<=? and t.end_time>=?) or (t.start_time<=? and t.end_time>=?)) ' +
            'and t.state=?';
        replacements.push(doc.meetingroom_id);
        replacements.push(doc.start_time);
        replacements.push(doc.start_time);
        replacements.push(doc.end_time);
        replacements.push(doc.end_time);
        replacements.push(GLBConfig.ENABLE);

        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT,
            state: GLBConfig.ENABLE
        });

        if(queryRst.length==0){
            let addMeeting = await tb_meeting.create({
                domain_id: user.domain_id,
                user_id: user.user_id,
                meeting_name:doc.meeting_name,
                meetinguser_id:Meeting.meetinguser_id,
                equipmentuser_id:Meeting.equipmentuser_id,
                start_time: doc.start_time,
                end_time: doc.end_time,
                meetingroom_id:doc.meetingroom_id,
                host_id: doc.host_id
            });
            common.sendData(res, addMeeting)
        }else {
            common.sendError(res, 'meeting_04');
            return
        }

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//修改会议信息
async function modifyMeetingAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modMeeting = await tb_meeting.findOne({
            where: {
                meeting_id: doc.meeting_id
            }
        });
        if (modMeeting) {
            modMeeting.meeting_name = doc.meeting_name;
            modMeeting.start_time = doc.start_time;
            modMeeting.end_time = doc.end_time;
            modMeeting.meetingroom_id = doc.meetingroom_id;
            modMeeting.meetinguser_id = doc.meetinguser_id;
            modMeeting.equipmentuser_id = doc.equipmentuser_id;
            modMeeting.host_id = doc.host_id;

            await modMeeting.save();

            common.sendData(res, modMeeting);
        } else {
            common.sendError(res, 'meeting_01');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}
//删除会议信息
async function deleteMeetingAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modMeeting = await tb_meeting.findOne({
            where: {
                meeting_id: doc.meeting_id
            }
        });
        if (modMeeting.meeting_remark_state == 1 || modMeeting.meeting_state == 1) {
            common.sendError(res, 'meetingroom_03');
            return
        } else {
            if (modMeeting) {
                modMeeting.state = GLBConfig.DISABLE;
                await modMeeting.save();

                common.sendData(res, modMeeting);
            } else {
                common.sendError(res, 'meeting_01');
                return
            }
        }
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//初始化设备名称
async function initEquipmentAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let replacements = [];
        let user = req.user;

        let queryStr = 'select t.meetingroomequipment_id as id,t.equipment_name as text from tbl_erc_meetingroomequipment t where t.state=1 and t.meetingroom_id=?';
        replacements.push(doc.meetingroom_id);

        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT,
            state: GLBConfig.ENABLE
        });
        //可添加设备列表
        returnData.equipmentList=queryRst;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//查询设备名称
async function searchEquipmentAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let replacements =[];
        let queryStr='select t.*,et.equipment_name,et.equipment_unit from tbl_erc_meetingequipment t ' +
            'left join tbl_erc_meetingroomequipment et on t.meetingroomequipment_id = et.meetingroomequipment_id ' +
            'where t.meeting_id=? and t.state=? ';
        queryStr += ' order by t.created_at desc';
        replacements.push(doc.meeting_id);
        replacements.push(GLBConfig.ENABLE);

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//增加设备名称
async function addEquipmentAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let meeting = await tb_meeting.findOne({
            where: {
                meeting_id: doc.meeting_id
            }
        });
        let meetingroomequipment = await tb_meetingroomequipment.findOne({
            where: {
                meetingroomequipment_id: doc.meetingroomequipment_id,
                state: 1
            }
        });
        let mt = await tb_meetingequipment.findOne({
            where: {
                meeting_id:doc.meeting_id,
                meetingroomequipment_id: doc.meetingroomequipment_id,
                state: 1
            }
        });
        if (mt) {//有的情况往上加
            if (meetingroomequipment.equipment_num >= Number(mt.equipment_num) + Number(doc.equipment_num)) {
                mt.equipment_num = Number(mt.equipment_num) + Number(doc.equipment_num)
                await mt.save();
                common.sendData(res, mt)
            } else {
                common.sendError(res, 'meeting_03');
                return
            }
        } else{
            if (meetingroomequipment.equipment_num >= doc.equipment_num) {
                if (meeting) {
                    let addMeetingEquipment = await tb_meetingequipment.create({
                        meeting_id:doc.meeting_id,
                        meetingroomequipment_id: doc.meetingroomequipment_id,
                        equipment_num: doc.equipment_num
                    });

                    common.sendData(res, addMeetingEquipment)
                } else {
                    common.sendError(res, 'meeting_01');
                    return
                }
            } else {
                common.sendError(res, 'meeting_02');
                return
            }
        }


    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//删除设备名称
async function deleteEquipmentAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

            let modMeetingEquipment = await tb_meetingequipment.findOne({
                where: {
                    meetingequipment_id: doc.meetingequipment_id
                }
            });
            let modMeeting = await tb_meeting.findOne({
                where: {
                    meeting_id: modMeetingEquipment.meeting_id
                }
            });
            if (modMeeting.meeting_remark_state == 1 || modMeeting.meeting_state == 1) {
                common.sendError(res, 'meetingroom_03');
                return
            } else {
                if (modMeetingEquipment) {
                    modMeetingEquipment.state = GLBConfig.DISABLE;
                    await modMeetingEquipment.save();

                    common.sendData(res, modMeetingEquipment);
                } else {
                    common.sendError(res, 'meetingEquipment_01');
                    return
                }
            }

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//查询参会人员详情
async function searchAttendeeAct(req, res) {
    try {
        const { body } = req;
        const returnData = {};
        const replacements =[];
        /*let queryStr='select t.*,ut.`name`,gt1.usergroup_name as p_usergroup_name,gt2.usergroup_name as usergroup_name ' +
            'from tbl_erc_meetingattendee t ' +
            'left join tbl_common_user ut on t.attendee_id = ut.user_id ' +
            'left join tbl_common_usergroup gt1 on ut.p_usergroup_id = gt1.usergroup_id ' +
            'left join tbl_common_usergroup gt2 on ut.usergroup_id = gt2.usergroup_id ' +
            'where t.meeting_id=? and t.state=? ';
        queryStr += ' order by t.created_at desc';*/

        const queryStr =
            `select
                ma.meetingattendee_id, ma.meeting_id, ma.meetingattendee_state, ma.attendee_id
                , usr.user_id, usr.name
                , dpt.department_name
                , pst.position_name
                from tbl_erc_meetingattendee ma
                left join tbl_common_user usr
                on ma.attendee_id = usr.user_id
                left join tbl_erc_custorgstructure ctt
                on usr.user_id = ctt.user_id
                left join tbl_erc_department dpt
                on ctt.department_id = dpt.department_id
                left join tbl_erc_position pst
                on ctt.position_id = pst.position_id
                where true
                and ma.meeting_id = ?
                and ma.state = ?
                order by ma.created_at desc`;

        replacements.push(body.meeting_id);
        replacements.push(GLBConfig.ENABLE);

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//增加参会人员
async function addAttendeeAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let meeting = await tb_meeting.findOne({
            where: {
                meeting_id: doc.meeting_id
            }
        });

        let ma = await tb_meetingattendee.findOne({
            where: {
                meeting_id: doc.meeting_id,
                attendee_id: doc.attendee_id,
                state: 1
            }
        });

        if (ma) {
            common.sendError(res, 'meeting_05');
            return
        } else {
            if (meeting) {
                let addMeetingAttendee = await tb_meetingattendee.create({
                    meeting_id:doc.meeting_id,
                    attendee_id: doc.attendee_id
                });

                common.sendData(res, addMeetingAttendee)
            } else {
                common.sendError(res, 'meeting_01');
                return
            }
        }


    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//删除参会人员
async function deleteAttendeeAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modMeetingAttendee = await tb_meetingattendee.findOne({
            where: {
                meetingattendee_id: doc.meetingattendee_id
            }
        });
        let modMeeting = await tb_meeting.findOne({
            where: {
                meeting_id: modMeetingAttendee.meeting_id
            }
        });
        if (modMeeting.meeting_remark_state == 1 || modMeeting.meeting_state == 1) {
            common.sendError(res, 'meetingroom_03');
            return
        } else {
            if (modMeetingAttendee) {
                modMeetingAttendee.state = GLBConfig.DISABLE;
                await modMeetingAttendee.save();

                common.sendData(res, modMeetingAttendee);
            } else {
                common.sendError(res, 'meetingAttendee_01');
                return
            }
        }

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//提交会议通知任务
async function submitAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let meeting = await tb_meeting.findOne({
            where: {
                meeting_id: doc.meeting_id
            }
        });
        let MAttendee = await tb_meetingattendee.findAll({
            where: {
                meeting_id: doc.meeting_id
            }
        });
        let Mquipment = await tb_meetingequipment.findAll({
            where: {
                meeting_id: doc.meeting_id
            }
        });
        if (MAttendee.length ==0){
            common.sendError(res, 'meetingAttendee_03');
            return
        }else if (MAttendee.length !=0) {
            if (meeting) {
                meeting.meeting_state = 1;
                //会议状态变为已提交
                await meeting.save();

                let taskName = '会议通知';
                let start_time = meeting.start_time.Format("yyyy-MM-dd hh:mm");
                //meetingroom_name:会议室名称
                let taskDescription = '会议通知: '+'会议时间 '+ start_time +' '+'会议地点 '+doc.meetingroom_name+' '+'会议议题 '+meeting.meeting_name;

                //发通知给会议室管理员
                let taskId1 = await Sequence.genTaskID(user.domain_id);
                let addT1 = await tb_task.create({
                    task_id: taskId1,
                    domain_id: user.domain_id,
                    task_name: '会议通知',
                    task_type: '20',
                    task_priority: '1',
                    task_publisher: user.user_id,
                    task_performer: meeting.meetinguser_id,
                    task_state: '1',
                    task_description: taskDescription,
                    task_review_code: meeting.meeting_id,
                    task_classify: 2
                });

                //给执行人发推送消息
                common.pushNotification('','您收到一条会议通知',{msgFlag: '1'},meeting.meetinguser_id);

                //发通知给会议主持人
                let taskId2 = await Sequence.genTaskID(user.domain_id);
                let addT2 = await tb_task.create({
                    task_id: taskId2,
                    domain_id: user.domain_id,
                    task_name: '会议通知',
                    task_type: '21',
                    task_priority: '1',
                    task_publisher: user.user_id,
                    task_performer: meeting.host_id,
                    task_state: '1',
                    task_description: taskDescription,
                    task_review_code: meeting.meeting_id,
                    task_classify: 2
                });

                //给执行人发推送消息
                common.pushNotification('','您收到一条会议通知',{msgFlag: '1'},meeting.host_id);

                //发通知给会议室设备管理员
                let taskId3 = await Sequence.genTaskID(user.domain_id);
                let addT3 = await tb_task.create({
                    task_id: taskId3,
                    domain_id: user.domain_id,
                    task_name: '会议通知',
                    task_type: '23',
                    task_priority: '1',
                    task_publisher: user.user_id,
                    task_performer: meeting.equipmentuser_id,
                    task_state: '1',
                    task_description: taskDescription,
                    task_review_code: meeting.meeting_id,
                    task_classify: 2
                });

                //给执行人发推送消息
                common.pushNotification('','您收到一条会议通知',{msgFlag: '1'},meeting.equipmentuser_id);

                //参会人员
                let attendees = await tb_meetingattendee.findAll({
                    where: {
                        meeting_id: doc.meeting_id,
                        state: GLBConfig.ENABLE
                    }
                });
                let taskPerformerArr=[];
                let meetingattendeeIdArr=[];
                for (let s of attendees) {
                    taskPerformerArr.push(s.attendee_id);
                    meetingattendeeIdArr.push(s.meetingattendee_id+"");
                }

                //发通知给会议相关人员及管理员
                for(let i=0;i<taskPerformerArr.length;i++){
                    let taskId = await Sequence.genTaskID(user.domain_id);
                    let addT = await tb_task.create({
                        task_id: taskId,
                        domain_id: user.domain_id,
                        task_name: '会议通知',
                        task_type: '18',
                        task_priority: '1',
                        task_publisher: user.user_id,
                        task_performer: taskPerformerArr[i],
                        task_state: '1',
                        task_description: taskDescription,
                        task_review_code: meetingattendeeIdArr[i],
                        task_classify: 2
                    });

                    //给执行人发推送消息
                    common.pushNotification('','您收到一条会议通知',{msgFlag: '1'},meetingattendeeIdArr[i]);
                }

                common.sendData(res, meeting)
            } else {
                common.sendError(res, 'meeting_01');
                return
            }
        }
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//获得用户人员信息
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

        let userGroup = await tb_usergroup.findOne({
            where: {
                domain_id: user.domain_id,
                usergroup_id: meeting.usergroup_id
            }
        });
        if(userGroup.parent_id == 0) {
            return common.sendError(res, 'user_05')
        } else {
            let group = await tb_usergroup.findOne({
                where: {
                    domain_id: u.domain_id,
                    usergroup_id: userGroup.parent_id,
                    usergroup_type: GLBConfig.TYPE_OPERATOR,
                    node_type: GLBConfig.TYPE_ADMINISTRATOR
                }
            });
            returnData.userGroupId=userGroup.usergroup_id;
            returnData.userGroupName=userGroup.usergroup_name;
            returnData.groupId=group.usergroup_id;
            returnData.groupName=group.usergroup_name;
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function searchDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements =[doc.meeting_id];
        let queryStr='select t.*,rt.meetingroom_name,ut.`name` as host_name from tbl_erc_meeting t ' +
            'left join tbl_erc_meetingroom rt on t.meetingroom_id = rt.meetingroom_id ' +
            'left join tbl_common_user ut on t.host_id = ut.user_id ' +
            'where t.state=1 and t.meeting_id=? ';
        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.start_time = r.start_time ? moment(r.start_time).format("YYYY-MM-DD HH:mm") : null;
            result.end_time = r.end_time ? moment(r.end_time).format("YYYY-MM-DD HH:mm") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//单位联动列表
async function searchUnitAct(req, res) {

    let doc = req.body
    let returnData = {};
    let replacements = [];
    let user = req.user;

    try{

        let queryStr = 'select t.meetingroomequipment_id as id,t.equipment_unit as text from tbl_erc_meetingroomequipment t where t.meetingroomequipment_id=?';
        replacements.push(doc.meetingroomequipment_id);

        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT,
            state: GLBConfig.ENABLE
        });
        returnData.groupList=queryRst;

        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return
    }

}
//新增参会人员
async function searchDetailStateAct(req, res) {
    let doc = common.docTrim(req.body);
    let user = req.user;
    let returnData = {};
    try{

        let meeting = await tb_meeting.findOne({
            where: {
                meeting_id: doc.meeting_id,
                state: GLBConfig.ENABLE
            }
        });
        returnData=meeting.meeting_state;
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function forTest(req, res) {
    try {
        const { body } = req;
        const { type } = body;
        switch (type) {
            case 1:
                common.sendData(res, {success: 'world'});
                break;

            case 2:
                common.sendError(res, 'user_05', 'error');
                break;

            case 3:
                common.sendFault(res, {msg: 'wrong'});
                break;

            case 4:
                common.sendErrorDefined(res, {msg: 'wrong'});
                break;
        }
    } catch (error) {
        common.sendErrorDefined(res, error);
    }
}
