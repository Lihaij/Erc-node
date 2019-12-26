SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* bb */
ALTER TABLE `tbl_erc_customer`
ADD COLUMN `salesperson_id` VARCHAR(30) NULL DEFAULT NULL AFTER `customer_point`;
/*end bb */

/* ty */
ALTER TABLE tbl_erc_customer MODIFY COLUMN parttime_usergroup_id varchar(30);
/*end ty */
