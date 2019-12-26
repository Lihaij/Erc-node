SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* bb */

ALTER TABLE`tbl_erc_customer`
ADD COLUMN `open_id` VARCHAR(30) NULL DEFAULT NULL AFTER `updated_at`,
ADD COLUMN `nickname` VARCHAR(20) NULL DEFAULT NULL AFTER `open_id`;

/*end bb */