
SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* tiny */
--DROP TABLE IF EXISTS `tbl_erc_task`;
--CREATE TABLE `tbl_erc_task` (
--  `task_id` varchar(30) NOT NULL,
--  `domain_id` bigint(20) DEFAULT NULL,
--  `task_name` varchar(30) DEFAULT NULL,
--  `task_type` varchar(4) DEFAULT NULL,
--  `task_priority` varchar(4) DEFAULT NULL,
--  `task_publisher` varchar(30) DEFAULT NULL,
--  `task_performer` varchar(30) DEFAULT NULL,
--  `task_state` varchar(4) DEFAULT NULL,
--  `task_complete_date` datetime DEFAULT NULL,
--  `task_review_code` varchar(30) DEFAULT NULL,
--  `task_description` varchar(300) DEFAULT NULL,
--  `task_remark` varchar(300) DEFAULT NULL,
--  `state` varchar(5) DEFAULT '1',
--  `version` bigint(20) NOT NULL DEFAULT '0',
--  `created_at` datetime NOT NULL,
--  `updated_at` datetime NOT NULL,
--  `review_id` varchar(30) DEFAULT NULL,
--  PRIMARY KEY (`task_id`)
--);
--
--DROP TABLE IF EXISTS `tbl_erc_complaint`;
--CREATE TABLE `tbl_erc_complaint` (
--  `complaint_id` bigint(20) NOT NULL AUTO_INCREMENT,
--  `domain_id` bigint(20) DEFAULT NULL,
--  `order_id` varchar(30) DEFAULT NULL,
--  `complaint_customer_name` varchar(30) DEFAULT NULL,
--  `complaint_phone` varchar(20) NOT NULL,
--  `complaint_content` varchar(300) DEFAULT NULL,
--  `complaint_state` varchar(4) DEFAULT NULL,
--  `complaint_responser` varchar(30) DEFAULT NULL,
--  `complaint_handle_record` varchar(300) DEFAULT NULL,
--  `state` varchar(5) DEFAULT '1',
--  `version` bigint(20) NOT NULL DEFAULT '0',
--  `created_at` datetime NOT NULL,
--  `updated_at` datetime NOT NULL,
--  `complaint_user_id` varchar(30) DEFAULT NULL,
--  PRIMARY KEY (`complaint_id`)
--);
/*end tiny */

