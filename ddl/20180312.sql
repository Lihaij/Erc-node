SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ls */
ALTER TABLE `tbl_common_user`
ADD COLUMN `p_usergroup_id` bigint(20) NOT NULL AFTER `usergroup_id`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `user_form` varchar(10) NUll DEFAULT '' AFTER `user_remark`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `entry_date` datetime NUll AFTER `user_form`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `departure_date` datetime NUll AFTER `entry_date`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `departure_reason` varchar(10) NUll DEFAULT '' AFTER `departure_date`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `departure_remark` varchar(300) NUll DEFAULT '' AFTER `departure_reason`;

ALTER TABLE `tbl_common_user` CHANGE COLUMN `usergroup_id` `usergroup_id` bigint(20);

insert into tbl_common_systemmenu (systemmenu_name,node_type,parent_id,version,created_at,updated_at) VALUES ('人力资源管理','00','16',1,NOW(),NOW());
call Pro_AddMenu('人力资源管理', '员工信息管理', '/erc/baseconfig/ERCEmployeeInformationControl', 'ERCEMPLOYEEINFORMATIONCONTROL');

ALTER TABLE `tbl_common_user`
ADD COLUMN `parttime_usergroup_id` bigint(20) NULL AFTER `p_usergroup_id`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `job_level` varchar(10) NUll DEFAULT '' AFTER `departure_remark`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `direct_leadership` bigint(20) NULL AFTER `job_level`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `qq_no` varchar(20) NUll DEFAULT '' AFTER `direct_leadership`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `wechat_no` varchar(50) NUll DEFAULT '' AFTER `qq_no`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `idcarde_no` varchar(20) NUll DEFAULT '' AFTER `wechat_no`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `birth_date` datetime NUll AFTER `idcarde_no`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `age` varchar(10) NUll DEFAULT '' AFTER `birth_date`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `marital_status` varchar(10) NUll DEFAULT '' AFTER `age`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `education` varchar(10) NUll DEFAULT '' AFTER `marital_status`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `graduate_institution` varchar(100) NUll DEFAULT '' AFTER `education`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `graduate_date` datetime NUll AFTER `graduate_institution`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `native_place` varchar(100) NUll DEFAULT '' AFTER `graduate_date`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `ethnicity` varchar(10) NUll DEFAULT '' AFTER `native_place`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `register_category` varchar(10) NUll DEFAULT '' AFTER `ethnicity`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `living_place` varchar(100) NUll DEFAULT '' AFTER `register_category`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `service_length` varchar(10) NUll DEFAULT '' AFTER `living_place`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `working_age` varchar(10) NUll DEFAULT '' AFTER `service_length`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `emergency_contact_person` varchar(50) NUll DEFAULT '' AFTER `working_age`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `emergency_contact_phone` varchar(50) NUll DEFAULT '' AFTER `emergency_contact_person`;

ALTER TABLE `tbl_common_user`
ADD COLUMN `emergency_contact_qq` varchar(20) NUll DEFAULT '' AFTER `emergency_contact_phone`;


DROP TABLE IF EXISTS `tbl_common_user_contract`;
CREATE TABLE `tbl_common_user_contract` (
  `user_contract_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `contract_name` varchar(100) NOT NULL,
  `sign_name` varchar(20) DEFAULT '',
  `contract_no` varchar(100) DEFAULT '',
  `start_date` datetime,
  `end_date` datetime,
  `probation_end_date` datetime,
  `official_date` datetime,
  `base_salary` int NOT NULL DEFAULT '0',
  `capacity_salary` int NOT NULL DEFAULT '0',
  `performance_salary` int NOT NULL DEFAULT '0',
  `total_salary` int NOT NULL DEFAULT '0',
  `deposit_bank` varchar(100) DEFAULT '',
  `bank_account` varchar(100) DEFAULT '',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`user_contract_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `tbl_common_user_work_experience`;
CREATE TABLE `tbl_common_user_work_experience` (
  `work_experience_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `experience_start_date` datetime,
  `experience_end_date` datetime,
  `position_name` varchar(50) DEFAULT '',
  `witness` varchar(20) DEFAULT '',
  `witness_phone` varchar(20) DEFAULT '',
  `experience_remark` varchar(500) DEFAULT '',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`work_experience_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*end ls */