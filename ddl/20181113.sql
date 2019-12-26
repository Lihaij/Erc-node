SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* nie */
-- test

call Pro_AddMenu('system', '公司资料维护','/erc/baseconfig/ERCCompanyControl','ERCCOMPANYCONTROL');
call Pro_AddMenu('生产计划管理', '生产主计划列表','/erc/productionmanage/ERCProductPlanExecuteControl','ERCPRODUCTPLANEXECUTECONTROL');
call Pro_AddMenu('出纳管理', '资金费用汇总表','/erc/cashiermanage/ERCSpecialExpenseGatheringSumControl','ERCSPECIALEXPENSEGATHERINGSUMCONTROL');
call Pro_AddMenu('出纳管理', '资金费用记账凭证','/erc/cashiermanage/ERCRecordingVoucherSCControl','ERCRECORDINGVOUCHERSCCONTROL');
call Pro_AddMenu('出纳管理', '总账分类','/erc/cashiermanage/ERCGeneralLedgerControl','ERCGENERALLEDGERCONTROL');
call Pro_AddMenu('出纳管理', '手工记账凭证','/erc/cashiermanage/ERCRecordingVoucherCustomControl','ERCRECORDINGVOUCHERCUSTOMCONTROL');

call Pro_AddMenu('客户管理', '客户维护','/erc/baseconfig/ERCCustomerBControl','ERCCUSTOMERBCONTROL');
call Pro_AddMenu('生产管理', '排产主计划','/erc/productionmanage/ERCPPMasterControl','ERCPPMASTERCONTROL');
call Pro_AddMenu('生产管理', '生产派工单','/erc/productionmanage/ERCProductDesignateControl','ERCPRODUCTDESIGNATECONTROL');
call Pro_AddMenu('生产管理', '投料变更','/erc/productionmanage/ERCFeedChangeControl','ERCFEEDCHANGECONTROL');
call Pro_AddMenu('生产管理', '异常停线管理','/erc/productionmanage/ERCStopLineControl','ERCSTOPLINECONTROL');
call Pro_AddMenu('生产管理', '生产任务变更','/erc/productionmanage/ERCProductiveTaskChangeControl','ERCPRODUCTIVETASKCHANGECONTROL');
call Pro_AddMenu('生产管理', '物料报废申请','/erc/productionmanage/ERCScrapControl','ERCSCRAPCONTROLSRV');
call Pro_AddMenu('生产管理', '生产日计划','/erc/productionmanage/ERCPPMasterDayControl','ERCPPMASTERDAYCONTROL');
call Pro_AddMenu('生产管理', '生产周计划','/erc/productionmanage/ERCPPMasterWeekControl','ERCPPMASTERWEEKCONTROL');
call Pro_AddMenu('生产管理', '跟线生产单','/erc/productionmanage/ERCPPMasterReceiveControl','ERCPPMASTERRECEIVECONTROL');
call Pro_AddMenu('生产管理', '日计划影响因素','/erc/productionmanage/ERCStopLineGatherControl','ERCSTOPLINEGATHERCONTROL');
call Pro_AddMenu('生产管理', '改善措施跟进','/erc/productionmanage/ERCStopLineImproveControl','ERCSTOPLINEIMPROVECONTROL');



