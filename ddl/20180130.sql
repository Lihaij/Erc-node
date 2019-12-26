SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/


/* LJZ */
DROP TABLE IF EXISTS `tbl_erc_stockoutapplydetail`;
CREATE TABLE `tbl_erc_stockoutapplydetail` (
  `stockoutapplydetail_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `stockoutapply_id` varchar(30) DEFAULT NULL,
  `materiel_id` bigint(20) DEFAULT NULL,
  `stockoutapplydetail_amount` int(11) DEFAULT '0',
  `already_amount` int(11) DEFAULT '0',
  `stockoutapplydetail_type` varchar(5) NOT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`stockoutapplydetail_id`)
);
/*end LJZ */

/* LJZ */
DROP TABLE IF EXISTS `tbl_erc_stockoutapply`;
CREATE TABLE `tbl_erc_stockoutapply` (
  `stockoutapply_id` varchar(30) NOT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `user_id` varchar(30) DEFAULT NULL,
  `stockoutapply_state` varchar(4) DEFAULT NULL,
  `performer_user_id` varchar(50) DEFAULT NULL,
  `complete_date` datetime DEFAULT NULL,
  `stockoutapply_rebut_reason` varchar(50) DEFAULT NULL,
  `stockoutapply_remark` varchar(50) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`stockoutapply_id`)
);
/*end LJZ */


/* LJZ */
DROP TABLE IF EXISTS `tbl_erc_otherstockout`;
CREATE TABLE `tbl_erc_otherstockout` (
  `otherstockout_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `stockoutapply_id` varchar(30) DEFAULT NULL,
  `performer_user_id` varchar(50) DEFAULT NULL,
  `otherstockout_state` varchar(4) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`otherstockout_id`)
);
/*end LJZ */

/* LJZ */
DROP TABLE IF EXISTS `tbl_erc_stockotherapplyout`;
CREATE TABLE `tbl_erc_stockotherapplyout` (
  `stockotherapplyout_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `stockoutapplydetail_id` bigint(20) NOT NULL,
  `stockoutapply_id` varchar(30) DEFAULT NULL,
  `materiel_id` bigint(20) DEFAULT NULL,
  `warehouse_id` bigint(20) NOT NULL,
  `warehouse_zone_id` bigint(20) DEFAULT NULL,
  `stockotherapplyout_amount` int(11) NOT NULL,
  `waitoutapply_amount` int(11) DEFAULT NULL,
  `stockotherapplyout_type` varchar(5) NOT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`stockotherapplyout_id`)
);
/*end LJZ */
