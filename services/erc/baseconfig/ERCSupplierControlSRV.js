const fs = require('fs');
const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const Sequence = require('../../../util/Sequence');
const logger = require('../../../util/Logger').createLogger('ERCSupplierControlSRV');
const model = require('../../../model');
const ERCAccountingControlSRV = require('../cashiermanage/ERCAccountingControlSRV')

// tables
const sequelize = model.sequelize
const tb_supplier = model.erc_supplier;
const tb_domainmenu = model.common_domainmenu;
const tb_usergroup = model.common_usergroup;
const tb_usergroupmenu = model.common_usergroupmenu;
const tb_user = model.common_user;
const tb_thirdsignuser = model.erc_thirdsignuser;
const ERCBusinessCustomerControlSRV = require('../baseconfig/ERCBusinessCustomerControlSRV');

exports.ERCSupplierControlResource = (req, res) => {
    let method = req.query.method
    if (method === 'init') {
        initAct(req, res);
    } else if (method === 'search') {
        searchAct(req, res)
    } else if (method === 'add') {
        addAct(req, res)
    } else if (method === 'getUserForSupplier') {
        getUserForSupplier(req, res)
    } else if (method === 'getSignUser') {
        getSignUser(req, res)
    } else if (method === 'signUserForSupplier') {
        signUserForSupplier(req, res)
    } else if (method === 'removeSignUser') {
        removeSignUser(req, res)
    } else if (method === 'addWithUser') {
        addWithUser(req, res)
    } else if (method === 'modify') {
        modifyAct(req, res)
    } else if (method === 'getBusinessOffer') {
        getBusinessOffer(req, res)
    } else {
        common.sendError(res, 'common_01');
    }
};

//获取供应商信息
async function getBusinessOffer(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user;
        let materiel_sale_offer

        let defSupplier =
            `select * from tbl_common_domain a
             left join tbl_erc_supplier b on a.domain_id = b.domain_id
             where a.domain_type = ?`;
        let defParams = [GLBConfig.DOMAINTYPE[2].id];
        let defVal = await common.queryWithCount(sequelize, req, defSupplier, defParams)

        if (doc.search_text) {
            let searchParams = {
                search_text: doc.search_text
            };

            materiel_sale_offer = await ERCBusinessCustomerControlSRV.searchPrice(req, defVal.data[0].domain_id, user.domain_id, searchParams);
        } else {
            materiel_sale_offer = await ERCBusinessCustomerControlSRV.searchPrice(req, defVal.data[0].domain_id, user.domain_id, {});
        }

        common.sendData(res, materiel_sale_offer);
    } catch (error) {
        common.sendError(res, error)
    }

}

