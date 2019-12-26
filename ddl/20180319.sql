SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ls */
    INSERT INTO tbl_erc_taskallot(taskallot_id , taskallot_name , taskallot_describe, created_at, updated_at)
	VALUES(16 , '退货任务' , '处理退货请求', now(), now());

	DROP TABLE IF EXISTS `tbl_common_user_contract`;
	DROP TABLE IF EXISTS `tbl_common_user_work_experience`;

	DROP TABLE IF EXISTS `tbl_erc_customer_contract`;
    CREATE TABLE `tbl_erc_customer_contract` (
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

    DROP TABLE IF EXISTS `tbl_erc_customer_work_experience`;
    CREATE TABLE `tbl_erc_customer_work_experience` (
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

    ALTER TABLE tbl_common_user DROP COLUMN `user_form`, DROP COLUMN `entry_date`, DROP COLUMN `departure_date`, DROP COLUMN `departure_reason`, DROP COLUMN `departure_remark`
    , DROP COLUMN `parttime_usergroup_id`, DROP COLUMN `job_level`, DROP COLUMN `direct_leadership`, DROP COLUMN `qq_no`, DROP COLUMN `wechat_no`
    , DROP COLUMN `idcarde_no`, DROP COLUMN `birth_date`, DROP COLUMN `age`, DROP COLUMN `marital_status`, DROP COLUMN `education`
    , DROP COLUMN `graduate_institution`, DROP COLUMN `graduate_date`, DROP COLUMN `native_place`, DROP COLUMN `ethnicity`, DROP COLUMN `register_category`
    , DROP COLUMN `living_place`, DROP COLUMN `service_length`, DROP COLUMN `working_age`, DROP COLUMN `emergency_contact_person`, DROP COLUMN `emergency_contact_phone`
    , DROP COLUMN `emergency_contact_qq`, DROP COLUMN `standard_img`, DROP COLUMN `photo_title`, DROP COLUMN `goupload_format`;


    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `user_form` varchar(10) NUll DEFAULT '' AFTER `flow_source`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `entry_date` datetime NUll AFTER `user_form`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `departure_date` datetime NUll AFTER `entry_date`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `departure_reason` varchar(10) NUll DEFAULT '' AFTER `departure_date`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `departure_remark` varchar(300) NUll DEFAULT '' AFTER `departure_reason`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `parttime_usergroup_id` bigint(20) NULL AFTER `departure_remark`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `job_level` varchar(10) NUll DEFAULT '' AFTER `departure_remark`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `direct_leadership` varchar(30) NULL AFTER `job_level`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `qq_no` varchar(20) NUll DEFAULT '' AFTER `direct_leadership`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `wechat_no` varchar(50) NUll DEFAULT '' AFTER `qq_no`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `idcarde_no` varchar(20) NUll DEFAULT '' AFTER `wechat_no`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `birth_date` datetime NUll AFTER `idcarde_no`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `marital_status` varchar(10) NUll DEFAULT '' AFTER `age`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `graduate_institution` varchar(100) NUll DEFAULT '' AFTER `education`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `graduate_date` datetime NUll AFTER `graduate_institution`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `native_place` varchar(100) NUll DEFAULT '' AFTER `graduate_date`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `ethnicity` varchar(10) NUll DEFAULT '' AFTER `native_place`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `register_category` varchar(10) NUll DEFAULT '' AFTER `ethnicity`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `living_place` varchar(100) NUll DEFAULT '' AFTER `register_category`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `service_length` varchar(10) NUll DEFAULT '' AFTER `living_place`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `working_age` varchar(10) NUll DEFAULT '' AFTER `service_length`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `emergency_contact_person` varchar(50) NUll DEFAULT '' AFTER `working_age`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `emergency_contact_phone` varchar(50) NUll DEFAULT '' AFTER `emergency_contact_person`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `emergency_contact_qq` varchar(20) NUll DEFAULT '' AFTER `emergency_contact_phone`;

	ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `standard_img` varchar(200) NUll DEFAULT '' AFTER `emergency_contact_qq`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `photo_title` varchar(200) NUll DEFAULT '' AFTER `standard_img`;

    ALTER TABLE `tbl_erc_customer`
    ADD COLUMN `goupload_format` varchar(200) NUll DEFAULT '' AFTER `photo_title`;

/*end ls */

/* ty */
ALTER TABLE `tbl_erc_customer_contract`
ADD COLUMN `contract_state` varchar(100) DEFAULT '' AFTER `bank_account`;

call Pro_AddMenu('品质管理', '退货单', '/erc/purchasemanage/ERCReturnNoteControl', 'ERCRETURNNOTECONTROL');

/*end ty */