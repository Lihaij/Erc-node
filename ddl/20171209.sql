SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* tiny */
ALTER TABLE `tbl_erc_produceprocess`
ADD COLUMN `process_description` varchar(200) AFTER `updated_at`;
/*end tiny */


/* nie */
ALTER TABLE tbl_erc_order modify order_address varchar(300) NULL;
ALTER TABLE tbl_erc_order modify produce_id bigint(20) NULL;
/*end nie */

/* HLQ */
--DROP TABLE IF EXISTS `tbl_erc_zoweeprocess`;
--CREATE TABLE `tbl_erc_zoweeprocess` (
--  `zoweeprocess_id` varchar(30) NOT NULL,
--  `ordermateriel_id` bigint(20) DEFAULT NULL,
--  `zoweeprocess_date` date DEFAULT NULL,
--  `zoweeprocess_name` varchar(30) DEFAULT NULL,
--  `zoweeprocess_address` varchar(300) DEFAULT NULL,
--  `zoweeprocess_phone` varchar(30) DEFAULT NULL,
--  `zoweeprocess_designer` varchar(30) DEFAULT NULL,
--  `zoweeprocess_designphone` varchar(20) DEFAULT NULL,
--  `zoweeprocess_remark` varchar(300) DEFAULT NULL,
--  `zoweeprocess_state` varchar(10) DEFAULT NULL,
--  `zoweeprocess_feedback` varchar(10) DEFAULT NULL,
--  `state` varchar(5) DEFAULT '1',
--  `version` bigint(20) NOT NULL DEFAULT '0',
--  `created_at` datetime NOT NULL,
--  `updated_at` datetime NOT NULL,
--  PRIMARY KEY (`zoweeprocess_id`)
--);
/*INSERT INTO `seqmysql` VALUES ('zoweeProcessIDSeq', '0', '1', '99999999');*/
/* HLQ end*/

/* LJZ */
--DROP TABLE IF EXISTS `tbl_erc_taskallotuser`;
--CREATE TABLE `tbl_erc_taskallotuser` (
--  `taskallotuser_id` bigint(20) NOT NULL AUTO_INCREMENT,
--  `taskallot_id` bigint(20) DEFAULT NULL,
--  `user_id` varchar(30) DEFAULT NULL,
--  `domain_id` bigint(20) DEFAULT NULL,
--  `state` varchar(5) NOT NULL DEFAULT '1',
--  `version` bigint(20) NOT NULL DEFAULT '0',
--  `created_at` datetime NOT NULL,
--  `updated_at` datetime NOT NULL,
--  PRIMARY KEY (`taskallotuser_id`)
--);
/*end LJZ*/

/* LJZ */
--DROP TABLE IF EXISTS `tbl_erc_taskallot`;
--CREATE TABLE `tbl_erc_taskallot` (
--  `taskallot_id` bigint(20) NOT NULL AUTO_INCREMENT,
--  `taskallot_name` varchar(20) DEFAULT NULL,
--  `taskallot_describe` varchar(200) DEFAULT NULL,
--  `state` varchar(5) DEFAULT '1',
--  `version` bigint(20) NOT NULL DEFAULT '0',
--  `created_at` datetime NOT NULL,
--  `updated_at` datetime NOT NULL,
--  PRIMARY KEY (`taskallot_id`)
--);
--
--BEGIN;
--INSERT INTO `tbl_erc_taskallot` VALUES ('1', '一般任务', '', '1', '0', '2017-12-06 09:40:21', '2017-12-06 09:40:24'), ('2', '采购申请', '', '1', '0', '2017-12-06 09:40:55', '2017-12-06 09:41:00'), ('3', '内部审核', '', '1', '0', '2017-12-06 09:41:25', '2017-12-06 09:41:30'), ('4', '生产计划', '', '1', '0', '2017-12-06 09:41:46', '2017-12-06 09:41:49'), ('5', '订单评审', '', '1', '0', '2017-12-06 09:42:02', '2017-12-06 09:42:05'), ('6', '订单验收', '', '1', '0', '2017-12-06 09:42:15', '2017-12-06 09:42:18'), ('7', '物料审核', '', '1', '0', '2017-12-06 09:42:30', '2017-12-06 09:42:36');
--COMMIT;

/*ALTER TABLE `tbl_erc_suppliermateriel`
ADD COLUMN `suppliermateriel_purchasepricetax` INTEGER NULL AFTER `suppliermateriel_purchaseprice`;*/
/* end LJZ */
