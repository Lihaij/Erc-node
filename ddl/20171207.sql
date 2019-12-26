SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/



/*
  add your ddl
*/


/*bb*/
/*ALTER TABLE `tbl_erc_orderdesign`
DROP COLUMN `upload_date`,
CHANGE COLUMN `type_id` `require_type` VARCHAR(5) NOT NULL ;*/
/*end bb*/


/* tiny */
ALTER TABLE `tbl_erc_order`
ADD COLUMN `materiel_id` bigint(20) NULL AFTER `processcreate_state`;
/*ALTER TABLE `tbl_erc_order`
ADD COLUMN `order_sales_id` VARCHAR(30) NULL AFTER `materiel_id`;
ALTER TABLE `tbl_erc_order`
ADD COLUMN `purchase_contact` VARCHAR(30) NULL AFTER `order_sales_id`;
ALTER TABLE `tbl_erc_order`
ADD COLUMN `purchase_phone` VARCHAR(30) NULL AFTER `purchase_contact`;*/

--DROP TABLE IF EXISTS `tbl_erc_process`;
--CREATE TABLE `tbl_erc_process` (
--  `process_id` bigint(20) NOT NULL AUTO_INCREMENT,
--  `process_name` varchar(30) DEFAULT NULL,
--  `state` varchar(5) DEFAULT '1',
--  `version` bigint(20) NOT NULL DEFAULT '0',
--  `created_at` datetime NOT NULL,
--  `updated_at` datetime NOT NULL,
--  PRIMARY KEY (`process_id`)
--);
/*end tiny */



/*LJZ*/
/*ALTER TABLE `tbl_erc_materiel`
ADD COLUMN `materiel_formatcount` VARCHAR(50) NULL AFTER `materiel_format`;*/
/*end LJZ*/

/* ty */
--DROP TABLE IF EXISTS `tbl_erc_reviewmateriel`;
--CREATE TABLE `tbl_erc_reviewmateriel` (
--  `review_materiel_id` bigint(20) NOT NULL AUTO_INCREMENT,
--  `domain_id` bigint(20) DEFAULT NULL,
--  `review_materiel_code` varchar(20) NOT NULL,
--  `review_materiel_name` varchar(100) DEFAULT NULL,
--  `review_materiel_format` varchar(200) DEFAULT NULL,
--  `review_materiel_formatunit` varchar(200) DEFAULT NULL,
--  `review_materiel_unit` varchar(5) DEFAULT NULL,
--  `review_materiel_type` varchar(20) DEFAULT NULL,
--  `review_materiel_describe` varchar(200) DEFAULT NULL,
--  `review_materiel_cost` int(11),
--  `review_materiel_state` varchar(5) DEFAULT NULL,
--  `review_materiel_source` varchar(12) DEFAULT NULL,
--  `review_materiel_sale` int(11),
--  `review_materiel_barcode` varchar(200) DEFAULT NULL,
--  `review_materiel_manage` varchar(12) DEFAULT NULL,
--  `review_materiel_source_kind` varchar(12) DEFAULT NULL,
--  `review_materiel_tax` double DEFAULT NULL,
--  `review_materiel_amto` varchar(12) DEFAULT NULL,
--  `review_state` varchar(5) DEFAULT NULL,
--  `review_performer` varchar(30) DEFAULT NULL,
--  `review_materiel_loss` double NOT NULL DEFAULT '0',
--  `state` varchar(5) DEFAULT '1',
--  `version` bigint(20) NOT NULL DEFAULT '0',
--  `created_at` datetime NOT NULL,
--  `updated_at` datetime NOT NULL,
--  PRIMARY KEY (`review_materiel_id`)
--);
/*end ty */

/*LJZ*/
--ALTER TABLE `tbl_erc_reviewmateriel`
--ADD COLUMN `review_materiel_formatcount` VARCHAR(50) NULL AFTER `review_materiel_format`;
/*end LJZ*/