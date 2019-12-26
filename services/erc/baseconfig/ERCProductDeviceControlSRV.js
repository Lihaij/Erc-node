const moment = require('moment');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ProduceControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');

const FDomain = require('../../../bl/common/FunctionDomainBL');

const sequelize = model.sequelize;
const tb_productdevice = model.erc_productdevice;
const tb_productdevice_capacity = model.erc_productdevice_capacity;
const tb_fixedassetscheckdetail = model.erc_fixedassetscheckdetail;

exports.ERCProductDeviceControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'initProductDevice') {
        initProductDevice(req, res)
    } else if (method === 'searchProductDevice') {
        searchProductDevice(req, res)
    } else if (method === 'searchProductDeviceCapacity') {
        searchProductDeviceCapacity(req, res)
    } else if (method === 'addProductDevice') {
        addProductDevice(req, res)
    } else if (method === 'modifyProductDevice') {
        modifyProductDevice(req, res)
    } else if (method === 'deleteProductDevice') {
        deleteProductDevice(req, res)
    } else if (method === 'addProductDeviceCapacity') {
        addProductDeviceCapacity(req, res)
    } else if (method === 'modifyProductDeviceCapacity') {
        modifyProductDeviceCapacity(req, res)
    } else if (method === 'deleteProductDeviceCapacity') {
        deleteProductDeviceCapacity(req, res)
    } else {
        common.sendError(res, 'common_01');
    }
};

async function getProcedureType(req, domain_id) {
    let queryStr =
        `select t.*, rt.basetype_code, rt.basetype_name
         from tbl_erc_basetypedetail t
         left join tbl_erc_basetype rt
         on t.basetype_id = rt.basetype_id
         where t.state = 1
         and t.domain_id = ?`;

    const replacements = [domain_id];
    queryStr += ' order by t.created_at desc';
    const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    return result.data;
}

/*async function getFixedAssets(domain_id) {
    let queryStr =
        `select
         fad.fixedassetscheckdetail_id, fad.fixedassets_no, fad.fixedassets_name, fad.fixedassets_model, fad.fixedassets_unit
         , fac.fixedassetscheck_no, dpt.department_id, dpt.department_name, dpt.work_time
         from tbl_erc_fixedassetscheckdetail fad
         left join tbl_erc_department dpt
         on fad.department_id = dpt.department_id
         left join tbl_erc_fixedassetscheck fac
         on fad.fixedassetscheck_id = fac.fixedassetscheck_id
         where true
         and fad.fixedassets_category = 2
         and fac.check_state = 3
         and fac.state = 1
         and fad.state = 1
         and dpt.department_type = 0
         and fac.domain_id = ?
         order by fac.created_at desc`;

    return await common.simpleSelect(sequelize, queryStr, [ domain_id ]);
}*/

