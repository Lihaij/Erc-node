SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/*
  add your ddl
*/

/*NIE*/
--DROP TABLE IF EXISTS `tbl_erc_produce`;
--CREATE TABLE `tbl_erc_produce` (
--  `produce_id` bigint(20) NOT NULL AUTO_INCREMENT,
--  `materiel_id` bigint(20) DEFAULT NULL,
--  `domain_id` bigint(20) DEFAULT NULL,
--  `state` varchar(5) DEFAULT '1',
--  `version` bigint(20) NOT NULL DEFAULT '0',
--  `created_at` datetime NOT NULL,
--  `updated_at` datetime NOT NULL,
--  PRIMARY KEY (`produce_id`)
--);
--
--DROP TABLE IF EXISTS `tbl_erc_producemateriel`;
--CREATE TABLE `tbl_erc_producemateriel` (
--  `producemateriel_id` bigint(20) NOT NULL AUTO_INCREMENT,
--  `produce_id` bigint(20) NOT NULL,
--  `produceprocess_id` bigint(20) DEFAULT NULL,
--  `materiel_id` bigint(20) NOT NULL,
--  `state` varchar(5) DEFAULT '1',
--  `version` bigint(20) NOT NULL DEFAULT '0',
--  `created_at` datetime NOT NULL,
--  `updated_at` datetime NOT NULL,
--  PRIMARY KEY (`producemateriel_id`)
--);
--
--DROP TABLE IF EXISTS `tbl_erc_produceprocess`;
--CREATE TABLE `tbl_erc_produceprocess` (
--  `produceprocess_id` bigint(20) NOT NULL AUTO_INCREMENT,
--  `produce_id` bigint(20) NOT NULL,
--  `process_name` varchar(20) NOT NULL,
--  `process_duration` int(11) NOT NULL DEFAULT '0',
--  `process_level` bigint(20) NOT NULL,
--  `state` varchar(5) DEFAULT '1',
--  `version` bigint(20) NOT NULL DEFAULT '0',
--  `created_at` datetime NOT NULL,
--  `updated_at` datetime NOT NULL,
--  PRIMARY KEY (`produceprocess_id`)
--);
--
--DROP TABLE IF EXISTS `tbl_erc_orderproductplan`;
--CREATE TABLE `tbl_erc_orderproductplan` (
--  `orderproductplan_id` varchar(30) NOT NULL,
--  `order_id` varchar(20) NOT NULL,
--  `produceprocess_id` varchar(30) DEFAULT NULL,
--  `process_duration` int(11) NOT NULL DEFAULT '0',
--  `process_begin_date` date NOT NULL,
--  `process_end_date` date NOT NULL,
--  `plan_assign` varchar(30) DEFAULT NULL,
--  `pp_date` date DEFAULT NULL,
--  `plan_state` varchar(30) DEFAULT NULL,
--  `description` varchar(100) DEFAULT NULL,
--  `state` varchar(5) DEFAULT '1',
--  `version` bigint(20) NOT NULL DEFAULT '0',
--  `created_at` datetime NOT NULL,
--  `updated_at` datetime NOT NULL,
--  PRIMARY KEY (`orderproductplan_id`)
--);

/*ALTER TABLE `tbl_erc_order`
ADD COLUMN `produce_id` BIGINT(20) DEFAULT NULL  AFTER `purchase_domain_id`;*/
/*end NIE*/