async function getBaseType(code,domain_id) {
    try {
        let returnData = [],
            replacements = []
        let queryStr = `select d.*, t.basetype_code from tbl_erc_basetypedetail d,tbl_erc_basetype t
             where d.basetype_id=t.basetype_id and t.basetype_code=?`;
        replacements.push(code)
        if(domain_id){
            queryStr += ` and d.domain_id = ?`
            replacements.push(domain_id)
        }
        let result = await sequelize.query(queryStr, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });
        for (let r of result) {
            returnData.push({
                id: r.basetypedetail_id,
                value: r.basetypedetail_id,
                text: r.typedetail_name,
            })
        }
        return returnData
    } catch (error) {
        throw error
    }
}
async function initAct(req, res) {
    try {
        let returnData = {
            domainTypeInfo: GLBConfig.DOMAINTYPE,
            stateInfo: GLBConfig.CSTATEINFO,
            userGroup: await tb_usergroup.findAll({
                where: {
                    domain_id: req.user.domain_id
                },
                attributes: [
                    ['usergroup_id', 'id'],
                    ['usergroup_name', 'text']
                ]
            })
        };
        returnData.materielType = GLBConfig.MATERIELTYPE; //物料分类
        returnData.unitInfo = await global.getBaseTypeInfo(req.user.domain_id, 'JLDW'); //单位
        returnData.JSFS = await getBaseType('JSFS');
        returnData.GYSLB = await getBaseType('GYSLB',req.user.domain_id);
        returnData.GRSYSL = await getBaseType('GRSYSL',req.user.domain_id);
        common.sendData(res, returnData);
    } catch (error) {
        common.sendError(res, error)
    }
}
//查询供应商列表
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {}

        let defData = [];
        let defCount = 0;
        // if (user.domain_type !== GLBConfig.DOMAINTYPE[2].id) {
        //     let defSupplier =
        //         `select * from tbl_common_domain a
        //      left join tbl_erc_supplier b on a.domain_id = b.domain_id
        //      where a.domain_type = ?`;
        //     let defParams = [GLBConfig.DOMAINTYPE[2].id];
        //     let defVal = await common.queryWithCount(sequelize, req, defSupplier, defParams)
        //     defData = defVal.data;
        //     defCount = defVal.count;
        // }
        //
        // let queryStr =
        //     `select * from tbl_common_domain a
        //      left join tbl_erc_supplier b on a.domain_id = b.domain_id
        //      where b.domain_id = ? and a.domain_type != ?`;
        // let replacements = [user.domain_id, GLBConfig.DOMAINTYPE[2].id]
        //
        // if (doc.suppliersearch_text) {
        //     queryStr += ' and (supplier like ? or supplier_name like ? or supplier_address like ?)'
        //     let suppliersearch_text = '%' + doc.suppliersearch_text + '%'
        //     replacements.push(suppliersearch_text)
        //     replacements.push(suppliersearch_text)
        //     replacements.push(suppliersearch_text)
        // }
        //
        // let result = await common.queryWithCount(sequelize, req, queryStr, replacements)
        let queryStr =
            `select * from tbl_common_domain a
             left join tbl_erc_supplier b on a.domain_id = b.domain_id
             where b.domain_id = ? `;
        let replacements = [user.domain_id]

        if (doc.suppliersearch_text) {
            queryStr += ' and (supplier like ? or supplier_name like ? or supplier_address like ?)'
            let suppliersearch_text = '%' + doc.suppliersearch_text + '%'
            replacements.push(suppliersearch_text)
            replacements.push(suppliersearch_text)
            replacements.push(suppliersearch_text)
        }
        queryStr+=` order by supplier_id desc`
        let result = await common.queryWithCount(sequelize, req, queryStr, replacements)
        returnData.total = result.count + defCount;
        // returnData.rows = result.data
        returnData.rows = [];
        for (let r of result.data) {
            let result = JSON.parse(JSON.stringify(r));
            result.supplier_proportion = r.supplier_proportion + '%';
            returnData.rows.push(result)
        }
        returnData.rows = [
            ...defData,
            ...returnData.rows
        ]
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//新增供应商信息
exports.addSupplier = async (data) => {
    try {
        let supplier = await tb_supplier.findOne({
            where: {
                supplier: data.domain
            }
        });

        if (supplier) {
            return {
                success: false,
                result: 'domain_01'
            }
        } else {
            supplier = await tb_supplier.create({
                supplier: data.domain,
                domain_id: data.domain_id,
                supplier_name: '总部机构',
                supplier_address: data.domain_address,
                supplier_contact: data.domain_contact,
                supplier_phone: data.domain_phone,
                supplier_description: data.domain_description,
                supplier_fax: data.domain_fax
            });
            return {
                success: true,
                result: supplier
            }
        }
    } catch (error) {
        return {
            success: false,
            result: error
        }
    }
};
//新增供应商信息
async function addAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let supplier = await tb_supplier.findOne({
            where: {
                supplier: doc.supplier
            }
        });

        if (supplier) {
            common.sendError(res, 'domain_01');
        } else {
            supplier = await tb_supplier.create({
                supplier: doc.supplier,
                domain_id: user.domain_id,
                supplier_name: doc.supplier_name,
                supplier_address: doc.supplier_address,
                supplier_contact: doc.supplier_contact,
                supplier_phone: doc.supplier_phone,
                supplier_description: doc.supplier_description,
                supplier_proportion: doc.supplier_proportion,
                supplier_fax: doc.supplier_fax,
                supplier_remarks: doc.supplier_remarks,
                supplier_class: doc.supplier_class,
                supplier_tax_rate: doc.supplier_tax_rate,
                supplier_way: doc.supplier_way,
                supplier_advance_ratio: doc.supplier_advance_ratio,
                supplier_number_days: doc.supplier_number_days,
                supplier_bank_no: doc.supplier_bank_no
            });
            //添加会计科目详情
            await ERCAccountingControlSRV.addAccountingDetail(2202, supplier.supplier_id, user.domain_id, '2');
            await ERCAccountingControlSRV.addAccountingDetail(1231, supplier.supplier_id, user.domain_id, '2');
            await ERCAccountingControlSRV.addAccountingDetail(2241, supplier.supplier_id, user.domain_id, '2');
            common.sendData(res, supplier);
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}

