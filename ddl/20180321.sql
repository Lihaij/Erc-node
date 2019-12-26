SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ls */
ALTER TABLE `ercdata`.`tbl_erc_qualitycheck` CHANGE COLUMN `supplier_id` `supplier_id` bigint(20);

/*end ls */
