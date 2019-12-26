SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ty */

DROP TABLE IF EXISTS `tbl_erc_message_user`;
CREATE TABLE `tbl_erc_message_user` (
  `message_user_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `message_id` bigint(20) NOT NULL,
  `domain_id` bigint(20) NOT NULL,
  `user_id` varchar(30) NOT NULL DEFAULT '',
  `message_user_state` varchar(100) DEFAULT NULL,
  `message_start_date` datetime DEFAULT NULL,
  `message_user_type` varchar(100) DEFAULT NULL,
  `message_user_title` varchar(200) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`message_user_id`)
);

/*end ty */