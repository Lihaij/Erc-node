SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ls */
call Pro_AddMenu('运营数据管理', '公告管理', '/erc/baseconfig/ERCNoticeControl', 'ERCNOTICECONTROL');

INSERT INTO tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
	VALUES(14 , '通知公告' , '分配通知公告审核人员', now(), now());

/*end ls */


/* bb */

CREATE TABLE `tbl_erc_project` (
  `project_id` varchar(30) NOT NULL,
  `domain_id` bigint(30) DEFAULT NULL,
  `project_name` varchar(50) DEFAULT NULL,
  `project_budget_amount` bigint(30) DEFAULT NULL,
  `project_quoted_amount` bigint(30) DEFAULT NULL,
  `project_final_amount` bigint(30) DEFAULT NULL,
  `project_estate_id` int(5) DEFAULT NULL,
  `project_approver_id` varchar(50) DEFAULT NULL,
  `project_state` varchar(5) NOT NULL,
  `project_budget_remark` varchar(150) DEFAULT NULL,
  `project_final_remark` varchar(150) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `tbl_erc_projectdetail` (
  `project_detail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `project_id` varchar(30) NOT NULL,
  `estate_id` bigint(30) DEFAULT NULL,
  `roomtype_id` bigint(30) DEFAULT NULL,
  `roomtype_name` varchar(50) DEFAULT NULL,
  `space_id` bigint(30) DEFAULT NULL,
  `space_name` varchar(50) DEFAULT NULL,
  `space_budget_amount` bigint(30) DEFAULT NULL,
  `space_final_amount` bigint(30) DEFAULT NULL,
  `space_count` bigint(20) DEFAULT NULL,
  `space_total_amount` bigint(30) DEFAULT NULL,
  `space_final_total_amount` bigint(30) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`project_detail_id`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8;

CREATE TABLE `tbl_erc_projectspacedetail` (
  `project_space_id` varchar(30) NOT NULL,
  `project_id` varchar(30) NOT NULL,
  `project_detail_id` bigint(20) NOT NULL,
  `project_space_position` varchar(50) DEFAULT NULL,
  `project_space_name` varchar(50) DEFAULT NULL,
  `worker_id` bigint(20) DEFAULT NULL,
  `count` int(10) DEFAULT NULL,
  `actual_count` int(10) DEFAULT NULL,
  `project_space_unit` varchar(20) DEFAULT NULL,
  `worker_budget` bigint(30) DEFAULT NULL,
  `worker_final_price` bigint(30) DEFAULT NULL,
  `material_budget` bigint(30) DEFAULT NULL,
  `worker_total_budget` bigint(30) DEFAULT NULL,
  `worker_total_final_price` bigint(30) DEFAULT NULL,
  `material_total_budget` bigint(30) DEFAULT NULL,
  `material_total_final_price` bigint(30) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`project_space_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*end bb */

