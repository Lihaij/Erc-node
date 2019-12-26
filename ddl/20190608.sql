SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE `tbl_erc_productivetask` ADD COLUMN `biz_code` varchar(50) DEFAULT NULL AFTER `procedure_level`;
ALTER TABLE `tbl_erc_purchaseorder` ADD COLUMN `biz_code` varchar(50) DEFAULT NULL AFTER `delivery_date`;
ALTER TABLE `tbl_erc_order` ADD COLUMN `biz_code` varchar(50) DEFAULT NULL AFTER `order_delivery_date`;
ALTER TABLE `tbl_erc_basetypedetail` ADD COLUMN `other_type` varchar(5) DEFAULT NULL AFTER `typedetail_name`;

ALTER TABLE `tbl_erc_alldemand` ADD COLUMN `mrp_state` varchar(5) DEFAULT NULL AFTER `mrp_domain_id`;
ALTER TABLE `tbl_erc_netdemand` ADD COLUMN `mrp_state` varchar(5) DEFAULT NULL AFTER `mrp_domain_id`;
ALTER TABLE `tbl_erc_ppmasterdaydevicetemp` ADD COLUMN `productdevice_id` BIGINT DEFAULT NULL AFTER `fixedassetscheckdetail_id`;
ALTER TABLE `tbl_erc_productivetask` ADD COLUMN `materiel_code` varchar(100) DEFAULT NULL AFTER `biz_code`;

/*
    bb add amortize_surplus_mos 剩余摊销金额
**/
ALTER TABLE `tbl_erc_amortize`
ADD COLUMN `amortize_surplus_money` DOUBLE NULL DEFAULT 0 AFTER `amortize_surplus_mos`;

ALTER TABLE `tbl_erc_productivetaskdetail` ADD COLUMN `productivetask_biz_code` varchar(50) DEFAULT NULL AFTER `stock_out_state`;
ALTER TABLE `tbl_erc_productivetaskrelated` ADD COLUMN `productivetask_biz_code` varchar(50) DEFAULT NULL AFTER `taskrelated_type`;
ALTER TABLE `tbl_erc_recordingvoucherdetailsc` ADD COLUMN `recordingvoucherdetailsc_carryover_state` varchar(10) DEFAULT 0 AFTER `recordingvoucherdetailsc_depart_id`;