ALTER TABLE `tbl_erc_productionprocedure` ADD COLUMN `procedure_coefficient` DOUBLE AFTER `domain_id`;
ALTER TABLE `tbl_erc_productivetask` ADD COLUMN `taskdesign_price` DOUBLE AFTER `productivetask_state`;
ALTER TABLE `tbl_erc_fixedassetscheckdetail` ADD COLUMN `original_value` DOUBLE AFTER `fixedassetspurchdetail_id`;
ALTER TABLE `tbl_erc_fixedassetscheckdetail` ADD COLUMN `monthly_depreciation` DOUBLE AFTER `original_value`;
ALTER TABLE `tbl_erc_taskallotuser` ADD COLUMN `islastpost` DOUBLE DEFAULT '0' AFTER `customtaskallot_id`;
ALTER TABLE `tbl_erc_department` ADD COLUMN `department_type` varchar(10) DEFAULT '' AFTER `department_state`;
ALTER TABLE `tbl_erc_specialexpense` ADD COLUMN `payment_method` varchar(10) DEFAULT null AFTER `s_capital_cost_type`;
ALTER TABLE `tbl_erc_specialexpense` ADD COLUMN `monetary_fund_type` varchar(10) DEFAULT null AFTER `payment_method`;
ALTER TABLE `tbl_erc_specialexpense` ADD COLUMN `bank_account` varchar(100) DEFAULT null AFTER `monetary_fund_type`;
ALTER TABLE `tbl_erc_cashiergathering` ADD COLUMN `payment_method` varchar(10) DEFAULT null AFTER `cashiergathering_refuse_remark`;
ALTER TABLE `tbl_erc_cashiergathering` ADD COLUMN `monetary_fund_type` varchar(10) DEFAULT null AFTER `payment_method`;
ALTER TABLE `tbl_erc_cashiergathering` ADD COLUMN `bank_account` varchar(100) DEFAULT null AFTER `monetary_fund_type`;
ALTER TABLE `tbl_erc_recordingvoucherdetailsc` ADD COLUMN `recordingvoucherdetailsc_type` varchar(5) DEFAULT null AFTER `recordingvoucherdetailsc_credit`;
ALTER TABLE `tbl_erc_recordingvoucherdetailsc` ADD COLUMN `recordingvoucherdetailsc_GLtype` varchar(5) DEFAULT null AFTER `recordingvoucherdetailsc_type`;
ALTER TABLE `tbl_erc_recordingvoucherdetailsc` ADD COLUMN `domain_id` bigint(20) DEFAULT null AFTER `recordingvoucherdetailsc_GLtype`;
ALTER TABLE `tbl_erc_recordingvoucherdetailsc` ADD COLUMN `recordingvoucherdetailsc_depart_id` varchar(10) DEFAULT null AFTER `domain_id`;
ALTER TABLE `tbl_erc_recordingvoucherdetailsc` ADD COLUMN `recordingvoucherdetailsc_accsum_code` varchar(20) DEFAULT null AFTER `recordingvoucherdetailsc_activeAccount`;
ALTER TABLE `tbl_erc_recordingvoucherdetailsc` ADD COLUMN `recordingvoucherdetailsc_activeAccount_code` varchar(20) DEFAULT null AFTER `recordingvoucherdetailsc_accsum_code`;
ALTER TABLE `tbl_erc_recordingvouchersc` ADD COLUMN `recordingvouchersc_user_id` varchar(100) DEFAULT null AFTER `s_recordingvouchersc_type`;
ALTER TABLE `tbl_erc_recordingvouchersc` ADD COLUMN `recordingvouchersc_state` INTEGER DEFAULT 0 AFTER `recordingvouchersc_user_id`;
ALTER TABLE `tbl_erc_recordingvouchersc` ADD COLUMN `recordingvouchersc_examine_time` datetime(4) DEFAULT null AFTER `recordingvouchersc_state`;
ALTER TABLE `tbl_erc_recordingvouchersc` ADD COLUMN `recordingvouchersc_examine` varchar(100) DEFAULT null AFTER `recordingvouchersc_examine_time`;
ALTER TABLE `tbl_erc_recordingvouchersc` ADD COLUMN `recordingvouchersc_refuse_remark` varchar(300) DEFAULT null AFTER `recordingvouchersc_examine`;
ALTER TABLE `tbl_erc_paymentconfirm` ADD COLUMN `payment_method` varchar(10) DEFAULT null AFTER `paymentconfirm_examine_time`;
ALTER TABLE `tbl_erc_paymentconfirm` ADD COLUMN `monetary_fund_type` varchar(10) DEFAULT null AFTER `payment_method`;
ALTER TABLE `tbl_erc_paymentconfirm` ADD COLUMN `bank_account` varchar(100) DEFAULT null AFTER `monetary_fund_type`;
ALTER TABLE `tbl_erc_paymentconfirm` ADD COLUMN `paymentconfirm_no_invoice_fee` DOUBLE DEFAULT 0 AFTER `paymentconfirm_money`;
ALTER TABLE `tbl_erc_paymentconfirm` ADD COLUMN `paymentconfirm_have_invoice_fee` DOUBLE DEFAULT 0 AFTER `paymentconfirm_no_invoice_fee`;
ALTER TABLE `tbl_erc_paymentconfirm` ADD COLUMN `s_expense_type_id` varchar(10) DEFAULT null AFTER `bank_account`;
ALTER TABLE `tbl_erc_order` ADD COLUMN `order_review_state` varchar(4) DEFAULT null AFTER `send_creditline_state`;
ALTER TABLE `tbl_erc_cashiergathering` ADD COLUMN `cashiergathering_order_id` varchar(100) DEFAULT null AFTER `bank_account`;
ALTER TABLE `tbl_erc_cashiergathering` ADD COLUMN `cashiergathering_order_balance` DOUBLE DEFAULT 0 AFTER `cashiergathering_gathering_money`;

