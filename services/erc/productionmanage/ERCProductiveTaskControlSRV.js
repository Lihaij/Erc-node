const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCProductiveTaskControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const sequelize = model.sequelize;
const FDomain = require('../../../bl/common/FunctionDomainBL');
const moment = require('moment')
const {
    CODE_NAME,
    genBizCode
} = require('../../../util/BizCodeUtil');

const tb_productivetask = model.erc_productivetask;
const tb_productplan = model.erc_productplan;
const tb_productplandetail = model.erc_productplandetail;
const tb_productivetask_transfer = model.erc_productivetask_transfer;
const tb_productivetask_procedure = model.erc_productivetask_procedure;
const tb_supplier = model.erc_supplier;
const tb_productionprocedure = model.erc_productionprocedure;

// 生产任务单接口
exports.ERCProductiveTaskControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        await initArc(req, res)
    } else if (method === 'search') {
        await searchArc(req, res)
    } else if (method === 'getProcedure') {
        await getProcedure(req, res)
    } else if (method === 'getFeeding') {
        await getFeeding(req, res)
    } else if (method === 'getRelated') {
        await getRelated(req, res)
    } else if (method === 'getProductiveTaskTransfer') {
        await getProductiveTaskTransfer(req, res)
    } else if (method === 'addProductiveTaskProcedure') {
        await addProductiveTaskProcedure(req, res)
    } else if (method === 'modifyProductiveTaskProcedure') {
        await modifyProductiveTaskProcedure(req, res)
    } else if (method === 'submitProductiveTaskProcedure') {
        await submitProductiveTaskProcedure(req, res)
    } else if (method === 'getProductiveProcedureList') {
        await getProductiveProcedureList(req, res)
    } else if (method === 'modifyProductiveTaskDepartment') {
        await modifyProductiveTaskDepartment(req, res)
    } else if (method === 'getTransferProcedure') {
        await getTransferProcedure(req, res)
    } else {
        common.sendError(res, 'common_01')
    }

};

// 初始化基础数据
async function initArc(req, res) {
    let returnData = {}
    const user = req.user;

    await FDomain.getDomainListInit(req, returnData);
    returnData.departmentInfo = await getDepartmentInfo(req, user.domain_id);
    returnData.procedureInfo = await getProcedureInfo(req, user.domain_id);
    returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'); //单位
    returnData.suppler = await getSuppler(req, res);

    common.sendData(res, returnData)
}

