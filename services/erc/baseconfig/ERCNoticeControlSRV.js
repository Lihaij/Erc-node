/**
 * Created by shuang.liu on 18/2/27.
 */
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCNoticeControlSRV');
const model = require('../../../model');
const moment = require('moment');
const task = require('../baseconfig/ERCTaskListControlSRV');

const sequelize = model.sequelize;
const tb_notice = model.erc_notice;
const tb_notice_org = model.erc_notice_org;
const tb_notice_user = model.erc_notice_user;
const tb_uploadfile = model.erc_uploadfile;
const tb_taskallot = model.erc_taskallot;
const tb_taskallotuser = model.erc_taskallotuser;
const tb_message_user = model.erc_message_user;
const tb_department = model.erc_department;
const tb_custorgstructure = model.erc_custorgstructure;
const tb_user = model.common_user;

//公告管理->公告列表
exports.ERCNoticeControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'delete') {
        deleteAct(req, res)
    } else if (method === 'upload') {
        uploadAct(req, res)
    } else if (method === 'search_d') {
        searchDetailAct(req, res)
    } else if (method === 'complete') {
        completeAct(req, res);
    } else if (method === 'setTask') {
        setTask(req, res)
    } else if (method === 'search_r') {
        searchReceiveAct(req, res)
    } else if (method === 'getNoitceOrder') {
        getNoitceOrderAct(req, res)
    } else if (method === 'search_files') {
        searchFilesAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
}

async function initAct(req, res) {
    let doc = common.docTrim(req.body);
    let returnData = {};
    let replacements0 = [];
    let replacements = [];
    let user = req.user;

    try {
        const departments = await tb_department.findAll({
            where: {
                domain_id: user.domain_id
            }
        })
        let departmentInfo = [{id: '00', value: '00', text: '全公司'}];
        for(const d of departments) {
            departmentInfo.push({
                id: d.department_id,
                value: d.department_id,
                text: d.department_name
            })
        }
        returnData.departmentInfo = departmentInfo;
        returnData.stateInfo = GLBConfig.STOCKORDERSTATE;
        returnData.noticeInfo = GLBConfig.NOTICESTATE;
        returnData.noticeAnswer = GLBConfig.NOTICEANSWER;
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }

}

//查询发布的公告通知
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements = [user.domain_id];
        let queryStr = 'select t.notice_id,t.notice_title,t.notice_state,t.created_at,ut.username,t.notice_detail,t.notice_question,t.notice_answer,t.notice_refuse_remark from tbl_erc_notice t ' +
            'inner join tbl_common_user ut on t.user_id = ut.user_id  where t.state=1 and t.domain_id=?';
        if (doc.notice_title) {
            queryStr += ' and t.notice_title like ?';
            let notice_title = '%' + doc.notice_title + '%';
            replacements.push(notice_title)
        }
        if (doc.created_at != null) {
            queryStr += ` and t.created_at >= ? and t.created_at <= ? `;
            replacements.push(doc.created_at + ` 00:00:00`);
            replacements.push(doc.created_at + ` 23:59:59`);
        }
        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

