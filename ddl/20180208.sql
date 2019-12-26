SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/

/* ty */
call Pro_AddMenu('运营数据管理', '人工价格标准', '/erc/baseconfig/ERCWorkerPriceControl', 'ERCWORKERPRICECONTROL');

DROP TABLE IF EXISTS `tbl_erc_workerprice`;
CREATE TABLE `tbl_erc_workerprice` (
  `worker_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `domain_id` bigint(20) DEFAULT NULL,
  `worker_name` varchar(100) DEFAULT NULL,
  `worker_unit` varchar(5) DEFAULT NULL,
  `worker_cost` double NUll DEFAULT '0',
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`worker_id`)
);

/*end ty */

/* baibin */
INSERT INTO `seqmysql` VALUES ('projectIDSeq', '0', '1', '99999999');
/*end baibin */

/* ty */
ALTER TABLE `tbl_erc_stockapplyitem`
ADD COLUMN `stock_remarks` varchar(300) NUll DEFAULT '' AFTER `warehouse_zone_id`;
ALTER TABLE `tbl_erc_stockapply`
ADD COLUMN `apply_materiel_remark` varchar(300) NUll DEFAULT '' AFTER `apply_remark`;
/*end ty */