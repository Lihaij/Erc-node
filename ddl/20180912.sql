SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* jjs */

ALTER TABLE `tbl_erc_productivetask` ADD COLUMN `stock_out_number` bigint(20) DEFAULT 0 AFTER `stock_in_state`;
ALTER TABLE `tbl_erc_productivetask` ADD COLUMN `stock_out_state` varchar(4) DEFAULT '1' AFTER `stock_out_number`;
ALTER TABLE `tbl_erc_productivetaskrelated` ADD COLUMN `related_stock_out_number` bigint(20) DEFAULT 0 AFTER `related_stock_in_number`;

/*end jjs */