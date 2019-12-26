SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* njc */
ALTER TABLE `tbl_erc_order` ADD COLUMN `purchaser_type` int(11)  DEFAULT 0 AFTER `purchase_phone`;
ALTER TABLE `tbl_erc_order` ADD COLUMN `purchaser_user_id` varchar(50)  DEFAULT NULL AFTER `purchaser_type`;
ALTER TABLE `tbl_erc_order` ADD COLUMN `sales_data_source` varchar(30)  DEFAULT NULL AFTER `purchaser_user_id`;
ALTER TABLE `tbl_erc_order` ADD COLUMN `sap_order_state` int(11)  DEFAULT NULL AFTER `sales_data_source`;
ALTER TABLE `tbl_erc_ordermateriel` ADD COLUMN `sap_order_state` int(11)  DEFAULT NULL AFTER `kjl_group`;
/*end njc */
/* ls */

DROP TABLE IF EXISTS `tbl_erc_custorgstructure`;
CREATE TABLE `tbl_erc_custorgstructure` (
    `custorgstructure_id` bigint(20) NOT NULL AUTO_INCREMENT,
    `user_id` varchar(30) NOT NULL,
    `department_id` varchar(30) NOT NULL,
    `position_id` varchar(30) NOT NULL,
    `state` varchar(5) DEFAULT '1',
    `version` bigint(20) NOT NULL DEFAULT '0',
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    PRIMARY KEY (`custorgstructure_id`)
);

ALTER TABLE tbl_erc_humanresource DROP COLUMN post_title ;

ALTER TABLE tbl_erc_humanresource
ADD COLUMN `department_id`  varchar(30) AFTER `hr_id`;

ALTER TABLE tbl_erc_humanresource
ADD COLUMN `position_id`  varchar(30) AFTER `department_id`;

/*end ls */
