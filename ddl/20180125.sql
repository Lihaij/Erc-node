SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/


/* LJZ */
DROP TABLE IF EXISTS `tbl_erc_invalidateorder`;
CREATE TABLE `tbl_erc_invalidateorder` (
  `invalidateorder_id` varchar(30) NOT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `user_id` varchar(30) DEFAULT NULL,
  `invalidateorder_state` varchar(4) DEFAULT NULL,
  `performer_user_id` varchar(50) DEFAULT NULL,
  `complete_date` datetime DEFAULT NULL,
  `rebut_reason` varchar(50) DEFAULT NULL,
  `invalidate_remark` varchar(50) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`invalidateorder_id`)
);
/*end LJZ */

/* LJZ */
DROP TABLE IF EXISTS `tbl_erc_invalidateApplyorder`;
CREATE TABLE `tbl_erc_invalidateApplyorder` (
  `invalidateApplyorder_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `invalidateorder_id` varchar(30) DEFAULT NULL,
  `stockmap_id` bigint(20) DEFAULT NULL,
  `materiel_id` bigint(20) DEFAULT NULL,
  `warehouse_id` bigint(20) NOT NULL,
  `warehouse_zone_id` bigint(20) DEFAULT NULL,
  `invalidateApplyorder_amount` int(11) DEFAULT '0',
  `invalidateorder_reason` varchar(5) NOT NULL DEFAULT '1',
  `invalidatemateriel_type` varchar(5) NOT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`invalidateApplyorder_id`)
);
/*end LJZ */
/* ty */

ALTER TABLE `tbl_erc_stockapplyitem`
ADD COLUMN `stock_operate_amount` int(11) DEFAULT '0' AFTER `apply_amount`;

ALTER TABLE `tbl_erc_stockapplyitem`
ADD COLUMN `remain_number` int(11) DEFAULT '0' AFTER `stock_operate_amount`;

ALTER TABLE `tbl_erc_stockapplyitem`
ADD COLUMN `warehouse_id` bigint(20) DEFAULT NULL AFTER `remain_number`;

ALTER TABLE `tbl_erc_stockapplyitem`
ADD COLUMN `warehouse_zone_id` bigint(20) DEFAULT NULL AFTER `warehouse_id`;
/*end ty */

/* ls */
call Pro_AddMenu('运营数据管理', '工人维护', '/erc/baseconfig/ERCWorkerControl', 'ERCWORKERCONTROL');

ALTER TABLE `tbl_common_user` ADD COLUMN `user_remark` varchar(200) DEFAULT '' AFTER `zipcode`;
/*end ls */