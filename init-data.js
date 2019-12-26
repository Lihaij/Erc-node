const common = require('./util/CommonUtil');
const Sequence = require('./util/Sequence');
const GLBConfig = require('./util/GLBConfig');
const logger = require('./util/Logger').createLogger('db');
const model = require('./model.js');

let tb_common_domain = model.common_domain;
let tb_common_user = model.common_user;
let tb_common_usergroup = model.common_usergroup;
let tb_common_api = model.common_api;
let tb_common_systemmenu = model.common_systemmenu;
let tb_process = model.erc_process;
let tb_taskallot = model.erc_taskallot;

(async() => {
    try {
        let menu = null
        let fmenuID1 = null
        let fmenuID2 = null
        let api = null
        let usergroup = null

        let domain = await tb_common_domain.create({
            domain: 'admin',
            domain_type: '0',
            domain_name: 'administratorGroup',
            domain_description: 'admin'
        });

        usergroup = await tb_common_usergroup.create({
            domain_id: domain.domain_id,
            usergroup_name: '业主',
            usergroup_type: GLBConfig.TYPE_CUSTOMER,
            node_type: '01',
            parent_id: 0,
            description: 'customer'
        });

        usergroup = await tb_common_usergroup.create({
            domain_id: domain.domain_id,
            usergroup_name: '工人',
            usergroup_type: GLBConfig.TYPE_WORKER,
            node_type: '01',
            parent_id: 0,
            description: 'administrator'
        });
        usergroup = await tb_common_usergroup.create({
            domain_id: domain.domain_id,
            usergroup_name: '工长',
            usergroup_type: GLBConfig.TYPE_FOREMAN,
            node_type: '01',
            parent_id: 0,
            description: 'administrator'
        });
        usergroup = await tb_common_usergroup.create({
            domain_id: domain.domain_id,
            usergroup_name: '监理',
            usergroup_type: GLBConfig.TYPE_SUPERVISION,
            node_type: '01',
            parent_id: 0,
            description: 'administrator'
        });

        usergroup = await tb_common_usergroup.create({
            domain_id: domain.domain_id,
            usergroup_name: 'administrator',
            usergroup_type: GLBConfig.TYPE_ADMINISTRATOR,
            node_type: '01',
            parent_id: 0,
            description: 'administrator'
        });

        let user = await tb_common_user.create({
            user_id: await Sequence.genUserID(),
            domain_id: domain.domain_id,
            usergroup_id: usergroup.usergroup_id,
            type: GLBConfig.TYPE_ADMINISTRATOR,
            username: 'admin',
            name: 'admin',
            password: 'admin',
            p_usergroup_id: 0,
            user_type: '00'
        });

        // common
        menu = await tb_common_systemmenu.create({ systemmenu_name: 'common', node_type: '00', parent_id: '0'});
        fmenuID1 = menu.systemmenu_id

        menu = await tb_common_systemmenu.create({ systemmenu_name: 'components', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'机构选择组件', api_path: '/common/components/DomainSelectDialogControl', api_function: 'DOMAINSELECTDIALOGCONTROL', auth_flag: '0', show_flag: '0', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'操作员选择组件', api_path: '/common/components/userSelectDialogControl', api_function: 'USERSELECTDIALOGCONTROL', auth_flag: '0', show_flag: '0', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});

        menu = await tb_common_systemmenu.create({ systemmenu_name: 'baseconfig', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'关注审核', api_path: '/common/baseconfig/FollowerControl', api_function: 'FOLLOWERCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});

        menu = await tb_common_systemmenu.create({ systemmenu_name: 'system', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'系统菜单维护', api_path: '/common/system/SystemApiControl', api_function: 'SYSTEMAPICONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'机构模板维护', api_path: '/common/system/DomainTemplateControl', api_function: 'DOMAINTEMPLATECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'机构维护', api_path: '/common/system/DomainControl', api_function: 'DOMAINCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'系统组权限维护', api_path: '/common/system/SysGroupApiControl', api_function: 'SYSGROUPAPICONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'用户设置', api_path: '/common/system/UserSetting', api_function: 'USERSETTING', auth_flag: '1', show_flag: '0', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'角色设置', api_path: '/common/system/DomainGroupControl', api_function: 'DOMAINGROUPCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'员工维护', api_path: '/common/system/OperatorControl', api_function: 'OPERATORCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'重置密码', api_path: '/common/system/ResetPassword', api_function: 'RESETPASSWORD', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});

        // erc
        menu = await tb_common_systemmenu.create({ systemmenu_name: 'erc', node_type: '00', parent_id: '0'});
        fmenuID1 = menu.systemmenu_id
        api = await tb_common_api.create({api_name: '物料采购表', api_path: '/erc/purchasemanage/ERCPurchaseListControl', api_function: 'ERCPURCHASELISTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        await tb_common_systemmenu.create({systemmenu_name: api.api_name,api_id: api.api_id,api_function: api.api_function,node_type: '01',parent_id: fmenuID1});
        api = await tb_common_api.create({api_name: '地产商楼盘管理',api_path: '/erc/baseconfig/ERCLandAgentEstateControl',api_function: 'ERCLANDAGENTESTATECONTROL',auth_flag: '1',show_flag: '1',api_kind: '1'});
        await tb_common_systemmenu.create({systemmenu_name: api.api_name,api_id: api.api_id,api_function: api.api_function,node_type: '01',parent_id: fmenuID1});
        api = await tb_common_api.create({api_name: '地产商订单管理',api_path: '/erc/ordermanage/ERCLandAgentOrderControl',api_function: 'ERCLANDAGENTORDERCONTROL',auth_flag: '1',show_flag: '1',api_kind: '1'});
        await tb_common_systemmenu.create({systemmenu_name: api.api_name,api_id: api.api_id,api_function: api.api_function,node_type: '01',parent_id: fmenuID1});




        menu = await tb_common_systemmenu.create({ systemmenu_name: '客户管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'客户管理', api_path: '/erc/customermanage/ERCCustomerControl', api_function: 'ERCCUSTOMERCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'预约管理', api_path: '/erc/customermanage/ERCAppointmentControl', api_function: 'ERCAPPOINTMENTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'询价管理', api_path: '/erc/customermanage/ERCInquiryControl', api_function: 'ERCINQUIRYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'总部客户查询', api_path: '/erc/customermanage/ERCCustomerAssignControl', api_function: 'ERCCUSTOMERASSIGNCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'投诉管理', api_path: '/erc/customermanage/ERCComplaintControl', api_function: 'ERCCOMPLAINTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'贷款管理', api_path: '/erc/customermanage/ERCLoanControl', api_function: 'ERCLOANCONTROL', auth_flag: '1', show_flag: '0', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});


        menu = await tb_common_systemmenu.create({ systemmenu_name: '订单管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'订单管理', api_path: '/erc/ordermanage/ERCOrderControl', api_function: 'ERCORDERCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'订单详情', api_path: '/erc/ordermanage/ERCOrderDetailControl', api_function: 'ERCORDERDETAILCONTROL', auth_flag: '1', show_flag: '0', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'团体订单详情', api_path: '/erc/ordermanage/ERCGOrderDetailControl', api_function: 'ERCGORDERDETAILCONTROL', auth_flag: '1', show_flag: '0', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'管理配置', api_path: '/erc/ordermanage/ERCOrderRequireControl', api_function: 'ERCORDERREQUIRECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'销售订单详情', api_path: '/erc/ordermanage/ERCSOrderDetailControl', api_function: 'ERCSORDERDETAILCONTROL', auth_flag: '1', show_flag: '0', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'总部订单查询', api_path: '/erc/ordermanage/ERCHDOrderControl', api_function: 'ERCHDORDERCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'总部订单详情', api_path: '/erc/ordermanage/ERCHDOrderDetailControl', api_function: 'ERCHDORDERDETAILCONTROL', auth_flag: '1', show_flag: '0', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});


        menu = await tb_common_systemmenu.create({ systemmenu_name: '运营数据管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'楼盘管理', api_path: '/erc/baseconfig/ERCEstateControl', api_function: 'ERCESTATECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'户型管理', api_path: '/erc/baseconfig/ERCRoomTypeControl', api_function: 'ERCROOMTYPECONTROL', auth_flag: '1', show_flag: '0', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'户型详情', api_path: '/erc/baseconfig/ERCRoomTypeDetailControl', api_function: 'ERCROOMTYPEDETAILCONTROL', auth_flag: '1', show_flag: '0', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'物料维护', api_path: '/erc/baseconfig/ERCMaterielControl', api_function: 'ERCMATERIELCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'供应商维护', api_path: '/erc/baseconfig/ERCSupplierControl', api_function: 'ERCSUPPLIERCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'供应商物料维护', api_path: '/erc/baseconfig/ERCSupplierMaterielControl', api_function: 'ERCSUPPLIERMATERIELCONTROL', auth_flag: '1', show_flag: '0', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'地产商维护', api_path: '/erc/baseconfig/ERCLandAgentControl', api_function: 'ERCLANDAGENTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'签约工长维护', api_path: '/erc/baseconfig/ERCForemanControl', api_function: 'ERCFOREMANCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'产品维护', api_path: '/erc/baseconfig/ERCProduceControl', api_function: 'ERCPRODUCECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'造艺物料同步', api_path: '/erc/baseconfig/ERCMaterielSyncControl', api_function: 'ERCMATERIELSYNCCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'任务列表', api_path: '/erc/baseconfig/ERCTaskListControl', api_function: 'ERCTASKLISTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'工作流配置', api_path: '/erc/baseconfig/ERCTaskAllotControl', api_function: 'ERCTASKALLOTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'案例维护', api_path: '/erc/baseconfig/ERCSiteConfigCaseControl', api_function: 'ERCSITECONFIGCASECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'装修日记维护', api_path: '/erc/baseconfig/ERCSiteConfigDiaryControl', api_function: 'ERCSITECONFIGDIARYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'工人维护', api_path: '/erc/baseconfig/ERCWorkerControl', api_function: 'ERCWORKERCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'项目工程管理', api_path: '/erc/baseconfig/ERCProjectControl', api_function: 'ERCPROJECTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'公告管理', api_path: '/erc/baseconfig/ERCNoticeControl', api_function: 'ERCNOTICECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'人力需求管理', api_path: '/erc/baseconfig/ERCHumanResourceControl', api_function: 'ERCHUMANRESOURCECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'内容管理', api_path: '/erc/baseconfig/ERCSmallProgramControl', api_function: 'ERCSmallProgramControl', auth_flag: '1', show_flag: '0', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'人工价格标准', api_path: '/erc/baseconfig/ERCWorkerPriceControl', api_function: 'ERCWORKERPRICECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'基础数据维护', api_path: '/erc/baseconfig/ERCBaseDataControl', api_function: 'ERCBASEDATACONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});


        menu = await tb_common_systemmenu.create({ systemmenu_name: '采购管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'采购管理', api_path: '/erc/purchasemanage/ERCPurchaseControl', api_function: 'ERCPURCHASECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'采购单详情', api_path: '/erc/purchasemanage/ERCPurchaseDetailControl', api_function: 'ERCPURCHASEDETAILCONTROL', auth_flag: '1', show_flag: '0', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'采购申请单详情', api_path: '/erc/purchasemanage/ERCPurchaseApplyDetailControl', api_function: 'ERCPURCHASEAPPLYDETAILCONTROL', auth_flag: '1', show_flag: '0', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});

        //品质管理
        menu = await tb_common_systemmenu.create({ systemmenu_name: '品质管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'品质录入', api_path: '/erc/purchasemanage/ERCQualityAddControl', api_function: 'ERCQUALITYADDCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'品质检验单', api_path: '/erc/purchasemanage/ERCQualityCheckControl', api_function: 'ERCQUALITYCHECKCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'退货单', api_path: '/erc/purchasemanage/ERCReturnNoteControl', api_function: 'ERCRETURNNOTECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});

        //行政办公管理
        menu = await tb_common_systemmenu.create({ systemmenu_name: '行政办公管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'会议室维护', api_path: '/erc/baseconfig/ERCMeetingRoomControl', api_function: 'ERCMEETINGROOMCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'车辆维护', api_path: '/erc/baseconfig/ERCVehicleControl', api_function: 'ERCVEHICLECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'交通接待申请', api_path: '/erc/baseconfig/ERCTransReceptionListControl', api_function: 'ERCTRANSRECEPTIONLISTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'交通接待报销申请', api_path: '/erc/baseconfig/ERCTransReceptionListExpenseControl', api_function: 'ERCTRANSRECEPTIONLISTEXPENSECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'资金支出管理', api_path: '/erc/baseconfig/ERCSpecialExpenseControl', api_function: 'ERCSPECIALEXPENSECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'会议记录', api_path: '/erc/baseconfig/ERCMeetingMinuteControl', api_function: 'ERCMEETINGMINUTECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'会议管理', api_path: '/erc/baseconfig/ERCMeetingManageControl', api_function: 'ERCMEETINGMANAGECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'文控管理', api_path: '/erc/baseconfig/ERCDocumentManagementControl', api_function: 'ERCDOCUMENTMANAGEMENTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'文件通知', api_path: '/erc/baseconfig/ERCDocumentNoticeControl', api_function: 'ERCDOCUMENTNOTICECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});

        //WMS系统管理
        menu = await tb_common_systemmenu.create({ systemmenu_name: 'WMS系统管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id;
        api = await tb_common_api.create({api_name:'采购入库管理', api_path: '/erc/inventorymanage/ERCBuyInControl', api_function: 'ERCBUYINCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'采购入库流水', api_path: '/erc/inventorymanage/ERCBuyInHistoryControl', api_function: 'ERCBUYINHISTORYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'盘点管理', api_path: '/erc/inventorymanage/ERCCheckInventoryControl', api_function: 'ERCCHECKINVENTORYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'实时库存', api_path: '/erc/inventorymanage/ERCInventoryControl', api_function: 'ERCINVENTORYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'收发存明细', api_path: '/erc/inventorymanage/ERCInventoryDetailControl', api_function: 'ERCINVENTORYDETAILCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'销售出库管理', api_path: '/erc/inventorymanage/ERCSaleOutControl', api_function: 'ERCSALEOUTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'销售出库流水', api_path: '/erc/inventorymanage/ERCSaleOutHistoryControl', api_function: 'ERCSALEOUTHISTORYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'仓库管理', api_path: '/erc/inventorymanage/ERCWarehouseControl', api_function: 'ERCWAREHOUSECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'报废管理', api_path: '/erc/inventorymanage/ERCInvalidateControl', api_function: 'ERCINVALIDATECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'出库申请', api_path: '/erc/inventorymanage/ERCStockOutApplyControl', api_function: 'ERCSTOCKOUTAPPLYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'入库申请', api_path: '/erc/inventorymanage/ERCStockInApplyControl', api_function: 'ERCSTOCKINAPPLYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'闲置库存申请', api_path: '/erc/inventorymanage/ERCIdleApplyControl', api_function: 'ERCIDLEAPPLYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});

        //生产管理
        menu = await tb_common_systemmenu.create({ systemmenu_name: '生产管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id;
        api = await tb_common_api.create({api_name:'改善措施跟进', api_path: '/erc/productionmanage/ERCStopLineImproveControl', api_function: 'ERCSTOPLINEIMPROVECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'日计划影响因素', api_path: '/erc/productionmanage/ERCStopLineGatherControl', api_function: 'ERCSTOPLINEGATHERCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'生产物料计划', api_path: '/erc/productionmanage/ERCPPMasterWeekControl', api_function: 'ERCPPMASTERWEEKCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'跟线生产单', api_path: '/erc/productionmanage/ERCPPMasterReceiveControl', api_function: 'ERCPPMASTERRECEIVECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'生产派工单', api_path: '/erc/productionmanage/ERCProductDesignateControl', api_function: 'ERCPRODUCTDESIGNATECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'生产日计划', api_path: '/erc/productionmanage/ERCPPMasterDayControl', api_function: 'ERCPPMASTERDAYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'物料报废申请', api_path: '/erc/productionmanage/ERCScrapControl', api_function: 'ERCSCRAPCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'生产任务单变更', api_path: '/erc/productionmanage/ERCProductiveTaskChangeControl', api_function: 'ERCPRODUCTIVETASKCHANGECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'异常停线管理', api_path: '/erc/productionmanage/ERCStopLineControl', api_function: 'ERCSTOPLINECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'投料变更', api_path: '/erc/productionmanage/ERCFeedChangeControl', api_function: 'ERCFEEDCHANGECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'生产主计划', api_path: '/erc/productionmanage/ERCPPMasterControl', api_function: 'ERCPPMASTERCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'生产设备维护', api_path: '/erc/productionmanage/ERCProductDeviceControl', api_function: 'ERCPRODUCTDEVICECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'产品规划评审', api_path: '/erc/productionmanage/ERCProductPlanVerifyControl', api_function: 'ERCPRODUCTPLANVERIFYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'生产任务单', api_path: '/erc/productionmanage/ERCProductiveTaskControl', api_function: 'ERCPRODUCTIVETASKCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'生产工序维护', api_path: '/erc/productionmanage/ERCProductProcedureControl', api_function: 'ERCPRODUCTPROCEDURECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'生产规划列表', api_path: '/erc/productionmanage/ERCProductPlanControl', api_function: 'ERCPRODUCTPLANCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'});
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});

        //企业客户管理
        menu = await tb_common_systemmenu.create({ systemmenu_name: '企业客户管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'企业客户管理', api_path: '/erc/baseconfig/ERCBusinessCustomerControl', api_function: 'ERCBUSINESSCUSTOMERCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'企业客户管理', api_path: '/erc/baseconfig/ERCCorporateClientsControl', api_function: 'ERCCORPORATECLIENTSCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});

        // 长期资产管理
        menu = await tb_common_systemmenu.create({ systemmenu_name: '长期资产管理', node_type: '00', parent_id: fmenuID1});
        fmenuID1 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'低值易耗品管理', api_path: '/erc/longtermassets/ERCConsumablesControl', api_function: 'ERCCONSUMABLESCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'资产盘点管理', api_path: '/erc/longtermassets/ERCAssetInventoryControl', api_function: 'ERCASSETINVENTORYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'固定资产管理', api_path: '/erc/longtermassets/ERCFixedAssetsControl', api_function: 'ERCFIXEDASSETSCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'资产报废管理', api_path: '/erc/longtermassets/ERCAssetRetirementControl', api_function: 'ERCASSETRETIREMENTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});

        // 系统权限组
        menu = await tb_common_systemmenu.create({ systemmenu_name: 'sysauthgroup', node_type: '00', parent_id: '0'});
        fmenuID1 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'客户', api_path: '', api_function: 'GROUP_CUSTOMER', auth_flag: '1', show_flag: '0', sys_usergroup_type: GLBConfig.TYPE_CUSTOMER, api_kind: '3'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID1});
        api = await tb_common_api.create({api_name:'工人', api_path: '', api_function: 'GROUP_WORKER', auth_flag: '1', show_flag: '0', sys_usergroup_type: GLBConfig.TYPE_WORKER, api_kind: '3'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID1});
        api = await tb_common_api.create({api_name:'工长', api_path: '', api_function: 'GROUP_FOREMAN', auth_flag: '1', show_flag: '0', sys_usergroup_type: GLBConfig.TYPE_FOREMAN, api_kind: '3'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID1});
        api = await tb_common_api.create({api_name:'监理', api_path: '', api_function: 'GROUP_SUPERVISION', auth_flag: '1', show_flag: '0', sys_usergroup_type: GLBConfig.TYPE_SUPERVISION, api_kind: '3'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID1});

        // mobile
        menu = await tb_common_systemmenu.create({ systemmenu_name: 'app', node_type: '00', parent_id: '0'});
        fmenuID1 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'appointment', api_path: '/mobile/appointment', api_function: 'APPOINTMENT', auth_flag: '0', show_flag: '0', api_kind: '2'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID1});
        api = await tb_common_api.create({api_name:'quote', api_path: '/mobile/quote', api_function: 'QUOTE', auth_flag: '0', show_flag: '0', api_kind: '2'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID1});
        api = await tb_common_api.create({api_name:'order', api_path: '/mobile/order', api_function: 'ORDER', auth_flag: '1', show_flag: '0', api_kind: '2'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID1});
        api = await tb_common_api.create({api_name:'user', api_path: '/mobile/user', api_function: 'USER', auth_flag: '1', show_flag: '0', api_kind: '2'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID1});
        api = await tb_common_api.create({api_name:'crew', api_path: '/mobile/crew', api_function: 'CREW', auth_flag: '1', show_flag: '0', api_kind: '2'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID1});
        api = await tb_common_api.create({api_name:'customer', api_path: '/mobile/customer', api_function: 'CUSTOMER', auth_flag: '1', show_flag: '0', api_kind: '2'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID1});
        api = await tb_common_api.create({api_name:'inquiry', api_path: '/mobile/inquiry', api_function: 'INQUIRY', auth_flag: '1', show_flag: '0', api_kind: '2'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID1});
        api = await tb_common_api.create({api_name:'feedback', api_path: '/mobile/feedback', api_function: 'FEEDBACK', auth_flag: '1', show_flag: '0', api_kind: '2'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID1});
        api = await tb_common_api.create({api_name:'materiel', api_path: '/mobile/materiel', api_function: 'MATERIEL', auth_flag: '1', show_flag: '0', api_kind: '2'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID1});
        api = await tb_common_api.create({api_name:'design', api_path: '/mobile/design', api_function: 'DESIGN', auth_flag: '1', show_flag: '0', api_kind: '2'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID1});
        api = await tb_common_api.create({api_name:'guest', api_path: '/mobile/guest', api_function: 'GUEST', auth_flag: '0', show_flag: '0', api_kind: '2'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID1});
        api = await tb_common_api.create({api_name:'task', api_path: '/mobile/task', api_function: 'TASK', auth_flag: '1', show_flag: '0', api_kind: '2'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID1});
        api = await tb_common_api.create({api_name:'complaint', api_path: '/mobile/complaint', api_function: 'COMPLAINT', auth_flag: '1', show_flag: '0', api_kind: '2'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID1});
        api = await tb_common_api.create({api_name:'node', api_path: '/mobile/node', api_function: 'NODE', auth_flag: '1', show_flag: '0', api_kind: '2'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID1});

        //印章管理
        menu = await tb_common_systemmenu.create({ systemmenu_name: '印章管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'印章刻印申请', api_path: '/erc/baseconfig/ERCSealControl', api_function: 'ERCSEALCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'用章申请', api_path: '/erc/baseconfig/ERCSealUseControl', api_function: 'ERCSEALUSECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'印章报废申请', api_path: '/erc/baseconfig/ERCSealDiscardControl', api_function: 'ERCSEALDISCARDCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'印章列表', api_path: '/erc/baseconfig/ERCSealListControl', api_function: 'ERCSEALLISTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});

        //证照管理

        menu = await tb_common_systemmenu.create({ systemmenu_name: '证照管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'证照信息录入', api_path: '/erc/baseconfig/ERCCertificateControl', api_function: 'ERCCERTIFICATECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'证照外借申请', api_path: '/erc/baseconfig/ERCCertificateUseControl', api_function: 'ERCCERTIFICATEUSECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'证照列表', api_path: '/erc/baseconfig/ERCCertificateListControl', api_function: 'ERCCERTIFICATELISTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});

        //档案管理
        menu = await tb_common_systemmenu.create({ systemmenu_name: '档案管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'档案信息录入', api_path: '/erc/baseconfig/ERCArchivesControl', api_function: 'ERCARCHIVECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'档案信息查询', api_path: '/erc/baseconfig/ERCArchivesControl', api_function: 'ERCARCHIVELISTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'档案外借申请', api_path: '/erc/baseconfig/ERCArchivesUseControl', api_function: 'ERCARCHIVEUSECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'应交档案录入', api_path: '/erc/baseconfig/ERCArchivesHandControl', api_function: 'ERCARCHIVESHANDCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});



        //global process data init
        await tb_process.create({process_name: '开工'});
        await tb_process.create({process_name: '拆改'});
        await tb_process.create({process_name: '水电'});
        await tb_process.create({process_name: '泥瓦'});
        await tb_process.create({process_name: '木工'});
        await tb_process.create({process_name: '油漆'});
        await tb_process.create({process_name: '安装'});
        await tb_process.create({process_name: '清洁'});
        await tb_process.create({process_name: '完工'});
        await tb_process.create({process_name: '污染治理'});
        await tb_process.create({process_name: '结构改造'});

        //taskallot data init
        await tb_taskallot.create({
            taskallot_id: 1,
            taskallot_name: '人工派发任务',
            taskallot_describe: '人工派发任务',
            taskallot_classify: 2
        });
        await tb_taskallot.create({
            taskallot_id: 2,
            taskallot_name: '采购申请',
            taskallot_describe: '分配采购申请审核人员',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 3,
            taskallot_name: '内部审核',
            taskallot_describe: '分配内部审核审核人员',
            taskallot_classify: 2
        });
        await tb_taskallot.create({
            taskallot_id: 4,
            taskallot_name: '生产计划',
            taskallot_describe: '分配生产计划审核人员',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 5,
            taskallot_name: '订单评审',
            taskallot_describe: '分配订单评审审核人员',
            taskallot_classify: 2
        });
        await tb_taskallot.create({
            taskallot_id: 6,
            taskallot_name: '订单验收',
            taskallot_describe: '分配订单验收审核人员',
            taskallot_classify: 2
        });
        await tb_taskallot.create({
            taskallot_id: 7,
            taskallot_name: '物料维护审核',
            taskallot_describe: '分配物料审核审核人员',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 9,
            taskallot_name: '报废申请',
            taskallot_describe: '分配报废申请审核人员',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 10,
            taskallot_name: '入库申请',
            taskallot_describe: '分配出库申请审核人员',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 11,
            taskallot_name: '出库申请',
            taskallot_describe: '分配出库申请审核人员',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 14,
            taskallot_name: '公告通知',
            taskallot_describe: '分配公告通知审核人员',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 15,
            taskallot_name: '人力需求管理',
            taskallot_describe: '分配招录任务',
            taskallot_classify: 2
        });
        await tb_taskallot.create({
            taskallot_id: 16,
            taskallot_name: '退货任务',
            taskallot_describe: '处理退货请求',
            taskallot_classify: 2
        });
        await tb_taskallot.create({
            taskallot_id: 17,
            taskallot_name: '闲置库存申请',
            taskallot_describe: '分配闲置库存申请审核人员',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 18,
            taskallot_name: '会议通知',
            taskallot_describe: '会议通知与会人员',
            taskallot_classify: 2
        });
        await tb_taskallot.create({
            taskallot_id: 19,
            taskallot_name: '会议跟进事项',
            taskallot_describe: '通知会议跟进事项责任人',
            taskallot_classify: 1
        });

        await tb_taskallot.create({
            taskallot_id: 20,
            taskallot_name: '会议通知',
            taskallot_describe: '通知会议室管理员',
            taskallot_classify: 2
        });
        await tb_taskallot.create({
            taskallot_id: 21,
            taskallot_name: '会议通知',
            taskallot_describe: '通知会议主持人',
            taskallot_classify: 2
        });
        await tb_taskallot.create({
            taskallot_id: 22,
            taskallot_name: '出差、用车接待申请',
            taskallot_describe: '分配交通接待申请审核人员',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 23,
            taskallot_name: '会议通知',
            taskallot_describe: '通知会议室设备管理员',
            taskallot_classify: 2
        });
        await tb_taskallot.create({
            taskallot_id: 24,
            taskallot_name: '交通接待报销申请',
            taskallot_describe: '分配交通接待报销审核人员',
            taskallot_classify: 2
        });
        await tb_taskallot.create({
            taskallot_id: 25,
            taskallot_name: '文控审批',
            taskallot_describe: '处理文件发布请求',
            taskallot_classify: 1

        });
        await tb_taskallot.create({
            taskallot_id: 26,
            taskallot_name: '文件发布通知',
            taskallot_describe: '通知文件发布事项',
            taskallot_classify: 2
        });
        await tb_taskallot.create({
            taskallot_id: 27,
            taskallot_name: '请假审批任务',
            taskallot_describe: '处理请假请求',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 28,
            taskallot_name: '特殊费用报销审批任务',
            taskallot_describe: '分配处理特殊费用报销审核人员',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 29,
            taskallot_name: '固定资产申购审批任务',
            taskallot_describe: '处理固定资产申购请求',
            taskallot_classify: 1
        });
        // await tb_taskallot.create({
        //     taskallot_id: 30,
        //     taskallot_name: '固定资产验收任务',
        //     taskallot_describe: '处理固定资产申购请求',
        //     taskallot_classify: 1
        // });
        await tb_taskallot.create({
            taskallot_id: 31,
            taskallot_name: '固定资产维修任务',
            taskallot_describe: '处理固定资产维修请求',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 32,
            taskallot_name: '待摊资产项目新增审核任务',
            taskallot_describe: '待摊资产项目新增请求',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 33,
            taskallot_name: '待摊资产构建预算审核任务',
            taskallot_describe: '待摊资产新增构建预算',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 34,
            taskallot_name: '待摊资产材料申购审核任务',
            taskallot_describe: '待摊资产新增材料申购',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 36,
            taskallot_name: '待摊资产人工结算审核任务',
            taskallot_describe: '待摊资产新增人工结算',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 37,
            taskallot_name: '待摊资产材料耗用审核任务',
            taskallot_describe: '待摊资产新增材料耗用',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 38,
            taskallot_name: '待摊资产构建费用审核任务',
            taskallot_describe: '待摊资产新增构建费用',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 39,
            taskallot_name: '资产报废审批任务',
            taskallot_describe: '处理资产报废审批请求',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 40,
            taskallot_name: '低值易耗品申购审核任务',
            taskallot_describe: '低值易耗品申购',
            taskallot_classify: 1
        });
        // await tb_taskallot.create({
        //     taskallot_id: 41,
        //     taskallot_name: '低值易耗品验收审核任务',
        //     taskallot_describe: '低值易耗品验收申请',
        //     taskallot_classify: 1
        // });
        await tb_taskallot.create({
            taskallot_id: 42,
            taskallot_name: '待摊资产提交验收审核任务',
            taskallot_describe: '待摊资产新增提交验收',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 43,
            taskallot_name: '盘点审批任务',
            taskallot_describe: '盘点审批任务',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 44,
            taskallot_name: '盘点完成消息通知',
            taskallot_describe: '盘点完成消息通知',
            taskallot_classify: 2
        });
        await tb_taskallot.create({
            taskallot_id: 45,
            taskallot_name: '出纳管理新增收款申报任务',
            taskallot_describe: '出纳管理新增收款申报',
            taskallot_classify: 2
        });
        await tb_taskallot.create({
            taskallot_id: 46,
            taskallot_name: '出纳管理新增付款确认任务',
            taskallot_describe: '出纳管理付款确认',
            taskallot_classify: 1
        });

        await tb_taskallot.create({
            taskallot_id: 50,
            taskallot_name: '研发项目新增审核任务',
            taskallot_describe: '研发项目新增请求',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 51,
            taskallot_name: '研发构建预算审核任务',
            taskallot_describe: '研发新增构建预算',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 52,
            taskallot_name: '研发材料申购审核任务',
            taskallot_describe: '研发新增材料申购',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 54,
            taskallot_name: '研发人工结算审核任务',
            taskallot_describe: '研发新增人工结算',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 55,
            taskallot_name: '研发材料耗用审核任务',
            taskallot_describe: '研发新增材料耗用',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 56,
            taskallot_name: '研发构建费用审核任务',
            taskallot_describe: '研发新增构建费用',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 57,
            taskallot_name: '研发提交验收审核任务',
            taskallot_describe: '研发新增提交验收',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 58,
            taskallot_name: '品质检验任务',
            taskallot_describe: '分配物料质检人员',
            taskallot_classify: 2
        });
        await tb_taskallot.create({
            taskallot_id: 60,
            taskallot_name: '工程项目材料申购审核任务',
            taskallot_describe: '工程项目新增材料申购',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 61,
            taskallot_name: '工程项目人工结算审核任务',
            taskallot_describe: '工程项目新增人工结算',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 62,
            taskallot_name: '工程项目材料耗用审核任务',
            taskallot_describe: '工程项目新增材料耗用',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 63,
            taskallot_name: '工程项目构建费用审核任务',
            taskallot_describe: '工程项目新增构建费用',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 64,
            taskallot_name: '工程项目提交验收审核任务',
            taskallot_describe: '工程项目新增提交验收',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 65,
            taskallot_name: '工程项目新建审核任务',
            taskallot_describe: '工程项目新建审核任务',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 66,
            taskallot_name: '工程项目提交预算审核任务',
            taskallot_describe: '工程项目提交预算审核任务',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 67,
            taskallot_name: '手工记账凭证新增审核任务',
            taskallot_describe: '手工记账凭证新请求',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 68,
            taskallot_name: '会计科目详情新增审核任务',
            taskallot_describe: '会计科目详新请求',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 80,
            taskallot_name: '税务申报表任务',
            taskallot_describe: '税务申报表请求',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 81,
            taskallot_name: '税费付款任务',
            taskallot_describe: '税费付款请求',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 82,
            taskallot_name: '供应商付款任务',
            taskallot_describe: '供应商付款请求',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 83,
            taskallot_name: '长期资产付款任务',
            taskallot_describe: '长期资产付款请求',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 84,
            taskallot_name: '外包服务审核',
            taskallot_describe: '外包服务请求',
            taskallot_classify: 1
        });
        // await tb_taskallot.create({
        //     taskallot_id: 85,
        //     taskallot_name: '生产派工单任务',
        //     taskallot_describe: '生产派工单新增',
        //     taskallot_classify: 1
        // });
        await tb_taskallot.create({
            taskallot_id: 86,
            taskallot_name: '离职审核',
            taskallot_describe: '离职审核请求',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 87,
            taskallot_name: '安全库存审核',
            taskallot_describe: '安全库存审核请求',
            taskallot_classify: 1
        });
        // await tb_taskallot.create({
        //     taskallot_id: 90,
        //     taskallot_name: '投料变更任务',
        //     taskallot_describe: '投料变更任务',
        //     taskallot_classify: 1
        // });
        await tb_taskallot.create({
            taskallot_id: 91,
            taskallot_name: '异常停线任务',
            taskallot_describe: '异常停线任务',
            taskallot_classify: 2
        });
        // await tb_taskallot.create({
        //     taskallot_id: 92,
        //     taskallot_name: '生产任务单转采购审核任务',
        //     taskallot_describe: '生产任务单转采购审核任务',
        //     taskallot_classify: 1
        // });
        await tb_taskallot.create({
            taskallot_id: 93,
            taskallot_name: '生产投料报废审核任务',
            taskallot_describe: '生产投料报废审核任务',
            taskallot_classify: 1
        });
        await tb_taskallot.create({
            taskallot_id: 94,
            taskallot_name: '跟线生产任务',
            taskallot_describe: '跟线生产任务',
            taskallot_classify: 2
        });
        await tb_taskallot.create({
            taskallot_id: 96,
            taskallot_name: '日计划影响因素,实施责任人改善措施',
            taskallot_describe: '日计划影响因素,实施责任人改善措施',
            taskallot_classify: 2
        });
        await tb_taskallot.create({
            taskallot_id: 97,
            taskallot_name: '日计划影响因素,监督人改善措施',
            taskallot_describe: '日计划影响因素,监督人改善措施',
            taskallot_classify: 2
        });
        //----沿海begin-----
        await tb_taskallot.create({
            taskallot_id: 201,
            taskallot_name: '印章刻印审核',
            taskallot_describe: '分配印章刻印审核人员'
        });
        await tb_taskallot.create({
            taskallot_id: 202,
            taskallot_name: '用章审核',
            taskallot_describe: '分配用章审核人员'
        });
        await tb_taskallot.create({
            taskallot_id: 204,
            taskallot_name: '印章报废审核',
            taskallot_describe: '分配印章报废审核人员'
        });
        await tb_taskallot.create({
            taskallot_id: 205,
            taskallot_name: '证照外借审核',
            taskallot_describe: '分配证照外借审核人员'
        });
        await tb_taskallot.create({
            taskallot_id: 206,
            taskallot_name: '证照外借归位确认',
            taskallot_describe: '分配证照外借归位确认人员'
        })
        await tb_taskallot.create({
            taskallot_id: 210,
            taskallot_name: '档案外借审核',
            taskallot_describe: '分配档案外借审核人员'
        });
        await tb_taskallot.create({
            taskallot_id: 211,
            taskallot_name: '档案外借归位确认',
            taskallot_describe: '分配档案外借归位确认人员'
        })
        //---沿海end-------------------

        process.exit(0)
    } catch (error) {
        console.log(error);
    }
})();
