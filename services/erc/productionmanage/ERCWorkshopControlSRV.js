const common = require('../../../util/CommonUtil');
const logger = require('../../../util/Logger').createLogger('ERCTaxStatementControlSRV');
const model = require('../../../model');
const GLBConfig = require('../../../util/GLBConfig');

const sequelize = model.sequelize;
const tb_department = model.erc_department;
const tb_productdevice = model.erc_productdevice;
const tb_productdevice_capacity = model.erc_productdevice_capacity;
const tb_fixedassetscheckdetail = model.erc_fixedassetscheckdetail;
const tb_departmentprocedure = model.erc_departmentprocedure;
const tb_productproceduredevice = model.erc_productproceduredevice;
const tb_productionprocedure = model.erc_productionprocedure;

exports.ERCWorkshopControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'initWorkshop') {
        await initWorkshop(req, res);
    } else if (method === 'addWorkshopProcedure') {
        await addWorkshopProcedure(req, res);
    } else if (method === 'getWorkshopList') {
        await getWorkshopList(req, res);
    } else if (method === 'getWorkshopProcedure') {
        await getWorkshopProcedure(req, res);
    } else if (method === 'getWorkshopProcedureByDepartment') {
        await getWorkshopProcedureByDepartment(req, res);
    } else if (method === 'modifyWorkshop') {
        await modifyWorkshop(req, res);
    } else if (method === 'deleteWorkshopProcedure') {
        await deleteWorkshopProcedure(req, res);
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else {
        common.sendError(res, 'common_01')
    }
};

async function getProcedureType(req, domain_id) {
    let queryStr =
        `select
            t.basetypedetail_id as id, t.typedetail_name as text
            from tbl_erc_basetypedetail t
            left join tbl_erc_basetype rt
            on t.basetype_id = rt.basetype_id
            where t.state = 1
            and t.domain_id = ?
            and basetype_code = 'SCGXFL'`;

    const replacements = [domain_id];
    queryStr += ' order by t.created_at desc';
    return await common.simpleSelect(sequelize, queryStr, replacements);
}

