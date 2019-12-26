/**
 * Created by Szane on 17/6/19.
 */
const common = require('../../util/CommonUtil');
const GLBConfig = require('../../util/GLBConfig');
const logger = require('../../util/Logger').createLogger('MBOrderSRV');
const model = require('../../model');
const Sequence = require('../../util/Sequence');

const sequelize = model.sequelize;
const tb_order = model.erc_order;
const tb_gantttasks = model.erc_gantttasks;
const tb_user = model.common_user;;
const tb_templateconstruction = model.erc_templateconstruction;
const tb_orderworkflow = model.erc_orderworkflow;
const tb_staff = model.erc_staff;
const tb_estateteam = model.erc_estateteam;
const tb_loan = model.erc_loan;

exports.MBOrderResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'assign') {
        assignAct(req, res);
    } else if (method === 'detail') {
        detailAct(req, res)
    } else if (method === 'remove_f') {
        removeForemanAct(req, res);
    } else if (method === 'add_loan') {
        addLoanAct(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

let initAct = async(req, res) => {
    try {
        let returnData = {
            houseTypeInfo: GLBConfig.HTYPEINFO,
            taskStateInfo: GLBConfig.TASKSTATE
        };
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
let searchAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        let queryStr = ` select o.*,u.*,t.template_name from tbl_erc_order o
        left join tbl_common_user u on o.user_id = u.user_id
        left join tbl_erc_template t on t.template_id = o.template_id
        where  o.state = ? `;
        let replacements = [GLBConfig.ENABLE];
        if (doc.user_id != null) {
            queryStr += ` and o.user_id = ? `;
            replacements.push(doc.user_id);
        }
        if (doc.order_id != null) {
            queryStr += ` and o.order_id = ? `;
            replacements.push(doc.order_id);
        }
        if (doc.order_supervision != null) {
            queryStr += ` and o.order_supervision = ? `;
            replacements.push(doc.order_supervision);
        }
        if (doc.order_foreman != null) {
            queryStr += ` and o.order_foreman = ? `;
            replacements.push(doc.order_foreman);
        }
        if (doc.order_state != null) {
            queryStr += ` and find_in_set (o.order_state,?) `;
            replacements.push(doc.order_state);
        }
        if (doc.search_text != null) {
            queryStr += ` and (u.name like ? or u.phone like ? or o.order_id like ?) `;
            replacements.push(`%` + doc.search_text + `%`);
            replacements.push(`%` + doc.search_text + `%`);
            replacements.push(`%` + doc.search_text + `%`);
        }
        queryStr += ` order by o.created_at desc `;
        let result = await common.simpleSelect(sequelize, queryStr, replacements);

        for (let r of result) {
            r.tasks = await tb_gantttasks.findAll({
                where: {
                    order_id: r.order_id,
                    state: GLBConfig.ENABLE
                },
                order: ['sortorder']
            });
            if (r.tasks && r.tasks.length > 0) {
                if (r.tasks[0].template_id) {
                    let consTemp = await tb_templateconstruction.findOne({
                        where: {
                            template_id: r.tasks[0].template_id,
                            state: GLBConfig.ENABLE
                        }
                    });
                    r.order_schedule = consTemp.template_schedule;
                }
            }
            r.loan = await tb_loan.findOne({
                where: {
                    order_id: r.order_id,
                    user_id: r.user_id
                }
            })
        }
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
};
let detailAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};
        let queryStr = ` select o.*,u.*, m.materiel_name, e.estate_name, r.build, r.unit, r.room_no from tbl_erc_order o
        left join tbl_erc_produce t on t.produce_id = o.produce_id
        left join tbl_erc_materiel m on t.materiel_id = m.materiel_id
        left join tbl_common_user u on o.user_id = u.user_id
        left join tbl_erc_estate e     on o.estate_id = e.estate_id
        left join tbl_erc_estateroom r on o.estate_room_id = r.room_id
          where o.order_id = ? `;
        let replacements = [doc.order_id];
        queryStr += ` order by o.created_at desc `;
        let theOrder = await common.simpleSelect(sequelize, queryStr, replacements);
        if (!theOrder || !theOrder.length > 0)
            return common.sendError(res, 'order_02');
        returnData.order = theOrder;

        let orderworkflow = await tb_orderworkflow.findAll({
            where: {
                order_id: theOrder[0].order_id
            }
        });

        returnData.statedict = {};
        for (let owf of orderworkflow) {
            returnData.statedict[owf.orderworkflow_state] = owf.created_at.Format("yyyy-MM-dd")
        }

        let gantt = await tb_gantttasks.findOne({
            where: {
                order_id: theOrder[0].order_id,
                state: GLBConfig.ENABLE
            }
        });

        returnData.tasks = await tb_gantttasks.findAll({
            where: {
                order_id: theOrder[0].order_id,
                state: GLBConfig.ENABLE
            },
            order: ['sortorder']
        });

        //查找订单下所有的工人
        returnData.workers = [];
        if (theOrder[0].order_type == 7) {
            //大客户订单
            let workers = await tb_estateteam.findAll({
                where: {
                    estate_id: theOrder[0].estate_id,
                    state: GLBConfig.ENABLE
                }
            });
            for (let i = 0; i < workers.length; i++) {
                returnData.workers.push(workers[i].user_id);
            }
        } else {
            //门店订单
            let gantttasks = await tb_gantttasks.findAll({
                where: {
                    order_id: doc.order_id,
                    state: GLBConfig.ENABLE
                }
            });
            for (let i = 0; i < gantttasks.length; i++) {
                returnData.workers.push(gantttasks[i].leader_id);
            }
        }

        // if (gantt) {
        //     if (theOrder[0].order_type != 7) {
        //         let consTemp = await tb_templateconstruction.findOne({
        //             where: {
        //                 template_id: gantt.template_id,
        //                 state: GLBConfig.ENABLE
        //             }
        //         });
        //         returnData.order_schedule = consTemp.template_schedule;
        //     }
        // }
        returnData.designer = await tb_user.findOne({
            where: {
                user_id: theOrder[0].designer_id
            }
        });
        returnData.foreman = await tb_user.findOne({
            where: {
                user_id: theOrder[0].order_foreman
            }
        });
        returnData.supervision = await tb_user.findOne({
            where: {
                user_id: theOrder[0].order_supervision
            }
        });
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
/**
 * 指派工长
 * @param req
 * @param res
 */
let assignAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        await common.transaction(async function(t) {
            let theOrder = await tb_order.findOne({
                where: {
                    order_id: doc.order_id
                }
            });
            if (theOrder) {
                theOrder.order_foreman = doc.foreman;
                // theOrder.order_state = GLBConfig.ORDERSTATEINFO[10].id;
                await theOrder.save({
                    transaction: t
                });
                let user = await tb_user.findOne({
                    where: {
                        user_id: doc.foreman,
                        state: GLBConfig.ENABLE
                    },
                    transaction: t
                });
                let staff = await tb_staff.findOne({
                    where: {
                        order_id: doc.order_id,
                        staff_type: GLBConfig.TYPE_STAFF[1].value,
                        state: GLBConfig.ENABLE
                    }
                });
                if (staff) {
                    staff.user_id = doc.foreman;
                    await staff.save({
                        transaction: t
                    });
                } else await tb_staff.create({
                    order_id: doc.order_id,
                    staff_type: GLBConfig.TYPE_STAFF[1].value,
                    user_id: doc.foreman,
                    staff_phone: user.phone
                }, {
                    transaction: t
                });
                common.pushNotification('','您收到一份订单',{msgFlag: '5',orderId: doc.order_id},doc.foreman);

            } else {
                common.sendError(res, 'order_02');
                return
            }
            let retData = JSON.parse(JSON.stringify(theOrder));
            common.sendData(res, retData);
        });

    } catch (error) {
        common.sendFault(res, error);
    }
};
/**
 * 移除一个订单的工长与工人
 * @param req
 * @param res
 */
let removeForemanAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        let theOrder = await tb_order.findOne({
            where: {
                order_id: doc.order_id
            }
        });
        if (!theOrder)
            return common.sendError(res, 'order_02');
        theOrder.order_foreman = null;
        await theOrder.save();
        let staff = await tb_staff.findOne({
            where: {
                order_id: doc.order_id,
                staff_type: GLBConfig.TYPE_STAFF[1].value,
                state: GLBConfig.ENABLE
            }
        });
        if (staff)
            await staff.destroy();
        // let tasks = await tb_gantttasks.findAll({
        //     where: {
        //         order_id: doc.order_id,
        //         state: GLBConfig.ENABLE
        //     }
        // });
        // for (let t of tasks) { //删除所有节点的已分配工人
        //     t.leader_id = null;
        //     await t.save();
        // }
        let retData = JSON.parse(JSON.stringify(theOrder));
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
};


/**
 * 添加贷款
 * @param req
 * @param res
 */
let addLoanAct = async(req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        let loan = await tb_loan.findOne({
            where: {
                user_id: user.user_id,
                order_id: doc.order_id,
                state: GLBConfig.ENABLE
            }
        })
        if (loan) {
            return common.sendError(res, 'loan_02');
        }
        let addLoan = await tb_loan.create({
            order_id: doc.order_id,
            domain_id: user.domain_id,
            user_id: user.user_id,
            loan_amount: doc.loan_amount,
        })
        common.sendData(res, addLoan);
    } catch (error) {
        common.sendFault(res, error);
    }
};