ALTER TABLE `tbl_erc_producepricetemplatedetail` ADD COLUMN `price_xssysl` varchar(30) DEFAULT null AFTER `price_state`;
ALTER TABLE `tbl_erc_producepricetemplatedetail` ADD COLUMN `price_jgqyxddj` varchar(30) DEFAULT null AFTER `price_xssysl`;

ALTER TABLE `tbl_erc_corporateclients` ADD COLUMN `corporateclients_scope` varchar(5) DEFAULT null AFTER `corporateclients_class`;

ALTER TABLE `tbl_erc_creditlinedetail` ADD COLUMN `creditlinedetail_detail_type` varchar(5) DEFAULT null AFTER `creditlinedetail_surplus_advance`;

ALTER TABLE `tbl_erc_supplier` ADD COLUMN `supplier_class` varchar(5) DEFAULT null AFTER `supplier_remarks`;
ALTER TABLE `tbl_erc_supplier` ADD COLUMN `supplier_tax_rate` DOUBLE DEFAULT null AFTER `supplier_class`;
ALTER TABLE `tbl_erc_supplier` ADD COLUMN `supplier_way` varchar(5) DEFAULT null AFTER `supplier_tax_rate`;
ALTER TABLE `tbl_erc_supplier` ADD COLUMN `supplier_advance_ratio` DOUBLE DEFAULT null AFTER `supplier_way`;
ALTER TABLE `tbl_erc_supplier` ADD COLUMN `supplier_number_days` INTEGER DEFAULT null AFTER `supplier_advance_ratio`;


ALTER TABLE `tbl_erc_suppliermateriel` ADD COLUMN `suppliermateriel_currency_price` DOUBLE DEFAULT 0 AFTER `suppliermateriel_priceeffective`;
ALTER TABLE `tbl_erc_suppliermateriel` ADD COLUMN `suppliermateriel_begin_time` datetime(4) null AFTER `suppliermateriel_currency_price`;
ALTER TABLE `tbl_erc_suppliermateriel` ADD COLUMN `suppliermateriel_shortest_days` INTEGER DEFAULT 0 AFTER `suppliermateriel_begin_time`;

ALTER TABLE `tbl_erc_fixedassetscheckdetail` ADD COLUMN `fixedassets_number` INTEGER DEFAULT 0 AFTER `monthly_depreciation`;
ALTER TABLE `tbl_erc_fixedassetscheckdetail` ADD COLUMN `fixedassets_price` INTEGER DEFAULT 0 AFTER `fixedassets_number`;
ALTER TABLE `tbl_erc_fixedassetscheckdetail` ADD COLUMN `fixedassets_money` INTEGER DEFAULT 0 AFTER `fixedassets_price`;

ALTER TABLE `tbl_erc_fixedassetspurchdetail` ADD COLUMN `fixedassets_number` INTEGER DEFAULT 0 AFTER `fixedassetscheck_acceptance`;
ALTER TABLE `tbl_erc_fixedassetspurchdetail` ADD COLUMN `fixedassets_price` INTEGER DEFAULT 0 AFTER `fixedassets_number`;
ALTER TABLE `tbl_erc_fixedassetspurchdetail` ADD COLUMN `fixedassets_money` INTEGER DEFAULT 0 AFTER `fixedassets_price`;

