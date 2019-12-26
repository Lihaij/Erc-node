/**
 * 总部订单详情
 */
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const iconvLite = require('iconv-lite');

const config = require('../../../config');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCHDOrderDetailControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const StaffControlSRV = require('./ERCStaffControlSRV');
const MaterielCrmControlSRV = require('./ERCMaterielCrmControlSRV');
const WorkPlanControlSRV = require('./ERCWorkPlanControlSRV');
const AcceptancePlanControlSRV = require('./ERCAcceptancePlanControlSRV');
const ContractControlSRV = require('./ERCContractControlSRV');
const TaskListControlSRV = require('../baseconfig/ERCTaskListControlSRV');

const UserBL = require('../../../bl/UserBL');
const zoweedb = require('../../../zowee/zedb');

const sequelize = model.sequelize;
const tb_template = model.erc_template;
const tb_order = model.erc_order;
const tb_uploadfile = model.erc_uploadfile;
const tb_checkflow = model.erc_checkflow;
const tb_checkmessage = model.erc_checkmessage;
const tb_orderroom = model.erc_orderroom;
const tb_ordermateriel = model.erc_ordermateriel;
const tb_materiel = model.erc_materiel;
const tb_orderworkflow = model.erc_orderworkflow;
const tb_user = model.common_user;
const tb_staff = model.erc_staff;
const tb_assignment = model.erc_assignment;
const tb_history = model.erc_history;
const tb_roomtype = model.erc_roomtype;
const tb_orderrequire = model.erc_orderrequire;
const tb_orderdesign = model.erc_orderdesign;
const tb_orderinternalreview = model.erc_orderinternalreview;
const tb_erc_orderreview = model.erc_orderreview;
const tb_estate = model.erc_estate;
const tb_estateroom = model.erc_estateroom;
const tb_produce = model.erc_produce;
const tb_zoweeprocess = model.erc_zoweeprocess;

