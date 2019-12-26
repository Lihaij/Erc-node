SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ty */
ALTER TABLE tbl_common_user modify p_usergroup_id bigint(20) NUll;

ALTER TABLE `tbl_common_user_contract`
ADD COLUMN `contract_state` varchar(100) DEFAULT '' AFTER `bank_account`;
/*end ty */

/* ls */
ALTER TABLE `tbl_erc_purchaseorder`
ADD COLUMN `check_state` varchar(4) NUll DEFAULT '0' AFTER `approval_date`;

ALTER TABLE `tbl_erc_purchasedetail`
ADD COLUMN `qualified_number` int(11) NUll DEFAULT 0 AFTER `order_ids`;

DROP TABLE IF EXISTS `tbl_erc_qualitycheck`;
CREATE TABLE `tbl_erc_qualitycheck` (
  `qualitycheck_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `purchaseorder_id` varchar(30) NOT NULL,
  `user_id` varchar(30) NOT NULL,
  `domain_id` bigint(20) NOT NULL,
  `supplier_id` bigint(20) NOT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`qualitycheck_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `tbl_erc_qualitycheckdetail`;
CREATE TABLE `tbl_erc_qualitycheckdetail` (
  `qualitycheckdetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `qualitycheck_id` bigint(20) NOT NULL,
  `materiel_id` bigint(20) NOT NULL,
  `purchasedetail_id` bigint(20) NOT NULL,
  `qualified_number` int(11) DEFAULT 0,
  `unqualified_number` int(11) DEFAULT 0,
  `remark` varchar(500) DEFAULT '',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`qualitycheckdetail_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `tbl_erc_return`;
CREATE TABLE `tbl_erc_return` (
  `return_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `qualitycheck_id` bigint(20) NOT NULL,
  `purchaseorder_id` varchar(30) NOT NULL,
  `return_state` varchar(4) DEFAULT 0,
  `return_checker_id` varchar(30),
  `return_check_date` datetime,
  `return_refuse_remark` varchar(500) DEFAULT '',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`return_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `tbl_erc_returndetail`;
CREATE TABLE `tbl_erc_returndetail` (
  `returndetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `return_id` bigint(20) NOT NULL,
  `materiel_id` bigint(20) NOT NULL,
  `return_number` int(11) DEFAULT 0,
  `return_remark` varchar(500) DEFAULT '',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`returndetail_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*end ls */
