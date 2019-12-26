const moment = require('moment');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ProduceControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const { CODE_NAME, genBizCode } = require('../../../util/BizCodeUtil');

const FDomain = require('../../../bl/common/FunctionDomainBL');

const sequelize = model.sequelize;
const tb_common_apidomain = model.common_apidomain;
const tb_productionprocedure = model.erc_productionprocedure;
const tb_productproceduredevice = model.erc_productproceduredevice;
const tb_productdevice = model.erc_productdevice;
const tb_fixedassetscheckdetail = model.erc_fixedassetscheckdetail;
const tb_department = model.erc_department;

exports.ERCProductionProcedureControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'initProductionProcedure') {
        initProductionProcedure(req, res)
    } else if (method === 'searchProductionProcedure') {
        searchProductionProcedure(req, res)
    } else if (method === 'updateProcedureDepartment') {
        updateProcedureDepartment(req, res)
    } else if (method === 'addProductProcedureDevice') {
        addProductProcedureDevice(req, res)
    } else if (method === 'getProductProcedureDevice') {
        getProductProcedureDevice(req, res)
    } else if (method === 'getProcedureDeviceCount') {
        getProcedureDeviceCount(req, res)
    } else if (method === 'getProductDeviceDepartment') {
        getProductDeviceDepartment(req, res)
    } else if (method === 'delProductProcedureDevice') {
        delProductProcedureDevice(req, res)
    } else if (method === 'addProductionProcedure') {
        addProductionProcedure(req, res)
    } else if (method === 'modifyProductionProcedure') {
        modifyProductionProcedure(req, res)
    } else if (method === 'deleteProductionProcedure') {
        deleteProductionProcedure(req, res)
    } else if (method === 'modifyCoefficient') {
        modifyCoefficient(req, res)
    } else {
        common.sendError(res, 'common_01');
    }
};

async function modifyCoefficient(req, res) {
    const body = req.body;
    const user = req.user;

    try {
        let modifyC = await tb_productionprocedure.update({
            procedure_coefficient: body.coefficient,
        }, {
            where: {
                state: 1,
                domain_id: user.domain_id
            }
        })
        common.sendData(res, modifyC)
    } catch (error) {
        return common.sendFault(res, error);
    }
}
async function getProcedureType(req, domain_id) {
    let queryStr =
        `select t.*, rt.basetype_code, rt.basetype_name
         from tbl_erc_basetypedetail t
         left join tbl_erc_basetype rt
         on t.basetype_id = rt.basetype_id
         where t.state = 1
         and t.domain_id = ? and basetype_code='SCGXFL'`;

    const replacements = [domain_id];
    queryStr += ' order by t.created_at desc';
    const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    return result.data;
}

async function getProductDevice(req, domain_id) {
    let queryStr =
        `select
            *
            from tbl_erc_productdevice pd
            left join tbl_erc_fixedassetscheckdetail fac
            on pd.fixedassetsdetail_id = fac.fixedassetscheckdetail_id
            where true
            and pd.state = 1
            and pd.domain_id = ?`;

    queryStr += ' order by pd.created_at desc';
    const replacements = [domain_id];
    return await common.simpleSelect(sequelize, queryStr, replacements);
}

