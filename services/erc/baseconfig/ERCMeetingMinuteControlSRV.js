/**
 * Created by shuang.liu on 18/4/10.
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCMeetingMinuteControlSRV');
const model = require('../../../model');
const moment = require('moment');

const sequelize = model.sequelize;
const tb_user = model.common_user;
const tb_meeting = model.erc_meeting;
const tb_meetingfollow = model.erc_meetingfollow;
const tb_task = model.erc_task;
const tb_uploadfile = model.erc_uploadfile;

//行政办公管理->会议记录列表
exports.ERCMeetingMinuteControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add_m') {
        addMinuteAct(req, res)
    } else if (method === 'add_f') {
        addFollowAct(req, res)
    } else if (method === 'delete_f') {
        deleteMinuteAct(req, res)
    } else if (method === 'init_e') {
        initEquipmentAct(req, res);
    } else if (method === 'search_e') {
        searchEquipmentAct(req, res)
    } else if (method === 'search_a') {
        searchAttendeeAct(req, res)
    } else if (method === 'changeGroup') {
        changeGroupAct(req, res)
    } else if (method === 'search_f') {
        searchFollowAct(req, res)
    } else if (method === 'submit_m') {
        submitMinuteAct(req, res)
    } else if (method === 'search_d') {
        searchDetailAct(req, res)
    } else if (method === 'upload') {
        uploadAct(req, res)
    } else if (method==='add_fi'){
        addFileAct(req,res)
    } else if (method === 'search_files') {
        searchFilesAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};

        returnData.stateInfo = GLBConfig.PURCHASEAPPLYSTATE;
        returnData.meetingroomInfo = GLBConfig.MEETINGROOMSTATE;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//查询会议记录列表
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements =[user.domain_id];
        let queryStr='select t.*,rt.meetingroom_name,ut.`name` as host_name,ut2.`name` as meeting_remark_username,ut3.`name` as meeting_decision_username from tbl_erc_meeting t ' +
            'left join tbl_erc_meetingroom rt on t.meetingroom_id = rt.meetingroom_id ' +
            'left join tbl_common_user ut on t.host_id = ut.user_id ' +
            'left join tbl_common_user ut2 on t.meeting_remark_user = ut2.user_id ' +
            'left join tbl_common_user ut3 on t.meeting_decision_user = ut3.user_id ' +
            'where t.state=1 and t.domain_id=? and t.meeting_state in (1,2)';
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
//增加会议记录列表
async function addMinuteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let modMeeting = await tb_meeting.findOne({
            where: {
                meeting_id: doc.meeting_id
            }
        });
        if (modMeeting) {
            if(doc.flag==1){
                //增加会议记录
                modMeeting.meeting_remark = doc.meeting_remark;
                modMeeting.meeting_remark_user = user.user_id;
                // modMeeting.meeting_remark_state = 1;

            }else if(doc.flag==2){
                //增加会议决议
                modMeeting.meeting_decision = doc.meeting_decision;
                modMeeting.meeting_decision_user = user.user_id;

            }
            await modMeeting.save();

            common.sendData(res, modMeeting);
        } else {
            common.sendError(res, 'meeting_01');
            return
        }


    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

async function addFollowAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let meeting = await tb_meeting.findOne({
            where: {
                meeting_id: doc.meeting_id
            }
        });
        if (meeting) {
            let addFollow = await tb_meetingfollow.create({
                meeting_id:doc.meeting_id,
                follow_remark: doc.follow_remark,
                executor_id: doc.executor_id,
                checker_id: doc.checker_id,
                finish_date: doc.finish_date
            });

            let taskPerformerArr=[];
            if(doc.executor_id){
                taskPerformerArr.push(doc.executor_id);
            }
            if(doc.checker_id){
                taskPerformerArr.push(doc.checker_id);
            }

            //发通知给跟进事项责任人
            for(let i=0;i<taskPerformerArr.length;i++){
                let taskId = await Sequence.genTaskID(user.domain_id);
                let addT = await tb_task.create({
                    task_id: taskId,
                    domain_id: user.domain_id,
                    task_name: '会议跟进事项',
                    task_type: '19',
                    task_priority: '1',
                    task_publisher: user.user_id,
                    task_performer: taskPerformerArr[i],
                    task_state: '1',
                    task_description: '会议议题：' + meeting.meeting_name+" 会议跟进事项："+doc.follow_remark,
                    task_review_code: addFollow.meetingfollow_id,
                    task_classify: 2
                });

                //给执行人发推送消息
                common.pushNotification('','您收到一条会议通知',{msgFlag: '1'},taskPerformerArr[i]);
            }

            common.sendData(res, addFollow)
        } else {
            common.sendError(res, 'meeting_01');
            return
        }

    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}
//删除会议记录数据
async function deleteMinuteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modMeetingfollow = await tb_meetingfollow.findOne({
            where: {
                meetingfollow_id: doc.meetingfollow_id
            }
        });
        let modMeeting = await tb_meeting.findOne({
            where: {
                meeting_id: modMeetingfollow.meeting_id
            }
        });
        if (modMeeting.meeting_remark_state == 1) {
            common.sendError(res, 'meetingroom_03');
            return
        } else {
            if (modMeetingfollow) {
                modMeetingfollow.state = GLBConfig.DISABLE;
                await modMeetingfollow.save();

                common.sendData(res, modMeetingfollow);
            } else {
                common.sendError(res, 'meetingFollow_01');
                return
            }
        }

    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//初始化设备
async function initEquipmentAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let replacements = [];
        let user = req.user;

        let queryStr = 'select t.meetingroomequipment_id as id,t.equipment_name as text from tbl_erc_meetingroomequipment t where t.meetingroom_id=?';
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
//查询设备列表
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
//查询参会人员详情
async function searchAttendeeAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};
        let replacements =[];
        let queryStr='select t.*,ut.`name`,gt1.usergroup_name as p_usergroup_name,gt2.usergroup_name as usergroup_name ' +
            'from tbl_erc_meetingattendee t ' +
            'left join tbl_common_user ut on t.attendee_id = ut.user_id ' +
            'left join tbl_common_usergroup gt1 on ut.p_usergroup_id = gt1.usergroup_id ' +
            'left join tbl_common_usergroup gt2 on ut.usergroup_id = gt2.usergroup_id ' +
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
//查询文件
async function searchFollowAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements =[doc.meeting_id];
        let queryStr='select t.* , ut.name as executor_name,ut2.name as checker_id_name from tbl_erc_meetingfollow t ' +
            'left join tbl_common_user ut on t.executor_id = ut.user_id ' +
            'left join tbl_common_user ut2 on t.checker_id = ut2.user_id ' +
            'where t.state=1 and t.meeting_id=?';
        queryStr += ' order by t.created_at';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        let sFiles = await tb_uploadfile.findAll({
            where: {
                api_name: common.getApiName(req.path),
                srv_id: doc.meeting_id,
                state: GLBConfig.ENABLE
            }
        }) || [{}];

        returnData.sFiles = [];
        for (let r of sFiles) {
            let result = JSON.parse(JSON.stringify(r));
            result.file_url = doc.host + r.file_url;
            returnData.sFiles.push(result)
        }

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.finish_date = r.finish_date ? moment(r.finish_date).format("YYYY-MM-DD HH:mm") : null;
            returnData.rows.push(result)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
//提交会议记录
async function submitMinuteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modMeeting = await tb_meeting.findOne({
            where: {
                meeting_id: doc.meeting_id
            }
        });
        if (modMeeting) {
            modMeeting.meeting_remark_state = 1;
            await modMeeting.save();

            common.sendData(res, modMeeting);
        } else {
            common.sendError(res, 'meeting_01');
            return
        }


    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//查询会议记录详情
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
//上传附件
async function uploadAct (req, res){
    try {
        let fileInfo = await common.fileSave(req);
        let fileUrl = await common.fileMove(fileInfo.url, 'upload');
        fileInfo.url = fileUrl;
        common.sendData(res, fileInfo)
    } catch (error) {
        common.sendFault(res, error)
        return
    }
}
//增加文件
async function addFileAct(req, res){
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        //附件
        let addFile = await tb_uploadfile.create({
            api_name: common.getApiName(req.path),
            file_name: doc.file_name,
            file_url: doc.file_url,
            file_type: doc.file_type,
            file_visible: '1',
            state: GLBConfig.ENABLE,
            srv_id: doc.meeting_id
        });

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//查询文件
async function searchFilesAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

        let queryStr = `select * from tbl_erc_meeting t where t.state=1 and t.meeting_id=?`;

        let replacements = [doc.meeting_id];
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        let resultData = {
            designs: []
        };
        let api_name = common.getApiName(req.path)
        for (let r of result) {
            let row = JSON.parse(JSON.stringify(r));
            row.files = []
            let ufs = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
                    srv_id: doc.meeting_id,
                    state: GLBConfig.ENABLE
                }
            })
            if (ufs.length !=0) {
                for (let f of ufs) {
                    row.files.push(f)
                }
                resultData.designs.push(row)
            } else {
                // resultData.designs.push(row)
            }
        }
        common.sendData(res, resultData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
