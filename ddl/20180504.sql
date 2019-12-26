SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* hlq */
DROP TABLE IF EXISTS `tbl_erc_operator`;
CREATE TABLE `tbl_erc_operator` (
  `user_id` varchar(30) NOT NULL,
  `kujiale_appuid` varchar(100) NOT NULL DEFAULT '',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`user_id`)
);

/*end hlq */
