SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/


/*ty*/
DROP TABLE IF EXISTS `tbl_erc_otherinventoryorder`;
CREATE TABLE `tbl_erc_otherinventoryorder` (
  `other_inventory_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `other_bill_code` varchar(30) NOT NULL,
  `os_order_id` varchar(30) NOT NULL,
  `other_account_type` varchar(4) DEFAULT NULL,
  `warehouse_id` bigint(20) NOT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`other_inventory_id`)
);

DROP TABLE IF EXISTS `tbl_erc_otherinventoryaccount`;
CREATE TABLE `tbl_erc_otherinventoryaccount` (
  `otherinventoryaccount_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `other_bill_code` varchar(30) NOT NULL,
  `other_order_id` varchar(30) NOT NULL,
  `s_order_id` varchar(30) DEFAULT NULL,
  `warehouse_zone_id` bigint(20) DEFAULT NULL,
  `warehouse_id` bigint(20) NOT NULL,
  `materiel_id` bigint(20) NOT NULL,
  `account_operate_number` INTEGER NUll DEFAULT '0',
  `other_remain_amount` INTEGER NUll DEFAULT '0',
  `other_account_type` varchar(4) DEFAULT NULL,
  `other_account_note` varchar(100) DEFAULT NULL,
  `other_company_name` varchar(100) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`otherinventoryaccount_id`)
);
/*end ty*/
