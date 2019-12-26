SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ls */
ALTER TABLE `tbl_erc_fixedassetspurchdetail`
ADD COLUMN `fixedassets_flag` varchar(4) DEFAULT '0' AFTER `fixedassets_num`;

ALTER TABLE `tbl_erc_fixedassetscheck`
ADD COLUMN `check_flag` varchar(4) DEFAULT '0' AFTER `user_id`;

/*end ls */