ALTER TABLE `tbl_erc_materiel` ADD COLUMN `materiel_supply_cycle` INTEGER DEFAULT 0 AFTER `materiel_min_purchase_num`;
ALTER TABLE `tbl_erc_reviewmateriel` ADD COLUMN `review_materiel_supply_cycle` INTEGER DEFAULT 0 AFTER `review_materiel_min_purchase_num`;


ALTER TABLE `tbl_erc_project` ADD COLUMN `project_province` varchar(50) DEFAULT null AFTER `project_check_state`;
ALTER TABLE `tbl_erc_project` ADD COLUMN `project_city` varchar(50) DEFAULT null AFTER `project_province`;
ALTER TABLE `tbl_erc_project` ADD COLUMN `project_district` varchar(50) DEFAULT null AFTER `project_city`;
ALTER TABLE `tbl_erc_project` ADD COLUMN `project_estate_name` varchar(50) DEFAULT null AFTER `project_district`;

ALTER TABLE `tbl_erc_task` ADD COLUMN `require_complate_time` DATE DEFAULT null AFTER `customtaskallot_id`;

ALTER TABLE `tbl_erc_productivetask` ADD COLUMN `department_id` varchar(50) DEFAULT null AFTER `taskdesign_price`;
ALTER TABLE `tbl_erc_productivetask` ADD COLUMN `procedure_id` INTEGER DEFAULT 0 AFTER `workshop_id`;

ALTER TABLE `tbl_erc_company` ADD COLUMN `company_dayoff_type` varchar(20) DEFAULT 1 AFTER `company_piece_amount`;
ALTER TABLE `tbl_erc_productivetaskdetail` ADD COLUMN `taskdetailprd_batch` INTEGER DEFAULT 1 AFTER `taskdetailprd_level`;
ALTER TABLE `tbl_erc_productivetask` ADD COLUMN `change_state` varchar(20) DEFAULT 0 AFTER `procedure_id`;
ALTER TABLE `tbl_erc_productivetaskdetail` ADD COLUMN `taskdetailprd_remark` varchar(500) DEFAULT 0 AFTER `taskdetailprd_batch`;
ALTER TABLE `tbl_erc_productivetaskdetail` ADD COLUMN `change_state` varchar(20) DEFAULT 0 AFTER `taskdetailprd_remark`;
ALTER TABLE `tbl_erc_productivetaskdetail` ADD COLUMN `design_number` INTEGER DEFAULT 0 AFTER `taskdetaildesign_number`;
ALTER TABLE `tbl_erc_productivetask` ADD COLUMN `outsource_sign` varchar(5) DEFAULT 0 AFTER `change_state`;

ALTER TABLE `tbl_erc_purchaseapply` ADD COLUMN `apply_supplier` varchar(20) DEFAULT '' AFTER `order_type`;
ALTER TABLE `tbl_erc_purchaseapply` ADD COLUMN `productivetask_code` varchar(50) DEFAULT '' AFTER `apply_supplier`;

ALTER TABLE `tbl_erc_ppmaster` ADD COLUMN `ppmaster_check_materiel_state` INTEGER DEFAULT 0 AFTER `ppmaster_residue_number`;
ALTER TABLE `tbl_erc_ppmaster` ADD COLUMN `ppmaster_check_device_state` INTEGER DEFAULT 0 AFTER `ppmaster_check_materiel_state`;
ALTER TABLE `tbl_erc_ppmaster` ADD COLUMN `ppmaster_check_person_state` INTEGER DEFAULT 0 AFTER `ppmaster_check_device_state`;
ALTER TABLE `tbl_erc_ppmaster` ADD COLUMN `ppmaster_user_id` varchar(50) DEFAULT '' AFTER `ppmaster_check_person_state`;

