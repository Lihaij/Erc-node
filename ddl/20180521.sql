SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* ty */
ALTER TABLE `tbl_erc_department` ADD COLUMN `department_state` varchar(8) AFTER `department_plan_num`;
/*end ty */

