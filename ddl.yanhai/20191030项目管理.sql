/*项目管理模块*/
insert into tbl_common_systemmenu
      (systemmenu_name,node_type,parent_id,version,created_at,updated_at)
VALUES
      ('项目管理', '00', '0', 1, NOW(), NOW());
call Pro_AddMenu
('项目管理', '项目客户信息录入','/erc/projectmanage/ERCProjectCustomerControl','ERCPROJECTCUSTOMERCONTROL');
call Pro_AddMenu
('项目管理', '项目信息录入','/erc/projectmanage/ERCProjectInfoControl','ERCPROJECTINFOCONTROL');

call Pro_AddMenu
('项目管理', '项目合同管理','/erc/projectmanage/ERCProjectContractControl','ERCPROJECTCONTRACTCONTROL');
call Pro_AddMenu
('项目管理', '项目里程碑管理','/erc/projectmanage/ERCProjectMilestoneControl','ERCPROJECTCONTRACTMILESTONECONTROL');
call Pro_AddMenu
('项目管理', '项目验收','/erc/projectmanage/ERCProjectAcceptanceControl','ERCPROJECTACCEPTANCECONTROL');
call Pro_AddMenu
('项目管理', '项目评价','/erc/projectmanage/ERCProjectEvaluateControl','ERCPROJECTEVALUATECONTROL');
call Pro_AddMenu
('项目管理', '项目售后','/erc/projectmanage/ERCProjectAfterSaleControl','ERCPROJECTAFTERSALECONTROL');
call Pro_AddMenu
('项目管理', '项目信息查询','/erc/projectmanage/ERCProjectInfoSearchControl','ERCPROJECTINFOSEARCHCONTROL');
call Pro_AddMenu
('项目管理', '项目收款申报','/erc/projectmanage/ERCProjectCollectReportControl','ERCPROJECTCOLLECTREPORTCONTROL');


