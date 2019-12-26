SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ty */
ALTER TABLE tbl_erc_produce_client ADD COLUMN produce_client_type varchar(4) null;
/*end ty */

/* hlq */
DROP TABLE IF EXISTS `tbl_erc_customtaskallot`;
CREATE TABLE `tbl_erc_customtaskallot` (
  `customtaskallot_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `taskallot_id` varchar(30) DEFAULT NULL,
  `customtaskallot_name` varchar(30) DEFAULT NULL,
  `customtaskallot_describe` varchar(200) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`customtaskallot_id`)
);

ALTER TABLE `tbl_erc_taskallotuser` ADD COLUMN `customtaskallot_id` bigint(20) AFTER `taskallotuser_level`;
ALTER TABLE `tbl_erc_task` ADD COLUMN `customtaskallot_id` bigint(20) AFTER `taskallotuser_level`;
/* end hlq */