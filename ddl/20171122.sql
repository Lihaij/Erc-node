
SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/



/*
  add your ddl
*/


/*bb*/
/*ALTER TABLE `tbl_erc_orderinternalreview`
DROP COLUMN `file_url`,
DROP COLUMN `file_name`,
CHANGE COLUMN `upload_date` `upload_date` DATETIME NULL DEFAULT NULL ,
ADD COLUMN `file_id` VARCHAR(30) NULL AFTER `require_id`;*/
/*end bb*/