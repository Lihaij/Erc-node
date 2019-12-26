SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ty */
update tbl_common_api set api_name = '报废申请单列表' where api_function = 'ERCASSETRETIREMENTCONTROL';
update tbl_common_domainmenu set domainmenu_name = '报废申请单列表' where api_function = 'ERCASSETRETIREMENTCONTROL';
update tbl_common_systemmenu set systemmenu_name = '报废申请单列表' where api_function = 'ERCASSETRETIREMENTCONTROL';
update tbl_common_templatemenu set templatemenu_name = '报废申请单列表' where api_function = 'ERCASSETRETIREMENTCONTROL';

call Pro_AddMenu('长期资产管理', '资产报废管理','/erc/longtermassets/ERCAssetRetirementDetailControl','ERCASSETRETIREMENTDETAILCONTROL');

update tbl_erc_taskallot set taskallot_name = '出差、用车接待申请通知' where taskallot_id = '22';
/*end ty */

/* njc */

call Pro_AddMenu('长期资产管理', '材料申购单','/erc/longtermassets/ERCAmortizeScribeOrderControl','ERCAMORTIZESCRIBEORDERCONTROL');
call Pro_AddMenu('长期资产管理', '材料采购单','/erc/longtermassets/ERCAmortizePurchaseOrderControl','ERCAMORTIZEPURCHASEORDERCONTROL');
insert into seqmysql values ('subcribeOrderIDSeq',1,1,99999999);
insert into seqmysql values ('amoPurOrderIDSeq',1,1,99999999);

ALTER TABLE tbl_erc_amortizesubscribe ADD COLUMN subscribe_price double NUll DEFAULT 0 AFTER `subscribe_number`;
ALTER TABLE tbl_erc_amortizesubscribe ADD COLUMN suppler_id varchar(30) NUll DEFAULT '' AFTER `subscribe_price`;
ALTER TABLE tbl_erc_amortizesubscribe change suppler_id  supplier_id VARCHAR(30);

DROP TABLE IF EXISTS `tbl_erc_amortizesubscribeorder`;
CREATE TABLE `tbl_erc_amortizesubscribeorder` (
  `amortizesubscribeorder_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `amortize_id` varchar(30) NOT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `amortizebudget_id` varchar(30) NOT NULL,
  `subscribeorder_code` varchar(30) DEFAULT NULL,
  `subscribeorder_creator` varchar(50) DEFAULT NULL,
  `subscribeorder_state` int(11) DEFAULT NULL,
  `subscribeorder_examine` varchar(100) DEFAULT NULL,
  `subscribeorder_examine_time` datetime DEFAULT NULL,
  `subscribeorder_refuse_remark` varchar(300) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`amortizesubscribeorder_id`)
);

DROP TABLE IF EXISTS `tbl_erc_amortizesubscribeorderdetail`;
CREATE TABLE `tbl_erc_amortizesubscribeorderdetail` (
  `amortizesubscribeorderdetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `amortizesubscribeorder_id` varchar(30) NOT NULL,
  `subscribeorderdetail_name` varchar(100) DEFAULT NULL,
  `subscribeorderdetail_format` varchar(100) DEFAULT NULL,
  `subscribeorderdetail_unit` varchar(30) DEFAULT NULL,
  `subscribeorderdetail_number` double DEFAULT '0',
  `subscribeorderdetail_remark` varchar(100) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`amortizesubscribeorderdetail_id`)
);

DROP TABLE IF EXISTS `tbl_erc_amortizesubscribeorderdetailend`;
CREATE TABLE `tbl_erc_amortizesubscribeorderdetailend` (
  `amortizesubscribeorderdetailend_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `amortize_id` varchar(30) NOT NULL,
  `subscribeorderdetailend_name` varchar(100) DEFAULT NULL,
  `subscribeorderdetailend_format` varchar(100) DEFAULT NULL,
  `subscribeorderdetailend_unit` varchar(30) DEFAULT NULL,
  `subscribeorderdetailend_number` double DEFAULT '0',
  `purchase_done_number` double DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`amortizesubscribeorderdetailend_id`)
);

DROP TABLE IF EXISTS `tbl_erc_amortizepurchaseorder`;
CREATE TABLE `tbl_erc_amortizepurchaseorder` (
  `amortizepurchaseorder_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `amortize_id` varchar(30) NOT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `purchaseorder_code` varchar(30) DEFAULT NULL,
  `purchaseorder_creator` varchar(50) DEFAULT NULL,
  `supplier_id` varchar(30) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`amortizepurchaseorder_id`)
);

DROP TABLE IF EXISTS `tbl_erc_amortizepurchaseorderdetail`;
CREATE TABLE `tbl_erc_amortizepurchaseorderdetail` (
  `amortizepurchaseorderdetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `amortizepurchaseorder_id` varchar(30) NOT NULL,
  `purchaseorderdetail_name` varchar(100) DEFAULT NULL,
  `purchaseorderdetail_format` varchar(100) DEFAULT NULL,
  `purchaseorderdetail_unit` varchar(30) DEFAULT NULL,
  `purchaseorderdetail_number` double DEFAULT '0',
  `purchaseorderdetail_price` double DEFAULT '0',
  `purchaseorderdetail_remark` varchar(100) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`amortizepurchaseorderdetail_id`)
);
/* end njc */
