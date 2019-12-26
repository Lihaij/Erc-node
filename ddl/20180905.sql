SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

/*
  your backup sql
*/

/* njc */
insert into seqmysql values ('productiveIDSeq',1,1,99999999);

DROP TABLE IF EXISTS `tbl_erc_productivetask`;
CREATE TABLE `tbl_erc_productivetask` (
  `productivetask_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `productivetask_code` varchar(50) DEFAULT NULL,
  `product_id` bigint(20) DEFAULT NULL,
  `materiel_id` bigint(20) DEFAULT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `taskdesign_number` bigint(20) DEFAULT '0',
  `order_id` varchar(400) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`productivetask_id`)
);

DROP TABLE IF EXISTS `tbl_erc_productivetaskdetail`;
CREATE TABLE `tbl_erc_productivetaskdetail` (
  `productivetaskdetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `productivetask_id` bigint(20) DEFAULT NULL,
  `materiel_id` bigint(20) DEFAULT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `taskdetaildesign_number` bigint(20) DEFAULT '0',
  `taskdetailprd_level` bigint(20) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`productivetaskdetail_id`)
);

DROP TABLE IF EXISTS `tbl_erc_productivetaskrelated`;
CREATE TABLE `tbl_erc_productivetaskrelated` (
  `productivetaskrelated_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `productivetask_id` bigint(20) DEFAULT NULL,
  `materiel_id` bigint(20) DEFAULT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `taskrelateddesign_number` bigint(20) DEFAULT '0',
  `taskrelated_type` bigint(20) DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`productivetaskrelated_id`)
);
/*end njc */
