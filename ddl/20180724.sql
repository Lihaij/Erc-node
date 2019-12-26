SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* jjs */

ALTER TABLE `tbl_erc_receiptitem` CHANGE COLUMN `receipt_id` `receipt_id` varchar(30) NOT NULL;

/*end jjs */