SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* ty */

ALTER TABLE `tbl_erc_project` ADD COLUMN `domain_id` bigint(20) DEFAULT NULL AFTER `project_id`;
ALTER TABLE `tbl_erc_project` ADD COLUMN `project_name` varchar(50) DEFAULT NULL AFTER `domain_id`;
ALTER TABLE `tbl_erc_project` ADD COLUMN `project_estate_id` int(5) DEFAULT NULL AFTER `project_name`;
ALTER TABLE `tbl_erc_project` ADD COLUMN `project_approver_id` varchar(50) DEFAULT NULL AFTER `project_estate_id`;
ALTER TABLE `tbl_erc_project` ADD COLUMN `project_state` varchar(5) NOT NULL AFTER `project_approver_id`;

/*end ty */

/* nie */

ALTER TABLE `tbl_erc_productivetask` ADD COLUMN `product_level` BIGINT DEFAULT NULL AFTER `domain_id`;

/*end nie */