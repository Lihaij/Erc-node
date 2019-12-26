/**
 * Created by Szane on 17/6/19.
 */
const moment = require('moment');
const common = require('../../util/CommonUtil');
const GLBConfig = require('../../util/GLBConfig');
const logger = require('../../util/Logger').createLogger('MBOrderSRV');
const model = require('../../model');
const Sequence = require('../../util/Sequence');
const UserBL = require('../../bl/UserBL');
const sms = require('../../util/SMSUtil.js');
const TaskListControlSRV = require('../erc/baseconfig/ERCTaskListControlSRV');
const PointControlSRV = require('../erc/baseconfig/ERCPointControlSRV.js');


const sequelize = model.sequelize;
const tb_gantttasks = model.erc_gantttasks;
const tb_orderacceptance = model.erc_orderacceptance;
const tb_orderroom = model.erc_orderroom;
const tb_comment = model.erc_comment;
const tb_worklog = model.erc_worklog;
const tb_uploadfile = model.erc_uploadfile;
const tb_crew = model.erc_crew;
const tb_order = model.erc_order;
const tb_orderworkflow = model.erc_orderworkflow;
const tb_checkflow = model.erc_checkflow;
const tb_checkmessage = model.erc_checkmessage;
const tb_user = model.common_user;
const tb_task = model.erc_task;
const tb_room = model.erc_orderroom;



exports.MBNodeResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'task_detail') {
        taskDetailAct(req, res);
    } else if (method === 'acceptance_detail') {
        acceptanceDetailAct(req, res);
    } else if (method === 'acceptance_submit') {
        acceptanceSubmitAct(req, res);
    } else if (method === 'acceptance_check') {
        acceptanceCheckAct(req, res);
    } else if (method === 'upload') {
        uploadAct(req, res);
    } else if (method === 'dispatch') {
        dispatchAct(req, res);
    } else if (method === 'start') {
        startAct(req, res);
    } else if (method === 'task_search') {
        acceptanceSearchAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};
let initAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {
            acceptanceStateInfo: GLBConfig.ACCEPTANCESTATEINFO,
            acceptanceTypeInfo: GLBConfig.ACCEPTANCETYPE,
        };
        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
let searchAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};
        let queryStr = ` select g.*,o.order_id,u.name as worker_name,u.avatar as worker_avatar, o.order_address from tbl_erc_gantttasks g
        left join tbl_common_user u on g.leader_id = u.user_id left join tbl_erc_order o
         on o.order_id = g.order_id where 1=1 and g.state = ? and o.state = ? `;
        let replacements = [GLBConfig.ENABLE, GLBConfig.ENABLE];
        if (doc.order_id != null) {
            queryStr += ` and  g.order_id = ? `;
            replacements.push(doc.order_id);
        }
        if (doc.user_id != null) { //工人的ID
            queryStr += ` and  g.leader_id = ? `;
            replacements.push(doc.user_id);
        }
        if (doc.order_supervision != null) {
            queryStr += ` and  o.order_supervision = ? `;
            replacements.push(doc.order_supervision);
        }
        if (doc.task_state) {
            queryStr += ` and  find_in_set(g.task_state , ?) `;
            replacements.push(doc.task_state);
        }
        queryStr += ` order by g.sortorder `;
        let tasks = await common.simpleSelect(sequelize, queryStr, replacements);
        tasks = JSON.parse(JSON.stringify(tasks));
        let date = new Date();
        for (let t of tasks) {
            let countStr = `select DISTINCT(room_id) from tbl_erc_orderacceptance where order_id = ? and gantttasks_id = ?`
            let countReplacements = [t.order_id, t.gantttasks_id];
            let roomResult = await common.simpleSelect(sequelize, countStr, countReplacements);
            t.room_count = roomResult.length;
            countStr = `select count(1) acount from tbl_erc_orderacceptance where order_id = ? and gantttasks_id = ?`
            let acceptanceCResult = await common.simpleSelect(sequelize, countStr, countReplacements);
            t.acceptance_count = acceptanceCResult[0].acount;
            if (!t.end_date) {
                t.end_date = moment(t.start_date).add(t.duration - 1, "days").toDate();
            }
            t.loc_time = date;
        }
        common.sendData(res, tasks);
    } catch (error) {
        common.sendFault(res, error);
    }
};

let taskDetailAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body),
            returnData = [];

        let roomStr = `select distinct b.room_id room_id, b.room_name room_name
        from tbl_erc_orderacceptance a, tbl_erc_orderroom b
        where a.room_id = b.room_id
        and a.order_id = ?
        and a.gantttasks_id = ?`
        let roomReplacements = [doc.order_id, doc.gantttasks_id];
        let roomResult = await common.simpleSelect(sequelize, roomStr, roomReplacements);
        for (let r of roomResult) {
            let rowData = {}
            rowData.room_id = r.room_id
            rowData.room_name = r.room_name
            let ac = await tb_orderacceptance.findAll({
                where: {
                    order_id: doc.order_id,
                    gantttasks_id: doc.gantttasks_id,
                    room_id: r.room_id
                },
                order: [
                    ['acceptance_index']
                ]
            });
            rowData.acceptance = ac
            returnData.push(rowData)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

let acceptanceDetailAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body)

        let acceptance = await tb_orderacceptance.findOne({
            where: {
                orderacceptance_id: doc.orderacceptance_id
            }
        });

        if (!acceptance) {
            return common.sendError(res, 'acceptance_01')
        }



        let returnData = JSON.parse(JSON.stringify(acceptance));

        let gantttask = await tb_gantttasks.findOne({
            where:{
                gantttasks_id: acceptance.gantttasks_id
            }
        });
        returnData.gantttasks_name = gantttask.text;

        let room = await tb_room.findOne({
            where: {
                room_id: acceptance.room_id
            }
        });
        returnData.room_name = room.room_name
        let order = await tb_order.findOne({
            where:{order_id : doc.order_id}
        })
        let apiName;
        if (order.order_type === '7') {
            apiName = 'ERCROOMTYPEDETAILCONTROL'
        } else {
            apiName = 'ERCPRODUCECONTROL'
        }
        returnData.example_pic = []
        let ifs = await tb_uploadfile.findAll({
            where: {
                api_name: apiName,//ACCEPTANCECHECKCONTROL
                srv_id: acceptance.acceptance_id,
                state: GLBConfig.ENABLE
            }
        })
        for (let i of ifs) {
            returnData.example_pic.push(i.file_url)
        }

        returnData.check_pic = []
        let cfs = await tb_uploadfile.findAll({
            where: {
                api_name: common.getApiName(req.path),
                order_id: acceptance.order_id,
                srv_id: acceptance.orderacceptance_id,
                state: GLBConfig.ENABLE
            }
        })
        for (let c of cfs) {
            returnData.check_pic.push(c.file_url)
        }


        returnData.order_supervision = {};
        if (order) {
            returnData.order_supervision = await tb_user.findOne({
                where : {user_id : order.order_supervision}
            })
        }

        returnData.rejected_msg = []
        let checkmessages = await tb_checkmessage.findAll({
            where: {
                order_id: acceptance.order_id,
                srv_id: acceptance.orderacceptance_id,
                check_type: 'ACCEPTANCECHECK',
                check_state: '1', //CHECKSTATEINFO
                check_owner: '0',
                state: GLBConfig.ENABLE
            },
            order: [
                ['created_at', 'DESC']
            ]
        })

        for (let m of checkmessages) {
            returnData.rejected_msg.push(m)
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

/**
 * 验收提交
 * @param orderacceptance_id
 * @param files
 */
let acceptanceSubmitAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;

        let acceptance = await tb_orderacceptance.findOne({
            where: {
                orderacceptance_id: doc.orderacceptance_id,
                state: GLBConfig.ENABLE
            }
        });
        if (acceptance.acceptance_state != 'NEW' && acceptance.acceptance_state != 'REJECTED') {
            return common.sendError(res, 'acceptance_02')
        }

        let theTask = await tb_gantttasks.findOne({
            where: {
                gantttasks_id: acceptance.gantttasks_id,
                state: GLBConfig.ENABLE
            }
        });
        if (theTask) {
            await common.transaction(async function (t) {
                theTask.task_state = GLBConfig.TASKSTATE[1].value;
                await theTask.save({
                    transaction: t
                });
                let theOrder = await tb_order.findOne({
                    where: {
                        order_id: theTask.order_id,
                        state: GLBConfig.ENABLE
                    }
                });
                if (!theOrder)
                    return common.sendError(res, 'order_02');
                theOrder.order_state = 'WORKING'; // ORDERSTATEINFO
                await theOrder.save({
                    transaction: t
                });

                let orderworkflow = await tb_orderworkflow.findOne({
                    where: {
                        order_id: theTask.order_id,
                        orderworkflow_state: 'WORKING' // ORDERSTATEINFO
                    },
                    transaction: t
                });
                if (!orderworkflow) {
                    await tb_orderworkflow.create({
                        order_id: theTask.order_id,
                        orderworkflow_state: 'WORKING', // ORDERSTATEINFO
                        orderworkflow_desc: '施工中' // ORDERSTATEINFO
                    }, {
                        transaction: t
                    })
                }
            });
        }

        // let staff = await UserBL.getOrderRelaUser(acceptance.order_id, '2') //工长
        //
        // if (user.user_id != task.leader_id && user.user_id != staff[0].user_id) {
        //     return common.sendError(res, 'acceptance_03')
        // }

        let cfs = await tb_uploadfile.findAll({
            where: {
                api_name: common.getApiName(req.path),
                order_id: acceptance.order_id,
                srv_id: acceptance.orderacceptance_id,
                state: GLBConfig.ENABLE
            }
        })
        for (let c of cfs) {
            await common.fileRemove(c.file_url)
            await c.destroy()
        }

        for (let f of doc.files) {
            let fileUrl = await common.fileMove(f.url, 'upload');
            let addFile = await tb_uploadfile.create({
                api_name: common.getApiName(req.path),
                order_id: acceptance.order_id,
                srv_id: doc.orderacceptance_id,
                user_id: user.user_id,
                file_creator: user.user_name,
                file_name: f.file_name,
                file_url: fileUrl,
                file_type: f.file_type,
                file_visible: f.file_visible
            });
        }

        acceptance.acceptance_comment = doc.acceptance_comment
        acceptance.acceptance_submit_id = user.user_id
        acceptance.acceptance_submit_date = new Date()
        acceptance.acceptance_state = 'CHECKING' // ACCEPTANCESTATEINFO
        await acceptance.save()

        let order = await tb_order.findOne({
            where: {
                order_id:acceptance.order_id
            }
        });

        //添加一条任务
        let taskName = acceptance.acceptance_name;
        let taskType = '6';
        let taskPerformer = order.order_supervision;
        let taskAcceptanceCode = acceptance.order_id;
        let taskDescription = '';
        let taskAcceptanceId = acceptance.orderacceptance_id;
        await TaskListControlSRV.createTask(user, taskName, taskType, taskPerformer, taskAcceptanceCode, taskDescription, taskAcceptanceId);

        //将工序的状态改未施工中
        let checkflow = await tb_checkflow.create({
            order_id: acceptance.order_id,
            srv_id: acceptance.orderacceptance_id,
            check_type: 'ACCEPTANCECHECK',
            check_desc: '验收审核',
            optional_flag: GLBConfig.FALSE,
            check_owner: '0', //CHECKOWNERINFO
            check_state: '0', //CHECKSTATEINFO
            operater_id: user.user_id,
            operater_name: user.name
        });

        let checkmessage = await tb_checkmessage.create({
            check_id: checkflow.check_id,
            order_id: checkflow.order_id,
            srv_id: checkflow.srv_id,
            check_type: 'ACCEPTANCECHECK',
            check_message: '提交验收审核:' + acceptance.acceptance_name + ',' + doc.acceptance_comment,
            check_owner: checkflow.check_owner,
            check_state: checkflow.check_state,
            operater_id: checkflow.operater_id,
            operater_name: checkflow.operater_name
        });

        let smsTo = await UserBL.getOrderRelaUser(acceptance.order_id, '1') //监理
        await sms.sedDataMsg(smsTo[0].phone, 'acceptance', [acceptance.order_id, theTask.text, acceptance.acceptance_name]) //给监理发送短信
        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
};
/**
 * 验收审核
 * @param orderacceptance_id
 * @param act 1 驳回 2 通过
 * @param check_message 驳回信息
 */
let acceptanceCheckAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;

        let acceptance = await tb_orderacceptance.findOne({
            where: {
                orderacceptance_id: doc.orderacceptance_id,
                state: GLBConfig.ENABLE
            }
        });

        if (acceptance.acceptance_state != 'CHECKING') {
            return common.sendError(res, 'acceptance_02')
        }

        let staff = await UserBL.getOrderRelaUser(acceptance.order_id, '1') //监理

        if (user.user_id != staff[0].user_id) {
            return common.sendError(res, 'acceptance_03')
        }

        let cf = await tb_checkflow.findOne({
            where: {
                order_id: acceptance.order_id,
                srv_id: acceptance.orderacceptance_id,
                check_type: 'ACCEPTANCECHECK',
                check_state: '0',
                check_owner: '0',
                state: GLBConfig.ENABLE
            }
        });

        if (!cf) {
            return common.sendError(res, 'acceptance_05');
        }

        if (doc.act === '1') { //驳回
            acceptance.acceptance_state = 'REJECTED' // ACCEPTANCESTATEINFO
            acceptance.acceptance_check_date = new Date()
            acceptance.acceptance_check_id = user.user_id
            await acceptance.save()

            cf.check_state = doc.act
            cf.operater_id = user.user_id
            cf.operater_name = user.name
            await cf.save()

            let addCm = await tb_checkmessage.create({
                check_id: cf.check_id,
                order_id: cf.order_id,
                srv_id: cf.srv_id,
                check_message: doc.check_message,
                check_state: cf.check_state,
                check_owner: cf.check_owner,
                check_type: cf.check_type,
                operater_id: cf.operater_id,
                operater_name: cf.operater_name
            });
            common.pushNotification('','您提交的验收项被驳回',{msgFlag: '3',orderAcceptId: acceptance.orderacceptance_id,taskId: acceptance.gantttasks_id,orderId: acceptance.order_id},acceptance.acceptance_submit_id);
        } else if (doc.act === '2') { // 通过
            acceptance.acceptance_state = 'APPROVED'
            acceptance.acceptance_check_date = new Date()
            acceptance.acceptance_check_id = user.user_id
            await acceptance.save()

            cf.check_state = doc.act
            cf.operater_id = user.user_id
            cf.operater_name = user.name
            await cf.save()

            let addCm = await tb_checkmessage.create({
                check_id: cf.check_id,
                order_id: cf.order_id,
                srv_id: cf.srv_id,
                check_message: '验收通过',
                check_state: cf.check_state,
                check_owner: cf.check_owner,
                check_type: cf.check_type,
                operater_id: cf.operater_id,
                operater_name: cf.operater_name
            });

            let napCount = await tb_orderacceptance.count({
                where: {
                    gantttasks_id: acceptance.gantttasks_id,
                    acceptance_state: {
                        $ne: 'APPROVED',
                    },
                    state: GLBConfig.ENABLE
                }
            });
            if (napCount === 0) { //全部验收通过节点完成
                let task = await tb_gantttasks.findOne({
                    where: {
                        gantttasks_id: acceptance.gantttasks_id,
                        state: GLBConfig.ENABLE
                    }
                });
                task.task_state = '3' //TASKSTATE
                task.progress = 1 //TASKSTATE
                await task.save()
            }
            // let taskCount = await tb_gantttasks.count({
            //     where: {
            //         order_id: acceptance.order_id,
            //         task_state: {
            //             $ne: '3',
            //         },
            //         state: GLBConfig.ENABLE
            //     }
            // });
            let taskCount = await tb_orderacceptance.count({
                where: {
                    order_id: cf.order_id,
                    acceptance_state: {
                        $ne: 'APPROVED',
                    },
                    state: GLBConfig.ENABLE
                }
            });

            if (taskCount === 0) { //全部验收项通过，订单既是已完成状态
                let order = await tb_order.findOne({
                    where: {
                        order_id: acceptance.order_id
                    }
                });
                order.order_state = 'FINISHI' //ORDERSTATEINFO
                await order.save()

                await tb_orderworkflow.create({
                    order_id: order.order_id,
                    orderworkflow_state: 'FINISHI',
                    orderworkflow_desc: '已完成'
                });

                //增加积分
                await PointControlSRV.updateUserPoint(order.user_id,3,parseInt(order.final_offer),order.order_id,'')
            }
            common.pushNotification('','您提交的验收项已通过',{msgFlag: '4',orderAcceptId: acceptance.orderacceptance_id,taskId: acceptance.gantttasks_id,orderId: acceptance.order_id},acceptance.acceptance_submit_id);
        } else {
            return common.sendError(res, 'acceptance_04')
        }

        //改变任务状态为已完成
        let tasks = await tb_task.findAll({
            where: {
                review_id: doc.orderacceptance_id,
                task_type: '6'
            }
        });
        if (tasks.length == 0) {
            return common.sendError(res, 'task_01');
        }
        for(let task of tasks){
            task.task_state = '2';
            task.task_complete_date = new Date();
            await task.save();
        }
        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
};

