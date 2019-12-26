SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ls */
ALTER TABLE `tbl_erc_fixedassetspurchdetail`
ADD COLUMN `fixedassets_category` varchar(4) AFTER `fixedassets_flag`;
ALTER TABLE `tbl_erc_fixedassetspurchdetail`
ADD COLUMN `use_time_limit` varchar(10) AFTER `fixedassets_category`;
ALTER TABLE `tbl_erc_fixedassetspurchdetail`
ADD COLUMN `residual_value_rate` DOUBLE DEFAULT '0' AFTER `use_time_limit`;
ALTER TABLE `tbl_erc_fixedassetspurchdetail`
ADD COLUMN `depreciation_category` varchar(4) AFTER `residual_value_rate`;
ALTER TABLE `tbl_erc_fixedassetspurchdetail`
ADD COLUMN `department_id` varchar(30) AFTER `depreciation_category`;
ALTER TABLE `tbl_erc_fixedassetspurchdetail`
ADD COLUMN `user_id` varchar(30) AFTER `department_id`;
ALTER TABLE `tbl_erc_fixedassetspurchdetail`
ADD COLUMN `fixedassetscheck_acceptance` varchar(4) AFTER `user_id`;

ALTER TABLE `tbl_erc_fixedassetscheckdetail`
ADD COLUMN `fixedassetspurchdetail_id` BIGINT AFTER `take_stock_description`;

/*end ls */