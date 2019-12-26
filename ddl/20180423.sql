SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ls */
    DROP TABLE IF EXISTS `tbl_erc_document`;
    CREATE TABLE `tbl_erc_document` (
      `document_id` varchar(30) NOT NULL,
      `domain_id` bigint(20) NOT NULL,
      `user_id` varchar(30) NOT NULL,
      `document_type` varchar(4),
      `document_title` varchar(100),
      `document_unit` varchar(100),
      `document_date` datetime,
      `document_state` varchar(4) DEFAULT '0',
      `state` varchar(5) DEFAULT '1',
      `version` bigint(20) NOT NULL DEFAULT '0',
      `created_at` datetime NOT NULL,
      `updated_at` datetime NOT NULL,
      PRIMARY KEY (`document_id`)
    );

    DROP TABLE IF EXISTS `tbl_erc_docdetail`;
    CREATE TABLE `tbl_erc_docdetail` (
      `docdetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
      `document_id` varchar(30) NOT NULL,
      `clause_no` varchar(30),
      `clause_title` varchar(100),
      `user_ids` varchar(500),
      `state` varchar(5) DEFAULT '1',
      `version` bigint(20) NOT NULL DEFAULT '0',
      `created_at` datetime NOT NULL,
      `updated_at` datetime NOT NULL,
      PRIMARY KEY (`docdetail_id`)
    );

    DROP TABLE IF EXISTS `tbl_erc_docdetailuser`;
    CREATE TABLE `tbl_erc_docdetailuser` (
      `docdetailuser_id` bigint(20) NOT NULL AUTO_INCREMENT,
      `docdetail_id` bigint(20) NOT NULL,
      `user_id` varchar(30) NOT NULL,
      `state` varchar(5) DEFAULT '1',
      `version` bigint(20) NOT NULL DEFAULT '0',
      `created_at` datetime NOT NULL,
      `updated_at` datetime NOT NULL,
      PRIMARY KEY (`docdetailuser_id`)
    );

    DROP TABLE IF EXISTS `tbl_erc_docdetailquestion`;
    CREATE TABLE `tbl_erc_docdetailquestion` (
      `docdetailquestion_id` bigint(20) NOT NULL AUTO_INCREMENT,
      `document_id` varchar(30) NOT NULL,
      `docdetail_id` bigint(20) NOT NULL,
      `question_title` varchar(100),
      `question_a` varchar(100),
      `question_b` varchar(100),
      `question_c` varchar(100),
      `question_d` varchar(100),
      `question_answer` varchar(4),
      `state` varchar(5) DEFAULT '1',
      `version` bigint(20) NOT NULL DEFAULT '0',
      `created_at` datetime NOT NULL,
      `updated_at` datetime NOT NULL,
      PRIMARY KEY (`docdetailquestion_id`)
    );

    call Pro_AddMenu('行政办公管理', '文控管理', '/erc/baseconfig/ERCDocumentManagementControl', 'ERCDOCUMENTMANAGEMENTCONTROL');

    INSERT INTO `seqmysql` VALUES ('documentIDSeq', '0', '1', '99999999');

/*end ls */
