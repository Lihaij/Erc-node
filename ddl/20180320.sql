SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ls */

	DROP TABLE IF EXISTS `tbl_erc_customer_contract`;
	DROP TABLE IF EXISTS `tbl_erc_customer_work_experience`;

	DROP TABLE IF EXISTS `tbl_erc_customercontract`;
    CREATE TABLE `tbl_erc_customercontract` (
      `user_contract_id` bigint(20) NOT NULL AUTO_INCREMENT,
      `user_id` varchar(30) NOT NULL,
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
      `contract_state` varchar(100) DEFAULT '',
      `state` varchar(5) DEFAULT '1',
      `version` bigint(20) NOT NULL DEFAULT '0',
      `created_at` datetime NOT NULL,
      `updated_at` datetime NOT NULL,
      PRIMARY KEY (`user_contract_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

    DROP TABLE IF EXISTS `tbl_erc_customerworkexperience`;
    CREATE TABLE `tbl_erc_customerworkexperience` (
      `work_experience_id` bigint(20) NOT NULL AUTO_INCREMENT,
      `user_id` varchar(30) NOT NULL,
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

/* ty */
ALTER TABLE `tbl_erc_return`
ADD COLUMN `domain_id` bigint(20) NULL AFTER `return_refuse_remark`;

ALTER TABLE `tbl_erc_qualitycheckdetail`
ADD COLUMN `order_id` varchar(30) DEFAULT '' AFTER `remark`;
/*end ty */