async function getSuppler(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = [],
            replacements = []

        let suppler = await tb_supplier.findAll({
            where: {
                state: 1,
                domain_id: user.domain_id
            }
        })

        for (let s of suppler) {
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

async function getProductiveTaskDepartment(productivetask_id) {
    const queryStr =
        `select
            dpt.department_id, dpt.department_name
            from (
            select
            pt.productivetask_id, ptp.department_id
            from tbl_erc_productivetask pt
            left join tbl_erc_productivetaskprocess ptp
            on pt.productivetask_id = ptp.productivetask_id
            where true
            and pt.productivetask_id = ?
            group by pt.productivetask_id, ptp.department_id) gpt
            left join tbl_erc_department dpt
            on dpt.department_id = gpt.department_id`;

    const replacements = [ productivetask_id ];
    return await common.simpleSelect(sequelize, queryStr, replacements);
}

// 查询生产任务单列表
async function searchArc(req, res) {
    const {
        body,
        user
    } = req;
    const returnData = {};
    const replacements = [];

    try {
        const {
            domain_id
        } = user;
        const {
            search_text,
            outsource
        } = body;

        let queryStr =
            `select
                pt.productivetask_id, pt.taskdesign_number, pt.product_id as product_plan_id
                , m.materiel_id, m.materiel_code, m.materiel_name, m.materiel_format, m.materiel_unit
                , if(isnull(ptt.transfer_number), 0, ptt.transfer_number) as transfer_number
                , if(isnull(ptt.qualified_number), 0, ptt.qualified_number) as qualified_number
                , pt.biz_code, date(pt.ppmaster_begin_time) as ppmaster_begin_time
                , ord.biz_code as order_biz_code,spp.supplier_name,pt.order_id 
                from tbl_erc_productivetask pt
                left join tbl_erc_materiel m
                on (pt.materiel_id = m.materiel_id and m.state = 1) 
                left join tbl_erc_supplier spp on (spp.supplier_id=pt.department_id and spp.state=1)
                left join (
                select
                ptt.productivetask_id, sum(ptt.transfer_number) as transfer_number, sum(ptt.qualified_number) as qualified_number
                from tbl_erc_productivetask_transfer ptt
                where true
                group by ptt.productivetask_id) ptt
                on ptt.productivetask_id = pt.productivetask_id
                left join tbl_erc_order ord
                on ord.order_id = pt.order_id
                where pt.state = 1 and pt.domain_id = ?`;
        replacements.push(domain_id);

        if (search_text) {
            queryStr += ' and (m.materiel_code like ? or m.materiel_name like ?)';
            replacements.push('%' + search_text + '%');
            replacements.push('%' + search_text + '%');
        }
        if (outsource) {
            queryStr += ' and pt.outsource_sign = ?';
            replacements.push(outsource);
        }

        queryStr += ` order by pt.productivetask_id`;

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.ppmaster_begin_time = result.ppmaster_begin_time ? moment(result.ppmaster_begin_time).format('YYYY-MM-DD') : ''
            returnData.rows.push(result)
        }

        returnData.rows = result.data;

        if (outsource === 1) {
            for (const returnItem of returnData.rows) {
                const { productivetask_id } = returnItem;
                const [ departmentResult ] = await getProductiveTaskDepartment(productivetask_id);
                if (departmentResult) {
                    returnItem.department_name = departmentResult.department_name;
                }
            }
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

// 查询部门信息
async function getDepartmentInfo(req, domain_id) {
    try {
        const replacements = [domain_id];
        let queryStr =
            `select t.department_id as id, t.department_name as text
             from tbl_erc_department t
             left join tbl_erc_department pt
             on t.p_department_id = pt.department_id
             where t.state=1 and t.domain_id=?`;
        queryStr += ` order by t.created_at desc`;
        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);

        return result.data;
    } catch (error) {
        return [];
    }
}

// 查询产品工序信息
async function getProcedureInfo(req, domain_id) {
    try {
        let queryStr =
            `select pp.procedure_id as id, pp.procedure_name as text
             from tbl_erc_productionprocedure pp
             where true
             and pp.state = 1
             and pp.domain_id = ?`;

        const replacements = [domain_id];
        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        return result.data;
    } catch (error) {
        return [];
    }
}
// 查询生产任务单的车间与工序信息
async function getProcedure(req, res) {
    try {
        let doc = req.body,
            user = req.user,
            returnData = {},
            replacements = [],
            workshop = '';

        let productiveTask = await tb_productivetask.findOne({
            where: {
                state: 1,
                productivetask_id: doc.productivetask_id
            }
        });
        let productPlan = await tb_productplan.findOne({
            where: {
                state: 1,
                product_id: productiveTask.product_id
            }
        });


        //车间
        if (productiveTask.materiel_id == productPlan.materiel_id) {
            workshop = productPlan.workshop_id
        } else {
            let productPlandetail = await tb_productplandetail.findOne({
                where: {
                    state: 1,
                    product_plan_id: productiveTask.product_id,
                    src_materiel_id: productiveTask.materiel_id
                }
            });
            workshop = productPlan.workshop_id
        }
        //工序
        let queryStr = `select pp.procedure_name,ppp.priority 
            from tbl_erc_productplanprocedure ppp 
            left join tbl_erc_productionprocedure pp on (ppp.procedure_id = pp.procedure_id and pp.state=1) 
            where ppp.state=1 and ppp.product_plan_id=? and rlt_materiel_code=? order by ppp.priority`;
        replacements.push(productiveTask.product_id);
        replacements.push(productiveTask.materiel_id);

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = [];
        for (var r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.workshop_id = workshop;
            returnData.rows.push(result)
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
// 查询生产任务单的边余料信息
async function getFeeding(req, res) {
    try {
        let doc = req.body,
            user = req.user,
            returnData = {},
            replacements = [];
        let queryStr =
            `select p.*,m.materiel_code,m.materiel_name,m.materiel_format,m.materiel_unit 
            from tbl_erc_productivetaskdetail p 
            left join tbl_erc_materiel m on (p.materiel_id = m.materiel_id and m.state=1) 
            where p.state=1 and p.domain_id=? and p.productivetask_id = ?`;
        replacements.push(user.domain_id);
        replacements.push(doc.productivetask_id);
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

// 查询生产任务单的联产品信息
async function getRelated(req, res) {
    try {
        let doc = req.body,
            user = req.user,
            returnData = {},
            replacements = [];
        let queryStr =
            `select p.*,m.materiel_code,m.materiel_name,m.materiel_format,m.materiel_unit 
            from tbl_erc_productivetaskrelated p 
            left join tbl_erc_materiel m on (p.materiel_id = m.materiel_id and m.state=1) 
            where p.state=1 and p.domain_id=? and taskrelated_type=? and p.productivetask_id=?`;
        replacements.push(user.domain_id);
        replacements.push(doc.taskrelated_type);
        replacements.push(doc.productivetask_id);
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getProductiveTaskTransfer(req, res) {
    const {
        body,
        user
    } = req;
    const {
        domain_id
    } = user;
    const returnData = {};

    try {
        const {
            search_text,
            user_id
        } = body;

        let queryStr =
            `select
                ptt.productivetask_id, ptt.transfer_number, ptt.transfer_number as qualified_number
                , ptt.procedure_id
                , pt.productivetask_code, pt.biz_code, pt.materiel_id
                , mt.materiel_code, mt.materiel_name, mt.materiel_format, mt.materiel_unit
                , usr.name as appoint_user
                from tbl_erc_productivetask_transfer ptt
                left join tbl_erc_productivetask pt
                on ptt.productivetask_id = pt.productivetask_id
                left join tbl_erc_materiel mt
                on pt.materiel_id = mt.materiel_id
                left join tbl_common_user usr
                on ptt.appoint_user_id = usr.user_id
                where true
                and ptt.transfer_number > 0
                and ptt.domain_id = ?`;

        const replacements = [domain_id];

        if (user_id) {
            queryStr += ` and ptt.appoint_user_id = ?`;
            replacements.push(user_id);
        }

        if (search_text) {
            queryStr += ` and (pt.productivetask_code like ? or mt.materiel_code like ? or mt.materiel_name like ?)`;
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function createTransferProcedureTask(user, taskDescription, appoint_user_id, review_id) {
    const task = require('../baseconfig/ERCTaskListControlSRV');
    const groupId = common.getUUIDByTime(30);
    return await task.createTask(user, '生产工序移交', 88, appoint_user_id, review_id, taskDescription, '', groupId);
}

exports.modifyState = function (req, prd_task_procedure_id) {

};

async function addProductiveTaskProcedure(req, res) {
    const {
        body,
        user
    } = req;
    const {
        domain_id
    } = user;

    try {
        const {
            productivetask_id,
            taskdesign_number,
            transfer_number,
            qualified_number,
            work_number,
            appoint_user_id,
            procedure_id,
        } = body;

        const int_work_number = parseInt(work_number);
        if (int_work_number >= taskdesign_number - transfer_number - qualified_number) {
            return common.sendError(res, 'productive_task_01');
        }

        const productionProcedure = await tb_productionprocedure.findOne({
            where: {
                procedure_id
            }
        });

        if (!productionProcedure) {
            return common.sendError(res, '', '工序不正确');
        }

        const taskTransfer = await tb_productivetask_transfer.findOne({
            where: {
                productivetask_id,
                procedure_id
            }
        });

        if (taskTransfer) {
            taskTransfer.transfer_number += int_work_number;
            taskTransfer.appoint_user_id = appoint_user_id;
            taskTransfer.procedure_id = procedure_id;
            await taskTransfer.save();

            const transferInfo = `工序移交总数量${taskTransfer.transfer_number}`;
            await createTransferProcedureTask(user, transferInfo, appoint_user_id, taskTransfer.prd_task_procedure_id);

            common.sendData(res, taskTransfer);
        } else {
            const taskTransfer = await tb_productivetask_transfer.create({
                productivetask_id,
                transfer_number: int_work_number,
                appoint_user_id,
                procedure_id,
                domain_id
            });

            const transferInfo = `工序移交总数量${taskTransfer.transfer_number}`;
            await createTransferProcedureTask(user, transferInfo, appoint_user_id, taskTransfer.prd_task_procedure_id);

            common.sendData(res, taskTransfer);
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}
async function modifyProductiveTaskDepartment(req, res) {
    const {
        body,
        user
    } = req;
    const {
        user_id
    } = user;

    try {
        const {
            productivetask_id,
            supplier_id
        } = body;

        const result = await tb_productivetask.findOne({
            where: {
                productivetask_id
            }
        });
        if (result) {
            result.department_id = supplier_id;
            await result.save();
        }
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}
async function modifyProductiveTaskProcedure(req, res) {
    const {
        body,
        user
    } = req;
    const {
        user_id
    } = user;

    try {
        const {
            productivetask_id,
            transfer_number,
            qualified_number
        } = body.new;

        const result = await tb_productivetask_procedure.findOne({
            where: {
                productivetask_id
            }
        });

        if (result) {
            const int_qualified_number = parseInt(qualified_number);
            if (int_qualified_number > transfer_number) {
                return common.sendError(res, 'productive_task_02');
            }

            result.qualified_number = int_qualified_number;
            result.unqualified_number = transfer_number - int_qualified_number;
            result.procedure_state = 1;
            result.user_id = user_id;
            await result.save();
        }

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function submitProductiveTaskProcedure(req, res) {
    const {
        body,
        user
    } = req;
    const {
        domain_id,
        user_id
    } = user;

    try {
        const {
            productivetask_id,
            procedure_id,
            transfer_number,
            qualified_number
        } = body;

        const int_qualified_number = parseInt(qualified_number);
        if (int_qualified_number > transfer_number) {
            return common.sendError(res, 'productive_task_02');
        }

        const taskProcedure = await tb_productivetask_procedure.create({
            domain_id,
            productivetask_id,
            procedure_id,
            transfer_number,
            qualified_number: int_qualified_number,
            unqualified_number: transfer_number - int_qualified_number,
            user_id,
            biz_code: await genBizCode(CODE_NAME.GXYZDH, domain_id, 6)
        });

        const taskTransfer = await tb_productivetask_transfer.findOne({
            where: {
                productivetask_id,
                procedure_id
            }
        });

        if (taskTransfer) {
            taskTransfer.transfer_number = 0;
            taskTransfer.qualified_number += int_qualified_number;
            await taskTransfer.save();
        }

        common.sendData(res, taskProcedure);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getProductiveProcedureList(req, res) {
    const {
        body,
        user
    } = req;
    const {
        domain_id
    } = user;
    const returnData = {};

    try {
        const {
            search_text
        } = body;

        let queryStr =
            `select
                ptp.biz_code, date(ptp.created_at) as created_at
                , ptp.transfer_number, ptp.qualified_number, ptp.unqualified_number
                , pt.productivetask_code, pt.biz_code as task_biz_code
                , mt.materiel_code, mt.materiel_name, mt.materiel_format, mt.materiel_unit
                , usr.name as user_name
                , pur.name as appoint_user
                , ptt.procedure_id
                from tbl_erc_productivetask_procedure ptp
                left join tbl_erc_productivetask pt
                on ptp.productivetask_id = pt.productivetask_id
                left join tbl_erc_materiel mt
                on pt.materiel_id = mt.materiel_id
                left join tbl_common_user usr
                on ptp.user_id = usr.user_id
                left join tbl_erc_productivetask_transfer ptt
                on (ptt.productivetask_id = ptp.productivetask_id and ptt.procedure_id = ptp.procedure_id)
                left join tbl_common_user pur
                on ptt.appoint_user_id = pur.user_id
                where true
                and ptp.domain_id = ?`;

        const replacements = [domain_id];

        if (search_text) {
            queryStr += ` and (pt.productivetask_code like ? or mt.materiel_code like ? or mt.materiel_name like ?)`;
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getTransferProcedure(req, res) {
    const {
        body,
        user
    } = req;
    const {
        domain_id
    } = user;
    const {
        productivetask_id,
        procedure_id
    } = body;

    try {
        const queryStr =
            `select
                ptt.procedure_id as id, ptp.procedure_name as text, ptt.procedure_level, ppp.priority
                from tbl_erc_productivetask pt
                left join tbl_erc_productivetaskprocess ptt
                on ptt.productivetask_id = pt.productivetask_id
                left join tbl_erc_productionprocedure ptp
                on ptt.procedure_id = ptp.procedure_id
                left join tbl_erc_productplanprocedure ppp
                on (pt.product_id = ppp.product_plan_id and ptt.procedure_id = ppp.procedure_id)
                where true
                and pt.domain_id = ?
                and pt.productivetask_id = ?
                order by ppp.priority asc`;
        // const queryStr =
        //     `select
        //         ptp.procedure_id as id, ptp.procedure_name as text, ppp.priority
        //         from tbl_erc_productivetask ptt
        //         left join tbl_erc_productionprocedure ptp
        //         on ptt.procedure_id = ptp.procedure_id
        //         left join tbl_erc_productplanprocedure ppp
        //         on (ptt.product_id = ppp.product_plan_id and ptt.procedure_id = ppp.procedure_id)
        //         where true
        //         and ptt.domain_id = ?
        //         and ptt.order_id = ?
        //         and ptt.department_id = ?
        //         order by ppp.priority asc`;

        const replacements = [domain_id, productivetask_id];
        const result = await common.simpleSelect(sequelize, queryStr, replacements);
        if (result.length < 2) {
            common.sendData(res, []);
        } else {
            const int_procedure_id = parseInt(procedure_id);
            if (int_procedure_id === result[result.length - 1].id) {
                common.sendData(res, []);
            } else {
                const procedureList = result.filter(item => {
                    return item.id !== int_procedure_id;
                }).map(item => {
                    const {
                        id,
                        text
                    } = item;
                    return {
                        id,
                        text
                    }
                });
                common.sendData(res, procedureList);
            }
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}
