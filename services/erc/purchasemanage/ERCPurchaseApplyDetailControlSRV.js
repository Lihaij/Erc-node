const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCPurchaseApplyDetailControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const sequelize = model.sequelize;
const moment = require('moment');
const task = require('../baseconfig/ERCTaskListControlSRV');
const project11 = require('../baseconfig/ERCProjectControlSRV');
const tb_order = model.erc_order;
const tb_ordermateriel = model.erc_ordermateriel;
const tb_purchaseapply = model.erc_purchaseapply;
const tb_purchaseapplydetail = model.erc_purchaseapplydetail;
const tb_common_apidomain = model.common_apidomain;
const tb_materiel = model.erc_materiel;
const tb_orderroom = model.erc_orderroom;
const tb_projectspacedetail = model.erc_projectspacedetail;
const tb_projectdetail = model.erc_projectdetail;
const tb_taskallot = model.erc_taskallot
const tb_taskallotuser = model.erc_taskallotuser

const tb_purchaseorder = model.erc_purchaseorder; //采购单(包含申请单)
const tb_purchasedetail = model.erc_purchasedetail; //采购单物料明细库存表
const tb_orderworkflow = model.erc_orderworkflow;
const tb_supplier = model.erc_supplier;
const tb_suppliermateriel = model.erc_suppliermateriel;
const {
    CODE_NAME,
    genBizCode
} = require('../../../util/BizCodeUtil');

