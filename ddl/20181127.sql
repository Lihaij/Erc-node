SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/


/*
  qm start
*/

ALTER TABLE `tbl_erc_financerecord` ADD COLUMN `org_type` varchar(10) DEFAULT '' AFTER `organization`;
ALTER TABLE `tbl_erc_financerecorditem` ADD COLUMN `org_type` varchar(10) DEFAULT '' AFTER `organization`;
ALTER TABLE `tbl_erc_materiel` ADD COLUMN `materiel_unit_bk` varchar(5) DEFAULT NULL AFTER `materiel_unit`;
ALTER TABLE `tbl_erc_reviewmateriel` ADD COLUMN `review_materiel_unit_bk` varchar(5) DEFAULT NULL AFTER `review_materiel_unit`;
ALTER TABLE `tbl_erc_materiel` ADD COLUMN `materiel_iid_code` varchar(100) DEFAULT NULL;
ALTER TABLE `tbl_erc_reviewmateriel` ADD COLUMN `review_materiel_iid_code` varchar(100) DEFAULT NULL;
ALTER TABLE `tbl_erc_productdevice` ADD COLUMN `device_level` bigint(20) DEFAULT NULL AFTER `day_capacity`;
ALTER TABLE `tbl_erc_consumablesdetail` ADD COLUMN `consumables_price` double DEFAULT 0 AFTER `consumables_number`;
ALTER TABLE `tbl_erc_consumablesdetail` ADD COLUMN `consumables_invoice` bigint(20) DEFAULT NULL AFTER `consumables_number`;
ALTER TABLE `tbl_erc_consumablesdetail` ADD COLUMN `consumables_subject` varchar(100) DEFAULT NULL AFTER `consumables_number`;
ALTER TABLE `tbl_erc_amortizebudget` ADD COLUMN `budget_require_detail` varchar(100) DEFAULT NULL AFTER `budget_refuse_remark`;

INSERT INTO `seqmysql` VALUES ('TaxStatementA1Seq', '0', '1', '99999999');
INSERT INTO `seqmysql` VALUES ('TaxStatementA2Seq', '0', '1', '99999999');
INSERT INTO `seqmysql` VALUES ('TaxStatementA3Seq', '0', '1', '99999999');
INSERT INTO `seqmysql` VALUES ('TaxStatementD4Seq', '0', '1', '99999999');
INSERT INTO `seqmysql` VALUES ('TaxStatementC1Seq', '0', '1', '99999999');

INSERT INTO `seqmysql` VALUES ('ProfitSeq', '0', '1', '99999999');
INSERT INTO `seqmysql` VALUES ('AssetsLiabilitySeq', '0', '1', '99999999');

