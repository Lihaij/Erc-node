SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ls */
DROP TABLE IF EXISTS `tbl_erc_humanresource`;
CREATE TABLE `tbl_erc_humanresource` (
  `hr_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `post_title` varchar(200) DEFAULT NULL,
  `post_usergroup_id` bigint(20),
  `user_id` varchar(30) NOT NULL DEFAULT '',
  `domain_id` bigint(20) NOT NULL,
  `hr_state` varchar(4) DEFAULT '0',
  `hr_checker_id` varchar(30) DEFAULT NULL,
  `hr_check_date` datetime DEFAULT NULL,
  `hr_remark` varchar(300) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`hr_id`)
);

call Pro_AddMenu('人力资源管理', '人力需求管理', '/erc/baseconfig/ERCHumanResourceControl', 'ERCHUMANRESOURCECONTROL');

INSERT INTO tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
	VALUES(15 , '人力需求管理' , '分配招录任务', now(), now());

/*end ls */
