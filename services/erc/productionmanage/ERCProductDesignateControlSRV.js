const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCProductDesignate');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');

const task = require('../baseconfig/ERCTaskListControlSRV')
const tb_productdesignate = model.erc_productdesignate
const tb_taskallot = model.erc_taskallot
exports.ERCProductDesignateControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res)
    } else if (method === 'getProductDevice') {
        getProductDevice(req, res)
    } else if (method === 'getProductDesignate') {
        getProductDesignate(req, res)
    } else if (method === 'addProductDesignate') {
        addProductDesignate(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};
async function initAct(req, res) {
    let returnData = {};
    try {
        returnData.procedure = await getProcedure(req);
        returnData.product_designate_type = GLBConfig.PRODUCT_DESIGNATE_TYPE
        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

async function getProcedure(req) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = [],
            replacements = [],
            queryStr = ''

        queryStr = `select * from tbl_erc_productionprocedure where state=1 and domain_id=?`
        replacements = [user.domain_id]
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        for (let r of result) {
            returnData.push({
                id: r.procedure_id,
                value: r.procedure_id,
                text: r.procedure_name
            })
        }
        return returnData
    } catch (error) {
        throw error
    }
}

async function getProductDevice(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {
                m_equipment: [],
                a_equipment: []
            },
            replacements = [],
            queryStr = ''

        queryStr = `select ppd.productdevice_id,ppd.device_level,f.* from tbl_erc_productproceduredevice ppd 
            left join tbl_erc_fixedassetscheckdetail f on (ppd.productdevice_id=f.fixedassetscheckdetail_id and f.state=1)
            where ppd.state=1 and ppd.productprocedure_id=? and ppd.domain_id=?`
        replacements.push(doc.productprocedure_id)
        replacements.push(user.domain_id)
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        for (let r of result) {
            if (r.device_level == 1) {
                returnData.m_equipment.push({
                    id: r.productdevice_id,
                    value: r.productdevice_id,
                    text: r.fixedassets_name
                })
            } else {
                returnData.a_equipment.push({
                    id: r.productdevice_id,
                    value: r.productdevice_id,
                    text: r.fixedassets_name
                })
            }
        }
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return
    }
}

async function getProductDesignate(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {},
            replacements = []

        let queryStr = `select pd.productdesignate_id,pd.productdesignate_code,u.username,pp.procedure_name,pd.productdesignate_number,
                f1.fixedassets_name as m_equipment_name,f2.fixedassets_name as a_equipment_name,pd.productdesignate_date,
                pd.productdesignate_remark,pd.productdesignate_state 
                from tbl_erc_productdesignate pd 
                left join tbl_common_user u on (pd.productdesignate_user_id = u.user_id and u.state = 1)
                left join tbl_erc_productionprocedure pp on (pd.productdesignate_procedure_id = pp.procedure_id and pp.state=1)
                left join tbl_erc_fixedassetscheckdetail f1 on (pd.productdesignate_m_equipment = f1.fixedassetscheckdetail_id and f1.state=1)
                left join tbl_erc_fixedassetscheckdetail f2 on (pd.productdesignate_a_equipment = f2.fixedassetscheckdetail_id and f2.state=1)
                where pd.state=1 and pd.domain_id=?`
        replacements = [user.domain_id]
        if (doc.search_text) {
            queryStr += ` and (pd.productdesignate_code like ? or u.user_id like ?)`
            replacements.push(doc.search_text)
            replacements.push(doc.search_text)
        }
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

async function addProductDesignate(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user

        //校验是否分配任务处理人员
        // let taskallot = await tb_taskallot.findOne({
        //     where: {
        //         state: GLBConfig.ENABLE,
        //         taskallot_name: '生产派工单任务'
        //     }
        // });
        let PDID = await Sequence.genProductDesignateID(user.domain_id);
        let productdesignate = await tb_productdesignate.create({
            domain_id: user.domain_id,
            productdesignate_code: PDID,
            productdesignate_user_id: doc.productdesignate_user_id,
            productdesignate_procedure_id: doc.productdesignate_procedure_id,
            productdesignate_number: doc.productdesignate_number,
            productdesignate_m_equipment: doc.productdesignate_m_equipment,
            productdesignate_a_equipment: doc.productdesignate_a_equipment,
            productdesignate_date: doc.productdesignate_date,
            productdesignate_remark: doc.productdesignate_remark,
            productdesignate_state: 1
        })

        // let taskName = '生产派工单任务';
        // let taskDescription = '  生产派工单任务';
        // let groupId = common.getUUIDByTime(30);
        // let taskResult = await task.createTask(user, taskName, 85, doc.productdesignate_user_id, productdesignate.productdesignate_id, taskDescription, '', groupId);
        // if (!taskResult) {
        //     return common.sendError(res, 'task_01');
        // } else {
        //     common.sendData(res, productdesignate);
        // }

        common.sendData(res, productdesignate);
    } catch (error) {
        common.sendFault(res, error);
        return;
    }
}

async function  modifyState(req, productdesignate_id) {
    try {
        let productdesignate = await tb_productdesignate.findOne({
            where: {
                state: 1,
                productdesignate_id: productdesignate_id
            }
        })
        productdesignate.productdesignate_state = '1';
        productdesignate.productdesignate_examine_time = new Date();
        await productdesignate.save();
    } catch (error) {
        throw error
    }
}
exports.modifyState = modifyState