// 采购申请单明细接口
exports.ERCPurchaseApplyDetailControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'initAct') {
        initAct(req, res)
    } else if (method === 'getPuchaseApply') {
        getPuchaseApply(req, res)
    } else if (method === 'getPuchaseApplyDetail') {
        getPuchaseApplyDetail(req, res)
    } else if (method === 'getSupplerMateiel') {
        getSupplerMateiel(req, res)
    } else if (method === 'getOrderId') {
        getOrderId(req, res)
    } else if (method === 'addPurchaseApplyDetail') {
        addPurchaseApplyDetail(req, res)
    } else if (method === 'saveOrderMateriel') {
        saveOrderMateriel(req, res)
    } else if (method === 'setTaskMrp') {
        setTaskMrp(req, res)
    } else if (method === 'setTaskManual') {
        setTaskManual(req, res)
    } else if (method === 'deletePurchaseApplyDetail') {
        deletePurchaseApplyDetail(req, res)
    } else if (method === 'getOrderpace') {
        getOrderpace(req, res)
    } else if (method === 'getpuchaseApplyPrint') {
        getpuchaseApplyPrint(req, res)
    } else if (method === 'getPOA') {
        getPOA(req, res)
    } else if (method === 'getPOB') {
        getPOB(req, res)
    } else if (method === 'modifyPuchaseApplyDetail') {
        modifyPuchaseApplyDetail(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};

// 初始化基础数据
async function initAct(req, res) {
    let returnData = {},
        user = req.user;
    returnData.batchInfo = GLBConfig.BATCHINFO; //批次
    returnData.projectInfo = GLBConfig.PROJECTORDER; //选择销售订单项目编号
    returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'); //单位
    returnData.mateUseState = GLBConfig.MATEUSESTATE; //单位
    returnData.materielSource = GLBConfig.MATERIELSOURCE; //物料来源
    returnData.materielManage = GLBConfig.MATERIELMANAGE; //管理模式
    returnData.materielSourceKind = GLBConfig.MATERIELSOURCEKIND; //来源分类
    returnData.materielStateManagement = GLBConfig.MATERIELSTATEMANAGEMENT; //物料分类
    returnData.purchaseApplyType = GLBConfig.PURCHASEAPPLYSTATE; //申请单状态
    returnData.supplierInfo = await getSupplier(req.user); //供应商
    returnData.order = await getOrder(req.user) //单号
    common.sendData(res, returnData)
}

async function getOrder(user) {
    try {
        let returnData = []
        let orderResult = await tb_order.findAll({
            where: {
                state: 1,
                domain_id: user.domain_id,
                order_review_state: 2
            }
        })
        for (let o of orderResult) {
            returnData.push({
                id: o.order_id,
                value: o.order_id,
                text: o.order_id
            })
        }
        return returnData
    } catch (error) {
        throw error
    }
}
async function getSupplier(user) {
    try {
        let returnData = []
        let supplierResult = await tb_supplier.findAll({
            where: {
                state: 1,
                domain_id: user.domain_id
            }
        })
        for (let s of supplierResult) {
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
// 查询采购申请单列表
async function getPuchaseApply(req, res) {
    let doc = common.docTrim(req.body),
        user = req.user,
        replacements = [],
        returnData = [];
    let queryStr = `select a.purchaseapply_id,a.apply_state,a.approval_date,a.created_at,
         ap.username as apply_applicant,av.username as apply_approver,a.biz_code,a.data_source  
         from tbl_erc_purchaseapply a
         left join tbl_common_user ap on (a.apply_applicant=ap.user_id and ap.state=1)
         left join tbl_common_user av on (a.apply_approver=av.user_id and av.state=1)
         where a.state=1 `;
    if (doc.purchaseapply_id) {
        queryStr += ' and a.purchaseapply_id=?';
        replacements.push(doc.purchaseapply_id)
    }
    let result = await sequelize.query(queryStr, {
        replacements: replacements,
        type: sequelize.QueryTypes.SELECT
    });
    for (let r of result) {
        let result = JSON.parse(JSON.stringify(r));
        result.created_at = r.created_at.Format("yyyy-MM-dd");
        result.approval_date = (r.approval_date) ? r.approval_date.Format("yyyy-MM-dd") : '';
        result.apply_state_text = GLBConfig.PURCHASEAPPLYSTATE.find((item) => {
            return result.apply_state == item.id;
        }).text

        returnData.push(result)
    }
    common.sendData(res, returnData);
}
// 根据采单主键，查询采购申请单详情
async function getPuchaseApplyDetail(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [],
            returnData = {};

        let queryStr =
            `select pd.*,(pd.apply_number-pd.apply_number_done) as apply_number_surplus,supplier_id_now,
            m.materiel_code,m.materiel_name,m.materiel_format,m.materiel_unit
            from tbl_erc_purchaseapplydetail pd
            left join tbl_erc_materiel m on (pd.materiel_id=m.materiel_id and m.state=1) 
            where pd.state=1 `;
        if (doc.purchaseapply_id) {
            queryStr += ' and pd.purchaseapply_id=?';
            replacements.push(doc.purchaseapply_id);
        }
        if (doc.search_text) {
            queryStr += ' and (m.materiel_code like ? or m.materiel_name like ?)';
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
        }
        queryStr += ` order by pd.order_id,m.materiel_code`
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.order_sign = result.order_id ? result.order_id : '安全库存'
            // result.created_at = r.created_at.Format("yyyy-MM-dd");
            // result.delivery_time = (r.delivery_time)?r.delivery_time.Format("yyyy-MM-dd"):'';
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

async function modifyPuchaseApplyDetail(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        let result = await tb_purchaseapplydetail.findOne({
            where: {
                state: 1,
                purchaseapplydetail_id: doc.purchaseapplydetail_id
            }
        })
        if (result) {
            result.apply_number_now = Number(doc.apply_number_now),
                // result.apply_number_done = Number(result.apply_number_done) + Number(doc.apply_number_now)
                result.supplier_id_now = doc.supplier_id_now
            result.save()
        }
        common.sendData(res, {});
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}
// 查询本机构供应商的物料
async function getSupplerMateiel(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        // let api_name = 'ERCMATERIELCONTROL',dlist = [];
        //
        // dlist.push(user.domain_id);
        // let resultApi = await tb_common_apidomain.findAll({
        //     where: {
        //         api_name: api_name,
        //         domain_id: user.domain_id,
        //         state: GLBConfig.ENABLE,
        //         effect_state:GLBConfig.ENABLE
        //     }
        // });
        // for(let r of resultApi) {
        //     dlist.push(r.follow_domain_id)
        // }
        // let queryInStr= ' in (' + dlist.join(",") + ')';

        let queryStr = `select m.*,d.domain_name,0 as input_number
            from tbl_erc_materiel m
            left join tbl_common_domain d on (m.domain_id=d.domain_id and d.state=1)
            where m.state=1 and m.domain_id = ?`;

        const replacements = [user.domain_id];

        if (doc.search_text) {
            queryStr += ' and (m.materiel_code like ? or m.materiel_name like ?)';
            replacements.push('%' + doc.search_text + '%');
            replacements.push('%' + doc.search_text + '%');
        }
        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data.map(item => ({
            ...item,
            apply_number: 0
        }));

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

// 根据采购申请单主键，增加采购申请单明细
// async function addPurchaseApplyDetail(req, res) {
//     try {
//         let doc = common.docTrim(req.body),
//             user = req.user;

//         if (doc && doc.length != 0) {
//             await tb_purchaseapply.update({
//                 order_type: doc[0].xm_order,
//             }, {
//                 where: {
//                     purchaseapply_id: doc[0].purchaseapply_id
//                 }
//             });
//         }

//         for (let d of doc) {
//             let m = await tb_materiel.findOne({
//                 where: {
//                     materiel_id: d.materiel_id,
//                 }
//             });
//             if (m.domain_id == user.domain_id) {
//                 let queryStr, replacements = [];
//                 queryStr = `select s.supplier_id,s.domain_id,s.supplier_proportion,m.materiel_code,sm.suppliermateriel_purchasepricetax
//                         from tbl_erc_materiel m left join tbl_erc_suppliermateriel sm on m.materiel_id = sm.materiel_id
//                         inner join tbl_erc_supplier s on sm.supplier_id = s.supplier_id and s.state=1
//                         where m.materiel_id = ? and m.domain_id = ?
//                         order by s.supplier_proportion desc`;
//                 replacements.push(d.materiel_id);
//                 replacements.push(m.domain_id);
//                 let result = await sequelize.query(queryStr, {
//                     replacements: replacements,
//                     type: sequelize.QueryTypes.SELECT
//                 });
//                 logger.info(result)
//                 let count = 0,
//                     counta = 0, //每次的个数
//                     c = 0,
//                     endcount = 0; //最终数量
//                 for (let i = 0; i < result.length; i++) {
//                     count += result[i].supplier_proportion;
//                 }
//                 //最后一个供应商不安比例分配，该物料的总采购量-之前每个供应商分配量
//                 for (let i = 0; i < result.length; i++) {
//                     if (i == result.length - 1) {
//                         endcount += (d.apply_number - counta) * result[result.length - 1].suppliermateriel_purchasepricetax
//                     }
//                     if (i != result.length - 1) {
//                         counta += Math.ceil(d.apply_number * (result[i].supplier_proportion / count));
//                         endcount += Math.ceil(d.apply_number * (result[i].supplier_proportion / count)) * result[i].suppliermateriel_purchasepricetax
//                     }
//                 }
//                 if (d.xm_order == 1) {
//                     let addPurchaseApplyDetail = await tb_purchaseapplydetail.create({
//                         purchaseapply_id: d.purchaseapply_id,
//                         order_id: d.order_id,
//                         materiel_id: d.materiel_id,
//                         apply_number: d.apply_number,
//                         apply_money: endcount
//                     });
//                     //common.sendData(res, addPurchaseApplyDetail);

//                 } else {
//                     let addPurchaseApplyDetail = await tb_purchaseapplydetail.create({
//                         purchaseapply_id: d.purchaseapply_id,
//                         order_id: 0,
//                         project_space_id: d.order_id,
//                         materiel_id: d.materiel_id,
//                         apply_number: d.apply_number,
//                         apply_money: endcount
//                     });
//                     //common.sendData(res, addPurchaseApplyDetail);
//                 }

//             } else {
//                 if (d.xm_order == 1) {
//                     let addPurchaseApplyDetail = await tb_purchaseapplydetail.create({
//                         purchaseapply_id: d.purchaseapply_id,
//                         order_id: d.order_id,
//                         materiel_id: d.materiel_id,
//                         apply_number: d.apply_number,
//                         room_id: d.room_id,
//                         apply_money: m.materiel_sale * d.apply_number
//                     });
//                     //common.sendData(res, addPurchaseApplyDetail);
//                 } else {
//                     let addPurchaseApplyDetail = await tb_purchaseapplydetail.create({
//                         purchaseapply_id: d.purchaseapply_id,
//                         project_space_id: d.order_id,
//                         order_id: 0,
//                         materiel_id: d.materiel_id,
//                         apply_number: d.apply_number,
//                         apply_money: m.materiel_sale * d.apply_number
//                     });
//                     //common.sendData(res, addPurchaseApplyDetail);
//                 }
//             }
//         }
//         common.sendData(res);
//     } catch (error) {
//         common.sendFault(res, error);
//         return;
//     }
// }


async function addPurchaseApplyDetail(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;


        for (let m of doc.materielSelects) {
            let detail = await tb_purchaseapplydetail.findOne({
                where: {
                    state: 1,
                    purchaseapply_id: doc.purchaseapply_id,
                    order_id: doc.order_id,
                    materiel_id: m.materiel_id
                }
            })
            let materiel = await tb_materiel.findOne({
                where: {
                    state: 1,
                    domain_id: user.domain_id,
                    materiel_id: m.materiel_id
                }
            })

            if (detail) {
                detail.apply_number = detail.apply_number + m.input_number
                detail.save()
            } else {
                let order_id = ''
                if (materiel.materiel_manage == 2) {
                    order_id = doc.order_id
                }
                let addDetail = await tb_purchaseapplydetail.create({
                    purchaseapply_id: doc.purchaseapply_id,
                    order_id,
                    materiel_id: m.materiel_id,
                    apply_number: m.input_number,
                    apply_number_done: 0,
                    apply_number_now: 0
                })
            }
        }
        common.sendData(res, {});
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 删除采购申请单明细，根据申请单明细主键
async function deletePurchaseApplyDetail(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        let deletePurchaseApplyDetail = await tb_purchaseapplydetail.findOne({
            where: {
                purchaseapplydetail_id: doc.purchaseapplydetail_id
            }
        });
        if (deletePurchaseApplyDetail) {
            deletePurchaseApplyDetail.state = GLBConfig.DISABLE;
            await deletePurchaseApplyDetail.save()
        } else {
            common.sendError(res, 'puchase_apply_03');
            return
        }
        common.sendData(res, deletePurchaseApplyDetail);

    } catch (error) {
        return common.sendFault(res, error);
    }
}

// 根据order_id查询订单户型
async function getOrderpace(req, res) {
    try {
        let user = req.user;
        const returnData = await tb_order.findAll({
            where: {
                purchaser_corporateclients_id: {
                    $not: null
                },
                order_review_state: '2',
                domain_id: user.domain_id
            },
            attributes: [
                ['order_id', 'id'],
                ['biz_code', 'text']
            ]
        });
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

// 打印采购申请单用的查询模块
async function getpuchaseApplyPrint(req, res) {
    let doc = common.docTrim(req.body),
        user = req.user,
        replacements = [],
        returnData = {},
        result;
    try {
        replacements.push(doc.purchaseapply_id);
        queryStr = `select m.*,pad.apply_number from tbl_erc_purchaseapplydetail pad 
        left join tbl_erc_materiel m on (pad.materiel_id=m.materiel_id and m.state=1) 
        where pad.state=1 and pad.purchaseapply_id=?`;
        result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        returnData.data = result;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }

}

// 发送采购单任务
async function setTaskMrp(req, res) {
    try {
        const {
            body,
            user
        } = req

        let taskallot = await tb_taskallot.findOne({
            where: {
                state: GLBConfig.ENABLE,
                taskallot_name: '采购单审核'
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
            return common.sendError(res, 'task_02');
        }

        const POID = await Sequence.genPurchaseOrderID(user.domain_id);
        const biz_code = await genBizCode(CODE_NAME.WLCG, user.domain_id, 6);

        let addNcaPurchaseOrder = await tb_purchaseorder.create({
            purchaseorder_id: POID, //采购单号，PO开头
            purchaseorder_domain_id: user.domain_id, //采购方
            order_id: '', //销售单号
            order_domain_id: user.domain_id, //销售方
            purchaseorder_state: 0, //采购单状态，0未审核，1审核拒绝，2审核通过
            supplier_id: body.supplier_id, //供应商id
            biz_code: biz_code,
            source_apply_id: body.purchaseapply_id
        });

        for (let item of body.applyDetailSelects) {
            let supplierMateriel = await tb_suppliermateriel.findOne({
                where: {
                    state: 1,
                    supplier_id: body.supplier_id,
                    materiel_id: item.materiel_id
                }
            })
            let materiel = await tb_materiel.findOne({
                where: {
                    state: 1,
                    materiel_id: item.materiel_id
                }
            })
            let addNcaPurchaseDetail = await tb_purchasedetail.create({
                purchase_id: POID,
                materiel_id: item.materiel_id,
                purchase_number: item.apply_number_now,
                purchase_price: supplierMateriel ? supplierMateriel.suppliermateriel_purchaseprice : materiel.materiel_cost,
                order_ids: materiel.materiel_manage == 2 ? item.order_id : '',
                source_apply_id: item.purchaseapplydetail_id
            });

            let queryStr = `update tbl_erc_purchaseapplydetail set apply_number_now = 0,apply_number_done = apply_number_done + ? 
                where state = 1 and purchaseapplydetail_id = ?`
            let result = await sequelize.query(queryStr, {
                replacements: [item.apply_number_now, item.purchaseapplydetail_id],
                type: sequelize.QueryTypes.UPDATE
            });
        }

        let taskName = '采购单审核';
        let taskDescription = addNcaPurchaseOrder.purchaseorder_id + '  采购单审核';
        let groupId = common.getUUIDByTime(30);
        let taskResult = await task.createTask(user, taskName, 102, taskallotuser.user_id, addNcaPurchaseOrder.purchaseorder_id, taskDescription, '', groupId);
        if (!taskResult) {
            return common.sendError(res, 'task_02');
        }
        common.sendData(res, {})
    } catch (error) {
        common.sendFault(res, error);
    }
}
async function setTaskManual(req, res) {
    try {
        const {
            body,
            user
        } = req

        let taskallot = await tb_taskallot.findOne({
            where: {
                state: GLBConfig.ENABLE,
                taskallot_name: '采购申请'
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
            return common.sendError(res, 'task_02');
        }

        let taskName = '采购申请';
        let taskDescription = body.purchaseapply_id + '  采购申请';
        let groupId = common.getUUIDByTime(30);
        let taskResult = await task.createTask(user, taskName, 2, taskallotuser.user_id, body.purchaseapply_id, taskDescription, '', groupId);
        if (!taskResult) {
            return common.sendError(res, 'task_02');
        } else {
            await tb_purchaseapply.update({
                apply_state: 1,
                apply_supplier: body.supplier_id
            }, {
                where: {
                    purchaseapply_id: body.purchaseapply_id
                }
            })
        }
        common.sendData(res, {})
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 任务审核后,修改采购单状态
// async function modifyPuchaseApplyState(applyState, description, purchaseApplyId, applyApprover, applyDomain_id) {
//     let NowDoMainId = applyDomain_id

//     await tb_purchaseapply.update({
//         apply_state: applyState,
//         approval_date: new Date(),
//         apply_approver: applyApprover,
//         description: description
//     }, {
//         where: {
//             purchaseapply_id: purchaseApplyId
//         }
//     });

//     if (applyState == 2) {
//         let count = 0;
//         // 申请状态 0待提交，1已提交，2通过,3拒绝
//         let allmoney = await tb_purchaseapplydetail.findAll({
//             where: {
//                 state: GLBConfig.ENABLE,
//                 purchaseapply_id: purchaseApplyId
//             }
//         });
//         //计算当前申请单总金额count
//         for (let a of allmoney) {
//             count += a.apply_money;
//         }

//         let all = await tb_purchaseapplydetail.findOne({
//             where: {
//                 state: GLBConfig.ENABLE,
//                 purchaseapply_id: purchaseApplyId
//             }
//         });

//         let addalready = await tb_projectspacedetail.findOne({
//             where: {
//                 project_space_id: all.project_space_id
//             }
//         });

//         let countEnd;

//         if (addalready) {
//             countEnd = await tb_projectdetail.findOne({
//                 where: {
//                     project_detail_id: addalready.project_detail_id
//                 }
//             });

//             addalready.material_total_final_price = count;
//             await addalready.save();
//             await project11.calculateTotalPrice(addalready.project_detail_id);

//         }


//         let order = await tb_purchaseapplydetail.findAll({
//             attributes: ['order_id'],
//             where: {
//                 state: 1,
//                 purchaseapply_id: purchaseApplyId
//             },
//             group: 'order_id'
//         });

//         for (let o of order) {
//             let applyDetail = await tb_purchaseapplydetail.findAll({
//                 where: {
//                     state: 1,
//                     purchaseapply_id: purchaseApplyId,
//                     order_id: o.order_id,
//                 }
//             });
//             for (let ad of applyDetail) {
//                 let addOrderMateriel = await tb_ordermateriel.create({
//                     order_id: o.order_id,
//                     materiel_id: ad.materiel_id,
//                     materiel_amount: ad.apply_number,
//                     change_state: 2,
//                     room_id: ad.room_id
//                 })
//             }
//         }
//         //开始  生成采购单
//         let datePP = new Date();

//         let queryStr, replacements = [],
//             supplerPurchase = [],
//             thisNum = 0,
//             thisAllNum = 0;
//         queryStr = `select m.domain_id
//                     from tbl_erc_purchaseapplydetail tp,tbl_erc_materiel m  
//                     where tp.materiel_id = m.materiel_id and tp.purchaseapply_id = ?
//                     GROUP BY m.domain_id `;
//         replacements.push(purchaseApplyId);
//         let result = await sequelize.query(queryStr, {
//             replacements: replacements,
//             type: sequelize.QueryTypes.SELECT
//         });
//         if (result && result.length > 0) {
//             for (let r of result) {
//                 //非本机构物料，向对应domainId的机构采购
//                 if (r.domain_id != NowDoMainId) {
//                     let POID = await Sequence.genPurchaseOrderID(NowDoMainId);
//                     let SOID = await Sequence.genSalesOrderID(NowDoMainId);

//                     // 采购单
//                     let addNcaPurchaseOrder = await tb_purchaseorder.create({
//                         purchaseorder_id: POID, //采购单号，PO开头
//                         purchaseorder_domain_id: NowDoMainId, //采购方
//                         order_id: SOID, //销售单号
//                         order_domain_id: r.domain_id, //销售方
//                         purchaseorder_state: 2 //采购单状态，0未审核，1审核拒绝，2审核通过
//                     });

//                     //销售单
//                     let addNcaOrder = await tb_order.create({
//                         order_id: SOID, //销售单号
//                         domain_id: r.domain_id, //销售方
//                         purchase_order_id: POID, //采购单号
//                         purchase_domain_id: NowDoMainId, //采购方
//                         order_type: 8, //订单类型，8采购订单，OTYPEINFO
//                         order_state: 'NEW'
//                     });


//                     ///采购单明细
//                     replacements = [];
//                     queryStr = `select tp.materiel_id ,tp.apply_number,tp.project_space_id as order_ids ,m.materiel_sale 
//                         from tbl_erc_purchaseapplydetail tp, tbl_erc_materiel m
//                         where tp.state = 1 and tp.materiel_id = m.materiel_id and tp.purchaseapply_id = ? and m.domain_id=?`;
//                     replacements.push(purchaseApplyId);
//                     replacements.push(r.domain_id);
//                     let resultDetail = await sequelize.query(queryStr, {
//                         replacements: replacements,
//                         type: sequelize.QueryTypes.SELECT
//                     });


//                     //将resultDetail按matriel_id汇总
//                     let map = {},
//                         dest = [],
//                         existState = 0;
//                     for (let sp of resultDetail) {
//                         dest.push({
//                             materiel_id: sp.materiel_id,
//                             purchase_num: sp.apply_number,
//                             purchase_price: sp.materiel_sale,
//                             order_ids: sp.order_ids
//                         });
//                         map[sp.materiel_id] = sp;
//                     }

//                     for (let rd of dest) {
//                         //采购单明细
//                         let addNcaPurchaseDetail = await tb_purchasedetail.create({
//                             purchase_id: POID,
//                             materiel_id: rd.materiel_id,
//                             purchase_number: rd.purchase_num * countEnd.space_count,
//                             purchase_price: rd.purchase_price,
//                             order_ids: rd.order_ids
//                         });
//                         //销售单明细
//                         let addNcaOrderMateriel = await tb_ordermateriel.create({
//                             order_id: SOID,
//                             materiel_id: rd.materiel_id,
//                             materiel_amount: rd.purchase_num,
//                         });
//                     }

//                     let orderworkflow = await tb_orderworkflow.findOne({
//                         where: {
//                             order_id: SOID,
//                             orderworkflow_state: 'NEW'
//                         }
//                     });

//                     if (!orderworkflow) {
//                         await tb_orderworkflow.create({
//                             order_id: SOID,
//                             orderworkflow_state: 'NEW',
//                             orderworkflow_desc: '新建'
//                         });
//                     }
//                 } else {
//                     replacements = [];
//                     //本机构物料，向本机构供应商采购，按比例分配
//                     queryStr = `select tp.materiel_id ,tp.apply_number,tp.project_space_id as order_ids from tbl_erc_purchaseapplydetail tp, tbl_erc_materiel m
//                                 where tp.state = 1
//                                  and tp.materiel_id = m.materiel_id
//                                   and tp.purchaseapply_id = ? and m.domain_id=?`;
//                     replacements.push(purchaseApplyId);
//                     replacements.push(r.domain_id);
//                     let resultDetail = await sequelize.query(queryStr, {
//                         replacements: replacements,
//                         type: sequelize.QueryTypes.SELECT
//                     });
//                     for (let rd of resultDetail) {
//                         //查询机构对应供应商的采购比例
//                         replacements = [];
//                         queryStr = 'select s.supplier_proportion,s.supplier_id,sm.suppliermateriel_purchaseprice,sm.suppliermateriel_purchasepricetax  ' +
//                             'from tbl_erc_supplier s,tbl_erc_suppliermateriel sm ' +
//                             'where s.state=1 and sm.state=1 and s.supplier_id=sm.supplier_id and s.domain_id=? and sm.materiel_id=? ' +
//                             'order by s.supplier_proportion desc';
//                         replacements.push(NowDoMainId);
//                         replacements.push(rd.materiel_id);
//                         let resultSupplier = await sequelize.query(queryStr, {
//                             replacements: replacements,
//                             type: sequelize.QueryTypes.SELECT
//                         });
//                         let total_proportion = 0;
//                         for (let i = 0; i < resultSupplier.length; i++) {
//                             total_proportion += resultSupplier[i].supplier_proportion;
//                         }
//                         thisNum = 0;
//                         thisAllNum = 0;
//                         for (let i = 0; i < resultSupplier.length; i++) {
//                             //最后一个供应商不安比例分配，该物料的总采购量-之前每个供应商分配量
//                             if (i == resultSupplier.length - 1) {
//                                 if (rd.apply_number - thisAllNum != 0) {
//                                     supplerPurchase.push({
//                                         purchase_domain_id: NowDoMainId,
//                                         supplier_id: resultSupplier[i].supplier_id,
//                                         materiel_id: rd.materiel_id,
//                                         purchase_num: rd.apply_number - thisAllNum,
//                                         purchase_price: resultSupplier[i].suppliermateriel_purchasepricetax,
//                                         order_ids: rd.order_ids
//                                     })
//                                 }
//                             } else {
//                                 thisNum = Math.round(rd.apply_number * (resultSupplier[i].supplier_proportion / total_proportion));
//                                 thisAllNum += thisNum;
//                                 if (thisNum != 0) {
//                                     supplerPurchase.push({
//                                         purchase_domain_id: NowDoMainId,
//                                         supplier_id: resultSupplier[i].supplier_id,
//                                         materiel_id: rd.materiel_id,
//                                         purchase_num: thisNum,
//                                         purchase_price: resultSupplier[i].suppliermateriel_purchasepricetax,
//                                         order_ids: rd.order_ids
//                                     })
//                                 }
//                             }
//                         }
//                     }
//                     //将supplerPurchase按供应商以及物料汇总
//                     let mapSuppler = {},
//                         destSuppler = [],
//                         existState = 0;
//                     for (let sp of supplerPurchase) {
//                         if (!mapSuppler[sp.supplier_id]) {
//                             destSuppler.push({
//                                 purchase_domain_id: sp.purchase_domain_id,
//                                 supplier_id: sp.supplier_id,
//                                 data: [{
//                                     materiel_id: sp.materiel_id,
//                                     purchase_num: sp.purchase_num,
//                                     purchase_price: sp.purchase_price,
//                                     order_ids: sp.order_ids
//                                 }]
//                             });
//                             mapSuppler[sp.supplier_id] = sp;
//                         } else {
//                             for (let ds of destSuppler) {
//                                 if (ds.supplier_id == sp.supplier_id) {
//                                     ds.data.push({
//                                         materiel_id: sp.materiel_id,
//                                         purchase_num: sp.purchase_num,
//                                         purchase_price: sp.purchase_price,
//                                         order_ids: sp.order_ids
//                                     });
//                                     break;
//                                 }
//                             }
//                         }
//                     }
//                     // logger.info(destSuppler);
//                     for (let d of destSuppler) {
//                         let POID = await Sequence.genPurchaseOrderID(NowDoMainId);
//                         let SOID = await Sequence.genSalesOrderID(NowDoMainId);

//                         // 采购单
//                         let addNcaPurchaseOrder = await tb_purchaseorder.create({
//                             purchaseorder_id: POID, //采购单号，PO开头
//                             purchaseorder_domain_id: NowDoMainId, //采购方
//                             order_id: '', //销售单号
//                             order_domain_id: NowDoMainId, //销售方
//                             purchaseorder_state: 2, //采购单状态，0未审核，1审核拒绝，2审核通过
//                             supplier_id: d.supplier_id, //供应商id
//                             created_at: datePP //如果记录当前时间，第二天的mrp会重复计算
//                         });

//                         let space_count = 1;
//                         if (countEnd) {
//                             //施工项订单
//                             space_count = countEnd.space_count
//                         }
//                         for (let ddata of d.data) {
//                             //采购单明细
//                             let addNcaPurchaseDetail = await tb_purchasedetail.create({
//                                 purchase_id: POID,
//                                 materiel_id: ddata.materiel_id,
//                                 purchase_number: ddata.purchase_num * space_count,
//                                 purchase_price: ddata.purchase_price,
//                                 created_at: datePP,
//                                 order_ids: ddata.order_ids
//                             });
//                         }
//                     }
//                 }
//             }
//         }
//         //结束
//     }
// }



async function modifyPuchaseApplyState(applyState, description, purchaseApplyId, applyApprover, applyDomain_id) {

    // 申请状态 0待提交，1已提交，2通过,3拒绝
    let NowDoMainId = applyDomain_id


    if (applyState == 2) {
        // let detail = await tb_purchaseapplydetail.findAll({
        //     where: {
        //         state: 1,
        //         purchaseapply_id: purchaseApplyId,
        //         apply_number_now: {
        //             '$ne': 0
        //         }
        //     }
        // })

        let queryStr = `select p.* from tbl_erc_purchaseapplydetail p 
            where p.state=1 and p.purchaseapply_id = '${purchaseApplyId}' and apply_number_now<>0`
        let detail = await sequelize.query(queryStr, {
            replacements: [],
            type: sequelize.QueryTypes.SELECT
        });

        let apply_supplier_group = [{
            supplier_id_now: '',
            apply_item: []
        }]
        for (let d of detail) {
            if (apply_supplier_group[apply_supplier_group.length - 1].supplier_id_now == d.supplier_id_now) {
                apply_supplier_group[apply_supplier_group.length - 1].apply_item.push(d);
            } else {
                apply_supplier_group.push({
                    supplier_id_now: d.supplier_id_now,
                    apply_item: []
                })
                apply_supplier_group[apply_supplier_group.length - 1].apply_item.push(d);
            }
        }
        logger.info(apply_supplier_group)

        for (let asg of apply_supplier_group) {
            if (asg.supplier_id_now != '') {
                let POID = await Sequence.genPurchaseOrderID(NowDoMainId);
                let biz_code = await genBizCode(CODE_NAME.WLCG, NowDoMainId, 6);
                // 采购单
                let addNcaPurchaseOrder = await tb_purchaseorder.create({
                    purchaseorder_id: POID, //采购单号，PO开头
                    purchaseorder_domain_id: NowDoMainId, //采购方
                    order_id: '', //销售单号
                    order_domain_id: NowDoMainId, //销售方
                    purchaseorder_state: 2, //采购单状态，0未审核，1审核拒绝，2审核通过
                    supplier_id: asg.supplier_id_now, //供应商id
                    // created_at: params.yesterday, //如果记录当前时间，第二天的mrp会重复计算
                    biz_code: biz_code
                });

                for (let item of asg.apply_item) {
                    let supplierMateriel = await tb_suppliermateriel.findOne({
                        where: {
                            state: 1,
                            supplier_id: item.supplier_id_now,
                            materiel_id: item.materiel_id
                        }
                    })

                    let materiel = await tb_materiel.findOne({
                        where: {
                            state: 1,
                            materiel_id: item.materiel_id
                        }
                    })
                    let addNcaPurchaseDetail = await tb_purchasedetail.create({
                        purchase_id: POID,
                        materiel_id: item.materiel_id,
                        purchase_number: item.apply_number_now,
                        purchase_price: supplierMateriel ? supplierMateriel.suppliermateriel_purchaseprice : materiel.materiel_cost,
                        // created_at: params.yesterday,
                        order_ids: materiel.materiel_manage == 2 ? item.order_id : ''
                    });
                }
            }
        }

        queryStr = `update tbl_erc_purchaseapplydetail set apply_number_done = apply_number_done+apply_number_now,apply_number_now = 0,supplier_id_now = '' 
            where purchaseapply_id = '${purchaseApplyId}' and apply_number_now<>0`
        let updateResult = await sequelize.query(queryStr, {
            replacements: [],
            type: sequelize.QueryTypes.UPDATE
        });


        queryStr = `select sum(apply_number) as sumApplyNumber,sum(apply_number_done) as sumApplyNumberDone from tbl_erc_purchaseapplydetail p 
        where p.purchaseapply_id = '${purchaseApplyId}' `
        let sumResult = await sequelize.query(queryStr, {
            replacements: [],
            type: sequelize.QueryTypes.SELECT
        });
        if (sumResult.length) {
            if (Number(sumResult[0].sumApplyNumber) == Number(sumResult[0].sumApplyNumberDone)) {
                await tb_purchaseapply.update({
                    apply_state: 2,
                    approval_date: new Date(),
                    apply_approver: applyApprover,
                    description: description
                }, {
                    where: {
                        purchaseapply_id: purchaseApplyId
                    }
                });
            } else {
                await tb_purchaseapply.update({
                    apply_state: 0,
                    approval_date: new Date(),
                    apply_approver: applyApprover,
                    description: description
                }, {
                    where: {
                        purchaseapply_id: purchaseApplyId
                    }
                });
            }
        }
    } else {
        await tb_purchaseapply.update({
            apply_state: applyState,
            approval_date: new Date(),
            apply_approver: applyApprover,
            description: description
        }, {
            where: {
                purchaseapply_id: purchaseApplyId
            }
        });
    }
}
// 查询已签约，审核中，已开工的订单
async function getPOA(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = [];
        let order = await tb_order.findAll({
            where: {
                state: GLBConfig.ENABLE,
                domain_id: user.domain_id,
                order_type: 1,
                order_state: ['SIGNED', 'REVIEWING', 'WORKING']
            }
        });
        for (let o of order) {
            returnData.push({
                id: o.order_id,
                text: o.order_id,
                value: o.order_id
            })
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 查询施工空间明细
async function getPOB(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = [];
        let order = await tb_projectspacedetail.findAll({
            where: {
                state: GLBConfig.ENABLE
            }
        });
        for (let o of order) {
            returnData.push({
                id: o.project_space_id,
                text: o.project_space_id,
                value: o.project_space_id
            })
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function modifyPuchaseApplyManualState(applyState, description, purchaseApplyId, applyApprover, applyDomain_id) {
    // 申请状态 0待提交，1已提交，2通过,3拒绝
    if (applyState == 2) {
        let purchaseApplyManual = await tb_purchaseapply.findOne({
            where: {
                state: 1,
                purchaseapply_id: purchaseApplyId
            }
        })

        const POID = await Sequence.genPurchaseOrderID(applyDomain_id);
        const biz_code = await genBizCode(CODE_NAME.WLCG, applyDomain_id, 6);

        let addNcaPurchaseOrder = await tb_purchaseorder.create({
            purchaseorder_id: POID, //采购单号，PO开头
            purchaseorder_domain_id: applyDomain_id, //采购方
            order_id: '', //销售单号
            order_domain_id: applyDomain_id, //销售方
            purchaseorder_state: 2, //采购单状态，0未审核，1审核拒绝，2审核通过
            supplier_id: purchaseApplyManual.apply_supplier, //供应商id
            biz_code: biz_code,
            source_apply_id: purchaseApplyId
        });

        let purchaseApplyDetailManual = await tb_purchaseapplydetail.findAll({
            where: {
                state: 1,
                purchaseapply_id: purchaseApplyId,
                apply_number_now: {
                    '$ne': 0
                }
            }
        })
        for (let item of purchaseApplyDetailManual) {
            let supplierMateriel = await tb_suppliermateriel.findOne({
                where: {
                    state: 1,
                    supplier_id: purchaseApplyManual.apply_supplier,
                    materiel_id: item.materiel_id
                }
            })
            let materiel = await tb_materiel.findOne({
                where: {
                    state: 1,
                    materiel_id: item.materiel_id
                }
            })
            let addNcaPurchaseDetail = await tb_purchasedetail.create({
                purchase_id: POID,
                materiel_id: item.materiel_id,
                purchase_number: item.apply_number_now,
                purchase_price: supplierMateriel ? supplierMateriel.suppliermateriel_purchaseprice : materiel.materiel_cost,
                order_ids: materiel.materiel_manage == 2 ? item.order_id : '',
                source_apply_id: item.purchaseapplydetail_id
            });
        }

        queryStr = `update tbl_erc_purchaseapplydetail 
            set apply_number_done = apply_number_done + apply_number_now,
            apply_number_now = 0,supplier_id_now = '' 
            where purchaseapply_id = ? and apply_number_now<>0`
        let updateResult = await sequelize.query(queryStr, {
            replacements: [purchaseApplyId],
            type: sequelize.QueryTypes.UPDATE
        });

        // let queryStr = `select p.* from tbl_erc_purchaseapplydetail p 
        //     where p.state=1 and p.purchaseapply_id = '${purchaseApplyId}' and apply_number_now<>0`
        // let detail = await sequelize.query(queryStr, {
        //     replacements: [],
        //     type: sequelize.QueryTypes.SELECT
        // });

        // let apply_supplier_group = [{
        //     supplier_id_now: '',
        //     apply_item: []
        // }]
        // for (let d of detail) {
        //     if (apply_supplier_group[apply_supplier_group.length - 1].supplier_id_now == d.supplier_id_now) {
        //         apply_supplier_group[apply_supplier_group.length - 1].apply_item.push(d);
        //     } else {
        //         apply_supplier_group.push({
        //             supplier_id_now: d.supplier_id_now,
        //             apply_item: []
        //         })
        //         apply_supplier_group[apply_supplier_group.length - 1].apply_item.push(d);
        //     }
        // }
        // logger.info(apply_supplier_group)

        // for (let asg of apply_supplier_group) {
        //     if (asg.supplier_id_now != '') {
        //         let POID = await Sequence.genPurchaseOrderID(NowDoMainId);
        //         let biz_code = await genBizCode(CODE_NAME.WLCG, NowDoMainId, 6);
        //         // 采购单
        //         let addNcaPurchaseOrder = await tb_purchaseorder.create({
        //             purchaseorder_id: POID, //采购单号，PO开头
        //             purchaseorder_domain_id: NowDoMainId, //采购方
        //             order_id: '', //销售单号
        //             order_domain_id: NowDoMainId, //销售方
        //             purchaseorder_state: 2, //采购单状态，0未审核，1审核拒绝，2审核通过
        //             supplier_id: asg.supplier_id_now, //供应商id
        //             // created_at: params.yesterday, //如果记录当前时间，第二天的mrp会重复计算
        //             biz_code: biz_code
        //         });

        //         for (let item of asg.apply_item) {
        //             let supplierMateriel = await tb_suppliermateriel.findOne({
        //                 where: {
        //                     state: 1,
        //                     supplier_id: item.supplier_id_now,
        //                     materiel_id: item.materiel_id
        //                 }
        //             })

        //             let materiel = await tb_materiel.findOne({
        //                 where: {
        //                     state: 1,
        //                     materiel_id: item.materiel_id
        //                 }
        //             })
        //             let addNcaPurchaseDetail = await tb_purchasedetail.create({
        //                 purchase_id: POID,
        //                 materiel_id: item.materiel_id,
        //                 purchase_number: item.apply_number_now,
        //                 purchase_price: supplierMateriel ? supplierMateriel.suppliermateriel_purchaseprice : materiel.materiel_cost,
        //                 // created_at: params.yesterday,
        //                 order_ids: materiel.materiel_manage == 2 ? item.order_id : ''
        //             });
        //         }
        //     }
        // }

        // queryStr = `update tbl_erc_purchaseapplydetail set apply_number_done = apply_number_done+apply_number_now,apply_number_now = 0,supplier_id_now = '' 
        //     where purchaseapply_id = '${purchaseApplyId}' and apply_number_now<>0`
        // let updateResult = await sequelize.query(queryStr, {
        //     replacements: [],
        //     type: sequelize.QueryTypes.UPDATE
        // });


        // queryStr = `select sum(apply_number) as sumApplyNumber,sum(apply_number_done) as sumApplyNumberDone from tbl_erc_purchaseapplydetail p 
        // where p.purchaseapply_id = '${purchaseApplyId}' `
        // let sumResult = await sequelize.query(queryStr, {
        //     replacements: [],
        //     type: sequelize.QueryTypes.SELECT
        // });
        // if (sumResult.length) {
        //     if (Number(sumResult[0].sumApplyNumber) == Number(sumResult[0].sumApplyNumberDone)) {
        //         await tb_purchaseapply.update({
        //             apply_state: 2,
        //             approval_date: new Date(),
        //             apply_approver: applyApprover,
        //             description: description
        //         }, {
        //             where: {
        //                 purchaseapply_id: purchaseApplyId
        //             }
        //         });
        //     } else {
        //         await tb_purchaseapply.update({
        //             apply_state: 0,
        //             approval_date: new Date(),
        //             apply_approver: applyApprover,
        //             description: description
        //         }, {
        //             where: {
        //                 purchaseapply_id: purchaseApplyId
        //             }
        //         });
        //     }
        // }
    }
    await tb_purchaseapply.update({
        apply_state: applyState,
        approval_date: new Date(),
        apply_approver: applyApprover,
        description: description
    }, {
        where: {
            purchaseapply_id: purchaseApplyId
        }
    });
}
exports.modifyPuchaseApplyState = modifyPuchaseApplyState;
exports.modifyPuchaseApplyManualState = modifyPuchaseApplyManualState