async function initWorkshop(req, res) {
    const {
        user
    } = req;
    const {
        domain_id
    } = user;
    const returnData = {};

    try {
        returnData.enableInfo = GLBConfig.USERSTATE;
        returnData.vacationInfo = GLBConfig.VACATION_STATE;
        returnData.procedureInfo = await getProcedureType(req, domain_id);
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function addWorkshopProcedure(req, res) {
    const {
        body
    } = req;

    try {
        const {
            procedureArray,
            department_id
        } = body;

        for (const procedure_id of procedureArray) {
            const departmentProcedure = await tb_departmentprocedure.findOne({
                where: {
                    procedure_id,
                    department_id
                }
            });

            if (!departmentProcedure) {
                await tb_departmentprocedure.create({
                    procedure_id,
                    department_id
                });
            }
        }

        common.sendData(res, {});
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getWorkshopList(req, res) {
    const {
        body,
        user
    } = req;
    const returnData = {};

    try {
        const {
            domain_id
        } = user;
        const {
            search_text
        } = body;

        let queryStr =
            `select
                dpt.*, date(dpt.created_at) as created_at, date(dpt.mrp_begin_time) as mrp_begin_time
                from tbl_erc_department dpt
                where true
                and dpt.department_type = 0
                and dpt.state = ?
                and dpt.domain_id = ?`;

        const replacements = [GLBConfig.ENABLE, domain_id];

        if (search_text) {
            queryStr += ` and (dpt.department_id like ? or dpt.department_name like ?)`;
            replacements.push(search_text);
            replacements.push(search_text);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        /*returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.created_at = r.created_at.Format("yyyy-MM-dd");
            result.mrp_begin_time = (r.mrp_begin_time) ? r.mrp_begin_time.Format("yyyy-MM-dd") : '';
            returnData.rows.push(result)
        }*/
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getWorkshopProcedure(req, res) {
    const {
        body,
        user
    } = req;
    const returnData = {};

    try {
        const {
            domain_id
        } = user;
        const {
            department_id,
            search_text
        } = body;

        let queryStr =
            `select
                dpp.departmentprocedure_id, pp.procedure_id, pp.procedure_code, pp.procedure_name, pp.procedure_type, pp.procedure_cost
                from tbl_erc_departmentprocedure dpp
                left join tbl_erc_productionprocedure pp
                on dpp.procedure_id = pp.procedure_id
                where true
                and pp.state = ?
                and pp.domain_id = ?
                and dpp.department_id = ?`;

        const replacements = [GLBConfig.ENABLE, domain_id, department_id];

        if (search_text) {
            queryStr += ` and (pp.procedure_code like ? or pp.procedure_name like ?)`;
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

async function getWorkshopProcedureByDepartment(req, res) {
    const {
        body,
        user
    } = req;
    const returnData = {};

    try {
        const {
            domain_id
        } = user;
        const {
            department_id,
            search_text
        } = body;

        let queryStr =
            `select
                pp.procedure_id, pp.procedure_code, pp.procedure_name, pp.procedure_type, pp.procedure_cost
                from tbl_erc_productionprocedure pp
                where true
                and pp.state = ?
                and pp.domain_id = ?
                and pp.department_id = ?`;

        const replacements = [GLBConfig.ENABLE, domain_id, department_id];

        if (search_text) {
            queryStr += ` and (pp.procedure_code like ? or pp.procedure_name like ?)`;
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

/*async function getProductProcedureDeviceArray(domain_id, department_id) {
    const queryStr =
        `select
            ppd.ppdevice_id
            from tbl_erc_productproceduredevice ppd
            left join tbl_erc_productdevice pd
            on ppd.productdevice_id = pd.productdevice_id
            left join tbl_erc_fixedassetscheckdetail fad
            on fad.fixedassetscheckdetail_id = pd.fixedassetsdetail_id
            where true
            and ppd.state = ?
            and pd.state = ?
            and ppd.domain_id = ?
            and fad.department_id = ?`;

    const replacements = [GLBConfig.ENABLE, GLBConfig.ENABLE, domain_id, department_id];
    return await common.simpleSelect(sequelize, queryStr, replacements);
}*/

async function modifyWorkshop(req, res) {
    const {
        body,
        user
    } = req;

    try {
        const {
            department_id,
            vacation_type
        } = body.new;

        await sequelize.transaction(async (transaction) => {
            const department = await tb_department.findOne({
                where: {
                    department_id
                }
            });

            if (department) {
                department.vacation_type = vacation_type;
                await department.save({
                    validate: true,
                    transaction
                });

                /*if (parseInt(oldBody.work_time) !== parseInt(work_time)) {
                    //如果车间工时变化 取得该车间所有的是生产设备的固定资产ID
                    const procedureDeviceArray = await getProductProcedureDeviceArray(domain_id, department_id);
                    for (const {
                            ppdevice_id
                        } of procedureDeviceArray) {
                        //遍历所有设备对应的工序
                        const procedureDevice = await tb_productproceduredevice.findOne({
                            where: {
                                ppdevice_id
                            }
                        });

                        if (procedureDevice) {
                            //更新日产能
                            const {
                                hour_capacity
                            } = procedureDevice;
                            procedureDevice.day_capacity = hour_capacity * int_work_time;
                            await procedureDevice.save({
                                validate: true,
                                transaction
                            });
                        }
                    }
                }*/
            }
        });

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function deleteWorkshopProcedure(req, res) {
    const {
        body
    } = req;

    try {
        const {
            departmentprocedure_id
        } = body;
        const result = await tb_departmentprocedure.destroy({
            where: {
                departmentprocedure_id
            }
        });
        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let modDept = await tb_department.findOne({
            where: {
                department_id: doc.old.department_id
            }
        });
        if (modDept) {
            modDept.mrp_begin_time = doc.new.mrp_begin_time;
            await modDept.save();
            common.sendData(res, modDept);
        } else {
            common.sendError(res, 'department_01');
            return
        }
    } catch (error) {
        common.sendFault(res, error)
        return null
    }
}
