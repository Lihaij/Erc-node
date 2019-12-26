SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ls */
DROP TABLE IF EXISTS `tbl_erc_notice`;
CREATE TABLE `tbl_erc_notice` (
  `notice_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) NOT NULL,
  `user_id` varchar(30) NOT NULL DEFAULT '',
  `notice_title` varchar(200) DEFAULT NULL,
  `notice_detail` varchar(1000) DEFAULT NULL,
  `notice_question` varchar(200) DEFAULT NULL,
  `notice_answer` varchar(200) DEFAULT NULL,
  `notice_state` varchar(4) DEFAULT '0',
  `notice_checker_id` varchar(30) DEFAULT NULL,
  `notice_check_date` datetime DEFAULT NULL,
  `notice_refuse_remark` varchar(300) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`notice_id`)
);

DROP TABLE IF EXISTS `tbl_erc_notice_org`;
CREATE TABLE `tbl_erc_notice_org` (
  `notice_org_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `notice_id` bigint(20) NOT NULL,
  `domain_id` bigint(20) NOT NULL,
  `usergroup_id` bigint(20),
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`notice_org_id`)
);

DROP TABLE IF EXISTS `tbl_erc_notice_user`;
CREATE TABLE `tbl_erc_notice_user` (
  `notice_user_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `notice_id` bigint(20) NOT NULL,
  `domain_id` bigint(20) NOT NULL,
  `user_id` varchar(30) NOT NULL DEFAULT '',
  `read_state` varchar(2) NOT NULL DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`notice_user_id`)
);

/*end ls */
