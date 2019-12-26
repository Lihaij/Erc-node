/*项目管理模块*/
insert into tbl_common_systemmenu (systemmenu_name,node_type,parent_id,version,created_at,updated_at) VALUES ('项目管理','00','0',1,NOW(),NOW());
call Pro_AddMenu('项目管理', '项目客户信息录入','/erc/projectmanage/ERCProjectCustomerControl','ERCProjectCustomerControl');
call Pro_AddMenu('项目管理', '项目信息录入','/erc/projectmanage/ERCProjectInfoControl','ERCProjectInfoControl');
call Pro_AddMenu('项目管理', '项目合同管理','/erc/projectmanage/ERCProjectContractControl','ERCProjectContractControl');
call Pro_AddMenu('项目管理', '项目里程碑管理','/erc/projectmanage/ERCProjectMilestoneControl','ERCProjectContractMilestoneControl');