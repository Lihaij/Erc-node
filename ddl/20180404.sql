SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;


/*
  your backup sql
*/



/* ty */
ALTER TABLE `tbl_erc_notice` ADD COLUMN `notice_answera` varchar(200) DEFAULT NULL AFTER `notice_refuse_remark`;
ALTER TABLE `tbl_erc_notice` ADD COLUMN `notice_answerb` varchar(200) DEFAULT NULL AFTER `notice_answera`;
ALTER TABLE `tbl_erc_notice` ADD COLUMN `notice_answerc` varchar(200) DEFAULT NULL AFTER `notice_answerb`;
ALTER TABLE `tbl_erc_notice` ADD COLUMN `notice_answerd` varchar(200) DEFAULT NULL AFTER `notice_answerc`;
/*end ty */

/* jjs */
DROP TABLE IF EXISTS `tbl_erc_idleapply`;
CREATE TABLE `tbl_erc_idleapply` (
  `idleapply_id` varchar(30) NOT NULL,
  `domain_id` bigint(20) DEFAULT NULL,
  `order_id` varchar(30) DEFAULT NULL,
  `idle_apply_state` varchar(4) DEFAULT NULL,
  `idle_apply_submit` varchar(30) DEFAULT NULL,
  `idle_apply_review` varchar(30) DEFAULT NULL,
  `idle_apply_review_date` datetime DEFAULT NULL,
  `idle_apply_remark` varchar(300) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`idleapply_id`)
);

DROP TABLE IF EXISTS `tbl_erc_idleapplyitem`;
CREATE TABLE `tbl_erc_idleapplyitem` (
  `idleapplyitem_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `idleapply_id` varchar(30) NOT NULL,
  `materiel_id` bigint(20) NOT NULL,
  `idle_item_amount` int(11) DEFAULT '0',
  `warehouse_id` bigint(20) DEFAULT NULL,
  `warehouse_zone_id` bigint(20) DEFAULT NULL,
  `state` varchar(5) DEFAULT '1',
  `version` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`idleapplyitem_id`)
);

call Pro_AddMenu('WMS系统管理', '闲置库存申请', '/erc/inventorymanage/ERCIdleApplyControl', 'ERCIDLEAPPLYCONTROL');

/*end jjs */





