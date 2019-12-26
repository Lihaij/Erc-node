SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* bb */

    ALTER TABLE `tbl_erc_message_user`
    ADD COLUMN `read` VARCHAR(5) NULL DEFAULT '0' AFTER `message_user_title`;

/*end bb */