async function getUserForSupplier(req, res) {
    try {
        let user = req.user;
        let returnData = {};

        let queryStr = `select
             a.user_id, a.usergroup_id, a.username, a.name, a.phone, a.email
             from tbl_common_user a
             left join tbl_erc_thirdsignuser b
             on a.user_id = b.user_id
             where true
             and a.state = ?
             and a.user_type = ?
             and b.user_id is null`;
        let replacements = [];
        replacements.push(GLBConfig.ENABLE);
        replacements.push(GLBConfig.TYPE_OPERATOR);

        if (user.domain_id) {
            queryStr += ` and a.domain_id = ?`;
            replacements.push(user.domain_id);
        }

        let result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//获取供应商管理员
async function getSignUser(req, res) {
    try {
        let body = req.body;
        let user = req.user;
        let returnData = {};

        let queryStr = `select
             a.thirdsignuser_id, a.user_id, b.usergroup_id, b.username, b.name, b.phone, b.email
             from tbl_erc_thirdsignuser a
             left join tbl_common_user b
             on a.user_id = b.user_id
             where true
             and a.third_sign_type = 1`;
        let replacements = [];

        if (user.domain_id) {
            queryStr += ` and a.domain_id = ?`;
            replacements.push(user.domain_id);
        }
        if (body.supplier_id) {
            queryStr += ` and a.supplier_id = ?`;
            replacements.push(body.supplier_id);
        }
        if (body.search_text) {
            queryStr += ' and (b.username like ? or b.name like ? or b.phone like ? or b.email like ?)';
            let search_text = '%' + body.search_text + '%';
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
            replacements.push(search_text);
        }

        let result = await common.queryWithGroupByCount(sequelize, req, queryStr, replacements);
        returnData.total = result.count;
        returnData.rows = result.data;
        common.sendData(res, returnData);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//授权供应商管理员
async function signUserForSupplier(req, res) {
    try {
        logger.debug('signUserForSupplier:', req.body);
        let body = req.body;
        let user = req.user;

        let userGroup = await tb_usergroup.findOne({
            where: {
                domain_id: user.domain_id,
                node_type: '10'
            }
        });

        let menuResult = await tb_domainmenu.findAll({
            where: {
                domain_id: user.domain_id,
                api_function: {
                    $in: [
                        'ERCPURCHASELISTCONTROL',
                        'ERCPURCHASEDETAILCONTROL',
                        'USERSETTING',
                        'RESETPASSWORD'
                    ]
                }
            }
        });
        if (menuResult.length < 2) {
            return common.sendError(res, '请先添加当前机构所需的权限');
        }

        if (!userGroup) {
            userGroup = await tb_usergroup.create({
                domain_id: user.domain_id,
                usergroup_name: '供应商管理员',
                usergroup_type: GLBConfig.TYPE_OPERATOR,
                node_type: '10',
                parent_id: 0
            });

            let menuArray = [];
            for (let i = 0; i < menuResult.length; i++) {
                let domainmenu_id = menuResult[i].domainmenu_id;
                menuArray.push({
                    usergroup_id: userGroup.usergroup_id,
                    domainmenu_id: domainmenu_id
                });
            }

            let groupMenu = await tb_usergroupmenu.bulkCreate(menuArray);
            if (!groupMenu) {
                return common.sendError(res, 'domain_01', '无法分配权限');
            }
        }

        let signUserArray = await tb_user.findAll({
            where: {
                domain_id: user.domain_id,
                user_id: {
                    $in: body.userArray
                }
            }
        });

        for (let i = 0; i < signUserArray.length; i++) {
            await tb_user.update({
                usergroup_id: userGroup.usergroup_id
            }, {
                where: {
                    user_id: signUserArray[i].user_id
                }
            });
        }

        let supplierUserArray = [];
        for (let i = 0; i < body.userArray.length; i++) {
            let item = body.userArray[i];
            supplierUserArray.push({
                domain_id: user.domain_id,
                supplier_id: body.supplierId,
                user_id: item,
                third_sign_type: 1
            });
        }

        let result = await tb_thirdsignuser.bulkCreate(supplierUserArray);

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}
//删除供应商管理员
async function removeSignUser(req, res) {
    try {
        let body = req.body;
        let user = req.user;

        let result = await tb_thirdsignuser.destroy({
            where: {
                thirdsignuser_id: body.thirdsignuser_id,
                domain_id: user.domain_id
            }
        });

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
}

//创建用户
async function addWithUser(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;

        let supplier = await tb_supplier.findOne({
            where: {
                supplier: doc.supplier
            }
        });

        if (supplier) {
            common.sendError(res, 'domain_01');
            return;
        } else {
            supplier = await tb_supplier.create({
                supplier: doc.supplier,
                domain_id: user.domain_id,
                supplier_name: doc.supplier_name,
                supplier_address: doc.supplier_address,
                supplier_contact: doc.supplier_contact,
                supplier_phone: doc.supplier_phone,
                supplier_description: doc.supplier_description,
                supplier_proportion: doc.supplier_proportion,
                supplier_fax: doc.supplier_fax,
                supplier_remarks: doc.supplier_remarks
            });
        }

        //判断是否有供应商
        if (supplier) {
            let userGroup = await tb_usergroup.findOne({
                where: {
                    domain_id: user.domain_id,
                    node_type: '10'
                }
            });

            let parentResult = await tb_domainmenu.findOne({
                where: {
                    domain_id: user.domain_id,
                    domainmenu_name: '采购管理',
                    parent_id: 0
                }
            });

            let childResult = await tb_domainmenu.findAll({
                where: {
                    domain_id: user.domain_id,
                    parent_id: parentResult.domainmenu_id,
                    api_function: {
                        $in: ['ERCPURCHASELISTCONTROL', 'ERCPURCHASEDETAILCONTROL']
                    }
                }
            });
            childResult.unshift(parentResult);

            if (!userGroup) {
                userGroup = await tb_usergroup.create({
                    domain_id: user.domain_id,
                    usergroup_name: '供应商管理员',
                    usergroup_type: GLBConfig.TYPE_OPERATOR,
                    node_type: '10',
                    parent_id: 0
                });

                let menuArray = [];
                for (let i = 0; i < childResult.length; i++) {
                    let domainmenu_id = childResult[i].domainmenu_id;
                    menuArray.push({
                        usergroup_id: userGroup.usergroup_id,
                        domainmenu_id: domainmenu_id
                    });
                }

                let groupMenu = await tb_usergroupmenu.bulkCreate(menuArray);
                if (!groupMenu) {
                    return common.sendError(res, 'domain_01', '无法分配权限');
                }
            }

            let adduser = await tb_user.findOne({
                where: {
                    username: doc.supplier,
                    usergroup_id: userGroup.usergroup_id,
                    state: GLBConfig.ENABLE
                }
            });
            if (adduser) {
                return common.sendError(res, 'operator_02', '用户已存在');
            }

            adduser = await tb_user.create({
                user_id: await Sequence.genUserID(),
                domain_id: user.domain_id,
                usergroup_id: userGroup.usergroup_id,
                username: doc.supplier,
                phone: doc.supplier_phone,
                password: GLBConfig.INITPASSWORD,
                name: doc.supplier_name,
                address: doc.supplier_address,
                user_type: GLBConfig.TYPE_OPERATOR
            });

            if (!adduser) {
                return common.sendError(res, 'operator_02', '用户创建失败');
            }

            common.sendData(res, supplier)
        }
    } catch (error) {
        common.sendFault(res, error);
    }
}
//修改供应商信息
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body)
        let user = req.user
        let supplier = await tb_supplier.findOne({
            where: {
                supplier_id: doc.old.supplier_id
            }
        })
        if (supplier) {
            supplier.supplier_name = doc.new.supplier_name
            supplier.supplier_address = doc.new.supplier_address
            supplier.supplier_contact = doc.new.supplier_contact
            supplier.supplier_phone = doc.new.supplier_phone
            supplier.supplier_description = doc.new.supplier_description
            supplier.supplier_proportion = doc.new.supplier_proportion.replace(/%/g, "")
            supplier.supplier_fax = doc.new.supplier_fax
            supplier.supplier_remarks = doc.new.supplier_remarks
            supplier.supplier_class = doc.new.supplier_class
            supplier.supplier_tax_rate = doc.new.supplier_tax_rate
            supplier.supplier_way = doc.new.supplier_way
            supplier.supplier_advance_ratio = doc.new.supplier_advance_ratio
            supplier.supplier_number_days = doc.new.supplier_number_days
            supplier.supplier_bank_no = doc.new.supplier_bank_no
            supplier.supplier.state = doc.new.state
            await supplier.save();
            supplier.supplier_proportion = supplier.supplier_proportion + '%'
            common.sendData(res, supplier)
        } else {
            common.sendError(res, 'group_02')
            return
        }
    } catch (error) {
        common.sendFault(res, error)
    }
}
