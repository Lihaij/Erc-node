const fs = require('fs');
const moment = require('moment');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCWorkPlanControlSRV');
const model = require('../../../model');

const sequelize = model.sequelize;
const tb_gantttasks = model.erc_gantttasks;
const tb_user = model.common_user;
const tb_tempCons = model.erc_templateconstruction;
const tb_node = model.erc_constructionnode;
const tb_ganttlog = model.erc_ganttlog;
const tb_order = model.erc_order;
const tb_worklog = model.erc_worklog;
const tb_crew = model.erc_crew;
const tb_history = model.erc_history;
const tb_orderacceptance = model.erc_orderacceptance;
const tb_acceptance = model.erc_acceptance;
const tb_orderroom = model.erc_orderroom;
const tb_orderworkflow = model.erc_orderworkflow;
const tb_produceprocess = model.erc_produceprocess;
const tb_produceacceptance = model.erc_produceacceptance;



exports.PlanControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'upload') {
        uploadAct(req, res)
    } else if (method === 'add_f') {
        addFileAct(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'modify_d') {
        modifyDateAct(req, res)
    } else if (method === 'delete') {
        deleteAct(req, res)
    } else if (method === 'generate') {
        generateAct(req, res)
    } else if (method === 'search_w') {
        searchWorkLog(req, res);
    } else if (method === 'searchModifyLog') {
        searchModifyLogAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

// 初始化基础数据
exports.initAct = async (req, res) =>{
    let doc = common.docTrim(req.body);
    let returnData = {};
    returnData.updateReasonList = GLBConfig.UPDATEREASON;
    let queryStr = 'select * from tbl_erc_templateconstruction where state = ? and  (domain_id = (select domain_id from tbl_common_domain where domain_type = 0) or domain_id = ?)'
    let replacements = [GLBConfig.ENABLE, doc.domain_id];
    let queryRst = await sequelize.query(queryStr, {
        replacements: replacements,
        type: sequelize.QueryTypes.SELECT,
        state: GLBConfig.ENABLE
    });
    returnData.templateList = [];
    for (let r of queryRst) {
        let result = JSON.parse(JSON.stringify(r));
        returnData.templateList.push({
            id: result.template_id,
            text: result.template_name,
            schedule: result.template_schedule
        });
    }

    let queryStr2 = 'select * from tbl_erc_order t where t.order_id=?';
    let replacements2 = [doc.order_id];
    let queryRst2 = await sequelize.query(queryStr2, {
        replacements: replacements2,
        type: sequelize.QueryTypes.SELECT
    });
    returnData.orderInfo = [];
    for (let r2 of queryRst2) {
        let result2 = JSON.parse(JSON.stringify(r2));
        if (r2.break_date) {
            result2.break_date = r2.break_date.Format("yyyy-MM-dd");
        }
        if (r2.actual_start_date) {
            result2.actual_start_date = r2.actual_start_date.Format("yyyy-MM-dd");
        }
        if (r2.contract_date) {
            result2.contract_date = r2.contract_date.Format("yyyy-MM-dd");
        }
        returnData.orderInfo.push(result2)
    }

    let gantttasks = await tb_gantttasks.findOne({
        where: {
            order_id: doc.order_id
        }
    });

    if (gantttasks) {
        returnData.construction_template_id = gantttasks.template_id;
    }

    common.sendData(res, returnData)
}

// 查询甘特图
exports.searchAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let returnData = [];

        let queryStr = 'select t.*,ut.`name` as leader_name,ut.phone from tbl_erc_gantttasks t left join tbl_common_user ut on t.leader_id = ut.user_id';
        let replacements = [];
        if (doc.order_id) {
            queryStr += ' where t.order_id= ?';
            replacements.push(doc.order_id)
        }

        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        for (let r of queryRst) {
            let result = JSON.parse(JSON.stringify(r));
            result.create_date = r.created_at.Format("yyyy-MM-dd");
            result.start_date = r.start_date.Format("dd-MM-yyyy");
            returnData.push(result)
        }

        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
// 修改甘特图
exports.modifyAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let modigantttasks = await tb_gantttasks.findOne({
            where: {
                gantttasks_id: doc.gantttasks_id
            }
        });

        if (modigantttasks) {
            modigantttasks.start_date = doc.start_date;
            modigantttasks.duration = doc.duration;
            modigantttasks.progress = doc.progress;
            modigantttasks.leader_id = doc.leader_id;
            await modigantttasks.save();
        } else {
            common.sendError(res, 'plan_01');
            return
        }

        let retData = JSON.parse(JSON.stringify(modigantttasks));
        common.sendData(res, retData);

    } catch (error) {
        common.sendFault(res, error);
        return null;
    }
}
// 修改日期
exports.modifyDateAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let modigantttasks = await tb_gantttasks.findOne({
            where: {
                gantttasks_id: doc.gantttasks_id
            }
        });

        if (modigantttasks) {
            let update_content = "";
            var newDate = new Date(doc.start_date);
            newDate.setHours(newDate.getHours() + 8);

            if (modigantttasks.start_date.Format("yyyy-MM-dd") == newDate.Format("yyyy-MM-dd")) {
                update_content = "工期由" + modigantttasks.duration + "天改为" + doc.duration + "天";
            } else {
                update_content = "开始日期由" + modigantttasks.start_date.Format("yyyy-MM-dd") + "改为" + newDate.Format("yyyy-MM-dd");
            }

            let addLog = await tb_ganttlog.create({
                update_reason: doc.update_reason,
                remark: doc.gantt_remark,
                operator_id: doc.user_id,
                order_id: doc.order_id,
                gantttasks_id: doc.gantttasks_id,
                update_content: update_content
            });
        }

        if (modigantttasks) {
            modigantttasks.start_date = doc.start_date;
            modigantttasks.duration = doc.duration;
            modigantttasks.progress = doc.progress;
            modigantttasks.leader_id = doc.leader_id;
            await modigantttasks.save();
        } else {
            common.sendError(res, 'plan_01');
            return
        }

        let retData = JSON.parse(JSON.stringify(modigantttasks));
        common.sendData(res, retData);

    } catch (error) {
        common.sendFault(res, error);
        return null;
    }
}
// 生成甘特图
exports.generateAct = async (req, res) => {
    let doc = common.docTrim(req.body);
    let user = req.user;
    let ganntttasks = [];

    let orderrooms = await tb_orderroom.findAll({
        where: {
            order_id: doc.order_id
        }
    });

    if (orderrooms.length <= 0) {
        common.sendError(res, 'acceptance_plan_02')
    }

    let findOrder = await tb_order.findOne({
        where: {
            order_id: doc.order_id
        }
    });
    if (findOrder) {
        findOrder.actual_start_date = moment(doc.actual_start_date, "YYYY-MM-DD").toDate();
        await findOrder.save();
    }
    await common.transaction(async function(t) {
        // let nodeArr = await tb_produceprocess.findAll({
        //     where: {
        //         produce_id: doc.produce_id,
        //         state: GLBConfig.ENABLE
        //     },
        //     order: ['process_level']
        // });

        let queryStr = `select opp.*, pp.process_name, pp.process_level
              from tbl_erc_orderproductplan opp left join tbl_erc_produceprocess pp on opp.produceprocess_id = pp.produceprocess_id
              where opp.order_id = ? and pp.state = 1 order by pp.process_level`;
        let replacements = [doc.order_id];

        let nodeArr = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        if (nodeArr && nodeArr.length > 0) {
            await tb_gantttasks.destroy({
                where: {
                    order_id: doc.order_id
                },
                transaction: t
            });

            let schArr = [];
            let totalGap = 0;
            for (let i = 0; i < nodeArr.length; i++) {

                // let sch = {};
                // sch = await _getDateRange({
                //     start_date: doc.actual_start_date,
                //     sun_off: doc.sun_off,
                //     sat_off: doc.sat_off,
                //     start_day: nodeArr[i].process_begin_date,
                //     end_day: nodeArr[i].process_end_date
                // });
                // schArr.push(sch);

                let gt = await tb_gantttasks.create({
                    text: nodeArr[i].process_name,
                    node_id: nodeArr[i].produceprocess_id,
                    order_id: doc.order_id,
                    start_date: i === 0 ? doc.actual_start_date : nodeArr[i].process_begin_date,
                    duration: nodeArr[i].process_duration,
                    progress: 0,
                    sortorder: nodeArr[i].process_level,
                    parent: 0,
                    produce_id: doc.produce_id,
                    task_state: GLBConfig.TASKSTATE[0].value
                }, {
                    transaction: t
                });
                ganntttasks.push(gt)
            }
            // await tb_history.create({
            //     order_id: doc.order_id,
            //     order_state: 'SIGNED',
            //     history_event: '施工计划',
            //     history_content: '生成施工计划',
            //     operator_name: user.name
            // }, {
            //     transaction: t
            // });

            // 生成验收计划
            await tb_orderacceptance.destroy({
                where: {
                    order_id: doc.order_id
                },
                transaction: t
            });

            // await tb_orderworkflow.destroy({
            //     where: {
            //         order_id: doc.order_id,
            //         orderworkflow_state: 'WORKING'
            //     },
            //     transaction: t
            // });

            // let order = await tb_order.findOne({
            //     where: {
            //         order_id: doc.order_id
            //     },
            //     transaction: t
            // });
            // order.weekend_flag = doc.sat_off.toString() + doc.sun_off.toString();
            // order.order_state = 'SIGNED';
            // await order.save({
            //     transaction: t
            // });

            for (let or of orderrooms) {
                for (let gt of ganntttasks) {
                    let findAcceptance = await tb_produceacceptance.findAll({
                        where: {
                            room_type: or.room_type,
                            produceprocess_id: gt.node_id,
                            state: GLBConfig.ENABLE
                        }
                    });
                    for (let a of findAcceptance) {
                        await tb_orderacceptance.create({
                            gantttasks_id: gt.gantttasks_id,
                            order_id: doc.order_id,
                            room_id: or.room_id,
                            acceptance_id: a.produceacceptance_id,
                            acceptance_index: a.acceptance_index,
                            template_id: a.produce_id,
                            node_id: a.produceprocess_id,
                            room_type: a.room_type,
                            acceptance_name: a.acceptance_name,
                            is_hidden: a.is_hidden,
                            technological_require: a.technological_require,
                            evidence_require: a.evidence_require,
                            acceptance_state: 'NEW',
                            upload_format: a.upload_format
                        }, {
                            transaction: t
                        })
                    }
                }
            }
            // 生成验收计划结束
            common.sendData(res, {
                success: true
            });
        } else {
            common.sendError(res, 'templateConstruction_01');
        }
    });
};
let _getDateRange = async (params) => {
    let DAYMS = 24 * 60 * 60 * 1000;
    let gap = parseInt(params.end_day) - parseInt(params.start_day) + 1; //实际工作天数
    let oriGap = gap;
    logger.debug('ori:' + params.start_day + '-' + params.end_day + ' ' + gap);
    logger.debug(params);
    let startDate = new Date(params.start_date);
    let firstWeekDay = startDate.getDay();
    if (params.start_day != 1) { //不是第一个节点起始日，UTC时间转为北京时间
        if (firstWeekDay == 6 && params.sat_off) {
            startDate = new Date(startDate.getTime() + DAYMS);
        }
        if (firstWeekDay == 0 && params.sun_off) {
            startDate = new Date(startDate.getTime() + DAYMS);
        }
        firstWeekDay = startDate.getDay();
        logger.debug(firstWeekDay);
        let delta = params.start_day;
        if (delta >= 7) {
            if (params.sun_off)
                delta += Math.floor(delta / 7);
            if (params.sat_off)
                delta += Math.floor(delta / 7);
            if (firstWeekDay == 6 && params.sat_off)
                delta--;
            if (firstWeekDay == 0 && params.sun_off)
                delta--;
        } else {
            if (params.sat_off && params.sun_off && firstWeekDay != 6 && firstWeekDay != 0 && (firstWeekDay + params.start_day - 1 >= 6))
                delta += 2;
            else if (firstWeekDay != 6 && (firstWeekDay + params.start_day - 1 >= 6) && params.sat_off)
                delta++;
            else if (firstWeekDay != 0 && (firstWeekDay + params.start_day - 1 >= 7) && params.sun_off)
                delta++;
        }
        logger.debug(delta);
        startDate = new Date(startDate.getTime() + (delta - 1) * DAYMS);
    }
    logger.debug(startDate);
    //工期的第一天如果是休息日，则顺延
    if (startDate.getDay() == 6 && params.sat_off) {
        startDate = new Date(startDate.getTime() + DAYMS);
    }
    if (startDate.getDay() == 0 && params.sun_off) {
        startDate = new Date(startDate.getTime() + DAYMS);
    }
    let startWeekDay = startDate.getDay();
    logger.debug('[week]:' + startWeekDay);
    //将休息日计入工期
    if (gap >= 7) {
        if (params.sun_off)
            gap += Math.floor(gap / 7);
        if (params.sat_off)
            gap += Math.floor(gap / 7);
        if (startWeekDay == 6 && params.sat_off)
            gap--;
        if (startWeekDay == 0 && params.sun_off)
            gap--;
    } else {
        if (params.sat_off && params.sun_off && startWeekDay != 6 && startWeekDay != 0 && (startWeekDay + oriGap - 1 >= 6))
            gap += 2;
        else if (startWeekDay != 6 && (startWeekDay + oriGap - 1 >= 6) && params.sat_off)
            gap++;
        else if (startWeekDay != 0 && (startWeekDay + oriGap - 1 >= 7) && params.sun_off)
            gap++;
    }
    logger.debug('[gap]:' + gap);
    let result = {
        start_date: startDate,
        duration: gap
    };
    logger.debug(result);
    return result;
};
// 查询工作日志
exports.searchWorkLog = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};
        let task = await tb_gantttasks.findOne({
            where: {
                gantttasks_id: doc.gantttasks_id,
                state: GLBConfig.ENABLE
            }
        });
        returnData.task = JSON.parse(JSON.stringify(task));
        let order = await tb_order.findOne({
            where: {
                order_id: doc.order_id
            }
        });
        if (!order)
            return common.sendError(res, 'order_02');

        let queryStr = 'select t.*,ut.name,ut.avatar from tbl_erc_worklog t ' +
            'inner join tbl_common_user ut on t.user_id = ut.user_id ' +
            'where t.order_id = ? and t.user_id = ? and t.gantttasks_id = ? and t.state = ?';

        let replacements = [order.order_id, order.order_supervision, doc.gantttasks_id, GLBConfig.ENABLE];
        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        })
        returnData.sWorklog = [];
        for (let r of queryRst) {
            let result = JSON.parse(JSON.stringify(r));

            if (r.avatar) {
                result.avatar = doc.host + r.avatar;
            }
            result.created_at = r.created_at.Format("yyyy-MM-dd");
            returnData.sWorklog.push(result)
        }

        // returnData.sWorklog = await tb_worklog.findAll({
        //         where: {
        //             order_id: order.order_id,
        //             user_id: order.order_supervision,
        //             gantttasks_id: doc.gantttasks_id,
        //             log_type: GLBConfig.WORKLOGTYPE[0].value,
        //             state: GLBConfig.ENABLE
        //         }
        //     }) || [{}];
        let sFiles = await tb_uploadfile.findAll({
            where: {
                user_id: order.order_supervision,
                srv_id: doc.gantttasks_id,
                state: GLBConfig.ENABLE
            }
        }) || [{}];
        returnData.sFiles = [];
        for (let r of sFiles) {
            let result = JSON.parse(JSON.stringify(r));
            result.file_url = doc.host + r.file_url;
            returnData.sFiles.push(result)
        }

        // returnData.fWorklog = await tb_worklog.findAll({
        //         where: {
        //             order_id: order.order_id,
        //             gantttasks_id: doc.gantttasks_id,
        //             user_id: order.order_foreman,
        //             log_type: GLBConfig.WORKLOGTYPE[0].value,
        //             state: GLBConfig.ENABLE
        //         }
        //     }) || [{}];

        let queryStr1 = 'select t.*,ut.name,ut.avatar from tbl_erc_worklog t ' +
            'inner join tbl_common_user ut on t.user_id = ut.user_id ' +
            'where t.order_id = ? and t.user_id = ? and t.gantttasks_id = ? and t.state = ?';

        let replacements1 = [order.order_id, order.order_foreman, doc.gantttasks_id, GLBConfig.ENABLE];
        let queryRst1 = await sequelize.query(queryStr1, {
            replacements: replacements1,
            type: sequelize.QueryTypes.SELECT
        })
        returnData.fWorklog = [];
        for (let r of queryRst1) {
            let result = JSON.parse(JSON.stringify(r));
            if (r.avatar) {
                result.avatar = doc.host + r.avatar;
            }

            result.created_at = r.created_at.Format("yyyy-MM-dd");
            returnData.fWorklog.push(result)
        }

        let fFiles = await tb_uploadfile.findAll({
            where: {
                user_id: order.order_foreman,
                srv_id: doc.gantttasks_id,
                state: GLBConfig.ENABLE
            }
        }) || [{}];
        returnData.fFiles = [];
        for (let r of fFiles) {
            let result = JSON.parse(JSON.stringify(r));
            result.file_url = doc.host + r.file_url;
            returnData.fFiles.push(result)
        }

        let crews = await tb_crew.findAll({
            where: {
                foreman_id: order.order_foreman,
                state: GLBConfig.ENABLE
            }
        });
        returnData.wWorklog = [];
        returnData.wFiles = [];
        for (var c of crews) {
            if (c.worker_id) {
                let wf = await tb_uploadfile.findAll({
                    where: {
                        user_id: c.worker_id,
                        srv_id: doc.gantttasks_id,
                        state: GLBConfig.ENABLE
                    }
                });
                let wl = await tb_worklog.findAll({
                    where: {
                        order_id: order.order_id,
                        gantttasks_id: doc.gantttasks_id,
                        user_id: c.worker_id,
                        log_type: GLBConfig.WORKLOGTYPE[0].value,
                        state: GLBConfig.ENABLE
                    }
                });
                returnData.wWorklog = returnData.wWorklog.concat(JSON.parse(JSON.stringify(wl)));
                returnData.wFiles = returnData.wFiles.concat(JSON.parse(JSON.stringify(wf)));
            }
        }
        returnData.rejectlog = await tb_worklog.findAll({
            where: {
                order_id: order.order_id,
                gantttasks_id: doc.gantttasks_id,
                log_type: GLBConfig.WORKLOGTYPE[1].value,
                state: GLBConfig.ENABLE
            },
            order: [
                ['created_at', 'DESC']
            ]
        }) || [{}];

        let queryStr2 = 'select * from tbl_erc_comment t ' +
            'where t.order_id = ? and t.gantttasks_id = ? ' +
            'order by t.created_at';

        let replacements2 = [order.order_id, doc.gantttasks_id];
        let queryRst2 = await sequelize.query(queryStr2, {
            replacements: replacements2,
            type: sequelize.QueryTypes.SELECT
        })
        returnData.comment = [];
        for (let r of queryRst2) {
            let result = JSON.parse(JSON.stringify(r));

            result.created_at = r.created_at.Format("yyyy-MM-dd");
            returnData.comment.push(result)
        }

        return common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

// 查询修改日志
exports.searchModifyLogAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let returnData = [];

        let queryStr = 'select t.update_content,t.update_reason,t.remark,t.created_at,ut.name,tt.text from tbl_erc_ganttlog t ' +
            'left join tbl_common_user ut on t.operator_id = ut.user_id ' +
            'inner join tbl_erc_gantttasks tt on t.gantttasks_id = tt.gantttasks_id ' +
            'where t.order_id=? order by t.created_at desc';
        let replacements = [doc.order_id];

        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        for (let r of queryRst) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at.Format("yyyy-MM-dd");
            returnData.push(result)
        }

        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
}
