SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/* add bb */
ALTER TABLE `tbl_erc_reviewmateriel`
ADD COLUMN `review_materiel_award_cost` DOUBLE NULL DEFAULT 0 AFTER `review_materiel_sale`;

ALTER TABLE `tbl_erc_materiel`
ADD COLUMN `materiel_award_cost` DOUBLE NULL DEFAULT 0 AFTER `materiel_sale`;
/* end bb */

/* add qm */
DROP TABLE IF EXISTS `tbl_erc_ownerfeedback`;
CREATE TABLE `tbl_erc_ownerfeedback` (
  `feedback_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `order_id` varchar(30) DEFAULT NULL,
  `user_id` varchar(30) NOT NULL,
  `type` bigint(20) NOT NULL DEFAULT '0',
  `status` bigint(20) NOT NULL DEFAULT '1',
  `content` varchar(1000) NOT NULL,
  `repair_type` varchar(30) DEFAULT NULL,
  `email` varchar(30) DEFAULT NULL,
  `qq_no` varchar(30) DEFAULT NULL,
  `images` varchar(300) DEFAULT NULL,
  `operator_id` varchar(30) DEFAULT NULL,
  `record_content` varchar(300) DEFAULT NULL,
  `resp_person` varchar(30) DEFAULT NULL,
  `resp_phone` varchar(30) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`feedback_id`)
);
/* end qm */