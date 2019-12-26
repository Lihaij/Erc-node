SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* qm */

ALTER TABLE tbl_erc_productplandetail ADD COLUMN `level_materiel_id` bigint(20) NULL AFTER `workshop_id`;

/*end qm */

/* hlq */
CREATE TABLE `tbl_erc_supremetask.js` (
  `supremetask_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `task_type` varchar(4) DEFAULT NULL,
  `customtaskallot_id` bigint(20) DEFAULT NULL,
  `task_group` varchar(30) DEFAULT NULL,
  `task_publisher` varchar(30) DEFAULT NULL,
  `task_name` varchar(30) DEFAULT NULL,
  `task_description` varchar(300) DEFAULT NULL,
  `supremetask_state` varchar(4) DEFAULT NULL,
  `currenttask_level` int(11) NOT NULL DEFAULT '0',
  `maxtask_level` int(11) NOT NULL DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`supremetask_id`)
);

ALTER TABLE tbl_common_domainmenu ADD COLUMN `root_show_flag` varchar(2) NOT NULL DEFAULT '1' AFTER `parent_id`;
ALTER TABLE tbl_common_templatemenu ADD COLUMN `root_show_flag` varchar(2) NOT NULL DEFAULT '1' AFTER `parent_id`;
/*end hlq */