CREATE TABLE `tbl_erc_productivetaskprocess` (
  `productivetaskprocess_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `productivetask_id` bigint(20) DEFAULT NULL,
  `productivetask_code` varchar(50) DEFAULT NULL,
  `department_id` varchar(50) DEFAULT NULL,
  `procedure_id` varchar(30) DEFAULT NULL,
  `procedure_level` varchar(5) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`productivetaskprocess_id`)
) ENGINE=InnoDB AUTO_INCREMENT=225 DEFAULT CHARSET=utf8


ALTER TABLE `tbl_erc_purchaseapplydetail` ADD COLUMN `apply_number_done` INTEGER NULL DEFAULT 0 AFTER `apply_number`;
ALTER TABLE `tbl_erc_purchaseapplydetail` ADD COLUMN `apply_number_now` INTEGER NULL DEFAULT 0 AFTER `apply_number_done`;
ALTER TABLE `tbl_erc_purchaseapply` ADD COLUMN `biz_code` varchar(50) DEFAULT '' AFTER `productivetask_code`;
ALTER TABLE `tbl_erc_purchaseapplydetail` ADD COLUMN `supplier_id_now` varchar(50) NULL DEFAULT '' AFTER `apply_number_now`;
ALTER TABLE `tbl_erc_productivetask` ADD COLUMN `ppmaster_begin_time` DATETIME NULL  AFTER `materiel_code`;
ALTER TABLE `tbl_erc_productivetask` ADD COLUMN `ppmaster_end_time` DATETIME NULL  AFTER `ppmaster_begin_time`;

ALTER TABLE `tbl_erc_financerecord` ADD COLUMN `whether_RD` INTEGER NULL DEFAULT 0  AFTER `total_price`;
ALTER TABLE `tbl_erc_financerecorditem` ADD COLUMN `whether_RD` INTEGER NULL DEFAULT 0  AFTER `store_price`;
ALTER TABLE `tbl_erc_recordingvouchersc` ADD COLUMN `recordingvouchersc_wms_type` varchar(50) NULL DEFAULT ''  AFTER `recordingvouchersc_refuse_remark`;
ALTER TABLE `tbl_erc_recordingvouchersc` ADD COLUMN `recordingvouchersc_wms_organization` varchar(300) NULL DEFAULT ''  AFTER `recordingvouchersc_wms_type`;
ALTER TABLE `tbl_erc_recordingvouchersc` ADD COLUMN `biz_code` varchar(100) NULL DEFAULT ''  AFTER `recordingvouchersc_wms_organization`;

ALTER TABLE `tbl_erc_productionprocedure` ADD COLUMN `default_capacity` INTEGER NULL DEFAULT 0  AFTER `biz_code`;
ALTER TABLE `tbl_erc_fixedassetspurch` ADD COLUMN `biz_code` varchar(50) DEFAULT '' AFTER `purch_refuse_remark`;

ALTER TABLE `tbl_erc_fixedassetsrepairmaterials` ADD COLUMN `repair_number` DOUBLE NULL DEFAULT 0  AFTER `repair_price`;
ALTER TABLE `tbl_erc_fixedassetscheckdetail` ADD COLUMN `fixedassets_device` varchar(4) NULL DEFAULT '0'  AFTER `fixedassets_type`;
ALTER TABLE `tbl_erc_fixedassetscheckdetail` ADD COLUMN `fixedassets_supplier_id` varchar(30) NULL DEFAULT ''  AFTER `fixedassets_device`;
ALTER TABLE `tbl_erc_consumablesdetail` ADD COLUMN `consumables_supplier_id` varchar(30) NULL DEFAULT ''  AFTER `consumables_purch_detail_id`;

ALTER TABLE `tbl_erc_order` ADD COLUMN `order_review_date` varchar(50) NULL DEFAULT ''  AFTER `order_review_state`;

ALTER TABLE `tbl_erc_vehicle` ADD COLUMN `fixedassetscheckdetail_id` BIGINT NULL  AFTER `admin_user_id`;

ALTER TABLE `tbl_erc_paymentconfirm` ADD COLUMN `paymentconfirm_expend_user_type` varchar(5) NULL DEFAULT ''  AFTER `s_expense_type_id`;
ALTER TABLE `tbl_erc_purchaseapply` ADD COLUMN `data_source` varchar(5) NULL DEFAULT ''  AFTER `biz_code`;


call Pro_AddMenu('财务管理', '计提记账凭证', '/erc/cashiermanage/ERCRecordingVoucherJTControl','ERCRECORDINGVOUCHERJTCONTROL');
call Pro_AddMenu('财务管理', '其他收款管理', '/erc/cashiermanage/ERCOtherCollectionControl','ERCOTHERCOLLECTIONCONTROL');
call Pro_AddMenu('财务管理', '资金账户调整', '/erc/cashiermanage/ERCCapitalAccountChangeControl','ERCCAPITALACCOUNTCHANGECONTROL');

call Pro_AddMenu('行政办公管理', '借款申请', '/erc/baseconfig/ERCBorrowMoneyApplyControl','ERCBORROWMONEYAPPLYCONTROL');

call Pro_AddMenu('工资管理', '我的工资', '/erc/salarymanage/ERCSalaryMineControl','ERCSALARYMINECONTROL');
call Pro_AddMenu('工资管理', '工资申请单', '/erc/salarymanage/ERCSalaryApplyControl','ERCSALARYAPPLYCONTROL');
call Pro_AddMenu('工资管理', '额外工资确认单', '/erc/salarymanage/ERSalaryOtherControl','ERSALARYOTHERCONTROL');

insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(100 , '申请借款任务' , '申请借款任务', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(102 , '采购单审核' , '采购单审核', now(), now());
insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(101 , '工资申请' , '工资申请', now(), now());

ALTER TABLE `tbl_erc_ordermateriel` ADD COLUMN `mrp_state` varchar(5) DEFAULT ''  AFTER `sap_order_state`;
ALTER TABLE `tbl_erc_purchaseorder` ADD COLUMN `source_apply_id` varchar(50) DEFAULT ''  AFTER `biz_code`;
ALTER TABLE `tbl_erc_purchaseorder` ADD COLUMN `description` varchar(200) DEFAULT ''  AFTER `source_apply_id`;
ALTER TABLE `tbl_erc_purchasedetail` ADD COLUMN `source_apply_id` varchar(50) DEFAULT ''  AFTER `collect_number`;


ALTER TABLE `tbl_erc_department`
CHANGE COLUMN `house_area` `rent_house_area` BIGINT(20) NULL DEFAULT '0' ,
CHANGE COLUMN `month_rent` `rent_month` BIGINT(20) NULL DEFAULT '0' ,
CHANGE COLUMN `file_id` `rent_file_id` BIGINT(20) NULL DEFAULT NULL ,
CHANGE COLUMN `need_invoice` `rent_need_invoice` VARCHAR(4) NULL DEFAULT '0' ,
CHANGE COLUMN `other_main_id` `rent_other_main_id` VARCHAR(30) NULL DEFAULT NULL ;

ALTER TABLE `tbl_erc_department`
ADD COLUMN `water_amount` BIGINT(20) NULL DEFAULT 0 AFTER `rent_other_main_id`,
ADD COLUMN `water_money` BIGINT(20) NULL DEFAULT 0 AFTER `water_amount`,
ADD COLUMN `water_pre_money` BIGINT(20) NULL DEFAULT 0 AFTER `water_money`,
ADD COLUMN `water_other_main_id` VARCHAR(30) NULL AFTER `water_pre_money`,
ADD COLUMN `electric_amount` BIGINT(20) NULL DEFAULT 0 AFTER `water_other_main_id`,
ADD COLUMN `electric_money` BIGINT(20) NULL DEFAULT 0 AFTER `electric_amount`,
ADD COLUMN `electric_pre_money` BIGINT(20) NULL DEFAULT 0 AFTER `electric_money`,
ADD COLUMN `electric_other_main_id` VARCHAR(30) NULL AFTER `electric_pre_money`;

ALTER TABLE `tbl_erc_department`
ADD COLUMN `water_need_invoice` VARCHAR(4) NULL DEFAULT '0' AFTER `updated_at`;
ALTER TABLE `tbl_erc_department`
ADD COLUMN `electric_need_invoice` VARCHAR(4) NULL DEFAULT '0' AFTER `electric_other_main_id`;
