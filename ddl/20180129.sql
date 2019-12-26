SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/


/* ls */
ALTER TABLE `tbl_erc_purchasedetail` ADD COLUMN `order_ids` varchar(200) DEFAULT '' AFTER `remark`;
/*end ls */
