SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* qm */

ALTER TABLE `tbl_erc_orderrequire`
ADD COLUMN `require_user_id` bigint(20) AFTER `require_hidden`;

/*end qm */