exports.ERCHDOrderDetailControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search_order') {
        searchOrderAct(req, res)
    } else if (method === 'search_temp') {
        searchTemplateAct(req, res)
    } else if (method === 'saveOrder') {
        saveOrderAct(req, res)
    } else if (method === 'search_check') {
        searchCheckAct(req, res)
    } else if (method === 'check') {
        checkAct(req, res)
    } else if (method === 'upload') {
        uploadAct(req, res)
    } else if (method === 'addOrderRoom') {
        addOrderRoomAct(req, res)
    } else if (method === 'deleteOrderRoom') {
        deleteOrderRoomAct(req, res)
    } else if (method === 'StaffControlSRV_search') {
        StaffControlSRV.searchAct(req, res);
    } else if (method === 'StaffControlSRV_delete') {
        StaffControlSRV.deleteAct(req, res);
    } else if (method === 'MaterielCrmControlSRV_init') {
        MaterielCrmControlSRV.initAct(req, res);
    } else if (method === 'MaterielCrmControlSRV_search') {
        MaterielCrmControlSRV.searchAct(req, res);
    } else if (method === 'MaterielCrmControlSRV_searchArray') {
        MaterielCrmControlSRV.searchArrayAct(req, res);
    } else if (method === 'MaterielCrmControlSRV_search_mat') {
        MaterielCrmControlSRV.searchMat(req, res);
    } else if (method === 'MaterielCrmControlSRV_add') {
        MaterielCrmControlSRV.addAct(req, res);
    } else if (method === 'MaterielCrmControlSRV_generate') {
        MaterielCrmControlSRV.generateAct(req, res);
    } else if (method === 'MaterielCrmControlSRV_modify') {
        MaterielCrmControlSRV.modifyAct(req, res);
    } else if (method === 'MaterielCrmControlSRV_changeState') {
        MaterielCrmControlSRV.changeStateAct(req, res);
    } else if (method === 'MaterielCrmControlSRV_delete') {
        MaterielCrmControlSRV.deleteAct(req, res);
    } else if (method === 'MaterielCrmControlSRV_check') {
        MaterielCrmControlSRV.checkAct(req, res);
    } else if (method === 'MaterielCrmControlSRV_searchChangeHistory') {
        MaterielCrmControlSRV.searchChangeHistoryAct(req, res);
    } else if (method === 'downloadTemplate') {
        downloadTemplate(req, res);
    } else if (method === 'importSpace') {
        importSpace(req, res);
    } else if (method === 'importMaterial') {
        importMaterial(req, res);
    } else if (method === 'importMaterialAll') {
        importMaterialAll(req, res);
    } else if (method === 'getOrderRoom') {
        getOrderRoom(req, res);
    } else if (method === 'contract_init') {
        ContractControlSRV.initAct(req, res);
    } else if (method === 'contract_search') {
        ContractControlSRV.searchAct(req, res);
    } else if (method === 'contract_modify') {
        ContractControlSRV.modifyAct(req, res);
    } else if (method === 'contract_add_f') {
        ContractControlSRV.addFileAct(req, res);
    } else if (method === 'contract_modify_f') {
        ContractControlSRV.modifyFileAct(req, res);
    } else if (method === 'contract_delete') {
        ContractControlSRV.deleteAct(req, res);
    } else if (method === 'contract_receivables_add') {
        ContractControlSRV.receivablesAdd(req, res);
    } else if (method === 'contract_receivables_search') {
        ContractControlSRV.receivablesSearch(req, res);
    } else if (method === 'contract_receivables_modify') {
        ContractControlSRV.receivablesModify(req, res);
    } else if (method === 'contract_receivables_delete') {
        ContractControlSRV.receivablesDelete(req, res);
    } else if (method === 'workplan_init') {
        WorkPlanControlSRV.initAct(req, res);
    } else if (method === 'workplan_search') {
        WorkPlanControlSRV.searchAct(req, res);
    } else if (method === 'workplan_modify') {
        WorkPlanControlSRV.modifyAct(req, res);
    } else if (method === 'workplan_modify_d') {
        WorkPlanControlSRV.modifyDateAct(req, res);
    } else if (method === 'workplan_search_w') {
        WorkPlanControlSRV.searchWorkLog(req, res);
    } else if (method === 'workplan_searchModifyLog') {
        WorkPlanControlSRV.searchModifyLogAct(req, res);
    } else if (method === 'workplan_generate_plan') {
        WorkPlanControlSRV.generateAct(req, res);
    } else if (method === 'acceptance_plan_init') {
        AcceptancePlanControlSRV.initAct(req, res);
    } else if (method === 'acceptance_search') {
        AcceptancePlanControlSRV.searchAct(req, res);
    } else if (method === 'acceptance_detail') {
        AcceptancePlanControlSRV.detailAct(req, res);
    } else if (method === 'acceptance_check') {
        AcceptancePlanControlSRV.checkAct(req, res);
    } else if (method === 'get_totalCost') { //计算物料总价
        getTotalCostAct(req, res);
    } else if (method === 'save_interestRate') { //保存毛利率
        saveInterestRateAct(req, res);
    } else if (method === 'search_internal_review') {
        searchInternalReviewAct(req, res);
    } else if (method === 'start_internal_review') {
        startInternalReviewAct(req, res);
    } else if (method === 'set_duty') {
        setDutyAct(req, res);
    } else if (method === 'inter_review_update') {
        interReviewUpdateAct(req, res);
    } else if (method === 'delete_file') {
        deleteFileAct(req, res);
    } else if (method === 'start_order_review') {
        startOrderReviewAct(req, res);
    } else if (method === 'start_order') {
        startOrderAct(req, res);
    } else if (method === 'search_order_review') {
        searchOrderReviewAct(req, res);
    } else if (method === 'set_order_review_duty') {
        setOrderReviewDutyAct(req, res);
    } else if (method === 'search_order_design') {
        searchOrderDesignAct(req, res);
    } else if (method === 'design_update') {
        designUpdareAct(req, res);
    } else if (method === 'bom_sync') {
        bomSyncAct(req, res);
    } else if (method === 'edit_file_url') {
        editFileUrlAct(req, res);
    } else if (method === 'getEstate') {
        getEstate(req, res)
    } else if (method === 'getBuild') {
        getBuild(req, res)
    } else if (method === 'getUnit') {
        getUnit(req, res)
    } else if (method === 'getRoomNo') {
        getRoomNo(req, res)
    } else if (method === 'getRoomType') {
        getRoomType(req, res)
    } else if (method === 'getZoweePrecess') {
        getZoweePrecess(req, res)
    } else if (method === 'putZoweePrecess') {
        putZoweePrecess(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};
// 初始化基础数据
let initAct = async (req, res) => {
    try {
        let doc = req.body;
        let user = req.user;
        let returnData = {
            // houseTypeInfo: GLBConfig.HTYPEINFO,
            roomTypeInfo: GLBConfig.ROOMTYPE,
            checkStateInfo: GLBConfig.CHECKSTATEINFO,
            checkOwnerInfo: GLBConfig.CHECKOWNERINFO,
            authTypeInfo: GLBConfig.AUTHTYPEINFO,
            projectTypeInfo: GLBConfig.OTYPEINFO,
            orderStateInfo: GLBConfig.ORDERSTATEINFO,
            roleInfo: GLBConfig.TYPE_STAFF,
            tfInfo: GLBConfig.TFINFO,
            fileTypeInfo: GLBConfig.FILESRVTYPE,
            unitInfo: await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'), //单位
            purchaseTypeInfo: GLBConfig.PURCHASESTATE,
            batchInfo: GLBConfig.BATCHINFO, //批次
            changeTypeInfo: GLBConfig.CHANGETYPE, //变更类型
            materialTypeInfo: GLBConfig.MATERIELTYPE, //物料分类
            purchaseSourceInfo: GLBConfig.MATERIELSOURCE, //采购来源
            changeStateInfo: GLBConfig.CHANGESTATE, //审核状态
            materielSourceInfo: GLBConfig.MATERIELSOURCE, //物料来源
            materielProcedure: GLBConfig.MATERIELPROCEDURE, //工序
            roomMaterialinfo: GLBConfig.ROOMMATERIALINFO, //是否订制品
            orderReviewStatusInfo: GLBConfig.ORDERCHECKSTATE
        };

        let roomtypeId = await tb_order.find({
            where: {
                state: GLBConfig.ENABLE,
                order_id: doc.order_id
            }
        })
        let roomtype = await tb_roomtype.findAll({
            where: {
                state: GLBConfig.ENABLE,
                roomtype_id: roomtypeId.roomtype_id
            }
        })
        returnData.roomtype = [];
        for (let t of roomtype) {
            returnData.roomtype.push({
                id: t.roomtype_id,
                value: t.name,
                text: t.name
            })
        }
        //orderhousearea
        let orderhousearea = await tb_roomtype.findAll({
            where: {
                state: GLBConfig.ENABLE,
                roomtype_id: roomtypeId.roomtype_id
            }
        })
        returnData.orderhousearea = [];
        for (let t of orderhousearea) {
            returnData.orderhousearea.push({
                id: t.roomtype_id,
                value: t.acreage,
                text: t.acreage
            })
        }
        //estatetype
        let estateId = await tb_order.find({
            where: {
                state: GLBConfig.ENABLE,
                order_id: doc.order_id
            }
        })
        let estatetype = await tb_estate.findAll({
            where: {
                state: GLBConfig.ENABLE,
                estate_id: estateId.estate_id
            }
        })
        returnData.estatetype = [];
        for (let t of estatetype) {
            returnData.estatetype.push({
                id: t.estate_id,
                value: t.estate_name,
                text: t.estate_name
            })
        }
        //buildtype
        let estateroomId = await tb_order.find({
            where: {
                state: GLBConfig.ENABLE,
                order_id: doc.order_id
            }
        })
        let buildtype = await tb_estateroom.findAll({
            where: {
                state: GLBConfig.ENABLE,
                room_id: estateroomId.estate_room_id
            }
        })
        returnData.buildtype = [];
        for (let t of buildtype) {
            returnData.buildtype.push({
                id: t.room_id,
                value: t.build,
                text: t.build
            })
        }
        //unittype
        let unittype = await tb_estateroom.findAll({
            where: {
                state: GLBConfig.ENABLE,
                room_id: estateroomId.estate_room_id
            }
        })
        returnData.unittype = [];
        for (let t of unittype) {
            returnData.unittype.push({
                id: t.room_id,
                value: t.unit,
                text: t.unit
            })
        }
        //roomnotype
        let roomnotype = await tb_estateroom.findAll({
            where: {
                state: GLBConfig.ENABLE,
                room_id: estateroomId.estate_room_id
            }
        })
        returnData.roomnotype = [];
        for (let t of roomnotype) {
            returnData.roomnotype.push({
                id: t.room_id,
                value: t.room_no,
                text: t.room_no
            })
        }
        let templates = await tb_template.findAll({
            where: {
                state: GLBConfig.ENABLE
            }
        });
        returnData.templateInfo = [];
        for (let t of templates) {
            returnData.templateInfo.push({
                id: t.template_id,
                value: t.template_id,
                text: t.template_name
            })
        }
        // employees
        let employees = await tb_user.findAll({
            where: {
                domain_id: user.domain_id,
                user_type: {
                    $in: [GLBConfig.TYPE_OPERATOR, GLBConfig.TYPE_SUPERVISION]
                },
                state: GLBConfig.ENABLE
            }
        });
        returnData.employeeInfo = [];
        for (let e of employees) {
            returnData.employeeInfo.push({
                id: e.user_id,
                text: e.name,
                phone: user.phone
            })
        }
        let supervision = await UserBL.getSpecialGroupUser(user.domain_id, GLBConfig.TYPE_SUPERVISION);
        returnData.supervision = [];
        for (let s of supervision) {
            returnData.supervision.push({
                id: s.user_id,
                text: s.name
            });
        }
        let foreman = await UserBL.getTypeUser(user.domain_id, GLBConfig.TYPE_FOREMAN);
        returnData.foreman = [];
        for (let f of foreman) {
            returnData.foreman.push({
                id: f.user_id,
                text: f.name
            });
        }
        //assignment
        let findA = await tb_assignment.findOne({
            where: {
                domain_id: user.domain_id
            }
        });
        returnData.assignment = JSON.parse(JSON.stringify(findA))

        let requireInfo = await tb_orderrequire.findAll({
            where: {
                state: GLBConfig.ENABLE,
                type_id: '4'
            }
        })
        returnData.orderReviewInfo = requireInfo;


        let produce = await sequelize.query('select a.produce_id as id, a.produce_id as value, b.materiel_name as text from tbl_erc_produce a left join tbl_erc_materiel b on (a.materiel_id=b.materiel_id) where b.state = 1 and a.state = 1 and a.domain_id = ? and b.materiel_type = 10', {
            replacements: [user.domain_id],
            type: sequelize.QueryTypes.SELECT
        });
        returnData.produceInfo = produce;

        common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
// 查询订单
let searchOrderAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);

        let queryRst = await sequelize.query('select * from tbl_erc_order a left join tbl_common_user b on (a.user_id=b.user_id) where a.order_id = ?', {
            replacements: [doc.order_id],
            type: sequelize.QueryTypes.SELECT
        });

        if (queryRst.length <= 0) {
            common.sendError(res, 'order_02');
            return
        }

        let retData = JSON.parse(JSON.stringify(queryRst[0]));
        delete retData.password;

        let orderworkflow = await tb_orderworkflow.findAll({
            where: {
                order_id: retData.order_id
            }
        });

        retData.statedict = {};
        for (let owf of orderworkflow) {
            retData.statedict[owf.orderworkflow_state] = owf.created_at.Format("yyyy-MM-dd")
        }
        let staffs = await tb_staff.findAll({
            where: {
                order_id: doc.order_id,
                state: GLBConfig.ENABLE
            }
        });
        for (let s of staffs) {
            if (s.staff_type == GLBConfig.TYPE_STAFF[0].value)
                retData.order_supervision = s.user_id;
            if (s.staff_type == GLBConfig.TYPE_STAFF[1].value)
                retData.order_foreman = s.user_id;
            if (s.staff_type == GLBConfig.TYPE_STAFF[3].value)
                retData.designer_id = s.user_id;
            if (s.staff_type == GLBConfig.TYPE_STAFF[4].value)
                retData.design_checker = s.user_id;
            if (s.staff_type == GLBConfig.TYPE_STAFF[5].value)
                retData.materiel_checker = s.user_id;
            if (s.staff_type == GLBConfig.TYPE_STAFF[6].value)
                retData.price_checker = s.user_id;
            if (s.staff_type == GLBConfig.TYPE_STAFF[7].value)
                retData.change_checker = s.user_id;
            if (s.staff_type == GLBConfig.TYPE_STAFF[8].value)
                retData.sales_id = s.user_id;
        }

        let historys = await tb_history.findAll({
            where: {
                order_id: doc.order_id,
                state: GLBConfig.ENABLE
            }
        });
        retData.history = [];
        for (let h of historys) {
            let row = JSON.parse(JSON.stringify(h));
            retData.history.push(row)
        }

        // rooms
        let rooms = await tb_orderroom.findAll({
            where: {
                order_id: retData.order_id
            }
        });
        retData.roomsInfo = [];
        for (let r of rooms) {
            let row = JSON.parse(JSON.stringify(r));
            row.id = r.room_id
            row.text = r.room_name
            retData.roomsInfo.push(row)
        }


        let estateInfo = await tb_estate.findOne({
            where: {
                state: GLBConfig.ENABLE,
                estate_id: retData.estate_id
            }
        });
        if (estateInfo) {
            retData.province = estateInfo.province;
            retData.city = estateInfo.city;
            retData.district = estateInfo.district;
        }

        let estateRoom = await tb_estateroom.findOne({
            where: {
                state: GLBConfig.ENABLE,
                room_id: retData.estate_room_id
            }
        });
        if (estateRoom) {
            retData.build = estateRoom.build;
            retData.unit = estateRoom.unit;
            retData.room_id = estateRoom.room_id;
        }
        common.sendData(res, retData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
// 查询模板
let searchTemplateAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let template = await tb_template.findOne({
            where: {
                template_id: doc.template_id,
                state: GLBConfig.ENABLE
            }
        });
        if (!template) {
            return common.sendError(res, 'orderdetail_01');
        }
        common.sendData(res, template)
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 保存订单
let saveOrderAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        await common.transaction(async function(t) {
            let order = await tb_order.findOne({
                where: {
                    order_id: doc.order_id,
                    state: GLBConfig.ENABLE
                },
                transaction: t
            });
            let template = await tb_template.findOne({
                where: {
                    template_id: doc.template_id,
                    state: GLBConfig.ENABLE
                }
            });
            if (!order) {
                common.sendError(res, 'orderdetail_01');
                return
            }

            order.estate_id = doc.estate_id; //小区
            order.roomtype_id = doc.roomtype_id; //户型
            order.estate_room_id = doc.estate_room_id //房间号
            order.order_house_area = doc.order_house_area; //面积
            order.project_type = doc.project_type; //工程类型
            order.order_address = doc.order_address; //装修地址
            order.sales_id = doc.sales_id; //业务员
            order.designer_id = doc.designer_id; //设计师
            order.order_supervision = doc.order_supervision; //监理
            order.order_foreman = doc.order_foreman; //工长
            order.order_remark = doc.order_remark; //订单描述
            order.produce_id = doc.produce_id;
            order.earnest = doc.earnest;
            order.actual_start_date = doc.actual_start_date;

            if (template)
                order.pre_offer = parseFloat(template.average_price) * parseFloat(order.order_house_area);
            if (order.order_state === 'NEW') {
                order.order_state = 'DESIGNING'
            }
            await order.save({
                transaction: t
            });
            let orderworkflow = await tb_orderworkflow.findOne({
                where: {
                    order_id: doc.order_id,
                    orderworkflow_state: 'DESIGNING'
                },
                transaction: t
            });

            if (!orderworkflow) {
                await tb_orderworkflow.create({
                    order_id: order.order_id,
                    orderworkflow_state: 'DESIGNING',
                    orderworkflow_desc: '设计中'
                }, {
                    transaction: t
                })
            }
            let history = await tb_history.findOne({
                where: {
                    order_id: doc.order_id,
                    order_state: 'DESIGNING'
                }
            });
            if (!history) {
                await tb_history.create({
                    order_id: order.order_id,
                    order_state: 'DESIGNING',
                    history_event: '订单详情',
                    history_content: '保存订单',
                    operator_name: user.name
                })
            }
            if (doc.order_supervision != null && doc.order_supervision != '') {
                let user = await tb_user.findOne({
                    where: {
                        user_id: doc.order_supervision,
                        state: GLBConfig.ENABLE
                    },
                    transaction: t
                });
                let staff = await tb_staff.findOne({
                    where: {
                        order_id: doc.order_id,
                        staff_type: GLBConfig.TYPE_STAFF[0].value,
                        state: GLBConfig.ENABLE
                    }
                });
                if (staff) {
                    staff.user_id = doc.order_supervision;
                    await staff.save({
                        transaction: t
                    });
                } else await tb_staff.create({
                    order_id: doc.order_id,
                    staff_type: GLBConfig.TYPE_STAFF[0].value,
                    user_id: doc.order_supervision,
                    staff_phone: user.phone
                }, {
                    transaction: t
                });
                order.order_supervision = doc.order_supervision;
            }
            if (doc.order_foreman != null && doc.order_foreman != '') {
                let user = await tb_user.findOne({
                    where: {
                        user_id: doc.order_foreman,
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
                    staff.user_id = doc.order_foreman;
                    await staff.save({
                        transaction: t
                    });
                } else await tb_staff.create({
                    order_id: doc.order_id,
                    staff_type: GLBConfig.TYPE_STAFF[1].value,
                    user_id: doc.order_foreman,
                    staff_phone: user.phone
                }, {
                    transaction: t
                });
                order.order_foreman = doc.order_foreman;
            }
            if (doc.sales_id != null && doc.sales_id != '') {
                let user = await tb_user.findOne({
                    where: {
                        user_id: doc.sales_id,
                        state: GLBConfig.ENABLE
                    },
                    transaction: t
                });
                let staff = await tb_staff.findOne({
                    where: {
                        order_id: doc.order_id,
                        staff_type: GLBConfig.TYPE_STAFF[8].value,
                        state: GLBConfig.ENABLE
                    }
                });
                if (staff) {
                    staff.user_id = doc.sales_id;
                    await staff.save({
                        transaction: t
                    });
                } else await tb_staff.create({
                    order_id: doc.order_id,
                    staff_type: GLBConfig.TYPE_STAFF[8].value,
                    user_id: doc.sales_id,
                    staff_phone: user.phone
                }, {
                    transaction: t
                });
                order.sales_id = doc.sales_id;
            }
            if (doc.designer_id != null && doc.designer_id != '') {
                let user = await tb_user.findOne({
                    where: {
                        user_id: doc.designer_id,
                        state: GLBConfig.ENABLE
                    },
                    transaction: t
                });
                let staff = await tb_staff.findOne({
                    where: {
                        order_id: doc.order_id,
                        staff_type: GLBConfig.TYPE_STAFF[3].value,
                        state: GLBConfig.ENABLE
                    }
                });
                if (staff) {
                    staff.user_id = doc.designer_id;
                    await staff.save({
                        transaction: t
                    });
                } else await tb_staff.create({
                    order_id: doc.order_id,
                    staff_type: GLBConfig.TYPE_STAFF[3].value,
                    user_id: doc.designer_id,
                    staff_phone: user.phone
                }, {
                    transaction: t
                });
                order.designer_id = doc.designer_id;
            }
            if (doc.design_checker != null && doc.design_checker != '') {
                let user = await tb_user.findOne({
                    where: {
                        user_id: doc.design_checker,
                        state: GLBConfig.ENABLE
                    },
                    transaction: t
                });
                let staff = await tb_staff.findOne({
                    where: {
                        order_id: doc.order_id,
                        staff_type: GLBConfig.TYPE_STAFF[4].value,
                        state: GLBConfig.ENABLE
                    }
                });
                if (staff) {
                    staff.user_id = doc.design_checker;
                    await staff.save({
                        transaction: t
                    });
                } else await tb_staff.create({
                    order_id: doc.order_id,
                    staff_type: GLBConfig.TYPE_STAFF[4].value,
                    user_id: doc.design_checker,
                    staff_phone: user.phone
                }, {
                    transaction: t
                });
                order.design_checker = doc.design_checker;
            }
            if (doc.materiel_checker != null && doc.materiel_checker != '') {
                let user = await tb_user.findOne({
                    where: {
                        user_id: doc.materiel_checker,
                        state: GLBConfig.ENABLE
                    },
                    transaction: t
                });
                let staff = await tb_staff.findOne({
                    where: {
                        order_id: doc.order_id,
                        staff_type: GLBConfig.TYPE_STAFF[5].value,
                        state: GLBConfig.ENABLE
                    }
                });
                if (staff) {
                    staff.user_id = doc.materiel_checker;
                    await staff.save({
                        transaction: t
                    });
                } else await tb_staff.create({
                    order_id: doc.order_id,
                    staff_type: GLBConfig.TYPE_STAFF[5].value,
                    user_id: doc.materiel_checker,
                    staff_phone: user.phone
                }, {
                    transaction: t
                });
                order.materiel_checker = doc.materiel_checker;
            }
            if (doc.price_checker != null && doc.price_checker != '') {
                let user = await tb_user.findOne({
                    where: {
                        user_id: doc.price_checker,
                        state: GLBConfig.ENABLE
                    },
                    transaction: t
                });
                let staff = await tb_staff.findOne({
                    where: {
                        order_id: doc.order_id,
                        staff_type: GLBConfig.TYPE_STAFF[6].value,
                        state: GLBConfig.ENABLE
                    }
                });
                if (staff) {
                    staff.user_id = doc.price_checker;
                    await staff.save({
                        transaction: t
                    });
                } else await tb_staff.create({
                    order_id: doc.order_id,
                    staff_type: GLBConfig.TYPE_STAFF[6].value,
                    user_id: doc.price_checker,
                    staff_phone: user.phone
                }, {
                    transaction: t
                });
                order.price_checker = doc.price_checker;
            }
            if (doc.change_checker != null && doc.change_checker != '') {
                let user = await tb_user.findOne({
                    where: {
                        user_id: doc.change_checker,
                        state: GLBConfig.ENABLE
                    },
                    transaction: t
                });
                let staff = await tb_staff.findOne({
                    where: {
                        order_id: doc.order_id,
                        staff_type: GLBConfig.TYPE_STAFF[7].value,
                        state: GLBConfig.ENABLE
                    }
                });
                if (staff) {
                    staff.user_id = doc.change_checker;
                    await staff.save({
                        transaction: t
                    });
                } else await tb_staff.create({
                    order_id: doc.order_id,
                    staff_type: GLBConfig.TYPE_STAFF[7].value,
                    user_id: doc.change_checker,
                    staff_phone: user.phone
                }, {
                    transaction: t
                });
                order.change_checker = doc.change_checker;
            }
            let retData = JSON.parse(JSON.stringify(order));
            return common.sendData(res, retData);
        });
    } catch (error) {
        return common.sendFault(res, error)
    }
};

//废弃
let addMeasureAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let addMeasure = await tb_measure.create({
            order_id: doc.order_id,
            measure_room: doc.measure_room,
            measure_length: doc.measure_length,
            measure_width: doc.measure_width,
            measure_height: doc.measure_height,
            measure_pillar: doc.measure_pillar,
            measure_desc: doc.measure_desc,
            measure_creator: user.name,
            has_bay_window: doc.has_bay_window,
            has_downcomer: doc.has_downcomer
        });
        let retData = JSON.parse(JSON.stringify(addMeasure));
        retData.created_time = addMeasure.created_at.Format("yyyy-MM-dd");
        retData.images = []
        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
let modifyMeasureAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        let api_name = common.getApiName(req.path)
        let modiMeasure = await tb_measure.findOne({
            where: {
                measure_id: doc.old.measure_id
            }
        });
        if (modiMeasure) {
            modiMeasure.measure_room = doc.new.measure_room;
            modiMeasure.measure_length = doc.new.measure_length;
            modiMeasure.measure_width = doc.new.measure_width;
            modiMeasure.measure_height = doc.new.measure_height;
            modiMeasure.measure_pillar = doc.new.measure_pillar;
            modiMeasure.measure_desc = doc.new.measure_desc;
            modiMeasure.space3d_url = doc.new.space3d_url;
            await modiMeasure.save()

            for (let m of doc.new.images) {
                if (typeof(m) === 'object') {
                    let fileUrl = await common.fileMove(m.url, 'upload')
                    let addFile = await tb_uploadfile.create({
                        api_name: api_name,
                        order_id: modiMeasure.order_id,
                        file_name: m.name,
                        file_url: fileUrl,
                        file_type: m.type,
                        srv_id: modiMeasure.measure_id,
                        file_creator: user.name
                    });
                }
            }
        } else {
            common.sendError(res, 'measure_01');
            return
        }
        let retData = JSON.parse(JSON.stringify(modiMeasure));
        retData.created_time = modiMeasure.created_at.Format("yyyy-MM-dd");
        retData.images = []
        let ifs = await tb_uploadfile.findAll({
            where: {
                api_name: api_name,
                order_id: modiMeasure.order_id,
                srv_id: modiMeasure.measure_id,
                state: GLBConfig.ENABLE
            }
        })
        for (let i of ifs) {
            retData.images.push(i.file_url)
        }
        common.sendData(res, retData);

    } catch (error) {
        common.sendFault(res, error);
        return null
    }
};
let deleteMeasureAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let delMeasure = await tb_measure.findOne({
            where: {
                measure_id: doc.measure_id,
                state: GLBConfig.ENABLE
            }
        });
        if (delMeasure) {
            delMeasure.state = GLBConfig.DISABLE;
            await delMeasure.save();
            return common.sendData(res);
        } else {
            return common.sendError(res, 'measure_01');
        }
    } catch (error) {
        return common.sendFault(res, error);
    }
};

