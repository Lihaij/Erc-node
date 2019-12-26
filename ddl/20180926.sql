SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* njc */

DROP TABLE IF EXISTS `tbl_erc_project`;
CREATE TABLE `tbl_erc_project` (
  `project_id` varchar(30) NOT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `project_name` varchar(50) DEFAULT NULL,
  `project_budget_amount` bigint(30) DEFAULT NULL,
  `project_quoted_amount` bigint(30) DEFAULT NULL,
  `project_final_amount` bigint(30) DEFAULT NULL,
  `project_estate_id` int(5) DEFAULT NULL,
  `project_approver_id` varchar(50) DEFAULT NULL,
  `project_state` varchar(5) NOT NULL,
  `project_budget_remark` varchar(150) DEFAULT NULL,
  `project_final_remark` varchar(150) DEFAULT NULL,
  `project_check_state` int(11) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`project_id`)
);

DROP TABLE IF EXISTS `tbl_erc_projectconsume`;
CREATE TABLE `tbl_erc_projectconsume` (
  `projectconsume_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `project_id` varchar(30) NOT NULL,
  `consume_code` varchar(100) DEFAULT NULL,
  `consume_creator` varchar(100) DEFAULT NULL,
  `consume_examine` varchar(100) DEFAULT NULL,
  `consume_examine_time` datetime DEFAULT NULL,
  `consume_refuse_remark` varchar(300) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`projectconsume_id`)
);
/*end njc */
