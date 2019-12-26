SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/



/* NJC */
ALTER TABLE `tbl_erc_purchaseapply` ADD COLUMN `order_type` int(11) DEFAULT NULL AFTER `updated_at`;
/*end NJC */