insert into tbl_erc_basetype value (2,'HBZJLX','货币资金类型',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (3,'JZBWB','记账本位币',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (4,'WB','外币',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');

insert into tbl_erc_basetype value (5,'FYBX','费用报销事由',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (7,'YFZGXC','应付职工薪酬',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (8,'YJSF','应交税费',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (10,'LRFP','利润分配',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (11,'QTYWSR','其他业务收入',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (12,'YYWSR','营业外收入',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (13,'QTYWCB','其它业务成本',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (14,'YYSJJFJ','营业税金及附加',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');

insert into tbl_erc_basetype value (15,'QYZZSLX','企业增值税类型',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (16,'QYSDSLX','企业所得税类型',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (17,'QYXZ','企业性质',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (18,'YHZHFL','银行账号分类',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (19,'HJFL','核价分类',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (20,'WLZTFL','物料状态分类',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (21,'WLLYFL','物料来源分类',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (22,'WLGLMSFL','物料管理模式分类',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (23,'FPLX','发票类型',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (24,'FYLKMXT','费用类科目形态',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (25,'BFBZ','报废标志',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (26,'CQZCXSFL','长期资产形式分类',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (27,'CQZCXZFL','长期资产性质分类',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (28,'JSFS','结算方式',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (29,'XL','学历',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (30,'JCFS','计酬方式',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (31,'ZSJDFYBXMS','住宿接待费用报销模式',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (32,'GSPCFYBSMS','公司派车费用报销模式',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (33,'GGJTGJFL','公共交通工具分类',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (34,'JQFL','假期分类',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (35,'HYZK','婚姻状况',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (36,'CWFY','财务费用',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (37,'JGQYXDDJ','价格启用选定单据',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (38,'CKFL','仓库分类',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');

insert into tbl_erc_basetype value (100,'JLDW','计量单位',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (101,'HBLX','货币类型',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (103,'GRSYSL','购入适用税率',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (104,'XSSYSL','销售适用税率',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (105,'FYLKMMXXM','费用类科目明细项目',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (106,'SCGXFL','生产工序分类',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (107,'GYSLB','供应商类别',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');
insert into tbl_erc_basetype value (108,'KHLB','客户类别',1,1,'2018-07-31 15:38:31','2018-07-31 15:38:31');

insert into seqmysql values ('SpecialExpenseSumSeq',1,1,99999999);
insert into seqmysql values ('CashiergatheringSumSeq',1,1,99999999);
insert into seqmysql values ('RecordingVoucherSSeq',1,1,99999999);
insert into seqmysql values ('RecordingVoucherCSeq',1,1,99999999);
insert into seqmysql values ('SupplierSeq',1,1,99999999);
insert into seqmysql values ('RecordingVoucherSGSeq',1,1,99999999);
insert into seqmysql values ('productdesignateIDSeq',1,1,99999999);
insert into seqmysql values ('stoplineIDSeq',1,1,99999999);
insert into seqmysql values ('scrapIDSeq',1,1,99999999);
insert into seqmysql values ('productreceiveIDSeq',1,1,99999999);
insert into seqmysql values ('stopLineImproveIDSeq',1,1,99999999);

delete from tbl_erc_basetype where basetype_code in ('JZBWB','WB');
update tbl_erc_basetype set basetype_name = '费用类科目明细项目' where basetype_code = 'FYBX';
update tbl_erc_basetype set basetype_name = '货币类型' where basetype_code = 'HBZJLX';

insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(67 , '手工记账凭证新增审核任务' , '手工记账凭证新请求', now(), now());

insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(68 , '会计科目详情新增审核任务' , '会计科目详新请求', now(), now());

insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(85 , '生产派工单任务' , '生产派工单新增', now(), now());

insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(90 , '投料变更任务' , '投料变更任务', now(), now());

insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(91 , '异常停线任务' , '异常停线任务', now(), now());

insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(92 , '生产任务单转采购审核任务' , '生产任务单转采购审核任务', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(93 , '生产投料报废审核任务' , '生产投料报废审核任务', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(94 , '跟线生产任务' , '跟线生产任务', now(), now());
      
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(96 , '日计划影响因素,实施责任人改善措施' , '日计划影响因素,实施责任人改善措施', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(97 , '日计划影响因素,监督人改善措施' , '日计划影响因素,监督人改善措施', now(), now());


update tbl_erc_taskallot set taskallot_name='人工派发任务',taskallot_describe='人工派发任务' where taskallot_id=1

DROP TABLE IF EXISTS `tbl_erc_product_plan_execute`;
CREATE TABLE `tbl_erc_product_plan_execute` (
  `product_plan_execute_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `m1_materiel_code` varchar(255) DEFAULT NULL,
  `m1_materiel_name` varchar(255) DEFAULT NULL,
  `m1_materiel_id` varchar(255) DEFAULT NULL,
  `m2_materiel_code` varchar(255) DEFAULT NULL,
  `m2_materiel_name` varchar(255) DEFAULT NULL,
  `m2_materiel_id` varchar(255) DEFAULT NULL,
  `order_id` varchar(255) DEFAULT NULL,
  `productivetask_code` varchar(255) DEFAULT NULL,
  `productivetask_state` varchar(255) DEFAULT NULL,
  `workshop_id` varchar(255) DEFAULT NULL,
  `department_name` varchar(255) DEFAULT NULL,
  `product_level` varchar(255) DEFAULT NULL,
  `procedure_name` varchar(255) DEFAULT NULL,
  `priority` varchar(255) DEFAULT NULL,
  `productivetask_id` varchar(255) DEFAULT NULL,
  `product_id` varchar(255) DEFAULT NULL,
  `taskdesign_number` varchar(255) DEFAULT NULL,
  `end_date` varchar(255) DEFAULT NULL,
  `begin_date` varchar(255) DEFAULT NULL,
  `UUID` varchar(255) DEFAULT NULL,
  `prod_end_date` varchar(255) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`product_plan_execute_id`)
);

DROP TABLE IF EXISTS `tbl_erc_cashiergatheringsum`;
CREATE TABLE `tbl_erc_cashiergatheringsum` (
  `cashiergatheringsum_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `cashiergatheringsum_code` varchar(100) DEFAULT NULL,
  `cashiergatheringsum_depart_id` varchar(100) DEFAULT NULL,
  `cashiergatheringsum_time` varchar(100) DEFAULT NULL,
  `cashiergatheringsum_content` varchar(100) DEFAULT NULL,
  `cashiergatheringsum_amount` varchar(100) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`cashiergatheringsum_id`)
);

DROP TABLE IF EXISTS `tbl_erc_specialexpensesum`;
CREATE TABLE `tbl_erc_specialexpensesum` (
  `s_expense_sum_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `s_expense_sum_code` varchar(100) DEFAULT NULL,
  `s_expense_sum_depart_id` varchar(100) DEFAULT NULL,
  `s_expense_sum_time` varchar(100) DEFAULT NULL,
  `s_expense_sum_content` varchar(100) DEFAULT NULL,
  `s_expense_sum_amount` varchar(100) DEFAULT NULL,
  `s_no_invoice_sum_fee` double DEFAULT '0',
  `s_have_invoice_sum_fee` double DEFAULT '0',
  `s_capital_cost_sum_type` int(11) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`s_expense_sum_id`)
);

DROP TABLE IF EXISTS `tbl_erc_recordingvouchersc`;
CREATE TABLE `tbl_erc_recordingvouchersc` (
  `recordingvouchersc_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `recordingvouchersc_code` varchar(30) NOT NULL,
  `domain_id` bigint(20) NOT NULL,
  `recordingvouchersc_depart_id` varchar(100) DEFAULT NULL,
  `recordingvouchersc_time` varchar(100) DEFAULT NULL,
  `recordingvouchersc_count` int(11) DEFAULT NULL,
  `recordingvouchersc_type` varchar(5) DEFAULT NULL,
  `s_recordingvouchersc_type` int(11) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`recordingvouchersc_id`)
);

DROP TABLE IF EXISTS `tbl_erc_recordingvoucherdetailsc`;
CREATE TABLE `tbl_erc_recordingvoucherdetailsc` (
  `recordingvoucherdetailsc_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `recordingvouchersc_id` varchar(30) NOT NULL,
  `recordingvoucherdetailsc_digest` varchar(100) DEFAULT NULL,
  `recordingvoucherdetailsc_accsum` varchar(100) DEFAULT NULL,
  `recordingvoucherdetailsc_activeAccount` varchar(100) DEFAULT NULL,
  `recordingvoucherdetailsc_debite` varchar(100) DEFAULT NULL,
  `recordingvoucherdetailsc_credit` varchar(100) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`recordingvoucherdetailsc_id`)
);

DROP TABLE IF EXISTS `tbl_erc_company`;
CREATE TABLE `tbl_erc_company` (
  `company_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `company_code` varchar(50) DEFAULT NULL,
  `company_name` varchar(50) DEFAULT NULL,
  `company_business_scope` varchar(150) DEFAULT NULL,
  `company_main_business` varchar(150) DEFAULT NULL,
  `company_legal` varchar(50) DEFAULT NULL,
  `company_legal_no` varchar(50) DEFAULT NULL,
  `company_agency_phone` varchar(30) DEFAULT NULL,
  `company_ERC_name` varchar(30) DEFAULT NULL,
  `company_ERC_phone` varchar(50) DEFAULT NULL,
  `company_ERC_QQ` varchar(50) DEFAULT NULL,
  `company_province` varchar(50) DEFAULT NULL,
  `company_city` varchar(50) DEFAULT NULL,
  `company_area` varchar(50) DEFAULT NULL,
  `company_adress` varchar(150) DEFAULT NULL,
  `company_recording_currency` varchar(50) DEFAULT NULL,
  `company_foreign` varchar(50) DEFAULT NULL,
  `company_precision` varchar(50) DEFAULT NULL,
  `company_profit_pursuit` varchar(50) DEFAULT NULL,
  `company_advance_date` varchar(50) DEFAULT NULL,
  `company_recognition_criteria` varchar(50) DEFAULT NULL,
  `company_service_purchase_criteria` varchar(50) DEFAULT NULL,
  `company_property_purchase_criteria` varchar(50) DEFAULT NULL,
  `company_complex_supplier_number` varchar(50) DEFAULT NULL,
  `company_piece_amount` varchar(50) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`company_id`)
);

DROP TABLE IF EXISTS `tbl_erc_companybankno`;
CREATE TABLE `tbl_erc_companybankno` (
  `companybankno_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `company_id` bigint(20) DEFAULT NULL,
  `companybankno_name` varchar(100) DEFAULT NULL,
  `companybankno_open` varchar(100) DEFAULT NULL,
  `companybankno_bank_no` varchar(150) DEFAULT NULL,
  `companybankno_type` varchar(5) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`companybankno_id`)
);

DROP TABLE IF EXISTS `tbl_erc_productdesignate`;
CREATE TABLE `tbl_erc_productdesignate` (
  `productdesignate_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `productdesignate_code` varchar(100) DEFAULT NULL,
  `productdesignate_user_id` varchar(50) DEFAULT NULL,
  `productdesignate_procedure_id` varchar(30) DEFAULT NULL,
  `productdesignate_number` bigint(20) DEFAULT '0',
  `productdesignate_m_equipment` varchar(30) DEFAULT NULL,
  `productdesignate_a_equipment` varchar(30) DEFAULT NULL,
  `productdesignate_date` varchar(255) DEFAULT NULL,
  `productdesignate_remark` varchar(255) DEFAULT NULL,
  `productdesignate_state` varchar(255) DEFAULT NULL,
  `productdesignate_examine_time` datetime DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`productdesignate_id`)
);


/*end nie */
/*
  qm start
*/

ALTER TABLE tbl_erc_stockmap ADD COLUMN store_price double NUll DEFAULT '0' AFTER `trigger_idle_scan`;
ALTER TABLE tbl_erc_stockitem ADD COLUMN store_price double NUll DEFAULT '0' AFTER `item_amount`;

/*
  add your ddl
*/
