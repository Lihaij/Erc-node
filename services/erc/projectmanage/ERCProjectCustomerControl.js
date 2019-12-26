const common = require('../../../util/CommonUtil');
const GLBConfig = require('../../../util/GLBConfig');
const logger = require('../../../util/Logger').createLogger('ERCProjectCustomerControl');
const model = require('../../../model');
const Sequence = require('../../../util/Sequence');
const FDomain = require('../../../bl/common/FunctionDomainBL');
const sequelize = model.sequelize;
const moment = require('moment');
const task = require('../baseconfig/ERCTaskListControlSRV');

const tb_project_customer = model.erc_project_customer;//项目用户model
const tb_project_info = model.erc_project_info;//项目信息model

// 项目客户增删改查接口
exports.ERCProjectCustomerControlResource = (req, res) => {
    let method = req.query.method;
    if(method==='init'){
        initAct(req,res)
    }else if (method==='search'){
        searchAct(req,res)
    }else if (method==='add'){
        addAct(req,res)
    }else if (method==='delete'){
        deleteAct(req,res)
    }else if (method==='modify'){
        modifyAct(req,res)
    }else if (method==='get'){
        getAct(req,res)
    }else if (method==='getProjectCount'){
        getProjectCount(req,res)
    }else if (method==='getProjectCustomerList'){
        getProjectCustomerList(req,res)
    }else {
        common.sendError(res, 'common_01')
    }
};
//初始化参数
async function initAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let returnData = {};
        returnData.ENABLE=GLBConfig.ENABLE;
        return common.sendData(res, returnData);
    } catch (error) {
        return common.sendFault(res, error);
    }
};
// 增加项目用户
async function addAct(req,res){
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            replacements = [];

        let addPeojectCustomer = await tb_project_customer.create({
            domain_id:user.domain_id,
            business_registration_number: doc.business_registration_number,
            full_name:doc.full_name,
            address: doc.address,
            phone_number: doc.phone_number,
            tax_rate: doc.tax_rate,
            legal_representative: doc.legal_representative,
            legal_representative_phone:doc.legal_representative_phone,
            legal_representative_wecat:doc.legal_representative_wecat,
            designated_contact_name:doc.designated_contact_name,
            designated_contact_phone:doc.designated_contact_phone,
            designated_contact_wecat:doc.designated_contact_wecat, 
            designated_contact_qq:doc.designated_contact_qq,       
        });
        common.sendData(res, addPeojectCustomer);

    } catch (error) {
        common.sendFault(res, error);
        return;
    }
};
//修改项目客户信息
async function modifyAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let user = req.user;
        let project_customer = await tb_project_customer.findOne({
            where: {
                project_customer_id: doc.project_customer_id
            }
        });
        if (project_customer) {
            project_customer.business_registration_number= doc.business_registration_number,
            project_customer.full_name=doc.full_name,
            project_customer.address= doc.address,
            project_customer.phone_number= doc.phone_number,
            project_customer.tax_rate= doc.tax_rate,
            project_customer.legal_representative= doc.legal_representative,
            project_customer.legal_representative_phone=doc.legal_representative_phone,
            project_customer.legal_representative_wecat=doc.legal_representative_wecat,
            project_customer.designated_contact_name=doc.designated_contact_name,
            project_customer.designated_contact_phone=doc.designated_contact_phone,
            project_customer.designated_contact_wecat=doc.designated_contact_wecat, 
            project_customer.designated_contact_qq=doc.designated_contact_qq,   
            await project_customer.save();

            // if (usergroup.node_type === '01') {
            //     await tb_common_usergroupmenu.destroy({
            //         where: {
            //             usergroup_id: doc.usergroup_id
            //         }
            //     })

            //     for (let m of doc.menus) {
            //         await tb_common_usergroupmenu.create({
            //             usergroup_id: usergroup.usergroup_id,
            //             domainmenu_id: m.domainmenu_id
            //         })
            //     }
            // }
            common.sendData(res, project_customer)
        } else {
            common.sendError(res, 'project_customer_02');
        }
    } catch (error) {
        common.sendFault(res, error)
    }
};
//删除项目客户信息
async function deleteAct(req, res) {
    try {
        const { body } = req;
        const { project_customer_id } = body;

        const result = await tb_project_customer.findOne({
            where: {
                project_customer_id
            }
        });
        //TODO没有项目的客户才允许删除
        // let projectCount = await tb_project.count({
        //     where: {
        //         project_customer_id: project_customer_id
        //     }
        // });

        if (result) {
            result.state = GLBConfig.DISABLE;
            await result.save();
        }

        common.sendData(res, result);
    } catch (error) {
        common.sendFault(res, error);
    }
};
//查询获取项目客户信息
async function searchAct(req, res) {
    try {
        let doc = common.docTrim(req.body);
        let returnData = {};

        let result = await getData(req, res, false, doc);

        returnData.total = result.count;
        returnData.rows = result.data;

        return common.sendData(res, returnData);

    } catch (error) {
        return common.sendFault(res, error);
    }
};
//获取项目客户信息
async function getData(req, res, is_single, doc){
    let user = req.user;
    let replacements = [];

    let queryStr = 'select t.* from tbl_erc_project_customer t where t.state = 1 and t.domain_id = ?';

    replacements.push(user.domain_id);

    if (doc.full_name) {
        queryStr += ' and full_name like ?';
        replacements.push('%' + doc.full_name + '%');
    }
    if (doc.address) {
        queryStr += ' and address like ?';
        replacements.push('%' + doc.address + '%');
    }
    if (doc.phone_number) {
        queryStr += ' and phone_number like ?';
        replacements.push('%' + doc.phone_number + '%');
    }
    // if (doc.search_type) {
    //     if (doc.search_type == 'use_add') {
    //         queryStr += ' and tbl_erc_sealcreate.sealcreate_state = 2 and tbl_erc_sealcreate.is_discard = 0 and tbl_erc_sealcreate.is_finish = 1'
    //     } else if (doc.search_type == 'discard_add') {
    //         queryStr += ' and tbl_erc_sealcreate.sealcreate_state = 2 and tbl_erc_sealcreate.is_discard = 0 and tbl_erc_sealcreate.is_finish = 1 and tbl_erc_sealcreate.is_borrow = 0'
    //     } else if (doc.search_type == 'finish') {
    //         queryStr += ' and tbl_erc_sealcreate.sealcreate_state = 2 and tbl_erc_sealcreate.is_discard = 0 and tbl_erc_sealcreate.is_finish = 1'
    //     } else if (doc.search_type == 'creating') {
    //         queryStr += ' and tbl_erc_sealcreate.sealcreate_state = 2 and tbl_erc_sealcreate.is_finish <> 1'
    //     } else if (doc.search_type == 'discard') {
    //         queryStr +=' and tbl_erc_sealcreate.is_discard = 1';
    //     }

    // } else {
    //     queryStr += ' and tbl_erc_sealcreate.user_id = ?';
    //     replacements.push(user.user_id);
    // }

    queryStr += ' order by t.created_at desc';

    let result = await common.queryWithCount(sequelize, req, queryStr, replacements);
    for (let r of result.data) {
        r.created_at = r.created_at ? r.created_at.Format('yyyy-MM-dd') : null;
        r. check_date = r.check_date ? r.check_date.Format('yyyy-MM-dd') : null;
    }

    if (is_single == true) {
        return result.data[0];
    } else {
        return result;
    }
};
//客戶有無對應項目
async function getProjectCount(req, res) {
    const { body, user } = req;

    try {
        const { project_customer_id } = body;
        const { domain_id } = user;

        const projectCount = await tb_project_info.count({
            where: {
                project_customer_id: project_customer_id,
                state: GLBConfig.ENABLE,
                domain_id:domain_id
            }
        });

        common.sendData(res, projectCount);
    } catch (e) {
        common.sendFault(res, e);
    }
};
//查询项目客户列表
async function getProjectCustomerList(req, res) {
    const { body, user } = req;
    try {
        let project_customers = await tb_project_customer.findAll({
            where: {
                domain_id: user.domain_id,
                state: GLBConfig.ENABLE
            }
        });
        return common.sendData(res, project_customers);
    } catch (e) {
        common.sendFault(res, e);
    }
};
async function getAct(req, res) {
    try {
        let doc = common.docTrim(req.body),
            user = req.user,
            returnData = {};

        let queryStr = 'select t.* from tbl_erc_project_customer t';

    } catch (error) {
        common.sendError(res, 'project_customer02');
    }
};