-- 表创建--
DROP TABLE IF EXISTS `tbl_erc_project_milestone_problem`;
DROP TABLE IF EXISTS `tbl_erc_project_receipt`;
DROP TABLE IF EXISTS `tbl_erc_project_aftersale`;
DROP TABLE IF EXISTS `tbl_erc_project_milestone_participants`;
DROP TABLE IF EXISTS `tbl_erc_project_customer`;
DROP TABLE IF EXISTS `tbl_erc_project_info`;
DROP TABLE IF EXISTS `tbl_erc_project_workleaders`;
DROP TABLE IF EXISTS `tbl_erc_associated_person`;
DROP TABLE IF EXISTS `tbl_erc_associated_relatives`;
DROP TABLE IF EXISTS `tbl_erc_associated_active`;
DROP TABLE IF EXISTS `tbl_erc_associated_feedback`;
DROP TABLE IF EXISTS `tbl_erc_project_analysis_record`;
DROP TABLE IF EXISTS `tbl_erc_project_contract`;
DROP TABLE IF EXISTS `tbl_erc_project_milestone`;
DROP TABLE IF EXISTS `tbl_erc_project_acceptance`;
DROP TABLE IF EXISTS `tbl_erc_project_evaluate`;
/*项目里程碑问题表*/
CREATE TABLE
IF NOT EXISTS `tbl_erc_project_milestone_problem`
(`milestone_problem_id` BIGINT NOT NULL auto_increment , `domain_id` BIGINT,
`project_milestone_id` VARCHAR
(30) NOT NULL, `problem_createdate` DATETIME, `problem_title` VARCHAR
(500), `proposer` VARCHAR
(100), `problem_description` TEXT, `deadline` DATETIME, `real_deadline` DATETIME, `problem_state` VARCHAR
(4) DEFAULT '1', `state` VARCHAR
(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY
(`milestone_problem_id`)) ENGINE=InnoDB;
/*项目收款申办表*/
CREATE TABLE
IF NOT EXISTS `tbl_erc_project_receipt`
(`project_receipt_id` BIGINT NOT NULL auto_increment , `domain_id` BIGINT, `project_info_id` VARCHAR
(30) NOT NULL, `r_createdate` DATETIME,`proposer` VARCHAR
(100) NOT NULL, `task_title` VARCHAR
(500), `r_priority` VARCHAR
(4) DEFAULT '1', `complete_time` DATETIME, `real_complete_time` DATETIME, `r_executor` VARCHAR
(50), `task_description` TEXT, `receipt_state` VARCHAR
(4) DEFAULT '1', `state` VARCHAR
(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY
(`project_receipt_id`)) ENGINE=InnoDB;
/*项目售后表*/
CREATE TABLE
IF NOT EXISTS `tbl_erc_project_aftersale`
(`project_aftersale_id` BIGINT NOT NULL auto_increment , `domain_id` BIGINT, `project_info_id` VARCHAR
(50) NOT NULL, `question_description` TEXT, `as_task` TEXT,  `proposer` VARCHAR
(100) NOT NULL,`executor` VARCHAR
(200) NOT NULL, `department_id` VARCHAR
(30), `aftersale_state` VARCHAR
(4) DEFAULT '1', `complate_hours` VARCHAR
(200),`deadline` DATETIME, `real_dealine` DATETIME, `state` VARCHAR
(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY
(`project_aftersale_id`)) ENGINE=InnoDB;

/*里程碑-负责人关联表*/
CREATE TABLE
IF NOT EXISTS `tbl_erc_project_milestone_participants`
(`project_participants_id` BIGINT NOT NULL auto_increment , `domain_id`
BIGINT, `project_info_id` VARCHAR
(30) NOT NULL, `project_milestone_id` VARCHAR
(30) NOT NULL, `user_id` VARCHAR
(30) NOT NULL, `state` VARCHAR
(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY
(`project_participants_id`)) ENGINE=InnoDB;

/*项目客户信息表*/
 CREATE TABLE IF NOT EXISTS `tbl_erc_project_customer` (`project_customer_id` BIGINT NOT NULL auto_increment , `domain_id` BIGINT, `business_registration_number` VARCHAR(50), `full_name` VARCHAR(50), `address` VARCHAR(100), `phone_number` VARCHAR(50), `tax_rate` VARCHAR(50), `legal_representative` VARCHAR(50), `legal_representative_phone` VARCHAR(50), `legal_representative_wecat` VARCHAR(50), `designated_contact_name` VARCHAR(50), `designated_contact_phone` VARCHAR(50), `designated_contact_wecat` VARCHAR(50), `designated_contact_qq` VARCHAR(50), `state` VARCHAR(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY (`project_customer_id`)) ENGINE=InnoDB;
/*项目信息表*/
CREATE TABLE IF NOT EXISTS `tbl_erc_project_info` (`project_info_id` BIGINT NOT NULL auto_increment , `domain_id` BIGINT, `project_number` VARCHAR(50), `project_name` VARCHAR(50), `project_address` VARCHAR(100), `project_customer_id` VARCHAR(30) NOT NULL, `customer_id` VARCHAR(30) NOT NULL, `project_state` VARCHAR(4) DEFAULT '1', `state` VARCHAR(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY (`project_info_id`)) ENGINE=InnoDB;
/*项目工作负责人关联表*/
 CREATE TABLE IF NOT EXISTS `tbl_erc_project_workleaders` (`project_workleaders_id` BIGINT NOT NULL auto_increment , `domain_id` BIGINT, `project_info_id` VARCHAR(30) NOT NULL, `user_id` VARCHAR(30) NOT NULL, `state` VARCHAR(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY (`project_workleaders_id`)) ENGINE=InnoDB;
/*关联人信息表*/
CREATE TABLE
IF NOT EXISTS `tbl_erc_associated_person`
(`associated_person_id` BIGINT NOT NULL auto_increment , `domain_id` BIGINT, `project_info_id` VARCHAR
(30) NOT NULL, `associated_name` VARCHAR
(50), `associated_birthday` DATETIME, `associated_phone` VARCHAR
(50), `associated_wecat` VARCHAR
(50), `associated_qq` VARCHAR
(50), `associated_hobby` TEXT, `role_descried` TEXT, `state` VARCHAR
(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY
(`associated_person_id`))
ENGINE=InnoDB;
/*关联人亲友信息表*/
CREATE TABLE
IF NOT EXISTS `tbl_erc_associated_relatives`
(`associated_relatives_id` BIGINT NOT NULL auto_increment , `domain_id` BIGINT, `associated_person_id` VARCHAR
(30) NOT NULL, `relative_name` VARCHAR
(50), `relationship` VARCHAR
(50), `relative_birthday` DATETIME, `relative_phone` VARCHAR
(50), `relative_wecat` VARCHAR
(50), `relative_qq` VARCHAR
(50), `relative_hobby` TEXT, `state` VARCHAR
(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY
(`associated_relatives_id`)) ENGINE=InnoDB;
/*关联人活动表*/
CREATE TABLE
IF NOT EXISTS `tbl_erc_associated_active`
(`associated_active_id` BIGINT NOT NULL auto_increment , `domain_id` BIGINT, `associated_person_id` BIGINT NOT NULL, `active_date` DATETIME, `active_name` VARCHAR
(200), `active_description` TEXT, `active_note` TEXT, `state` VARCHAR
(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY
(`associated_active_id`)) ENGINE=InnoDB;
/*关联人反馈表*/
CREATE TABLE IF NOT EXISTS `tbl_erc_associated_feedback` (`associated_feedback_id` BIGINT NOT NULL auto_increment , `domain_id` BIGINT, `associated_person_id` BIGINT NOT NULL, `feedback_date` DATETIME, `feedback_content` TEXT, `feedback_note` TEXT, `state` VARCHAR(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY (`associated_feedback_id`)) ENGINE=InnoDB;
/*项目推动分析记录表*/
CREATE TABLE IF NOT EXISTS `tbl_erc_project_analysis_record` (`project_analysis_record_id` BIGINT NOT NULL auto_increment , `domain_id` BIGINT, `project_info_id` VARCHAR(30) NOT NULL, `record_date` DATETIME, `active_descried` TEXT, `active_reflection` TEXT, `shortage` TEXT, `next_step` TEXT, `state` VARCHAR(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY (`project_analysis_record_id`)) ENGINE=InnoDB;
/*项目合同信息表*/
CREATE TABLE IF NOT EXISTS `tbl_erc_project_contract` (`project_contract_id` BIGINT NOT NULL auto_increment , `domain_id` BIGINT, `project_info_id` VARCHAR(30) NOT NULL, `contract_amount` VARCHAR(50), `payment_method` VARCHAR(50), `invoice_state` VARCHAR(4) DEFAULT '1', `contract_date` DATETIME, `contract_scan` VARCHAR(200), `project_photo`
VARCHAR(200), `state` VARCHAR(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY (`project_contract_id`)) ENGINE=InnoDB;
/*项目里程碑表*/
CREATE TABLE IF NOT EXISTS `tbl_erc_project_milestone` (`project_milestone_id` BIGINT NOT NULL auto_increment , `domain_id` BIGINT, `project_info_id` VARCHAR(30) NOT NULL, `milestone_date` DATETIME, `milestone_name` VARCHAR(200), `achievement` TEXT, `participants` VARCHAR(300), `acceptance_status` VARCHAR(4) DEFAULT '0', `acceptancetime` DATETIME, `state` VARCHAR(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY (`project_milestone_id`)) ENGINE=InnoDB;
/*项目验收信息表*/
CREATE TABLE IF NOT EXISTS `tbl_erc_project_acceptance` (`project_acceptance_id` BIGINT NOT NULL auto_increment , `domain_id` BIGINT, `project_info_id` VARCHAR(30) NOT NULL, `acceptance_date` DATETIME, `acceptor` VARCHAR(50), `acceptance_photo` VARCHAR(200), `acceptance_assess` TEXT, `state` VARCHAR(5) DEFAULT '1', `version` BIGINT NOT NULL
DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY (`project_acceptance_id`)) ENGINE=InnoDB;
/*项目评价表*/
CREATE TABLE IF NOT EXISTS `tbl_erc_project_evaluate` (`project_evaluate_id` BIGINT NOT NULL auto_increment , `domain_id` BIGINT, `project_info_id` VARCHAR(30) NOT NULL, `evaluator` VARCHAR(100), `evaluate_date` DATETIME, `evaluate_content` TEXT, `state` VARCHAR(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY (`project_evaluate_id`)) ENGINE=InnoDB;

/*收到票据管理*/
insert into tbl_common_systemmenu
      (systemmenu_name,node_type,parent_id,version,created_at,updated_at)
VALUES
      ('收到票据管理', '00', '0', 1, NOW(), NOW());
call Pro_AddMenu ('收到票据管理', '收到票据信息录入','/erc/billreceiptmanage/ERCBillReceiptControl','ERCBILLRECEIPTCONTROL');
-- call Pro_AddMenu ('收到票据管理', '票据背书转让确认','/erc/billreceiptmanage/ERCBillEndorseControl','ERCBILLENDORSECONTROL');
call Pro_AddMenu ('收到票据管理', '票据贴现收款确认','/erc/billreceiptmanage/ERCBillDiscountControl','ERCBILLDISCOUNTCONTROL');
call Pro_AddMenu ('收到票据管理', '票据兑收任务确认','/erc/billreceiptmanage/ERCBillRedemptControl','ERCBILLREDEMPTCONTROL');
/*收到票据信息表*/
DROP TABLE IF EXISTS `tbl_erc_bill_receipt`;
CREATE TABLE IF NOT EXISTS `tbl_erc_bill_receipt` (`bill_receipt_id` BIGINT NOT NULL auto_increment , `domain_id` BIGINT, `bill_declare_number` VARCHAR(200), `bill_number` VARCHAR(200), `bill_name` VARCHAR(100) DEFAULT '1', `bill_unit_style` VARCHAR(100), `bill_unit` VARCHAR(100),`bill_createdate` DATETIME, `bill_deadline` DATETIME, `bill_collector` VARCHAR(100), `bill_state` VARCHAR(10) DEFAULT '1', `bill_remark` VARCHAR(500),`bill_dealwith_remark` VARCHAR(500),  `operator_id` VARCHAR(100) NOT NULL,`approver_id` VARCHAR(100), `bill_receipt_style` VARCHAR(30), `cashier_style` VARCHAR(100), `cashier` VARCHAR(100), `amount` VARCHAR(200), `actual_amount` VARCHAR(200),`bank_card_number` VARCHAR(200), `comfirm_state` VARCHAR(4) DEFAULT '0', `complete_state` VARCHAR(4) DEFAULT '0',`state` VARCHAR(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY (`bill_receipt_id`)) ENGINE=InnoDB;
insert into tbl_common_systemmenu
      (systemmenu_name,node_type,parent_id,version,created_at,updated_at)
VALUES
      ('开出票据管理', '00', '0', 1, NOW(), NOW());
call Pro_AddMenu ('开出票据管理', '开出票据信息录入','/erc/billOutmanage/ERCBillOutControl','ERCBILLOUTCONTROL');
call Pro_AddMenu ('开出票据管理', '票据兑付任务确认','/erc/billOutmanage/ERCBillRedeemControl','ERCBILLREDEEMCONTROL');
/*开出票据表*/
DROP TABLE IF EXISTS `tbl_erc_bill_out`;
CREATE TABLE IF NOT EXISTS `tbl_erc_bill_out` (`bill_out_id` BIGINT NOT NULL auto_increment , `domain_id` BIGINT, `bill_declare_number` VARCHAR(200), `bill_number` VARCHAR(200), `bill_name` VARCHAR(100) DEFAULT '1', `bill_unit_style` VARCHAR(100), `bill_unit` VARCHAR(100), `bill_createdate` DATETIME, `bill_deadline` DATETIME, `bill_collector` VARCHAR(100), `bill_state` VARCHAR(10) DEFAULT '1', `bill_remark` VARCHAR(500), `bill_dealwith_remark` VARCHAR(500), `operator_id` VARCHAR(100) NOT NULL, `approver_id` VARCHAR(100), `bill_out_style` VARCHAR(30), `cashier_style` VARCHAR(100), `cashier` VARCHAR(100), `amount` VARCHAR(200), `actual_amount` VARCHAR(200), `bank_card_number` VARCHAR(200), `comfirm_state` VARCHAR(4) DEFAULT '0', `complete_state` VARCHAR(4) DEFAULT '0', `state` VARCHAR(5) DEFAULT '1', `version` BIGINT NOT NULL DEFAULT 0, `created_at` DATETIME NOT NULL, `updated_at` DATETIME NOT NULL, PRIMARY KEY (`bill_out_id`)) ENGINE=InnoDB;

//审批流
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at) values(219 , '收到票据背书转让申请' , '分配背书转让申请审核人员', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at) values(222 , '开出票据申请' , '分配开出票据申请审核人员', now(), now());