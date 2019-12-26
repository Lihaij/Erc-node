SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* ty */
DROP TABLE IF EXISTS `tbl_erc_docdetailsubmitquestion`;
    CREATE TABLE `tbl_erc_docdetailsubmitquestion` (
      `docdetailsubmitquestion_id` bigint(20) NOT NULL AUTO_INCREMENT,
      `document_id` varchar(30) NOT NULL,
      `docdetail_id` bigint(20) DEFAULT NULL,
      `user_id` varchar(30) NOT NULL,
      `docdetailquestion_id` varchar(30) NOT NULL,
      `submit_question_answer` varchar(4),
      `state` varchar(5) DEFAULT '1',
      `version` bigint(20) NOT NULL DEFAULT '0',
      `created_at` datetime NOT NULL,
      `updated_at` datetime NOT NULL,
      PRIMARY KEY (`docdetailsubmitquestion_id`)
    );

/*end ty */








