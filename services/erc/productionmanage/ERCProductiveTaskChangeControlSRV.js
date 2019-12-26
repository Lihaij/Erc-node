const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCProductiveTaskControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const sequelize = model.sequelize;
const FDomain = require('../../../bl/common/FunctionDomainBL');
const moment = require('moment')
const task = require('../baseconfig/ERCTaskListControlSRV');
const tb_productivetask = model.erc_productivetask;
const tb_supplier = model.erc_supplier
const tb_materiel = model.erc_materiel
const tb_purchaseapply = model.erc_purchaseapply
const tb_purchaseapplydetail = model.erc_purchaseapplydetail
const tb_taskallot = model.erc_taskallot
const tb_taskallotuser = model.erc_taskallotuser
const tb_purchaseorder = model.erc_purchaseorder
const tb_purchasedetail = model.erc_purchasedetail
// 生产任务单接口
exports.ERCProductiveTaskChangeControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        await initAct(req, res)
    } else if (method === 'getProductivetask') {
        await getProductivetask(req, res)
    } else if (method === 'modifyDate') {
        modifyDate(req, res)
    } else if (method === 'modifyOutSource') {
        modifyOutSource(req, res)
    } else if (method === 'toPurchase') {
        toPurchase(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};

// 初始化基础数据
async function initAct(req, res) {
    try {
        let returnData = {}

        returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'); //单位
        returnData.supplier = await getSupplier(req, res); //单位

        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

async function getSupplier(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = [],
            replacements = []

        let supplier = await tb_supplier.findAll({
            state: 1,
            doamin_id: user.domain_id
        })

        for (let s of supplier) {
            returnData.push({
                id: s.supplier_id,
                value: s.supplier_id,
                text: s.supplier_name
            })
        }
        return returnData
    } catch (error) {
        throw error
    }
}
async function getProductivetask(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {},
            replacements = []

        let queryStr = `select t.productivetask_id,pp.productivetask_code,t.taskdesign_number,
            m.materiel_format,m.materiel_unit,m.materiel_code,m.materiel_name,t.change_state,
            min(ppmaster_date) as minDate,t.biz_code  
            from tbl_erc_ppmaster pp 
            left join tbl_erc_productivetask t on (t.productivetask_code=pp.productivetask_code and pp.state=1)
            left join tbl_erc_materiel m on (t.materiel_id=m.materiel_id and m.state=1) 
            where pp.domain_id=? and pp.state=1`
        replacements = [user.domain_id]
        if (doc.productivetask_id) {
            queryStr += ` and t.productivetask_id = ?`
            replacements.push(doc.productivetask_id)
        }
        queryStr += ` group by t.productivetask_id,pp.productivetask_code,t.taskdesign_number,m.materiel_format,m.materiel_unit,m.materiel_code,m.materiel_name,t.change_state,t.biz_code  
            order by min(ppmaster_date)`
        let result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

async function modifyDate(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {},
            replacements = []

        let diffDate = moment(doc.nowDate).diff(moment(doc.minDate), 'days');
        let queryStr = `update tbl_erc_ppmaster set ppmaster_date = date_add(ppmaster_date, interval ? day) where productivetask_code = ?`
        replacements = [diffDate, doc.productivetask_code]
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.UPDATE
        });
        common.sendData(res, {})
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

async function modifyOutSource(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {},
            replacements = [],
            queryStr = "",
            result

        queryStr = `update tbl_erc_productivetask set outsource_sign = 3,department_id=? where productivetask_code = ?`
        replacements = [doc.department_id, doc.productivetask_code]
        result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.UPDATE
        });

        queryStr = `delete from tbl_erc_ppmaster where productivetask_code = ?`
        replacements = [doc.productivetask_code]
        result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.DELETE
        });

        common.sendData(res, {})
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}


