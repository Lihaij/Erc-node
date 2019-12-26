SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ls */

call Pro_AddMenu('运营数据管理', '工人查询', '/erc/baseconfig/ERCWorkerBranchControl', 'ERCWORKERBRANCHCONTROL');

/*end ls */

/* LJZ */
DROP TABLE IF EXISTS `tbl_erc_businessdomain`;
CREATE TABLE `tbl_erc_businessdomain` (
  `businessdomain_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain` varchar(100) NOT NULL,
  `businesscustomer_type` varchar(5) DEFAULT NULL,
  `businessregistration` varchar(100) DEFAULT NULL,
  `business_tax` double NOT NULL DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `business_contact_qq` varchar(100) DEFAULT NULL,
  `business_contact_wechat` varchar(100) DEFAULT NULL,
  `legalperson_contact` varchar(100) DEFAULT NULL,
  `legalperson_phone` varchar(100) DEFAULT NULL,
  `legalperson_contact_qq` varchar(100) DEFAULT NULL,
  `legalperson_contact_wechat` varchar(100) DEFAULT NULL,
  `mouthsettlement` int(11) DEFAULT NULL,
  `settlementway` varchar(5) DEFAULT NULL,
  PRIMARY KEY (`businessdomain_id`)
);

/*end LJZ */


/* LJZ */

DROP TABLE IF EXISTS `tbl_erc_produce_client`;
CREATE TABLE `tbl_erc_produce_client` (
  `produce_client_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `produce_id` bigint(20) NOT NULL,
  `client_domain_id` bigint(20) DEFAULT NULL,
  `suggest_price` double DEFAULT NULL,
  `domain_id` bigint(20) NOT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `produce_client_state` varchar(5) DEFAULT '1',
  PRIMARY KEY (`produce_client_id`)
);

/*end LJZ */


/* LJZ */

ALTER TABLE `tbl_erc_produce` ADD COLUMN `produce_client_state` varchar(5) DEFAULT NULL;
ALTER TABLE `tbl_erc_produce` ADD COLUMN `start_date`  datetime;
ALTER TABLE `tbl_erc_produce` ADD COLUMN `end_date` datetime;

/*end LJZ */

