const common = require('../../../util/CommonUtil');
const logger = require('../../../util/Logger').createLogger('ERCComponentsControlSRV');
const model = require('../../../model');
const GLBConfig = require('../../../util/GLBConfig');

const sequelize = model.sequelize;
const tb_department = model.erc_department;
const tb_domain = model.common_domain;

exports.ERCComponentsControlResource = async (req, res) => {
    let method = req.query.method;
    if (method === 'initData') {
        await initData(req, res);
    } else if (method === 'getDepartmentData') {
        await getDepartmentData(req, res);
    } else if (method === 'getMaterielList') {
        await getMaterielList(req, res);
    } else if (method === 'getStockMaterielList') {
        await getStockMaterielList(req, res);
    } else if (method === 'getDepartmentList') {
        await getDepartmentList(req, res);
    } else if (method === 'getProductionProcedure') {
        await getProductionProcedure(req, res);
    } else if (method === 'getProductDevice') {
        await getProductDevice(req, res);
    } else if (method === 'getProcedureDevice') {
        await getProcedureDevice(req, res);
    } else if (method === 'getFixedAssets') {
        await getFixedAssets(req, res);
    } else if (method === 'getWarehouseList') {
        await getWarehouseList(req, res);
    } else if (method === 'getWarehouseZone') {
        await getWarehouseZone(req, res);
    } else if (method === 'getDomainInfo') {
        await getDomainInfo(req, res);
    } else if (method === 'getCorporateClientsList') {
        await getCorporateClientsList(req, res);
    } else if (method === 'getSupplierList') {
        await getSupplierList(req, res);
    } else if (method === 'getOtherMainList') {
        await getOtherMainList(req, res);
    } else {
        common.sendError(res, 'common_01')
    }
};

async function getProcedureType(domain_id, codeType) {
    let queryStr =
        `select
            t.basetypedetail_id as id, t.typedetail_name as text
            from tbl_erc_basetypedetail t
            left join tbl_erc_basetype rt
            on t.basetype_id = rt.basetype_id
            where t.state = ?
            and t.domain_id = ?
            and basetype_code = ?`;

    const replacements = [GLBConfig.ENABLE, domain_id, codeType];
    queryStr += ' order by t.created_at desc';
    return await common.simpleSelect(sequelize, queryStr, replacements);
}

