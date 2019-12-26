SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* tiny */
DROP TABLE IF EXISTS `tbl_erc_stockapply`;
CREATE TABLE `tbl_erc_stockapply` (
  `stockapply_id` varchar(30) NOT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `apply_state` varchar(4) DEFAULT NULL,
  `apply_submit` varchar(30) DEFAULT NULL,
  `apply_review` varchar(30) DEFAULT NULL,
  `apply_review_date` datetime DEFAULT NULL,
  `apply_remark` varchar(300) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`stockapply_id`)
);

DROP TABLE IF EXISTS `tbl_erc_stockapplyitem`;
CREATE TABLE `tbl_erc_stockapplyitem` (
  `stockapplyitem_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `stockapply_id` varchar(30) NOT NULL,
  `materiel_id` bigint(20) NOT NULL,
  `apply_amount` int(11) DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`stockapplyitem_id`)
);

/*end tiny */
