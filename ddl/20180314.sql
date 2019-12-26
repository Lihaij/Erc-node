
SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ls */
ALTER TABLE `ercdata`.`tbl_common_user_contract` CHANGE COLUMN `user_id` `user_id` varchar(30) NOT NULL;
ALTER TABLE `ercdata`.`tbl_common_user_work_experience` CHANGE COLUMN `user_id` `user_id` varchar(30) NOT NULL;

/*end ls */