async function initData(req, res) {
    const {
        user,
        body
    } = req;

    try {
        const {
            initType
        } = body;
        const {
            domain_id
        } = user;
        const returnData = {};

        switch (initType) {
            case 'materiel':
                returnData.unitInfo = await getProcedureType(domain_id, 'JLDW');
                returnData.materielSource = GLBConfig.MATERIELSOURCE;
                returnData.materielType = GLBConfig.MATERIELTYPE;
                returnData.materielAmto = GLBConfig.MATERIELAMTO;
                break;

            case 'department':
                returnData.departType = GLBConfig.DEPARTTYPE;
                break;

            case 'production_procedure':
                returnData.procedureInfo = await getProcedureType(domain_id, 'SCGXFL');
                break;

            case 'product_device':
                returnData.productDeviceInfo = GLBConfig.PRODUCTDEVICETYPE;
                break;

            case 'procedure_device':
                returnData.productDeviceInfo = GLBConfig.PRODUCTDEVICETYPE;
                break;

            case 'fixed_assets':
                break;
        }

        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getDepartmentData(req, res) {
    const {
        body,
        user
    } = req;

    try {
        const {
            domain_id
        } = user;
        const result = await tb_department.findAll({
            where: {
                domain_id,
                ...body
            },
            attributes: [
                ['department_id', 'id'],
                ['department_name', 'text']
            ]
        });

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getMaterielList(req, res) {
    const {
        body,
        user
    } = req;

    try {
        const {
            domain_id
        } = user;
        const {
            search_text,
            materiel_state_management,
            exclude_materiel_state_management,
            exclude_list = [],
            materiel_state_management_list
        } = body;
        const returnData = {};

        let queryStr =
            `select
                *
                from tbl_erc_materiel
                where state = ?
                and domain_id = ?`;

        const replacements = [GLBConfig.ENABLE, domain_id];

        if (search_text) {
            queryStr += ` and (materiel_code like ? or materiel_name like ?)`;
            replacements.push('%' + search_text + '%');
            replacements.push('%' + search_text + '%');
        }

        if (materiel_state_management) {
            queryStr += ` and materiel_state_management = ?`;
            replacements.push(materiel_state_management);
        }

        if (exclude_materiel_state_management) {
            queryStr += ` and materiel_state_management != ?`;
            replacements.push(exclude_materiel_state_management);
        }
        if (materiel_state_management_list) {
            if (materiel_state_management_list.length > 0) {
                queryStr += ` and materiel_state_management in (?)`;
                replacements.push(materiel_state_management_list);
            }
        }
        if (exclude_list.length > 0) {
            queryStr += ` and materiel_id not in (?)`;
            replacements.push(exclude_list);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getStockMaterielList(req, res) {
    const {
        body,
        user
    } = req;

    try {
        const {
            domain_id
        } = user;
        const {
            search_text,
            warehouse_id,
            materiel_state_management,
            exclude_list = [],
            large_zero,
            non_materiel_state_management,
            with_dismantle
        } = body;
        const returnData = {};

        let queryStr =
            `select
                mat.materiel_id, mat.materiel_code, mat.materiel_name, mat.materiel_format, mat.materiel_unit
                , wh.warehouse_name, whz.zone_name
                , sm.stockmap_id, sm.current_amount, sm.warehouse_id, sm.warehouse_zone_id
                from tbl_erc_stockmap sm
                left join tbl_erc_materiel mat
                on sm.materiel_id = mat.materiel_id
                left join tbl_erc_warehouse wh
                on sm.warehouse_id = wh.warehouse_id
                left join tbl_erc_warehousezone whz
                on sm.warehouse_zone_id = whz.warehouse_zone_id
                where true
                and sm.state = ?
                and sm.domain_id = ?`;

        const replacements = [GLBConfig.ENABLE, domain_id];

        if (search_text) {
            queryStr += ` and (mat.materiel_code like ? or mat.materiel_name like ?)`;
            replacements.push(search_text);
            replacements.push(search_text);
        }

        if (materiel_state_management) {
            queryStr += ` and mat.materiel_state_management = ?`;
            replacements.push(materiel_state_management);
        }

        if (non_materiel_state_management) {
            queryStr += ` and mat.materiel_state_management != ?`;
            replacements.push(non_materiel_state_management);
        }

        if (large_zero) {
            queryStr += ` and sm.current_amount > 0`;
        }

        if (warehouse_id) {
            queryStr += ` and sm.warehouse_id = ?`;
            replacements.push(warehouse_id);
        }

        if (exclude_list.length > 0) {
            queryStr += ` and sm.materiel_id not in (?)`;
            replacements.push(exclude_list);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        let stockMapList = result.data;

        if (with_dismantle) {
            let dismantleQueryStr =
                `select
                    sum(dmi.dismantle_number) as total_dismantle_number, dmi.materiel_id, dmi.warehouse_id, dmi.warehouse_zone_id
                    from tbl_erc_dismantle_materiel_item dmi
                    left join tbl_erc_dismantle_materiel dm
                    on dmi.dismantle_materiel_id = dm.dismantle_materiel_id
                    where true
                    and dmi.domain_id = ?
                    and dm.dismantle_state < 2`;

            const replacements = [domain_id];

            if (warehouse_id) {
                dismantleQueryStr += ` and dmi.warehouse_id = ?`;
                replacements.push(warehouse_id);
            }

            dismantleQueryStr += ` group by dmi.materiel_id, dmi.warehouse_id, dmi.warehouse_zone_id`;

            const dismantleArray = await common.simpleSelect(sequelize, dismantleQueryStr, replacements);

            for (const stockMapItem of stockMapList) {
                const {
                    materiel_id,
                    warehouse_id,
                    warehouse_zone_id,
                    current_amount
                } = stockMapItem;
                const dismantleResult = dismantleArray.find(item => item.materiel_id === materiel_id && item.warehouse_id === warehouse_id && item.warehouse_zone_id === warehouse_zone_id);
                if (dismantleResult) {
                    stockMapItem.total_dismantle_number = dismantleResult.total_dismantle_number;
                    stockMapItem.remain_number = current_amount - dismantleResult.total_dismantle_number;
                } else {
                    stockMapItem.total_dismantle_number = 0;
                    stockMapItem.remain_number = current_amount - 0;
                }
            }

            stockMapList = stockMapList.filter(item => item.remain_number > 0);
        }

        returnData.total = result.count;
        returnData.rows = stockMapList;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getDepartmentList(req, res) {
    const {
        body,
        user
    } = req;

    try {
        const {
            domain_id
        } = user;
        const {
            search_text,
            department_type
        } = body;
        const returnData = {};

        let queryStr =
            `select * from tbl_erc_department
             where true
             and department_state = ?
             and state = ?
             and domain_id = ?`;

        const replacements = [GLBConfig.ENABLE, GLBConfig.ENABLE, domain_id];

        if (search_text) {
            queryStr += ` and (department_id like ? or department_name like ?)`;
            replacements.push(search_text);
            replacements.push(search_text);
        }

        if (department_type || department_type === 0) {
            queryStr += ` and department_type = ?`;
            replacements.push(department_type);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getProductionProcedure(req, res) {
    const {
        body,
        user
    } = req;

    try {
        const {
            domain_id
        } = user;
        const {
            search_text,
            department_id
        } = body;
        const returnData = {};

        let queryStr =
            `select
                pp.*, dpt.department_name
                from tbl_erc_productionprocedure pp
                left join tbl_erc_department dpt
                on pp.department_id = dpt.department_id
                where true
                and pp.state = ?
                and pp.domain_id = ?`;

        const replacements = [GLBConfig.ENABLE, domain_id];

        if (search_text) {
            queryStr += ` and (pp.procedure_code like ? or pp.procedure_name like ?)`;
            replacements.push(search_text);
            replacements.push(search_text);
        }

        if (department_id) {
            queryStr += ` and pp.department_id = ?`;
            replacements.push(department_id);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getProductDevice(req, res) {
    const {
        body,
        user
    } = req;

    try {
        const {
            domain_id
        } = user;
        const {
            search_text,
            department_id
        } = body;
        const returnData = {};

        let queryStr =
            `select
                pd.productdevice_id, pd.fixedassetsdetail_id, pd.device_level
                , fac.fixedassets_no, fac.fixedassets_name, fac.fixedassets_model, fac.fixedassets_unit, fac.fixedassets_category
                , dpt.department_id, dpt.department_name
                from tbl_erc_productdevice pd
                left join tbl_erc_fixedassetscheckdetail fac
                on pd.fixedassetsdetail_id = fac.fixedassetscheckdetail_id
                left join tbl_erc_department dpt
                on fac.department_id = dpt.department_id
                where true
                and pd.state = ?
                and pd.domain_id = ?`;

        const replacements = [GLBConfig.ENABLE, domain_id];

        if (search_text) {
            queryStr += ` and (fac.fixedassets_no like ? or fac.fixedassets_name like ?)`;
            replacements.push(search_text);
            replacements.push(search_text);
        }

        if (department_id) {
            queryStr += ` and dpt.department_id = ?`;
            replacements.push(department_id);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getProcedureDevice(req, res) {
    const {
        body,
        user
    } = req;

    try {
        const {
            domain_id
        } = user;
        const {
            search_text,
            procedure_id,
            device_level,
            department_id
        } = body;
        const returnData = {};

        let queryStr =
            `select
                ppd.ppdevice_id, ppd.productprocedure_id, ppd.productdevice_id, ppd.hour_capacity, ppd.day_capacity
                , pd.fixedassetsdetail_id, pd.device_level
                , fac.fixedassets_no, fac.fixedassets_name, fac.fixedassets_model, fac.fixedassets_unit
                , pp.procedure_code, pp.procedure_name, procedure_type
                , dpt.department_id, dpt.department_name
                from tbl_erc_productproceduredevice ppd
                left join tbl_erc_productdevice pd
                on ppd.productdevice_id = pd.productdevice_id
                left join tbl_erc_fixedassetscheckdetail fac
                on pd.fixedassetsdetail_id = fac.fixedassetscheckdetail_id
                left join tbl_erc_productionprocedure pp
                on ppd.productprocedure_id = pp.procedure_id
                left join tbl_erc_department dpt
                on fac.department_id = dpt.department_id
                where true
                and ppd.state = ?
                and pd.state = ?
                and ppd.domain_id = ?`;

        const replacements = [GLBConfig.ENABLE, GLBConfig.ENABLE, domain_id];

        if (search_text) {
            queryStr += ` and (pp.fixedassets_no like ? or pp.fixedassets_name like ?)`;
            replacements.push(search_text);
            replacements.push(search_text);
        }

        if (procedure_id) {
            queryStr += ` and ppd.productprocedure_id = ?`;
            replacements.push(procedure_id);
        }

        if (device_level) {
            queryStr += ` and pd.device_level = ?`;
            replacements.push(device_level);
        }

        if (department_id) {
            queryStr += ` and dpt.department_id = ?`;
            replacements.push(department_id);
        }

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getFixedAssets(req, res) {
    const {
        body,
        user
    } = req;

    try {
        const {
            domain_id
        } = user;
        const {
            search_text,
            department_id,
            department_type,
            fixedassets_device,
            fixedassets_category
        } = body;
        const returnData = {};

        let queryStr =
            `select
                 fad.fixedassetscheckdetail_id, fad.fixedassets_no, fad.fixedassets_name, fad.fixedassets_model, fad.fixedassets_unit
                 , fac.fixedassetscheck_no, dpt.department_id, dpt.department_name
                 from tbl_erc_fixedassetscheckdetail fad
                 left join tbl_erc_department dpt
                    on (fad.department_id = dpt.department_id and dpt.state = ?)
                 left join tbl_erc_fixedassetscheck fac
                    on (fad.fixedassetscheck_id = fac.fixedassetscheck_id and fac.state = ?)
                 where true
                 and fac.check_state = 3
                 and fac.domain_id = ?`;

        const replacements = [GLBConfig.ENABLE, GLBConfig.ENABLE, domain_id];

        if (fixedassets_category) {
            queryStr += ' and fad.fixedassets_category in (' + fixedassets_category + ')'
        }

        if (search_text) {
            queryStr += ` and (fad.fixedassets_no like ? or fad.fixedassets_name like ?)`;
            replacements.push(search_text);
            replacements.push(search_text);
        }

        if (department_id) {
            queryStr += ` and dpt.department_id = ?`;
            replacements.push(department_id);
        }

        if (department_type || department_type === 0) {
            queryStr += ` and dpt.department_type = ?`;
            replacements.push(department_type);
        }
        if (fixedassets_device == 0 || fixedassets_device == 1) {
            queryStr += ` and fad.fixedassets_device = ?`;
            replacements.push(fixedassets_device);
        }
        queryStr += ` order by fad.fixedassetscheckdetail_id`;

        const result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getWarehouseList(req, res) {
    const {
        body,
        user
    } = req;

    try {
        const {
            warehouse_name,
            warehouse_type,
            normal_warehouse
        } = body;
        const {
            domain_id
        } = user;

        let queryStr =
            `select
                warehouse_id, warehouse_name as name
                from tbl_erc_warehouse
                where true
                and state = ?
                and domain_id = ?`;

        const replacements = [GLBConfig.ENABLE, domain_id];

        if (warehouse_name) {
            queryStr += ` and warehouse_name = ?`;
            replacements.push(warehouse_name);
        }

        if (warehouse_type) {
            queryStr += ` and warehouse_type = ?`;
            replacements.push(warehouse_type);
        }

        if (normal_warehouse) {
            const type_list = GLBConfig.WAREHOUSE_CLASS.filter(item => item.type === 2).map(item => item.id);
            queryStr += ` and warehouse_type not in (?)`;
            replacements.push(type_list);
        }

        const warehouseArray = await common.simpleSelect(sequelize, queryStr, replacements);

        for (const warehouseItem of warehouseArray) {
            warehouseItem.isParent = true;
            warehouseItem.node_type = 0;
            const {
                warehouse_id
            } = warehouseItem;
            const warehouseZone = await getWarehouseZone(warehouse_id);

            if (warehouseZone.length > 0) {
                warehouseItem.children = warehouseZone.map(item => ({
                    ...item,
                    node_type: 1
                }));
            }
        }

        common.sendData(res, warehouseArray);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getWarehouseZone(warehouse_id) {
    const queryStr =
        `select
            whz.warehouse_zone_id, whz.zone_name as name
            , wh.warehouse_id, wh.warehouse_name
            from tbl_erc_warehousezone whz
            left join tbl_erc_warehouse wh
            on whz.warehouse_id = wh.warehouse_id
            where true
            and whz.state = ?
            and whz.warehouse_id = ?`;

    const replacements = [GLBConfig.ENABLE, warehouse_id];
    return await common.simpleSelect(sequelize, queryStr, replacements);
}

async function getDomainInfo(req, res) {
    const {
        user
    } = req;

    try {
        const {
            domain_id
        } = user;

        const result = await tb_domain.findOne({
            where: {
                domain_id
            }
        });

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getCorporateClientsList(req, res) {
    const {
        body,
        user
    } = req;

    try {
        const {
            domain_id
        } = user;
        const {
            search_text
        } = body;
        const returnData = {};

        let queryStr =
            `select * from tbl_erc_corporateclients
             where true
             and state = ?
             and domain_id = ?`;

        const replacements = [GLBConfig.ENABLE, domain_id];

        if (search_text) {
            queryStr += ` and (corporateclients_name like ?)`;
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

async function getSupplierList(req, res) {
    const {
        body,
        user
    } = req;

    try {
        const {
            domain_id
        } = user;
        const {
            search_text
        } = body;
        const returnData = {};

        let queryStr =
            `select * from tbl_erc_supplier
             where true
             and state = ?
             and domain_id = ?`;

        const replacements = [GLBConfig.ENABLE, domain_id];

        if (search_text) {
            queryStr += ` and (supplier_name like ?)`;
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

async function getOtherMainList(req, res) {
    const {
        body,
        user
    } = req;

    try {
        const {
            domain_id
        } = user;
        const {
            search_text
        } = body;
        const returnData = {};

        let queryStr =
            `select * from tbl_erc_othermain
             where true
             and state = ?
             and domain_id = ?`;

        const replacements = [GLBConfig.ENABLE, domain_id];

        if (search_text) {
            queryStr += ` and (other_main_name like ?)`;
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