async function initProductDevice(req, res) {
    const returnData = {};
    const user = req.user;

    try {
        // await FDomain.getDomainListInit(req, returnData);
        // returnData.domainTypeInfo = GLBConfig.DOMAINTYPE; //单位
        // returnData.statusInfo = GLBConfig.STATUSINFO; //生效状态
        // returnData.procedureInfo = await getProcedureType(req, user.domain_id);
        // returnData.procedureTypeInfo = returnData.procedureInfo.map(item => {
        //     return {
        //         id: item.basetypedetail_id,
        //         text: item.typedetail_name
        //     }
        // });
        /*returnData.fixedAssetsInfo = await getFixedAssets(user.domain_id);
        returnData.deviceInfo = returnData.fixedAssetsInfo.map(item => {
            return {
                id: item.fixedassetscheckdetail_id,
                text: `${item.fixedassets_no} - ${item.fixedassets_name}`
            }
        });*/
        returnData.productDeviceInfo = GLBConfig.PRODUCTDEVICETYPE;

        common.sendData(res, returnData)
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function searchProductDevice(req, res) {
    const body = req.body;
    const user = req.user;
    const returnData = {};

    try {
        let queryStr =
            `select
                pd.*, fac.*, dpt.department_name
                from tbl_erc_productdevice pd
                left join tbl_erc_fixedassetscheckdetail fac
                on pd.fixedassetsdetail_id = fac.fixedassetscheckdetail_id
                left join tbl_erc_department dpt
                on fac.department_id = dpt.department_id
                where true
                and pd.state = 1
                and pd.domain_id = ?`;

        const replacements = [user.domain_id];

        if (body.search_text) {
            queryStr += ' and (fac.fixedassets_no like ? or fac.fixedassets_name like ?)';
            replacements.push('%' + body.search_text + '%');
            replacements.push('%' + body.search_text + '%');
        }

        if (body.department_id) {
            queryStr += ' and dpt.department_id = ?';
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

async function searchProductDeviceCapacity(req, res) {
    const body = req.body;
    const user = req.user;
    const returnData = {};

    try {
        const { productdevice_id, search_text } = body;
        const { domain_id } = user;

        let queryStr =
            `select
                mat.materiel_code, mat.materiel_name, pdc.*
                from tbl_erc_productdevice_capacity pdc
                left join tbl_erc_materiel mat
                on pdc.materiel_id = mat.materiel_id
                where true
                and pdc.productdevice_id = ?
                and pdc.domain_id = ?
                and mat.state = ?`;

        const replacements = [productdevice_id, domain_id, GLBConfig.ENABLE];

        if (search_text) {
            queryStr += ' and (mat.materiel_code like ? or mat.materiel_name like ?)';
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

async function addProductDevice(req, res) {
    const body = req.body;
    const user = req.user;

    try {
        const productDeviceResult = await tb_productdevice.findOne({
            where: {
                domain_id: user.domain_id,
                state: GLBConfig.ENABLE,
                fixedassetsdetail_id: body.fixedassetscheckdetail_id
            }
        });

        if (!productDeviceResult) {
            const addResult = await tb_productdevice.create({
                domain_id: user.domain_id,
                fixedassetsdetail_id: body.fixedassetscheckdetail_id,
                // day_capacity: body.day_capacity,
                device_level: body.device_level,
                // work_time: body.work_time,
                // hour_capacity: body.hour_capacity
            });

            await tb_fixedassetscheckdetail.update({
                fixedassets_device: 1
            }, {
                where: {
                    fixedassetscheckdetail_id:body.fixedassetscheckdetail_id
                }
            });

            common.sendData(res, addResult);
        } else {
            common.sendError(res, 'productdevice_01');
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function modifyProductDevice(req, res) {
    const body = req.body;
    const user = req.user;

    try {
        const productDeviceResult = await tb_productdevice.findOne({
            where: {
                productdevice_id: body.old.productdevice_id,
                domain_id: user.domain_id
            }
        });

        if (productDeviceResult) {
            productDeviceResult.day_capacity = body.new.day_capacity;
            productDeviceResult.device_level = body.new.device_level;
            await productDeviceResult.save();
            common.sendData(res, productDeviceResult);
        } else {
            common.sendError(res, 'productdevice_01');
        }
    } catch (error) {
        return common.sendFault(res, error);
    }
}

async function deleteProductDevice(req, res) {
    try {
        const body = req.body;
        const user = req.user;

        let deleteResult = await tb_productdevice.findOne({
            where: {
                productdevice_id: body.productdevice_id,
                domain_id: user.domain_id,
                state: GLBConfig.ENABLE
            }
        });

        if (deleteResult) {
            deleteResult.state = GLBConfig.DISABLE;
            await deleteResult.save();


            await tb_fixedassetscheckdetail.update({
                fixedassets_device: 0
            }, {
                where: {
                    fixedassetscheckdetail_id:deleteResult.fixedassetsdetail_id
                }
            });


            common.sendData(res);
        } else {
            common.sendError(res, 'productdevice_01');
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function addProductDeviceCapacity(req, res) {
    const { body, user } = req;

    try {
        const { productdevice_id, materielArray } = body;
        const { domain_id } = user;

        for (const materiel_id of materielArray) {
            const productDeviceCapacity = await tb_productdevice_capacity.findOne({
                where: {
                    productdevice_id,
                    materiel_id,
                    domain_id
                }
            });

            if (productDeviceCapacity) {
                continue;
            }

            await tb_productdevice_capacity.create({
                productdevice_id,
                materiel_id,
                domain_id
            });
        }

        common.sendData(res);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function modifyProductDeviceCapacity(req, res) {
    const { body } = req;

    try {
        const { productdevice_capacity_id, work_time, hour_capacity } = body.new;

        const result = await tb_productdevice_capacity.findOne({
            where: {
                productdevice_capacity_id
            }
        });

        if (result) {
            const int_work_time = parseInt(work_time);
            const int_hour_capacity = parseInt(hour_capacity);
            result.hour_capacity = int_hour_capacity;
            result.day_capacity = int_work_time * int_hour_capacity;
            await result.save();
        }

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function deleteProductDeviceCapacity(req, res) {
    const { body } = req;

    try {
        const { productdevice_capacity_id } = body;

        const result = await tb_productdevice_capacity.destroy({
            where: {
                productdevice_capacity_id
            }
        });

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}
