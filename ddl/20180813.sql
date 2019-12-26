SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ty */

ALTER TABLE `tbl_erc_message_user` CHANGE COLUMN `message_id` `message_id` varchar(30) NOT NULL;

/*end ty */