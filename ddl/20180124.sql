SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* cici */
call Pro_AddMenu('运营数据管理', '商城装修日记维护', '/erc/baseconfig/ERCSiteConfigDiaryControl', 'ERCSITECONFIGDIARYCONTROL');

DROP TABLE IF EXISTS `tbl_erc_site_diary`;
CREATE TABLE `tbl_erc_site_diary` (
  `diary_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `diary_title` varchar(200) DEFAULT NULL,
  `diary_subtitle` varchar(200) DEFAULT NULL,
  `diary_content` text,
  `diary_selected` bigint(20) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`diary_id`)
);
/*end cici */