// 上传
let uploadAct = async (req, res) => {
    try {
        let fileInfo = await common.fileSave(req)
        common.sendData(res, fileInfo)
    } catch (error) {
        common.sendFault(res, error)
    }
};
// 查询验收信息
let searchCheckAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);

        let cms = await tb_checkmessage.findAll({
            where: {
                order_id: doc.order_id,
                check_type: doc.check_type,
                state: GLBConfig.ENABLE
            }
        });
        let returnData = []
        for (let cm of cms) {
            let cmj = JSON.parse(JSON.stringify(cm))
            cmj.created_time = cm.created_at.Format("yyyy-MM-dd hh:mm")
            returnData.push(cmj)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

// 增加订单节点
let checkAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let order = await tb_order.findOne({
            where: {
                order_id: doc.order_id
            }
        });

        if (!order) {
            return common.sendError(res, 'orderdetail_01')
        }

        let cf = await tb_checkflow.findOne({
            where: {
                order_id: doc.order_id,
                check_type: doc.check_type,
                check_state: '0',
                check_owner: doc.check_owner,
                state: GLBConfig.ENABLE
            }
        });
        if (!cf) {
            return common.sendError(res, 'check_01');
        }
        cf.check_state = doc.check_state
        cf.operater_id = user.user_id
        cf.operater_name = user.name
        await cf.save()

        let addCm = await tb_checkmessage.create({
            check_id: cf.check_id,
            order_id: cf.order_id,
            check_message: doc.check_message,
            check_state: cf.check_state,
            check_owner: cf.check_owner,
            check_type: cf.check_type,
            operater_id: cf.operater_id,
            operater_name: cf.operater_name
        });
        let retData = JSON.parse(JSON.stringify(addCm));
        retData.created_time = addCm.created_at.Format("yyyy-MM-dd hh:mm")

        if (doc.check_type === 'DEGSIGN') {
            if (doc.check_owner === '0') { //内部审核 CHECKOWNERINFO
                if (doc.check_state === '1') //驳回 CHECKSTATEINFO
                {
                    await tb_orderworkflow.destroy({
                        where: {
                            order_id: order.order_id,
                            orderworkflow_state: 'DESIGNCHECKING'
                        }
                    })
                    order.order_state = 'DESIGNING'
                    await order.save()

                    await tb_history.create({
                        order_id: order.order_id,
                        order_state: 'DESIGNCHECKING',
                        history_event: '内部设计审核',
                        history_content: '驳回',
                        operator_name: user.name
                    })

                } else if (doc.check_state === '2') { //通过
                    let checkflow = await tb_checkflow.create({
                        order_id: order.order_id,
                        check_type: 'DEGSIGN',
                        check_desc: '客户审核',
                        optional_flag: GLBConfig.FALSE,
                        check_owner: '1', //CHECKOWNERINFO
                        check_state: '0', //CHECKSTATEINFO
                        operater_id: user.user_id,
                        operater_name: user.name,
                    });

                    let checkmessage = await tb_checkmessage.create({
                        check_id: checkflow.check_id,
                        order_id: checkflow.order_id,
                        check_type: 'DEGSIGN',
                        check_message: '提交客户审核',
                        check_owner: checkflow.check_owner,
                        check_state: checkflow.check_state,
                        operater_id: checkflow.operater_id,
                        operater_name: checkflow.operater_name
                    });

                    order.order_state = 'DESIGNCUSTOMERCHECKING'
                    await order.save()

                    await tb_orderworkflow.create({
                        order_id: order.order_id,
                        orderworkflow_state: 'DESIGNCUSTOMERCHECKING',
                        orderworkflow_desc: '客户设计审核中'
                    })
                    await tb_history.create({
                        order_id: order.order_id,
                        order_state: 'DESIGNCHECKING',
                        history_event: '内部设计审核',
                        history_content: '通过',
                        operator_name: user.name
                    })
                }
            } else if (doc.check_owner === '1') {
                if (doc.check_state === '1') // CHECKSTATEINFO
                {
                    await tb_orderworkflow.destroy({
                        where: {
                            order_id: order.order_id,
                            orderworkflow_state: 'DESIGNCHECKING'
                        }
                    })
                    await tb_orderworkflow.destroy({
                        where: {
                            order_id: order.order_id,
                            orderworkflow_state: 'DESIGNCUSTOMERCHECKING'
                        }
                    })
                    order.order_state = 'DESIGNING'
                    await order.save()

                    await tb_history.create({
                        order_id: order.order_id,
                        order_state: 'DESIGNCUSTOMERCHECKING',
                        history_event: '客户设计审核',
                        history_content: '驳回',
                        operator_name: user.name
                    })
                } else if (doc.check_state === '2') {
                    order.order_state = 'DESIGNCHECKDONE'
                    await order.save()
                    await tb_orderworkflow.create({
                        order_id: order.order_id,
                        orderworkflow_state: 'DESIGNCHECKDONE',
                        orderworkflow_desc: '设计审核完成'
                    })

                    await tb_history.create({
                        order_id: order.order_id,
                        order_state: 'DESIGNCUSTOMERCHECKING',
                        history_event: '客户设计审核',
                        history_content: '通过',
                        operator_name: user.name
                    })
                } else {
                    return common.sendError(res, 'orderdetail_04')
                }
            } else {
                return common.sendError(res, 'orderdetail_02')
            }

        } else if (doc.check_type === 'MATERIAL') {
            if (doc.check_state === '1') //驳回 CHECKSTATEINFO
            {
                order.order_state = 'DESIGNCHECKDONE'
                await order.save()

                await tb_orderworkflow.destroy({
                    where: {
                        order_id: order.order_id,
                        orderworkflow_state: 'MATERIALCHECKING'
                    }
                })
                await tb_history.create({
                    order_id: order.order_id,
                    order_state: 'MATERIALCHECKING',
                    history_event: '物料审核',
                    history_content: '驳回',
                    operator_name: user.name
                })
            } else if (doc.check_state === '2') { //通过
                order.order_state = 'MATERIALCHECKDONE'
                await order.save()

                await tb_orderworkflow.create({
                    order_id: order.order_id,
                    orderworkflow_state: 'MATERIALCHECKDONE',
                    orderworkflow_desc: '物料审核完成'
                })
                await tb_history.create({
                    order_id: order.order_id,
                    order_state: 'MATERIALCHECKING',
                    history_event: '物料审核',
                    history_content: '通过',
                    operator_name: user.name
                })
            } else {
                return common.sendError(res, 'orderdetail_04')
            }
        } else if (doc.check_type === 'PRICE') {
            if (doc.check_state === '1') //驳回 CHECKSTATEINFO
            {
                order.order_state = 'MATERIALCHECKDONE'
                await order.save()

                await tb_orderworkflow.destroy({
                    where: {
                        order_id: order.order_id,
                        orderworkflow_state: 'PRICECHECKING'
                    }
                })

                await tb_history.create({
                    order_id: order.order_id,
                    order_state: 'PRICECHECKING',
                    history_event: '报价审核',
                    history_content: '驳回',
                    operator_name: user.name
                })

            } else if (doc.check_state === '2') { //通过
                order.order_state = 'PRICECHECKDONE'
                await order.save()

                await tb_orderworkflow.create({
                    order_id: order.order_id,
                    orderworkflow_state: 'PRICECHECKDONE',
                    orderworkflow_desc: '报价审核完成'
                })

                await tb_history.create({
                    order_id: order.order_id,
                    order_state: 'PRICECHECKING',
                    history_event: '报价审核',
                    history_content: '通过',
                    operator_name: user.name
                })
            } else {
                return common.sendError(res, 'orderdetail_04')
            }
        } else {
            return common.sendError(res, 'orderdetail_03')
        }

        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 增加订单户型
let addOrderRoomAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);

        let room = await tb_orderroom.findOne({
            where: {
                order_id: doc.order_id,
                room_type: doc.room_type,
                room_name: doc.room_name
            }
        })

        if (room) {
            return common.sendError(res, 'orderdetail_05')
        }

        let orderroom = await tb_orderroom.create({
            order_id: doc.order_id,
            room_type: doc.room_type,
            room_name: doc.room_name
        })
        common.sendData(res, orderroom);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 删除订单户型
let deleteOrderRoomAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body);

        await tb_orderroom.destroy({
            where: {
                room_id: doc.room_id
            }
        })
        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
};
// 查询总价
let getTotalCostAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            returnData = {};
        let queryStr = `select sum(om.materiel_amount*m.materiel_cost) as totalCost
        from tbl_erc_ordermateriel om left join tbl_erc_materiel m on om.materiel_id = m.materiel_id
        where om.state = ? and m.state = ? and order_id = ?`;

        let replacements = [GLBConfig.ENABLE, GLBConfig.ENABLE, doc.order_id];
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        let totalCost = result[0].totalCost ? result[0].totalCost : 0;
        returnData.totalCost = totalCost;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};

// 查询负责人
async function searchInternalReviewAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

        let queryStr = `select r.*, i.*, u.username as duty_username  from tbl_erc_orderrequire r
         left join tbl_erc_orderinternalreview i on (r.require_id = i.require_id)
         left join tbl_common_user u on (i.duty_user_id = u.user_id)
         where i.order_id = ?`;
        let replacements = [doc.orderId];

        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });


        let resultData = [];
        let api_name = common.getApiName(req.path)
        for (let r of result) {
            let row = JSON.parse(JSON.stringify(r));
            row.files = []
            let ufs = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
                    order_id: row.order_id,
                    srv_id: row.internal_review_id,
                    srv_type: row.type_id,
                    state: GLBConfig.ENABLE
                }
            })

            for (let f of ufs) {
                row.files.push(f)
            }

            resultData.push(row)
        }


        common.sendData(res, resultData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 开始验收
async function startInternalReviewAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let requires = await tb_orderrequire.findAll({
            where: {
                type_id: '3',
                domain_id: doc.domainId,
                state: GLBConfig.ENABLE
            }
        });

        for (let r of requires) {
            let result = await tb_orderinternalreview.create({
                order_id: doc.orderId,
                require_id: r.require_id
            });
        }

        let order = await tb_order.findOne({
            where: {
                order_id: doc.orderId,
            }
        });

        if (order) {
            order.order_state = 'CHECKING';
            await order.save();
        }

        let orderworkflow = await tb_orderworkflow.findOne({
            where: {
                order_id: doc.order_id,
                orderworkflow_state: 'CHECKING'
            }
        });

        if (!orderworkflow) {
            await tb_orderworkflow.create({
                order_id: order.order_id,
                orderworkflow_state: 'CHECKING',
                orderworkflow_desc: '审核中'
            })
        }

        let history = await tb_history.findOne({
            where: {
                order_id: doc.order_id,
                order_state: 'CHECKING'
            }
        });

        if (!history) {
            await tb_history.create({
                order_id: order.order_id,
                order_state: 'CHECKING',
                history_event: '订单详情',
                history_content: '内部审核',
                operator_name: user.name
            })
        }

        common.sendData(res, order);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 设置节点
async function setDutyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let result = await tb_orderinternalreview.findOne({
            where: {
                internal_review_id: doc.internalReviewId
            }
        });

        if (result) {
            result.duty_user_id = doc.dutyUserId;
            await result.save();
        }

        let taskName = '内部评审';
        let taskType = '3';
        let taskPerformer = doc.dutyUserId;
        let taskReviewCode = doc.orderId;
        let taskDescription = '内部评审申请';
        await TaskListControlSRV.createTask(user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription);

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
async function interReviewUpdateAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;

        let review = await tb_orderinternalreview.findOne({
            where: {
                internal_review_id: doc.new.internal_review_id
            }
        })
        let api_name = common.getApiName(req.path)

        for (let m of doc.new.files) {
            if (m.url) {
                let fileUrl = await common.fileMove(m.url, 'upload')
                let addFile = await tb_uploadfile.create({
                    api_name: api_name,
                    order_id: review.order_id,
                    file_name: m.name,
                    file_url: fileUrl,
                    file_type: m.type,
                    srv_id: review.internal_review_id,
                    srv_type: doc.new.type_id,
                    file_creator: user.name,
                    user_id: user.user_id
                });
            }
        }

        let retData = JSON.parse(JSON.stringify(doc.new))
        retData.files = []
        let ufs = await tb_uploadfile.findAll({
            where: {
                api_name: api_name,
                order_id: retData.order_id,
                srv_id: retData.internal_review_id,
                srv_type: retData.type_id,
                state: GLBConfig.ENABLE
            }
        })

        for (let f of ufs) {
            retData.files.push(f)
        }

        let order = await tb_order.findOne({
            where: {
                order_id: retData.order_id
            }
        });
        if (order.order_state === 'CHECKING') {
            //判断如果内部审核的所有项全部上传的了文件，则改变订单的状态为签约中
            let interReviews = await tb_orderinternalreview.findAll({
                where: {
                    order_id: retData.order_id
                }
            });
            let isAllUpload = false;
            for (let review of interReviews) {
                let ufs = await tb_uploadfile.findAll({
                    where: {
                        api_name: api_name,
                        order_id: retData.order_id,
                        srv_id: review.internal_review_id,
                        srv_type: '3',
                        state: GLBConfig.ENABLE
                    }
                });
                isAllUpload = true;
                if (ufs.length == 0) {
                    isAllUpload = false;
                    break;
                }
            }
            if (isAllUpload) {
                order.order_state = 'SIGNED'
                await order.save();

                let orderworkflow = await tb_orderworkflow.findOne({
                    where: {
                        order_id: retData.order_id,
                        orderworkflow_state: 'SIGNED'
                    }
                });

                if (!orderworkflow) {
                    await tb_orderworkflow.create({
                        order_id: retData.order_id,
                        orderworkflow_state: 'SIGNED',
                        orderworkflow_desc: '签约中'
                    })
                }

                await tb_history.create({
                    order_id: retData.order_id,
                    order_state: 'SIGNED',
                    history_event: '合同管理',
                    history_content: '签约中',
                    operator_name: user.name
                });
            }
        }

        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 删除文件
async function deleteFileAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

        let uploadfiles = await tb_uploadfile.findAll({
            where: {
                file_id: {
                    $in: doc.fileIds
                },
                state: GLBConfig.ENABLE
            }
        });
        for (let file of uploadfiles) {
            file.state = GLBConfig.DISABLE
            await file.save();
        }

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 开始订单验收
async function startOrderReviewAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;

        let requires = await tb_orderrequire.findAll({
            where: {
                type_id: '4',
                domain_id: doc.domainId,
                state: GLBConfig.ENABLE
            }
        });

        for (let r of requires) {
            let result = await tb_erc_orderreview.create({
                order_id: doc.orderId,
                require_id: r.require_id,
                review_status: '1'
            });
        }

        //将订单状态改为审核中 CHECKING
        let order = await tb_order.findOne({
            where: {
                order_id: doc.orderId,
            }
        });

        if (order) {
            order.order_state = 'REVIEWING';
            await order.save();
        }


        let orderworkflow = await tb_orderworkflow.findOne({
            where: {
                order_id: doc.orderId,
                orderworkflow_state: 'REVIEWING'
            }
        });

        if (!orderworkflow) {
            await tb_orderworkflow.create({
                order_id: doc.orderId,
                orderworkflow_state: 'REVIEWING',
                orderworkflow_desc: '订单审核'
            })
        }

        let history = await tb_history.findOne({
            where: {
                order_id: doc.orderId,
                order_state: 'REVIEWING'
            }
        });

        if (!history) {
            await tb_history.create({
                order_id: doc.orderId,
                order_state: 'REVIEWING',
                history_event: '订单详情',
                history_content: '订单审核',
                operator_name: user.name
            })
        }

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 开始订单
async function startOrderAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        //先判断订单评审是否全部完成，如果全部完成，则可以点开工
        let orderReview = await tb_erc_orderreview.findAll({
            where: {
                order_id: doc.orderId,
                review_status: {
                    $ne: '3'
                },
            }
        });
        if (orderReview.length > 0) {
            common.sendError(res, 'orderdetail_07');
            return
        } else {
            let order = await tb_order.findOne({
                where: {
                    order_id: doc.orderId
                }
            });
            if (order.order_state === 'REVIEWING') {
                order.order_state = 'WORKING';
                await order.save();

                let orderworkflow = await tb_orderworkflow.findOne({
                    where: {
                        order_id: doc.orderId,
                        orderworkflow_state: 'WORKING'
                    }
                });

                if (!orderworkflow) {
                    await tb_orderworkflow.create({
                        order_id: doc.orderId,
                        orderworkflow_state: 'WORKING',
                        orderworkflow_desc: '施工中'
                    });
                }
                let history = await tb_history.findOne({
                    where: {
                        order_id: doc.orderId,
                        order_state: 'WORKING'
                    }
                });
                if (!history) {
                    await tb_history.create({
                        order_id: doc.orderId,
                        order_state: 'WORKING',
                        history_event: '订单详情',
                        history_content: '施工中',
                        operator_name: user.name
                    })
                }
            }
        }
        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 查询订单验收
async function searchOrderReviewAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

        let queryStr = `select r.*, i.*, u.username as duty_username  from tbl_erc_orderrequire r
         left join tbl_erc_orderreview i on (r.require_id = i.require_id)
         left join tbl_common_user u on (i.duty_user_id = u.user_id)
         where i.order_id = ?`;
        let replacements = [doc.orderId];
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 设置订单验收状态
async function setOrderReviewDutyAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        let result = await tb_erc_orderreview.findOne({
            where: {
                review_id: doc.reviewId
            }
        });

        if (result) {
            result.duty_user_id = doc.dutyUserId;
            result.review_status = '2';
            await result.save();

            let taskName = '订单评审';
            let taskType = '5';
            let taskPerformer = result.duty_user_id;
            let taskReviewCode = doc.order_id;
            let taskDescription = '订单评审申请';
            let taskReviewId = doc.reviewId;
            await TaskListControlSRV.createTask(user, taskName, taskType, taskPerformer, taskReviewCode, taskDescription, taskReviewId);
        }

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 查询订单设计
async function searchOrderDesignAct(req, res) {
    try {
        let doc = common.docTrim(req.body);

        let queryStr = `select r.*, i.* from tbl_erc_orderrequire r
         left join tbl_erc_orderdesign i on (r.require_id = i.require_id)
         where i.order_id = ?`;
        let replacements = [doc.orderId];
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        let resultData = {
            vrs: [],
            designs: []
        };
        let api_name = 'ERCORDERDETAILCONTROL';
        for (let r of result) {
            let row = JSON.parse(JSON.stringify(r));
            if (r.require_type == '1') {
                row.files = []
                let ufs = await tb_uploadfile.findAll({
                    where: {
                        api_name: api_name,
                        order_id: row.order_id,
                        srv_id: row.design_id,
                        srv_type: row.require_type,
                        state: GLBConfig.ENABLE
                    }
                })

                for (let f of ufs) {
                    row.files.push(f)
                }

                resultData.designs.push(row)
            }
            if (r.require_type == '2') {
                resultData.vrs.push(r)
            }
        }
        common.sendData(res, resultData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 下载模板
async function downloadTemplate(req, res) {
    try {
        let str = null;
        let filename = null;
        if (req.body.type === 1) {
            str = '//空间类型,空间名称\r1,卧室';
            filename = '乐宜嘉订单所需空间数据导入模板.csv';
        } else if (req.body.type === 2) {
            str = '//空间名称,物料编号,数量\r客厅,1001,10';
            filename = '乐宜嘉空间所需物料数据导入模板.csv';
        } else {
            common.sendError(res, '类型错误');
            return;
        }

        let tempfile = path.join(__dirname, '../../../' + config.uploadOptions.uploadDir + '/' + filename);
        let csvBuffer = iconvLite.encode(str, 'gb2312');
        fs.writeFile(tempfile, csvBuffer, function(err) {
            if (err) throw err;
            common.sendData(res, config.tmpUrlBase + filename);
        });
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 导入空间
async function importSpace(req, res) {
    try {
        let doc = common.docTrim(req.body);
        logger.debug('importSpace:', doc);

        let jsonArray = await common.csvtojsonByPath(doc.uploadurl);
        let dataArray = [];
        for (let i = 0; i < jsonArray.length; i++) {
            let item = jsonArray[i];
            dataArray.push({
                order_id: doc.order_id,
                room_type: item[0],
                room_name: item[1]
            });
        }

        if (dataArray.length > 0) {
            let result = await tb_orderroom.bulkCreate(dataArray);
            common.sendData(res, result);
        } else {
            common.sendData(res, dataArray);
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 查询订单户型
async function getOrderRoom(req, res) {
    try {
        logger.debug('getOrderRoom:', req.body);
        let orderRoom = await tb_orderroom.findOne({
            where: {
                room_name: req.body.room_name,
                order_id: req.body.order_id
            }
        });

        common.sendData(res, orderRoom);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 导入物料
async function importMaterial(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        logger.debug('importMaterial:', doc);

        let jsonArray = await common.csvtojsonByPath(doc.uploadurl);
        let dataArray = [];
        for (let i = 0; i < jsonArray.length; i++) {
            let item = jsonArray[i];
            let materiel = await tb_materiel.findOne({
                where: {
                    materiel_code: item[0],
                    domain_id: user.domain_id
                }
            });

            if (materiel) {
                dataArray.push({
                    order_id: doc.order_id,
                    room_id: doc.room_id,
                    room_type: doc.room_type,
                    materiel_id: materiel.materiel_id,
                    materiel_amount: item[1]
                });
            }
        }

        if (dataArray.length > 0) {
            await tb_ordermateriel.destroy({
                where: {
                    order_id: doc.order_id,
                    room_id: doc.room_id
                }
            });

            let result = await tb_ordermateriel.bulkCreate(dataArray);
            common.sendData(res, result);
        } else {
            common.sendData(res, dataArray);
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 导入所有物料
async function importMaterialAll(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        logger.debug('importMaterialAll:', doc);

        let jsonArray = await common.csvtojsonByPath(doc.uploadurl);
        let dataArray = [];
        for (let i = 0; i < jsonArray.length; i++) {
            let item = jsonArray[i];
            let orderRoom = await tb_orderroom.findOne({
                where: {
                    room_name: item[0],
                    order_id: req.body.order_id
                }
            });
            logger.debug('orderRoom:', orderRoom);

            if (orderRoom) {
                /*let materiel = await tb_materiel.findOne({
                 where: {
                 materiel_code: item[1],
                 domain_id: user.domain_id
                 }
                 });*/

                let queryStr =
                    `select
                     materiel_id
                     from tbl_erc_materiel
                     where true
                     and (
                     domain_id = ?
                     or domain_id in
                     (select
                     follow_domain_id
                     from tbl_common_apidomain
                     where true
                     and domain_id = ?
                     and api_name = 'ERCMATERIELCONTROL')
                     )
                     and materiel_code = ?`;
                let replacements = [];
                replacements.push(user.domain_id);
                replacements.push(user.domain_id);
                replacements.push(item[1]);
                let materiel = await common.simpleSelect(sequelize, queryStr, replacements);

                if (materiel.length > 0) {
                    dataArray.push({
                        order_id: doc.order_id,
                        room_id: orderRoom.room_id,
                        room_type: orderRoom.room_type,
                        materiel_id: materiel[0].materiel_id,
                        materiel_amount: item[2]
                    });
                } else {
                    common.sendError(res, 'produce_04', '该物料不存在');
                    return;
                }
            }
        }
        logger.debug('dataArray:', dataArray);

        if (dataArray.length > 0) {
            await tb_ordermateriel.destroy({
                where: {
                    order_id: doc.order_id
                }
            });

            let result = await tb_ordermateriel.bulkCreate(dataArray);
            common.sendData(res, result);
        } else {
            common.sendData(res, dataArray);
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 更新设计
async function designUpdareAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;

        let degsin = await tb_orderdesign.findOne({
            where: {
                design_id: doc.new.design_id
            }
        })

        let api_name = common.getApiName(req.path)
        for (let m of doc.new.files) {
            if (m.url) {
                let fileUrl = await common.fileMove(m.url, 'upload')
                let addFile = await tb_uploadfile.create({
                    api_name: api_name,
                    order_id: degsin.order_id,
                    file_name: m.name,
                    file_url: fileUrl,
                    file_type: m.type,
                    srv_id: degsin.design_id,
                    srv_type: degsin.require_type,
                    file_creator: user.name
                });
            }
        }

        let retData = JSON.parse(JSON.stringify(doc.new))
        retData.files = []
        let ufs = await tb_uploadfile.findAll({
            where: {
                api_name: api_name,
                order_id: retData.order_id,
                srv_id: retData.design_id,
                srv_type: retData.require_type,
                state: GLBConfig.ENABLE
            }
        })

        for (let f of ufs) {
            retData.files.push(f)
        }

        common.sendData(res, retData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 修改文件
async function editFileUrlAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        let design = await tb_orderdesign.findOne({
            where: {
                design_id: doc.designId
            }
        })
        if (design) {
            design.file_url = doc.fileUrl;
            design.create_user_id = user.user_id;
            await design.save()
        }
        common.sendData(res, design);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 获得bom
async function bomSyncAct(req, res) {
    let dbconn = await zoweedb.getConnection()
    try {
        let doc = common.docTrim(req.body),
            user = req.user;

        let order = await tb_order.findOne({
            where: {
                order_id: doc.order_id
            }
        })
        let zorder = await dbconn.execute(`SELECT TUS_ORDERID, ORDERNO, HOUSEAREA
                                             FROM TUS_ORDER
                                             WHERE ORDERNO = :orderno
                                             AND STATE='0'`, [order.order_id])

        if (zorder.rows.length < 1) {
            return common.sendError(res, 'orderdetail_06')
        }

        await common.transaction(async function(t) {
            order.order_house_area = zorder.rows[0][2]
            await order.save({
                transaction: t
            })

            await tb_orderroom.destroy({
                where: {
                    order_id: order.order_id
                },
                transaction: t
            });

            await tb_ordermateriel.destroy({
                where: {
                    order_id: order.order_id
                },
                transaction: t
            });

            let zrooms = await dbconn.execute(`SELECT ROOMTYPEID, ROOMNAME, ROOMAREA, ROOMID
                                                 FROM TUS_ORDER_ROOM
                                                 WHERE TUS_ORDERID = :orderid
                                                 AND STATE='0'`, [zorder.rows[0][0]])
            for (let r of zrooms.rows) {
                let room = await tb_orderroom.create({
                    order_id: order.order_id,
                    room_type: r[0],
                    room_name: r[1],
                    room_area: r[2]
                }, {
                    transaction: t
                })

                let zroommateriels = await dbconn.execute(`SELECT CODE, AMOUNT
                                                     FROM TUS_ROOM_OBJECT
                                                     WHERE TUS_ORDERID = :orderid
                                                     AND ROOMID = :roomid
                                                     AND STATE='0'`, [zorder.rows[0][0], r[3]])

                for (let m of zroommateriels.rows) {
                    let mt = await tb_materiel.findOne({
                        where: {
                            materiel_code: m[0]
                        }
                    })
                    if (mt) {
                        await tb_ordermateriel.create({
                            room_id: room.room_id,
                            order_id: order.order_id,
                            materiel_id: mt.materiel_id,
                            materiel_amount: m[1],
                            room_type: r[0]
                        }, {
                            transaction: t
                        })
                    } else {
                        throw m[0] + ' do not exists.'
                    }
                }
            }
            dbconn.close()
        })

        common.sendData(res);
    } catch (error) {
        dbconn.close()
        common.sendFault(res, error);
        return
    }
}

// 查询楼盘
async function getEstate(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let replacements = [];

        let queryStr = 'select * from tbl_erc_estate where state=1 and province=? and city=? and district=?';
        replacements.push(doc.province);
        replacements.push(doc.city);
        replacements.push(doc.district);

        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        let returnData = [];
        for (let i = 0; i < queryRst.length; i++) {
            let elem = {};
            elem.id = queryRst[i].estate_id;
            elem.value = queryRst[i].estate_name;
            elem.text = queryRst[i].estate_name;
            returnData.push(elem)
        }

        common.sendData(res, returnData);

    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 查询楼栋
async function getBuild(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let replacements = [];

        let queryStr = 'select build from tbl_erc_estateroom where state=1 and estate_id=? group by build';
        replacements.push(doc.estate_id);

        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        let returnData = [];
        for (let i = 0; i < queryRst.length; i++) {
            let elem = {};
            elem.id = queryRst[i].build;
            elem.value = queryRst[i].build;
            elem.text = queryRst[i].build;
            returnData.push(elem)
        }

        common.sendData(res, returnData);

    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 单元
async function getUnit(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let replacements = [];

        let queryStr = 'select unit from tbl_erc_estateroom where state=1 and estate_id=? and build=? group by unit';
        replacements.push(doc.estate_id);
        replacements.push(doc.build);

        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        let returnData = [];
        for (let i = 0; i < queryRst.length; i++) {
            let elem = {};
            elem.id = queryRst[i].unit;
            elem.value = queryRst[i].unit;
            elem.text = queryRst[i].unit;
            returnData.push(elem)
        }

        common.sendData(res, returnData);

    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 房号
async function getRoomNo(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let replacements = [];

        let queryStr = 'select room_id,room_no from tbl_erc_estateroom where state=1 and estate_id=? and build=? and unit=?';
        replacements.push(doc.estate_id);
        replacements.push(doc.build);
        replacements.push(doc.unit);

        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        let returnData = [];
        for (let i = 0; i < queryRst.length; i++) {
            let elem = {};
            elem.id = queryRst[i].room_id;
            elem.value = queryRst[i].room_no;
            elem.text = queryRst[i].room_no;
            returnData.push(elem)
        }

        common.sendData(res, returnData);

    } catch (error) {
        common.sendFault(res, error);
        return
    }
}
// 户型
async function getRoomType(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let replacements = [];
        let queryStr = 'select tbr.roomtype_id,tbr.name,tbr.acreage ' +
            'from tbl_erc_roomtype tbr,tbl_erc_estateroom tbe ' +
            'where tbr.state=1 and tbe.state=1 ' +
            'and tbr.roomtype_id=tbe.roomtype_id ' +
            'and tbe.room_id=? ';
        replacements.push(doc.room_id);

        let queryRst = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        let returnData = [];
        for (let i = 0; i < queryRst.length; i++) {
            let elem = {};
            elem.id = queryRst[i].roomtype_id;
            elem.value = queryRst[i].name;
            elem.text = queryRst[i].name;
            elem.acreage = queryRst[i].acreage;
            returnData.push(elem)
        }
        common.sendData(res, returnData);

    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

let saveInterestRateAct = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            returnData = {};

        let order = await tb_order.findOne({
            where: {
                order_id: doc.order_id
            }
        });

        if (!order) {
            common.sendError(res, 'orderdetail_01');
            return
        } else {
            order.interest_rate = doc.interest_rate;
            order.award_cost = doc.award_cost;
            order.other_cost = doc.other_cost;
            order.final_offer = doc.final_offer;
            await order.save();
            common.sendData(res, order);
        }
    } catch (error) {
        common.sendFault(res, error);
    }
};

let getZoweePrecess = async (req, res) => {
    try {
        let doc = common.docTrim(req.body)

        let process = await tb_zoweeprocess.findOne({
            where: {
                ordermateriel_id: doc.ordermateriel_id
            },
            order: [
                ['created_at']
            ]
        });

        let retdata = {}
        if (process) {
            retdata = JSON.parse(JSON.stringify(process))
            retdata.files = []
            let api_name = common.getApiName(req.path)

            let vkpx = await tb_uploadfile.findOne({
                where: {
                    api_name: api_name,
                    order_id: process.zoweeprocess_id,
                    srv_type: '1'
                }
            })
            if (vkpx) {
                retdata.files.push({
                    file_type: '造艺设计文件',
                    file_name: vkpx.file_name,
                    file_path: vkpx.file_url
                })
            } else {
                retdata.files.push({
                    file_type: '造艺设计文件',
                    file_name: '',
                    file_path: ''
                })
            }
            let files = await tb_uploadfile.findAll({
                where: {
                    api_name: api_name,
                    order_id: process.zoweeprocess_id,
                    srv_type: '2'
                }
            })
            for (let f of files) {
                retdata.files.push({
                    file_type: '设计附件',
                    file_name: f.file_name,
                    file_path: f.file_url
                })
            }
        } else {
            let om = await tb_ordermateriel.findOne({
                where: {
                    ordermateriel_id: doc.ordermateriel_id
                }
            });

            let od = await tb_order.findOne({
                where: {
                    order_id: om.order_id
                }
            });

            let cu = await tb_user.findOne({
                where: {
                    user_id: od.user_id
                }
            });

            let ds = await tb_user.findOne({
                where: {
                    user_id: od.designer_id
                }
            });

            process = await tb_zoweeprocess.create({
                zoweeprocess_id: await Sequence.genZWProcessID(),
                ordermateriel_id: doc.ordermateriel_id,
                zoweeprocess_name: cu.name,
                zoweeprocess_address: od.order_address,
                zoweeprocess_phone: cu.phone,
                zoweeprocess_designer: ds.name,
                zoweeprocess_designphone: ds.phone
            })

            retdata.zoweeprocess_date = ''
            retdata.zoweeprocess_name = process.zoweeprocess_name
            retdata.zoweeprocess_phone = process.zoweeprocess_phone
            retdata.zoweeprocess_address = process.zoweeprocess_address
            retdata.zoweeprocess_remark = ''
            retdata.files = []
            retdata.files.push({
                file_type: '造艺设计文件',
                file_name: '',
                file_path: ''
            })
        }
        common.sendData(res, retdata);
    } catch (error) {
        common.sendFault(res, error);
    }
};

let putZoweePrecess = async (req, res) => {
    try {
        let doc = common.docTrim(req.body),
            user = req.user

        let process = await tb_zoweeprocess.findOne({
            where: {
                zoweeprocess_id: doc.process.zoweeprocess_id
            }
        });

        process.zoweeprocess_date = doc.process.zoweeprocess_date
        process.zoweeprocess_name = doc.process.zoweeprocess_name
        process.zoweeprocess_phone = doc.process.zoweeprocess_phone
        process.zoweeprocess_address = doc.process.zoweeprocess_address
        process.zoweeprocess_remark = doc.process.zoweeprocess_remark
        await process.save()

        let api_name = common.getApiName(req.path)
        for (let m of doc.process.files) {
            if (m.url) {
                let fileUrl = await common.fileMove(m.url, 'upload')
                if (path.extname(m.name).toUpperCase() == '.VKPX') {
                    let vkpx = await tb_uploadfile.findOne({
                        where: {
                            api_name: api_name,
                            order_id: process.zoweeprocess_id,
                            srv_type: '1'
                        }
                    })
                    if (vkpx) {
                        await common.fileRemove(vkpx.file_url)
                        vkpx.file_name = m.name
                        vkpx.file_url = fileUrl
                        vkpx.file_creator = user.name
                        await vkpx.save()
                    } else {
                        let addFile = await tb_uploadfile.create({
                            api_name: api_name,
                            order_id: process.zoweeprocess_id,
                            file_name: m.name,
                            file_url: fileUrl,
                            file_type: m.type,
                            srv_type: '1',
                            file_creator: user.name
                        });
                    }
                } else {
                    let addFile = await tb_uploadfile.create({
                        api_name: api_name,
                        order_id: process.zoweeprocess_id,
                        file_name: m.name,
                        file_url: fileUrl,
                        file_type: m.type,
                        srv_type: '2',
                        file_creator: user.name
                    });
                }
            }
        }

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
};
