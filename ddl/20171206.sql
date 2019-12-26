SET NAMES utf8;

SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/*
  add your ddl
*/

/*NIE*/
/*ALTER TABLE `tbl_erc_order`
ADD COLUMN `project_type` VARCHAR(4) DEFAULT NULL AFTER `produce_id`;*/

update tbl_erc_order set project_type=order_type where order_type not in (7,8);
update tbl_erc_order set order_type=1 where order_type not in (7,8);

/*end NIE*/

/*
  your backup sql
*/

/* lao qu */
--DROP TABLE IF EXISTS `tbl_erc_thirdsignuser`;
--CREATE TABLE `tbl_erc_thirdsignuser` (
--  `thirdsignuser_id` bigint(20) NOT NULL AUTO_INCREMENT,
--  `domain_id` bigint(20) NOT NULL,
--  `supplier_id` bigint(20) NOT NULL,
--  `user_id` varchar(30) NOT NULL,
--  `third_sign_type` bigint(20) NOT NULL,
--  `summary` varchar(100) DEFAULT NULL,
--  `state` varchar(5) DEFAULT '1',
--  `version` bigint(20) NOT NULL DEFAULT '0',
--  `created_at` datetime NOT NULL,
--  `updated_at` datetime NOT NULL,
--  PRIMARY KEY (`thirdsignuser_id`)
--);
/* lao qu */