let uploadAct = async(req, res) => {
    try {
        let fileInfo = await common.fileSave(req);
        common.sendData(res, fileInfo);
    } catch (error) {
        return common.sendFault(res, error);

    }
};

/**
 * 分配节点
 * @param req
 * @param res
 * @returns {*}
 */
let dispatchAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        await common.transaction(async function(t) {
            let theTask = await tb_gantttasks.findOne({
                where: {
                    gantttasks_id: doc.gantttasks_id
                }
            });
            if (theTask) {
                // theTask.task_state = GLBConfig.TASKSTATE[2].value;
                theTask.leader_id = doc.worker_id;
                await theTask.save();
            } else {
                return common.sendError(res, 'constructionNode_01');
            }
            return common.sendData(res, JSON.parse(JSON.stringify(theTask)));
        });
    } catch (error) {
        common.sendFault(res, error);
    }
};
/**
 * 节点开始
 * @param req
 * @param res
 * @returns {*}
 */
let startAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        let theTask = await tb_gantttasks.findOne({
            where: {
                gantttasks_id: doc.gantttasks_id
            }
        });
        if (theTask) {
            common.transaction(async function(t) {
                // theTask.task_state = GLBConfig.TASKSTATE[3].value;
                await theTask.save({
                    transaction: t
                });
                let theOrder = await tb_order.findOne({
                    where: {
                        order_id: theTask.order_id,
                        state: GLBConfig.ENABLE
                    }
                });
                if (!theOrder)
                    return common.sendError(res, 'order_02');
                theOrder.order_state = 'WORKING'; // ORDERSTATEINFO
                await theOrder.save({
                    transaction: t
                });
                let orderworkflow = await tb_orderworkflow.findOne({
                    where: {
                        order_id: theTask.order_id,
                        orderworkflow_state: 'WORKING' // ORDERSTATEINFO
                    },
                    transaction: t
                });
                if (!orderworkflow) {
                    await tb_orderworkflow.create({
                        order_id: theTask.order_id,
                        orderworkflow_state: 'WORKING', // ORDERSTATEINFO
                        orderworkflow_desc: '施工中' // ORDERSTATEINFO
                    }, {
                        transaction: t
                    })
                }
                return common.sendData(res, JSON.parse(JSON.stringify(theTask)));
            });
        } else {
            return common.sendError(res, 'constructionNode_01');
        }
    } catch (error) {
        common.sendFault(res, error);
    }
};
/**
 * 搜索验收项
 * @param req
 * @param res
 * @returns {*}
 */
let acceptanceSearchAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        let roomStr = `SELECT a.*, b.text, e.estate_name, r.build, r.unit, r.room_no, s.room_name
                        FROM tbl_erc_orderacceptance a
                        left join tbl_erc_gantttasks b on a.gantttasks_id = b.gantttasks_id
                        left join tbl_erc_order o      on a.order_id = o.order_id
                        left join tbl_erc_estate e     on o.estate_id = e.estate_id
                        left join tbl_erc_estateroom r on o.estate_room_id = r.room_id
                        left join tbl_erc_orderroom s  on a.room_id = s.room_id
                        where FIND_IN_SET (a.acceptance_state,?) and a.acceptance_submit_id = ?;`
        let roomReplacements = [doc.status,user.user_id];
        let result = await common.simpleSelect(sequelize, roomStr, roomReplacements);

        //重新搭建数据结构，3维数组，第一层工序 第二层 空间 第三层 验收项
        let returnData = [];
        for(let i = 0;i < result.length; i++){
            let gantttasks_id = result[i].gantttasks_id;
            let isExist = false;
            for(let j=0; j < returnData.length; j++){
                if (gantttasks_id == returnData[j].gantttasks_id) {
                    isExist = true;
                    let spaces = returnData[j].spaces;
                    let roomExist = false;
                    for (let k = 0; k < spaces.length; k++){
                        let space = spaces[k];
                        if (space.room_id == result[i].room_id) {
                            roomExist = true;
                            space.acceptances.push(result[i]);
                            break;
                        }
                    }
                    if (!roomExist) {
                        returnData[j].spaces.push({room_name:result[i].room_name,room_id:result[i].room_id,acceptances:[result[i]]});
                    }
                    break;
                }
            }
            if (!isExist) {
                returnData.push({
                    gantttasks_id:result[i].gantttasks_id,
                    text:result[i].text,
                    spaces:[{room_name:result[i].room_name,room_id:result[i].room_id,acceptances:[result[i]]}],
                    estate_name: result[i].estate_name,
                    build: result[i].build,
                    unit : result[i].unit,
                    room_no: result[i].room_no
                });
            }
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