async function toPurchase(req, res) {
    try {
        const doc = common.docTrim(req.body);
        const user = req.user;

        const productivetask = await tb_productivetask.findOne({
            where: {
                state: 1,
                productivetask_code: doc.productivetask_code
            }
        });



        /*//todo  增加采购申请
        let taskallot = await tb_taskallot.findOne({
            where: {
                state: GLBConfig.ENABLE,
                taskallot_name: '生产任务单转采购审核任务'
            }
        });
        let taskallotuser = await tb_taskallotuser.findOne({
            where: {
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id,
                taskallot_id: taskallot.taskallot_id
            }
        });
        if (!taskallotuser) {
            return common.sendError(res, 'topurchase_01');
        } else {
            let applyID = await Sequence.genPurchaseApplyID(user.domain_id);
            let addpurchaseapply = await tb_purchaseapply.create({
                purchaseapply_id: applyID,
                app_domain_id: user.domain_id,
                apply_state: 1,
                apply_approver: taskallotuser.user_id,
                apply_applicant: user.user_id,
                apply_supplier: doc.department_id,
                productivetask_code: doc.productivetask_code
            });

            let materiel = await tb_materiel.findOne({
                where: {
                    state: 1,
                    materiel_id: productivetask.materiel_id
                }
            })
            let addPurchaseApplyDetail = await tb_purchaseapplydetail.create({
                purchaseapply_id: addpurchaseapply.purchaseapply_id,
                order_id: productivetask.order_id,
                materiel_id: productivetask.materiel_id,
                apply_number: productivetask.taskdesign_number,
                apply_money: materiel.materiel_sale * productivetask.taskdesign_number
            });

            let taskName = '生产任务单转采购审核任务';
            let taskDescription = '  生产任务单转采购审核任务';
            let groupId = common.getUUIDByTime(30);
            let taskResult = await task.createTask(user, taskName, 92, taskallotuser.user_id, addpurchaseapply.purchaseapply_id, taskDescription, '', groupId);
            if (!taskResult) {
                return common.sendError(res, 'task_01');
            } else {
                common.sendData(res, {})
            }
        }*/

        const materiel = await tb_materiel.findOne({
            where: {
                state: 1,
                materiel_id: productivetask.materiel_id
            }
        });

        if (!materiel) {
            return common.sendError(res, 'materiel_01');
        }

        await sequelize.transaction(async (trans) => {
            try {
                const applyID = await Sequence.genPurchaseApplyID(user.domain_id);
                const addpurchaseapply = await tb_purchaseapply.create({
                    purchaseapply_id: applyID,
                    app_domain_id: user.domain_id,
                    apply_state: 2,
                    apply_approver: user.user_id,
                    apply_applicant: user.user_id,
                    apply_supplier: doc.department_id,
                    productivetask_code: doc.productivetask_code
                }, {
                    validate: true,
                    transaction: trans
                });

                const addPurchaseApplyDetail = await tb_purchaseapplydetail.create({
                    purchaseapply_id: addpurchaseapply.purchaseapply_id,
                    order_id: productivetask.order_id,
                    materiel_id: productivetask.materiel_id,
                    apply_number: productivetask.taskdesign_number,
                    apply_money: materiel.materiel_sale * productivetask.taskdesign_number
                }, {
                    validate: true,
                    transaction: trans
                });

                const POID = await Sequence.genPurchaseOrderID(user.domain_id);
                const addNcaPurchaseOrder = await tb_purchaseorder.create({
                    purchaseorder_id: POID, //采购单号，PO开头
                    purchaseorder_domain_id: user.domain_id, //采购方
                    order_id: productivetask.order_id, //销售单号
                    order_domain_id: user.domain_id, //销售方
                    purchaseorder_state: 2, //采购单状态，0未审核，1审核拒绝，2审核通过
                    supplier_id: doc.department_id, //供应商id
                    created_at: new Date() //如果记录当前时间，第二天的mrp会重复计算
                }, {
                    validate: true,
                    transaction: trans
                });

                //采购单明细
                const addNcaPurchaseDetail = await tb_purchasedetail.create({
                    purchase_id: POID,
                    materiel_id: productivetask.materiel_id,
                    purchase_number: productivetask.taskdesign_number,
                    purchase_price: materiel.materiel_sale,
                    created_at: new Date(),
                    order_ids: productivetask.order_id
                }, {
                    validate: true,
                    transaction: trans
                });

                // 删除生产任务单,投料，联产品，边余料，生产计划
                const tb_productivetaskrelated = model.erc_productivetaskrelated;
                const tb_productivetaskdetail = model.erc_productivetaskdetail;
                const tb_ppmaster = model.erc_ppmaster;
                const { productivetask_id, productivetask_code } = productivetask;

                await tb_productivetask.destroy({
                    where: {
                        productivetask_id
                    },
                    validate: true,
                    transaction: trans
                });

                await tb_productivetaskrelated.destroy({
                    where: {
                        productivetask_id
                    },
                    validate: true,
                    transaction: trans
                });

                await tb_productivetaskdetail.destroy({
                    where: {
                        productivetask_id
                    },
                    validate: true,
                    transaction: trans
                });

                await tb_ppmaster.destroy({
                    where: {
                        productivetask_code
                    },
                    validate: true,
                    transaction: trans
                });
            } catch (error) {
                throw error;
            }
        });

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
}



async function modifyState(applyState, description, purchaseApplyId, applyApprover, applyDomain_id) {
    try {
        let queryStr = "",
            replacements = []
        let apply = await tb_purchaseapply.findOne({
            where: {
                state: 1,
                purchaseapply_id: purchaseApplyId
            }
        })
        let applydetail = await tb_purchaseapplydetail.findOne({
            where: {
                state: 1,
                purchaseapply_id: purchaseApplyId
            }
        })

        let materiel = await tb_materiel.findOne({
            where: {
                state: 1,
                materiel_id: applydetail.materiel_id
            }
        })

        let productivetask = await tb_productivetask.findOne({
            where: {
                state: 1,
                productivetask_code: apply.productivetask_code
            }
        })
        if (applyState == 2) {
            let POID = await Sequence.genPurchaseOrderID(applyDomain_id);
            let addNcaPurchaseOrder = await tb_purchaseorder.create({
                purchaseorder_id: POID, //采购单号，PO开头
                purchaseorder_domain_id: applyDomain_id, //采购方
                order_id: applydetail.order_id, //销售单号
                order_domain_id: applyDomain_id, //销售方
                purchaseorder_state: 2, //采购单状态，0未审核，1审核拒绝，2审核通过
                supplier_id: apply.apply_supplier, //供应商id
                created_at: new Date() //如果记录当前时间，第二天的mrp会重复计算
            });

            // purchaseapply_id: addpurchaseapply.purchaseapply_id,
            // order_id: productivetask.order_id,
            // materiel_id: productivetask.materiel_id,
            // apply_number: productivetask.taskdesign_number,
            // apply_money: materiel.materiel_sale * productivetask.taskdesign_number


            //采购单明细
            let addNcaPurchaseDetail = await tb_purchasedetail.create({
                purchase_id: POID,
                materiel_id: applydetail.materiel_id,
                purchase_number: applydetail.apply_number,
                purchase_price: materiel.materiel_id,
                created_at: new Date(),
                order_ids: applydetail.order_id
            });
            // 删除生产任务单,投料，联产品，边余料，生产计划


            replacements = [productivetask.productivetask_id]
            queryStr = `delete from tbl_erc_productivetask where productivetask_id = ?` //  生产计划
            result = await sequelize.query(queryStr, {
                replacements: replacements,
                type: sequelize.QueryTypes.DELETE
            });

            queryStr = `delete from tbl_erc_productivetaskrelated where productivetask_id = ?` //  边余料，联产品
            result = await sequelize.query(queryStr, {
                replacements: replacements,
                type: sequelize.QueryTypes.DELETE
            });

            queryStr = `delete from tbl_erc_productivetaskdetail where productivetask_id = ?` //  投料
            result = await sequelize.query(queryStr, {
                replacements: replacements,
                type: sequelize.QueryTypes.DELETE
            });

            queryStr = `delete from tbl_erc_ppmaster where productivetask_code = ?`
            replacements = [productivetask.productivetask_code]
            result = await sequelize.query(queryStr, {
                replacements: replacements,
                type: sequelize.QueryTypes.DELETE
            });
        }
        await tb_purchaseapply.update({
            apply_state: applyState
        }, {
            where: {
                purchaseapply_id: purchaseApplyId
            }
        });

    } catch (error) {
        throw error
    }
}
exports.modifyState = modifyState
