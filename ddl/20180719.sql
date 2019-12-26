SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* jjs */

ALTER TABLE `tbl_erc_purchaseorder` ADD COLUMN `collect_state` varchar(4) DEFAULT '0' AFTER `updated_at`;
ALTER TABLE `tbl_erc_purchasedetail` ADD COLUMN `collect_number` int(11) DEFAULT 0 AFTER `updated_at`;

/*end jjs */

/* hlq */
ALTER TABLE `tbl_erc_taskallotuser` ADD COLUMN `taskallotuser_level` int(11) DEFAULT 0 AFTER `domain_id`;
/* end hlq */