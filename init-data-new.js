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

        // -------------------------------------common-------------------------------------
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
        api = await tb_common_api.create({api_name:'员工维护', api_path: '/common/system/OperatorControl', api_function: 'OPERATORCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});

//-------------------------------------erc-------------------------------------
        menu = await tb_common_systemmenu.create({ systemmenu_name: 'erc', node_type: '00', parent_id: '0'});
        fmenuID1 = menu.systemmenu_id
        //------------ 系统设置 ok
        menu = await tb_common_systemmenu.create({ systemmenu_name: '系统设置', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id

        api = await tb_common_api.create({api_name:'角色设置', api_path: '/common/system/DomainGroupControl', api_function: 'DOMAINGROUPCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'工作流配置', api_path: '/erc/baseconfig/ERCTaskAllotControl', api_function: 'ERCTASKALLOTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'管理配置', api_path: '/erc/ordermanage/ERCOrderRequireControl', api_function: 'ERCORDERREQUIRECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'初始化数据导入', api_path: '/erc/baseconfig/ERCBASEDATACONTROL', api_function: 'ERCBASEDATACONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'系统数据字典初始化', api_path: '/erc/baseconfig/ERCSystemDataInitializationControl', api_function: 'ERCSYSTEMDATAINITIALIZATIONCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'会计科目列表', api_path: '/erc/cashiermanage/ERCAccountingListControl', api_function: 'ERCACCOUNTINGLISTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'重置密码', api_path: '/common/system/ResetPassword', api_function: 'RESETPASSWORD', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'公司资料维护', api_path: '/erc/baseconfig/ERCCompanyControl', api_function: 'ERCCOMPANYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'附属公司管理', api_path: '/erc/baseconfig/ERCAffiliatedCompanyControl', api_function: 'ERCAFFILIATEDCOMPANYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});

        //------------ 基础数据维护   ok
        menu = await tb_common_systemmenu.create({ systemmenu_name: '基础数据维护', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'物料数据维护', api_path: '/erc/baseconfig/ERCMaterielControl', api_function: 'ERCMATERIELCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'报销职级维护', api_path: '/erc/baseconfig/ERCReimburseRankControl', api_function: 'ERCREIMBURSERANKCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'车辆数据维护', api_path: '/erc/baseconfig/ERCVehicleControl', api_function: 'ERCVEHICLECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'会议室数据维护', api_path: '/erc/baseconfig/ERCMeetingRoomControl', api_function: 'ERCMEETINGROOMCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'生产设备维护', api_path: '/erc/productionmanage/ERCProductDeviceControl', api_function: 'ERCPRODUCTDEVICECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'生产工序维护', api_path: '/erc/productionmanage/ERCProductProcedureControl', api_function: 'ERCPRODUCTPROCEDURECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});

        //------------ 人力资源管理   ok
        menu = await tb_common_systemmenu.create({ systemmenu_name: '人力资源管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'部门管理', api_path: '/erc/baseconfig/ERCDepartmentControl', api_function: 'ERCDEPARTMENTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'岗位管理', api_path: '/erc/baseconfig/ERCUsergroupControl', api_function: 'ERCUSERGROUPCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'员工信息管理', api_path: '/erc/baseconfig/ERCEmployeeInformationControl', api_function: 'ERCEMPLOYEEINFORMATIONCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'人力需求管理', api_path: '/erc/baseconfig/ERCHumanResourceControl', api_function: 'ERCHUMANRESOURCECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'候选人数据采集', api_path: '/erc/baseconfig/ERCCandidateControl', api_function: 'ERCCANDIDATECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});

        //------------ 任务管理 ok
        menu = await tb_common_systemmenu.create({ systemmenu_name: '任务管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'任务列表', api_path: '/erc/baseconfig/ERCTaskListControl', api_function: 'ERCTASKLISTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});

        //------------ 行政办公管理   ok
        menu = await tb_common_systemmenu.create({ systemmenu_name: '行政办公管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'公告管理', api_path: '/erc/baseconfig/ERCNoticeControl', api_function: 'ERCNOTICECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'会议管理', api_path: '/erc/baseconfig/ERCMeetingManageControl', api_function: 'ERCMEETINGMANAGECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'会议记录管理', api_path: '/erc/baseconfig/ERCMeetingMinuteControl', api_function: 'ERCMEETINGMINUTECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'文件列表', api_path: '/erc/baseconfig/ERCDocumentNoticeControl', api_function: 'ERCDOCUMENTNOTICECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'发文管理', api_path: '/erc/baseconfig/ERCDocumentManagementControl', api_function: 'ERCDOCUMENTMANAGEMENTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'请假管理', api_path: '/erc/baseconfig/ERCAskForLeaveControl', api_function: 'ERCASKFORLEAVECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'出差交通接待申请', api_path: '/erc/baseconfig/ERCTransReceptionListControl', api_function: 'ERCTRANSRECEPTIONLISTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'出差交通接待报销申请', api_path: '/erc/baseconfig/ERCTransReceptionListExpenseControl', api_function: 'ERCTRANSRECEPTIONLISTEXPENSECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'费用报销管理', api_path: '/erc/baseconfig/ERCSpecialExpenseControl', api_function: 'ERCSPECIALEXPENSECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'外包服务管理', api_path: '/erc/baseconfig/ERCOutsourceControl', api_function: 'ERCOUTSOURCECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'任务完成统计', api_path: '/erc/baseconfig/ERCTaskStatisticsControl', api_function: 'ERCTASKSTATISTICSCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});

        //------------ 销售管理 ok
        menu = await tb_common_systemmenu.create({ systemmenu_name: '销售管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'订单列表', api_path: '/erc/ordermanage/ERCSaleOrderCompanyControl', api_function: 'ERCSALEORDERCOMPANYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'销售价格模板', api_path: '/erc/baseconfig/ERCProductSalesPriceControl', api_function: 'ERCPRODUCTSALESPRICECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'客户维护', api_path: '/erc/baseconfig/ERCCustomerBControl', api_function: 'ERCCUSTOMERBCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});

        //------------ 订单评审 ok
        menu = await tb_common_systemmenu.create({ systemmenu_name: '订单评审', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'订单评审', api_path: '/erc/ordermanage/ERCOrderReviewControl', api_function: 'ERCORDERREVIEWCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});

        //------------ 采购管理 ok
        menu = await tb_common_systemmenu.create({ systemmenu_name: '采购管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'供应商管理', api_path: '/erc/baseconfig/ERCSupplierControl', api_function: 'ERCSUPPLIERCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'采购管理', api_path: '/erc/purchasemanage/ERCPurchaseControl', api_function: 'ERCPURCHASECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'供应商付款申请表', api_path: '/erc/cashiermanage/ERCSupplierPaymentControl', api_function: 'ERCSUPPLIERPAYMENTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'供应商物料维护', api_path: '/erc/baseconfig/ERCSupplierMaterielControl', api_function: 'ERCSUPPLIERMATERIELCONTROL', auth_flag: '1', show_flag: '0', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        //------------ 其他相关主体   ok
        menu = await tb_common_systemmenu.create({ systemmenu_name: '其他相关主体', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'其他相关主体', api_path: '/erc/cashiermanage/ERCOtherRelevantMainControl', api_function: 'ERCOTHERRELEVANTMAINCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});


        //------------ 存货收发管理   ok
        menu = await tb_common_systemmenu.create({ systemmenu_name: '存货收发管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'仓库仓区设置', api_path: '/erc/inventorymanage/ERCWarehouseControl', api_function: 'ERCWAREHOUSECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'其他入库申请管理', api_path: '/erc/inventorymanage/ERCStockInApplyControl', api_function: 'ERCSTOCKINAPPLYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'其他出库申请管理', api_path: '/erc/inventorymanage/ERCStockOutApplyControl', api_function: 'ERCSTOCKOUTAPPLYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'收货管理', api_path: '/erc/inventorymanage/ERCCollectGoodsControl', api_function: 'ERCCOLLECTGOODSCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'入库管理', api_path: '/erc/inventorymanage/ERCBuyInControl', api_function: 'ERCBUYINCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'出库管理', api_path: '/erc/inventorymanage/ERCSaleOutControl', api_function: 'ERCSALEOUTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'闲置库存管理', api_path: '/erc/inventorymanage/ERCIdleApplyControl', api_function: 'ERCIDLEAPPLYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'盘点管理', api_path: '/erc/inventorymanage/ERCCheckInventoryControl', api_function: 'ERCCHECKINVENTORYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'报废管理', api_path: '/erc/inventorymanage/ERCInvalidateControl', api_function: 'ERCINVALIDATECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'即时库存查询', api_path: '/erc/inventorymanage/ERCInventoryControl', api_function: 'ERCINVENTORYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'入库流水查询', api_path: '/erc/inventorymanage/ERCBuyInHistoryControl', api_function: 'ERCBUYINHISTORYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'出库流水查询', api_path: '/erc/inventorymanage/ERCSaleOutHistoryControl', api_function: 'ERCSALEOUTHISTORYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'收发存数据查询', api_path: '/erc/inventorymanage/ERCInventoryDetailControl', api_function: 'ERCINVENTORYDETAILCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'收货流水查询', api_path: '/erc/inventorymanage/ERCReceiptListControl', api_function: 'ERCRECEIPTLISTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});


        //------------ 外购固定资产   ok
        menu = await tb_common_systemmenu.create({ systemmenu_name: '外购固定资产', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'外购固定资产管理', api_path: '/erc/longtermassets/ERCFixedAssetsControl', api_function: 'ERCFIXEDASSETSCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});


        //------------ 低值易耗品管理  ok
        menu = await tb_common_systemmenu.create({ systemmenu_name: '低值易耗品管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'低值易耗品管理管理', api_path: '/erc/longtermassets/ERCConsumablesControl', api_function: 'ERCCONSUMABLESCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});

        //------------ 长期资产管理   ok
        menu = await tb_common_systemmenu.create({ systemmenu_name: '长期资产管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'待摊资产列表', api_path: '/erc/longtermassets/ERCAmortizeDataControl', api_function: 'ERCAMORTIZEDATACONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'待摊资产项目管理', api_path: '/erc/longtermassets/ERCAmortizeControl', api_function: 'ERCAMORTIZECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'待摊资产材料申购单', api_path: '/erc/longtermassets/ERCAmortizeScribeOrderControl', api_function: 'ERCAMORTIZESCRIBEORDERCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'待摊资产材料采购单', api_path: '/erc/longtermassets/ERCAmortizePurchaseOrderControl', api_function: 'ERCAMORTIZEPURCHASEORDERCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'待摊资产材料收料单', api_path: '/erc/longtermassets/ERCAmortizeReceiveControl', api_function: 'ERCAMORTIZERECEIVECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'待摊资产材料耗用单', api_path: '/erc/longtermassets/ERCAmortizeConsumeControl', api_function: 'ERCAMORTIZECONSUMECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'长期资产付款列表', api_path: '/erc/longtermassets/ERCAmortizePaymentControl', api_function: 'ERCAMORTIZEPAYMENTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});

        //------------ 长期资产盘点与报废管理  ok
        menu = await tb_common_systemmenu.create({ systemmenu_name: '长期资产盘点与报废管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'资产报废管理', api_path: '/erc/longtermassets/ERCAssetRetirementDetailControl', api_function: 'ERCASSETRETIREMENTDETAILCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'资产盘点管理', api_path: '/erc/longtermassets/ERCAssetInventoryControl', api_function: 'ERCASSETINVENTORYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'报废申请单列表', api_path: '/erc/longtermassets/ERCAssetRetirementControl', api_function: 'ERCASSETRETIREMENTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});


        //------------ 产品规划管理   ok
        menu = await tb_common_systemmenu.create({ systemmenu_name: '产品规划管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'产品规划列表', api_path: '/erc/productionmanage/ERCProductPlanControl', api_function: 'ERCPRODUCTPLANCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'产品规划评审', api_path: '/erc/productionmanage/ERCProductPlanVerifyControl', api_function: 'ERCPRODUCTPLANVERIFYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});


        //------------ 生产管理 ok
        menu = await tb_common_systemmenu.create({ systemmenu_name: '生产管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'生产任务单', api_path: '/erc/productionmanage/ERCProductiveTaskControl', api_function: 'ERCPRODUCTIVETASKCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'排产主计划', api_path: '/erc/productionmanage/ERCPPMasterControl', api_function: 'ERCPPMASTERCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'生产派工单', api_path: '/erc/productionmanage/ERCProductDesignateControl', api_function: 'ERCPRODUCTDESIGNATECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'物料报废申请', api_path: '/erc/productionmanage/ERCScrapControl', api_function: 'ERCSCRAPCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'异常停线管理', api_path: '/erc/productionmanage/ERCStopLineControl', api_function: 'ERCSTOPLINECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'投料变更', api_path: '/erc/productionmanage/ERCFeedChangeControl', api_function: 'ERCFEEDCHANGECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});



        //------------ 品质管理 ok
        menu = await tb_common_systemmenu.create({ systemmenu_name: '品质管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'收货单列表', api_path: '/erc/purchasemanage/ERCQualityAddControl', api_function: 'ERCQUALITYADDCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'来料合格列表', api_path: '/erc/purchasemanage/ERCQualityCheckControl', api_function: 'ERCQUALITYCHECKCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'退货单列表', api_path: '/erc/purchasemanage/ERCReturnNoteControl', api_function: 'ERCRETURNNOTECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'生产工序品质管理', api_path: '/erc/productionmanage/ERCProductProcedureQualityControl', api_function: 'ERCPRODUCTPROCEDUREQUALITYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'工序验收单列表', api_path: '/erc/productionmanage/ERCProductProcedureListControl', api_function: 'ERCPRODUCTPROCEDURELISTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});


        //------------ 研发管理 ok
        menu = await tb_common_systemmenu.create({ systemmenu_name: '研发管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'研发项目管理', api_path: '/erc/longtermassets/ERCDevelopControl', api_function: 'ERCDEVELOPCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'研发资产材料申购单', api_path: '/erc/longtermassets/ERCDevelopScribeOrderControl', api_function: 'ERCDEVELOPSCRIBEORDERCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'研发资产材料采购单', api_path: '/erc/longtermassets/ERCDevelopPurchaseOrderControl', api_function: 'ERCDEVELOPPURCHASEORDERCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'研发资产材料收料单', api_path: '/erc/longtermassets/ERCDevelopReceiveControl', api_function: 'ERCDEVELOPRECEIVECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'研发资产材料耗用单', api_path: '/erc/longtermassets/ERCDevelopConsumeControl', api_function: 'ERCDEVELOPCONSUMECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});



        //------------ 工程项目管理   ok
        menu = await tb_common_systemmenu.create({ systemmenu_name: '工程项目管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'人工价格标准', api_path: '/erc/baseconfig/ERCWorkerPriceControl', api_function: 'ERCWORKERPRICECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'工程项目列表', api_path: '/erc/baseconfig/ERCProjectControl', api_function: 'ERCPROJECTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});


        //------------ 财务管理 ok
        menu = await tb_common_systemmenu.create({ systemmenu_name: '财务管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'付款列表', api_path: '/erc/cashiermanage/ERCPaymentConfirmControl', api_function: 'ERCPAYMENTCONFIRMCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'客户收款申报单', api_path: '/erc/cashiermanage/ERCGatheringControl', api_function: 'ERCGATHERINGCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'资金费用汇总表', api_path: '/erc/cashiermanage/ERCSpecialExpenseGatheringSumControl', api_function: 'ERCSPECIALEXPENSEGATHERINGSUMCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'物料收发汇总表', api_path: '/erc/cashiermanage/ERCMaterielSRControl', api_function: 'ERCMATERIELSRCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'资金费用记账凭证', api_path: '/erc/cashiermanage/ERCRecordingVoucherSCControl', api_function: 'ERCRECORDINGVOUCHERSCCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'物料收发记账凭证', api_path: '/erc/cashiermanage/ERCRecordingVoucherControl', api_function: 'ERCRECORDINGVOUCHERCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'总账分类', api_path: '/erc/cashiermanage/ERCGeneralLedgerControl', api_function: 'ERCGENERALLEDGERCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'明细分类账', api_path: '/erc/cashiermanage/SubsidiaryLedgersControl', api_function: 'SUBSIDIARYLEDGERSCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'手工记账凭证', api_path: '/erc/cashiermanage/ERCRecordingVoucherCustomControl', api_function: 'ERCRECORDINGVOUCHERCUSTOMCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'员工工资管理', api_path: '/erc/cashiermanage/ERCEmployeeWagesControl', api_function: 'ERCEMPLOYEEWAGESCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});



        //------------ 税务报表数据采集管理   ok
        menu = await tb_common_systemmenu.create({ systemmenu_name: '税务报表数据采集管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'小规模税务报表管理', api_path: '/erc/cashiermanage/ERCTaxStatementSmallControl', api_function: 'ERCTAXSTATEMENTSMALLCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'生产型税务报表管理', api_path: '/erc/cashiermanage/ERCTaxStatementProductControl', api_function: 'ERCTAXSTATEMENTPRODUCTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'服务与商贸税务报表管理', api_path: '/erc/cashiermanage/ERCTaxStatementControl', api_function: 'ERCTAXSTATEMENTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});


        //------------ 财务报表 ok
        menu = await tb_common_systemmenu.create({ systemmenu_name: '财务报表', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'利润表管理', api_path: '/erc/cashiermanage/ERCProfitManagerControl', api_function: 'ERCPROFITMANAGERCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'资产负债表管理', api_path: '/erc/cashiermanage/ERCAssetsLiabilityControl', api_function: 'ERCASSETSLIABILITYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'订单物料成本差异分析', api_path: '/erc/reportmanage/ERCOrderMaterielCostAnalysisControl', api_function: 'ERCORDERMATERIELCOSTANALYSISCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'订单人工成本差异分析', api_path: '/erc/reportmanage/ERCOrderLabourCostAnalysisControl', api_function: 'ERCORDERLABOURCOSTANALYSISCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});



        //------------ 发票管理 ok
        menu = await tb_common_systemmenu.create({ systemmenu_name: '发票管理', node_type: '00', parent_id: fmenuID1});
        fmenuID2 = menu.systemmenu_id
        api = await tb_common_api.create({api_name:'销售发票管理', api_path: '/erc/cashiermanage/ERCInvoiceSaleControl', api_function: 'ERCINVOICESALECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'已开发票列表', api_path: '/erc/cashiermanage/ERCInvoiceAlreadyControl', api_function: 'ERCINVOICEALREADYCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'采购专用发票管理', api_path: '/erc/cashiermanage/ERCInvoicePurchaseControl', api_function: 'ERCINVOICEPURCHASECONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});
        api = await tb_common_api.create({api_name:'税费付款申请表', api_path: '/erc/cashiermanage/ERCTaxPaymentControl', api_function: 'ERCTAXPAYMENTCONTROL', auth_flag: '1', show_flag: '1', api_kind: '1'})
        menu = await tb_common_systemmenu.create({ systemmenu_name: api.api_name, api_id: api.api_id, api_function: api.api_function, node_type: '01', parent_id: fmenuID2});


        //------------ app
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
            taskallot_describe: '人工派发任务'
        });
        await tb_taskallot.create({
            taskallot_id: 2,
            taskallot_name: '采购申请',
            taskallot_describe: '分配采购申请审核人员'
        });
        await tb_taskallot.create({
            taskallot_id: 3,
            taskallot_name: '内部审核',
            taskallot_describe: '分配内部审核审核人员'
        });
        await tb_taskallot.create({
            taskallot_id: 4,
            taskallot_name: '生产计划',
            taskallot_describe: '分配生产计划审核人员'
        });
        await tb_taskallot.create({
            taskallot_id: 5,
            taskallot_name: '订单评审',
            taskallot_describe: '分配订单评审审核人员'
        });
        await tb_taskallot.create({
            taskallot_id: 6,
            taskallot_name: '订单验收',
            taskallot_describe: '分配订单验收审核人员'
        });
        await tb_taskallot.create({
            taskallot_id: 7,
            taskallot_name: '物料维护审核',
            taskallot_describe: '分配物料审核审核人员'
        });
        await tb_taskallot.create({
            taskallot_id: 9,
            taskallot_name: '报废申请',
            taskallot_describe: '分配报废申请审核人员'
        });
        await tb_taskallot.create({
            taskallot_id: 10,
            taskallot_name: '入库申请',
            taskallot_describe: '分配出库申请审核人员'
        });
        await tb_taskallot.create({
            taskallot_id: 11,
            taskallot_name: '出库申请',
            taskallot_describe: '分配出库申请审核人员'
        });
        await tb_taskallot.create({
            taskallot_id: 14,
            taskallot_name: '公告通知',
            taskallot_describe: '分配公告通知审核人员'
        });
        await tb_taskallot.create({
            taskallot_id: 15,
            taskallot_name: '人力需求管理',
            taskallot_describe: '分配招录任务'
        });
        await tb_taskallot.create({
            taskallot_id: 16,
            taskallot_name: '退货任务',
            taskallot_describe: '处理退货请求'
        });
        await tb_taskallot.create({
            taskallot_id: 17,
            taskallot_name: '闲置库存申请',
            taskallot_describe: '分配闲置库存申请审核人员'
        });
        await tb_taskallot.create({
            taskallot_id: 18,
            taskallot_name: '会议通知',
            taskallot_describe: '会议通知与会人员'
        });
        await tb_taskallot.create({
            taskallot_id: 19,
            taskallot_name: '会议跟进事项',
            taskallot_describe: '通知会议跟进事项责任人'
        });

        await tb_taskallot.create({
            taskallot_id: 20,
            taskallot_name: '会议通知',
            taskallot_describe: '通知会议室管理员'
        });
        await tb_taskallot.create({
            taskallot_id: 21,
            taskallot_name: '会议通知',
            taskallot_describe: '通知会议主持人'
        });
        await tb_taskallot.create({
            taskallot_id: 22,
            taskallot_name: '出差、用车接待申请通知',
            taskallot_describe: '分配交通接待申请审核人员'
        });
        await tb_taskallot.create({
            taskallot_id: 23,
            taskallot_name: '会议通知',
            taskallot_describe: '通知会议室设备管理员'
        });
        await tb_taskallot.create({
            taskallot_id: 24,
            taskallot_name: '交通接待报销申请',
            taskallot_describe: '分配交通接待报销审核人员'
        });
        await tb_taskallot.create({
            taskallot_id: 25,
            taskallot_name: '文控审批任务',
            taskallot_describe: '处理文件发布请求'
        });
        await tb_taskallot.create({
            taskallot_id: 26,
            taskallot_name: '文件发布通知',
            taskallot_describe: '通知文件发布事项'
        });
        await tb_taskallot.create({
            taskallot_id: 27,
            taskallot_name: '请假审批任务',
            taskallot_describe: '处理请假请求'
        });
        await tb_taskallot.create({
            taskallot_id: 28,
            taskallot_name: '特殊费用报销审批任务',
            taskallot_describe: '分配处理特殊费用报销审核人员'
        });
        await tb_taskallot.create({
            taskallot_id: 29,
            taskallot_name: '固定资产申购审批任务',
            taskallot_describe: '处理固定资产申购请求'
        });
        await tb_taskallot.create({
            taskallot_id: 30,
            taskallot_name: '固定资产验收任务',
            taskallot_describe: '处理固定资产申购请求'
        });
        await tb_taskallot.create({
            taskallot_id: 31,
            taskallot_name: '固定资产维修任务',
            taskallot_describe: '处理固定资产维修请求'
        });
        await tb_taskallot.create({
            taskallot_id: 32,
            taskallot_name: '待摊资产项目新增审核任务',
            taskallot_describe: '待摊资产项目新增请求'
        });
        await tb_taskallot.create({
            taskallot_id: 33,
            taskallot_name: '待摊资产构建预算审核任务',
            taskallot_describe: '待摊资产新增构建预算'
        });
        await tb_taskallot.create({
            taskallot_id: 34,
            taskallot_name: '待摊资产材料申购审核任务',
            taskallot_describe: '待摊资产新增材料申购'
        });
        await tb_taskallot.create({
            taskallot_id: 36,
            taskallot_name: '待摊资产人工结算审核任务',
            taskallot_describe: '待摊资产新增人工结算'
        });
        await tb_taskallot.create({
            taskallot_id: 37,
            taskallot_name: '待摊资产材料耗用审核任务',
            taskallot_describe: '待摊资产新增材料耗用'
        });
        await tb_taskallot.create({
            taskallot_id: 38,
            taskallot_name: '待摊资产构建费用审核任务',
            taskallot_describe: '待摊资产新增构建费用'
        });
        await tb_taskallot.create({
            taskallot_id: 39,
            taskallot_name: '资产报废审批任务',
            taskallot_describe: '处理资产报废审批请求'
        });
        await tb_taskallot.create({
            taskallot_id: 40,
            taskallot_name: '低值易耗品申购审核任务',
            taskallot_describe: '低值易耗品申购'
        });
        await tb_taskallot.create({
            taskallot_id: 41,
            taskallot_name: '低值易耗品验收审核任务',
            taskallot_describe: '低值易耗品验收申请'
        });
        await tb_taskallot.create({
            taskallot_id: 42,
            taskallot_name: '待摊资产提交验收审核任务',
            taskallot_describe: '待摊资产新增提交验收'
        });
        await tb_taskallot.create({
            taskallot_id: 43,
            taskallot_name: '盘点审批任务',
            taskallot_describe: '盘点审批任务'
        });
        await tb_taskallot.create({
            taskallot_id: 44,
            taskallot_name: '盘点完成消息通知',
            taskallot_describe: '盘点完成消息通知'
        });
        await tb_taskallot.create({
            taskallot_id: 45,
            taskallot_name: '出纳管理新增收款申报任务',
            taskallot_describe: '出纳管理新增收款申报'
        });
        await tb_taskallot.create({
            taskallot_id: 46,
            taskallot_name: '出纳管理新增付款确认任务',
            taskallot_describe: '出纳管理付款确认'
        });

        await tb_taskallot.create({
            taskallot_id: 50,
            taskallot_name: '研发项目新增审核任务',
            taskallot_describe: '研发项目新增请求'
        });
        await tb_taskallot.create({
            taskallot_id: 51,
            taskallot_name: '研发构建预算审核任务',
            taskallot_describe: '研发新增构建预算'
        });
        await tb_taskallot.create({
            taskallot_id: 52,
            taskallot_name: '研发材料申购审核任务',
            taskallot_describe: '研发新增材料申购'
        });
        await tb_taskallot.create({
            taskallot_id: 54,
            taskallot_name: '研发人工结算审核任务',
            taskallot_describe: '研发新增人工结算'
        });
        await tb_taskallot.create({
            taskallot_id: 55,
            taskallot_name: '研发材料耗用审核任务',
            taskallot_describe: '研发新增材料耗用'
        });
        await tb_taskallot.create({
            taskallot_id: 56,
            taskallot_name: '研发构建费用审核任务',
            taskallot_describe: '研发新增构建费用'
        });
        await tb_taskallot.create({
            taskallot_id: 57,
            taskallot_name: '研发提交验收审核任务',
            taskallot_describe: '研发新增提交验收'
        });
        await tb_taskallot.create({
            taskallot_id: 58,
            taskallot_name: '品质检验任务',
            taskallot_describe: '分配物料质检人员'
        });
        await tb_taskallot.create({
            taskallot_id: 60,
            taskallot_name: '工程项目材料申购审核任务',
            taskallot_describe: '工程项目新增材料申购'
        });
        await tb_taskallot.create({
            taskallot_id: 61,
            taskallot_name: '工程项目人工结算审核任务',
            taskallot_describe: '工程项目新增人工结算'
        });
        await tb_taskallot.create({
            taskallot_id: 62,
            taskallot_name: '工程项目材料耗用审核任务',
            taskallot_describe: '工程项目新增材料耗用'
        });
        await tb_taskallot.create({
            taskallot_id: 63,
            taskallot_name: '工程项目构建费用审核任务',
            taskallot_describe: '工程项目新增构建费用'
        });
        await tb_taskallot.create({
            taskallot_id: 64,
            taskallot_name: '工程项目提交验收审核任务',
            taskallot_describe: '工程项目新增提交验收'
        });
        await tb_taskallot.create({
            taskallot_id: 65,
            taskallot_name: '工程项目新建审核任务',
            taskallot_describe: '工程项目新建审核任务'
        });
        await tb_taskallot.create({
            taskallot_id: 66,
            taskallot_name: '工程项目提交预算审核任务',
            taskallot_describe: '工程项目提交预算审核任务'
        });
        await tb_taskallot.create({
            taskallot_id: 67,
            taskallot_name: '手工记账凭证新增审核任务',
            taskallot_describe: '手工记账凭证新请求'
        });
        await tb_taskallot.create({
            taskallot_id: 68,
            taskallot_name: '会计科目详情新增审核任务',
            taskallot_describe: '会计科目详新请求'
        });
        await tb_taskallot.create({
            taskallot_id: 80,
            taskallot_name: '税务申报表任务',
            taskallot_describe: '税务申报表请求'
        });
        await tb_taskallot.create({
            taskallot_id: 81,
            taskallot_name: '税费付款任务',
            taskallot_describe: '税费付款请求'
        });
        await tb_taskallot.create({
            taskallot_id: 82,
            taskallot_name: '供应商付款任务',
            taskallot_describe: '供应商付款请求'
        });
        await tb_taskallot.create({
            taskallot_id: 83,
            taskallot_name: '长期资产付款任务',
            taskallot_describe: '长期资产付款请求'
        });
        await tb_taskallot.create({
            taskallot_id: 84,
            taskallot_name: '外包服务审核',
            taskallot_describe: '外包服务请求'
        });
        await tb_taskallot.create({
            taskallot_id: 86,
            taskallot_name: '离职审核',
            taskallot_describe: '离职审核请求'
        });
        await tb_taskallot.create({
            taskallot_id: 87,
            taskallot_name: '安全库存审核',
            taskallot_describe: '安全库存审核请求'
        });

        process.exit(0)
    } catch (error) {
        console.log(error);
    }
})();
