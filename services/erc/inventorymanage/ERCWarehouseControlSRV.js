
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCWarehouseControlSRV');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');

const sequelize = model.sequelize;
const tb_warehouse = model.erc_warehouse;
const tb_user = model.common_user;
const tb_warehousezone = model.erc_warehousezone;

exports.ERCWarehouseControlResource = (req, res) => {
    let method = req.query.method;
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res);
    } else if (method === 'search_warehouse') {
        searchWarehouseAct(req, res);
    } else if (method === 'add') {
        addAct(req, res);
    } else if (method === 'modify') {
        modifyAct(req, res);
    } else if (method === 'delete') {
        deleteAct(req, res);
    } else if (method === 'search_zone') {
        searchZoneAct(req, res);
    } else if (method === 'add_zone') {
        addZoneAct(req, res);
    } else if (method === 'modify_zone') {
        modifyZoneAct(req, res);
    } else if (method === 'delete_zone') {
        deleteZoneAct(req, res);
    }  else {
        common.sendError(res, 'common_01')
    }
};

async function getBaseType(code,domain_id){
    try {
        let returnData = [],replacements = []
        let queryStr = `select d.*, t.basetype_code from tbl_erc_basetypedetail d,tbl_erc_basetype t
             where d.basetype_id=t.basetype_id and t.basetype_code=?`;
        replacements.push(code)
        if(domain_id){
            queryStr+=` and d.domain_id=?`
            replacements.push(domain_id)
        }
        let result = await sequelize.query(queryStr, {replacements: replacements, type: sequelize.QueryTypes.SELECT});
        for(let r of result){
            returnData.push({
                id:r.basetypedetail_id,
                value:r.basetypedetail_id,
                text:r.typedetail_name,
            })
        }
        return returnData
    } catch (error) {
        throw error
    }
}
//初始化数据
let initAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {
            // warehouseTypeInfo: await getBaseType('CKFL',req.user.domain_id),
            warehouseTypeInfo: GLBConfig.WAREHOUSE_CLASS,
            warehouseStateInfo: GLBConfig.WAREHOUSESTATE
        };
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//仓库列表
let searchAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), user = req.user, returnData = {};
        let queryStr =
            `select
                wh.*, usr.name as username
                from tbl_erc_warehouse wh
                left join tbl_common_user usr
                on usr.user_id = wh.warehouse_contact
                where wh.domain_id = ? and wh.state = ?`;
        let replacements = [user.domain_id, GLBConfig.ENABLE];
        if (doc.search_warehouse) {
            queryStr += ` and (wh.warehouse_name like ? or wh.warehouse_code like ?) `;
            let search_warehouse = `%${doc.search_warehouse}%`;
            replacements.push(search_warehouse);
            replacements.push(search_warehouse);
        }

        let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//搜索仓库
let searchWarehouseAct = async(req, res)=> {
    try {
        const { body, user } = req;
        const { warehouse_id } = body;
        const { domain_id } = user;

        const warehouse = await tb_warehouse.findOne({
            where: {
                domain_id,
                warehouse_id,
                state: GLBConfig.ENABLE
            }
        });

        if (warehouse) {
            const { warehouse_contact } = warehouse;
            const user = await tb_user.findOne({
                where: {
                    domain_id,
                    user_id: warehouse_contact
                }
            });

            if (user) {
                const { name } = user;
                warehouse.dataValues.username = name;
            }
        }

        common.sendData(res, warehouse);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//创建仓库
let addAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let wh = await tb_warehouse.findOne({
            where: {
                warehouse_code: doc.warehouse_code,
                state: GLBConfig.ENABLE
            }
        });
        if (wh) {
            common.sendError(res, 'warehouse_02');
        } else {
            let addWh = await tb_warehouse.create({
                domain_id: user.domain_id,
                warehouse_code: doc.warehouse_code,
                warehouse_name: doc.warehouse_name,
                warehouse_type: doc.warehouse_type,
                warehouse_address: doc.warehouse_address,
                warehouse_contact: doc.warehouse_contact,
                warehouse_phone: doc.warehouse_phone,
                warehouse_state: doc.warehouse_state, //WAREHOUSESTATE
                warehouse_fax: doc.warehouse_fax
            });
            let retData = JSON.parse(JSON.stringify(addWh));
            common.sendData(res, retData);
        }
    } catch (error) {
        common.sendFault(res, error);
    }
};
//仓区列表
let searchZoneAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body), returnData = {};
        let result = await tb_warehousezone.findAll({
            where: {
                warehouse_id: doc.warehouse_id,
                state: GLBConfig.ENABLE
            }
        });
        returnData.rows = result;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//修改仓库
let modifyAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let modWh = await tb_warehouse.findOne({
            where: {
                warehouse_id: doc.old.warehouse_id
            }
        });
        if (modWh) {
            modWh.warehouse_code = doc.new.warehouse_code;
            modWh.warehouse_name = doc.new.warehouse_name;
            modWh.warehouse_type = doc.new.warehouse_type;
            modWh.warehouse_address = doc.new.warehouse_address;
            modWh.warehouse_contact = doc.new.warehouse_contact;
            modWh.warehouse_phone = doc.new.warehouse_phone;
            modWh.warehouse_state = doc.new.warehouse_state;
            modWh.warehouse_fax = doc.new.warehouse_fax;
            await modWh.save();
        } else {
            common.sendError(res, 'warehouse_01');
            return
        }
        return common.sendData(res, modWh);
    } catch (error) {
        common.sendFault(res, error);
        return null
    }
};
//删除仓库
let deleteAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let delWh = await tb_warehouse.findOne({
            where: {
                warehouse_id: doc.warehouse_id,
                state: GLBConfig.ENABLE
            }
        });

        if (delWh) {
            delWh.state = GLBConfig.DISABLE;
            await delWh.save();

            return common.sendData(res);
        } else {
            return common.sendError(res, 'warehouse_01');

        }
    } catch (error) {
        return common.sendFault(res, error);
    }
};
//常见仓区
let addZoneAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let find = await tb_warehousezone.findOne({
            where: {
                warehouse_id: doc.warehouse_id,
                zone_name: doc.zone_name,
                state: GLBConfig.ENABLE
            }
        });

        if (!find) {
            let add = await tb_warehousezone.create({
                warehouse_id: doc.warehouse_id,
                zone_name: doc.zone_name,
                zone_remark: doc.zone_remark
            });
            common.sendData(res, add);
        } else {
            common.sendError(res, 'wareHouseZone_01');
        }
    } catch (error) {
        common.sendFault(res, error);
    }
};
//需要仓区
let modifyZoneAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let modify = await tb_warehousezone.findOne({
            where: {
                warehouse_zone_id: doc.old.warehouse_zone_id
            }
        });
        if (modify) {
            modify.zone_name = doc.new.zone_name;
            modify.zone_remark = doc.new.zone_remark;
            await modify.save();
        } else {
            common.sendError(res, 'warehouse_01');
            return
        }
        return common.sendData(res, modify);
    } catch (error) {
        common.sendFault(res, error);
        return null
    }
};
//删除仓区
let deleteZoneAct = async(req, res)=> {
    try {
        let doc = common.docTrim(req.body);
        let del = await tb_warehousezone.findOne({
            where: {
                warehouse_zone_id: doc.warehouse_zone_id,
                state: GLBConfig.ENABLE
            }
        });

        if (del) {
            del.state = GLBConfig.DISABLE;
            await del.save();
            common.sendData(res);
        }
    } catch (error) {
        common.sendFault(res, error);
    }
};