DROP TABLE IF EXISTS `tbl_erc_taxstatement`;
CREATE TABLE `tbl_erc_taxstatement` (
  `taxstatement_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `taxstatement_code` varchar(30) NOT NULL,
  `tax_type` bigint(20) NOT NULL,
  `tax_sub_type` bigint(20) NOT NULL,
  `value_length` bigint(20) NOT NULL,
  `tax_value` varchar(255) NOT NULL DEFAULT '',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `verify_state` varchar(30) DEFAULT NULL,
  `verify_user` varchar(30) DEFAULT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`taxstatement_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `tbl_erc_sopricerecord`;
CREATE TABLE `tbl_erc_sopricerecord` (
  `pricerecord_id` BIGINT NOT NULL auto_increment,
  `order_id` VARCHAR(30) NOT NULL,
  `total_price` double DEFAULT NULL,
  `sale_price` double DEFAULT NULL,
  `remain_price` double DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`pricerecord_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `tbl_erc_affiliated_company`;
CREATE TABLE `tbl_erc_affiliated_company` (
  `affiliated_company_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `organizational_code` varchar(100) DEFAULT NULL,
  `company_name` varchar(100) DEFAULT NULL,
  `company_address` varchar(100) DEFAULT NULL,
  `corporate_representative` varchar(20) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`affiliated_company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

call Pro_AddMenu('出纳管理', '记账凭证', '/erc/cashiermanage/ERCRecordingVoucherControl', 'ERCRECORDINGVOUCHERCONTROL');
call Pro_AddMenu('出纳管理', '会计科目列表', '/erc/cashiermanage/ERCAccountingListControl', 'ERCACCOUNTINGLISTCONTROL');
call Pro_AddMenu('出纳管理', '明细分类账', '/erc/cashiermanage/SubsidiaryLedgersControl', 'SUBSIDIARYLEDGERSCONTROL');
call Pro_AddMenu('出纳管理', '服务与商贸税务报表管理', '/erc/cashiermanage/ERCTaxStatementControl', 'ERCTAXSTATEMENTCONTROL');
call Pro_AddMenu('出纳管理', '生产型税务报表管理', '/erc/cashiermanage/ERCTaxStatementProductControl', 'ERCTAXSTATEMENTPRODUCTCONTROL');
call Pro_AddMenu('出纳管理', '小规模税务报表管理', '/erc/cashiermanage/ERCTaxStatementSmallControl', 'ERCTAXSTATEMENTSMALLCONTROL');
call Pro_AddMenu('出纳管理', '利润表管理', '/erc/cashiermanage/ERCProfitManagerControl', 'ERCPROFITMANAGERCONTROL');
call Pro_AddMenu('出纳管理', '资产负债表管理', '/erc/cashiermanage/ERCAssetsLiabilityControl', 'ERCASSETSLIABILITYCONTROL');

insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(80 , '税务申报表任务' , '税务申报表请求', now(), now());

/*
    #42
*/
call Pro_AddMenu('出纳管理', '税费付款表', '/erc/cashiermanage/ERCTaxPaymentControl', 'ERCTAXPAYMENTCONTROL');

INSERT INTO `seqmysql` VALUES ('TaxPaymentIDSeq', '0', '1', '99999999');

insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(81 , '税费付款任务' , '税费付款请求', now(), now());

DROP TABLE IF EXISTS `tbl_erc_taxpayment`;
CREATE TABLE `tbl_erc_taxpayment` (
  `taxpayment_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `taxpayment_code` varchar(30) NOT NULL,
  `tax_type` bigint(20) NOT NULL,
  `payment_price` double NOT NULL,
  `payment_note` varchar(255) DEFAULT NULL,
  `user_id` varchar(30) NOT NULL DEFAULT '',
  `approval_date` datetime DEFAULT NULL,
  `reject_caused` varchar(300) DEFAULT NULL,
  `apply_state` varchar(30) DEFAULT NULL,
  `payment_state` varchar(30) DEFAULT NULL,
  `paymentconfirm_id` bigint(20) DEFAULT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`taxpayment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

/*
    #41
*/
call Pro_AddMenu('出纳管理', '供应商付款表', '/erc/cashiermanage/ERCSupplierPaymentControl', 'ERCSUPPLIERPAYMENTCONTROL');

INSERT INTO `seqmysql` VALUES ('SupplierPaymentIDSeq', '0', '1', '99999999');

insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(82 , '供应商付款任务' , '供应商付款请求', now(), now());

DROP TABLE IF EXISTS `tbl_erc_supplierpayment`;
CREATE TABLE `tbl_erc_supplierpayment` (
  `supplierpayment_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `supplierpayment_code` varchar(30) NOT NULL,
  `supplier_id` bigint(20) NOT NULL,
  `payment_price` double NOT NULL,
  `payment_note` varchar(255) DEFAULT NULL,
  `user_id` varchar(30) NOT NULL DEFAULT '',
  `approval_date` datetime DEFAULT NULL,
  `reject_caused` varchar(300) DEFAULT NULL,
  `apply_state` varchar(30) DEFAULT NULL,
  `payment_state` varchar(30) DEFAULT NULL,
  `paymentconfirm_id` bigint(20) DEFAULT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`supplierpayment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;

/*
    #43 44
*/
call Pro_AddMenu('运营数据管理', '采购价格监督', '/erc/baseconfig/ERCSupplierMppSuperviseControl', 'ERCSUPPLIERMPPSUPERVISECONTROL');
call Pro_AddMenu('运营数据管理', '销售价格监督', '/erc/baseconfig/ERCCustomerMspSuperviseControl', 'ERCCUSTOMERMSPSUPERVISECONTROL');

/*
    #45
*/
call Pro_AddMenu('出纳管理', '已开发票列表', '/erc/cashiermanage/ERCInvoiceAlreadyControl', 'ERCINVOICEALREADYCONTROL');
call Pro_AddMenu('出纳管理', '采购专用发票管理', '/erc/cashiermanage/ERCInvoicePurchaseControl', 'ERCINVOICEPURCHASECONTROL');
call Pro_AddMenu('出纳管理', '销售发票管理', '/erc/cashiermanage/ERCInvoiceSaleControl', 'ERCINVOICESALECONTROL');

DROP TABLE IF EXISTS `tbl_erc_taxinvoice`;
CREATE TABLE `tbl_erc_taxinvoice` (
  `invoice_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `corporateclients_id` bigint(20) NOT NULL,
  `invoice_code` varchar(30) NOT NULL,
  `invoice_type` bigint(20) NOT NULL,
  `materiel_code` varchar(20) NOT NULL,
  `materiel_name` varchar(100) NOT NULL,
  `materiel_format` varchar(100) DEFAULT NULL,
  `materiel_unit` varchar(20) DEFAULT NULL,
  `materiel_amount` int(11) DEFAULT NULL,
  `materiel_tax_price` double DEFAULT NULL,
  `materiel_tax` double DEFAULT NULL,
  `materiel_price` double DEFAULT NULL,
  `resp_user_id` varchar(30) DEFAULT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`invoice_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;

ALTER TABLE `tbl_erc_corporateclients` ADD COLUMN `resp_user_id` varchar(30) DEFAULT NULL AFTER `invoice_type`;

/*
    #46 47
*/

DROP TABLE IF EXISTS `tbl_erc_saleinvoice`;
CREATE TABLE `tbl_erc_saleinvoice` (
  `invoice_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `start_invoice_code` varchar(30) NOT NULL,
  `end_invoice_code` varchar(30) NOT NULL,
  `invoice_type` bigint(20) NOT NULL,
  `invoice_amount` bigint(20) DEFAULT NULL,
  `manage_type` bigint(20) DEFAULT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`invoice_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `tbl_erc_supplierinvoice`;
CREATE TABLE `tbl_erc_supplierinvoice` (
  `invoice_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `supplier_id` bigint(20) NOT NULL,
  `invoice_code` varchar(30) NOT NULL,
  `materiel_code` varchar(20) NOT NULL,
  `materiel_name` varchar(100) NOT NULL,
  `materiel_format` varchar(100) DEFAULT NULL,
  `materiel_unit` varchar(20) DEFAULT NULL,
  `materiel_amount` int(11) DEFAULT NULL,
  `materiel_tax_price` double DEFAULT NULL,
  `materiel_tax` double DEFAULT NULL,
  `materiel_price` double DEFAULT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`invoice_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

/*
    #48 49
*/
INSERT INTO `seqmysql` VALUES ('ProductiveTaskProcedureIDSeq', '0', '1', '99999999');

call Pro_AddMenu('品质管理', '生产工序品质管理', '/erc/productionmanage/ERCProductProcedureQualityControl', 'ERCPRODUCTPROCEDUREQUALITYCONTROL');
call Pro_AddMenu('品质管理', '工序验收单列表', '/erc/productionmanage/ERCProductProcedureListControl', 'ERCPRODUCTPROCEDURELISTCONTROL');

DROP TABLE IF EXISTS `tbl_erc_productivetask_transfer`;
CREATE TABLE `tbl_erc_productivetask_transfer` (
  `prd_task_procedure_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `productivetask_id` bigint(20) NOT NULL,
  `transfer_number` int(11) DEFAULT '0',
  `qualified_number` int(11) DEFAULT '0',
  `domain_id` bigint(20) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`prd_task_procedure_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `tbl_erc_productivetask_procedure`;
CREATE TABLE `tbl_erc_productivetask_procedure` (
  `prd_task_procedure_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `productivetask_id` bigint(20) NOT NULL,
  `procedure_code` varchar(50) NOT NULL,
  `transfer_number` int(11) DEFAULT '0',
  `qualified_number` int(11) DEFAULT '0',
  `unqualified_number` int(11) DEFAULT '0',
  `procedure_state` int(11) DEFAULT '0',
  `user_id` varchar(30) DEFAULT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`prd_task_procedure_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

/*
    #50
*/
call Pro_AddMenu('其他长期资产管理', '长期资产付款列表', '/erc/longtermassets/ERCAmortizePaymentControl', 'ERCAMORTIZEPAYMENTCONTROL');

insert into tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
    	values(83 , '长期资产付款任务' , '长期资产付款请求', now(), now());

INSERT INTO `seqmysql` VALUES ('AmortizePaymentIDSeq', '0', '1', '99999999');

DROP TABLE IF EXISTS `tbl_erc_amortize_payment`;
CREATE TABLE `tbl_erc_amortize_payment` (
  `amortize_payment_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `amortize_payment_code` varchar(30) NOT NULL,
  `amortize_id` bigint(20) NOT NULL,
  `payment_type` int(11) NOT NULL,
  `payment_price` double NOT NULL DEFAULT '0',
  `payment_note` varchar(200) DEFAULT '',
  `user_id` varchar(30) NOT NULL DEFAULT '',
  `approval_date` datetime DEFAULT NULL,
  `reject_caused` varchar(300) DEFAULT NULL,
  `apply_state` varchar(30) DEFAULT NULL,
  `payment_state` varchar(30) DEFAULT NULL,
  `paymentconfirm_id` bigint(20) DEFAULT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`amortize_payment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;

/*
    #56 57
*/
insert into tbl_common_systemmenu (systemmenu_name,node_type,parent_id,version,created_at,updated_at) VALUES ('报表管理','00','16',1,NOW(),NOW());
call Pro_AddMenu('报表管理', '订单物料成本差异分析', '/erc/reportmanage/ERCOrderMaterielCostAnalysisControl', 'ERCORDERMATERIELCOSTANALYSISCONTROL');
call Pro_AddMenu('报表管理', '订单人工成本差异分析', '/erc/reportmanage/ERCOrderLabourCostAnalysisControl', 'ERCORDERLABOURCOSTANALYSISCONTROL');


ALTER TABLE `tbl_erc_productivetaskdetail` ADD COLUMN `stock_out_number` bigint(20) DEFAULT 0 AFTER `change_state`;
ALTER TABLE `tbl_erc_productivetaskdetail` ADD COLUMN `stock_out_state` int(11) DEFAULT 1 AFTER `stock_out_number`;

/*
  add your ddl
*/