//新增公告列表
async function addAct(req, res) {
    try {
        let user = req.user;
        let doc = common.docTrim(req.body);
        let retData = {};

        let taskallot = await tb_taskallot.findOne({
            where: {
                state: GLBConfig.ENABLE,
                taskallot_id: 14
            }
        });

        let taskallotuser = await tb_taskallotuser.findOne({
            where: {
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id,
                taskallot_id: taskallot.taskallot_id
            }
        });

        if (taskallotuser) {
            let create = await tb_notice.create({
                domain_id: user.domain_id,
                user_id: user.user_id,
                notice_title: doc.notice_title,
                notice_detail: doc.notice_detail,
                notice_question: doc.notice_question,
                notice_answera: doc.notice_answera,
                notice_answerb: doc.notice_answerb,
                notice_answerc: doc.notice_answerc,
                notice_answerd: doc.notice_answerd,
                notice_answer: doc.notice_answer
            });

            //附件
            if (doc.files != null && doc.files.length > 0) {
                for (let file of doc.files) {
                    let addFile = await tb_uploadfile.create({
                        api_name: common.getApiName(req.path),
                        file_name: file.file_name,
                        file_url: file.file_url,
                        file_type: file.file_type,
                        file_visible: '1',
                        state: GLBConfig.ENABLE,
                        srv_id: create.notice_id
                    });
                }
            }

            //公告范围
            for (let org of doc.orgs) {
                //公告发布给指定角色
                await tb_notice_org.create({
                    notice_id: create.notice_id,
                    domain_id: user.domain_id,
                    department_id: org
                });

                let userList = []
                //00 表示全公司
                if (org === '00') {
                    userList = await tb_user.findAll({
                        where: {
                            domain_id: user.domain_id,
                            state: 1
                        }
                    })
                } else {
                    userList = await tb_custorgstructure.findAll({
                        where: {
                            department_id: org,
                            state: 1
                        }
                    });
                }
                let userRecords = [];
                for (let i = 0; i < userList.length; i++) {
                    let userInfo = {};
                    userInfo.notice_id = create.notice_id;
                    userInfo.domain_id = user.domain_id;
                    userInfo.user_id = userList[i].user_id;
                    userRecords.push(userInfo)
                }
                await tb_notice_user.bulkCreate(userRecords);
            }

            //发布审批任务
            let notice = await tb_notice.findOne({
                where: {
                    state: GLBConfig.ENABLE,
                    notice_id: create.notice_id
                }
            });
            let taskName = '公告通知';
            let taskDescription = create.notice_id + '  公告通知';
            let groupId = common.getUUIDByTime(30);
            // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
            let taskResult = await task.createTask(user, taskName, 14, '', create.notice_id, taskDescription, '', groupId);
            // if(!taskResult){
            //     return common.sendError(res, 'task_02');
            // }else{
            if (notice) {
                await tb_notice.update({
                    notice_state: 1
                }, {
                    where: {
                        notice_id: create.notice_id
                    }
                });
            }
            // }
            let retData = JSON.parse(JSON.stringify(create));
            common.sendData(res, retData);
        } else {
            return common.sendError(res, 'task_02');
        }

    } catch (error) {
        common.sendFault(res, error);
    }
}
//删除公告列表
async function deleteAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let delNotice = await tb_notice.findOne({
            where: {
                notice_id: doc.notice_id,
                state: GLBConfig.ENABLE
            }
        });
        if (delNotice) {
            delNotice.state = GLBConfig.DISABLE;
            await delNotice.save();
            return common.sendData(res);
        } else {
            return common.sendError(res, 'notice_01');
        }
    } catch (error) {
        return common.sendFault(res, error);
    }
}
//更新新增公告信息
async function uploadAct(req, res) {
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
//查询公告详情
async function searchDetailAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements = [doc.notice_id];

        let queryStr = 'select t.*,ut.username from tbl_erc_notice t ' +
            'inner join tbl_common_user ut on t.user_id = ut.user_id  where t.state=1 and t.notice_id=?';

        let resultDetail = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        let queryRst = [];

        for (let r of resultDetail) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            queryRst.push(result)
        }

        //通知详情
        returnData.noticeDetal = queryRst;

        // let queryStr1 = 'select t.*,gt.usergroup_name from tbl_erc_notice_org t ' +
        //     'inner join tbl_common_usergroup gt on t.usergroup_id = gt.usergroup_id ' +
        //     'where t.notice_id=?';
        //
        // let queryRst1 = await sequelize.query(queryStr1, {
        //     replacements: replacements,
        //     type: sequelize.QueryTypes.SELECT
        // });

        const orgs = await tb_notice_org.findAll({
            where: {
                notice_id: doc.notice_id,
                domain_id: user.domain_id,
                state: 1
            }
        });
        const isExist = orgs.some(item => (item.department_id === '00'));
        if (isExist){
            returnData.noticeReceiver = [{id:'00', value: '00',text: '全公司'}];
        } else {
            let departmentStr = `select d.* from tbl_erc_notice_org n
            left join tbl_erc_department d on n.department_id = d.department_id
            where n.notice_id = ? and n.domain_id = ?`

            let departments = await sequelize.query(departmentStr, {
                replacements: [doc.notice_id, user.domain_id],
                type: sequelize.QueryTypes.SELECT
            });

            let departmentInfo = [];
            for(const d of departments) {
                departmentInfo.push({
                    id: d.department_id,
                    value: d.department_id,
                    text: d.department_name
                })
            }
            //公告范围
            returnData.noticeReceiver = departmentInfo;
        }

        let sFiles = await tb_uploadfile.findAll({
            where: {
                api_name: common.getApiName(req.path),
                srv_id: doc.notice_id,
                state: GLBConfig.ENABLE
            }
        }) || [{}];

        //附件
        returnData.sFiles = [];
        for (let r of sFiles) {
            let result = JSON.parse(JSON.stringify(r));
            result.file_url = doc.host + r.file_url;
            returnData.sFiles.push(result)
        }

        let queryRst2 = await tb_notice_user.findOne({
            where: {
                notice_id: doc.notice_id,
                user_id: user.user_id
            }
        })
        //是否已读
        returnData.receiverInfo = queryRst2;

        common.sendData(res, returnData);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//完成问题
let completeAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let task = await tb_notice.findOne({
            where: {
                notice_id: doc.notice_id,
            }
        });

        if (doc.answer == task.notice_answer) { //答案正确
            let u = await tb_notice_user.findOne({
                where: {
                    notice_id: task.notice_id,
                    user_id: user.user_id
                }
            })

            if (u) {
                u.read_state = '1';
                await u.save();
            }
            let order = await tb_message_user.findOne({
                where: {
                    message_id: task.notice_id,
                    user_id: user.user_id
                }
            })

            if (order) {
                order.message_user_state = '1';
                await order.save();
            }
            common.sendData(res);
        } else {
            return common.sendError(res, 'notice_02')
        }
    } catch (error) {
        common.sendFault(res, error);
    }
};


//通知接收人查询通知列表
async function searchReceiveAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        let replacements = [user.user_id];
        let queryStr = 'select t.*,st.username,ut.read_state from tbl_erc_notice_user ut ' +
            'inner join tbl_erc_notice t on ut.notice_id = t.notice_id ' +
            'inner join tbl_common_user st on ut.user_id = st.user_id ' +
            'where t.state=1 and ut.user_id=? and t.notice_state = 3';
        if (doc.notice_title) {
            queryStr += ' and t.notice_title like ?';
            let notice_title = '%' + doc.notice_title + '%';
            replacements.push(notice_title)
        }
        if (doc.created_at != null) {
            queryStr += ` and t.created_at >= ? and t.created_at <= ? `;
            replacements.push(doc.created_at + ` 00:00:00`);
            replacements.push(doc.created_at + ` 23:59:59`);
        }
        queryStr += ' order by t.created_at desc';

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.created_at ? moment(r.created_at).format("YYYY-MM-DD") : null;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
//获得通知消息
async function getNoitceOrderAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            returnData = {},
            user = req.user;

        let queryStr = 'select t.*,st.username,ut.read_state from tbl_erc_notice_user ut ' +
            'inner join tbl_erc_notice t on ut.notice_id = t.notice_id ' +
            'inner join tbl_common_user st on ut.user_id = st.user_id ' +
            'where t.state=1 and ut.user_id=? and t.notice_state = 3';

        let orders = await sequelize.query(queryStr, {
            replacements: [user.user_id],
            type: sequelize.QueryTypes.SELECT
        })
        returnData.noitceOrder = [];
        for (let t of orders) {
            let result = JSON.parse(JSON.stringify(t));
            result.create_date = t.created_at.Format("yyyy-MM-dd");
            returnData.noitceOrder.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

//公告审批
async function setTask(req, res) {
    try { // user, taskName, taskType  4, taskPerformer, taskReviewCode, taskDescription
        let user = req.user;
        let doc = common.docTrim(req.body);
        // 申请状态 0.待提交 1.待审批 2.未通过 3.已通过

        let notice = await tb_notice.findOne({
            where: {
                state: GLBConfig.ENABLE,
                notice_id: doc.notice_id
            }
        });
        let taskName = '公告通知';
        let taskDescription = doc.notice_id + '  公告通知';
        let groupId = common.getUUIDByTime(30);
        // user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, reviewId, taskGroup
        let taskResult = await task.createTask(user, taskName, 14, '', doc.notice_id, taskDescription, '', groupId);
        if (!taskResult) {
            return common.sendError(res, 'task_02');
        } else {
            if (notice) {
                notice.notice_state = 1;
                await notice.save()
            }
            common.sendData(res, {})
        }

    } catch (error) {
        common.sendFault(res, error);
    }
}
//修改公告状态
async function modifyNoticeState(applyState, description, noticeId, applyApprover) {

    await tb_notice.update({
        notice_state: applyState,
        notice_check_date: new Date(),
        notice_checker_id: applyApprover,
        notice_refuse_remark: description
    }, {
        where: {
            notice_id: noticeId
        }
    });
}
exports.modifyNoticeState = modifyNoticeState;
//查询文件
async function searchFilesAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

        let queryStr = `select t.*,ut.username from tbl_erc_notice t 
        inner join tbl_common_user ut on t.user_id = ut.user_id  where t.state=1 and t.notice_id=?`;

        let replacements = [doc.notice_id];
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
                    srv_id: doc.notice_id,
                    state: GLBConfig.ENABLE
                }
            })

            for (let f of ufs) {
                row.files.push(f)
            }
            resultData.designs.push(row)
        }
        common.sendData(res, resultData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
