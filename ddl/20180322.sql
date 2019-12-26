SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ls */
ALTER TABLE `tbl_erc_qualitycheckdetail` ADD COLUMN `finishStock_number` int(11) DEFAULT 0 AFTER `updated_at`;
ALTER TABLE `tbl_erc_qualitycheckdetail` ADD COLUMN `warehouse_id` int(11) AFTER `updated_at`;
ALTER TABLE `tbl_erc_qualitycheckdetail` ADD COLUMN `warehouse_zone_id` int(11) AFTER `updated_at`;
ALTER TABLE `tbl_erc_qualitycheckdetail` ADD COLUMN `stock_operate_amount` int(11) DEFAULT 0 AFTER `updated_at`;

/*end ls */