async function initProductionProcedure(req, res) {
    const returnData = {};
    const user = req.user;

    try {
        await FDomain.getDomainListInit(req, returnData);
        returnData.domainTypeInfo = GLBConfig.DOMAINTYPE; //单位
        returnData.statusInfo = GLBConfig.STATUSINFO; //生效状态
        returnData.procedureInfo = await getProcedureType(req, user.domain_id);
        returnData.procedureTypeInfo = returnData.procedureInfo.map(item => {
            return {
                id: item.basetypedetail_id,
                text: item.typedetail_name
            }
        });

        returnData.productDeviceInfo = await getProductDevice(req, user.domain_id);
        returnData.deviceInfo = returnData.productDeviceInfo.map(item => {
            const deviceInfo = GLBConfig.PRODUCTDEVICETYPE.find(subItem => parseInt(subItem.value) === item.device_level);
            return {
                id: item.fixedassetscheckdetail_id,
                text: `${item.fixedassets_no} - ${item.fixedassets_name} `
            }
        });

        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function searchProductionProcedure(req, res) {
    const body = req.body;
    const user = req.user;
    const returnData = {};

    try {
        let queryStr =
            `select
             pp.*, dpt.department_name
             from tbl_erc_productionprocedure pp
             left join tbl_erc_department dpt
             on pp.department_id = dpt.department_id
             where true
             and pp.state = 1
             and pp.domain_id = ?`;

        const replacements = [user.domain_id];

        if (body.search_text) {
            queryStr += ' and (pp.biz_code like ? or pp.procedure_name like ?)';
            replacements.push('%' + body.search_text + '%');
            replacements.push('%' + body.search_text + '%');
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function updateProcedureDepartment(req, res) {
    const { body } = req;

    try {
        const { procedure_id, department_id } = body;

        const productionProcedure = await tb_productionprocedure.findOne({
            where: {
                procedure_id
            }
        });

        if (productionProcedure) {
            productionProcedure.department_id = department_id;
            await productionProcedure.save();
        }

        common.sendData(res, productionProcedure);
    } catch (e) {
        common.sendFault(res, e);
    }
}

async function getProductProcedureDevice(req, res) {
    const body = req.body;
    const user = req.user;
    const returnData = {};

    try {
        let queryStr =
            `select
                ppd.ppdevice_id, ppd.productprocedure_id, ppd.productdevice_id, ppd.hour_capacity, ppd.day_capacity
                , pd.fixedassetsdetail_id, pd.device_level
                , fac.fixedassets_no, fac.fixedassets_name, fac.fixedassets_model, fac.fixedassets_unit
                , dpt.department_id, dpt.department_name
                from tbl_erc_productproceduredevice ppd
                left join tbl_erc_productdevice pd
                on ppd.productdevice_id = pd.productdevice_id
                left join tbl_erc_fixedassetscheckdetail fac
                on pd.fixedassetsdetail_id = fac.fixedassetscheckdetail_id
                left join tbl_erc_department dpt
                on fac.department_id = dpt.department_id
                where true
                and ppd.domain_id = ?
                and ppd.state = ?
                and pd.state = ?`;

        const replacements = [user.domain_id, GLBConfig.ENABLE, GLBConfig.ENABLE];

        if (body.productprocedure_id) {
            queryStr += ` and ppd.productprocedure_id = ?`;
            replacements.push(body.productprocedure_id);
        }

        if (body.department_id) {
            queryStr += ` and dpt.department_id = ?`;
            replacements.push(body.department_id);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getProcedureDeviceCount(req, res) {
    const { body, user } = req;

    try {
        const { procedure_id } = body;
        const { domain_id } = user;

        const deviceCount = await tb_productproceduredevice.count({
            where: {
                productprocedure_id: procedure_id,
                state: GLBConfig.ENABLE,
                domain_id
            }
        });

        common.sendData(res, deviceCount);
    } catch (e) {
        common.sendFault(res, e);
    }
}

async function getProductDeviceDepartment(req, res) {
    const { body, user } = req;

    try {
        const { procedure_id } = body;
        const { domain_id } = user;
        const prdProcedureDevice = await tb_productproceduredevice.findOne({
            where: {
                productprocedure_id: procedure_id,
                state: GLBConfig.ENABLE
            }
        });

        if (prdProcedureDevice) {
            const { productdevice_id } = prdProcedureDevice;
            const productDevice = await tb_productdevice.findOne({
                where: {
                    productdevice_id,
                    domain_id,
                    state: GLBConfig.ENABLE
                }
            });

            if (productDevice) {
                const { fixedassetsdetail_id } = productDevice;
                const fixedAssetsCheck = await tb_fixedassetscheckdetail.findOne({
                    where: {
                        fixedassetscheckdetail_id: fixedassetsdetail_id,
                        state: GLBConfig.ENABLE
                    }
                });

                common.sendData(res, fixedAssetsCheck);
            }
        }

        common.sendData(res);
    } catch (e) {
        common.sendFault(res, e);
    }
}

async function addProductProcedureDevice(req, res) {
    const body = req.body;
    const user = req.user;

    try {
        const { productprocedure_id, productdevice_id, hour_capacity, work_time } = body;

        const procedureResult = await tb_productproceduredevice.findOne({
            where: {
                domain_id: user.domain_id,
                state: GLBConfig.ENABLE,
                productprocedure_id: productprocedure_id,
                productdevice_id: productdevice_id
            }
        });

        if (!procedureResult) {
            const productDevice = await tb_productdevice.findOne({
                where: {
                    productdevice_id: productdevice_id
                }
            });

            const { device_level } = productDevice;
            const int_hour_capacity = parseInt(hour_capacity);
            const day_capacity = work_time * int_hour_capacity;

            const addResult = await tb_productproceduredevice.create({
                domain_id: user.domain_id,
                productprocedure_id: body.productprocedure_id,
                productdevice_id: body.productdevice_id,
                device_level,
                hour_capacity: int_hour_capacity,
                day_capacity
            });
            common.sendData(res, addResult);
        } else {
            common.sendError(res, 'productdevice_01');
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function delProductProcedureDevice(req, res) {
    const body = req.body;
    const user = req.user;

    try {
        /*const deleteResult = await tb_productproceduredevice.findOne({
            where: {
                ppdevice_id: body.ppdevice_id,
                domain_id: user.domain_id,
                state: GLBConfig.ENABLE
            }
        });

        if (deleteResult) {
            deleteResult.state = GLBConfig.DISABLE;
            await deleteResult.save();
            common.sendData(res);
        } else {
            common.sendError(res, 'productdevice_01');
        }*/

        await tb_productproceduredevice.destroy({
            where: {
                ppdevice_id: body.ppdevice_id,
                domain_id: user.domain_id
            }
        });

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function addProductionProcedure(req, res) {
    const body = req.body;
    const user = req.user;

    try {
        let procedureResult = await tb_productionprocedure.findOne({
            where: {
                domain_id: user.domain_id,
                state: GLBConfig.ENABLE,
                procedure_code: body.procedure_code,
                procedure_name: body.procedure_name
            }
        });

        if (!procedureResult) {
            const biz_code = await genBizCode(CODE_NAME.SCGX, user.domain_id, 6);

            const addResult = await tb_productionprocedure.create({
                domain_id: user.domain_id,
                procedure_code: await Sequence.genProductionProcedureNo(),
                procedure_name: body.procedure_name,
                procedure_type: body.procedure_type,
                procedure_cost: body.procedure_cost,
                procedure_pay: body.procedure_pay,
                procedure_calc: body.procedure_calc,
                work_time: body.work_time,
                default_capacity: body.default_capacity,
                biz_code,
            });
            common.sendData(res, addResult);
        } else {
            common.sendError(res, 'procedure_02');
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function modifyProductionProcedure(req, res) {
    const body = req.body;
    const user = req.user;

    try {
        const procedureResult = await tb_productionprocedure.findOne({
            where: {
                procedure_id: body.new.procedure_id,
                domain_id: user.domain_id
            }
        });

        if (procedureResult) {
            procedureResult.procedure_name = body.new.procedure_name;
            procedureResult.procedure_type = body.new.procedure_type;
            procedureResult.procedure_cost = body.new.procedure_cost;
            procedureResult.procedure_pay = body.new.procedure_pay;
            procedureResult.procedure_calc = body.new.procedure_calc;
            procedureResult.procedure_master_device = body.new.procedure_master_device;
            procedureResult.procedure_slave_device = body.new.procedure_slave_device;
            procedureResult.work_time = body.new.work_time;
            procedureResult.default_capacity = body.new.default_capacity;
            await procedureResult.save();

            const old_work_time = body.old.work_time;
            const new_work_time = body.new.work_time;
            if (parseInt(old_work_time) !== parseInt(new_work_time)) {
                const productProcedureDeviceArray = await tb_productproceduredevice.findAll({
                    where: {
                        productprocedure_id: body.new.procedure_id
                    }
                });

                for (const productProcedureDeviceItem of productProcedureDeviceArray) {
                    const { hour_capacity } = productProcedureDeviceItem;
                    productProcedureDeviceItem.day_capacity = hour_capacity * parseInt(new_work_time);
                    await productProcedureDeviceItem.save();
                }
            }

            common.sendData(res, procedureResult);
        } else {
            common.sendError(res, 'procedure_01');
        }
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function deleteProductionProcedure(req, res) {
    try {
        const body = req.body;
        const user = req.user;

        let deleteResult = await tb_productionprocedure.findOne({
            where: {
                procedure_id: body.procedure_id,
                domain_id: user.domain_id,
                state: GLBConfig.ENABLE
            }
        });

        if (deleteResult) {
            deleteResult.state = GLBConfig.DISABLE;
            await deleteResult.save();

            await tb_productproceduredevice.update({
                state: GLBConfig.DISABLE
            }, {
                where: {
                    productprocedure_id: body.procedure_id
                }

            });

            common.sendData(res);
        } else {
            common.sendError(res, 'procedure_01');
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}
